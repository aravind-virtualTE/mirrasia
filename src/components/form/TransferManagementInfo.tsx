import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "../ui/button";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup,RadioGroupItem } from "../ui/radio-group";
import { Tooltip,TooltipTrigger,TooltipContent } from "../ui/tooltip";
import { HelpCircle } from "lucide-react";
const TransferManagementInfo = () => {
  const [formState, setFormState] = useState({
    email: "",
    applicantName: "",
    contactInformation: "",
    relationships: [] as string[],  
    otherRelationship: "",
    designatedContactPerson: "",
    otherDesignatedContact: "",
    legalIssues: "",
    otherLegalIssues: "",
    annualRenewalAgreement: "",
    accountingTaxAgreement: "",
    offshoreIncomeClaim: "",
    taxEvadePlan: "",
    otherTaxEvade: "",
    currentBusinessActivity: "",
    connectedPartyPresence: "",
    crimeaBusinessActivity: "",
    exposureToRussia: "",
    industry: [] as string[],
    otherIndustry: "",
    purposeOfOperation: [] as string[],
    otherPurpose: "",
    openedBankAccount: "",
    otherBankAccount: "",
    productDescription: "",
    cryptoActivities: "",
    otherCryptoActivities: "",
    financialYearEnd: "",
    otherFinancialYear: "",
    lastTaxReturn: "",
    otherTaxReturn: "",
    lastAudit: "",
    otherAudit: "",
    bookkeeping: "",
    otherBookkeeping: "",
    lastAccountingYearEnd: "",
    xeroSoftware: "",
    otherXeroOption: "",
    currentAccountingSoftware: "",
    selectedServices: [] as string[],
    otherService: "",
    transferReasons: [] as string[],
    otherReason: "",
    notifyFormerServiceProvider: "",
    documentsToSubmit: [] as string[],
    otherDocument: "",
    preferredVerificationMethod: "",
    otherVerificationMethod: "",
    describeSolutions: "",
  });

  const [errors, setErrors] = useState({
    applicantName: "",
    contactInformation: "",
    relationships: "",
    designatedContactPerson: "",
    legalIssues: "",
    annualRenewalAgreement: "",
    accountingTaxAgreement: "",
    offshoreIncomeClaim: "",
    taxEvadePlan: "",
    currentBusinessActivity: "",
    connectedPartyPresence: "",
    crimeaBusinessActivity: "",
    exposureToRussia: "",
    industry: "",
    purposeOfOperation: "",
    openedBankAccount: "",
    productDescription: "",
    cryptoActivities: "",
    financialYearEnd: "",
    lastTaxReturn: "",
    lastAudit: "",
    bookkeeping: "",
    xeroSoftware: "",
    currentAccountingSoftware: "",
    selectedServices: "",
    transferReasons: "",
    notifyFormerServiceProvider: "",
    documentsToSubmit: "",
    preferredVerificationMethod: "",
    describeSolutions: "",


  });

  // Options for  mapping
  const relationshipOptions = [
    "Director of the Hong Kong company",
    "Delegated by the director of the Hong Kong company",
    "Shareholder of the Hong Kong company holding majority of the shares",
    "A professional (e.g. lawyer, accountant) who provides incorporation advice to the Hong Kong company",
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
    "Cryptocurrency related business (ICO, exchange, wallet service, etc.)",
    "Real Estate Investment/Development",
    "Government related business",
    "Development/transaction/trade of energy/natural resource/commodity",
  ];
  const purposeOptions = [
    "Entering business in Hong Kong and Greater China",
    "Asset management by investing in real estate or financial assets",
    "Managing through investing in a subsidiary or affiliated company as a holding company",
    "Investor or business counterparty proposed you to establish a Hong Kong company",
    "Geographical benefits for international transactions",
    "Pursuing diversification of business due to relaxed regulations",
    "Pursuit of Competitive Advantage through relaxed financial regulations",
    "Increase transactional volume due to low tax rate and non-transactional tax (Non-VAT)",
    "Pursuit of investment profit due to No Capital Gain Tax",
  ];
  const servicesOptions = [
    "Company Secretary service *mandatory requirement for maintaining a Hong Kong company",
    "Company registered address *mandatory requirement for maintaining a Hong Kong company",
    "Accounting and taxation *mandatory requirement for maintaining a Hong Kong company",
    "Services relating to opening a bank account",
    "Trademark registration",
    "De-registration / Liquidation",
  ];

  const reasonsOptions = [
    "Existing service provider requested to transfer to Mirr Asia",
    "Loss of contact with the former service provider",
    "Refusal of service from the former service provider",
    "Dissatisfaction with services from the former service provider",
    "Cost issue",
    "Language issues with the former service provider",
    "The former service provider's services were terminated due to delay of renewal",
  ];
  const documentsOptions = [
    "Passport copy *required",
    "Address proof *Required",
    "Copy of Certificate of Incorporation",
    "Copy of Business Registration",
    "Copy of NNC1 (incorporation registration documents)",
    "Copy of NAR1 (renewal registration documents)",
  ];
  const verificationMethods = [
    "Selfie photo holding your passport",
    "Certified true copy of your passport",
    "Notarial certificate of your passport",
    "Visiting our office (Hong Kong, Seoul) to verify (visiting in person with your passport)",
  ];

  // Handle input changes
  const handleChange = (field: string, value: string | string[]) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };
  

  // Validate form fields
  const validateForm = () => {
    const newErrors = {
      applicantName: formState.applicantName ? "" : "Name of applicant is required.",
      contactInformation: formState.contactInformation
        ? ""
        : "Contact information is required.",
      relationships: formState.relationships.length
        ? ""
        : "Please select at least one relationship.",
      designatedContactPerson: formState.designatedContactPerson
        ? ""
        : "Please select a designated contact person.",
      legalIssues: formState.legalIssues ? "" : "Please answer the legal issues question.",  
      annualRenewalAgreement: formState.annualRenewalAgreement
      ? ""
      : "Please select an option for annual renewal agreement.",
    accountingTaxAgreement: formState.accountingTaxAgreement
      ? ""
      : "Please select an option for accounting and taxation agreement.",
      offshoreIncomeClaim: formState.offshoreIncomeClaim
      ? ""
      : "Please select an option for offshore income claim.",
      taxEvadePlan: formState.taxEvadePlan
      ? ""
      : "Please select an option regarding tax evasion plans.",
      currentBusinessActivity: formState.currentBusinessActivity
      ? ""
      : "Please select an option for current or planned business activity.",
    connectedPartyPresence: formState.connectedPartyPresence
      ? ""
      : "Please select an option for connected parties' presence.",
    crimeaBusinessActivity: formState.crimeaBusinessActivity
      ? ""
      : "Please select an option for Crimea/Sevastopol activities.",
      exposureToRussia: formState.exposureToRussia
      ? ""
      : "Please select an option regarding exposure to Russia.",
    industry: formState.industry.length
      ? ""
      : "Please select at least one industry.",
      purposeOfOperation: formState.purposeOfOperation.length
      ? ""
      : "Please select at least one purpose of operating the company.",
    openedBankAccount: formState.openedBankAccount
      ? ""
      : "Please select an option regarding bank account.",
    productDescription: formState.productDescription
      ? ""
      : "Product description is required.",
      cryptoActivities: formState.cryptoActivities
      ? ""
      : "Please select an option regarding cryptocurrency activities.",
    financialYearEnd: formState.financialYearEnd
      ? ""
      : "Please select a financial year-end date.",
      lastTaxReturn: formState.lastTaxReturn
      ? ""
      : "Please select when the last tax return was submitted.",
    lastAudit: formState.lastAudit
      ? ""
      : "Please select when the last audit was conducted.",
    bookkeeping: formState.bookkeeping
      ? ""
      : "Please select how bookkeeping is handled within your company.",
      xeroSoftware: formState.xeroSoftware
      ? ""
      : "Please select an option for implementing Xero software.",
    currentAccountingSoftware: formState.currentAccountingSoftware
      ? ""
      : "Please provide information on other accounting software.",
      selectedServices: formState.selectedServices.length
      ? ""
      : "Please select at least one service.",
    transferReasons: formState.transferReasons.length
      ? ""
      : "Please select at least one reason for transferring.",
      notifyFormerServiceProvider: formState.notifyFormerServiceProvider
      ? ""
      : "Please select an option.",
    documentsToSubmit: formState.documentsToSubmit.length
      ? ""
      : "Please select at least one document to submit.",
    preferredVerificationMethod: formState.preferredVerificationMethod
      ? ""
      : "Please select your preferred verification method.",
      describeSolutions: formState.describeSolutions.trim()
      ? ""
      : "Please describe the solutions.",
    };
    

    setErrors(newErrors);

    if (Object.values(newErrors).every((error) => error === "")) {
      console.log("Form submitted successfully:", formState);
      alert("Form submitted successfully!");
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Application for transfer of management services of Hong Kong company
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-gray-700 text-sm space-y-4">
          <p className="font-semibold">
            MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED
          </p>
          <p>
            Website:{" "}
            <a
              href="https://www.mirrasia.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              www.mirrasia.com
            </a>
          </p>
          <p>
            KakaoTalk/WeChat/LINE/Telegram:{" "}
            <span className="font-medium">mirrasia1</span>
          </p>
          <p>
            WhatsApp/Skype: <span className="font-medium">+852 9496 8804</span>
          </p>
          <p>
            Telephone:{" "}
            <span className="font-medium">
              (Hong Kong) +852-2187-2428 / (Korea) +82-2-543-6187
            </span>
          </p>
          <p>
            This application is for transferring the management services of your
            Hong Kong company from your existing or previous service provider to
            our company.
          </p>
          <p>
          Please answer the questions carefully as accurately as possible, then our staff will follow up with the right services for your needs.
          </p>
          <p>
          If you have any difficulties either to understand or answer, please contact us with the contact information above.
          </p>
          <p className="text-red-500 font-medium">* Indicates required question</p>
        </div>

        {/* Email Field */}
        <div className="mt-6">
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

        {/* Name of Applicant */}
        <div className="mt-6">
          <Label htmlFor="applicantName" className="text-base font-medium">
            Name of applicant <span className="text-red-500">*</span>
          </Label>
          <Input
            id="applicantName"
            placeholder="Enter the full official name"
            value={formState.applicantName}
            onChange={(e) => handleChange("applicantName", e.target.value)}
            className="mt-2"
          />
          {errors.applicantName && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.applicantName}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Contact Information */}
        <div className="mt-6">
          <Label htmlFor="contactInformation" className="text-base font-medium">
            Contact information of the above applicant (phone number, email, SNS
            account ID, etc.) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="contactInformation"
            placeholder="Enter contact details"
            value={formState.contactInformation}
            onChange={(e) => handleChange("contactInformation", e.target.value)}
            className="mt-2"
          />
          {errors.contactInformation && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.contactInformation}</AlertDescription>
            </Alert>
          )}  
        </div>

        {/* Relationship Selection */}
        <div className="mt-6 space-y-2">
          <Label className="text-base font-medium">
            Relationship between the above applicant and the Hong Kong company{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-md text-sm">
                You can select multiple items as applied.
                </TooltipContent>
              </Tooltip>
 
          {relationshipOptions.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={option}
                checked={formState.relationships.includes(option)}
                onCheckedChange={(checked) => {
                  const updatedRelationships = checked
                    ? [...formState.relationships, option]
                    : formState.relationships.filter((rel) => rel !== option);
                  handleChange("relationships", updatedRelationships);
                }}
              />
              <Label htmlFor={option} className="text-sm">
                {option}
              </Label>
            </div>
          ))}
 
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox
              id="Other"
              onCheckedChange={(checked) =>
                handleChange("otherRelationship", checked ? "" : "")
              }
            />
            <Label htmlFor="Other" className="text-sm">Other:</Label>
            <Input
              placeholder="Specify other relationship"
              value={formState.otherRelationship}
              onChange={(e) => handleChange("otherRelationship", e.target.value)}
              className="w-full"
            />
          </div>
          {errors.relationships && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.relationships}</AlertDescription>
            </Alert>
          )}
        </div>
   {/* Designated Contact Person */}
   <div className="mt-6">
          <div className="flex items-center space-x-2">
            <Label className="text-base font-medium">
              Designated Contact Person <span className="text-red-500">*</span>
            </Label>
            {/* Tooltip for Information */}
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-gray-500 cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent className="max-w-md">
                <p>
                  You need to delegate a person ("designated contact person") who
                  will be in charge of contacting in relation to your company's
                  business, renewal, registration of documents, confirmations of
                  required information, and communications for various matters.
                  Appointment of the designated contact person is free for up to
                  1 person. For 2 or more, an annual fee of HKD 2,000 per person
                  applies. The designated person must submit the passport copy,
                  address proof, and personal verification.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <RadioGroup
            value={formState.designatedContactPerson}
            onValueChange={(value) => handleChange("designatedContactPerson", value)}
            className="mt-4 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="sole-director" value="Sole director" />
              <Label htmlFor="sole-director" className="text-sm">
                Sole director will hold the position as the designated contact
                person concurrently.
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="two-directors" value="Two or more directors" />
              <Label htmlFor="two-directors" className="text-sm">
                There are two or more directors, and one of them will hold the
                position as the designated contact person concurrently.
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="other" value="Other" />
              <Label htmlFor="other" className="text-sm">Other:</Label>
              <Input
                placeholder="Specify other"
                value={formState.otherDesignatedContact}
                onChange={(e) => handleChange("otherDesignatedContact", e.target.value)}
                className="w-full"
              />
            </div>
          </RadioGroup>
          {errors.designatedContactPerson && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.designatedContactPerson}</AlertDescription>
            </Alert>
          )}
        </div>
          {/* Legal or Ethical Issues Section */}
          <div className="mt-8">
          <p className="text-sm text-gray-600 mb-4">
            This section is intended to reduce misunderstandings by identifying
            the client's business intentions and ensuring they match the services we provide.
          </p>
          <Label className="text-base font-medium">
            Are there any <span className="font-semibold">legal or ethical issues</span> such as
            money laundering, gambling, tax evasion, avoidance of illegal business, fraud, etc.?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={formState.legalIssues}
            onValueChange={(value) => handleChange("legalIssues", value)}
            className="mt-4 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="yes" value="Yes" />
              <Label htmlFor="yes" className="text-sm">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="no" value="No" />
              <Label htmlFor="no" className="text-sm">No</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="do-not-know" value="Do not know" />
              <Label htmlFor="do-not-know" className="text-sm">Do not know</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="legal-advice" value="Consider legal advice" />
              <Label htmlFor="legal-advice" className="text-sm">
                Consider legal advice
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="other" value="Other" />
              <Label htmlFor="other" className="text-sm">Other:</Label>
              <Input
                placeholder="Specify other"
                value={formState.otherLegalIssues}
                onChange={(e) => handleChange("otherLegalIssues", e.target.value)}
                className="w-full"
              />
            </div>
          </RadioGroup>
          {errors.legalIssues && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.legalIssues}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Annual Renewal Agreement */}
        <div className="mt-8 border-t pt-6">
  <Label className="text-base font-medium">
    In order to maintain the Hong Kong company, annual renewal, secretary service renewal, 
    business registration renewal, accounting/tax, etc. will occur every year, and all these tasks 
    are accompanied by an obligation to provide related expenses and documentations. 
    Do you agree with this? <span className="text-red-500">*</span>
  </Label>
  <RadioGroup
    value={formState.annualRenewalAgreement}
    onValueChange={(value) => handleChange("annualRenewalAgreement", value)}
    className="mt-4 space-y-2"
  >
    {["Yes", "No", "I/We can handle on our own after incorporation", "Consultation required before proceeding"].map((option) => (
      <div key={option} className="flex items-center space-x-2">
        <RadioGroupItem value={option} id={option} />
        <Label htmlFor={option} className="text-sm">{option}</Label>
      </div>
    ))}
  </RadioGroup>
  {errors.annualRenewalAgreement && (
    <Alert variant="destructive" className="mt-2">
      <AlertDescription>{errors.annualRenewalAgreement}</AlertDescription>
    </Alert>
  )}
