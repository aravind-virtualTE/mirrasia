import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HelpCircle, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAtom } from 'jotai';
import CustomLoader from '@/components/ui/customLoader';
import { sendInviteToShDir } from '@/services/dataFetch';
import { isValidEmail } from '@/middleware';
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "react-i18next";
import { paFormWithResetAtom } from '../PaState';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ShareholderDirectorProps {
    name: string;
    email: string;
    phone: string;
    ownershipRate: number;
    // isDirector: {
    //     value: string,
    //     id: string
    // };
    isLegalPerson: {
        value: string,
        id: string
    };
    role: {
        id: string;
        value: string;
    };
    onDelete: () => void;
    onUpdate: (updates: Partial<Omit<ShareholderDirectorProps, 'onDelete' | 'onUpdate'>>) => void;
    isRemovable: boolean;
}
interface LegalDirectorProps {
    ownershipRate: number;
    // isDirector: {
    //     value: string,
    //     id: string
    // };
    isLegalPerson: {
        value: string,
        id: string
    };
    role?: {
        id: string;
        value: string;
    };
    onDelete: () => void;
    onUpdate: (updates: Partial<Omit<LegalDirectorProps, 'onDelete' | 'onUpdate'>>) => void;
    isRemovable: boolean;
}

const roleOptions = [
    { id: 'representative', value: 'Representative' },
    { id: 'financial_officer', value: 'Financial Officer' },
    { id: 'secretary', value: 'Secretary' },
];

const roleOptions1 = [
    { id: 'president', value: 'President' },
    { id: 'treasurer', value: 'Treasurer' },
    { id: 'secretary', value: 'Secretary' },
];

