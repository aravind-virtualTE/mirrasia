import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const RenewalRequestForm = () => {
  const [formState, setFormState] = useState({
    email: "",
    companyName: "",
    applicantName: "",
    industries: [] as string[],
    otherIndustry: "",
    incomingTransactions: [] as string[],
    otherIncoming: "",
    outgoingTransactions: [] as string[],
    otherOutgoing: "",
    changeParticulars: "",
    contactPersonChange: "",
    originOfFunds: [] as string[],
    otherOrigin: "",
    contactChanges: [] as string[],
    otherContactChange: "",
    bodyCorporateShareholder: "",
    paymentMethod: [] as string[],
    otherPayment: "",


  });


  const [errors, setErrors] = useState({
    email: "",
    companyName: "",
    applicantName: "",
    industries: "",
    incomingTransactions: "",
    outgoingTransactions: "",
    changeParticulars: "",
    contactPersonChange: "",
    originOfFunds: "",
    contactChanges: "",
    bodyCorporateShareholder: "",
    paymentMethod: "",

  });
  const paymentOptions = [
    "Credit Card or Debit Card Payment (4% for HKD, 6% for USD fee )",
    "Telegraphic Transfer or Hong Kong Local transfer (All the bank charges are requested to be borne by remitter)",
  ];



  const industryOptions = [
    "Trade",
    "Wholesale/retail business",
    "Consulting",
    "Manufacturing",
    "Investment and advisory business",
    "E-commerce",
    "Online purchasing/shipment/selling agency",
    "IT and software development",
    "Cryptocurrency related business (ICO, wallet, exchange)",
    "Real Estate Investment/Development",
    "Government related business",
    "Development/transaction/trade of Energy/natural resource/commodity trade",
    "others"
  ];

  const incomingOptions = [
    "Employment Income",
    "Beneficial Owner's Savings / Deposit",
    "Sales of Property / Equity / Other investment asset",
    "Loan",
    "Business Income",
    "Agent Commission Income",
    "Dividend income from subsidiaries",
    "Inheritance",
    "Government Subsidies",
    "Others"
  ];

  const outgoingOptions = [
    "Investment to Subsidiaries / Related companies",
    "Loan Repayment to shareholders or directors",
    "Interest Payment to Financial Institution",
    "Purchase of goods/commodities",
    "Administrative Expenses (Salary/Wages)",
    "Agent Commission Expenses",
    "others",
  ];

  const handleChange = <T extends keyof typeof formState>(
    field: T,
    value: typeof formState[T]
  ) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    const newErrors = {
      email: formState.email ? "" : "Email is required.",
      companyName: formState.companyName ? "" : "Company name is required.",
      applicantName: formState.applicantName ? "" : "Applicant name is required.",
      industries: formState.industries.length
        ? ""
        : "Please select at least one industry.",
      incomingTransactions: formState.incomingTransactions.length
        ? ""
        : "Please select at least one source of incoming transaction.",
      outgoingTransactions: formState.outgoingTransactions.length
        ? ""
        : "Please select at least one nature of outgoing transaction.",
      originOfFunds: formState.originOfFunds.length
        ? ""
        : "Please select at least one origin of funds.",
      changeParticulars: formState.changeParticulars
        ? ""
        : "Please answer about the change in particulars.",
      contactPersonChange: formState.contactPersonChange
        ? ""
        : "Please answer if the designated contact person has changed.",
      contactChanges: formState.contactChanges.length
        ? ""
        : "Please select at least one contact change option.",
      bodyCorporateShareholder: formState.bodyCorporateShareholder
        ? ""
        : "Please select an option for Body Corporate Shareholder.",
      paymentMethod: formState.paymentMethod.length
        ? ""
        : "Please select at least one payment method.",

    };


    setErrors(newErrors);

    if (Object.values(newErrors).every((error) => error === "")) {
      console.log("Form Submitted Successfully:", formState);
      alert("Form submitted successfully!");
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>HK Company Renewal Request Form</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-gray-600 text-sm mb-6">
          <p>Mirr Asia</p>
          <p>(Korea) 070-8810-6187 &nbsp; (Hong Kong) 2187-2428</p>
          <p>Kakao Talk: mirrasia &nbsp; WeChat: mirrasia_hk</p>
          <p>
            Website:{" "}
            <a
              href="https://www.mirrasia.com"
              className="text-blue-500 underline"
              target="_blank"
            >
              www.mirrasia.com
            </a>
          </p>
          <p>
            Plus Friend:{" "}
            <a
              href="https://pf.kakao.com/_KxmnZT"
              className="text-blue-500 underline"
              target="_blank"
            >
              https://pf.kakao.com/_KxmnZT
            </a>
          </p>

          <p className="mt-6">
            This application is in the form of a questionnaire about information
            necessary for the company to proceed with the renewal. If you write the
            exact details as possible for the question, the person in charge will
            provide feedback immediately. If you have any difficulties in answering
            questions, please contact us at the contact information above.
          </p>
          <p className="text-red-500 text-sm font-medium mt-3">
            * Indicates required question
          </p>
        </div>

        {/* Email */}
        <div className="mt-6 ">
          <Label htmlFor="email" className="text-base font-medium">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            placeholder="Cannot pre-fill email"
            disabled
            className="mt-2"
          />
        </div>

        {/* Company Name */}
        <div className="mt-6">
          <Label>Company Name <span className="text-red-500">*</span></Label>
          <Input
            placeholder="Enter company name"
            value={formState.companyName}
            onChange={(e) => handleChange("companyName", e.target.value)}
          />
          {errors.companyName && (
            <Alert variant="destructive">
              <AlertDescription>{errors.companyName}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Applicant Name */}
        <div className="mt-6">
          <Label>Name of Applicant <span className="text-red-500">*</span></Label>
          <Input
            placeholder="Enter applicant name"
            value={formState.applicantName}
            onChange={(e) => handleChange("applicantName", e.target.value)}
          />
          {errors.applicantName && (
            <Alert variant="destructive">
              <AlertDescription>{errors.applicantName}</AlertDescription>
            </Alert>
          )}
        </div>
        <p className="mt-6 text-black-500">Please Provide Information of HK company and related businesses</p>
        {/* Industry Selection */}
        <div className="mt-4 space-y-2">
          <Label>Select Industry <span className="text-red-500">*</span></Label>
          {industryOptions.map((industry) => (
            <div key={industry} className="flex items-center space-x-2">
              <Checkbox
                onCheckedChange={(checked) =>
                  handleChange(
                    "industries",
                    checked
                      ? [...formState.industries, industry]
                      : formState.industries.filter((i) => i !== industry)
                  )
                }
              />
              <Label>{industry}</Label>
            </div>
          ))}
        </div>

        {/* Source of Incoming Transactions */}
        <div className="mt-4 space-y-2">
          <Label>Source of Incoming Transactions <span className="text-red-500">*</span></Label>
          {incomingOptions.map((source) => (
            <div key={source} className="flex items-center space-x-2">
              <Checkbox
                onCheckedChange={(checked) =>
                  handleChange(
                    "incomingTransactions",
                    checked
                      ? [...formState.incomingTransactions, source]
                      : formState.incomingTransactions.filter((s) => s !== source)
                  )
                }
              />
              <Label>{source}</Label>
            </div>
          ))}
        </div>
        {/* Outgoing Transactions */}
        <div className="mt-6">
          <Label>Nature of Outgoing Transactions <span className="text-red-500">*</span></Label>
          <div className="mt-4 space-y-2">
            {outgoingOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={formState.outgoingTransactions.includes(option)}
                  onCheckedChange={(checked) =>
                    handleChange(
                      "outgoingTransactions",
                      checked
                        ? [...formState.outgoingTransactions, option]
                        : formState.outgoingTransactions.filter((o) => o !== option)
                    )
                  }
                />
                <Label htmlFor={option} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
            {/* Other Option Input */}
            {formState.outgoingTransactions.includes("Others") && (
              <div className="flex items-center space-x-2 mt-2">
                <Label htmlFor="otherOutgoing" className="text-sm">
                  Specify Other:
                </Label>
                <Input
                  id="otherOutgoing"
                  placeholder="Enter other outgoing transaction"
                  value={formState.otherOutgoing}
                  onChange={(e) => handleChange("otherOutgoing", e.target.value)}
                  className="w-full"
                />
              </div>
            )}
          </div>
          {/* Error Message */}
          {errors.outgoingTransactions && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.outgoingTransactions}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Origin of Source of Funds */}
        <div className="mt-6">
          <Label className="text-sm font-bold">
            Origin of Source of Funds <span className="text-red-500">*</span>
          </Label>
          <div className="mt-4 space-y-2">
            {["Hong Kong", "United States", "China"].map((country) => (
              <div key={country} className="flex items-center space-x-2">
                <Checkbox
                  id={country}
                  checked={formState.incomingTransactions.includes(country)}
                  onCheckedChange={(checked) =>
                    handleChange(
                      "incomingTransactions",
                      checked
                        ? [...formState.incomingTransactions, country]
                        : formState.incomingTransactions.filter((c) => c !== country)
                    )
                  }
                />
                <Label htmlFor={country} className="text-sm">
                  {country}
                </Label>
              </div>
            ))}
            {/* Other Option */}
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="otherIncoming"
                checked={!!formState.otherIncoming}
                onCheckedChange={(checked) => handleChange("otherIncoming", checked ? "" : "")}
              />
              <Label htmlFor="otherIncoming" className="text-sm">Other:</Label>
              <Input
                placeholder="Specify other origin"
                value={formState.otherIncoming}
                onChange={(e) => handleChange("otherIncoming", e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          {/* Error Message */}
          {errors.incomingTransactions && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.incomingTransactions}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Change in Particulars */}
        <div className="mt-6">
          <Label className="text-sm font-bold">
            Regarding the shareholder/director/designated contact person registered in
            a Hong Kong company, is there any change in particulars for the past 1 year,
            such as passport number, residential address?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={formState.changeParticulars}
            onValueChange={(value) => handleChange("changeParticulars", value)}
            className="mt-4 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="change-yes" value="Yes" />
              <Label htmlFor="change-yes" className="text-sm">
                Yes (Please provide relevant documents)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="change-no" value="No" />
              <Label htmlFor="change-no" className="text-sm">
                No (Please provide latest residential address proof issued within 3
                months)
              </Label>
            </div>
          </RadioGroup>
          {errors.changeParticulars && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.changeParticulars}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Designated Contact Person Change */}
        <div className="mt-8 border-t pt-6">
          <Label className="text-sm font-bold">
            Has the designated contact person changed to another person?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={formState.contactPersonChange}
            onValueChange={(value) => handleChange("contactPersonChange", value)}
            className="mt-4 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="contact-yes" value="Yes" />
              <Label htmlFor="contact-yes" className="text-sm">
                Yes (Please provide the valid passport copy and latest residential
                address issued within last 3 months of new designated contact person)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="contact-no" value="No" />
              <Label htmlFor="contact-no" className="text-sm">
                No (Please provide the latest residential address proof issued within
                last three months)
              </Label>
            </div>
          </RadioGroup>
          {errors.contactPersonChange && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.contactPersonChange}</AlertDescription>
            </Alert>
          )}
        </div>
        {/* Contact Information Change Section */}
        <div className="mt-6">
          <Label className="text-sm font-bold">
            If the contact information of the shareholder(s)/director(s)/designated contact person has changed, please check the relevant information and write it in the "Others" section.
            <span className="text-red-500">*</span></Label>
          <div className="mt-4 space-y-2">
            {["Email", "Mobile Phone", "Office Tel", "No change"].map((item) => (
              <div key={item} className="flex items-center space-x-2">
                <Checkbox
                  id={item}
                  checked={formState.contactChanges.includes(item)}
                  onCheckedChange={(checked) =>
                    handleChange(
                      "contactChanges",
                      checked
                        ? [...formState.contactChanges, item]
                        : formState.contactChanges.filter((i) => i !== item)
                    )
                  }
                />
                <Label htmlFor={item} className="text-sm">
                  {item}
                </Label>
              </div>
            ))}
            {/* Other Option */}
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="Other"
                checked={!!formState.otherContactChange}
                onCheckedChange={(checked) =>
                  handleChange("otherContactChange", checked ? "" : "")
                }
              />
              <Label htmlFor="Other" className="text-sm">Other:</Label>
              <Input
                placeholder="Specify other contact change"
                value={formState.otherContactChange}
                onChange={(e) =>
                  handleChange("otherContactChange", e.target.value)
                }
                className="w-full"
              />
            </div>
          </div>
          {errors.contactChanges && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.contactChanges}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Body Corporate Shareholder Section */}
        <div className="mt-8 border-t pt-6">
          <Label className="text-sm font-bold">
            Is the shareholder of the Hong Kong Company the Body Corporate?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={formState.bodyCorporateShareholder}
            onValueChange={(value) =>
              handleChange("bodyCorporateShareholder", value)
            }
            className="mt-4 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="body-yes" value="Yes" />
              <Label htmlFor="body-yes" className="text-sm">
                Yes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="body-no" value="No" />
              <Label htmlFor="body-no" className="text-sm">
                No
              </Label>
            </div>
          </RadioGroup>
          {errors.bodyCorporateShareholder && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>
                {errors.bodyCorporateShareholder}
              </AlertDescription>
            </Alert>
          )}
        </div>
        <div className="mt-8 border rounded-lg p-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-4">
            Please send an email with the required documents. (Email address:{" "}
            <a
              href="mailto:cs1@mirrasia.com"
              className="text-blue-500 underline hover:text-blue-600"
            >
              cs1@mirrasia.com
            </a>
            )
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>
              <span className="font-medium">(Required)</span> Please provide English
              documents that prove the address of the shareholders, directors, and
              designated contact person within the last 3 months. (Required submission
              even if there are no changes)
            </li>
            <li>
              <span className="font-medium">(If any)</span> If the passport of the
              shareholder/director/designated contact person has changed, please submit
              a copy of the valid passport.
            </li>
            <li>
              If the shareholders are a corporation (parent company), please submit a
              scanned copy or soft copy of the{" "}
              <span className="font-medium">
                English Business Registration Certificate
              </span>{" "}
              issued within the last 3 months of the corporate shareholder and a scanned
              copy of the latest shareholder list (with the Company Chop) - This is a
              mandatory required document even if there is no change.
            </li>
            <li>
              If the corporate shareholder's representative is changed to another
              person, please provide a scanned copy of the corporate shareholder's
              representative's passport copy and the English version of residence
              address proof issued within the last 3 months.
            </li>
            <li>
              If you have any other matters related to the change, please submit the
              documents together or let us know.
            </li>
          </ol>
          <div className="mt-4 text-sm">
            <span className="font-medium">Email address to submit documents: </span>
            <a
              href="mailto:cs1@mirrasia.com"
              className="text-blue-500 underline hover:text-blue-600"
            >
              cs1@mirrasia.com
            </a>
          </div>
        </div>
        {/* Payment Method Section */}
        <div className="mt-6">
          <Label className="text-sm font-bold">
            Please choose the payment method of Hong Kong company renewal service fees. <span className="text-red-500">*</span>
          </Label>
          <div className="mt-4 space-y-2">
            {paymentOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={formState.paymentMethod.includes(option)}
                  onCheckedChange={(checked) =>
                    handleChange(
                      "paymentMethod",
                      checked
                        ? [...formState.paymentMethod, option]
                        : formState.paymentMethod.filter((i) => i !== option)
                    )
                  }
                />
                <Label htmlFor={option} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
            {/* Other Option */}
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="otherPayment"
                checked={!!formState.otherPayment}
                onCheckedChange={(checked) =>
                  handleChange("otherPayment", checked ? "" : "")
                }
              />
              <Label htmlFor="otherPayment" className="text-sm">Other:</Label>
              <Input
                placeholder="Specify other payment method"
                value={formState.otherPayment}
                onChange={(e) => handleChange("otherPayment", e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          {errors.paymentMethod && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.paymentMethod}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Completed Section */}
        <div className="mt-8 p-4 bg-gray-50 border rounded-md">
          <h2 className="text-lg font-semibold mb-2">Completed</h2>
          <p className="text-sm">
            Well done! We will check the contents of your reply, and our
            consultant will contact you shortly.
          </p>
        </div>
        {/* Submit */}
        <div className="mt-8 flex justify-end">
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RenewalRequestForm;
