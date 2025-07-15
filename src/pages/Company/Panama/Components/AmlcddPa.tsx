import React, { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from "lucide-react"
import { useAtom } from "jotai"
import { paFormWithResetAtom } from "../PaState"
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useTheme } from "@/components/theme-provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

const list = [
    {id: "yes", value: "AmlCdd.options.yes"},{id:"no",value: "AmlCdd.options.no"},{id:"unknown",value: "AmlCdd.options.unknown"},{id:"heading",value: "SwitchService.Consultation.heading"}
]

const list2 = [
    { "id": "yes", "value": "AmlCdd.options.yes" },
    { "id": "no", "value": "AmlCdd.options.no" },
    { "id": "handleOwnIncorpo", "value": "usa.AppInfo.handleOwnIncorpo" },
    { "id": "didntIntedEveryYear", "value": "usa.AppInfo.didntIntedEveryYear" },
    { "id": "consultationRequired", "value": "usa.AppInfo.consultationRequired" }
]
const AmlCddPA: React.FC = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useAtom(paFormWithResetAtom);
    const { theme } = useTheme();
    const hasLegalEthicalIssues = formData.hasLegalEthicalIssues
    const annualRenewalTermsAgreement = formData.annualRenewalTermsAgreement
    const restrictedCountriesWithActivity = formData.restrictedCountriesWithActivity
    const sanctionedTiesPresent = formData.sanctionedTiesPresent
    const businessInCrimea = formData.businessInCrimea
    const involvedInRussianEnergyDefense = formData.involvedInRussianEnergyDefense

    // const hasIssues = [
    //     hasLegalEthicalIssues.id,
    //     annualRenewalTermsAgreement.id,
    //     restrictedCountriesWithActivity.id,
    //     sanctionedTiesPresent.id,
    //     businessInCrimea.id,
    //     involvedInRussianEnergyDefense.id
    // ].some(value => (value) != "no");

    const [initialDialogOpen, setInitialDialogOpen] = useState(false);
    const handleQuestionChange = (value: string) => {
        const selectedItem = list.find(item => t(item.value) == t(value));
        setFormData({ 
            ...formData, 
            hasLegalEthicalIssues: selectedItem || {id: '', value : ""}  })
    };
    const handleQuestion2Change = (value: string) => {
        // console.log("value", value)
        const selectedItem = list2.find(item => t(item.value) == t(value));
        setFormData({ ...formData, annualRenewalTermsAgreement:  selectedItem || {id: '', value : ""}  })
    };

    const handleBusinessActivity = (value: string) =>{
        const selectedItem = list.find(item => t(item.value) == t(value));

        setFormData({ ...formData, restrictedCountriesWithActivity: selectedItem || {id: '', value : ""}  })
    }

    const handleOtherPresence = (value: string) =>{
        const selectedItem = list.find(item => t(item.value) == t(value));
        setFormData({ ...formData,   sanctionedTiesPresent: selectedItem || {id: '', value : ""}   })
    }

    const handleBusinessCremia = (value: string) =>{
        const selectedItem = list.find(item => t(item.value) == t(value));
        setFormData({ ...formData,  businessInCrimea: selectedItem || {id: '', value : ""} })
    }

    const handleEnergyPresence = (value: string) =>{
        const selectedItem = list.find(item => t(item.value) == t(value));
        setFormData({ ...formData,  involvedInRussianEnergyDefense: selectedItem || {id: '', value : ""} })
    }
    console.log("formData",formData)
    return (
        <>
            <Card>
                <CardContent>
                    <div className='flex w-full p-4'>
                        <aside
                            className={`w-1/4 p-4 rounded-md shadow-sm ${theme === "light"
                                ? "bg-blue-50 text-gray-800"
                                : "bg-gray-800 text-gray-200"
                                }`}
                        >
                            <h2 className="text-lg font-semibold mb-2">
                                {t('AmlCdd.legal_assessment_title')}
                            </h2>
                            <p className="inline-flex">
                                {t('SwitchService.Intenstions.heading')}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help text-red-500" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[500px] text-base ">
                                        {t('usa.AppInfo.amlCddPopup')}
                                    </TooltipContent>
                                </Tooltip></p>
                        </aside>
                        <div className="w-3/4 ml-4">                            
                            <div key='legal1234' className="space-y-2">
                                <Label htmlFor="serviceID" className="text-base font-semibold">
                                    {t('usa.AppInfo.amlLegalThings')}
                                    <span className="text-red-500 font-bold">*</span>
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
                            <div key='legal12345' className="space-y-2">
                                <Label htmlFor="serviceID" className="text-base font-semibold">
                                    {t('aml.amlEstablishment')}
                                    <span className="text-red-500 font-bold">*</span>
                                </Label>
                                <RadioGroup
                                    value={t(annualRenewalTermsAgreement.value || '')}
                                    onValueChange={(value) => handleQuestion2Change(value)}
                                    disabled={formData.isDisabled}
                                >
                                    {
                                        list2.map((item, idx) => {
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
                        </div>
                    </div>
                    <div className='flex w-full p-4'>
                        <aside
                            className={`w-1/4 p-4 rounded-md shadow-sm ${theme === "light"
                                ? "bg-blue-50 text-gray-800"
                                : "bg-gray-800 text-gray-200"
                                }`}
                        >
                            <h2 className="text-lg font-semibold mb-2">
                                {t('usa.AppInfo.amlCddQuestion')}
                            </h2>
                            <p className="text-sm text-gray-600">
                                {t('usa.AppInfo.amlCddQPara')}
                            </p>
                        </aside>
                        <div className="w-3/4 ml-4">
                            <div className="space-y-2">
                                <Label htmlFor="question1" className="text-base font-semibold"> 
                                    {t('aml.plannedBusinessActivity')}
                                    <span className="text-red-500 font-bold">
                                        *
                                    </span>
                                </Label>
                                <RadioGroup
                                    value={t(restrictedCountriesWithActivity.value || '') }
                                    onValueChange={(e) => handleBusinessActivity(e)}
                                    disabled={formData.isDisabled}
                                >
                                    {
                                        list.map((item, idx) => {
                                            return (
                                                <div className="flex items-center space-x-2" key={`pbs${idx}`}>
                                                    <RadioGroupItem value={t(item.value)} id={`legal1234-${item.id}`} />
                                                    <Label htmlFor={`legal1234-${item.id}`} className="text-sm font-normal">
                                                        {t(item.value)}
                                                    </Label>
                                                </div>
                                            )
                                        })
                                    }
                                </RadioGroup>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="question2" className="text-base font-semibold">
                                    {t('aml.otherPresence')}
                                    <span className="text-red-500 font-bold">*</span>
                                </Label>
                                <RadioGroup
                                    value={t(sanctionedTiesPresent.value || '') }
                                    onValueChange={(e) => handleOtherPresence(e)}
                                    disabled={formData.isDisabled}
                                >
                                    {
                                        list.map((item, idx) => {
                                            return (
                                                <div className="flex items-center space-x-2" key={`op${idx}`}>
                                                    <RadioGroupItem value={t(item.value)} id={`legal134-${item}`} />
                                                    <Label htmlFor={`legal134-${item}`} className="text-sm font-normal">
                                                        {t(item.value)}
                                                    </Label>
                                                </div>
                                            )
                                        })
                                    }
                                </RadioGroup>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="question3" className="text-base font-semibold">
                                    {t('aml.planBusinesInCrimea')}
                                    <span className="text-red-500 font-bold">*</span>
                                </Label>

                                <RadioGroup
                                    value={t(businessInCrimea.value || '')}
                                    onValueChange={(e) => handleBusinessCremia(e)}
                                    disabled={formData.isDisabled}
                                >
                                    {
                                        list.map((item, idx) => {
                                            return (
                                                <div className="flex items-center space-x-2" key={`pbc${idx}`}>
                                                    <RadioGroupItem value={t(item.value)} id={`legal234-${item.id}`} />
                                                    <Label htmlFor={`legal234-${item.id}`} className="text-sm font-normal">
                                                        {t(item.value)}
                                                    </Label>
                                                </div>
                                            )
                                        })
                                    }
                                </RadioGroup>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="question4" className="text-base font-semibold">
                                    {t('aml.energyPresence')}
                                    <span className="text-red-500 font-bold">*</span>
                                </Label>
                                <RadioGroup
                                    value={t(involvedInRussianEnergyDefense.value || '') }
                                    onValueChange={(e) => handleEnergyPresence(e)}
                                    disabled={formData.isDisabled}
                                >
                                    {
                                        list.map((item, idx) => {
                                            return (
                                                <div className="flex items-center space-x-2" key={`engp${idx}`}>
                                                    <RadioGroupItem value={t(item.value)} id={`legal1235-${item.id}`} />
                                                    <Label htmlFor={`legal1235-${item.id}`} className="text-sm font-normal">
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
                </CardContent>
            </Card>
            {/* first pop up dialog */}
            <Dialog open={initialDialogOpen} onOpenChange={setInitialDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle> {t('AmlCdd.dialog_initial_title')}</DialogTitle>
                    </DialogHeader>
                    <p>{t('AmlCdd.dialog_initial_message')}</p>
                    <Button onClick={() => setInitialDialogOpen(false)}>
                        {t('AmlCdd.dialog_button')}
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default AmlCddPA