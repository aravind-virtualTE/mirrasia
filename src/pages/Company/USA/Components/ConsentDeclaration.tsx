import { useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const ConsentDeclaration = () => {
    const [selectedOption, setSelectedOption] = useState("");
    const [otherText, setOtherText] = useState("");

    const handleOptionChange = (value: string) => {
        setSelectedOption(value);
        if (value !== "other") {
            setOtherText("");
        }
    };

    return (
        <Card className="max-w-5xl mx-auto mt-4">
            <CardHeader className="bg-sky-100 dark:bg-sky-900">
                <CardTitle className="text-lg font-medium">
                    Consent and declaration of application
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Label className="block text-sm font-medium text-gray-700">
                        You agree to provide documents and information for the Company's business in connection with the Service, and you agree that the purpose of establishing and operating the Company is for the purpose of legitimate and lawful business in relation to the Service. In the operation of a corporation after incorporation, the Company is not obligated to provide assistance or advice on matters that violate the law, and the Company reserves the right to suspend the service if it is determined that there is a violation of the law or an intention to do so. You declare that everything you write in this application is true, complete and accurate to the best of your knowledge. Do you agree with this?
                    </Label>
                    <RadioGroup
                        value={selectedOption}
                        onValueChange={handleOptionChange}
                        className="flex gap-6"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="yes" />
                            <Label htmlFor="yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="no" />
                            <Label htmlFor="no">No</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="other" id="other" />
                            <Label htmlFor="other">Other:</Label>
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

export default ConsentDeclaration;