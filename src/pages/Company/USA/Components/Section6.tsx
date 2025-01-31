import React from 'react'
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const list = [
    'US company establishment + company maintenance until renewal date (standard service)', 'EMI (Electronic Money Institution) list provided (free to customers who use our service)', 'EMI (Electronic Money Institution) account opening application agency and advice (separate quote after business confirmation)', 'Bank account opening application agency and advice (separate quote after business confirmation)', 'Legal Opinion in the US (estimate after checking white paper)','Legal Opinion for listing on domestic exchanges (quotation after checking white paper)','Legal Opinion in other countries (estimate after checking white paper)','Consulting services such as business regulatory confirmation, feasibility review, document preparation, and operation advisory (separate quote)', 'Other'
]

const Section6 = () => {

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
                <CardTitle className="text-lg font-medium">Section 6</CardTitle>
                <p>Select services provided by Mirasia</p>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                {/* serviceID Field */}
                <div className="space-y-2">
                    <Label htmlFor="serviceID" className="inline-flex">
                        Service items you need <span className="text-red-500 font-bold ml-1 flex">
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
            </CardContent>
        </Card>
        </React.Fragment>
    )
}

export default Section6