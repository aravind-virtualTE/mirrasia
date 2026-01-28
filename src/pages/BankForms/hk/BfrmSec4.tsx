import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState } from "react"


const BfrmSec4 = () => {
 
    return (
        <Card className="max-w-5xl mx-auto mt-2">
            <CardHeader className="bg-sky-100 dark:bg-sky-900">
                <CardTitle className="text-lg font-medium">Important Notes</CardTitle>         
            </CardHeader>
            <CardContent className="space-y-6 pt-6">                
                <AccountingForm />
            </CardContent>
        </Card>
    )
}

export default BfrmSec4


interface FormData {
    hasBnkHKAccount: string;
    openHkNdRejected: string;
    refusedInPast: string;
    isPoliticalFig: string;
}

const AccountingForm = () => {
    const [formData, setFormData] = useState<FormData>({
        hasBnkHKAccount: "no",
        openHkNdRejected: "no",
        refusedInPast: "no",
        isPoliticalFig: "no"
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
                            {field === "hasBnkHKAccount" && "Have you ever held a bank account in Hong Kong in the past, but had the account closed unilaterally by the bank?"}
                            {field === "openHkNdRejected" && "Have you ever tried to open a bank account in Hong Kong and been rejected?"}
                            {field === "refusedInPast" && "Have you ever been refused service by us in the past?"}
                            {field === "isPoliticalFig" && "Do you or any of your immediate family members fall into the category of politically prominent figures? Eg) Government agency or high-ranking officials of the Ministry of National Defense, politicians, or their immediate family members"}
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