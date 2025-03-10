import React from 'react'
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
// import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'
// import { 
//     Select, 
//     SelectContent, 
//     SelectItem, 
//     SelectTrigger, 
//     SelectValue 
//   } from '@/components/ui/select';
import DropdownSelect from '@/components/DropdownSelect'

const list = [
    'Total capital divided by $1 (1 share price = $1; universal method)', '1 share (minimum) (1 share price = total capital)', '100', '1,000', '10,000'
]


const Section4 = () => {

    const [selectedOption, setSelectedOption] = useState<string | number>("");
    // const [otherText, setOtherText] = useState("");

    const handleOptionChange = (value: string | number) => {
        setSelectedOption(value);
        // if (value !== "Other") {
        //     setOtherText("");
        // }
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
                    {/* <RadioGroup defaultValue="no"
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
                    </RadioGroup> */}
                    
                    {/* <Select onValueChange={handleOptionChange}>
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
                    )} */}
                    <DropdownSelect
                        options={list}
                        placeholder="Select..."
                        selectedValue={selectedOption}
                        onSelect={handleOptionChange}
                    />
                </div>
            </CardContent>
        </Card>
        </React.Fragment>
    )
}

export default Section4