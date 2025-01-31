import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";

const Section15: React.FC = () => {
    const [selectedOption, setSelectedOption] = useState<string>("");
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
                <CardTitle className="text-lg font-medium">Section 14</CardTitle>
                <p className="inline-flex">
                    Select payment option
                </p>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                {/* Consent Statement */}
                <div className="space-y-2">
                    <Label htmlFor="relationbtwauth" className="inline-flex">
                        Please select a payment method for your establishment costs.
                    </Label>

                    {/* Radio Button Group */}
                    <RadioGroup value={selectedOption} onValueChange={handleOptionChange}>
                        <div className="flex gap-4">
                            <Label className="flex items-center space-x-2 cursor-pointer">
                                <RadioGroupItem value="creditCard" />
                                <span>Credit card payment (separate 3.5% fee)
                                </span>
                            </Label>

                            <Label className="flex items-center space-x-2 cursor-pointer">
                                <RadioGroupItem value="OverseasRemittance" />
                                <span>Overseas remittance
                                </span>
                            </Label>
                            <Label className="flex items-center space-x-2 cursor-pointer">
                                <RadioGroupItem value="other" />
                                <span>other
                                </span>
                            </Label>
                        </div>
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
            </CardContent>
        </Card>
    );
};

export default Section15;
