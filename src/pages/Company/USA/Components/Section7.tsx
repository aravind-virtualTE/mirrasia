import React from 'react'
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from "lucide-react"
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
  } from '@/components/ui/select';

const list = [
   'yes','no',"Don't know",'Consideration of legal advice', 'Other'
]

const list2 = [
    'yes','no','After establishment, it can be resolved internally within the company.','If fixed costs are incurred every year after establishment, there is no intention to establish the establishment.','Consultation required before proceeding', 'Other'
 ]
const Section7 = () => {

    const [selectedOption, setSelectedOption] = useState("");
    const [otherText, setOtherText] = useState("");

    const handleOptionChange = (value: string) => {
        setSelectedOption(value);
        if (value !== "Other") {
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
                  <Select onValueChange={handleOptionChange}>
                      <SelectTrigger className="w-full md:w-80">
                         <SelectValue  />
                          </SelectTrigger>
                           <SelectContent>
                            {list.map(state => (
                                <SelectItem key={state} value={state}>
                                     {state}
                                      </SelectItem>
                                     ))}
                                     </SelectContent>
                                      </Select>
                    {selectedOption === "Other" && (
                        <Input
                            type="text"
                            placeholder="Your answer"
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
                    <Select onValueChange={handleOptionChange}>
                        <SelectTrigger className="w-full md:w-80">
                        <SelectValue  />
                        </SelectTrigger>
                        <SelectContent>
                        {list2.map(state => (
                            <SelectItem key={state} value={state}>
                                {state}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    {selectedOption === "Other" && (
                        <Input
                            type="text"
                            placeholder="Your answer"
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