</div>
{/* Accounting and Taxation Agreement */}
<div className="mt-8 border-t pt-6">
  <Label className="text-base font-medium">
    When conducting accounting and taxation of the Hong Kong company, all bank statements, purchase data, 
    sales data, expenditure proof data, and salary payment proof data during the accounting period 
    must be submitted without false or distortion. We cannot arbitrarily or falsely write and handle this. 
    Do you agree with this? <span className="text-red-500">*</span>
  </Label>
  <RadioGroup
    value={formState.accountingTaxAgreement}
    onValueChange={(value) => handleChange("accountingTaxAgreement", value)}
    className="mt-4 space-y-2"
  >
    {["Yes", "No", "I/We can handle on our own after incorporation", "Consultation required before proceeding"].map((option) => (
      <div key={option} className="flex items-center space-x-2">
        <RadioGroupItem value={option} id={option} />
        <Label htmlFor={option} className="text-sm">{option}</Label>
      </div>
    ))}
  </RadioGroup>
  {errors.accountingTaxAgreement && (
    <Alert variant="destructive" className="mt-2">
      <AlertDescription>{errors.accountingTaxAgreement}</AlertDescription>
    </Alert>
  )}
</div>
{/* Offshore Income Claim Field */}
<div className="mt-8 border-t pt-6">
  <Label className="text-base font-medium">
    Are you planning to apply for tax exemption through an offshore income claim
    after establishing a Hong Kong corporation? <span className="text-red-500">*</span>

  {/* Tooltip Integration */}
 
 
    {/* Tooltip Icon */}
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="max-w-sm">
        
        Hong Kong maintains a tax-free policy on income generated outside of Hong Kong 
      as it applies the principle of territorial tax policy under S.14 of the Inland Revenue Ordinance. 
      However, the corporate tax may be levied in the country where the business is carried out. 
      If an offshore income claim is filed, it may increase audit fees and incur consultation and handling charges. 
      Please consider this when preparing relevant documents.
        
      </TooltipContent>
    </Tooltip>
  </Label>


  {/* Radio Group */}
  <RadioGroup
    value={formState.offshoreIncomeClaim}
    onValueChange={(value) => handleChange("offshoreIncomeClaim", value)}
    className="mt-4 space-y-2"
  >
    {[
      "Yes (Able to bear the fees accompanying offshore income claims and handling the inquiry letters from the IRD)",
      "No (Accounting/Taxing in the usual way)",
      "I/We can handle on our own after incorporation",
      "Consultation required before proceeding",
    ].map((option) => (
      <div key={option} className="flex items-center space-x-2">
        <RadioGroupItem value={option} id={option} />
        <Label htmlFor={option} className="text-sm">{option}</Label>
      </div>
    ))}
  </RadioGroup>

  {/* Validation Error */}
  {errors.offshoreIncomeClaim && (
    <Alert variant="destructive" className="mt-2">
      <AlertDescription>{errors.offshoreIncomeClaim}</AlertDescription>
    </Alert>
  )}
