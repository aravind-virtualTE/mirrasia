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

const list = ['1', '2', '3', '4', '5']
const Section12 = () => {
    const [selectedOption, setSelectedOption] = useState("");

    const handleOptionChange = (value: string) => {
        setSelectedOption(value);
    };

    return (
        <Card className="max-w-5xl mx-auto mt-2">
            <CardHeader className="bg-sky-100 dark:bg-sky-900">
                <CardTitle className="text-lg font-medium">Section 12</CardTitle>
                <p className="inline-flex">Members of the US company you are establishing<Tooltip>
                    <TooltipTrigger asChild>
                        <HelpCircle className="text-red-500 h-4 w-4 mt-1 ml-2 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[500px] text-base">
                        In this section, you must provide information about the members (shareholders), executives, and contact persons of the U.S. company you wish to establish.
                    </TooltipContent>
                </Tooltip></p>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">

                <div className="space-y-2">
                    <Label htmlFor="relationbtwauth" className="inline-flex">
                        Total number of members (shareholders) <span className="text-destructive">*
                        </span>
                    </Label>
                    {/* <RadioGroup defaultValue="no"
                        value={selectedOption}
                        onValueChange={handleOptionChange}
                        id="relationbtwauth"
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

                    <Select onValueChange={handleOptionChange}>
                        <SelectTrigger className="w-full md:w-80">
                        <SelectValue/>
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
                    <Label htmlFor="relationbtwauth" className="inline-flex">
                        Total number of executives <span className="text-destructive">*
                        </span>
                    </Label>
                    {/* <RadioGroup defaultValue="no"
                        value={selectedOption}
                        onValueChange={handleOptionChange}
                        id="relationbtwauth"
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
                    <Label htmlFor="relationbtwauth" className="inline-flex">
                        Enter the name/shareholding ratio of each member and executive<span className="text-red-500 font-bold ml-1 flex">*
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[500px] text-base">
                                    Example) 1. Hong Gil-dong: Member (shareholder) and executive/liaison person/Capital investment ratio: 49.99% 2. Yeonsangun: Not a member/only registered as an executive 3. Jang Nok-su: Only a member/not an executive/Capital investment ratio: 50.01%
                                </TooltipContent>
                            </Tooltip>
                        </span>
                    </Label>
                    <Input id="descBusiness" placeholder="Your answer" required />
                </div>

                {/* select Industry */}
                <div className="space-y-2">
                    <Label htmlFor="relationbtwauth" className="inline-flex">
                        Designated Contact Person <span className="text-red-500 font-bold ml-1 flex">*
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[500px] text-base">
                                    You must designate a designated contact person to handle company-related communications. This designated contact person will be responsible for all major communications with our company, including inquiries about the company and business matters, progress checks, and registered documents. The designated contact person will have access to your company's information and documents, including mail. The designation of one contact person is free of charge. For two or more persons, there will be a fee of USD 250 per person per year. The designated contact person, designated by your company and separately registered with us, serves to protect your company's information and prevent confusion in business. (The designated contact person must submit a copy of their passport, proof of address, and undergo a verification process, similar to shareholders and officers.)
                                </TooltipContent>
                            </Tooltip>
                        </span>
                    </Label>
                    <Input id="descBusiness" placeholder="Your answer" required />
                </div>


            </CardContent>
        </Card>
    )
}

export default Section12