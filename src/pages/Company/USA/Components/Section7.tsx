import React from 'react'
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from "lucide-react"

const list = [
   '예','아니오','모름','법률자문 고려', 'Other'
]

const list2 = [
    '예','아니오','설립 후 사내에서 자체적으로 해결 가능','설립 후 매년 고정비용이 발생한다면 설립할 의향이 없음','진행 전 자문필요', 'Other'
 ]
const Section7 = () => {

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
                <CardTitle className="text-lg font-medium">Section 7</CardTitle>
                <p className="inline-flex">Confirmation of customer's business intentions<Tooltip>
                    <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[500px] text-base">
                        This section is prepared to minimize misunderstandings between us in the future by understanding the customer's business intentions and checking in advance whether the service we provide matches them. If you answer the questions accurately, we will provide advice or suggest services accordingly.
                    </TooltipContent>
                </Tooltip></p>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                {/* serviceID Field */}
                <div className="space-y-2">
                    <Label htmlFor="serviceID" className="inline-flex">
                    Does the purpose of establishing a US company raise legal or ethical issues such as money laundering, gambling, tax evasion, asset hiding, evasion of law for illegal business, fraud, etc.?<span className="text-red-500 font-bold ml-1 flex">
                            *
                        </span>
                    </Label>
                    <RadioGroup defaultValue="no"
                        id="serviceID"
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
                <div className="space-y-2">
                    <Label htmlFor="serviceID" className="inline-flex">
                    After the establishment of a U.S. company, annual renewal work occurs every year, and all of these work entails related costs and obligations to provide materials. Do you agree to this?<span className="text-red-500 font-bold ml-1 flex">
                            *
                        </span>
                    </Label>
                    <RadioGroup defaultValue="no"
                        id="serviceID"
                        value={selectedOption}
                        onValueChange={handleOptionChange}
                    >
                        {list2.map((item) => (
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

export default Section7