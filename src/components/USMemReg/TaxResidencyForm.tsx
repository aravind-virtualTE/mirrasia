import { useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const TaxResidencyForm = () => {
  const [selectedOption, setSelectedOption] = useState("");
  const [otherText, setOtherText] = useState("");

  const handleOptionChange = (value : string) => {
    setSelectedOption(value);
    if (value !== "other") {
      setOtherText("");
    }
  };

  return (
    <Card className="max-w-5xl mx-auto mt-4">     
      <CardHeader className="bg-sky-100 dark:bg-sky-900">
        <CardTitle className="text-lg font-medium">
        Determine if you are a U.S. resident for tax purposes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Label className="block text-sm font-medium text-gray-700">
            Are you a U.S. citizen or permanent resident, or a U.S. resident for
            tax purposes?
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
          <div className="space-y-2">
          <Label htmlFor="isUsCitizen">
          If you are a U.S. citizen or permanent resident, or a U.S. resident under the tax law, please file an IRS U.S. Tax Identification Attorney.{" "}
            <span className="text-destructive">*</span>
          </Label>
          <Input id="isUsCitizen" placeholder="Your answer" required />
        </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaxResidencyForm;