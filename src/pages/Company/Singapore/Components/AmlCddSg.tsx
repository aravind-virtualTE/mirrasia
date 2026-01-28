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

const AmlCddSg: React.FC<{canEdit: boolean}> = ({ canEdit }) => {
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
            value: "Singapore.singFollowingCompaniesActivity",
        },
        {
            id: "sanctionedTiesPresent",
            value: "Singapore.SgIsConnectedIranSudanetc",
        },
        {
            id: "businessInCrimea",
            value: "Singapore.SgCrimeaSevastapl",
        },
        {
            id: "involvedInRussianEnergyDefense",
            value:"Singapore.sgRussiaEnergy",
        },
    ];

    const handleAnswerChange = (question: string, value: string) => {
        // console.log("question", question, '/n value', value)
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
    // console.log("value", formData)
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
                           {t("Singapore.amlCddHeading")}
                        </h2>
                        <p className="text-sm text-gray-600">{t("Singapore.amlCddInfo")}</p>
                    </aside>
                    <div className="w-4/5 ml-4">
                        <div className="space-y-2 pb-2">
                            <Label htmlFor="Relation" className="text-sm font-semibold mb-2">
                               {t("Singapore.clientPurpose")}<span className="text-red-500">*</span>
                            </Label>
                            <RadioGroup
                                value={t(hasLegalEthicalIssues.value || '')}
                                onValueChange={(value) => handleQuestionChange(value)}
                                disabled={formData.isDisabled || !canEdit}
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
                                {t("Singapore.clientAnnualRenew")}<span className="text-red-500">*</span>
                            </Label>
                            <RadioGroup
                                value={t(annualRenewalTermsAgreement.value || '')}
                                onValueChange={(value) => handleQuestion2Change(value)}
                                disabled={formData.isDisabled || !canEdit}
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
                                 {t("Singapore.clientAccountTax")}<span className="text-red-500">*</span>
                            </Label>
                            <RadioGroup
                                value={t(sgAccountingDeclarationIssues.value || '')}
                                onValueChange={(value) => handleAccountingDecChange(value)}
                                disabled={formData.isDisabled || !canEdit}
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
                            {t("usa.AppInfo.amlCddQuestion")}
                        </h2>
                        <p className="text-sm text-gray-600">{t("usa.AppInfo.amlCddQPara")}</p>
                    </aside>
                    <div className="w-4/5 ml-4">
                        {questions.map((question) => (
                            <div className="space-y-2 pb-2" key={question.id} >
                                {/* Question Text */}
                                <p className="text-sm font-medium text-gray-800 mb-3">
                                    {t(question.value)} <span className="text-red-500">*</span>
                                </p>
                                <RadioGroup
                                    value={ t(formData[question.id]?.value || '')}
                                    onValueChange={(value) => handleAnswerChange(question.id, value)}
                                    className="space-y-2"
                                    disabled={formData.isDisabled || !canEdit}
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