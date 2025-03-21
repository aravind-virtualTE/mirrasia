import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'
import DropdownSelect from '@/components/DropdownSelect'
import { useAtom } from "jotai";
import { usaFormWithResetAtom } from "../UsState";
import Section10 from './Section10'
const list = [
    'Total capital divided by $1 (1 share price = $1; universal method)', '1 share (minimum) (1 share price = total capital)', '100', '1,000', '10,000'
]

const Section4 = () => {
    const [formData, setFormData] = useAtom(usaFormWithResetAtom);
    const handleOptionChange = (value: string | number) => {
        // setSelectedOption(value);
        setFormData({ ...formData, noOfSharesSelected: value });
    };

    return (
        <React.Fragment>
            <Section10 />
            <Card className="max-w-5xl mx-auto mt-2">               
                <CardContent className="space-y-6 pt-6">
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

                        <DropdownSelect
                            options={list}
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

export default Section4