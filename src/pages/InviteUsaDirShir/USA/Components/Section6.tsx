import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useAtom } from "jotai"
import { usaFormWithResetAtom } from "../inviteUsaDirShirState"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { Input } from "@/components/ui/input"

const Section6 = () => {

    const [formData, setFormData] = useAtom(usaFormWithResetAtom);
   

    return (
        <React.Fragment> <Card className="max-w-5xl mx-auto mt-2">
            <CardHeader className="bg-sky-100 dark:bg-sky-900">
                <CardTitle className="text-lg font-medium">Section 6</CardTitle>
                <p> Description of major political figures</p>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="serviceID" className="text-base flex items-center font-semibold gap-2">
                        <p> Please describe in detail whether you are a major political figure or your relationship with such a person. </p>
                      
                    <span className="text-red-500 flex font-bold ml-1">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[500px] text-base">
                                </TooltipContent>
                            </Tooltip>*
                        </span>
                    </Label>
                    <Input id="name" placeholder="Your answer" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />

                </div>
            </CardContent>
        </Card>
        </React.Fragment>
    )
}

export default Section6