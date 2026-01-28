import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState } from "react"


const Section2 = () => {
 
    return (
        <Card className="max-w-5xl mx-auto mt-2">
            <CardHeader className="bg-sky-100 dark:bg-sky-900">
                <CardTitle className="text-lg font-medium">Customer Information</CardTitle>         
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="inline-flex">
                        Name: <span className="text-destructive">*</span>
                    </Label>
                    <Input id="name" placeholder="Your answer" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phNum" className="inline-flex">
                    Phone number: <span className="text-destructive">*</span>
                    </Label>
                    <Input id="phNum" placeholder="Your answer" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="kakTalk" className="inline-flex">
                    KakaoTalk ID (if available):
                    </Label>
                    <Input id="kakTalk" placeholder="Your answer" />
                </div>
                <AccountingForm />
            </CardContent>
        </Card>
    )
}

export default Section2


interface FormData {
    canCommunicate: string;
    hasFinAssets: string;
    ownMoreTwoFifePercent: string;
    ageLimit: string; 
}

const AccountingForm = () => {
    const [formData, setFormData] = useState<FormData>({
        canCommunicate: "no",
        hasFinAssets: "no",
        ownMoreTwoFifePercent: "no",
        ageLimit: "no",
        
    });

    const handleChange = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <>
            {Object.entries(formData).map(([field, value]) => (
                <Card key={field}>
                    <CardContent className="p-6">
                        <Label className="block text-sm font-bold mb-4">
                            {field === "canCommunicate" && "Are you able to communicate at a basic level with bank staff in English or Chinese? (If you answered “No”, you cannot open an HSBC account.)"}
                            {field === "hasFinAssets" && "Do you hold financial assets (including insurance products) worth HKD60,000 or more in Hong Kong for a period of more than six months, or financial assets worth HKD500,000 or more outside Hong Kong for a period of more than six months?(If you qualify, you can open a SC Bank account with a lower fee.)"}
                            {field === "ownMoreTwoFifePercent" && "Do you own more than 25% of the shares of an operating Hong Kong company?"}
                            {field === "ageLimit" && "Are you under 27 years old or over 55 years old?(Depending on the bank, additional documentation of assets may be requested.)"}
                        </Label>
                        {/* <p className="text-sm text-gray-600 mb-4">
                            * If you select "Yes", please provide the relevant details.
                        </p> */}
                        <RadioGroup
                            defaultValue={value}
                            onValueChange={(newValue) => handleChange(field as keyof FormData, newValue)}
                        >
                            <div className="flex items-center space-x-4">
                                <Label htmlFor={`${field}-yes`} className="flex items-center">
                                    <RadioGroupItem value="yes" id={`${field}-yes`} /> Yes
                                </Label>
                                <Label htmlFor={`${field}-no`} className="flex items-center">
                                    <RadioGroupItem value="no" id={`${field}-no`} /> No
                                </Label>
                            </div>
                        </RadioGroup>
                    </CardContent>
                </Card>
            ))}
        </>
    );
};