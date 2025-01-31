import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from "lucide-react"

const list = [
    'Cryptocurrency-related (cryptocurrency issuance, sale, donation, ICO, exchange, wallet service, etc.)', 'Development of IT, blockchain, software, etc.', 'Cryptocurrency-based investment-related business', 'Cryptocurrency-based games','foreign exchange trading','Finance, investment, advisory, loan business, etc.','trade industry','Wholesale/retail distribution industry','consulting','manufacturing','Online service industry (e-commerce)', 'Online direct purchase/delivery/purchase agency','Other'
]

const  list2 = [
    'Pursuing business diversification through relaxed regulations','A legal advisor, investor, or business partner proposes establishing a U.S. company.','Expanding business into various overseas countries (international business)','Asset management by investing in real estate or financial assets','As a holding company, the purpose is to invest in and manage subsidiaries or affiliated companies.','Pursuing competitive advantage through liberal financial policies','Increased transaction volume due to low tax rate and non-VAT','other'
]

const Section9 = () => {
    const [selectedOption, setSelectedOption] = useState("");
    const [otherText, setOtherText] = useState("");

    const handleOptionChange = (value: string) => {
        setSelectedOption(value);
        if (value !== "other") {
            setOtherText("");
        }
    };

    return (
        <Card className="max-w-5xl mx-auto mt-2">
            <CardHeader className="bg-sky-100 dark:bg-sky-900">
                <CardTitle className="text-lg font-medium">Section 9</CardTitle>
                <p className="inline-flex">Business information about the US company you are establishing. <Tooltip>
                    <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[500px] text-base">
                    In this section, you can enter information about the U.S. company you wish to establish and related business.
                    </TooltipContent>
                </Tooltip></p>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                  {/* select Industry */}
                  <div className="space-y-2">
                    <Label htmlFor="relationbtwauth" className="inline-flex">
                    Select industry (check all relevant items) <span className="text-destructive">*</span>
                    </Label>
                    <RadioGroup defaultValue="no"
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
                {/* prodDesc Field */}
                <div className="space-y-2">
                    <Label htmlFor="prodDesc" className="inline-flex">
                    Description of the product name, product type, service content, service type, etc. to be traded after establishment <span className="text-destructive">*</span>
                    </Label>
                    <Input id="prodDesc" placeholder="Your answer" required />
                </div>

                {/* descBusiness Field */}                
                <div className="space-y-2">
                    <Label htmlFor="descBusiness" className="inline-flex">
                    Description of the business of the company you are establishing (at least 50 characters) <span className="text-destructive">*</span>
                    </Label>
                    <Input id="descBusiness" placeholder="Your answer" required />
                </div>

                 {/* website Field */}                
                 <div className="space-y-2">
                    <Label htmlFor="website" className="inline-flex">
                    Enter your website address (if available) 
                    </Label>
                    <Input id="website" placeholder="Your answer" required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="relationbtwauth" className="inline-flex">
                    Purpose of establishing a US company and expected future effects <span className="text-destructive">*</span>
                    </Label>
                    <RadioGroup defaultValue="no"
                        value={selectedOption}
                        onValueChange={handleOptionChange}
                        id="relationbtwauth"
                    >
                        {list2.map((item) => (
                            <div className="flex items-center space-x-2" key={item}>
                                <RadioGroupItem value={item} id={item} />
                                <Label htmlFor={item} className="font-normal">
                                    {item}
                                </Label>
                            </div>
                        ))}
                        {selectedOption === "other" && (
                        <Input
                            type="text"
                            placeholder="Please specify"
                            value={otherText}
                            onChange={(e) => setOtherText(e.target.value)}
                            className="mt-2"
                        />
                    )}
                    </RadioGroup>                    
                </div>
                
               
            </CardContent>
        </Card>
    )
}

export default Section9