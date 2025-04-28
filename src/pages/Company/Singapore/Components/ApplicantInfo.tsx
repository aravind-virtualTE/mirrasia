import { useTheme } from '@/components/theme-provider';
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React, { useState } from 'react'
import { snsPlatforms } from '../../HongKong/constants';
import { t } from 'i18next';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

const ApplicantInfo: React.FC = () => {
    const { theme } = useTheme();
    const [selectedRelation, setSelectedRelation] = React.useState<string[]>([]);
    const [otherTxt, setOtherTxt] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [snsPlatform, setSnsPlatform] = useState<string>("");
    const [snsAccountId, setSnsAccountId] = useState<string>("");

    const relationList = [
        {
            "id": "directorSgComp",
            "label": "Director of the Singapore company"
        },
        {
            "id": "delegatedByDirOfSgComp",
            "label": "Delegated by the director of the Singapore company"
        },
        {
            "id": "shareholderSgComp",
            "label": "Shareholder of the Singapore company holding majority of the shares"
        },
        {
            "id": "professionalIncorporation",
            "label": "A professional(e.g. lawyer, accountant) who provides incorporation advice to the Singapore company"
        },
        {
            "id": "other",
            "label": "Other",
            isOther: true
        }
    ]
    const isOtherSelected = selectedRelation.includes("other");
    return (
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
                            Applicant Information
                        </h2>
                        <p className="text-sm text-gray-600">The form must be filled out by the representative of the Singapore company (which will be established later; hereinafter stated as "the Singapore company"), who is the significant controller in establishing the Singapore company or has been commissioned by the representative to enter all information correctly.This form with your answers will be kept in our company as the KYC and Client Due Diligence documents. Therefore, please be careful not to cause any distortion or errors in your answers.</p>
                    </aside>
                    <div className="w-3/4 ml-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-semibold mb-2">
                                Name of the applicant <span className="text-red-500">*</span>
                            </Label>
                            <Input type="text" id="name" className="w-full p-2 border rounded-md" placeholder="Enter your name" required />
                        </div>
                        <div className="space-y-2 mt-4">
                            <Label htmlFor="email" className="text-sm font-semibold mb-2">
                                Email Address <span className="text-red-500">*</span>
                            </Label>
                            <Input type="email" id="email" className="w-full p-2 border rounded-md" placeholder="Enter your email address" required />
                        </div>
                        <div className="space-y-2 mt-4">
                            <Label htmlFor="companyName" className="text-sm font-semibold mb-2">
                                Company Name <span className="text-red-500 inline-flex">*
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[500px] text-base">
                                        The company name must be written in basic English, and end with "Pte. Ltd.". If there is a previously established company with the same or similar corporate name, it cannot be accepted. Accordingly, if you enter the three possible company names at the bottom in the order of 1st choice, 2nd choice, 3rd choice, we will check the registration and apply the possible company names to the registered document in the order of your choice.
                                        </TooltipContent>
                                    </Tooltip>
                                </span>
                            </Label>
                            <Input type="companyName" id="companyName" className="w-full p-2 border rounded-md" placeholder="Enter your company name" required />
                            <Input type="companyName" id="companyName" className="w-full p-2 border rounded-md" placeholder="Enter your company name" required />
                            <Input type="companyName" id="companyName" className="w-full p-2 border rounded-md" placeholder="Enter your company name" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="Relation" className="text-sm font-semibold mb-2">
                                Relationship between the above applicant and the Singapore company to be established<span className="text-red-500">*</span>
                            </Label>
                            {relationList.map((option) => (
                                <div key={option.id} className="flex items-start space-x-2">
                                    <Checkbox
                                        id={option.id}
                                        checked={selectedRelation.includes(option.id)}
                                        onCheckedChange={(checked) => {
                                            const updated = checked
                                                ? [...selectedRelation, option.id]
                                                : selectedRelation.filter(id => id !== option.id);
                                            setSelectedRelation(updated);
                                        }}
                                        className={option.isOther ? "mt-2" : ""}
                                    />
                                    {option.isOther ? (
                                        <div className="space-y-1 w-full">
                                            <Label htmlFor={option.id} className="font-normal">other</Label>
                                            {isOtherSelected && (
                                                <Input
                                                    value={otherTxt}
                                                    onChange={(e) => setOtherTxt(e.target.value)}
                                                    placeholder="Please specify"
                                                    className="w-full"
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <Label htmlFor={option.id} className="font-normal">{option.label}</Label>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm">
                                Phone Number
                            </Label>
                            <Input
                                id="phoneNum"
                                placeholder="Enter phone number"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                required
                                className="w-full"
                            />
                        </div>
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4 space-y-2">
                                <Label htmlFor="snsPlatform" className="text-sm">
                                    SNS Platform
                                </Label>
                                <Select
                                    value={snsPlatform}
                                    onValueChange={setSnsPlatform}
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
                                    placeholder={`Enter your ${snsPlatform ? snsPlatforms.find(p => p.id === snsPlatform)?.name : 'SNS'} ID`}
                                    value={snsAccountId}
                                    onChange={(e) => setSnsAccountId(e.target.value)}
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