</div>
   {/* Question Section */}
          <div className="flex items-start space-x-2 mt-6">
            <Label className="text-base font-medium">
              Have you heard from your acquaintance or any source that a Hong Kong company is not required to pay any tax by reporting a nil return (not by claiming offshore income based on S.14 of the Inland Revenue Ordinance but simply marking as "nil") because your business is carried on outside of Hong Kong? Do you agree with this and have this kind of plan?{" "}
              <span className="text-red-500">*</span>
            {/* Tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-gray-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-md text-sm">
              If you have a plan to evade tax in this or a similar way, please let us know and consult in advance.
              </TooltipContent>
            </Tooltip>
            </Label>

          </div>
          {/* Radio Group */}
          <RadioGroup
            value={formState.taxEvadePlan}
            onValueChange={(value) => handleChange("taxEvadePlan", value)}
            className="mt-4 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="yes" value="Yes" />
              <Label htmlFor="yes" className="text-sm">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="no" value="No" />
              <Label htmlFor="no" className="text-sm">No</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="self-handle" value="Self Handle" />
              <Label htmlFor="self-handle" className="text-sm">
                I/We can handle on our own after incorporation
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="heard-no-plan" value="Heard No Plan" />
              <Label htmlFor="heard-no-plan" className="text-sm">
                I/We have heard about this but I/we have no such a plan to do it.
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="consult" value="Consult" />
              <Label htmlFor="consult" className="text-sm">
                Consultation required before proceeding
              </Label>
            </div>

            {/* Other Option */}
            <div className="flex items-center space-x-2 mt-2">
              <RadioGroupItem id="other" value="Other" />
              <Label htmlFor="other" className="text-sm">Other:</Label>
              <Input
                placeholder="Specify other"
                value={formState.otherTaxEvade}
                onChange={(e) => handleChange("otherTaxEvade", e.target.value)}
                className="w-full"
              />
            </div>
          </RadioGroup>
                    {/* Error Message */}
                    {errors.taxEvadePlan && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.taxEvadePlan}</AlertDescription>
            </Alert>
          )}

 
 <div className="mt-6">
          <Label className="text-base font-medium">
            To the best of your knowledge, does the Hong Kong company have any
            current or planned business activity in the following countries/regions
            (Iran, Sudan, North Korea, Syria, Cuba, South Sudan, Belarus or Zimbabwe)?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={formState.currentBusinessActivity}
            onValueChange={(value) =>
              handleChange("currentBusinessActivity", value)
            }
            className="mt-4 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="yes" value="Yes" />
              <Label htmlFor="yes" className="text-sm">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="no" value="No" />
              <Label htmlFor="no" className="text-sm">No</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="no-idea" value="No Idea" />
              <Label htmlFor="no-idea" className="text-sm">I/We have no idea</Label>
            </div>
          </RadioGroup>
          {errors.currentBusinessActivity && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.currentBusinessActivity}</AlertDescription>
            </Alert>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-4 mt-6">
            This section is whether your business has transactions with the country(s) subject to sanctions reulated or recommended y FATF, UNGC,OFAC, etc .please answer questions without distortions or errors
          </p>
 
        <div className="mt-8">
          <Label className="text-base font-medium">
            To the best of your knowledge, does the Hong Kong company or any of the
            company's connected or other related parties have a presence in Iran,
            Sudan, North Korea, Syria or Cuba, and/or are currently targeted by sanctions
            administered by the following bodies: UN, EU, UKHMT, HKMA, OFAC, or as
            part of local sanctions law? <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={formState.connectedPartyPresence}
            onValueChange={(value) =>
              handleChange("connectedPartyPresence", value)
            }
            className="mt-4 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="presence-yes" value="Yes" />
              <Label htmlFor="presence-yes" className="text-sm">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="presence-no" value="No" />
              <Label htmlFor="presence-no" className="text-sm">No</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="presence-no-idea" value="No Idea" />
              <Label htmlFor="presence-no-idea" className="text-sm">
                I/We have no idea
              </Label>
            </div>
          </RadioGroup>
          {errors.connectedPartyPresence && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.connectedPartyPresence}</AlertDescription>
            </Alert>
          )}
        </div>

 
        <div className="mt-8">
          <Label className="text-base font-medium">
            To the best of your knowledge, does the Hong Kong company or any of its
            connected or other related parties have any current or planned business
            activities in Crimea/Sevastopol Regions?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={formState.crimeaBusinessActivity}
            onValueChange={(value) =>
              handleChange("crimeaBusinessActivity", value)
            }
            className="mt-4 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="crimea-yes" value="Yes" />
              <Label htmlFor="crimea-yes" className="text-sm">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="crimea-no" value="No" />
              <Label htmlFor="crimea-no" className="text-sm">No</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="crimea-no-idea" value="No Idea" />
              <Label htmlFor="crimea-no-idea" className="text-sm">
                I/We have no idea
              </Label>
            </div>
          </RadioGroup>
          {errors.crimeaBusinessActivity && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.crimeaBusinessActivity}</AlertDescription>
            </Alert>
          )}
        </div>
          {/* Exposure to Russia */}
          <div className="mt-6">
          <Label className="text-base font-medium">
            To the best of your knowledge, does the Hong Kong company have any current
            or planned exposure to Russia in the energy/oil/gas sector, the military,
            or defense? <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={formState.exposureToRussia}
            onValueChange={(value) => handleChange("exposureToRussia", value)}
            className="mt-4 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="russia-yes" value="Yes" />
              <Label htmlFor="russia-yes" className="text-sm">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="russia-no" value="No" />
              <Label htmlFor="russia-no" className="text-sm">No</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="russia-no-idea" value="No Idea" />
              <Label htmlFor="russia-no-idea" className="text-sm">
                I/We have no idea
              </Label>
            </div>
          </RadioGroup>
          {errors.exposureToRussia && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.exposureToRussia}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Industry Selection */}
        <div className="mt-8">
          <Label className="text-base font-medium">
            Select Industry <span className="text-red-500">*</span>
          </Label>
          <div className="mt-4 space-y-2">
            {industryOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={formState.industry.includes(option)}
                  onCheckedChange={(checked) => {
                    const updatedIndustries = checked
                      ? [...formState.industry, option]
                      : formState.industry.filter((i) => i !== option);
                    handleChange("industry", updatedIndustries);
                  }}
                />
                <Label htmlFor={option} className="text-sm">{option}</Label>
              </div>
            ))}
          </div>

          {/* Other Industry */}
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox
              id="other"
              checked={!!formState.otherIndustry}
              onCheckedChange={(checked) => {
                if (!checked) handleChange("otherIndustry", "");
              }}
            />
            <Label htmlFor="other" className="text-sm">Other:</Label>
            <Input
              placeholder="Specify other industry"
              value={formState.otherIndustry}
              onChange={(e) => handleChange("otherIndustry", e.target.value)}
              className="w-full"
            />
          </div>
          {errors.industry && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.industry}</AlertDescription>
            </Alert>
          )}
        </div>
          {/* Product Description */}
          <div className="mt-6">
          <Label className="text-base font-medium">
            Description of the product name, product type, service content, service type,
            etc. <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="Enter product description"
            value={formState.productDescription}
            onChange={(e) => handleChange("productDescription", e.target.value)}
            className="mt-2"
          />
          {errors.productDescription && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.productDescription}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Purpose of Operation */}
        <div className="mt-8">
          <Label className="text-base font-medium">
            Purpose of operating the Hong Kong company and expected effects{" "}
            <span className="text-red-500">*</span>
          </Label>
          <div className="mt-4 space-y-2">
            {purposeOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={formState.purposeOfOperation.includes(option)}
                  onCheckedChange={(checked) => {
                    const updatedPurpose = checked
                      ? [...formState.purposeOfOperation, option]
                      : formState.purposeOfOperation.filter((p) => p !== option);
                    handleChange("purposeOfOperation", updatedPurpose);
                  }}
                />
                <Label htmlFor={option} className="text-sm">{option}</Label>
              </div>
            ))}
          </div>
          {/* Other Purpose */}
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox
              id="otherPurpose"
              checked={!!formState.otherPurpose}
              onCheckedChange={(checked) => {
                if (!checked) handleChange("otherPurpose", "");
              }}
            />
            <Label htmlFor="otherPurpose" className="text-sm">Other:</Label>
            <Input
              placeholder="Specify other purpose"
              value={formState.otherPurpose}
              onChange={(e) => handleChange("otherPurpose", e.target.value)}
              className="w-full"
            />
          </div>
          {errors.purposeOfOperation && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.purposeOfOperation}</AlertDescription>
            </Alert>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-4 mt-6">
            Buisness activities and bank accounts,financial transactions and other transactions
          </p>

        {/* Bank Account After Incorporation */}
        <div className="mt-8">
          <Label className="text-base font-medium">
            Have you opened any bank account after the incorporation?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={formState.openedBankAccount}
            onValueChange={(value) => handleChange("openedBankAccount", value)}
            className="mt-4 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="bank-yes" value="Yes" />
              <Label htmlFor="bank-yes" className="text-sm">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="bank-no" value="No" />
              <Label htmlFor="bank-no" className="text-sm">No</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="bank-other" value="Other" />
              <Label htmlFor="bank-other" className="text-sm">Other:</Label>
              <Input
                placeholder="Specify other option"
                value={formState.otherBankAccount}
                onChange={(e) => handleChange("otherBankAccount", e.target.value)}
                className="w-full"
              />
            </div>
          </RadioGroup>
          {errors.openedBankAccount && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.openedBankAccount}</AlertDescription>
            </Alert>
          )}
        </div>
         {/* Cryptocurrency Activities */}
         <div className="mt-6">
          <Label className="text-base font-medium">
            Have you had any activities related to cryptocurrency trading, investment,
            issuance, and related activities after the establishment of the company?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={formState.cryptoActivities}
            onValueChange={(value) => handleChange("cryptoActivities", value)}
            className="mt-4 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="crypto-yes" value="Yes" />
              <Label htmlFor="crypto-yes" className="text-sm">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="crypto-no" value="No" />
              <Label htmlFor="crypto-no" className="text-sm">No</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="crypto-other" value="Other" />
              <Label htmlFor="crypto-other" className="text-sm">Other:</Label>
              <Input
                placeholder="Specify other activities"
                value={formState.otherCryptoActivities}
                onChange={(e) => handleChange("otherCryptoActivities", e.target.value)}
                className="w-full"
              />
            </div>
          </RadioGroup>
          {errors.cryptoActivities && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.cryptoActivities}</AlertDescription>
            </Alert>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-4 mt-6">
           Accounting and Taxations
          </p>

        {/* Financial Year-End */}
        <div className="mt-8">
          <Label className="text-base font-medium">
            The financial year-end date of the Hong Kong company{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help"/>
              </TooltipTrigger>
              <TooltipContent className="max-w-md text-sm">    The first financial year-end date can be set freely within 18 months from
            incorporation. A profit tax return must be filed within 4 months from the
            financial year-end date.</TooltipContent>

          </Tooltip>
     
          <RadioGroup
            value={formState.financialYearEnd}
            onValueChange={(value) => handleChange("financialYearEnd", value)}
            className="mt-4 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="dec-31" value="December 31" />
              <Label htmlFor="dec-31" className="text-sm">December 31</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="mar-31" value="March 31" />
              <Label htmlFor="mar-31" className="text-sm">March 31 (Hong Kong's fiscal year-end date)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="undecided" value="Unknown or undecided" />
              <Label htmlFor="undecided" className="text-sm">Unknown or undecided</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="financial-other" value="Other" />
              <Label htmlFor="financial-other" className="text-sm">Other:</Label>
              <Input
                placeholder="Specify other date"
                value={formState.otherFinancialYear}
                onChange={(e) => handleChange("otherFinancialYear", e.target.value)}
                className="w-full"
              />
            </div>
          </RadioGroup>
          {errors.financialYearEnd && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.financialYearEnd}</AlertDescription>
            </Alert>
          )}
        </div>
         {/* Last Tax Return Submitted */}
         <div className="mt-6">
          <Label className="text-base font-medium">
            When was the last tax return submitted? <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={formState.lastTaxReturn}
            onValueChange={(value) => handleChange("lastTaxReturn", value)}
            className="mt-4 space-y-2"
          >
            {[
              "Not proceeded yet",
              "Within 6 months",
              "More than 6 months but within 1 year",
              "More than 1 year but within 2 years",
              "I/We have no idea",
            ].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem id={option} value={option} />
                <Label htmlFor={option} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
            {/* Other Option */}
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="other-tax-return" value="Other" />
              <Label htmlFor="other-tax-return" className="text-sm">Other:</Label>
              <Input
                placeholder="Specify other"
                value={formState.otherTaxReturn}
                onChange={(e) => handleChange("otherTaxReturn", e.target.value)}
                className="w-full"
              />
            </div>
          </RadioGroup>
          {errors.lastTaxReturn && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.lastTaxReturn}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Last Audit Conducted */}
        <div className="mt-8">
          <Label className="text-base font-medium">
            When was the last audit conducted? <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={formState.lastAudit}
            onValueChange={(value) => handleChange("lastAudit", value)}
            className="mt-4 space-y-2"
          >
            {[
              "Not proceeded yet",
              "Within 6 months",
              "More than 6 months but within 1 year",
              "More than 1 year but within 2 years",
              "I/We have no idea",
            ].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem id={option} value={option} />
                <Label htmlFor={option} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
            {/* Other Option */}
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="other-audit" value="Other" />
              <Label htmlFor="other-audit" className="text-sm">Other:</Label>
              <Input
                placeholder="Specify other"
                value={formState.otherAudit}
                onChange={(e) => handleChange("otherAudit", e.target.value)}
                className="w-full"
              />
            </div>
          </RadioGroup>
          {errors.lastAudit && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.lastAudit}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Bookkeeping */}
        <div className="mt-8">
          <Label className="text-base font-medium">
            Do you handle the bookkeeping within your company?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={formState.bookkeeping}
            onValueChange={(value) => handleChange("bookkeeping", value)}
            className="mt-4 space-y-2"
          >
            {[
              "Yes",
              "Willing to use Mirr Asia's accounting services",
              "Willing to use other company's accounting services",
              "Unknown or undecided",
            ].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem id={option} value={option} />
                <Label htmlFor={option} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
            {/* Other Option */}
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="other-bookkeeping" value="Other" />
              <Label htmlFor="other-bookkeeping" className="text-sm">Other:</Label>
              <Input
                placeholder="Specify other"
                value={formState.otherBookkeeping}
                onChange={(e) => handleChange("otherBookkeeping", e.target.value)}
                className="w-full"
              />
            </div>
          </RadioGroup>
          {errors.bookkeeping && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.bookkeeping}</AlertDescription>
            </Alert>
          )}
        </div>
          {/* Last Accounting Year-End Date */}
          <div className="mt-6">
          <Label className="text-base font-medium">
            When was the last accounting year-end date on which the accounting book has been written?
          </Label>
          <Input
            placeholder="Enter year-end date"
            value={formState.lastAccountingYearEnd}
            onChange={(e) => handleChange("lastAccountingYearEnd", e.target.value)}
            className="mt-2"
          />
        </div>

        {/* Implement Xero Software */}
        <div className="mt-8">
          <Label className="text-base font-medium">
            Would you like to implement online accounting software, Xero?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help"/>
            </TooltipTrigger>
                <TooltipContent className="max-w-md text-sm">
                Using Xero, data generated by POS or other software can be imported in CSV format to write
            bookkeeping and financial statements. It helps prepare consolidated statements and manage
            inventory, cost, and sales.
                </TooltipContent>
          </Tooltip>
 
          <RadioGroup
            value={formState.xeroSoftware}
            onValueChange={(value) => handleChange("xeroSoftware", value)}
            className="mt-4 space-y-2"
          >
            {[
              "Yes (Software cost: estimated HKD400 per month)",
              "No",
              "Recommendation required",
            ].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem id={option} value={option} />
                <Label htmlFor={option} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
            {/* Other Option */}
            <div className="flex items-center space-x-2 mt-2">
              <RadioGroupItem id="other-xero" value="Other" />
              <Label htmlFor="other-xero" className="text-sm">Other:</Label>
              <Input
                placeholder="Specify other option"
                value={formState.otherXeroOption}
                onChange={(e) => handleChange("otherXeroOption", e.target.value)}
                className="w-full"
              />
            </div>
          </RadioGroup>
          {errors.xeroSoftware && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.xeroSoftware}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Other Accounting Software */}
        <div className="mt-8">
          <Label className="text-base font-medium">
            Do you currently use or consider using other accounting software?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="Provide information about other accounting software"
            value={formState.currentAccountingSoftware}
            onChange={(e) =>
              handleChange("currentAccountingSoftware", e.target.value)
            }
            className="mt-2"
          />
          {errors.currentAccountingSoftware && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.currentAccountingSoftware}</AlertDescription>
            </Alert>
          )}
        </div>
           {/* Select Services */}
           <div className="mt-6">
          <Label className="text-base font-medium">
            Please select the services you would like to use{" "}
            <span className="text-red-500">*</span>
          </Label>
          <div className="mt-2 space-y-2">
            {servicesOptions.map((service) => (
              <div key={service} className="flex items-center space-x-2">
                <Checkbox
                  id={service}
                  checked={formState.selectedServices.includes(service)}
                  onCheckedChange={(checked) =>
                    setFormState((prev) => ({
                      ...prev,
                      selectedServices: checked
                        ? [...prev.selectedServices, service]
                        : prev.selectedServices.filter((s) => s !== service),
                    }))
                  }
                />
                <Label htmlFor={service} className="text-sm">
                  {service}
                </Label>
              </div>
            ))}
            {/* Other Option */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="otherService"
                checked={!!formState.otherService}
                onCheckedChange={(checked) =>
                  setFormState((prev) => ({
                    ...prev,
                    otherService: checked ? "" : "",
                  }))
                }
              />
              <Label htmlFor="otherService" className="text-sm">
                Other:
              </Label>
              <Input
                placeholder="Specify other service"
                value={formState.otherService}
                onChange={(e) => handleChange("otherService", e.target.value)}
              />
            </div>
          </div>
          {errors.selectedServices && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.selectedServices}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Transfer Reasons */}
        <div className="mt-6">
          <Label className="text-base font-medium">
            Reasons for transferring the management services{" "}
            <span className="text-red-500">*</span>
          </Label>
          <div className="mt-2 space-y-2">
            {reasonsOptions.map((reason) => (
              <div key={reason} className="flex items-center space-x-2">
                <Checkbox
                  id={reason}
                  checked={formState.transferReasons.includes(reason)}
                  onCheckedChange={(checked) =>
                    setFormState((prev) => ({
                      ...prev,
                      transferReasons: checked
                        ? [...prev.transferReasons, reason]
                        : prev.transferReasons.filter((r) => r !== reason),
                    }))
                  }
                />
                <Label htmlFor={reason} className="text-sm">
                  {reason}
                </Label>
              </div>
            ))}
            {/* Other Option */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="otherReason"
                checked={!!formState.otherReason}
                onCheckedChange={(checked) =>
                  setFormState((prev) => ({
                    ...prev,
                    otherReason: checked ? "" : "",
                  }))
                }
              />
              <Label htmlFor="otherReason" className="text-sm">
                Other:
              </Label>
              <Input
                placeholder="Specify other reason"
                value={formState.otherReason}
                onChange={(e) => handleChange("otherReason", e.target.value)}
              />
            </div>
          </div>
          {errors.transferReasons && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.transferReasons}</AlertDescription>
            </Alert>
          )}
        </div>
            {/* Notify Former Service Provider */}
            <div className="mt-6">
          <Label className="text-base font-medium">
            Would you like us to notify the former service provider for the new
            appointment as Mirr Asia and to receive your documents kept by the former
            service provider? <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={formState.notifyFormerServiceProvider}
            onValueChange={(value) => handleChange("notifyFormerServiceProvider", value)}
            className="mt-4 space-y-2"
          >
            {["Yes", "No"].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem id={option} value={option} />
                <Label htmlFor={option} className="text-sm">{option}</Label>
              </div>
            ))}
            {/* Other Option */}
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="Other" value="Other" />
              <Label htmlFor="Other" className="text-sm">Other:</Label>
              <Input
                placeholder="Specify other option"
                value={formState.otherVerificationMethod}
                onChange={(e) => handleChange("otherVerificationMethod", e.target.value)}
              />
            </div>
          </RadioGroup>
          {errors.notifyFormerServiceProvider && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.notifyFormerServiceProvider}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Documents to Submit */}
        <div className="mt-6">
          <Label className="text-base font-medium">Documents to submit</Label>
          <div className="mt-2 space-y-2">
            {documentsOptions.map((doc) => (
              <div key={doc} className="flex items-center space-x-2">
                <Checkbox
                  id={doc}
                  checked={formState.documentsToSubmit.includes(doc)}
                  onCheckedChange={(checked) =>
                    setFormState((prev) => ({
                      ...prev,
                      documentsToSubmit: checked
                        ? [...prev.documentsToSubmit, doc]
                        : prev.documentsToSubmit.filter((d) => d !== doc),
                    }))
                  }
                />
                <Label htmlFor={doc} className="text-sm">{doc}</Label>
              </div>
            ))}
            {/* Other Document */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="otherDocument"
                checked={!!formState.otherDocument}
                onCheckedChange={(checked) =>
                  handleChange("otherDocument", checked ? "" : "")
                }
              />
              <Label htmlFor="otherDocument" className="text-sm">Other:</Label>
              <Input
                placeholder="Specify other document"
                value={formState.otherDocument}
                onChange={(e) => handleChange("otherDocument", e.target.value)}
              />
            </div>
          </div>
          {errors.documentsToSubmit && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.documentsToSubmit}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Preferred Verification Method */}
        <div className="mt-6">
          <Label className="text-base font-medium">
            Your preferred verification method <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={formState.preferredVerificationMethod}
            onValueChange={(value) => handleChange("preferredVerificationMethod", value)}
            className="mt-4 space-y-2"
          >
            {verificationMethods.map((method) => (
              <div key={method} className="flex items-center space-x-2">
                <RadioGroupItem id={method} value={method} />
                <Label htmlFor={method} className="text-sm">{method}</Label>
              </div>
            ))}
            {/* Other Option */}
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="otherVerification" value="Other" />
              <Label htmlFor="otherVerification" className="text-sm">Other:</Label>
              <Input
                placeholder="Specify other method"
                value={formState.otherVerificationMethod}
                onChange={(e) => handleChange("otherVerificationMethod", e.target.value)}
              />
            </div>
          </RadioGroup>
          {errors.preferredVerificationMethod && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.preferredVerificationMethod}</AlertDescription>
            </Alert>
          )}
        </div>
         {/* Describe Solutions Field */}
         <div className="mt-6">
          <Label htmlFor="describeSolutions" className="text-base font-medium">
            Please describe the solutions that can be handled by your company alone.{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="describeSolutions"
            placeholder="Enter solutions here..."
            value={formState.describeSolutions}
            onChange={(e) => handleChange("describeSolutions", e.target.value)}
            className="mt-2"
          />
          {errors.describeSolutions && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.describeSolutions}</AlertDescription>
            </Alert>
          )}
        </div>
        <div className="mt-6 text-center">
              <p className="text-lg font-semibold">Thank you.</p>
            </div>

            {/* Consultation Required Section */}
            <div className="mt-6 bg-gray-100 p-4 rounded-md">
              <p className="font-medium text-gray-700">
                <span className="font-bold">Consultation required before proceeding</span>
              </p>
              <p className="text-gray-600 mt-2">
                It seems that you will need to consult before proceeding. We will check the
                contents of your reply, and our consultant will contact you shortly.
              </p>
              <p className="mt-2 text-gray-700">Thank you.</p>
            </div>







        


        {/* Submit Button */}
        <div className="flex justify-end mt-6">
          <Button onClick={validateForm}
           
          >
            Submit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransferManagementInfo;
