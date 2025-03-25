import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'
import DropdownSelect from '@/components/DropdownSelect'
import { useAtom } from "jotai";
import { usaFormWithResetAtom } from "../inviteUsaDirShirState";
import { Input } from "@/components/ui/input"

const  statesList = [
    'Yes',
    'No',
    'Other'
]

const Section4 = () => {
    const [formData, setFormData] = useAtom(usaFormWithResetAtom);
    const handleOptionChange = (value: string | number) => {
        // setSelectedOption(value);
        setFormData({ ...formData, noOfSharesSelected: value });
    };

    return (
        <React.Fragment> <Card className="max-w-5xl mx-auto mt-2">
            <CardHeader className="bg-sky-100 dark:bg-sky-900">
                <CardTitle className="text-lg font-medium">Section 4</CardTitle>
                <p>Determine whether you are a U.S. jurisdictional entity under tax law</p>Confirmation of major political figures by company officials
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="inline-flex">
                <p>Is your company legally located in the United States or a permanent establishment under the tax law?</p>
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
                        options={statesList}
                        placeholder="Select..."
                        selectedValue={formData.noOfSharesSelected}
                        onSelect={handleOptionChange}
                    />
                </div>
            </CardContent>

            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="inline-flex">
                     <p>If you are a U.S. jurisdiction or a permanent establishment under tax law, list your IRS U.S. Tax Identification Defense (TIN).</p>    
                    <span className="text-destructive">*</span>
                    </Label>
                    <Input id="name" placeholder="Your answer" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>

            </CardContent>


        </Card>
        </React.Fragment>
    )
}

export default Section4