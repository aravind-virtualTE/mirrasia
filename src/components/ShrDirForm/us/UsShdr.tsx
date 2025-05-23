/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { FileDialog } from '@/components/ui/fileDialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { t } from 'i18next'
import { HelpCircle } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { usResidencyOptions } from '../ShrDirConstants'
import DeclarationForm from './etc/DeclarationForm'
import { toast } from '@/hooks/use-toast'
import { useNavigate, useParams } from 'react-router-dom'
import { getUsIndividualShrDirRegData, usIndividualShareholderData } from '@/services/dataFetch'
import { multiShrDirResetAtom } from '@/components/shareholderDirector/constants'
import { useAtom } from 'jotai'

const UsShdr: React.FC = () => {
    const { id } = useParams();
    const [multiData,] = useAtom<any>(multiShrDirResetAtom)
    const navigate = useNavigate();
    const [formState, setFormState] = useState({
        email: "",
        name: "",
        otherName: "",
        birthdate: "",
        nationality: "",
        passportNum: "",
        addressResidence: "",
        mailingAdress: "",
        mobileNumber: "",
        kakaoTalkId: "",
        weChatId: "",
        companyName: "",
        relationWithUs: [] as string[],
        otherRelation: "",
        percentShares: "",
        sourceOfFunds: [] as string[],
        otherSourceFund: "",
        countryOriginFunds: "",
        sourceReceivedUs: [] as string[],
        sourceWithDrawUs: [] as string[],
        countryWithDrawFunds: "",
        usResidenceTaxPurpose: "",
        otherResidenceTaxPurpose: "",
        tinNumber: "",
        isPoliticalFigure: "",
        passPortCopy: null as unknown as string | Blob,
        proofOfAddress: null as unknown as string | Blob,
        driverLicense: null as unknown as string | Blob,
        isArrested: "",
        investigation: "",
        criminalActivity: "",
        personalBankruptcy: "",
        companyBankruptcy: "",
        declaration: "",
        otherDeclaration: ""
    })
    const [errors, setErrors] = useState({
        email: "",
        name: "",
        birthdate: "",
        nationality: "",
        passportNum: "",
        addressResidence: "",
        mailingAdress: "",
        mobileNumber: "",
        companyName: "",
        relationWithUs: "",
        sourceOfFunds: '',
        sourceReceivedUs: "",
        sourceWithDrawUs: "",
        usResidenceTaxPurpose: "",
        isPoliticalFigure: "",
        passPortCopy: "",
        proofOfAddress: "",
        driverLicense: "",
        isArrested: "",
        investigation: "",
        criminalActivity: "",
        personalBankruptcy: "",
        companyBankruptcy: "",
        declaration: ""

    })
    const [fileSource, setFileSource] = useState<any>('');
    const [openFile, setOpenFile] = useState(false);

    useEffect(() => {
        if (id) {
            console.log('id--->', id)
            async function fetchData(id: string) {
                const data = await getUsIndividualShrDirRegData(id);
                console.log("data", data)
                setFormState(data);
            }
            fetchData(id)
        }
        const multiShId = localStorage.getItem("shdrItem")
        const findData = multiData.length > 0
            ? multiData.find((item: { _id: string | null; }) => item._id === multiShId)
            : null;
        if (findData) {
            setFormState({ ...formState, email: findData.email, companyName: findData.companyName })
        }
        // console.log("multiShId",findData)
    }, [])

    const handleChange = <T extends keyof typeof formState>(
        field: T,
        value: typeof formState[T]
    ) => {
        setFormState((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const roleMap = [
        { key: "shareHld", value: "shareholder" },
        { key: "officer", value: "Officer" },
        { key: "keyControl", value: "Key controller (applicable if you directly or indirectly own more than 25% of the shares)" },
        { key: "designatedContact", value: "Designated Contact Person *May concurrently serve as an executive officer" },
        { key: "oficialPartner", value: "Official partner registered with Mir Asia" },
        { key: "other", value: "Other" },
    ]

    const sourceMap = [
        { key: "earnedIncme", value: "Earned income" },
        { key: "depositSave", value: "Deposits, savings" },
        { key: "realEstateIncome", value: "Income from real estate, stocks, and other investment assets" },
        { key: "loan", value: "Loan" },
        { key: "saleOfCompanyShares", value: "Proceeds from the sale of a company or shares" },
        { key: "businessIncome", value: "Business Income / Dividends" },
        { key: "succession", value: "succession" },
        { key: "other", value: "Other" },
    ]

    const sourceReceivedUsMap = [
        { key: "businessIncme", value: "Business income and distribution" },
        { key: "earnedIncme", value: "Earned income" },
        { key: "interest", value: "Interest income" },
        { key: "realEstStk", value: "Income from real estate, stocks, and other investment assets" },
        { key: "saleCompShare", value: "Proceeds from the sale of a company or shares" },
        { key: "inherit", value: "Inheritance/Gift" },
        { key: "borowing", value: "Borrowing/trusting/depositing, etc." },
        { key: "other", value: "Other" },
    ]
    const sourcewithDrawnUsMap = [
        { key: "paymentGoods", value: "Payment for goods" },
        { key: "salaryBonus", value: "Salary/Bonus Payment" },
        { key: "loanFunds", value: "Loan of funds" },
        { key: "realestateBuy", value: "Purchase of real estate, stocks, and other investment assets" },
        { key: "divident", value: "Dividend Payment" },
        { key: "operatingExpense", value: "Payment of business operating expenses" },
        { key: "other", value: "Other" },
    ]

    const handleFileClick = (src: any) => {
        setFileSource(src);
        setOpenFile(true);
    }

    const handleSubmit = async () => {
        const newErrors = { ...errors };
        let hasError = false;
        const excludedFields = ["mailingAdress", "kakaoTalkId", "weChatId", "tinNumber", "passPortCopy", "proofOfAddress", "driverLicense", "countryOriginFunds", "otherName", "countryWithDrawFunds", "percentShares", 'otherDeclaration', "otherResidenceTaxPurpose", "otherSourceFund", "otherRelation"];
        const formKeys = Object.keys(formState) as (keyof typeof formState)[];

        formKeys.forEach((field) => {
            if (excludedFields.includes(field)) {
                return;
            } else {
                setErrors({ ...errors, [field]: `Please fill ${field} value` })
            }
            const value = formState[field as keyof typeof formState];
            console.log("field", field, "value", value)
            const isEmpty =
                value === "" ||
                value === null ||
                (Array.isArray(value) && value.length === 0);

            if (isEmpty) {
                newErrors[field as keyof typeof newErrors] = "This field is required";
                hasError = true;
            } else {
                newErrors[field as keyof typeof newErrors] = "";
            }
        });

        setErrors(newErrors);

        if (hasError) {
            console.warn("Form submission blocked due to validation errors.", newErrors);
            toast({
                title: "Enter Missing Items",
                description: "PLease enter all required items"
            })
            return;
        } else {
            // console.log("Submitting form data:", formState);
            const result = await usIndividualShareholderData(formState, id);
            // console.log("Form result-->", result);
            if (result.success == true) {
                localStorage.removeItem('shdrItem')
                setFormState(result.registeredData)
                navigate("/viewboard")
                toast({
                    title: "Details submitted",
                    description: "Saved successfully"
                });
            }

        }

    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Application for Member Registration of U.S. Company
                </CardTitle>
            </CardHeader>
            <CardContent>
                <>
                    <p className="text-sm text-gray-500">
                        This application form is written in the form of a questionnaire regarding the information absolutely necessary to proceed with the registration of members of a US company (LLC - limited liability company / Corp - joint stock company). All individuals who are members are requested to individually complete this application form.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        This application form and the application form documents to be signed later will be kept by our company as legal procedures for performing KYC (Know Your Customer) and Client's Due Diligence (due diligence and verification of customers) in accordance with the TCSP license and AMLO (Anti-Money Laundering and Counter-Terrorist Financing Act) and as future legal records (Statutory Documents). Therefore, please be careful to avoid any distortion or errors in the content you write.
                    </p>

                    <p className="text-sm font-bold mt-4">{t("SwitchService.Consultation.thanks")}</p>
                    <div className="mt-4">
                        <p className="text-sm">
                            Mirr Asia<br />
                            (Hong Kong) +852-2187-2428<br />
                            (Korea) +82-2-543-6187<br />
                            {t("dashboard.kakaoT")}: mirrasia<br />
                            {t("dashboard.wechat")}: mirrasia_hk<br />
                            {t("dashboard.Website")}:{" "}
                            <a
                                href="https://www.mirrasia.com"
                                className="text-blue-500 underline"
                            >
                                www.mirrasia.com
                            </a>
                            <br />
                            {t("dashboard.kakaChannel")}:{" "}
                            <a
                                href="https://pf.kakao.com/_KxmnZT"
                                className="text-blue-500 underline"
                            >
                                https://pf.kakao.com/_KxmnZT
                            </a>
                        </p>
                    </div>
                </>
                <div className="mt-2">
                    <div className="flex items-center gap-4">
                        <Label htmlFor="email" className="text-sm font-bold flex-shrink-0">
                            {t("ApplicantInfoForm.email")} <span className="text-red-500">*</span>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-md text-sm">
                                    We will officially contact you through this email address regarding your main contacts. Therefore, please make sure to enter an email address that you can check regularly. (If your contact information changes, we will only contact you through this email address until the new contact information is officially updated. Therefore, please be very careful about entering and updating your contact information.)
                                </TooltipContent>
                            </Tooltip>
                        </Label>
                        <Input
                            id="email"
                            placeholder={t("usa.AppInfo.emailPlaceholder")}
                            value={formState.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            className={`flex-grow ${errors.email ? "border-red-500" : ""}`}
                        />
                    </div>
                    {errors.email && (
                        <Alert variant="destructive" className="mt-2">
                            <AlertDescription>{errors.email}</AlertDescription>
                        </Alert>
                    )}
                </div>
                <div className="mt-2">
                    <div className="flex items-center gap-4">
                        <Label htmlFor="companyName" className="text-sm font-bold whitespace-nowrap">
                            {t("hk_shldr.compName")} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="companyName"
                            placeholder={t("hk_shldr.compNamePlaceholder")}
                            value={formState.companyName}
                            disabled={true}
                            onChange={(e) => handleChange("companyName", e.target.value)}
                            className={`flex-1 ${errors.companyName ? "border-red-500" : ""}`}
                        />
                    </div>
                    {errors.companyName && (
                        <Alert variant="destructive" className="mt-2">
                            <AlertDescription>{errors.companyName}</AlertDescription>
                        </Alert>
                    )}
                </div>
                <div className="mt-2">
                    <div className="flex items-center gap-4">
                        <Label htmlFor="name" className="text-sm font-bold flex-shrink-0">
                            Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            placeholder="Enter name"
                            value={formState.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            className={`flex-grow ${errors.name ? "border-red-500" : ""}`}
                        />
                    </div>
                    {errors.name && (
                        <Alert variant="destructive" className="mt-2">
                            <AlertDescription>{errors.name}</AlertDescription>
                        </Alert>
                    )}
                </div>
                <div className="mt-2">
                    <div className="flex items-center gap-4">
                        <Label htmlFor="otherName" className="text-sm font-bold flex-shrink-0">
                            Have you ever changed your name?
                        </Label>
                        <Input
                            id="otherName"
                            placeholder="Enter other name if Exists"
                            value={formState.otherName}
                            onChange={(e) => handleChange("otherName", e.target.value)}
                            className={`flex-grow`}
                        />
                    </div>
                </div>
                <div className="mt-2">
                    <div className="flex items-center gap-4">
                        <Label htmlFor="birthdate" className="text-sm font-bold flex-shrink-0">
                            BirthDate<span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="birthdate"
                            type='date'
                            placeholder="Enter birthdate"
                            value={formState.birthdate}
                            onChange={(e) => handleChange("birthdate", e.target.value)}
                            className={`flex-grow ${errors.birthdate ? "border-red-500" : ""}`}
                        />
                    </div>
                    {errors.birthdate && (
                        <Alert variant="destructive" className="mt-2">
                            <AlertDescription>{errors.birthdate}</AlertDescription>
                        </Alert>
                    )}
                </div>
                <div className="mt-2">
                    <div className="flex items-center gap-4">
                        <Label htmlFor="nationality" className="text-sm font-bold flex-shrink-0">
                            Nationality<span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="nationality"
                            placeholder="Enter nationality"
                            value={formState.nationality}
                            onChange={(e) => handleChange("nationality", e.target.value)}
                            className={`flex-grow ${errors.nationality ? "border-red-500" : ""}`}
                        />
                    </div>
                    {errors.nationality && (
                        <Alert variant="destructive" className="mt-2">
                            <AlertDescription>{errors.nationality}</AlertDescription>
                        </Alert>
                    )}
                </div>
                <div className="mt-2">
                    <div className="flex items-center gap-4">
                        <Label htmlFor="passportNum" className="text-sm font-bold flex-shrink-0">
                            Passport Number<span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="passportNum"
                            placeholder="Enter passport number"
                            value={formState.passportNum}
                            onChange={(e) => handleChange("passportNum", e.target.value)}
                            className={`flex-grow ${errors.passportNum ? "border-red-500" : ""}`}
                        />
                    </div>
                    {errors.passportNum && (
                        <Alert variant="destructive" className="mt-2">
                            <AlertDescription>{errors.passportNum}</AlertDescription>
                        </Alert>
                    )}
                </div>
                <div className="mt-2">
                    <div className="flex items-center gap-4">
                        <Label htmlFor="addressResidence" className="text-sm font-bold flex-shrink-0">
                            Address of residence and period of residence <span className="text-red-500">*</span>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-md text-sm">
                                    Please also include your zip code and the length of time you have resided in your country of residence.
                                </TooltipContent>
                            </Tooltip>
                        </Label>
                        <Input
                            id="addressResidence"
                            placeholder="Enter address"
                            value={formState.addressResidence}
                            onChange={(e) => handleChange("addressResidence", e.target.value)}
                            className={`flex-grow ${errors.addressResidence ? "border-red-500" : ""}`}
                        />
                    </div>
                    {errors.addressResidence && (
                        <Alert variant="destructive" className="mt-2">
                            <AlertDescription>{errors.addressResidence}</AlertDescription>
                        </Alert>
                    )}
                </div>
                <div className="mt-2">
                    <div className="flex items-center gap-4">
                        <Label htmlFor="mailingAdress" className="text-sm font-bold flex-shrink-0">
                            Mailing address (if different from your residential address)
                        </Label>
                        <Input
                            id="mailingAdress"
                            placeholder="Enter mailing address"
                            value={formState.mailingAdress}
                            onChange={(e) => handleChange("mailingAdress", e.target.value)}
                            className={`flex-grow ${errors.mailingAdress ? "border-red-500" : ""}`}
                        />
                    </div>
                    {errors.mailingAdress && (
                        <Alert variant="destructive" className="mt-2">
                            <AlertDescription>{errors.mailingAdress}</AlertDescription>
                        </Alert>
                    )}
                </div>
                <div className="mt-2">
                    <div className="flex items-center gap-4">
                        <Label htmlFor="mobileNumber" className="text-sm font-bold whitespace-nowrap">
                            {t("ApplicantInfoForm.phoneNum")} <span className="text-red-500">*</span>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-md text-sm">
                                    We will contact you officially at this phone number for important contacts. Therefore, please make sure to enter a phone number where you can receive calls. (If your contact information changes, we will only contact you at this phone number until the new contact information is officially updated. Therefore, please be very careful about entering and updating your contact information.)
                                </TooltipContent>
                            </Tooltip>
                        </Label>
                        <Input
                            id="mobileNumber"
                            placeholder={t("hk_shldr.mobilHlder")}
                            value={formState.mobileNumber}
                            onChange={(e) => handleChange("mobileNumber", e.target.value)}
                            className={`w-full ${errors.mobileNumber ? "border-red-500" : ""}`}
                        />
                    </div>
                    {errors.mobileNumber && (
                        <Alert variant="destructive" className="mt-2">
                            <AlertDescription>{errors.mobileNumber}</AlertDescription>
                        </Alert>
                    )}
                </div>
                <div className="mt-2">
                    <div className="flex items-center gap-4">
                        <Label htmlFor="kakaoTalkId" className="text-sm font-bold whitespace-nowrap">
                            {t("dashboard.kakaoT")}
                        </Label>
                        <Input
                            id="kakaoTalkId"
                            placeholder={t("hk_shldr.kakaoHlder")}
                            value={formState.kakaoTalkId}
                            onChange={(e) => handleChange("kakaoTalkId", e.target.value)}
                            className="w-full"
                        />
                    </div>
                </div>
                <div className="mt-2">
                    <div className="flex items-center gap-4">
                        <Label htmlFor="weChatId" className="text-sm font-bold whitespace-nowrap">
                            {t("dashboard.wechat")}
                        </Label>
                        <Input
                            id="weChatId"
                            placeholder={t("hk_shldr.wechatHldr")}
                            value={formState.weChatId}
                            onChange={(e) => handleChange("weChatId", e.target.value)}
                            className="w-full"
                        />
                    </div>
                </div>
                <div className="mt-2">
                    <Label className="text-sm font-bold flex items-center gap-2">
                        Relationship with the US company (LLC/Corp) you are establishing
                        <span className="text-red-500">*</span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-md text-sm">
                                [Description of Designated Contact Person] You must designate a designated contact person to be in charge of the company's business contacts. The designated contact person will be in charge of major business contacts with our company, and their duties include contacting you regarding company and business-related inquiries, checking progress, and contacting you regarding registered documents, etc. The designated contact person can access your company's information and documents, and can also access your mail. Designating one contact person is free of charge, and for two or more, an annual fee of USD 250 will be charged per person. The designated contact person is designated by your company and registered separately with our company to protect your company's information and reduce confusion in business. (The designated contact person must submit a copy of their passport, proof of address, and go through the identity verification process in the same way as shareholders/executives.) **Note: If there is a change in the designated contact person, you must immediately contact us to update it, and fill out this form individually and submit the required documents.
                            </TooltipContent>
                        </Tooltip>
                    </Label>
                    <div className="mt-4 space-y-2">
                        {roleMap.map(({ key, value }) => (
                            <div key={key} className="flex items-center space-x-2">
                                <Checkbox
                                    id={key}
                                    checked={formState.relationWithUs.includes(key)}
                                    onCheckedChange={(checked) =>
                                        handleChange(
                                            "relationWithUs",
                                            checked
                                                ? [...formState.relationWithUs, key]
                                                : formState.relationWithUs.filter((r) => r !== key)
                                        )
                                    }
                                />
                                <Label htmlFor={key} className="text-sm font-normal">
                                    {t(value)}
                                </Label>
                            </div>
                        ))}
                    </div>
                    {formState.relationWithUs.includes('other') &&
                        <Input id="otherRelation"
                            placeholder="Enter Other Relation"
                            value={formState.otherRelation}
                            onChange={(e) => handleChange("otherRelation", e.target.value)} />}
                    {errors.relationWithUs && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertDescription>{errors.relationWithUs}</AlertDescription>
                        </Alert>
                    )}
                </div>
                <div className="mt-2">
                    <div className="flex items-center gap-4">
                        <Label htmlFor="percentShares" className="text-sm font-bold whitespace-nowrap">
                            Percentage of shares you will own in the US company (LLC/Corp) you are establishing
                        </Label>
                        <Input
                            id="percentShares"
                            placeholder='Enter Input percentage'
                            value={formState.percentShares}
                            onChange={(e) => handleChange("percentShares", e.target.value)}
                            className="w-full"
                        />

                    </div>
                </div>
                <div className="mt-2">
                    <Label className="text-sm font-bold flex items-center gap-2">
                        Source of funds to be contributed (or loaned) to the U.S. company (LLC/Corp) you are establishing (multiple selections possible)
                        <span className="text-red-500">*</span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-md text-sm">
                                Please check the appropriate box as documentation proving the source of funds may be required in the future.
                            </TooltipContent>
                        </Tooltip>
                    </Label>
                    <div className="mt-4 space-y-2">
                        {sourceMap.map(({ key, value }) => (
                            <div key={key} className="flex items-center space-x-2">
                                <Checkbox
                                    id={key}
                                    checked={formState.sourceOfFunds.includes(key)}
                                    onCheckedChange={(checked) =>
                                        handleChange(
                                            "sourceOfFunds",
                                            checked
                                                ? [...formState.sourceOfFunds, key]
                                                : formState.sourceOfFunds.filter((r) => r !== key)
                                        )
                                    }
                                />
                                <Label htmlFor={key} className="text-sm font-normal">
                                    {t(value)}
                                </Label>
                            </div>
                        ))}
                    </div>
                    {formState.sourceOfFunds.includes('other') &&
                        <Input id="otherSourceFund"
                            placeholder="Enter Other Input"
                            value={formState.otherSourceFund}
                            onChange={(e) => handleChange("otherSourceFund", e.target.value)} />}
                    {errors.sourceOfFunds && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertDescription>{errors.sourceOfFunds}</AlertDescription>
                        </Alert>
                    )}
                </div>
                <div className="mt-2">
                    <div className="flex items-center gap-4">
                        <Label htmlFor="countryOriginFunds" className="text-sm font-bold whitespace-nowrap">
                            Country of origin of funds for the above items (list all relevant countries)
                        </Label>
                        <Input
                            id="countryOriginFunds"
                            placeholder='Enter origin'
                            value={formState.countryOriginFunds}
                            onChange={(e) => handleChange("countryOriginFunds", e.target.value)}
                            className="w-full"
                        />
                    </div>
                </div>
                <div className="mt-2">
                    <Label className="text-sm font-bold flex items-center gap-2">
                        Sources of funds expected to be generated or received by the US company (LLC/Corp) in the future (multiple selections possible)
                        <span className="text-red-500">*</span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-md text-sm">
                                Please check the appropriate box as documentation proving the source of funds may be required in the future.
                            </TooltipContent>
                        </Tooltip>
                    </Label>
                    <div className="mt-4 space-y-2">
                        {sourceReceivedUsMap.map(({ key, value }) => (
                            <div key={key} className="flex items-center space-x-2">
                                <Checkbox
                                    id={key}
                                    checked={formState.sourceReceivedUs.includes(key)}
                                    onCheckedChange={(checked) =>
                                        handleChange(
                                            "sourceReceivedUs",
                                            checked
                                                ? [...formState.sourceReceivedUs, key]
                                                : formState.sourceReceivedUs.filter((r) => r !== key)
                                        )
                                    }
                                />
                                <Label htmlFor={key} className="text-sm font-normal">
                                    {t(value)}
                                </Label>
                            </div>
                        ))}
                    </div>
                    {formState.sourceReceivedUs.includes('other') &&
                        <Input
                            id="otherSourceFund"
                            placeholder="Enter Other Input"
                            value={formState.otherSourceFund}
                            onChange={(e) => handleChange("otherSourceFund", e.target.value)}
                        />
                    }
                    {errors.sourceReceivedUs && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertDescription>{errors.sourceReceivedUs}</AlertDescription>
                        </Alert>
                    )}
                </div>
                <div className="mt-2">
                    <Label className="text-sm font-bold flex items-center gap-2">
                        Sources of funds expected to be withdrawn/withdrawn from the US company (LLC/Corp) in the future (multiple selections possible)
                        <span className="text-red-500">*</span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-md text-sm">
                                Please select or describe the purpose for which funds from the US company will be paid in the future.
                            </TooltipContent>
                        </Tooltip>
                    </Label>
                    <div className="mt-4 space-y-2">
                        {sourcewithDrawnUsMap.map(({ key, value }) => (
                            <div key={key} className="flex items-center space-x-2">
                                <Checkbox
                                    id={key}
                                    checked={formState.sourceWithDrawUs.includes(key)}
                                    onCheckedChange={(checked) =>
                                        handleChange(
                                            "sourceWithDrawUs",
                                            checked
                                                ? [...formState.sourceWithDrawUs, key]
                                                : formState.sourceWithDrawUs.filter((r) => r !== key)
                                        )
                                    }
                                />
                                <Label htmlFor={key} className="text-sm font-normal">
                                    {t(value)}
                                </Label>
                            </div>
                        ))}
                    </div>
                    {formState.sourceWithDrawUs.includes('other') &&
                        <Input id="otherSourceFund"
                            placeholder="Enter Other Input"
                            value={formState.otherSourceFund}
                            onChange={(e) => handleChange("otherSourceFund", e.target.value)} />}
                    {errors.sourceWithDrawUs && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertDescription>{errors.sourceWithDrawUs}</AlertDescription>
                        </Alert>
                    )}
                </div>
                <div className="mt-2">
                    <div className="flex items-center gap-4">
                        <Label htmlFor="countryWithDrawFunds" className="text-sm font-bold whitespace-nowrap">
                            Countries from which funds are being withdrawn for the above items (list all countries)
                        </Label>
                        <Input
                            id="countryWithDrawFunds"
                            placeholder='Enter origin'
                            value={formState.countryWithDrawFunds}
                            onChange={(e) => handleChange("countryWithDrawFunds", e.target.value)}
                            className="w-full"
                        />
                    </div>
                </div>
                <div className="mt-2">
                    <Label className="text-sm font-bold">
                        Are you a U.S. citizen, permanent resident, or U.S. resident for tax purposes?
                        <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup
                        className="mt-4 "
                        value={formState.usResidenceTaxPurpose}
                        onValueChange={(value) => handleChange("usResidenceTaxPurpose", value)}
                    >
                        {usResidencyOptions.map((option) => (
                            <div key={option.key} className="flex items-center space-x-2">
                                <RadioGroupItem id={option.key} value={option.key} />
                                <Label htmlFor={option.key} className="text-sm font-normal">
                                    {t(option.value)}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                    {errors.usResidenceTaxPurpose && (
                        <Alert variant="destructive" className="mt-2">
                            <AlertDescription>{errors.usResidenceTaxPurpose}</AlertDescription>
                        </Alert>
                    )}
                    {
                        formState.usResidenceTaxPurpose == 'other' && <Input
                            id="otherResidenceTaxPurpose"
                            placeholder='Enter Input'
                            value={formState.otherResidenceTaxPurpose}
                            onChange={(e) => handleChange("otherResidenceTaxPurpose", e.target.value)}
                            className="w-full"
                        />
                    }
                </div>
                <div className="mt-2">
                    <div className="flex items-center gap-4">
                        <Label htmlFor="tinNumber" className="text-sm font-bold whitespace-nowrap">
                            If you are a U.S. citizen or permanent resident, or a U.S. resident for tax purposes, please provide your IRS U.S. Tax Identification Number (TIN).
                        </Label>
                        <Input
                            id="tinNumber"
                            placeholder='Enter origin'
                            value={formState.tinNumber}
                            onChange={(e) => handleChange("tinNumber", e.target.value)}
                            className="w-full"
                        />
                    </div>
                </div>
                <div className="mt-2">
                    <Label className="text-sm font-bold whitespace-nowrap">
                        Source: FATF Guidance: Politically Exposed Persons (Rec 12 and 22)
                    </Label>
                    <div className="space-y-1">
                        <p className="text-xs text-gray-700">
                            1. A major political figure in a foreign country is a person who has political or social influence in a foreign country now or in the past. For example, senior managers of administrative, judicial, defense, or other government agencies of foreign governments, senior managers of major foreign political parties, and managers of foreign state-owned enterprises.
                        </p>
                        <p className="text-xs text-gray-700">
                            2. A major political figure in the country is a person who has political or social influence in the country now or in the past. (For example, senior managers of administrative, judicial, defense, and other government agencies in the country, senior managers of major domestic political parties, and managers of foreign state-owned enterprises.)
                        </p>
                        <p className="text-xs text-gray-700">
                            3. A political figure in an international organization is a person who has influence on an international organization, such as a director, bureaucrat or member of the board of directors, senior management, or a person with equivalent authority.
                        </p>
                        <p className="text-xs text-gray-700">
                            4. Political figures in family relations are parents, siblings, spouses, children, blood relatives or relatives by marriage.
                        </p>
                        <p className="text-xs text-gray-700">
                            5. A person with a close relationship is a person who has a close social or business relationship with a major political figure.
                        </p>
                    </div>
                    <Label className="block text-sm font-bold text-gray-700">
                        Are you a prominent political figure described above, or is your immediate family or close acquaintance a prominent political figure, such as a high-ranking government official, political official, government official, or military or international entity official?
                    </Label>

                    <RadioGroup
                        value={formState.isPoliticalFigure}
                        onValueChange={(e) => handleChange("isPoliticalFigure", e)}
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="yes" />
                            <Label className='text-sm font-normal' htmlFor="yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="no" />
                            <Label className='text-sm font-normal' htmlFor="no">No</Label>
                        </div>
                    </RadioGroup>
                </div>
                <div className="mt-2">
                    <div className="flex items-center gap-4">
                        <Label htmlFor="passPortCopy" className="text-sm font-bold flex items-center whitespace-nowrap gap-2">
                            Please upload a copy of your passport.
                            <span className="text-red-500">*</span>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-md text-sm">
                                    You can apply for a passport copy certificate at your local district office. The document title is Certificate of Passport Copy.
                                </TooltipContent>
                            </Tooltip>
                        </Label>
                        {typeof formState.passPortCopy === 'string' && formState.passPortCopy?.split('/')[3] &&
                            <span
                                className={cn("flex h-9 w-1/2 pt-1 cursor-pointer")}
                                onClick={() => {
                                    handleFileClick(formState.passPortCopy);
                                }}
                            >
                                {formState.passPortCopy.split('/')[3]}
                            </span>}
                        <Input
                            id="passPortCopy"
                            type="file"
                            accept=".pdf,.jpg,.png,.jpeg"
                            multiple
                            onChange={(e) => handleChange("passPortCopy", e.target.files?.[0] || '')}
                            className="w-full"
                        />
                    </div>
                    {errors.passPortCopy && (
                        <Alert variant="destructive" className="mt-2">
                            <AlertDescription>{errors.passPortCopy}</AlertDescription>
                        </Alert>
                    )}
                </div>
                <div className="mt-2">
                    <div className="flex items-center gap-4">
                        <Label htmlFor="proofOfAddress" className="text-sm font-bold flex items-center whitespace-nowrap gap-2">
                            Please upload proof of address (English copy or original).
                            <span className="text-red-500">*</span>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-md text-sm">
                                    Please obtain it at a nearby community center, an unmanned issuance machine, or online and submit it.
                                </TooltipContent>
                            </Tooltip>
                        </Label>
                        {typeof formState.proofOfAddress === 'string' && formState.proofOfAddress?.split('/')[3] &&
                            <span
                                className={cn("flex h-9 w-1/2 pt-1 cursor-pointer")}
                                onClick={() => {
                                    handleFileClick(formState.proofOfAddress);
                                }}
                            >
                                {formState.proofOfAddress.split('/')[3]}
                            </span>}
                        <Input
                            id="proofOfAddress"
                            type="file"
                            accept=".pdf,.jpg,.png,.jpeg"
                            multiple
                            onChange={(e) => handleChange("proofOfAddress", e.target.files?.[0] || '')}
                            className="w-full"
                        />
                    </div>
                    {errors.proofOfAddress && (
                        <Alert variant="destructive" className="mt-2">
                            <AlertDescription>{errors.proofOfAddress}</AlertDescription>
                        </Alert>
                    )}
                </div>
                <div className="mt-2">
                    <div className="flex items-center gap-4">
                        <Label htmlFor="driverLicense" className="text-sm font-bold flex items-center whitespace-nowrap gap-2">
                            Please scan and upload the front and back of your driver's license.
                            <span className="text-red-500">*</span>
                        </Label>
                        {typeof formState.driverLicense === 'string' && formState.driverLicense?.split('/')[3] &&
                            <span
                                className={cn("flex h-9 w-1/2 pt-1 cursor-pointer")}
                                onClick={() => {
                                    handleFileClick(formState.driverLicense);
                                }}
                            >
                                {formState.driverLicense.split('/')[3]}
                            </span>}
                        <Input
                            id="driverLicense"
                            type="file"
                            accept=".pdf,.jpg,.png,.jpeg"
                            multiple
                            onChange={(e) => handleChange("driverLicense", e.target.files?.[0] || '')}
                            className="w-full"
                        />
                    </div>
                    {errors.driverLicense && (
                        <Alert variant="destructive" className="mt-2">
                            <AlertDescription>{errors.driverLicense}</AlertDescription>
                        </Alert>
                    )}
                </div>
                <DeclarationForm
                    formState={formState}
                    handleChange={(field: string, value: string) => handleChange(field as keyof typeof formState, value)}
                />
                <div className="space-y-4">
                    <Label className="text-sm font-bold gap-2">
                        You agree to provide documents and information for the Company's business in connection with the Service, and you agree that the purpose of establishing and operating the Company is for the purpose of legitimate and lawful business in relation to the Service. In the operation of a corporation after incorporation, the Company is not obligated to provide assistance or advice on matters that violate the law, and the Company reserves the right to suspend the service if it is determined that there is a violation of the law or an intention to do so. You declare that everything you write in this application is true, complete and accurate to the best of your knowledge. Do you agree with this?
                    </Label>
                    <RadioGroup
                        value={formState.declaration}
                        onValueChange={(value) => handleChange("declaration", value)}
                        className="flex gap-6"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="yes" />
                            <Label htmlFor="yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="no" />
                            <Label htmlFor="no">No</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="other" id="other" />
                            <Label htmlFor="other">Other:</Label>
                        </div>
                    </RadioGroup>
                    {formState.declaration === "other" && (
                        <Input
                            type="text"
                            placeholder="Please specify"
                            value={formState.otherDeclaration}
                            onChange={(e) => handleChange("otherDeclaration", e.target.value)}
                            className="mt-2"
                        />
                    )}

                </div>

                <FileDialog
                    open={openFile}
                    onOpenChange={setOpenFile}
                >
                    <iframe
                        src={fileSource}
                        className="w-full h-full object-contain"
                        title="Receipt"
                    />
                </FileDialog>
                <div className="flex justify-end mt-6">
                    <Button onClick={handleSubmit}>Submit</Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default UsShdr