import React from 'react'
import { useAtom } from "jotai"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { usaFormWithResetAtom } from '../UsState';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// import { Separator } from "@/components/ui/separator"
import ApplicantInformation from './ApplicantInformation2';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
const Section1: React.FC = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useAtom(usaFormWithResetAtom);

    const handleChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
        // console.log("name", name)
        const values = [...formData.companyName];
        values[index] = e.target.value;
        setFormData({ ...formData, companyName: values });
    }

    return (
        <>
            <Card className="max-w-5xl mx-auto">
                <CardHeader className="bg-sky-100 dark:bg-sky-900">
                    <CardTitle className="text-m inline-flex"> {t('usa.AppInfo.appInfohead')}<Tooltip>
                        <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[500px] text-base">
                        {t('usa.AppInfo.aInfPopup')}                           
                        </TooltipContent>
                    </Tooltip> </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">                  
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="inline-flex">
                            {t('usa.AppInfo.nameOfApplicant')}<span className="text-destructive">*</span>
                            </Label>
                            <Input id="name" placeholder={t('usa.AppInfo.namePlaceholder')}required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-base">
                                {t('SwitchService.ApplicantInfoForm.email')}<span className="text-destructive">*</span>
                            </Label>
                            <Input id="email" type="email" placeholder={t('usa.AppInfo.emailPlaceholder')} className="w-full" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="relationbtwauth" className="inline-flex">
                            {t('usa.AppInfo.usCompName')}
                            <span className="text-red-500 font-bold ml-1 flex">*
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[500px] text-base">
                                    {t('usa.AppInfo.usCompNamePopup')}                                        
                                    </TooltipContent>
                                </Tooltip>
                            </span>
                        </Label>
                        {
                            formData.companyName.map((name, index) => (
                                <Input
                                    key={index}
                                    id={`companyName${index}`}
                                    placeholder={t('usa.AppInfo.namePlaceholder')}  
                                    value={name}
                                    onChange={handleChange(index)}
                                    required />
                            ))
                        }
                    </div>
                </CardContent>
            </Card>
            <ApplicantInformation />
        </>
    )
}

export default Section1