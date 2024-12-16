import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const QuotationForm = () => {

  const [formState, setFormState] = useState({
    email: "",
    companyName: "",
    registeredCustomer: "",
    accountingSettlementDate: "",
    lastTaxReturn: "",
    workEndPeriod: "",
    workEndDate: "",
    bondsClosed: "",
    assetsInventory: "",
    corporateAccountEndDate: "",
    specialRequirements: "",
  });

  const handleChange = <T extends keyof typeof formState>(
    field: T,
    value: typeof formState[T]
  ) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    console.log("Form State:", formState);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quotation for Closure of Your Hong Kong Company</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="space-y-4 text-sm text-gray-600">
          <p className="font-semibold text-black">Mirr Asia</p>
          <p>
            (Korea) 070-8810-6187 &nbsp; (Hong Kong) 2187-2428 <br />
            Kakao talk: <span className="font-medium">mirrasia</span> &nbsp;
            WeChat: <span className="font-medium">mirrasia_hk</span>
          </p>
          <p>
            Website:{" "}
            <a
              href="https://www.mirrasia.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              www.mirrasia.com
            </a>
          </p>
          <p>
            Plus Friend:{" "}
            <a
              href="https://pf.kakao.com/_KxmnZT"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              https://pf.kakao.com/_KxmnZT
            </a>
          </p>
          <p>
            This application is in the form of a questionnaire about information
            necessary for the company to proceed with the closing of business.
            If you write the exact details as possible for the question, the
            person in charge will provide feedback immediately. If you have any
            difficulties in answering questions, please contact us at the
            contact information above.
          </p>
        </div>
        {/* Email */}
        <div className="mt-6">
          <Label>Email <span className="text-red-500">*</span></Label>
          <Input
            placeholder="Your email"
            value={formState.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>

        {/* Company Name */}
        <div className="mt-6">
          <Label>Company Name <span className="text-red-500"><span className="text-red-500">*</span></span></Label>
          <Input
            placeholder="Enter company name"
            value={formState.companyName}
            onChange={(e) => handleChange("companyName", e.target.value)}
          />
        </div>

        {/* Registered Customer */}
        <div className="mt-6">
          <Label>Are you a registered customer of Mirr Asia? <span className="text-red-500">*</span></Label>
          <RadioGroup
            value={formState.registeredCustomer}
            onValueChange={(value) => handleChange("registeredCustomer", value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="yes" value="Yes" />
              <Label htmlFor="yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="no" value="No" />
              <Label htmlFor="no">No</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Accounting Settlement Date */}
        <div className="mt-6">
          <Label>
            When is the accounting settlement date? <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={formState.accountingSettlementDate}
            onValueChange={(value) =>
              handleChange("accountingSettlementDate", value)
            }
          >
            {["December 31", "March 31", "Do not know", "Other"].map((item) => (
              <div key={item} className="flex items-center space-x-2 mt-2">
                <RadioGroupItem id={item} value={item} />
                <Label htmlFor={item}>{item}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Last Tax Return */}
        <div className="mt-6">
          <Label>
            When was the last tax return? <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={formState.lastTaxReturn}
            onValueChange={(value) => handleChange("lastTaxReturn", value)}
          >
            {[
              "Within 6 months",
              "6 months or more and within 1 year",
              "1 year or more and within 2 years",
              "Do not know",
              "Other",
            ].map((item) => (
              <div key={item} className="flex items-center space-x-2 mt-2">
                <RadioGroupItem id={item} value={item} />
                <Label htmlFor={item}>{item}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Work End Period */}
        <div className="mt-6">
          <Label>
            When was the end of work or expected end date? <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={formState.workEndPeriod}
            onValueChange={(value) => handleChange("workEndPeriod", value)}
          >
            {[
              "Within 6 months",
              "6 months or more and within 1 year",
              "1 year or more and within 2 years",
              "Do not know",
              "Other",
            ].map((item) => (
              <div key={item} className="flex items-center space-x-2 mt-2">
                <RadioGroupItem id={item} value={item} />
                <Label htmlFor={item}>{item}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Work End Date */}
        <div className="mt-6">
          <Label htmlFor="workEndDate">When is the end of work or expected end date? <span className="text-red-500">*</span></Label>
          <Input
            type="date"
            id="workEndDate"
            value={formState.workEndDate}
            onChange={(e) => handleChange("workEndDate", e.target.value)}
          />
        </div>

        {/* Bonds Closed */}
        <div className="mt-6">
          <Label>
            Are all bonds and debts reimbursed or closed at the end of business? <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={formState.bondsClosed}
            onValueChange={(value) => handleChange("bondsClosed", value)}
          >
            {["Yes", "No", "Do not know"].map((item) => (
              <div key={item} className="flex items-center space-x-2">
                <RadioGroupItem id={item} value={item} />
                <Label htmlFor={item}>{item}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Assets Inventory */}
        <div className="mt-6">
          <Label>Do you have assets or inventory at the end of business? <span className="text-red-500">*</span></Label>
          <RadioGroup
            value={formState.assetsInventory}
            onValueChange={(value) => handleChange("assetsInventory", value)}
          >
            {["Yes", "No", "Do not know"].map((item) => (
              <div key={item} className="flex items-center space-x-2">
                <RadioGroupItem id={item} value={item} />
                <Label htmlFor={item}>{item}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Corporate Account End Date */}
        <div className="mt-6">
          <Label htmlFor="corporateAccountEndDate">
            When is the corporate account service end or expected end date? <span className="text-red-500">*</span>
          </Label>
          <Input
            type="date"
            id="corporateAccountEndDate"
            value={formState.corporateAccountEndDate}
            onChange={(e) =>
              handleChange("corporateAccountEndDate", e.target.value)
            }
          />
        </div>

        {/* Special Requirements */}
        <div className="mt-6">
          <Label>If you have any special requirements, please provide them:</Label>
          <Textarea
            placeholder="Your answer"
            value={formState.specialRequirements}
            onChange={(e) =>
              handleChange("specialRequirements", e.target.value)
            }
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-6">
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuotationForm;
