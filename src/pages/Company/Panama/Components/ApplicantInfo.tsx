import React, { useState } from 'react'
import { useTheme } from '@/components/theme-provider';
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { t } from 'i18next';
import { snsPlatforms } from '../../HongKong/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent,  TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';


const ApplicantInfo: React.FC = () => {
    const { theme } = useTheme();
    const [snsPlatform, setSnsPlatform] = useState<string>("");
    const [snsAccountId, setSnsAccountId] = useState<string>("");

    return (
        <Card>
            <CardContent>
                <div className='flex w-full p-4'>
                    <aside className={`w-1/4 p-4 rounded-md shadow-sm ${theme === "light"
                        ? "bg-blue-50 text-gray-800"
                        : "bg-gray-800 text-gray-200"
                        }`}>
                        <h2 className="text-m font-semibold mb-0"> Applicant Information</h2>
                        <p className="text-sm text-gray-600"> This application must be completed or authorised by the principal of the company (being formed) who is the primary controller of the company to ensure that all information is entered correctly. This application will be prepared as a separate application form document when the company is being formed and signed by the principal of the company.

                            This application form and the subsequent application form documents to be signed will be kept on file with us as statutory documents for the purpose of conducting KYC and due diligence on you in accordance with the TCSP Licence and AMLO (Anti-Money Laundering and Counter-Terrorist Financing Act; Cap. 615 AMLO) guidelines, so please ensure that there are no distortions or errors in the information provided.</p>
                    </aside>
                    <div className="w-3/4 ml-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="inline-flex">
                                Name of the applicant <span className="text-red-500 font-bold ml-1 flex">*</span>
                            </Label>
                            <Input id="name" placeholder="Enter name" className="w-full" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="inline-flex">
                                Email Address <span className="text-red-500 font-bold ml-1 flex">*</span>
                            </Label>
                            <Input id="email" placeholder="Enter your email address" className="w-full" />
                        </div>
                        <div className="space-y-2">
                           <Label className="flex items-center gap-2">Name of the applicant's company, if any<span className="text-red-500 font-bold ml-1 flex">*
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[500px] text-base">
                                        The name must end with the words 'Sociedad Anonima', 'Corporation', 'Incorporated' or their abbreviations 'S.A.', 'Corp.', 'Inc.' and if there is an existing company with the same or similar name, it will not be possible to incorporate. Accordingly, please list three possible company names in the order of your first, second and third choice and we will use the possible company names in the order of your choice on the registered documents.
                                    </TooltipContent>
                                </Tooltip>
                            </span>
                            </Label>
                            <Input id="companyName" placeholder="Enter company name.." className="w-full" />
                            <Input id="companyName1" placeholder="Enter company name.." className="w-full" />
                            <Input id="companyName2" placeholder="Enter company name.." className="w-full" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="legalEntity" className="inline-flex">
                                Applicant's current legal entity, if any <span className="text-red-500 font-bold ml-1 flex">*</span>
                            </Label>
                            <Input id="legalEntity" placeholder="Enter if any.." className="w-full" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="residentialAddress" className="inline-flex">
                                Applicant's residential address <span className="text-red-500 font-bold ml-1 flex">*</span>
                            </Label>
                            <Input id="residentialAddress" placeholder="Enter address.." className="w-full" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm">
                                Phone Number
                            </Label>
                            <Input
                                id="phoneNum"
                                placeholder="Enter phone number"
                                // value={phoneNumber}
                                // onChange={(e) => setPhoneNumber(e.target.value)}
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