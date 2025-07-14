import React from 'react'
import { t } from 'i18next';
import { useTheme } from '@/components/theme-provider';
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { snsPlatforms } from '../../HongKong/constants';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { sgFormWithResetAtom } from '../SgState';
import { useAtom } from 'jotai';

const ApplicantInfo: React.FC = () => {
    const { theme } = useTheme();
    const [formData, setFormData] = useAtom(sgFormWithResetAtom);

    const relationList = [
        {
            "id": "directorSgComp",
            "label": "Singapore.rList.r1"
        },
        {
            "id": "delegatedByDirOfSgComp",
            "label": "Singapore.rList.r2"
        },
        {
            "id": "shareholderSgComp",
            "label": "Singapore.rList.r3"
        },
        {
            "id": "professionalIncorporation",
            "label": "Singapore.rList.r4"
        },
        {
            "id": "other",
            "label": "SwitchService.Intenstions.legalIssuesOther",
            isOther: true
        }
    ]
    const isOtherSelected = formData.establishedRelationshipType.includes("other");

    const handleChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
        // console.log("name", name)
        const values = [...formData.companyName];
        values[index] = e.target.value;
        setFormData({ ...formData, companyName: values });
    }

    const handleRelationshipChange = (relationshipId: string, checked: boolean) => {
        setFormData({ ...formData, establishedRelationshipType: checked ? [...formData.establishedRelationshipType, relationshipId] : formData.establishedRelationshipType.filter((id) => id !== relationshipId) });
    };

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
                           {t("ApplicantInfoForm.heading")}
                        </h2>
                        <p className="text-sm text-gray-600">{t("Singapore.headingInfor")}</p>
                    </aside>
                    <div className="w-4/5 ml-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-semibold mb-2">
                                {t("ApplicantInfoForm.applicantName")}<span className="text-red-500">*</span>
                            </Label>
                            <Input type="text" id="name" className="w-full p-2 border rounded-md" placeholder="Enter your name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="space-y-2 mt-4">
                            <Label htmlFor="email" className="text-sm font-semibold mb-2">
                                {t("ApplicantInfoForm.email")} <span className="text-red-500">*</span>
                            </Label>
                            <Input type="email" id="email" className="w-full p-2 border rounded-md" placeholder="Enter your email address" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div className="space-y-2 mt-4">
                            <Label htmlFor="companyName" className="text-sm font-semibold mb-2">
                                {t("Singapore.company")}<span className="text-red-500 inline-flex">*
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[500px] text-base">
                                           {t("Singapore.compInfo")}
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
                            <Label htmlFor="Relation" className="text-sm font-semibold mb-2">
                                {t("Singapore.relationBtwcompApplicant")}<span className="text-red-500">*</span>
                            </Label>
                            {relationList.map((option) => (
                                <div key={option.id} className="flex items-start space-x-2">
                                    <Checkbox
                                        id={option.id}
                                        checked={formData.establishedRelationshipType.includes(option.id)}
                                        onCheckedChange={(checked) =>
                                            handleRelationshipChange(option.id, checked as boolean)
                                        }
                                        className={option.isOther ? "mt-2" : ""}
                                    />
                                    {option.isOther ? (
                                        <div className="space-y-1 w-full">
                                            <Label htmlFor={option.id} className="font-normal">{t(option.label)}</Label>
                                            {isOtherSelected && (
                                                <Input
                                                    value={formData.isOtherRelation}
                                                    onChange={(e) => setFormData({ ...formData, isOtherRelation: e.target.value })}
                                                    placeholder="Please specify"
                                                    className="w-full"
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <Label htmlFor={option.id} className="font-normal">{t(option.label)}</Label>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm">
                               {t("ApplicantInfoForm.phoneNum")}<span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="phoneNum"
                                placeholder="Enter phone number"
                                value={formData.phoneNum || ''}
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
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        snsAccountId: {
                                            ...formData.snsAccountId,
                                            value: e.target.value
                                        }
                                    })}
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