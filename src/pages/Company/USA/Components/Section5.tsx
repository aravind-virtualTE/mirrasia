import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
    'Executives of the U.S. company (to be established)', 'A person delegated by an executive of the U.S. company (to be established)', 'Major shareholder of the U.S. company (to be established)', 'Experts (lawyers, accountants) who provide establishment advice on behalf of executives of U.S. companies (to be established), Administrator, tax accountant, etc.)', 'Other'
]

const Section5 = () => {
    const [selectedOption, setSelectedOption] = useState("");
    const [otherText, setOtherText] = useState("");

    const handleOptionChange = (value: string) => {
        setSelectedOption(value);
        if (value !== "Oter") {
            setOtherText("");
        }
    };

    return (
        <Card className="max-w-5xl mx-auto mt-2">
            <CardHeader className="bg-sky-100 dark:bg-sky-900">
                <CardTitle className="text-lg font-medium">Section 5</CardTitle>
                <p className="inline-flex">Applicant Information <Tooltip>
                    <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[500px] text-base">
                        This application form must be written directly by an officer of the U.S. company (or one to be established in the future) who is the key controller in establishing the U.S. company, or must be authorized by such officer to accurately enter all information. Later, this application form will be prepared as a separate application form document when establishing the U.S. company, and the officer to be registered in the U.S. company must sign the document directly. (Proxy signature is not allowed.)

                        This application form and the application form documents to be signed later will be kept by our company as legal procedures for performing KYC (Know Your Customer) and Client's Due Diligence (due diligence and verification of customers) in accordance with the TCSP license and AMLO (Anti-Money Laundering and Counter-Terrorist Financing Act) and will be kept as statutory documents in the future. Therefore, please be careful not to create any distortion or errors in the content you write.
                    </TooltipContent>
                </Tooltip></p>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                {/* Name Field */}
                <div className="space-y-2">
                    <Label htmlFor="name" className="inline-flex">
                    Please enter the name of the person filling out this form. <span className="text-destructive">*</span>
                    </Label>
                    <Input id="name" placeholder="Your answer" required />
                </div>

                {/* Name Change History */}
                <div className="space-y-2">
                    <Label htmlFor="relationbtwauth" className="inline-flex">
                    Relationship between the above author and the US company you are establishing (multiple selections possible) <span className="text-destructive">*</span>
                    </Label>
                    {/* 
                     */}
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

                    {selectedOption === "Oher" && (
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
                    <Label htmlFor="contact" className="inline-flex">
                    Contact information of the above writer (phone number, email, SNS account ID, etc.) <span className="text-destructive">*</span>
                    </Label>
                    <Input id="contact" placeholder="Your answer" required />
                </div>
            </CardContent>
        </Card>
    )
}

export default Section5