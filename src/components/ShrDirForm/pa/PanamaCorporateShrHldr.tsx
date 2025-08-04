/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, ArrowRight, ArrowLeft, Edit3, Info, Eye, Download, FileText } from 'lucide-react';
import questionsData from './corporationQuestions.json';
import { useToast } from '@/hooks/use-toast';
import {
    panamaCorporateFormAtom,
    type Question,
    saveShrCorporatePanamaInviteData,
    getCorporatePanamaShareHlderData
} from './PanamaShratoms';
import { multiShrDirResetAtom } from '@/components/shareholderDirector/constants';
import { useParams } from 'react-router-dom';

const PanamaCorporateShareholderInvite: React.FC = () => {
    const [formData, setFormData] = useAtom(panamaCorporateFormAtom);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [currentFile, setCurrentFile] = useState<File | null>(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [otherInputValues, setOtherInputValues] = useState<Record<string, string>>({});
    const { toast } = useToast();
    const currentQuestion = filteredQuestions[currentQuestionIndex] || null;
    const isLastQuestion = currentQuestionIndex === filteredQuestions.length - 1;
    const [multiData,] = useAtom<any>(multiShrDirResetAtom)
    const { id } = useParams();


    useEffect(() => {
        if (id) {
            async function fetchData(id: string) {
                // console.log('id--->', id)
                const data = await getCorporatePanamaShareHlderData(id);
                // console.log("data", data)
                const normalizedBirthdate = data.birthdate
                    ? data.birthdate.split("T")[0]
                    : "";
                setFormData(prev => ({
                    ...prev,
                    ...data,
                    birthdate: normalizedBirthdate,
                    corporationRelationship: data.corporationRelationship ?? prev.corporationRelationship,
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
            setFormData({ ...formData, email: findData.email, companyName: findData.companyName })
        }
        // console.log("multiShId",findData)
    }, [])

    const getFieldValue = (questionId: string): string | string[] => {
        const value = (formData as any)[questionId];
        if (value === undefined || value === null) return '';
        return value
    };

    const setFieldValue = (questionId: string, value: string | string[] | File) => {
        // console.log("value----->",value)
        setFormData(prev => ({ ...prev, [questionId]: value }));
    };

    const saveFormData = async () => {
        try {
            console.log("formData", formData)
            await saveShrCorporatePanamaInviteData(formData, id)
            // console.log("result", result)const result =

            toast({
                title: "Data saved",
                description: "Your form data has been saved successfully",
            });
        } catch (error) {
            console.error('Error saving form data:', error);
            toast({
                title: "Save failed",
                description: "Failed to save your form data",
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
            name: "",
            email: "",
            companyName: "",
            dateOfEstablishment: "",
            establishmentCountry: "",
            brnNumber: "",
            listedOnStockExchange: "",
            namesOfShareholders: "",
            businessAddress: "",
            phoneNumber: "",
            kakaoTalkId: "",
            otherSnsId: "",
            corporationRelationship: [],
            investedAmount: "",
            sourceInvestmentFunds: [],
            countryReceivingFunds: "",
            fundGenerated: [],
            countriesReceivingFunds: "",
            usCorporateUnderTaxLaw: "",
            tinNumber: "",
            isPoliticallyProminentFig: "",
            descPoliticImpRel: "",
            anyOneInvestigatedByLawEnforcement: "",
            employeeIllicitActivity: "",
            isAnyBankRupted: "",
            isAnyInvolvedBankRuptedOfficer: "",
            criminalDescriptionIfYes: "",
            declarationAgreement: "",
            otherInputs: {},
        });
        setCurrentQuestionIndex(0);
        setCurrentAnswer('');
        setIsCompleted(false);
        setIsEditing(false);
        setOtherInputValues({});
    };

    useEffect(() => {
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
                title: "Required field",
                description: "This field is required",
                variant: "destructive",
            });
            return false;
        }

        if (question.validation) {
            const { minLength, pattern, message } = question.validation;

            if (minLength && value.length < minLength) {
                toast({
                    title: "Validation error",
                    description: message,
                    variant: "destructive",
                });
                return false;
            }

            if (pattern && !new RegExp(pattern).test(value)) {
                toast({
                    title: "Validation error",
                    description: message,
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
        // console.log("currentFile-->",currentFile)
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
            // For files, store the file name or URL

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
        // console.log("value",value)
        if (question?.type === 'checkbox' && Array.isArray(value)) {
            return value.map(val => {
                const option = question.options?.find(opt => opt.value === val);
                if (option?.allowOther && val === 'other') {
                    const otherValue = formData.otherInputs[`${question.id}-${val}`];
                    return otherValue ? `Other: ${otherValue}` : option.label;
                }
                return option?.label || val;
            }).join(', ');
        }

        if (question?.type === 'select' && typeof value === 'string') {
            const option = question.options?.find(opt => opt.value === value);
            if (option?.allowOther && value === 'other') {
                const otherValue = formData.otherInputs[`${question.id}-${value}`];
                return otherValue ? `Other: ${otherValue}` : option.label;
            }
            return option?.label || value;
        }

        return String(value);
    };

    const renderFilePreview = (fileValue: File | string) => {
        // console.log("fileValue====>", fileValue)
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
                            {isPDF ? 'Open PDF' : 'View'}
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
                            Download
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
                        <p className="text-xs text-muted-foreground">PDF file - Click "Open PDF" to view</p>
                    </div>
                )}

                <div className="text-xs text-muted-foreground mt-1">
                    {fileSize && `Size: ${(fileSize / 1024).toFixed(1)} KB • `}
                    {fileType && `Type: ${fileType}`}
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
                                    {option.label}
                                </Button>
                                {option.allowOther && currentAnswer === option.value && (
                                    <Input
                                        value={otherInputValues[option.value] || ''}
                                        onChange={(e) => handleOtherInputChange(option.value, e.target.value)}
                                        placeholder="Please specify..."
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
                                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                            {!currentQuestion.required && !currentAnswer && (
                                <Button onClick={handleSkip} className="flex-1 option-button">
                                    Continue <ArrowRight className="ml-2 h-4 w-4" />
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
                                            placeholder="Please specify..."
                                            className="ml-8"
                                        />
                                    )}
                                </div>
                            );
                        })}
                        <div className="flex gap-2 mt-4">
                            {currentAnswer && (
                                <Button onClick={handleNext} className="flex-1 option-button">
                                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                            {!currentQuestion.required && !currentAnswer && (
                                <Button onClick={handleSkip} className="flex-1 option-button">
                                    Continue <ArrowRight className="ml-2 h-4 w-4" />
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
                                            placeholder="Please specify..."
                                            className="ml-8"
                                        />
                                    )}
                                </div>
                            );
                        })}
                        <div className="flex gap-2 mt-4">
                            {currentAnswer && (
                                <Button onClick={handleNext} className="flex-1 option-button">
                                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                            {!currentQuestion.required && !currentAnswer && (
                                <Button onClick={handleSkip} className="flex-1 option-button">
                                    Continue <ArrowRight className="ml-2 h-4 w-4" />
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
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-muted-foreground">PNG, JPG or PDF</p>
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
                                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                            {!currentQuestion.required && !currentAnswer && (
                                <Button onClick={handleSkip} className="flex-1 option-button">
                                    Continue <ArrowRight className="ml-2 h-4 w-4" />
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
                                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                            {!currentQuestion.required && !currentAnswer && (
                                <Button onClick={handleSkip} className="flex-1 option-button">
                                    Continue <ArrowRight className="ml-2 h-4 w-4" />
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
                    <h2 className="summary-title">Your Information</h2>
                    <div className="flex items-center justify-center gap-2 text-primary mb-4">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Form Completed Successfully!</span>
                    </div>
                    <div className="flex gap-3 justify-center">
                        <Button
                            variant="outline"
                            onClick={() => setIsCompleted(false)}
                            className="text-sm hover:bg-accent hover:text-accent-foreground transition-smooth"
                        >
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit Answers
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="text-sm option-button"
                        >
                            Submit Form
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={clearFormData}
                            className="text-sm"
                        >
                            Clear All Data
                        </Button>
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
                                            {question.question}
                                            {!question.required && <span className="text-xs ml-1">(Optional)</span>}
                                        </div>
                                        <div className="font-medium">
                                            {hasAnswer ? getDisplayValue(question.id, question) :
                                                <span className="text-muted-foreground italic">Not answered</span>}
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
                                        {question.question}
                                        {!question.required && <span className="text-xs ml-1">(Optional)</span>}
                                    </div>
                                    <div className="font-medium">
                                        {hasAnswer ? getDisplayValue(question.id, question) :
                                            <span className="text-muted-foreground italic">Not answered</span>}
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
                <div className="max-w-6xl w-full space-y-6">
                    <div className="text-center">
                        <h1 className="decorative-heading">Panama member and controller registration form</h1>
                        <div className="w-3/4 h-1 bg-primary mx-auto rounded-full"></div>
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
            <div className="max-w-6xl w-full space-y-6">
                <div className="text-center">
                    <h1 className="decorative-heading">Panama member and controller registration form</h1>
                    <div className="w-3/4 h-1 bg-primary mx-auto rounded-full"></div>
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
                                                <p className="question-title">{currentQuestion.question}</p>
                                                {currentQuestion.infoText && (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                                            </TooltipTrigger>
                                                            <TooltipContent side="right" className="max-w-sm p-4">
                                                                <p className="text-sm whitespace-pre-wrap">{currentQuestion.infoText}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
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
                                            Continue <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    )}

                                {currentQuestion.type === 'select' && currentAnswer &&
                                    currentQuestion.options?.find(opt => opt.value === currentAnswer)?.allowOther &&
                                    otherInputValues[currentAnswer] && (
                                        <Button
                                            onClick={handleNext}
                                            className="w-full option-button"
                                        >
                                            Continue <ArrowRight className="ml-2 h-4 w-4" />
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
                                            Previous
                                        </Button>
                                        <span className="text-xs text-muted-foreground">
                                            {isEditing ? 'Editing answer' : 'Click any answer above to edit'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Question {currentQuestionIndex + 1} of {filteredQuestions.length}
                </div>
            </div>
        </div>
    );
};

export default PanamaCorporateShareholderInvite;