import React from 'react'
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'

const list = [
    '총자본금을 $1로 나눈 숫자 (1주 가격 = $1 ; 보편적 방법)', '1주(최소)  (1주가격 = 총자본금)', '100주', '1,000주', '10,000주', 'Other'
]


const Section4 = () => {

    const [selectedOption, setSelectedOption] = useState("");
    const [otherText, setOtherText] = useState("");

    const handleOptionChange = (value: string) => {
        setSelectedOption(value);
        if (value !== "other") {
            setOtherText("");
        }
    };

    return (
        <React.Fragment> <Card className="max-w-5xl mx-auto mt-2">
            <CardHeader className="bg-sky-100 dark:bg-sky-900">
                <CardTitle className="text-lg font-medium">Section 4</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                {/* Name Field */}
                <div className="space-y-2">
                    <Label htmlFor="name" className="inline-flex">
                        Total number of shares to be issued (minimum 1 share) <span className="text-red-500 font-bold ml-1 flex">
                            *
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[500px] text-base">
                                    Since additional costs will be incurred when issuing new stocks or acquiring shares after establishment, please carefully decide on the capital and number of shares.
                                </TooltipContent>
                            </Tooltip>
                        </span>
                    </Label>
                    <RadioGroup defaultValue="no"
                        value={selectedOption}
                        onValueChange={handleOptionChange}
                    >
                        {list.map((item) => (
                            <div className="flex items-center space-x-2" key={item}>
                                <RadioGroupItem value={item} id={item} />
                                <Label htmlFor={item} className="font-normal">
                                    {item}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                    {selectedOption === "other" && (
                        <Input
                            type="text"
                            placeholder="Please specify"
                            value={otherText}
                            onChange={(e) => setOtherText(e.target.value)}
                            className="mt-2"
                        />
                    )}
                </div>
            </CardContent>
        </Card>
        </React.Fragment>
    )
}

export default Section4