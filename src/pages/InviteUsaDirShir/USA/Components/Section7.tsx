import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from "lucide-react"
import { useAtom } from "jotai"
import { usaFormWithResetAtom } from "../inviteUsaDirShirState"
import DropdownSelect from '@/components/DropdownSelect'

const  yesOrNoList = [
    'Yes', 
    'No', 
]

const Section7 = () => {
    const [formData, setFormData] = useAtom(usaFormWithResetAtom);

    const handleOptionChange = (value: string | number) => {
        // setSelectedOption(value);
        setFormData({ ...formData, noOfSharesSelected: value });
    };

    return (
        <React.Fragment> <Card className="max-w-5xl mx-auto mt-2">
            <CardHeader className="bg-sky-100 dark:bg-sky-900">
                <CardTitle className="text-lg font-medium">Section 7</CardTitle>
                <p className="inline-flex">Declaration for Company Officials<Tooltip>
                    <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[500px] text-base">
                       </TooltipContent>
                </Tooltip></p>
                <p> (Important) Please read each question carefully and answer it </p>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="inline-flex">
                        <p>Have any of your company officials been arrested or convicted of crimes against the law?</p>
                        <span className="text-red-500 font-bold ml-1 flex">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[500px] text-base">
                                </TooltipContent>
                            </Tooltip>
                        </span>                  
                    </Label>

                    <DropdownSelect
                        options={yesOrNoList}
                        placeholder="Select..."
                        selectedValue={formData.noOfSharesSelected}
                        onSelect={handleOptionChange}
                    />
                </div>
            </CardContent>
            
            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="inline-flex">
                   <p>Have you been investigated by law enforcement agencies (police, prosecutors) or tax authorities?</p>
                   <span className="text-red-500 font-bold ml-1 flex">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[500px] text-base">
                                </TooltipContent>
                            </Tooltip>
                        </span>
                    </Label>

                    <DropdownSelect
                        options={yesOrNoList}
                        placeholder="Select..."
                        selectedValue={formData.noOfSharesSelected}
                        onSelect={handleOptionChange}
                    />
                </div>
            </CardContent>

            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="inline-flex">
                   <p>Are your company associates involved in crime, money laundering, bribery or terrorist activities
                     in connection with business and personal funds, or with funds derived from other illegal activities?</p>
                     <span className="text-red-500 font-bold ml-1 flex">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[500px] text-base">
                                </TooltipContent>
                            </Tooltip>
                        </span>
                    </Label>

                    <DropdownSelect
                        options={yesOrNoList}
                        placeholder="Select..."
                        selectedValue={formData.noOfSharesSelected}
                        onSelect={handleOptionChange}
                    />
                </div>
            </CardContent>

            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="inline-flex">
                   <p>Have you been investigated by law enforcement agencies (police, prosecutors) or tax authorities?</p>
                   <span className="text-red-500 font-bold ml-1 flex">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[500px] text-base">
                                </TooltipContent>
                            </Tooltip>
                        </span>
                    </Label>

                    <DropdownSelect
                        options={yesOrNoList}
                        placeholder="Select..."
                        selectedValue={formData.noOfSharesSelected}
                        onSelect={handleOptionChange}
                    />
                </div>
            </CardContent>

            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="inline-flex">
                   <p>Have you been investigated by law enforcement agencies (police, prosecutors) or tax authorities?</p>
                   <span className="text-red-500 font-bold ml-1 flex">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[500px] text-base">
                                </TooltipContent>
                            </Tooltip>
                        </span>
                    </Label>

                    <DropdownSelect
                        options={yesOrNoList}
                        placeholder="Select..."
                        selectedValue={formData.noOfSharesSelected}
                        onSelect={handleOptionChange}
                    />
                </div>
            </CardContent>

        </Card>
        </React.Fragment>
    )
}

export default Section7