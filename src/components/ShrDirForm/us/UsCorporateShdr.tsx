/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { t } from 'i18next'
import React, { useEffect } from 'react'
import { investmentOptionsMap, relationMap, sourceFundMap, usEgnArticleOptions, usResidencyOptions, usShrDirEngOptions } from '../ShrDirConstants'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { getUsIndividualShrDirRegData, usCorporateShareholderData } from '@/services/dataFetch'
import { useNavigate, useParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { multiShrDirResetAtom } from '@/components/shareholderDirector/constants'

const UsCorporateShdr: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formState, setFormState] = React.useState({
        companyName: '',
        dateOfEstablishment: '',
        countryOfEstablishment: '',
        listedOnStockExchange: '',
        otherListedOnStockExchange: '',
        representativeName: '',
        englishNamesOfShareholders: '',
        otherEnglishNamesOfShareholders: '',
        articlesOfAssociation: '',
        otherArticlesOfAssociation: '',
        businessAddress: '',
        email: '',
        kakaoTalkId: '',
        socialMediaId: '',
        relationWithUs: [] as string[],
        otherRelation: '',
        amountInvestedAndShares: '',
        investmentSource: [] as string[],
        fundsOrigin: '',
        sourceFundExpected: [] as string[],
        otherSourceFund: '',
        fundsOrigin2: '',
        isUsLegalEntity: '',
        usTinNumber: '',
        isPoliticalFigure: '',
        describePoliticallyImp: "",
        isArrestedBefore: '',
        isInvestigatedBefore: "",
        isInvolvedInCriminal: "",
        gotBankruptBefore: '',
        officerBankruptBefore: '',
        declarationDesc: "",
        isAgreed: "",
        otherIsAgreed: '',
    })
    const [errors, setErrors] = React.useState({
        companyName: '',
        dateOfEstablishment: '',
        countryOfEstablishment: '',
        listedOnStockExchange: '',
        representativeName: '',
        englishNamesOfShareholders: '',
        articlesOfAssociation: '',
        email: "",
        relationWithUs: '',
        amountInvestedAndShares: '',
        fundsOrigin: '',
        sourceFundExpected: "",
        fundsOrigin2: '',
        isUsLegalEntity: '',
        isPoliticalFigure: '',
        isArrestedBefore: '',
        isInvestigatedBefore: '',
        isInvolvedInCriminal: "",
        gotBankruptBefore: '',
        officerBankruptBefore: '',
        isAgreed: '',
    })
    const [multiData,] = useAtom<any>(multiShrDirResetAtom)

    const handleChange = <T extends keyof typeof formState>(
        field: T,
        value: typeof formState[T]
    ) => {
        setFormState((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    useEffect(() => {
        if (id) {
            console.log('id--->', id)
            async function fetchData(id: string) {
                const data = await getUsIndividualShrDirRegData(id, "corporate");
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
    
    const handleSubmit = async () => {
        const newErrors: typeof errors = {
            companyName: formState.companyName ? '' : 'Company name is required',
            dateOfEstablishment: formState.dateOfEstablishment ? '' : 'Date of establishment is required',
            countryOfEstablishment: formState.countryOfEstablishment ? '' : 'Country of establishment is required',
            listedOnStockExchange: formState.listedOnStockExchange ? '' : 'This field is required',
            representativeName: formState.representativeName ? '' : 'Representative name is required',
            englishNamesOfShareholders: formState.englishNamesOfShareholders ? '' : 'Shareholder names are required',
            articlesOfAssociation: formState.articlesOfAssociation ? '' : 'This field is required',
            email: formState.email ? '' : 'Email is required',
            relationWithUs: formState.relationWithUs.length > 0 ? '' : 'Relation with us is required',
            amountInvestedAndShares: formState.amountInvestedAndShares ? '' : 'Amount invested is required',
            fundsOrigin: formState.fundsOrigin ? '' : 'Fund origin is required',
            sourceFundExpected: formState.sourceFundExpected.length > 0 ? '' : 'Expected source of fund is required',
            fundsOrigin2: formState.fundsOrigin2 ? '' : 'This field is required',
            isUsLegalEntity: formState.isUsLegalEntity ? '' : 'This field is required',
            isPoliticalFigure: formState.isPoliticalFigure ? '' : 'This field is required',
            isArrestedBefore: formState.isArrestedBefore ? '' : 'This field is required',
            isInvestigatedBefore: formState.isInvestigatedBefore ? '' : 'This field is required',
            isInvolvedInCriminal: formState.isInvolvedInCriminal ? '' : 'This field is required',
            gotBankruptBefore: formState.gotBankruptBefore ? '' : 'This field is required',
            officerBankruptBefore: formState.officerBankruptBefore ? '' : 'This field is required',
            isAgreed: formState.isAgreed ? '' : 'You must agree to proceed',
        };
        const hasErrors = Object.values(newErrors).some((error) => error !== '');

        if (hasErrors) {
            setErrors(newErrors);
            console.log('Fail');
        } else {
            console.log('Form submitted with state:', formState);
            const result = await usCorporateShareholderData(formState, id);
            console.log('Success', result);
            // initiate your API call here
            navigate("/dashboard")
        }
    };

    return (
        
        <Card>
            <CardHeader>
                <CardTitle>
                    Application for registration of U.S. company members
                </CardTitle>
            </CardHeader>
            <>
                <p className="text-sm text-gray-500">
                    This application form is written in the form of a questionnaire about the information absolutely necessary to proceed with the registration of a member of a U.S. company. The representative of the corporation that is the member should complete this application form.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                    This application form and the application form documents that you will sign later will be kept by our company as legal procedures for performing KYC (Know Your Customer) and Client's Due Diligence (due diligence and verification of customers) in accordance with the TCSP license and AMLO (Anti-Money Laundering and Counter-Terrorism Financing Act) and as future legal records (Statutory Documents). Therefore, please be careful to avoid any distortion or errors in the content you write.
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
                    <Label htmlFor="repName" className="text-sm font-bold whitespace-nowrap">
                        Representive Name<span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="repName"
                        placeholder="Enter representative name"
                        value={formState.representativeName}
                        onChange={(e) => handleChange("representativeName", e.target.value)}
                        className={`flex-1 ${errors.representativeName ? "border-red-500" : ""}`}
                    />
                </div>
                {errors.representativeName && (
                    <Alert variant="destructive" className="mt-2">
                        <AlertDescription>{errors.representativeName}</AlertDescription>
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
                    <Label htmlFor="dateOfEstablishment" className="text-sm font-bold flex-shrink-0">
                        Date of Establishment<span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="dateOfEstablishment"
                        type='date'
                        placeholder="Enter dateOfEstablishment"
                        value={formState.dateOfEstablishment}
                        onChange={(e) => handleChange("dateOfEstablishment", e.target.value)}
                        className={`flex-grow ${errors.dateOfEstablishment ? "border-red-500" : ""}`}
                    />
                </div>
                {errors.dateOfEstablishment && (
                    <Alert variant="destructive" className="mt-2">
                        <AlertDescription>{errors.dateOfEstablishment}</AlertDescription>
                    </Alert>
                )}
            </div>
            <div className="mt-2">
                <div className="flex items-center gap-4">
                    <Label htmlFor="countryOfEstablishment" className="text-sm font-bold whitespace-nowrap">
                        Country of Establishment <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="countryOfEstablishment"
                        placeholder="Enter country of establishment"
                        value={formState.countryOfEstablishment}
                        onChange={(e) => handleChange("countryOfEstablishment", e.target.value)}
                        className={`flex-1 ${errors.countryOfEstablishment ? "border-red-500" : ""}`}
                    />
                </div>
                {errors.countryOfEstablishment && (
                    <Alert variant="destructive" className="mt-2">
                        <AlertDescription>{errors.countryOfEstablishment}</AlertDescription>
                    </Alert>
                )}
            </div>
            <div className="mt-2">
                <Label className="text-sm font-bold">
                    Whether listed on a stock exchange?
                    <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                    className="mt-4 "
                    value={formState.listedOnStockExchange}
                    onValueChange={(value) => handleChange("listedOnStockExchange", value)}
                >
                    {usResidencyOptions.map((option, idx) => (
                        <div key={`${option.key}-${idx}`} className="flex items-center space-x-2">
                            <RadioGroupItem id={option.key} value={option.key} />
                            <Label htmlFor={option.key} className="text-sm font-normal">
                                {t(option.value)}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
                {errors.listedOnStockExchange && (
                    <Alert variant="destructive" className="mt-2">
                        <AlertDescription>{errors.listedOnStockExchange}</AlertDescription>
                    </Alert>
                )}
                {
                    formState.listedOnStockExchange == 'other' && <Input
                        id="otherListedOnStockExchange"
                        placeholder='Enter Input'
                        value={formState.otherListedOnStockExchange}
                        onChange={(e) => handleChange("otherListedOnStockExchange", e.target.value)}
                        className="w-full"
                    />
                }
            </div>
            <div className="mt-2">
                <Label className="text-sm font-bold">
                    Documents on the English names of shareholders/directors and the status of their stock holdings
                    <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                    className="mt-4 "
                    value={formState.englishNamesOfShareholders}
                    onValueChange={(value) => handleChange("englishNamesOfShareholders", value)}
                >
                    {usShrDirEngOptions.map((option) => (
                        <div key={option.key} className="flex items-center space-x-2">
                            <RadioGroupItem id={option.key} value={option.key} />
                            <Label htmlFor={option.key} className="text-sm font-normal">
                                {t(option.value)}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
                {errors.englishNamesOfShareholders && (
                    <Alert variant="destructive" className="mt-2">
                        <AlertDescription>{errors.englishNamesOfShareholders}</AlertDescription>
                    </Alert>
                )}
                {
                    formState.englishNamesOfShareholders == 'other' && <Input
                        id="otherEnglishNamesOfShareholders"
                        placeholder='Enter Input'
                        value={formState.otherEnglishNamesOfShareholders}
                        onChange={(e) => handleChange("otherEnglishNamesOfShareholders", e.target.value)}
                        className="w-full"
                    />
                }
            </div>
            <div className="mt-2">
                <Label className="text-sm font-bold">
                    English Articles of Association
                    <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                    className="mt-4 "
                    value={formState.articlesOfAssociation}
                    onValueChange={(value) => handleChange("articlesOfAssociation", value)}
                >
                    {usEgnArticleOptions.map((option) => (
                        <div key={option.key} className="flex items-center space-x-2">
                            <RadioGroupItem id={option.key} value={option.key} />
                            <Label htmlFor={option.key} className="text-sm font-normal">
                                {t(option.value)}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
                {errors.articlesOfAssociation && (
                    <Alert variant="destructive" className="mt-2">
                        <AlertDescription>{errors.articlesOfAssociation}</AlertDescription>
                    </Alert>
                )}
                {
                    formState.articlesOfAssociation == 'other' && <Input
                        id="otherArticlesOfAssociation"
                        placeholder='Enter Input'
                        value={formState.otherArticlesOfAssociation}
                        onChange={(e) => handleChange("otherArticlesOfAssociation", e.target.value)}
                        className="w-full"
                    />
                }
            </div>
            <div className="mt-2">
                <div className="flex items-center gap-4">
                    <Label htmlFor="businessAddress" className="text-sm font-bold whitespace-nowrap">
                        Business address
                    </Label>
                    <Input
                        id="businessAddress"
                        placeholder="Enter Business address"
                        value={formState.businessAddress}
                        onChange={(e) => handleChange("businessAddress", e.target.value)}
                        className={`flex-1`}
                    />
                </div>
            </div>
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
                    <Label htmlFor="kakaoTalkId" className="text-sm font-bold flex-shrink-0">
                        KakaoTalk ID (if available)
                    </Label>
                    <Input
                        id="kakaoTalkId"
                        placeholder="Enter KakaoTalk ID"
                        value={formState.kakaoTalkId}
                        onChange={(e) => handleChange("kakaoTalkId", e.target.value)}
                        className={`flex-grow`}
                    />
                </div>
            </div>
            <div className="mt-2">
                <div className="flex items-center gap-4">
                    <Label htmlFor="socialMediaId" className="text-sm font-bold flex-shrink-0">
                        Telegram, WeChat, or other SNS ID (if available)
                    </Label>
                    <Input
                        id="socialMediaId"
                        placeholder="Enter ID"
                        value={formState.socialMediaId}
                        onChange={(e) => handleChange("socialMediaId", e.target.value)}
                        className={`flex-grow`}
                    />
                </div>
            </div>
            <div className="mt-2">
                <Label className="text-sm font-bold flex items-center gap-2">
                    Relations with American companies
                    <span className="text-red-500">*</span>
                </Label>
                <div className="mt-4 space-y-2">
                    {relationMap.map(({ key, value }) => (
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
                    <Label htmlFor="amountInvestedAndShares" className="text-sm font-bold flex-shrink-0">
                        Amount to be invested in a U.S. company and number of shares to be acquired
                        <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="amountInvestedAndShares"
                        placeholder="Enter Details"
                        value={formState.amountInvestedAndShares}
                        onChange={(e) => handleChange("amountInvestedAndShares", e.target.value)}
                        className={`flex-grow`}
                    />
                    {errors.amountInvestedAndShares && (
                        <Alert variant="destructive" className="mt-2">
                            <AlertDescription>{errors.amountInvestedAndShares}</AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>
            <div className="mt-2">
                <Label className="text-sm font-bold flex items-center gap-2">
                    Source of investment funds (multiple selections possible)
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
                    {investmentOptionsMap.map(({ key, value }) => (
                        <div key={key} className="flex items-center space-x-2">
                            <Checkbox
                                id={key}
                                checked={formState.investmentSource.includes(key)}
                                onCheckedChange={(checked) =>
                                    handleChange(
                                        "investmentSource",
                                        checked
                                            ? [...formState.investmentSource, key]
                                            : formState.investmentSource.filter((r) => r !== key)
                                    )
                                }
                            />
                            <Label htmlFor={key} className="text-sm font-normal">
                                {t(value)}
                            </Label>
                        </div>
                    ))}
                </div>
                {formState.investmentSource.includes('other') &&
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
                    <Label htmlFor="fundsOrigin" className="text-sm font-bold flex-shrink-0">
                        Country of origin of funds for the above items (list all relevant countries)
                        <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="fundsOrigin"
                        placeholder="Enter Details"
                        value={formState.fundsOrigin}
                        onChange={(e) => handleChange("fundsOrigin", e.target.value)}
                        className={`flex-grow`}
                    />
                    {errors.fundsOrigin && (
                        <Alert variant="destructive" className="mt-2">
                            <AlertDescription>{errors.fundsOrigin}</AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>
            <div className="mt-2">
                <Label className="text-sm font-bold flex items-center gap-2">
                    Sources of funds expected to be generated or received by U.S. companies in the future (multiple selections allowed)
                    <span className="text-red-500">*</span>
                </Label>
                <div className="mt-4 space-y-2">
                    {sourceFundMap.map(({ key, value }) => (
                        <div key={key} className="flex items-center space-x-2">
                            <Checkbox
                                id={key}
                                checked={formState.sourceFundExpected.includes(key)}
                                onCheckedChange={(checked) =>
                                    handleChange(
                                        "sourceFundExpected",
                                        checked
                                            ? [...formState.sourceFundExpected, key]
                                            : formState.sourceFundExpected.filter((r) => r !== key)
                                    )
                                }
                            />
                            <Label htmlFor={key} className="text-sm font-normal">
                                {t(value)}
                            </Label>
                        </div>
                    ))}
                </div>
                {formState.sourceFundExpected.includes('other') &&
                    <Input id="otherSourceFund"
                        placeholder="Enter Other Relation"
                        value={formState.otherSourceFund}
                        onChange={(e) => handleChange("otherSourceFund", e.target.value)} />}
                {errors.sourceFundExpected && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertDescription>{errors.sourceFundExpected}</AlertDescription>
                    </Alert>
                )}
            </div>
            <div className="mt-2">
                <div className="flex items-center gap-4">
                    <Label htmlFor="fundsOrigin2" className="text-sm font-bold flex-shrink-0">
                        Country of origin of funds for the above items (list all relevant countries)
                        <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="fundsOrigin2"
                        placeholder="Enter Details"
                        value={formState.fundsOrigin2}
                        onChange={(e) => handleChange("fundsOrigin2", e.target.value)}
                        className={`flex-grow`}
                    />
                    {errors.fundsOrigin2 && (
                        <Alert variant="destructive" className="mt-2">
                            <AlertDescription>{errors.fundsOrigin2}</AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>
            <div className="mt-2">
                <Label className="text-sm font-bold">
                    Is your company a legal entity under U.S. jurisdiction or a permanent establishment under U.S. tax law?
                    <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                    className="mt-4 "
                    value={formState.isUsLegalEntity}
                    onValueChange={(value) => handleChange("isUsLegalEntity", value)}
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
                {errors.isUsLegalEntity && (
                    <Alert variant="destructive" className="mt-2">
                        <AlertDescription>{errors.isUsLegalEntity}</AlertDescription>
                    </Alert>
                )}
                {
                    formState.isUsLegalEntity == 'other' && <Input
                        id="otherListedOnStockExchange"
                        placeholder='Enter Input'
                        value={formState.otherListedOnStockExchange}
                        onChange={(e) => handleChange("otherListedOnStockExchange", e.target.value)}
                        className="w-full"
                    />
                }
            </div>
            <div className="mt-2">
                <div className="flex items-center gap-4">
                    <Label htmlFor="usTinNumber" className="text-sm font-bold flex-shrink-0">
                        If you are under U.S. jurisdiction for legal purposes or have a U.S. permanent establishment for tax purposes, please provide your IRS U.S. Tax Identification Number (TIN).
                    </Label>
                    <Input
                        id="usTinNumber"
                        placeholder="Enter Details"
                        value={formState.usTinNumber}
                        onChange={(e) => handleChange("usTinNumber", e.target.value)}
                        className={`flex-grow`}
                    />
                </div>
            </div>
            <div className="mt-2">
                <Label className="text-sm font-bold whitespace-nowrap">
                    Politically Exposed Person (Source: FATF Guidance: Politically Exposed Persons (Rec 12 and 22))
                </Label>
                <div className="space-y-1">
                    <p className="text-xs text-gray-700">
                        1. A foreign politically exposed person means a person who currently or has had political or social influence in a foreign country. For example, a senior official of a foreign government’s executive, judicial, defense, or other government agencies, a senior official of a major foreign political party, or a manager of a foreign state-owned enterprise.
                    </p>
                    <p className="text-xs text-gray-700">
                        2. A domestic politically exposed person means a person currently or has had political or social influence in a domestic country. (For example, a senior official of a domestic government’s executive, judicial, defense, or other government agencies, a senior official of a major domestic political party, or a manager of a foreign state-owned enterprise.)
                    </p>
                    <p className="text-xs text-gray-700">
                        3. A politically exposed person of an international organization means a person who has influence in an international organization, for example, a director, officer, member of the board of directors, senior management, or a person with equivalent authority.
                    </p>
                    <p className="text-xs text-gray-700">
                        4. A politically exposed person in a family relationship means a parent, sibling, spouse, child, or relative by blood or marriage.
                    </p>
                    <p className="text-xs text-gray-700">
                        5. A close politically important person refers to a person who has a close social or business relationship with a politically important person.
                    </p>
                </div>
                <Label className="block text-sm font-bold text-gray-700">
                    Do any of your company's employees fall into the above category as a politically important figure, or do you have an immediate family member or close acquaintance who holds a high-ranking public office, is in politics, is a government official, or is he or she a member of the military or an international organization?
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
                {errors.isPoliticalFigure && (
                    <Alert variant="destructive" className="mt-2">
                        <AlertDescription>{errors.isPoliticalFigure}</AlertDescription>
                    </Alert>
                )}
            </div>
            <div className="mt-2">
                <div className="flex items-center gap-4">
                    <Label htmlFor="describePoliticallyImp" className="text-sm font-bold flex-shrink-0">
                        Please describe in detail whether you are a politically important figure or your relationship with such a person.
                    </Label>
                    <Input
                        id="describePoliticallyImp"
                        placeholder="Enter Details"
                        value={formState.describePoliticallyImp}
                        onChange={(e) => handleChange("describePoliticallyImp", e.target.value)}
                        className={`flex-grow`}
                    />
                </div>
            </div>
            <div className="mt-2">
                <Label className="block text-sm font-bold text-gray-700">
                    Has anyone from your company ever been arrested or convicted of a crime against the law?
                </Label>
                <RadioGroup
                    value={formState.isArrestedBefore}
                    onValueChange={(e) => handleChange("isArrestedBefore", e)}
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
                {errors.isArrestedBefore && (
                    <Alert variant="destructive" className="mt-2">
                        <AlertDescription>{errors.isArrestedBefore}</AlertDescription>
                    </Alert>
                )}
            </div>
            <div className="mt-2">
                <Label className="block text-sm font-bold text-gray-700">
                    Has anyone from your company ever been investigated by law enforcement agencies (police, prosecutors) or tax authorities?
                </Label>
                <RadioGroup
                    value={formState.isInvestigatedBefore}
                    onValueChange={(e) => handleChange("isInvestigatedBefore", e)}
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
                {errors.isInvestigatedBefore && (
                    <Alert variant="destructive" className="mt-2">
                        <AlertDescription>{errors.isInvestigatedBefore}</AlertDescription>
                    </Alert>
                )}
            </div>
            <div className="mt-2">
                <Label className="block text-sm font-bold text-gray-700">
                    Are any of your company's officials involved in criminal, money laundering, bribery or terrorist activities, or in any other illegal activities involving business or personal funds?
                </Label>
                <RadioGroup
                    value={formState.isInvolvedInCriminal}
                    onValueChange={(e) => handleChange("isInvolvedInCriminal", e)}
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
                {errors.isInvolvedInCriminal && (
                    <Alert variant="destructive" className="mt-2">
                        <AlertDescription>{errors.isInvolvedInCriminal}</AlertDescription>
                    </Alert>
                )}
            </div>
            <div className="mt-2">
                <Label className="block text-sm font-bold text-gray-700">
                    Has anyone from your company ever been personally involved in/involved in a bankruptcy or liquidation?
                </Label>
                <RadioGroup
                    value={formState.gotBankruptBefore}
                    onValueChange={(e) => handleChange("gotBankruptBefore", e)}
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
                {errors.gotBankruptBefore && (
                    <Alert variant="destructive" className="mt-2">
                        <AlertDescription>{errors.gotBankruptBefore}</AlertDescription>
                    </Alert>
                )}
            </div>
            <div className="mt-2">
                <Label className="block text-sm font-bold text-gray-700">
                    Has anyone from your company ever been involved in/involved in bankruptcy or liquidation as an officer of the company?
                </Label>
                <RadioGroup
                    value={formState.officerBankruptBefore}
                    onValueChange={(e) => handleChange("officerBankruptBefore", e)}
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
                {errors.officerBankruptBefore && (
                    <Alert variant="destructive" className="mt-2">
                        <AlertDescription>{errors.officerBankruptBefore}</AlertDescription>
                    </Alert>
                )}
            </div>
            <div className="mt-2">
                <div className="flex items-center gap-4">
                    <Label htmlFor="declarationDesc" className="text-sm font-bold whitespace-nowrap">
                        If you selected "Yes" to any of the Declaration sections, please provide specific details.
                    </Label>
                    <Input
                        id="declarationDesc"
                        placeholder="Enter Details"
                        value={formState.declarationDesc}
                        onChange={(e) => handleChange("declarationDesc", e.target.value)}
                        className={`flex-1`}
                    />
                </div>
            </div>
            <div className="mt-2">
                <Label className="text-sm font-bold">
                    You agree to provide us with documents and information for our business operations in relation to this service, and you agree that the purpose of establishing and operating the company is legitimate and for legal business. After the incorporation, we have no obligation to provide assistance or advice on matters that violate the law, and if we determine that there are any matters or intentions that violate the law, we have the right to discontinue the service. You declare that all information provided in this application is true, complete, and accurate to the best of your knowledge. Do you agree to this?
                    <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                    className="mt-4 "
                    value={formState.isAgreed}
                    onValueChange={(value) => handleChange("isAgreed", value)}
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
                {errors.isAgreed && (
                    <Alert variant="destructive" className="mt-2">
                        <AlertDescription>{errors.isAgreed}</AlertDescription>
                    </Alert>
                )}
                {
                    formState.isAgreed == 'other' && <Input
                        id="otherIsAgreed"
                        placeholder='Enter Input'
                        value={formState.otherIsAgreed}
                        onChange={(e) => handleChange("otherIsAgreed", e.target.value)}
                        className="w-full"
                    />
                }
            </div>
            <div className="flex justify-end mt-6">
                <Button onClick={handleSubmit}>Submit</Button>
            </div>
        </Card>
    )
}

export default UsCorporateShdr