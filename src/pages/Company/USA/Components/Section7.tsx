import React from 'react'
// import { useState } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"

// import { Input } from "@/components/ui/input"
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
// import MultiSelect, { Option } from '@/components/MultiSelectInput'
import { useAtom } from "jotai"
import { usaFormWithResetAtom } from "../UsState"

const list = [
    'yes', 'no', "Don't know", 'Consultation required before proceeding'
]

const list2 = [
    'yes', 'no', 'I/We can handle on our own after incorporation', " If a fixed cost would be incurred every year after incorporation, I don't intend to incorporate", 'Consultation required before proceeding'
]
const Section7 = () => {
    const [formData, setFormData] = useAtom(usaFormWithResetAtom);

    // const [selectedOption, setSelectedOption] = useState<Option[]>([]);
    // const [selectedRenewal, setSelectedOption2] = useState<Option[]>([]);
    // const [otherText, setOtherText] = useState("");

    const handleOptionChange = (value: string) => {
        // console.log("value", value)
        setFormData({ ...formData, hasLegalEthicalIssues: value })
        // setSelectedOption(value);
        // if (value !== "Other") {
        //     setOtherText("");
        // }
    };
    // console.log("formData.hasLegalEthicalIssues",formData.hasLegalEthicalIssues)
    // const handleEthicalChange = (selections: Option[]) => {
    //     // console.log("selections", selections)
    //     // setSelectedOption(selections)
    //     setFormData({ ...formData, hasLegalEthicalIssues: selections })

    // };
    // const handleRenewalChange = (selections: Option[]) => {
    //     // console.log("selections", selections)
    //     // setSelectedOption2(selections)
    //     setFormData({ ...formData, annualRenewalTermsAgreement: selections })
    // };
    const handleRenewalChange = (value: string) => {
        // console.log("value", value)
        setFormData({ ...formData, annualRenewalTermsAgreement: value })
        // setSelectedOption(value);
        // if (value !== "Other") {
        //     setOtherText("");
        // }
    };
    // const ethicalList = list.map((item) => ({ label: item, value: item }));
    // const acknowledgeList = list2.map((item) => ({ label: item, value: item }));

    return (
        <React.Fragment> <Card className="max-w-5xl mx-auto mt-2">
            <CardHeader className="bg-sky-100 dark:bg-sky-900">
                <p className="inline-flex">Confirmation of customer's business intentions<Tooltip>
                    <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[500px] text-base">
                        This section is prepared to minimize misunderstandings between us in the future by understanding the customer's business intentions and checking in advance whether the service we provide matches them. If you answer the questions accurately, we will provide advice or suggest services accordingly.
                    </TooltipContent>
                </Tooltip></p>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                {/* serviceID Field */}
                <div className="space-y-2">
                    <Label htmlFor="serviceID" className="text-base flex items-center font-semibold gap-2">
                        Are there any legal or ethical issues such as money laundering, gambling, tax evasion, concealment of assets, avoidance of illegal business, bribery, fraud, etc.?<span className="text-red-500 flex font-bold ml-1">
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
                    <Select onValueChange={handleOptionChange} value={formData.hasLegalEthicalIssues}>
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
                    {/* <>
                        <MultiSelect
                            options={ethicalList}
                            placeholder="Select Option."
                            selectedItems={formData.hasLegalEthicalIssues}
                            onSelectionChange={handleEthicalChange}
                        />
                    </> */}

                </div>
                <div className="space-y-2">
                    <Label htmlFor="serviceID" className="text-base flex items-center font-semibold gap-2">
                        After the establishment of the US company, annual renewal(registered agent, registered address service) will occur every year, and all these tasks are accompanied by an obligation to provide related expenses and documentations. Do you agree with this?<span className="text-red-500 flex font-bold ml-1">
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
                    <Select onValueChange={handleRenewalChange} value={formData.annualRenewalTermsAgreement}>
                        <SelectTrigger className="w-full md:w-80">
                        <SelectValue  />
                        </SelectTrigger>
                        <SelectContent>
                        {list2.map(state => (
                            <SelectItem key={state} value={state}>
                                {state}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                   
                    {/* <>
                        <MultiSelect
                            options={acknowledgeList}
                            placeholder="Select option."
                            selectedItems={formData.annualRenewalTermsAgreement}
                            onSelectionChange={handleRenewalChange}
                        />
                    </> */}
                </div>
            </CardContent>
        </Card>
        </React.Fragment>
    )
}

export default Section7