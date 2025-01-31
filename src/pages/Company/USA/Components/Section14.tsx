import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const Section14: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string>("");

  const handleOptionChange = (value: string) => {
    setSelectedOption(value);
  };

  return (
    <Card className="max-w-5xl mx-auto mt-2">
      <CardHeader className="bg-sky-100 dark:bg-sky-900">
        <CardTitle className="text-lg font-medium">Section 14</CardTitle>
        <p className="inline-flex">
          Consent and Declaration on Application
        </p>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Consent Statement */}
        <div className="space-y-2">
          <Label htmlFor="relationbtwauth" className="inline-flex">
            You agree to provide us with documents and information for our
            business operations in relation to this service, and you agree that
            the purpose of establishing and operating the company is legitimate
            and for legal business. After the establishment of the company, we
            are not obligated to provide assistance or advice.
          </Label>
          
          {/* Radio Button Group */}
          <RadioGroup value={selectedOption} onValueChange={handleOptionChange}>
            <div className="flex gap-4">
              <Label className="flex items-center space-x-2 cursor-pointer">
                <RadioGroupItem value="yes" />
                <span>Yes</span>
              </Label>

              <Label className="flex items-center space-x-2 cursor-pointer">
                <RadioGroupItem value="no" />
                <span>No</span>
              </Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
};

export default Section14;
