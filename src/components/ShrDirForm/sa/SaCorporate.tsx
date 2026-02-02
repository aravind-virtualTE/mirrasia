/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, ArrowRight, ArrowLeft, Edit3, Info, Eye, Download, FileText } from 'lucide-react';
import questionsData from './corporateQuestion.json';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import {
    SaCompDefaultAtom,
    type Question,
    saveSgCompanyShldrInviteData, getSgCompanyShareHlderData
} from './SaShrAtom';
import { multiShrDirResetAtom } from '@/components/shareholderDirector/constants';
import { useParams } from 'react-router-dom';

const SaCompRegistrationForm: React.FC = () => {
    const { t } = useTranslation('en1');
    const [formData, setFormData] = useAtom(SaCompDefaultAtom);

    // Component-level state
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [currentFile, setCurrentFile] = useState<File | null>(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [otherInputValues, setOtherInputValues] = useState<Record<string, string>>({});
    const [multiData,] = useAtom<any>(multiShrDirResetAtom)
    const { id } = useParams();

    const { toast } = useToast();

    // Derived values
    const currentQuestion = filteredQuestions[currentQuestionIndex] || null;
    const isLastQuestion = currentQuestionIndex === filteredQuestions.length - 1;

    useEffect(() => {
        if (id) {
            async function fetchData(id: string) {
                // console.log('id--->', id)
                const data = await getSgCompanyShareHlderData(id);
                // console.log("data", data)
                const normalizedBirthdate = data.birthdate
                    ? data.birthdate.split("T")[0]
                    : "";
                setFormData(prev => ({
                    ...prev,
                    ...data,
                    birthdate: normalizedBirthdate,
                    fundSource: data.fundSource ?? prev.fundSource,
                    fundGenerated: data.fundGenerated ?? prev.fundGenerated,
                    otherInputs: data.otherInputs ?? prev.otherInputs,
                }));
                setIsCompleted(true)
            }
            fetchData(id)
        }
        const multiShId = localStorage.getItem("shdrItem")
        const findData = multiData.length > 0
            ? multiData.find((item: { _id: string | null; }) => item._id === multiShId)
            : null;
        if (findData) {
            setFormData({ ...formData, email: findData.email, companyName: findData.companyName, companyId: findData.companyId })
        }
        // console.log("multiShId",findData)
    }, [])

    const getFieldValue = (questionId: string): string | string[] => {
        const value = (formData as any)[questionId];
        if (value === undefined || value === null) return '';
        return value;
    };

    const setFieldValue = (questionId: string, value: string | string[] | File) => {
        setFormData(prev => ({ ...prev, [questionId]: value }));
    };

    // API functions for data persistence
    const saveFormData = async () => {
        try {

            // console.log('Saving form data:', formData);
            const result = await saveSgCompanyShldrInviteData(formData, id)
            console.log("result-->", result);

            toast({
                title: t('saCorporate.messages.saved'),
                description: t('saCorporate.messages.savedDesc'),
            });
        } catch (error) {
            console.error('Error saving form data:', error);
            toast({
                title: t('saCorporate.messages.saveFailed'),
                description: t('saCorporate.messages.saveFailedDesc'),
                variant: "destructive",
            });
        }
    };

    const handleSubmit = async () => {
        // console.log('Form submitted with data:', formData);
        await saveFormData();
    };

    const clearFormData = () => {
        setFormData({
            userId: '',
            email: '',
            name: '',
            nameChanged: '',
            previousName: '',
            birthdate: '',
            companyName: "",
            nationality: '',
            passport: '',
            residenceAddress: '',
            postalAddressSame: '',
            postalAddress: '',
            phone: '',
            kakaoId: '',
            otherSNSIds: '',
            companyRelation: [],
            percentSharesHeld: '',
            fundSource: [],
            countryOriginFund: '',
            fundGenerated: [],
            originFundGenerateCountry: '',
            netAssetValue: '',
            usTaxStatus: '',
            usTIN: '',
            isPoliticallyProminentFig: '',
            descPoliticImpRel: '',
            isCrimeConvitted: '',
            lawEnforced: '',
            isMoneyLaundered: '',
            isBankRupted: '',
            isInvolvedBankRuptedOfficer: '',
            describeIfInvolvedBankRupted: '',
            declarationAgreement: '',
            passportId: '',
            addressProof: '',
            engResume: '',
            otherInputs: {}
        });
        setCurrentQuestionIndex(0);
        setCurrentAnswer('');
        setIsCompleted(false);
        setIsEditing(false);
        setOtherInputValues({});
    };

    useEffect(() => {
        // Filter questions based on conditional logic
        const filtered = (questionsData.questions as Question[]).filter((question: Question) => {
            if (!question.showIf) return true;

            const dependentValue = getFieldValue(question.showIf.questionId);
            return dependentValue === question.showIf.value;
        });

        setFilteredQuestions(filtered);
    }, [formData]);

    // Load current answer when navigating back to a question
    useEffect(() => {
        const question = filteredQuestions[currentQuestionIndex];
        if (question) {
            const existingValue = getFieldValue(question.id);

            if (question.type === 'file') {
                setCurrentAnswer(typeof existingValue === 'string' ? existingValue : '');
                setCurrentFile(null); // Reset file for now
            } else if (question.type === 'checkbox') {
                const arrayValue = Array.isArray(existingValue) ? existingValue :
                    (typeof existingValue === 'string' && existingValue) ? existingValue.split(',') : [];
                setCurrentAnswer(arrayValue.join(','));
            } else {
                setCurrentAnswer(typeof existingValue === 'string' ? existingValue : '');
            }

            // Load other input values
            const currentOtherInputs: Record<string, string> = {};
            Object.entries(formData.otherInputs).forEach(([key, value]) => {
                if (key.startsWith(`${question.id}-`)) {
                    const optionValue = key.replace(`${question.id}-`, '');
                    currentOtherInputs[optionValue] = value;
                }
            });
            setOtherInputValues(currentOtherInputs);
        }
    }, [currentQuestionIndex, filteredQuestions, formData]);

    const goBackToQuestion = (questionId: string) => {
        const questionIndex = filteredQuestions.findIndex(q => q.id === questionId);
        if (questionIndex !== -1) {
            setCurrentQuestionIndex(questionIndex);
            setIsCompleted(false);
            setIsEditing(true);
        }
    };

    const handleBack = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
            setIsEditing(true);
        }
    };

    const validateAnswer = (question: Question, value: string): boolean => {
        if (question.required && !value.trim()) {
            toast({
                title: t('saCorporate.messages.required'),
                description: t('saCorporate.messages.requiredDesc'),
                variant: "destructive",
            });
            return false;
        }

        if (question.validation) {
            const { minLength, pattern, message } = question.validation;

            if (minLength && value.length < minLength) {
                toast({
                    title: t('saCorporate.messages.validationError'),
                    description: t(message as string),
                    variant: "destructive",
                });
                return false;
            }

            if (pattern && !new RegExp(pattern).test(value)) {
                toast({
                    title: t('saCorporate.messages.validationError'),
                    description: t(message as string),
                    variant: "destructive",
                });
                return false;
            }
        }

        return true;
    };

    const handleSkip = () => {
        if (!currentQuestion || currentQuestion.required) return;

        // Save empty value for optional field
        setFieldValue(currentQuestion.id, '');

        setCurrentAnswer('');
        setIsEditing(false);
        setOtherInputValues({});

        if (isLastQuestion) {
            setIsCompleted(true);
            toast({
                title: "Form completed!",
                description: "Thank you for providing all the information.",
            });
        } else {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (!currentQuestion) return;

        if (!validateAnswer(currentQuestion, currentAnswer)) {
            return;
        }
        // Update field value based on question type
        let valueToSave: string | string[] = currentAnswer;

        if (currentQuestion.type === 'checkbox') {
            // For checkboxes, store as array
            valueToSave = currentAnswer ? currentAnswer.split(',') : [];
            setFieldValue(currentQuestion.id, valueToSave);
        } else if (currentQuestion.type === 'file' && currentFile) {
            setFieldValue(currentQuestion.id, currentFile);
        } else {
            setFieldValue(currentQuestion.id, currentAnswer);
        }
        // Update other inputs for this question
        const newOtherInputs = { ...formData.otherInputs };
        // Remove existing other inputs for this question
        Object.keys(newOtherInputs).forEach(key => {
            if (key.startsWith(`${currentQuestion.id}-`)) {
                delete newOtherInputs[key];
            }
        });

        // Add new other inputs
        Object.entries(otherInputValues).forEach(([optionValue, text]) => {
            if (text.trim()) {
                newOtherInputs[`${currentQuestion.id}-${optionValue}`] = text.trim();
            }
        });

        setFormData(prev => ({
            ...prev,
            otherInputs: newOtherInputs
        }));

        setCurrentAnswer('');
        setIsEditing(false);
        setOtherInputValues({});

        if (isLastQuestion) {
            setIsCompleted(true);
            toast({
                title: "Form completed!",
                description: "Thank you for providing all the information.",
            });
        } else {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handleOptionSelect = (value: string) => {
        setCurrentAnswer(value);
    };

    const handleInputChange = (value: string) => {
        setCurrentAnswer(value);
    };

    const handleOtherInputChange = (optionValue: string, text: string) => {
        setOtherInputValues(prev => ({
            ...prev,
            [optionValue]: text
        }));
    };

    const getDisplayValue = (questionId: string, question?: Question): string => {
        const value = getFieldValue(questionId);

        if (question?.type === 'checkbox' && Array.isArray(value)) {
            return value.map(val => {
                const option = question.options?.find(opt => opt.value === val);
                if (option?.allowOther && val === 'other') {
                    const otherValue = formData.otherInputs[`${question.id}-${val}`];
                    return otherValue ? `${t('saCorporate.messages.other')}: ${otherValue}` : t(option.label);
                }
                return t(option?.label || val);
            }).join(', ');
        }

        if (question?.type === 'select' && typeof value === 'string') {
            const option = question.options?.find(opt => opt.value === value);
            if (option?.allowOther && value === 'other') {
                const otherValue = formData.otherInputs[`${question.id}-${value}`];
                return otherValue ? `${t('saCorporate.messages.other')}: ${otherValue}` : t(option.label);
            }
            return t(option?.label || value);
        }

        return String(value);
    };

    const renderFilePreview = (fileValue: File | string) => {
        const isFile = fileValue instanceof File;
        const isUrl = typeof fileValue === 'string' && fileValue.startsWith('http');

        if (!isFile && !isUrl && !fileValue) return null;

        const fileName = isFile ? fileValue.name : typeof fileValue === 'string' ? fileValue.split('/').pop() || fileValue : 'File';
        const fileUrl = isFile ? URL.createObjectURL(fileValue) : typeof fileValue === 'string' ? fileValue : '';
        const fileType = isFile ? fileValue.type : '';
        const fileSize = isFile ? fileValue.size : null;

        // Determine file types
        const isImage = isFile
            ? fileValue.type.startsWith('image/')
            : /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName);

        const isPDF = isFile
            ? fileValue.type === 'application/pdf'
            : /\.pdf$/i.test(fileName);

        return (
            <div className="mt-2 p-3 border border-border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{fileName}</span>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(fileUrl, '_blank')}
                        >
                            <Eye className="h-3 w-3 mr-1" />
                            {isPDF ? t('saCorporate.upload.openPdf') : t('saCorporate.upload.view')}
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                const a = document.createElement('a');
                                a.href = fileUrl;
                                a.download = fileName;
                                a.click();
                            }}
                        >
                            <Download className="h-3 w-3 mr-1" />
                            {t('saCorporate.upload.download')}
                        </Button>
                    </div>
                </div>

                {isImage && (
                    <div className="mt-2">
                        <img
                            src={fileUrl}
                            alt="Preview"
                            className="max-w-full h-32 object-cover rounded border"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </div>
                )}

                {isPDF && (
                    <div className="mt-2 p-2 bg-background rounded border text-center">
                        <FileText className="h-8 w-8 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">{t('saCorporate.upload.pdfPreviewNote')}</p>
                    </div>
                )}

                <div className="text-xs text-muted-foreground mt-1">
                    {fileSize && `${t('saCorporate.upload.meta', { size: (fileSize / 1024).toFixed(1), type: fileType })}`}
                    {isUrl && !isFile && 'External file'}
                </div>
            </div>
        );
    };

    const renderQuestionInput = () => {
        if (!currentQuestion) return null;

        switch (currentQuestion.type) {
            case 'select':
                return (
                    <div className="space-y-3">
                        {currentQuestion.options?.map((option) => (
                            <div key={option.value} className="space-y-2">
                                <Button
                                    variant={currentAnswer === option.value ? "default" : "outline"}
                                    className="w-full justify-start h-auto p-4 text-left option-button"
                                    onClick={() => handleOptionSelect(option.value)}
                                >
                                    {t(option.label)}
                                </Button>
                                {option.allowOther && currentAnswer === option.value && (
                                    <Input
                                        value={otherInputValues[option.value] || ''}
                                        onChange={(e) => handleOtherInputChange(option.value, e.target.value)}
                                        placeholder={t('saCorporate.messages.specify')}
                                        className="ml-4"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                );

            case 'textarea':
                return (
                    <div className="space-y-4">
                        <Textarea
                            value={currentAnswer}
                            onChange={(e) => handleInputChange(e.target.value)}
                            placeholder={currentQuestion.placeholder}
                            className="min-h-[100px] resize-none"
                        />
                        <div className="flex gap-2">
                            {currentAnswer && (
                                <Button onClick={handleNext} className="flex-1 option-button">
                                    {t('saCorporate.navigation.continue')} <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                            {!currentQuestion.required && !currentAnswer && (
                                <Button onClick={handleSkip} className="flex-1 option-button">
                                    {t('saCorporate.navigation.skip')} <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                );

            case 'checkbox':
                return (
                    <div className="space-y-3">
                        {currentQuestion.options?.map((option) => {
                            const isSelected = currentAnswer.split(',').includes(option.value);

                            return (
                                <div key={option.value} className="space-y-2">
                                    <Button
                                        variant={isSelected ? "default" : "outline"}
                                        className="w-full justify-start h-auto p-4 text-left option-button"
                                        onClick={() => {
                                            const currentValues = currentAnswer ? currentAnswer.split(',') : [];

                                            let newValues;
                                            if (isSelected) {
                                                newValues = currentValues.filter(v => v !== option.value);
                                            } else {
                                                newValues = [...currentValues, option.value];
                                            }

                                            setCurrentAnswer(newValues.join(','));
                                        }}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-4 h-4 border-2 rounded flex items-center justify-center mt-0.5 ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'
                                                }`}>
                                                {isSelected && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
                                            </div>
                                            <div>
                                                <div>{option.label}</div>
                                                {option.description && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {option.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Button>
                                    {option.allowOther && isSelected && (
                                        <Input
                                            value={otherInputValues[option.value] || ''}
                                            onChange={(e) => handleOtherInputChange(option.value, e.target.value)}
                                            placeholder={t('saCorporate.messages.specify')}
                                            className="ml-8"
                                        />
                                    )}
                                </div>
                            );
                        })}
                        <div className="flex gap-2 mt-4">
                            {currentAnswer && (
                                <Button onClick={handleNext} className="flex-1 option-button">
                                    {t('saCorporate.navigation.continue')} <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                            {!currentQuestion.required && !currentAnswer && (
                                <Button onClick={handleSkip} className="flex-1 option-button">
                                    {t('saCorporate.navigation.skip')} <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                );

            case 'radio':
                return (
                    <div className="space-y-3">
                        {currentQuestion.options?.map((option) => {
                            const isSelected = currentAnswer === option.value;

                            return (
                                <div key={option.value} className="space-y-2">
                                    <Button
                                        variant={isSelected ? "default" : "outline"}
                                        className="w-full justify-start h-auto p-4 text-left option-button"
                                        onClick={() => setCurrentAnswer(option.value)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-4 h-4 border-2 rounded-full flex items-center justify-center mt-0.5 ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'
                                                }`}>
                                                {isSelected && <div className="w-2 h-2 bg-primary-foreground rounded-full" />}
                                            </div>
                                            <div>
                                                <div>{t(option.label)}</div>
                                                {option.description && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {t(option.description)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Button>
                                    {option.allowOther && isSelected && (
                                        <Input
                                            value={otherInputValues[option.value] || ''}
                                            onChange={(e) => handleOtherInputChange(option.value, e.target.value)}
                                            placeholder={t('saCorporate.messages.specify')}
                                            className="ml-8"
                                        />
                                    )}
                                </div>
                            );
                        })}
                        <div className="flex gap-2 mt-4">
                            {currentAnswer && (
                                <Button onClick={handleNext} className="flex-1 option-button">
                                    {t('saCorporate.navigation.continue')} <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                            {!currentQuestion.required && !currentAnswer && (
                                <Button onClick={handleSkip} className="flex-1 option-button">
                                    {t('saCorporate.navigation.skip')} <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                );

            case 'file':
                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer bg-primary/5 hover:bg-primary/10 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg className="w-8 h-8 mb-4 text-primary" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                    </svg>
                                    <p className="mb-2 text-sm text-muted-foreground">
                                        <span className="font-semibold">{t('saCorporate.upload.click')}</span> {t('saCorporate.upload.dragDrop')}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{t('saCorporate.upload.types')}</p>
                                </div>
                                <input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    accept="image/*,.pdf"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setCurrentFile(file);
                                            handleInputChange(file.name);
                                        }
                                    }}
                                />
                            </label>
                        </div>
                        {currentFile && renderFilePreview(currentFile)}
                        <div className="flex gap-2">
                            {currentAnswer && (
                                <Button onClick={handleNext} className="flex-1 option-button">
                                    {t('saCorporate.navigation.continue')} <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                            {!currentQuestion.required && !currentAnswer && (
                                <Button onClick={handleSkip} className="flex-1 option-button">
                                    {t('saCorporate.navigation.skip')} <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="space-y-4">
                        <Input
                            type={currentQuestion.type}
                            value={currentAnswer}
                            onChange={(e) => handleInputChange(e.target.value)}
                            placeholder={currentQuestion.placeholder}
                            className="w-full"
                        />
                        <div className="flex gap-2">
                            {currentAnswer && (
                                <Button onClick={handleNext} className="flex-1 option-button">
                                    {t('saCorporate.navigation.continue')} <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                            {!currentQuestion.required && !currentAnswer && (
                                <Button onClick={handleSkip} className="flex-1 option-button">
                                    {t('saCorporate.navigation.skip')} <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                );
        }
    };

    const renderCompletedAnswers = () => {
        return (
            <div className="space-y-4">
                <div className="text-center mb-6">
                    <h2 className="summary-title">{t('saCorporate.summary.title')}</h2>
                    <div className="flex items-center justify-center gap-2 text-primary mb-4">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">{t('saCorporate.summary.success')}</span>
                    </div>

                </div>

                <div className="space-y-3">
                    {filteredQuestions.map((question) => {
                        const value = getFieldValue(question.id);
                        const hasAnswer = value !== '' && value !== undefined && value !== null;

                        return (
                            <div
                                key={question.id}
                                className={`service-card cursor-pointer group ${!hasAnswer ? 'opacity-70 border-dashed' : ''}`}
                                onClick={() => goBackToQuestion(question.id)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="text-sm text-muted-foreground mb-1">
                                            {t(question.question)}
                                            {!question.required && <span className="text-xs ml-1">{t('saCorporate.summary.optional')}</span>}
                                        </div>
                                        <div className="font-medium">
                                            {hasAnswer ? getDisplayValue(question.id, question) :
                                                <span className="text-muted-foreground italic">{t('saCorporate.summary.notAnswered')}</span>}
                                        </div>
                                        {question.type === 'file' && value && (
                                            renderFilePreview(value as string)
                                        )}
                                    </div>
                                    <Edit3 className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="flex gap-3 justify-center sticky bottom-4 z-10 bg-background/80 backdrop-blur-sm p-4 rounded-xl border shadow-lg max-w-2xl mx-auto w-full">
                    <Button
                        variant="outline"
                        onClick={() => setIsCompleted(false)}
                        className="text-sm hover:bg-accent hover:text-accent-foreground transition-smooth"
                    >
                        <Edit3 className="h-4 w-4 mr-2" />
                        {t('saCorporate.summary.edit')}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="text-sm option-button"
                    >
                        {t('saCorporate.summary.submit')}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={clearFormData}
                        className="text-sm"
                    >
                        {t('saCorporate.summary.clear')}
                    </Button>
                </div>
            </div>
        );
    };

    const renderPreviousAnswers = () => {
        const visibleQuestions = filteredQuestions.slice(0, currentQuestionIndex);

        return (
            <div className="space-y-3 mb-6">
                {visibleQuestions.map((question) => {
                    const value = getFieldValue(question.id);
                    const hasAnswer = value !== '' && value !== undefined && value !== null;

                    return (
                        <div
                            key={question.id}
                            className={`service-card cursor-pointer group animate-fade-in ${!hasAnswer ? 'opacity-70 border-dashed' : ''}`}
                            onClick={() => goBackToQuestion(question.id)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="text-sm text-muted-foreground mb-1">
                                        {t(question.question)}
                                        {!question.required && <span className="text-xs ml-1">{t('saCorporate.summary.optional')}</span>}
                                    </div>
                                    <div className="font-medium">
                                        {hasAnswer ? getDisplayValue(question.id, question) :
                                            <span className="text-muted-foreground italic">{t('saCorporate.summary.notAnswered')}</span>}
                                    </div>
                                    {question.type === 'file' && value && (
                                        renderFilePreview(value as string)
                                    )}
                                </div>
                                <Edit3 className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };


    if (isCompleted) {
        return (
            <div className="min-h-screen bg-gradient-primary p-4 flex items-center justify-center">
                <div className="max-width w-full space-y-6">
                    <div className="text-center sticky top-0 z-10 bg-background/80 backdrop-blur-md p-4 rounded-xl border-b shadow-sm mb-6">
                        <h1 className="decorative-heading">{t('saCorporate.title')}</h1>
                        <div className="w-full h-1 bg-primary mx-auto rounded-full"></div>
                    </div>

                    <Card className="p-8 shadow-warm">
                        {renderCompletedAnswers()}
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-primary p-4 flex items-center justify-center">
            <div className="max-width w-full space-y-6">
                <div className="text-center">
                    <h1 className="decorative-heading">{t('saCorporate.title')}</h1>
                    <div className="w-full h-1 bg-primary mx-auto rounded-full"></div>
                </div>

                <div className="space-y-4">
                    {renderPreviousAnswers()}

                    {currentQuestion && (
                        <Card className="question-card animate-fade-in">
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="service-icon">
                                        <span className="text-sm font-medium px-2">👤</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-question text-question-foreground rounded-2xl p-4 max-w-md">
                                            <div className="flex items-center gap-2">
                                                <p className="question-title">{t(currentQuestion.question)}</p>
                                                {currentQuestion.infoText && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Info className="h-4 w-4 cursor-help" />
                                                        </TooltipTrigger>
                                                        <TooltipContent side="right" className="max-w-sm p-4">
                                                            <p className="text-sm whitespace-pre-wrap">{t(currentQuestion.infoText)}</p>
                                                        </TooltipContent>
                                                    </Tooltip>

                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    {renderQuestionInput()}
                                </div>

                                {currentQuestion.type === 'select' && currentAnswer &&
                                    !currentQuestion.options?.find(opt => opt.value === currentAnswer)?.allowOther && (
                                        <Button
                                            onClick={handleNext}
                                            className="w-full option-button"
                                        >
                                            {t('saCorporate.navigation.continue')} <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    )}

                                {currentQuestion.type === 'select' && currentAnswer &&
                                    currentQuestion.options?.find(opt => opt.value === currentAnswer)?.allowOther &&
                                    otherInputValues[currentAnswer] && (
                                        <Button
                                            onClick={handleNext}
                                            className="w-full option-button"
                                        >
                                            {t('saCorporate.navigation.continue')} <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    )}

                                {currentQuestionIndex > 0 && (
                                    <div className="flex justify-between items-center pt-4 border-t border-border">
                                        <Button
                                            variant="outline"
                                            onClick={handleBack}
                                            className="text-sm hover:bg-muted transition-smooth"
                                        >
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            {t('saCorporate.navigation.prev')}
                                        </Button>
                                        <span className="text-xs text-muted-foreground">
                                            {isEditing ? t('saCorporate.navigation.editingLabel') : t('saCorporate.navigation.editHint')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    {t('saCorporate.navigation.pagination', { current: currentQuestionIndex + 1, total: filteredQuestions.length })}
                </div>
            </div>
        </div>
    );
};

export default SaCompRegistrationForm;