import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState } from "react"


const BfrmSec3 = () => {
 
    return (
        <Card className="max-w-5xl mx-auto mt-2">
            <CardHeader className="bg-sky-100 dark:bg-sky-900">
                <CardTitle className="text-lg font-medium">Verify nationality and residence</CardTitle>         
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="nationality" className="inline-flex">
                    Nationality: <span className="text-destructive">*</span>
                    </Label>
                    <Input id="nationality" placeholder="Your answer" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="countryResidence" className="inline-flex">
                    Country of residence: <span className="text-destructive">*</span>
                    </Label>
                    <Input id="countryResidence" placeholder="Your answer" required />
                </div>
                <AccountingForm />
            </CardContent>
        </Card>
    )
}

export default BfrmSec3


interface FormData {
    canCommunicate: string;
    hasFinAssets: string;
    ownMoreTwoFifePercent: string;
}

const AccountingForm = () => {
    const [formData, setFormData] = useState<FormData>({
        canCommunicate: "no",
        hasFinAssets: "no",
        ownMoreTwoFifePercent: "no",
        
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
                            {field === "canCommunicate" && "Are your nationality and country of residence the same?(Please note that if your nationality and country of residence are different, your account opening may be rejected depending on the bank.)"}
                            {field === "hasFinAssets" && "Are you a U.S. citizen, permanent resident, tax resident, or taxpayer? If you answered 'Yes', the service may not be available."}
                            {field === "ownMoreTwoFifePercent" && "Do you have a Hong Kong ID card?"}                          
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