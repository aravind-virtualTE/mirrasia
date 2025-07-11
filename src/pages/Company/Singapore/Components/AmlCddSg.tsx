import React from 'react'
import { useTheme } from '@/components/theme-provider';
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label';
// import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
// import { HelpCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { sgFormWithResetAtom } from '../SgState';
import { useAtom } from 'jotai';
import { t } from 'i18next';

const AmlCddSg: React.FC = () => {
    const { theme } = useTheme();
    const [formData, setFormData] = useAtom(sgFormWithResetAtom);
    const sgAccountingDeclarationIssues = formData.sgAccountingDeclaration
    const annualRenewalTermsAgreement = formData.annualRenewalTermsAgreement
    const hasLegalEthicalIssues = formData.hasLegalEthicalIssues
    // const offshoreTaxExemptionQuestionIsues = formData.offshoreTaxExemptionQuestion
    // const singaporeTaxFilingMythQuestion = formData.singaporeTaxFilingMythQuestion

    // const sanctionedTiesPresent = formData.sanctionedTiesPresent
    // const restrictedCountriesWithActivity = formData.restrictedCountriesWithActivity
    // const businessInCrimea = formData.businessInCrimea
    // const involvedInRussianEnergyDefense = formData.involvedInRussianEnergyDefense

    // const hasIssues = [
    //     hasLegalEthicalIssues.id,
    //     annualRenewalTermsAgreement.id,
    //     restrictedCountriesWithActivity.id,
    //     sanctionedTiesPresent.id,
    //     businessInCrimea.id,
    //     involvedInRussianEnergyDefense.id
    // ].some(value => (value) != "no");

    const list = [
        { id: "yes", value: "AmlCdd.options.yes" }, { id: "no", value: "AmlCdd.options.no" }, { id: "unknown", value: "AmlCdd.options.unknown" }, { id: "heading", value: "SwitchService.Consultation.heading" }
    ]
    const establishList = [
        { "id": "yes", "value": "AmlCdd.options.yes" },
        { "id": "no", "value": "AmlCdd.options.no" },
        { "id": "handleOwnIncorpo", "value": "usa.AppInfo.handleOwnIncorpo" },
        { "id": "didntIntedEveryYear", "value": "usa.AppInfo.didntIntedEveryYear" },
        { "id": "consultationRequired", "value": "usa.AppInfo.consultationRequired" }
    ]

    // const applyTaxList = [
    //     { "id": "yes", "value": "Yes (Able to bear the fees accompanying offshore income claims and handling the inquiry letters from the IRD)" },
    //     { "id": "no", "value": "No (I/We can handle on our own after incorporation)" },
    //     { "id": "selfAfterIncorporation", "value": "In-house self-solving after incorporation" },
    //     { "id": "consultationRequired", "value": "Consultation required before proceeding" },
    // ]
    // const payTaxesList = [
    //     { "id": "yes", "value": "Yes" },
    //     { "id": "no", "value": "No" },
    //     { "id": "dontKnow", "value": "I/We can handle on our own after incorporation" },
    //     { "id": "considerLegalHelp", "value": "I/We have heard about this but I/we have no such a plan to do it." },
    //     { "id": "consultationRequired", "value": "Consultation required before proceeding" },
    //     // { "id": "other", "label": "Other", isOther: true }
    // ]
    const questions = [
        {
            id: "restrictedCountriesWithActivity",
            value: "Does the Singapore company, to the best of your knowledge, have any current or planned business activity in the following countries/regions (Iran, Sudan, North Korea, Syria, Cuba, South Sudan, Belarus or Zimbabwe)?",
        },
        {
            id: "sanctionedTiesPresent",
            value: "To the best of your knowledge, does the Singapore company or any of the company’s connected or other related parties have a presence in Iran, Sudan, North Korea, Syria or Cuba, and/or are currently targeted by the following bodies: UN, EU, UKHMT, HKMA, OFAC, as part of local sanctions law?",
        },
        {
            id: "businessInCrimea",
            value: "To the best of your knowledge, does the Singapore company have any current or planned business activities connected or other related parties in Crimea/Sevastopol Regions?*",
        },
        {
            id: "involvedInRussianEnergyDefense",
            value: "To the best of your knowledge, does the Singapore company have any current or planned exposure to Russia in the energy (oil/gas) sector, the military, or defense?",
        },
    ];

    const handleAnswerChange = (question: string, value: string) => {
        console.log("question", question, '/n value', value)
        const selectedItem = list.find(item => t(item.value) == t(value));
        let udpateField = ''
        if (question === "restrictedCountriesWithActivity") {
            udpateField = 'restrictedCountriesWithActivity';
        }
        else if (question === "sanctionedTiesPresent") {
            udpateField = 'sanctionedTiesPresent';
        }
        else if (question === "businessInCrimea") {
            udpateField = 'businessInCrimea';
        }
        else if (question === "involvedInRussianEnergyDefense") {
            udpateField = 'involvedInRussianEnergyDefense';
        }

        setFormData({ ...formData, [udpateField]: selectedItem || { id: '', value: "" } })
    };

    const handleQuestionChange = (value: string) => {
        const selectedItem = list.find(item => t(item.value) == t(value));
        setFormData({
            ...formData,
            hasLegalEthicalIssues: selectedItem || { id: '', value: "" }
        })
    };

    const handleQuestion2Change = (value: string) => {
        const selectedItem = establishList.find(item => t(item.value) == t(value));
        setFormData({ ...formData, annualRenewalTermsAgreement: selectedItem || { id: '', value: "" } })
    };

    const handleAccountingDecChange = (value: string) => {
        const selectedItem = list.find(item => t(item.value) == t(value));
        setFormData({
            ...formData,
            sgAccountingDeclaration: selectedItem || { id: '', value: "" }
        })
    };

    // const handleOffShoreChange = (value: string) => {
    //     const selectedItem = applyTaxList.find(item => t(item.value) == t(value));
    //     setFormData({
    //         ...formData,
    //         offshoreTaxExemptionQuestion: selectedItem || { id: '', value: "" }
    //     })
    // };

    // const handleCompAcquitanceChange = (value: string) => {
    //     const selectedItem = payTaxesList.find(item => t(item.value) == t(value));
    //     setFormData({ ...formData, singaporeTaxFilingMythQuestion:  selectedItem || {id: '', value : ""}  })
    // };
    console.log("value", formData)
    return (
        <Card>
            <CardContent>
                <div className='flex w-full p-4'>
                    <aside
                        className={`w-1/5 p-4 rounded-md shadow-sm ${theme === "light"
                            ? "bg-blue-50 text-gray-800"
                            : "bg-gray-800 text-gray-200"
                            }`}
                    >
                        <h2 className="text-lg font-semibold mb-2">
                            Confirmation of client's business intention
                        </h2>
                        <p className="text-sm text-gray-600">This section is intended to reduce misunderstandings between each other in the future by identifying the client's business intentions and checking in advance whether they match the services we provide. Please answer the questions accurately and we will offer our services accordingly.</p>
                    </aside>
                    <div className="w-4/5 ml-4">
                        <div className="space-y-2 pb-2">
                            <Label htmlFor="Relation" className="text-sm font-semibold mb-2">
                                Does the purpose of incorporating a Singapore company raise legal or ethical issues such as money laundering, gambling, tax evasion, asset concealment, evasion of the law for illegal business, fraud, etc.?<span className="text-red-500">*</span>
                            </Label>
                            <RadioGroup
                                value={t(hasLegalEthicalIssues.value || '')}
                                onValueChange={(value) => handleQuestionChange(value)}
                                disabled={formData.isDisabled}
                            >
                                {
                                    list.map((item, idx) => {
                                        return (
                                            <div className="flex items-center space-x-2" key={`alt${idx}`}>
                                                <RadioGroupItem value={t(item.value)} id={`legal1234-${item.id}`} />
                                                <Label htmlFor={`legal1234-${item}`} className="text-sm font-normal">
                                                    {t(item.value)}
                                                </Label>
                                            </div>
                                        )
                                    })
                                }
                            </RadioGroup>
                        </div>
                        <div className="space-y-2 pb-2">
                            <Label htmlFor="Relation" className="text-sm font-semibold mb-2">
                                After the incorporation of a Singapore corporation, there will be tasks such as annual renewal, secretary service renewal, business renewal, accounting/taxation, etc., and all of these tasks entail related costs and obligations to provide information. Do you agree to this?<span className="text-red-500">*</span>
                            </Label>
                            <RadioGroup
                                value={t(annualRenewalTermsAgreement.value || '')}
                                onValueChange={(value) => handleQuestion2Change(value)}
                                disabled={formData.isDisabled}
                            >
                                {
                                    establishList.map((item, idx) => {
                                        return (
                                            <div className="flex items-center space-x-2" key={`use${idx}`}>
                                                <RadioGroupItem value={t(item.value)} id={`legal123-${item.id}`} />
                                                <Label htmlFor={`legal123-${item.id}`} className="text-sm font-normal">
                                                    {t(item.value)}
                                                </Label>
                                            </div>
                                        )
                                    })
                                }
                            </RadioGroup>
                        </div>
                        <div className="space-y-2 pb-2">
                            <Label htmlFor="Relation" className="text-sm font-semibold mb-2">
                                When conducting accounting/tax affairs for a Singapore corporation, you must submit all bank transaction statements, purchase data, sales data, expenditure evidence, and salary payment evidence for the accounting period without any falsification or distortion. We cannot process these documents arbitrarily or falsily. Do you agree to this?<span className="text-red-500">*</span>
                            </Label>
                            <RadioGroup
                                value={t(sgAccountingDeclarationIssues.value || '')}
                                onValueChange={(value) => handleAccountingDecChange(value)}
                                disabled={formData.isDisabled}
                            >
                                {
                                    list.map((item, idx) => {
                                        return (
                                            <div className="flex items-center space-x-2" key={`alt${idx}`}>
                                                <RadioGroupItem value={t(item.value)} id={`legal1234-${item.id}`} />
                                                <Label htmlFor={`legal1234-${item}`} className="text-sm font-normal">
                                                    {t(item.value)}
                                                </Label>
                                            </div>
                                        )
                                    })
                                }
                            </RadioGroup>
                        </div>
                        {/* <div className="space-y-2">
                            <Label htmlFor="Relation" className="text-sm font-semibold mb-2">
                                Are you planning to apply for tax exemption through an offshore income claim after incorporating a Singapore company?<span className="text-red-500 inline-flex">*
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[500px] text-base">
                                            Singapore maintains a tax-free policy for income generated outside of Singapore, as it applies the principle of landlords in its tax policy. However, corporate tax and transaction tax may be levied in the country where the business is actually performed in this regard, and if an offshore income claim is filed for tax exemption in Singapore, the increase in accounting audit cost and from the IRAS(Inland Revenue Authority of Singapore). It can take a significant amount of time and money to process your inquiry letter. Therefore, if you have a plan to report offshore income, please take this into account and prepare.
                                        </TooltipContent>
                                    </Tooltip>
                                </span>
                            </Label>
                            <RadioGroup
                                value={t(offshoreTaxExemptionQuestionIsues.value || '')}
                                onValueChange={(value) => handleOffShoreChange(value)}
                                disabled={formData.isDisabled}
                            >
                                {
                                    applyTaxList.map((item, idx) => {
                                        return (
                                            <div className="flex items-center space-x-2" key={`alt${idx}`}>
                                                <RadioGroupItem value={t(item.value)} id={`legal1234-${item.id}`} />
                                                <Label htmlFor={`legal1234-${item}`} className="text-sm font-normal">
                                                    {t(item.value)}
                                                </Label>
                                            </div>
                                        )
                                    })
                                }
                            </RadioGroup>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="Relation" className="text-sm font-semibold mb-2">
                                Your company has heard from your acquaintances that Singapore company may all write "0" (false) in their tax returns, and Singapore company do not have to pay taxes. Do you have any plans?<span className="text-red-500 inline-flex">*
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[500px] text-base">
                                            Many unethical companies have suggested this way to their clients in the past in order to evade tax, and we experienced that some potential clients, who were not our clients but willing to use our services, didn't properly report the tax return because they submitted the tax return which was falsely written, and we had difficulty to provide our services to them. Recently, banks and financial institutions may also suspend services for this type of company in order to prevent illegal tax evasion, money laundering and counter-terrorist financing. Therefore, if you have a plan to evade tax in this or similar way, please note that we will have difficulty to provide our services.
                                        </TooltipContent>
                                    </Tooltip>
                                </span>
                            </Label>
                            <RadioGroup
                                value={t(singaporeTaxFilingMythQuestion.value || '')}
                                onValueChange={(value) => handleCompAcquitanceChange(value)}
                                disabled={formData.isDisabled}
                            >
                                {
                                    payTaxesList.map((item, idx) => {
                                        return (
                                            <div className="flex items-center space-x-2" key={`use${idx}`}>
                                                <RadioGroupItem value={t(item.value)} id={`legal123-${item.id}`} />
                                                <Label htmlFor={`legal123-${item.id}`} className="text-sm font-normal">
                                                    {t(item.value)}
                                                </Label>
                                            </div>
                                        )
                                    })
                                }
                            </RadioGroup>                            
                        </div> */}
                    </div>
                </div>
                <div className='flex w-full p-4'>
                    <aside
                        className={`w-1/5 p-4 rounded-md shadow-sm ${theme === "light"
                            ? "bg-blue-50 text-gray-800"
                            : "bg-gray-800 text-gray-200"
                            }`}
                    >
                        <h2 className="text-lg font-semibold mb-2">
                            Transaction sanctions
                        </h2>
                        <p className="text-sm text-gray-600">This section is whether your business has transactions with the country(s) subject to sanctions regulated or recommended by FATF, UNGC, OFAC, etc. Please answer questions without distortions or errors.</p>
                    </aside>
                    <div className="w-4/5 ml-4">
                        {questions.map((question) => (
                            <div className="space-y-2 pb-2" key={question.id} >
                                {/* Question Text */}
                                <p className="text-sm font-medium text-gray-800 mb-3">
                                    {question.value} <span className="text-red-500">*</span>
                                </p>
                                <RadioGroup
                                    value={ t(formData[question.id]?.value || '')}
                                    onValueChange={(value) => handleAnswerChange(question.id, value)}
                                    className="space-y-2"
                                >
                                    {list.map((item, idx) => (
                                        <div className="flex items-center space-x-2" key={`alt${idx}`}>
                                            <RadioGroupItem value={t(item.value)} id={`legal1234-${item.id}`} />
                                            <Label htmlFor={`legal1234-${item.id}`} className="text-sm font-normal">
                                                {t(item.value)}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>

    )
}

export default AmlCddSg