import React from 'react'
import { useAtom } from "jotai"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { usaFormWithResetAtom } from '../UsState';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import ApplicantInformation from './Section5';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
const Section1: React.FC = () => {
    const [formData, setFormData] = useAtom(usaFormWithResetAtom);

    const handleChange = (name: string, index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("name", name)
        const values = [...formData.companyName];
        values[index] = e.target.value;
        setFormData({ ...formData, companyName: values });
    }
    
    return (
        <>
            <Card className="max-w-5xl mx-auto">
                <CardHeader className="bg-sky-100 dark:bg-sky-900">
                    <CardTitle>
                        Application for incorporation of a US company (LLC-Limited Liability Company/Corp-Corporation)
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-4">
                        This is an application form to form a company the USA. Please check the information related to the incorporation process and provide a specific answer.
                    </p>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Company Information */}
                    <div className="space-y-4 text-sm">

                        <div className="space-y-2 text-foreground">
                            <p>
                                This application is in the form of a questionnaire on the information required for the formation of a US company(LLC-Limited Liability Company/ Corp-Corporation) and some questions may be difficult for some clients or may take some time to answer. Accordingly, please kindly answer the questions and submit the relevant documents when you have sufficient time.

                                If you have any difficulty or difficulty understanding the written form, please contact us using the details below.
                            </p>
                            <p>Thank you.</p>
                        </div>
                        <div className="space-y-2">
                            <p className="font-medium">Mirrasia</p>
                            <p>
                                website:{" "}
                                <a href="http://www.mirrasia.com" className="text-primary hover:underline">
                                    www.mirrasia.com
                                </a>
                            </p>
                            <p>
                                Plus Friend:{" "}
                                <a href="https://pf.kakao.com/_KxmnZT" className="text-primary hover:underline">
                                    https://pf.kakao.com/_KxmnZT
                                </a>
                            </p>
                            <p>Phone: (Korea) 02-543-6187 (Hong Kong) 2187-2428</p>
                            <p>SNS: (Kakao Talk) mirrasia (WeChat) mirrasia_hk</p>
                        </div>
                    </div>

                    <Separator />

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-base">
                                Email <span className="text-destructive">*</span>
                            </Label>
                            <Input id="email" type="email" placeholder="Valid email" className="w-full" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="relationbtwauth" className="inline-flex">
                            Proposed US company name (Please provide at least three proposed company names.) <span className="text-red-500 font-bold ml-1 flex">*
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[500px] text-base">
                                        The company name must be written in English, and LLC must end with “LLC” in English.
                                        For CORPORATION, please select from “Corporation”, “Incorporated”, “Limited”, “Corp.”, or “Inc.” and write it after the English name.
                                        The company name can be a combination of uppercase/lowercase/numbers/periods/commas/parentheses, and cannot contain any special characters. If there is an existing company with the same or similar company name, the company cannot be established. Accordingly, if you list three possible company names in the order of 1st/2nd/3rd choice below, we will search the registration and apply the possible company names to the registration documents in the order of your choice.
                                    </TooltipContent>
                                </Tooltip>
                            </span>
                        </Label>
                        {
                            formData.companyName.map((name, index) => (
                                <Input
                                    key={index}
                                    id={`companyName${index}`}
                                    placeholder="Your answer"
                                    value={name}
                                    onChange={handleChange("companyName", index)}
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