const ShareholderDirector: React.FC<ShareholderDirectorProps> = ({
    name,
    email,
    phone,
    ownershipRate,
    // isDirector,
    isLegalPerson,
    onDelete,
    onUpdate,
    role,
    isRemovable,
}) => {
    const [emailError, setEmailError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const { t } = useTranslation();
    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setEmailError('Email is required');
            return false;
        }
        if (!emailRegex.test(email)) {
            setEmailError('Please enter a valid email address');
            return false;
        }
        setEmailError('');
        return true;
    };
    const validatePhone = (phone: string) => {
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phone) {
            setPhoneError('Phone number is required');
            return false;
        }
        if (!phoneRegex.test(phone)) {
            setPhoneError('Please enter a valid phone number');
            return false;
        }
        setPhoneError('');
        return true;
    };

    const yesNoOptions = [
        { id: "yes", value: "AmlCdd.options.yes" },
        { id: "no", value: "AmlCdd.options.no" },
    ];

    return (
        <Card className="mb-4 pt-4">
            <CardContent className="grid grid-cols-3 gap-4">
                <div className="col-span-3 grid grid-cols-5 gap-4 items-center">
                    <Label className="font-medium">Shareholder(s)</Label>
                    <Input
                        type="text"
                        className="input col-span-2"
                        placeholder="Name on passport/official documents"
                        value={name}
                        onChange={(e) => onUpdate({ name: e.target.value })}
                    />
                    <Label className="font-medium">{t('CompanyInformation.ownerShpRte')}</Label>
                    <Input
                        type="number"
                        className="input"
                        min={0}
                        max={100}
                        step={0.01}
                        value={ownershipRate}
                        onChange={(e) => onUpdate({ ownershipRate: parseFloat(e.target.value) })}
                    />
                </div>

                <div className="col-span-3 grid grid-cols-5 gap-4 items-center">
                    <Label className="font-medium">{t('ApplicantInfoForm.email')}:</Label>
                    <div className="col-span-2">
                        <Input
                            type="email"
                            className={`input w-full ${emailError ? 'border-red-500' : ''}`}
                            placeholder="email@example.com"
                            value={email}
                            onChange={(e) => {
                                const newEmail = e.target.value;
                                validateEmail(newEmail);
                                onUpdate({ email: newEmail });
                            }}
                        />
                        {emailError && <span className="text-red-500 text-sm">{emailError}</span>}
                    </div>

                    <Label className="font-medium">{t('ApplicantInfoForm.phoneNum')}:</Label>
                    <div>
                        <Input
                            type="tel"
                            className={`input w-full ${phoneError ? 'border-red-500' : ''}`}
                            placeholder="+1234567890"
                            value={phone}
                            onChange={(e) => {
                                const newPhone = e.target.value;
                                validatePhone(newPhone);
                                onUpdate({ phone: newPhone });
                            }}
                        />
                        {phoneError && <span className="text-red-500 text-sm">{phoneError}</span>}
                    </div>
                </div>

                <div className="col-span-3 flex gap-4 items-end">
                    <div className="flex-1">
                        <Label className="font-medium">Role</Label>
                        <Select
                            value={role?.id || ''}
                            onValueChange={(selectedId) => {
                                const selectedRole = roleOptions.find(role => role.id === selectedId);
                                if (selectedRole) {
                                    onUpdate({ role: selectedRole });
                                }
                            }}
                        >
                            <SelectTrigger className="input w-full">
                                <SelectValue placeholder="Select role">
                                    {role ? t(role.value) : ''}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {roleOptions.map(role => (
                                    <SelectItem key={role.id} value={role.id}>
                                        {t(role.value)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1">
                        <Label className="font-medium">{t('CompanyInformation.isLegal')}</Label>
                        <Select
                            value={isLegalPerson.id}
                            onValueChange={(selectedId) => {
                                const selectedOption = yesNoOptions.find(opt => opt.id === selectedId);
                                if (selectedOption) {
                                    onUpdate({ isLegalPerson: selectedOption });
                                }
                            }}
                        >
                            <SelectTrigger className="input w-full">
                                <SelectValue>{t(isLegalPerson.value)}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {yesNoOptions.map((option) => (
                                    <SelectItem key={option.id} value={option.id}>
                                        {t(option.value)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {isRemovable && (
                        <div className="flex items-end">
                            <button
                                className="text-red-500 hover:text-red-700 p-2"
                                onClick={onDelete}
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                </div>



            </CardContent>
        </Card>
    );
};

const LegalDirectorList: React.FC<LegalDirectorProps> = ({
    ownershipRate,
    // isDirector,
    isLegalPerson,
    role,
    onDelete,
    onUpdate,
    isRemovable,
}) => {
    const { t } = useTranslation();

    const yesNoOptions = [
        { id: "yes", value: "AmlCdd.options.yes" },
        { id: "no", value: "AmlCdd.options.no" },
    ];

    return (
        <Card className="mb-4">
            <CardContent className="grid grid-cols-[2fr_2fr_2fr_2fr_auto] gap-4 items-end py-4">
                <div>
                    <Label className="font-medium">Role</Label>
                    <Select
                        value={role?.id || ''}
                        onValueChange={(selectedId) => {
                            const selectedRole = roleOptions1.find(role => role.id === selectedId);
                            if (selectedRole) {
                                onUpdate({ role: selectedRole });
                            }
                        }}
                    >
                        <SelectTrigger className="input">
                            <SelectValue placeholder="Select role">
                                {role ? t(role.value) : ''}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {roleOptions1.map(role => (
                                <SelectItem key={role.id} value={role.id}>
                                    {t(role.value)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label className="font-medium">{t('CompanyInformation.ownerShpRte')}</Label>
                    <Input
                        type="number"
                        min={0}
                        max={100}
                        step={0.01}
                        className="input"
                        value={ownershipRate}
                        onChange={(e) => onUpdate({ ownershipRate: parseFloat(e.target.value) })}
                    />
                </div>
                {/* <div>
                    <Label className="font-medium">{t('CompanyInformation.actDirector')}</Label>
                    <Select
                        value={isDirector.id}
                        onValueChange={(selectedId) => {
                            const selectedOption = yesNoOptions.find(opt => opt.id === selectedId);
                            if (selectedOption) {
                                onUpdate({ isDirector: selectedOption });
                            }
                        }}
                    >
                        <SelectTrigger className="input">
                            <SelectValue>{t(isDirector.value)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {yesNoOptions.map((option) => (
                                <SelectItem key={option.id} value={option.id}>
                                    {t(option.value)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div> */}
                <div>
                    <Label className="font-medium">{t('CompanyInformation.isLegal')}</Label>
                    <Select
                        value={isLegalPerson.id}
                        onValueChange={(selectedId) => {
                            const selectedOption = yesNoOptions.find(opt => opt.id === selectedId);
                            if (selectedOption) {
                                onUpdate({ isLegalPerson: selectedOption });
                            }
                        }}
                    >
                        <SelectTrigger className="input">
                            <SelectValue>{t(isLegalPerson.value)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {yesNoOptions.map((option) => (
                                <SelectItem key={option.id} value={option.id}>
                                    {t(option.value)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {isRemovable && (
                    <div className="flex items-end justify-end pb-[6px]">
                        <button
                            className="btn btn-icon text-red-500 hover:text-red-700"
                            onClick={onDelete}
                        >
                            <Trash2 />
                        </button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const ShareholderDirectorFormPa: React.FC = () => {
    const { t } = useTranslation()
    const [formData, setFormData] = useAtom(paFormWithResetAtom);
    const [shareholders, setShareholders] = useState<ShareholderDirectorProps[]>([
        {
            name: '',
            email: '',
            phone: '',
            ownershipRate: 0,
            role: { id: '', value: '' },
            // isDirector: { id: "no", value: t("AmlCdd.options.no") },
            isLegalPerson: { id: "no", value: t("AmlCdd.options.no") },
            onDelete: () => { },
            onUpdate: () => { },
            isRemovable: false,
        },
    ]);
    const [legalDirectors, setLegalDirectors] = useState<LegalDirectorProps[]>([
         {        
            ownershipRate: 0,
            role: { id: '', value: '' },
            // isDirector: { id: "no", value: t("AmlCdd.options.no") },
            isLegalPerson: { id: "no", value: t("AmlCdd.options.no") },
            onDelete: () => { },
            onUpdate: () => { },
            isRemovable: false,
        },
    ]);
    const [totalOwnership, setTotalOwnership] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast()


    useEffect(() => {
        if (formData.shareHolders && formData.shareHolders.length > 0) {
            const hydratedShareholders = formData.shareHolders.map((shareholder, index) => ({
                ...shareholder,
                onDelete: () => { },
                onUpdate: () => { },
                isRemovable: index !== 0,
            }));
            setShareholders(hydratedShareholders);
        }
        if (formData.legalDirectors && formData.legalDirectors.length > 0) {
            const hydratedShareholders = formData.legalDirectors.map((shareholder,) => ({
                ...shareholder,
                onDelete: () => { },
                onUpdate: () => { },
                isRemovable: true,
            }));
            setLegalDirectors(hydratedShareholders);
        }
    }, []);

    useEffect(() => {
        const filteredShareholders = shareholders.map(obj => ({
            name: obj.name,
            email: obj.email,
            phone: obj.phone,
            role: obj.role,
            ownershipRate: obj.ownershipRate,
            // isDirector: obj.isDirector,
            isLegalPerson: obj.isLegalPerson
        }));

        const filteredLegalDirectors = legalDirectors.map(obj => ({
            ownershipRate: obj.ownershipRate,
            role: obj.role,
            // isDirector: obj.isDirector,
            isLegalPerson: obj.isLegalPerson
        }));

        const total = shareholders.reduce((sum, shareholder) => sum + (shareholder.ownershipRate || 0), 0) +
            legalDirectors.reduce((sum, legalDirector) => sum + (legalDirector.ownershipRate || 0), 0);

        setFormData({
            ...formData,
            shareHolders: filteredShareholders,
            legalDirectors: filteredLegalDirectors
        });
        setTotalOwnership(total);

    }, [shareholders, legalDirectors]);

    const addShareholder = () => {
        setShareholders([
            ...shareholders,
            {
                name: '',
                email: '',
                phone: '',
                role: { id: '', value: '' },
                ownershipRate: 0,
                // isDirector: { id: "no", value: t("AmlCdd.options.no") },
                isLegalPerson: { id: "no", value: t("AmlCdd.options.no") },
                onDelete: () => { },
                onUpdate: () => { },
                isRemovable: true,
            },
        ]);
    };

    const deleteShareholder = (index: number) => {
        if (shareholders.length > 1) {
            const newShareholders = [...shareholders];
            newShareholders.splice(index, 1);
            setShareholders(newShareholders);
        }
    };

    const updateShareholder = (index: number, updates: Partial<Omit<ShareholderDirectorProps, 'onDelete' | 'onUpdate'>>) => {
        const newShareholders = [...shareholders];
        newShareholders[index] = { ...newShareholders[index], ...updates };
        setShareholders(newShareholders);
    };

    const sendMailFunction = async () => {

        try {
            setIsLoading(true);
            const extractedData = shareholders.map(item => {
                const { name, email } = item;

                if (!isValidEmail(email)) {
                    alert(`Invalid email format for ${name}: ${email}`);
                }
                return { name, email };
            });
            const docId = localStorage.getItem('companyRecordId');
            const payload = { _id: docId, inviteData: extractedData, country: 'PA' };
            const response = await sendInviteToShDir(payload);
            if (response.summary.successful > 0) {
                toast({
                    title: 'Success',
                    description: `Successfully sent invitation mail to ${response.summary.successful} people`,
                })
            }
            if (response.summary.alreadyExists > 0) {
                toast({
                    title: 'Success',
                    description: `Some Users Already Exist`,
                })
            }
            if (response.summary.failed > 0) {
                toast({
                    title: 'Failed',
                    description: `Some Invitations Failed`,
                })
            }
            setIsLoading(false);

        } catch (e) {
            console.log(e)
        }
    }

    const addLegalDirector = () => {
        setLegalDirectors([
            ...legalDirectors,
            {
                ownershipRate: 0,
                // isDirector: { id: "no", value: t("AmlCdd.options.no") },
                isLegalPerson: { id: "no", value: t("AmlCdd.options.no") },
                onDelete: () => { },
                onUpdate: () => { },
                isRemovable: true,
            },
        ]);
    };

    const deleteLegalDirector = (index: number) => {
        const newShareholders = [...legalDirectors];
        newShareholders.splice(index, 1);
        setLegalDirectors(newShareholders);
        // if (legalDirectors.length > 1) {
        // }
    };

    const updateLegalDirector = (index: number, updates: Partial<Omit<LegalDirectorProps, 'onDelete' | 'onUpdate'>>) => {
        const newLegalDirector = [...legalDirectors];
        newLegalDirector[index] = { ...newLegalDirector[index], ...updates };
        // console.log("newLegalDirector--->", newLegalDirector)
        setLegalDirectors(newLegalDirector);
    };
    return (
        <div className="flex flex-col">
            {totalOwnership === 0 && (
                <div className="text-red-500 mb-4 text-center">
                    {t('usa.bInfo.shrldSection.ownerShp0')}
                </div>
            )}
            {totalOwnership > 0 && totalOwnership < 100 && (
                <div className="text-red-500 mb-4 text-center">
                    {t('CompanyInformation.totalShrldrName')}: {totalOwnership.toFixed(2)}%
                </div>
            )}
            {totalOwnership === 100 && (
                <div className="text-green-600 font-medium mb-4 text-center">
                    ✅{t('usa.bInfo.shrldSection.ownerShip100')}
                </div>
            )}
            {totalOwnership > 100 && (
                <div className="text-red-500 mb-4 text-center">
                    {t('CompanyInformation.totalShrldrName')}: {totalOwnership.toFixed(2)}%
                </div>
            )}
            <div>
                {shareholders.map((shareholder, index) => (
                    <ShareholderDirector
                        key={index}
                        {...shareholder}
                        onDelete={() => deleteShareholder(index)}
                        onUpdate={(updates) => updateShareholder(index, updates)}
                    />
                ))}
            </div>
            <div className="flex justify-around mt-0">
                <Button onClick={sendMailFunction}
                    disabled={isLoading}
                    className="flex items-center text-xs"
                    aria-busy={isLoading}
                    aria-live="polite"
                >{isLoading ? (
                    <>
                        <CustomLoader />
                        <span className="ml-2">Processing...</span>
                    </>
                ) : (<span>{t("CompanyInformation.sendInvitation")}</span>)}</Button>
                <Button
                    className="btn btn-primary w-fit text-xs"
                    onClick={addShareholder}
                >
                    {t('CompanyInformation.addShldrDir')}
                </Button>
            </div>
            <div className='flex flex-row justify-between'>
                <Label className="flex items-center gap-2 mt-2">If you would like to use a local nominee service, please select<span className="text-red-500 font-bold ml-1 flex">*
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[500px] text-base">
                            Mandatory members (3 persons): President, Secretary, Treasurer
                            Minimum nominee service period: 1 year

                            Panama does provide a local nominee service to protect publicly available registry information. However, this is primarily for the purpose of protecting publicly available information and does not involve or represent the local nominee in all or any part of the foundation's operations. In addition, in accordance with KYC/CDD regulations, you must inform us, the virtual asset exchange or financial institution, etc. the information of the actual operator and UBO(Ultimate Beneficial Owner).

                            In general, it is common to provide the services of two nominee directors in addition to the name of one client, as it can be generally interpreted that the foundation does not have any scam or impure purpose and is operated under the supervision of one representative.
                            Cost of nominee director service (1 year):
                            USD1,200 for 1 nominee / USD1,700 for 2 nominees / USD2,200 for 3 nominees
                        </TooltipContent>
                    </Tooltip>
                </span>
                </Label>
                <Button
                    className="btn btn-primary text-xs m-2"
                    onClick={addLegalDirector}
                >
                    Add Legal Director
                </Button>
            </div>
            <div className="relative mt-2">
                {/* <div className="absolute top-0 right-0 mt-2 mr-2">
                </div> */}
                {legalDirectors.map((shareholder, index) => (
                    <LegalDirectorList
                        key={index}
                        {...shareholder}
                        onDelete={() => deleteLegalDirector(index)}
                        onUpdate={(updates) => updateLegalDirector(index, updates)}
                    />
                ))}
            </div>
        </div>
    );
};

export default ShareholderDirectorFormPa;