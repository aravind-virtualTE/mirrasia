import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from "lucide-react"
import MultiSelect, { Option } from "@/components/MultiSelectInput";

const list = [
    'Director/Officer of the proposed US company', 'Delegated by the director of the proposed US company', 'Shareholder of the proposed US company holding majority of the shares', ' A professional(e.g. lawyer, accountant) who provides incorporation advice to the US company'
]

const Section5 = () => {
    const [selectedRelation, setRelationOption] = useState<Option[]>([]);
    const handleSelectionChange = (selections: Option[]) => {
        console.log("selections", selections)
        setRelationOption(selections)

    };

    const relList = list.map((item) => ({ label: item, value: item }));
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
                <div>
                    <Label className="text-base flex items-center font-semibold gap-2">
                        Relationship between the above applicant and the US company to be established
                        <span className="text-red-500 flex font-bold ml-1">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[500px] text-base">
                                    you can type in the empty space inside the select box to enter custom value
                                </TooltipContent>
                            </Tooltip>*
                        </span>
                    </Label>
                    <p className="text-sm text-gray-500">Please select all that apply.</p>

                    {relList.length > 0 ? (
                        <>
                            <MultiSelect
                                options={relList}
                                placeholder="Select Relationship."
                                selectedItems={selectedRelation}
                                onSelectionChange={handleSelectionChange}
                            />
                        </>
                    ) : (
                        "Please Fill Shareholder/Director"
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phoneNum" className="inline-flex">
                        Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <Input id="phoneNum" placeholder="Your answer" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="snsAccountId" className="inline-flex">
                        SNS account ID <span className="text-destructive">*</span>
                    </Label>
                    <Input id="snsAccountId" placeholder="Your answer" required />
                </div>
            </CardContent>
        </Card>
    )
}

export default Section5