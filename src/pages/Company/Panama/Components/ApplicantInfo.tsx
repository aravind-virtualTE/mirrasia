import React, { ChangeEvent } from 'react'
import { useTheme } from '@/components/theme-provider';
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { t } from 'i18next';
import { snsPlatforms } from '../../HongKong/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { useAtom } from 'jotai';
import { paFormWithResetAtom } from '../PaState';


const ApplicantInfo: React.FC = () => {
    const { theme } = useTheme();
    const [formData, setFormData] = useAtom(paFormWithResetAtom)

    const handleChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
        // console.log("name", name)
        const values = [...formData.companyName];
        values[index] = e.target.value;
        setFormData({ ...formData, companyName: values });
    }

    const handleSelectChange = (value: string) => {
        // console.log("value", value)
        setFormData({
            ...formData,
            snsAccountId: {
                ...formData.snsAccountId,
                id: value
            }
        })
    }

    const handleSNSChange = (e: ChangeEvent<HTMLInputElement>): void => {
            // console.log("change",e)
            setFormData({
                ...formData,
                snsAccountId: {
                    ...formData.snsAccountId,
                    value: e.target.value
                }
            })
        }

    return (
        <Card>
            <CardContent>
                <div className='flex w-full p-4'>
                    <aside className={`w-1/4 p-4 rounded-md shadow-sm ${theme === "light"
                        ? "bg-blue-50 text-gray-800"
                        : "bg-gray-800 text-gray-200"
                        }`}>
                        <h2 className="text-m font-semibold mb-0">{t("ApplicantInfoForm.heading")}</h2>
                        <p className="text-sm text-gray-600"> {t("panama.headInfo")}</p>
                    </aside>
                    <div className="w-3/4 ml-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="inline-flex">
                                {t("ApplicantInfoForm.applicantName")} <span className="text-red-500 font-bold ml-1 flex">*</span>
                            </Label>
                            <Input id="name" placeholder="Enter name" className="w-full" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="inline-flex">
                                {t("ApplicantInfoForm.email")}<span className="text-red-500 font-bold ml-1 flex">*</span>
                            </Label>
                            <Input id="email" placeholder="Enter your email address" className="w-full" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">{t("dashboard.tCompName")}<span className="text-red-500 font-bold ml-1 flex">*
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[500px] text-base">
                                       {t("panama.compNameInfo")}
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
                        <div className="space-y-2">
                            <Label htmlFor="legalEntity" className="inline-flex">
                                {t("panama.applicantLegalEntity")}<span className="text-red-500 font-bold ml-1 flex">*</span>
                            </Label>
                            <Input id="legalEntity" placeholder="Enter if any.." className="w-full"
                            value={formData.legalEntity} onChange={(e) => setFormData({ ...formData, legalEntity: e.target.value })}
                             />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="residentialAddress" className="inline-flex">
                                {t("panama.residencalAddress")} <span className="text-red-500 font-bold ml-1 flex">*</span>
                            </Label>
                            <Input id="residentialAddress" placeholder="Enter address.." className="w-full" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm">
                                {t("ApplicantInfoForm.phoneNum")}
                            </Label>
                            <Input
                                id="phoneNum"
                                placeholder="Enter phone number"
                                value={formData.phoneNum}
                                onChange={(e) => setFormData({ ...formData, phoneNum: e.target.value })}
                                required
                                className="w-full"
                            />
                        </div>
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4 space-y-2">
                                <Label htmlFor="snsPlatform" className="text-sm">
                                    {t("ApplicantInfoForm.snsPlatform")}
                                </Label>
                                <Select
                                     value={formData.snsAccountId.id}
                                     onValueChange={handleSelectChange}
                                >
                                    <SelectTrigger id="snsPlatform" className="w-full">
                                        <SelectValue placeholder="Select SNS Platform" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {snsPlatforms.map((platform) => (
                                            <SelectItem key={platform.id} value={platform.id}>
                                                {t(platform.name)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-8 space-y-2">
                                <Label htmlFor="snsAccountId" className="text-sm">
                                    {t('ApplicantInfoForm.snsId')}
                                </Label>
                                <Input
                                    id="snsAccountId"
                                    // placeholder={`Enter your ${snsPlatform ? snsPlatforms.find(p => p.id === snsPlatform)?.name : 'SNS'} ID`}
                                    value={formData.snsAccountId.value || ''}
                                    onChange={handleSNSChange}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default ApplicantInfo