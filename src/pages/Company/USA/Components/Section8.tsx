import React from 'react'
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
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

// const list = [
//    '예','아니오','모름'
// ]
const list = [
    'Yes','No','I Dont know'
 ]
const Section8 = () => {

    const [selectedOption, setSelectedOption] = useState("");

    const handleOptionChange = (value: string) => {
        setSelectedOption(value);        
    };

    return (
        <React.Fragment> <Card className="max-w-5xl mx-auto mt-2">
            <CardHeader className="bg-sky-100 dark:bg-sky-900">
                <CardTitle className="text-lg font-medium">Section 8</CardTitle>
                <p className="inline-flex">Questions about trade sanctions<Tooltip>
                    <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[500px] text-base">
                    This section is about whether there are transactions with countries subject to sanctions stipulated or recommended by FATF, UNGC, OFAC, etc. Please make sure to answer the related questions without any distortion or error.
                    </TooltipContent>
                </Tooltip></p>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                {/* serviceID Field */}
                <div className="space-y-2">
                    <Label htmlFor="serviceID" className="inline-flex">
                    Does your proposed U.S. company, holding company, group, or affiliate currently do business, or plan to do business, with any of the following countries: Iran, Sudan, South Sudan, North Korea, Syria, Cuba, Belarus, or Zimbabwe?<span className="text-red-500 font-bold ml-1 flex">
                            *
                        </span>
                    </Label>
                    <Select onValueChange={handleOptionChange}>
                        <SelectTrigger className="w-full md:w-80">
                        <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                        {list.map(state => (
                            <SelectItem key={state} value={state}>
                                {state}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>                  
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="serviceID" className="inline-flex">
                    Are there any people among the US company to be established, its holding company, group, or related company who reside in Iran, Sudan, North Korea, Syria, Cuba, or a country sanctioned by the UN, EU, UKHMT, HKMA, or OFAC?<span className="text-red-500 font-bold ml-1 flex">
                            *
                        </span>
                    </Label>
                   
                     <Select onValueChange={handleOptionChange}>
                             <SelectTrigger className="w-full md:w-80">
                                <SelectValue />
                                </SelectTrigger>
                                 <SelectContent>
                                    {list.map(state => (
                                        <SelectItem key={state} value={state}>
                                            {state}
                                            </SelectItem>
                                        ))}
                                        </SelectContent>
                                        </Select>                  
                </div>
                <div className="space-y-2">
                    <Label htmlFor="serviceID" className="inline-flex">
                    Are there any U.S. companies, their holding companies, groups, or related companies that are currently conducting business in the Crimea or Sevastopol region or plan to do so in the future?<span className="text-red-500 font-bold ml-1 flex">
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
                </div>

                <div className="space-y-2">
                    <Label htmlFor="serviceID" className="inline-flex">
                    Are you a U.S. company or its holding company, group, or affiliate currently engaged in business in the oil, gas, energy, military, or defense sectors, or do you plan to engage in such business in the future?<span className="text-red-500 font-bold ml-1 flex">
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
                </div>

            </CardContent>
        </Card>
        </React.Fragment>
    )
}

export default Section8