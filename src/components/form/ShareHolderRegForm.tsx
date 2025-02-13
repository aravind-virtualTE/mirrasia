import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { HelpCircle } from "lucide-react";
import { ShareHolderRegistrationForm } from "@/types/hkForm";
import { useParams } from "react-router-dom";
import { saveShrDirRegData } from "@/services/dataFetch";
import { useToast } from "@/hooks/use-toast";

const ShareHolderRegForm = () => {
  const { id } = useParams();
  const { toast } = useToast();

  const { t } = useTranslation();
  // State Management
  const [formState, setFormState] = useState<ShareHolderRegistrationForm>({
    email: "",
    companyName: "",
    roles: [] as string[],
    significantController: "",
    fullName: "",
    mobileNumber: "",
    kakaoTalkId: "",
    weChatId: "",
    passportCopy: null as unknown as string | Blob,
    personalCertificate: null as unknown as string | Blob,
    proofOfAddress: null as unknown as string | Blob,
    passportDigits: "",
    birthCountry: "",
    currentResidence: "",
    nomineeParticipation: "",
    correspondenceAddress: "",
    overseasResidentStatus: "",
    foreignInvestmentReport: "",
    foreignInvestmentAgreement: "",
    politicallyExposedStatus: "",
    politicalDetails: "",
    legalIssuesStatus: "",
    usResidencyStatus: "",
    usResidencyDetails: "",
    natureOfFunds: [] as string[],
    sourceOfFunds: [] as string[],
    countryOfFundOrigin: "",
    undischargedBankruptcy: "",
    pastParticipation: "",
    additionalInfo: "",
    agreementDeclaration: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    companyName: "",
    roles: "",
    significantController: "",
    fullName: "",
    mobileNumber: "",
    passportCopy: "",
    personalCertificate: "",
    proofOfAddress: "",
    passportDigits: "",
    birthCountry: "",
    currentResidence: "",
    nomineeParticipation: "",
    correspondenceAddress: "",
    overseasResidentStatus: "",
    foreignInvestmentReport: "",
    foreignInvestmentAgreement: "",
    politicallyExposedStatus: "",
    politicalDetails: "",
    legalIssuesStatus: "",
    usResidencyStatus: "",
    usResidencyDetails: "",
    natureOfFunds: "",
    sourceOfFunds: "",
    countryOfFundOrigin: "",
    undischargedBankruptcy: "",
    pastParticipation: "",
    additionalInfo: "",
    agreementDeclaration: "",

  });

  useEffect(() => {
    if (id) {
      console.log('id--->', id)
      async function getIncorporationListByCompId(id: string) {
        const data = await getIncorporationListByCompId(id);
        console.log("data", data)
      }
      getIncorporationListByCompId(id)
    }
  })

  const roleOptions = [
    "Major shareholder (holding the largest stake)",
    "General shareholder",
    "Nominee Shareholder",
    "CEO",
    "General executive director",
    "Nominee Director",
    "Designated Contact Person",
    "ETC",
  ];

  const significantControllerOptions = [
    "Holds 25% or more of the company's total shares",
    "Holds less than 25% of the company's total shares, but has a higher stake than other shareholders (largest shareholder)",
    "Holds less than 25% of the company's total shares, but the same as the share of other shareholders (e.g., 20% of shares out of 5 shareholders)",
    "The entire share of the company is owned by another holding company, and I own 25% or more of the holding company.",
    "The entire stake of the company is owned by another holding company, and I own less than 25% of the holding company, but the share is higher than other shareholders (the largest shareholder of the holding company).",
    "The entire share of the company is owned by another holding company, and I own less than 25% of the holding company, but the same as the share of other shareholders (e.g., 20% of the holding company, 5 shareholders).",
    "Do not know or do not understand",
  ];
  // Updated handleChange function to support generic types and specific fields
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
    const newErrors = {
      email: "",
      companyName: "",
      roles: "",
      significantController: "",
      fullName: "",
      mobileNumber: "",
      passportCopy: "",
      personalCertificate: "",
      proofOfAddress: "",
      passportDigits: "",
      birthCountry: "",
      currentResidence: "",
      nomineeParticipation: "",
      correspondenceAddress: "",
      overseasResidentStatus: "",
      foreignInvestmentReport: "",
      foreignInvestmentAgreement: "",
      politicallyExposedStatus: "",
      politicalDetails: "",
      legalIssuesStatus: "",
      usResidencyStatus: "",
      usResidencyDetails: "",
      natureOfFunds: "",
      sourceOfFunds: "",
      countryOfFundOrigin: "",
      undischargedBankruptcy: "",
      pastParticipation: "",
      additionalInfo: "",
      agreementDeclaration: "",
    };

    // Validation for new fields
    if (!formState.correspondenceAddress.trim()) {
      newErrors.correspondenceAddress = "Please select a correspondence address option";
    }

    if (!formState.overseasResidentStatus.trim()) {
      newErrors.overseasResidentStatus = "Please select your overseas resident status";
    }
    if (!formState.foreignInvestmentReport.trim()) {
      newErrors.foreignInvestmentReport = "Please select an option for foreign direct investment report";
    }

    if (!formState.foreignInvestmentAgreement.trim()) {
      newErrors.foreignInvestmentAgreement = "Please agree or disagree with the foreign direct investment responsibility";
    }
    if (!formState.politicallyExposedStatus.trim()) {
      newErrors.politicallyExposedStatus = "Please select your politically exposed person status";
    }

    if (
      formState.politicallyExposedStatus === "Worked in public office or family member in public office" ||
      formState.politicallyExposedStatus === "Worked as a senior manager in government or organization" ||
      formState.politicallyExposedStatus === "Present or past politically/socially influential person"
    ) {
      if (!formState.politicalDetails.trim()) {
        newErrors.politicalDetails = "Please provide details of the position held and association";
      }
    }
    if (!formState.legalIssuesStatus.trim()) {
      newErrors.legalIssuesStatus = "Please select your legal issues status";
    }

    if (!formState.usResidencyStatus.trim()) {
      newErrors.usResidencyStatus = "Please select your U.S. residency status";
    }

    if (formState.usResidencyStatus === "Yes" && !formState.usResidencyDetails.trim()) {
      newErrors.usResidencyDetails = "Please provide details for your U.S. residency status";
    }
    if (formState.natureOfFunds.length === 0) {
      newErrors.natureOfFunds = "Please select at least one option for the nature of funds";
    }
    if (formState.sourceOfFunds.length === 0) {
      newErrors.sourceOfFunds = "Please select at least one source of funds.";
    }

    if (!formState.countryOfFundOrigin.trim()) {
      newErrors.countryOfFundOrigin = "Country of fund origin is required.";
    }
    if (!formState.undischargedBankruptcy.trim()) {
      newErrors.undischargedBankruptcy = "Please select your undischarged bankruptcy status.";
    }

    if (!formState.pastParticipation.trim()) {
      newErrors.pastParticipation = "Please select your past participation or violation status.";
    }

    if (formState.pastParticipation === "Yes" && !formState.additionalInfo.trim()) {
      newErrors.additionalInfo = "Please provide additional details for your past participation.";
    }
    if (!formState.agreementDeclaration.trim()) {
      newErrors.agreementDeclaration = "You must agree or disagree with the declaration.";
    }
    setErrors(newErrors);
    if (Object.values(newErrors).every((error) => error === "")) {
      const formData = new FormData();
      formData.append("userData", JSON.stringify(formState));

      // Append files (assuming you have file inputs in your frontend)
      formData.append("passportCopy", formState.passportCopy);
      formData.append("personalCertificate", formState.personalCertificate);
      formData.append("proofOfAddress", formState.proofOfAddress);
      const result = await saveShrDirRegData(formState, id);
      if (result.success == true) {
        toast({
          title: "Details submitted",
          description: "Saved successfully"
        });
      }
      console.log("Form submitted successfully:", formState);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t("Registration form for HK company's director/member/controller")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">
          If an individual is registered as a shareholder/director of a Hong
          Kong company, please fill out this application form.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          This application was written in the form of a questionnaire about the
          necessary information for the registration of members of the Hong
          Kong company (shareholders, directors, significant controllers,
          contact persons, etc.). If, like a holding company, the shareholders
          of a Hong Kong company are not natural persons, please fill out the
          company application form.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          The questions may be difficult for some customers, or it may take
          some time to answer. Accordingly, we ask that you answer step-by-step
          when you have the time available and submit the relevant documents.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          If you have any difficulties or do not understand well in writing,
          please contact us at the contact information below.
        </p>
        <p className="text-sm font-bold mt-4">Thank you.</p>
        <div className="mt-4">
          <p className="text-sm">
            Mirr Asia<br />
            (Hong Kong) +852-2187-2428<br />
            (Korea) +82-2-543-6187<br />
            Kakao Talk: mirrasia<br />
            WeChat: mirrasia_hk<br />
            Website:{" "}
            <a
              href="https://www.mirrasia.com"
              className="text-blue-500 underline"
            >
              www.mirrasia.com
            </a>
            <br />
            Plus Friend:{" "}
            <a
              href="https://pf.kakao.com/_KxmnZT"
              className="text-blue-500 underline"
            >
              https://pf.kakao.com/_KxmnZT
            </a>
          </p>
        </div>
        {/* Email Section */}
        <div className="mt-6">
          <div className="flex items-center gap-4">
            <Label htmlFor="email" className="text-sm font-bold flex-shrink-0">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              placeholder="Your email"
              value={formState.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={`flex-grow ${errors.email ? "border-red-500" : ""}`}
            />
          </div>
          {errors.email && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.email}</AlertDescription>
            </Alert>
          )}
        </div>
        {/* Company Name Section */}
        <div className="mt-6">
          <div className="flex items-center gap-4">
            <Label htmlFor="companyName" className="text-sm font-bold whitespace-nowrap">
              Company Name to be registered/appointed <span className="text-red-500">*</span>
            </Label>
            <Input
              id="companyName"
              placeholder="Enter company name"
              value={formState.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
              className={`flex-1 ${errors.companyName ? "border-red-500" : ""}`}
            />
          </div>
          {errors.companyName && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.companyName}</AlertDescription>
            </Alert>
          )}
        </div>
        {/* Roles Section */}
        <div className="mt-6">
          <Label className="text-sm font-bold flex items-center gap-2">
            Roles to be played by the Hong Kong company (multiple possible){" "}
            <span className="text-red-500">*</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-md text-sm">
                The designated contact person is responsible for contacting the company's main business, and the person is in charge of contacting company and business related inquiries, confirmation of progress, and registration documents. Your company must delegate at least one contact person who will be in charge of business contact, and the contact person can access your company's information and documents, as well as your mail contents. Appointment of contact person is free for up to 1 person, and in case of 2 or more people, an annual fee of HKD2,000 per person is incurred. The designated contact person is designated by your company and registered separately with us to protect your company's information and reduce confusion. (The designated contact person must go through the same procedure as the shareholders/directors to submit passport copies and proof of address documents/personal verification.)
              </TooltipContent>
            </Tooltip>
          </Label>
          <div className="mt-4 space-y-2">
            {roleOptions.map((role) => (
              <div key={role} className="flex items-center space-x-2">
                <Checkbox
                  id={role}
                  onCheckedChange={(checked) =>
                    handleChange(
                      "roles",
                      checked ? [...formState.roles, role] : formState.roles.filter((r) => r !== role)
                    )
                  }
                />
                <Label htmlFor={role} className="text-sm">
                  {role}
                </Label>
              </div>
            ))}
          </div>
          {errors.roles && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{errors.roles}</AlertDescription>
            </Alert>
          )}
        </div>
        {/* Significant Controller Section */}
        <div className="mt-6">
          <Label className="text-sm font-bold flex items-center gap-2">
            Significant Controller <span className="text-red-500">*</span>

            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-md text-sm">
                The significant controller refers to a person who is the largest shareholder or can exert a corresponding influence compared to other shareholders even if he or she owns 25% or more of the company's shares or less than that.
              </TooltipContent>
            </Tooltip>
          </Label>
          <RadioGroup
            className="mt-4 space-y-2"
            value={formState.significantController}
            onValueChange={(value) => handleChange("significantController", value)}
          >
            {significantControllerOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem id={option} value={option} />
                <Label htmlFor={option} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.significantController && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{errors.significantController}</AlertDescription>
            </Alert>
          )}
        </div>
        {/* Full Name */}
        <div className="mt-6">
          <div className="flex items-center gap-4">
            <Label htmlFor="fullName" className="text-sm font-bold whitespace-nowrap">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              placeholder="Your full name"
              value={formState.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              className={`w-full ${errors.fullName ? "border-red-500" : ""}`}
            />
          </div>
          {errors.fullName && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.fullName}</AlertDescription>
            </Alert>
          )}
        </div>
        {/* Mobile Number */}
        <div className="mt-6">
          <div className="flex items-center gap-4">
            <Label htmlFor="mobileNumber" className="text-sm font-bold whitespace-nowrap">
              Mobile Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="mobileNumber"
              placeholder="Your mobile phone number"
              value={formState.mobileNumber}
              onChange={(e) => handleChange("mobileNumber", e.target.value)}
              className={`w-full ${errors.mobileNumber ? "border-red-500" : ""}`}
            />
          </div>
          {errors.mobileNumber && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.mobileNumber}</AlertDescription>
            </Alert>
          )}
        </div>
        {/* KakaoTalk ID */}
        <div className="mt-6">
          <div className="flex items-center gap-4">
            <Label htmlFor="kakaoTalkId" className="text-sm font-bold whitespace-nowrap">
              KakaoTalk ID
            </Label>
            <Input
              id="kakaoTalkId"
              placeholder="Your KakaoTalk ID"
              value={formState.kakaoTalkId}
              onChange={(e) => handleChange("kakaoTalkId", e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        {/* WeChat ID */}
        <div className="mt-6">
          <div className="flex items-center gap-4">
            <Label htmlFor="weChatId" className="text-sm font-bold whitespace-nowrap">
              WeChat ID
            </Label>
            <Input
              id="weChatId"
              placeholder="Your WeChat ID"
              value={formState.weChatId}
              onChange={(e) => handleChange("weChatId", e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        {/* Upload Passport Copy Section */}
        <div className="mt-6">
          <div className="flex items-center gap-4">
            <Label htmlFor="passportCopy" className="text-sm font-bold whitespace-nowrap">
              Upload passport copy <span className="text-red-500">*</span>
              <Tooltip>
                <TooltipContent className="max-w-md text-sm">
                  Upload 1 supported file: PDF, drawing, or image. Max 10 MB.
                </TooltipContent>
              </Tooltip>
            </Label>
            <Input
              id="passportCopy"
              type="file"
              accept=".pdf,.jpg,.png,.jpeg"
              onChange={(e) => handleChange("passportCopy", e.target.files?.[0] || "")}
              className="w-full"
            />
          </div>
          {errors.passportCopy && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.passportCopy}</AlertDescription>
            </Alert>
          )}
        </div>
        {/* Upload Personal Certificate Section */}
        <div className="mt-6">
          <div className="flex items-center gap-4">
            <Label htmlFor="personalCertificate" className="text-sm font-bold flex items-center whitespace-nowrap gap-2">
              Upload personal certificate (within 3 months from issuance date){" "}
              <span className="text-red-500">*</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-md text-sm">
                  Choose one of the following documents:
                  <ol className="list-decimal list-inside">
                    <li>Take a photo with your passport and upload it.</li>
                    <li>Get a Certificate of Passport Copy from the ward office and upload it.</li>
                    <li>Go to the notary office and notarize your passport and upload it.</li>
                    <li>Visit Mirr Asia Seoul office (near Nonhyeon Station) and authenticate a copy of your passport.</li>
                  </ol>
                  <p>Upload up to 5 supported files: PDF, drawing, or image. Max 10 MB per file.</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <Input
              id="personalCertificate"
              type="file"
              accept=".pdf,.jpg,.png,.jpeg"
              multiple
              onChange={(e) => handleChange("personalCertificate", e.target.files?.[0] || '')}
              className="w-full"
            />
          </div>
          {errors.personalCertificate && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.personalCertificate}</AlertDescription>
            </Alert>
          )}
        </div>
        {/* Upload Proof of Address Section */}
        <div className="mt-6">
          <div className="flex items-center gap-4">
            <Label htmlFor="proofOfAddress" className="text-sm font-bold flex items-center whitespace-nowrap gap-2">
              Upload proof of address (within 3 months from issuance date){" "}
              <span className="text-red-500">*</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-md text-sm">
                  Choose one of the following documents:
                  <ol className="list-decimal list-inside">
                    <li>English translation for overseas residents</li>
                    <li>Driver's license translated into English and notarized</li>
                    <li>Utility Bill or Bank Statement for overseas residents</li>
                    <li>Other officially certifying address English documents or English translation notarized</li>
                  </ol>
                  <p>Upload up to 5 supported files: PDF, drawing, or image. Max 10 MB per file.</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <Input
              id="proofOfAddress"
              type="file"
              accept=".pdf,.jpg,.png,.jpeg"
              multiple
              onChange={(e) => handleChange("proofOfAddress", e.target.files?.[0] || '')}
              className="w-full"
            />
          </div>
          {errors.proofOfAddress && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.proofOfAddress}</AlertDescription>
            </Alert>
          )}
        </div>
        {/* Additional Fields After Upload Proof Section */}
        <div className="mt-6">
          <div className="flex items-center gap-4">
            <Label htmlFor="passportDigits" className="text-sm font-bold whitespace-nowrap">
              First 4 digits of passport number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="passportDigits"
              placeholder="Enter the first 4 digits"
              value={formState.passportDigits || ""}
              onChange={(e) => handleChange("passportDigits", e.target.value)}
              className={`w-full ${errors.passportDigits ? "border-red-500" : ""}`}
            />
          </div>
          {errors.passportDigits && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.passportDigits}</AlertDescription>
            </Alert>
          )}
        </div>
        {/* country to birth field */}
        <div className="mt-6">
          <div className="flex items-center gap-4">
            <Label htmlFor="birthCountry" className="text-sm font-bold whitespace-nowrap">
              Country of birth <span className="text-red-500">*</span>
            </Label>
            <Input
              id="birthCountry"
              placeholder="Enter your country of birth"
              value={formState.birthCountry || ""}
              onChange={(e) => handleChange("birthCountry", e.target.value)}
              className={`w-full ${errors.birthCountry ? "border-red-500" : ""}`}
            />
          </div>
          {errors.birthCountry && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.birthCountry}</AlertDescription>
            </Alert>
          )}
        </div>
        {/* country residence field */}
        <div className="mt-6">
          <div className="flex items-center gap-4">
            <Label htmlFor="currentResidence" className="text-sm font-bold whitespace-nowrap">
              Current country of residence <span className="text-red-500">*</span>
            </Label>
            <Input
              id="currentResidence"
              placeholder="Enter your current country of residence"
              value={formState.currentResidence || ""}
              onChange={(e) => handleChange("currentResidence", e.target.value)}
              className={`w-full ${errors.currentResidence ? "border-red-500" : ""}`}
            />
          </div>
          {errors.currentResidence && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.currentResidence}</AlertDescription>
            </Alert>
          )}
        </div>
        <div className="mt-6">
          <Label className="text-sm font-bold">
            Are you planning to participate as the nominee or trustee on behalf of or on behalf of the actual owner or representative of the Hong Kong company you wish to establish? <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            className="mt-4 space-y-2"
            value={formState.nomineeParticipation || ""}
            onValueChange={(value) => handleChange("nomineeParticipation", value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="yes" value="Yes" />
              <Label htmlFor="yes" className="text-sm">
                Yes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="no" value="No" />
              <Label htmlFor="no" className="text-sm">
                No
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="doNotKnow" value="Do not know" />
              <Label htmlFor="doNotKnow" className="text-sm">
                Do not know
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="other" value="Other" />
              <Label htmlFor="other" className="text-sm">
                Other
              </Label>
            </div>
          </RadioGroup>
          {errors.nomineeParticipation && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{errors.nomineeParticipation}</AlertDescription>
            </Alert>
          )}
        </div>
        {/* Correspondence Address Section */}
        <div className="mt-6">
          <Label className="text-sm font-bold flex items-center gap-2">
            What address do you want to register as a Correspondence Address that is open to the public?{" "}
            <span className="text-red-500">*</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-md text-sm">
                The residence address of the individual director is registered as private information, and only the communication address is disclosed to the public.
              </TooltipContent>
            </Tooltip>
          </Label>
          <RadioGroup
            className="mt-4 space-y-2"
            value={formState.correspondenceAddress}
            onValueChange={(value) => handleChange("correspondenceAddress", value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="residential" value="Use residential address as the correspondence address" />
              <Label htmlFor="residential" className="text-sm">
                Use residential address as the correspondence address
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="business" value="Use registered business address as a correspondence address" />
              <Label htmlFor="business" className="text-sm">
                Use registered business address as a correspondence address (annual service fee of HKD 500 / billed per person)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="different" value="Use a different address as a correspondence address" />
              <Label htmlFor="different" className="text-sm">
                Use a different address as a correspondence address (requires proof of address)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="other" value="Other" />
              <Label htmlFor="other" className="text-sm">Other</Label>
            </div>
          </RadioGroup>
          {errors.correspondenceAddress && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.correspondenceAddress}</AlertDescription>
            </Alert>
          )}
        </div>
        {/* Overseas Resident Status Section */}
        <div className="mt-6">
          <Label className="text-sm font-bold">
            Are you an overseas resident other than Hong Kong and are you subject to reporting of
            overseas corporation establishment or foreign direct investment?{" "}
            <span className="text-red-500">*</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-md text-sm">
                See the guide slide below
              </TooltipContent>
            </Tooltip>
          </Label>
          <RadioGroup
            className="mt-4 space-y-2"
            value={formState.overseasResidentStatus}
            onValueChange={(value) => handleChange("overseasResidentStatus", value)}
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
              <RadioGroupItem id="unknown" value="Do not know" />
              <Label htmlFor="unknown" className="text-sm">Do not know</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="other" value="Other" />
              <Label htmlFor="other" className="text-sm">Other</Label>
            </div>
          </RadioGroup>
          {errors.overseasResidentStatus && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.overseasResidentStatus}</AlertDescription>
            </Alert>
          )}
        </div>
        {/* Have you filed a foreign direct investment report section */}
        <div className="mt-6">
          <Label className="text-sm font-bold">
            Have you filed a foreign direct investment report or are you planning to proceed with the above information?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            className="mt-4 space-y-2"
            value={formState.foreignInvestmentReport}
            onValueChange={(value) => handleChange("foreignInvestmentReport", value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="yesReport" value="Yes" />
              <Label htmlFor="yesReport" className="text-sm">
                Yes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="noReport" value="No" />
              <Label htmlFor="noReport" className="text-sm">
                No
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="handleIssue" value="I can handle this issue" />
              <Label htmlFor="handleIssue" className="text-sm">
                I can handle this issue
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="consultationRequired" value="Consultation required" />
              <Label htmlFor="consultationRequired" className="text-sm">
                Consultation required
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="otherReport" value="Other" />
              <Label htmlFor="otherReport" className="text-sm">
                Other
              </Label>
            </div>
          </RadioGroup>
          {errors.foreignInvestmentReport && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.foreignInvestmentReport}</AlertDescription>
            </Alert>
          )}
        </div>
        {/* In accordance with the laws section */}
        <div className="mt-6">
          <Label className="text-sm font-bold">
            In accordance with the laws of your country, you might be obligated to report foreign direct investment as a resident of your country. However, we are a company located in Hong Kong, and as we provide service related to establishing a company in Hong Kong, we are not responsible for direct or indirect responsibility of reporting foreign direct investment issue. Do you agree with this?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            className="mt-4 space-y-2"
            value={formState.foreignInvestmentAgreement}
            onValueChange={(value) => handleChange("foreignInvestmentAgreement", value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="yesAgreement" value="Yes" />
              <Label htmlFor="yesAgreement" className="text-sm">
                Yes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="noAgreement" value="No" />
              <Label htmlFor="noAgreement" className="text-sm">
                No
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="consultationRequiredAgreement" value="Consultation required" />
              <Label htmlFor="consultationRequiredAgreement" className="text-sm">
                Consultation required
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="otherAgreement" value="Other" />
              <Label htmlFor="otherAgreement" className="text-sm">
                Other
              </Label>
            </div>
          </RadioGroup>
          {errors.foreignInvestmentAgreement && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.foreignInvestmentAgreement}</AlertDescription>
            </Alert>
          )}
        </div>
        {/* Politically Exposed Person Section */}
        <div className="mt-6">
          <Label className="text-sm font-bold">
            Politically Exposed Person <span className="text-red-500">*</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-md text-sm">
                Political key figures are those who have political or social influence in their own country
                or internationally in the present or in the past, or their immediate family members. For
                example, high-ranking managers of government agencies, political parties, social groups,
                international NGOs, international organizations or state-owned enterprises, or their
                immediate family members are all political figures. In accordance with the recently
                strengthened anti-money laundering laws, those who are politically important should clearly
                inform them.
              </TooltipContent>
            </Tooltip>
          </Label>
          <RadioGroup
            className="mt-4 space-y-2"
            value={formState.politicallyExposedStatus}
            onValueChange={(value) => handleChange("politicallyExposedStatus", value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="publicOffice" value="Worked in public office or family member in public office" />
              <Label htmlFor="publicOffice" className="text-sm">
                If you have worked for a current or past public office, or if there is such a person in your family
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="seniorManager" value="Worked as a senior manager in government or organization" />
              <Label htmlFor="seniorManager" className="text-sm">
                If you worked as a senior manager at a government agency, political party, social group, international NGO, etc.
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="politicalPerson" value="Present or past politically/socially influential person" />
              <Label htmlFor="politicalPerson" className="text-sm">
                Present or past politically or socially influential person, or someone in your family
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="none" value="None" />
              <Label htmlFor="none" className="text-sm">None</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="unknown" value="Do not know or do not understand" />
              <Label htmlFor="unknown" className="text-sm">Do not know or do not understand</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="consultation" value="Consultation required" />
              <Label htmlFor="consultation" className="text-sm">Consultation required</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="other" value="Other" />
              <Label htmlFor="other" className="text-sm">Other</Label>
            </div>
          </RadioGroup>
          {errors.politicallyExposedStatus && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.politicallyExposedStatus}</AlertDescription>
            </Alert>
          )}
        </div>
        {/* Political Details Section */}
        <div className="mt-6">
          <Label htmlFor="politicalDetails" className="text-sm font-bold">
            If you are a political person, please provide details of the position held and association
          </Label>
          <Input
            id="politicalDetails"
            placeholder="Describe your position, affiliation, length of service, or family relationship"
            value={formState.politicalDetails}
            onChange={(e) => handleChange("politicalDetails", e.target.value)}
            className="w-full"
          />
          {errors.politicalDetails && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.politicalDetails}</AlertDescription>
            </Alert>
          )}
        </div>
        {/* Pending Legal Claims Section */}
        <div className="mt-6">
          <Label className="text-sm font-bold">
            Do you have any pending or threatened claims or have you ever been convicted of any crimes/fraud under a court of law or under any investigation of any nature or involved in legal proceedings?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            className="mt-4 space-y-2"
            value={formState.legalIssuesStatus}
            onValueChange={(value) => handleChange("legalIssuesStatus", value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="yesLegalIssues" value="Yes" />
              <Label htmlFor="yesLegalIssues" className="text-sm">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="noLegalIssues" value="No" />
              <Label htmlFor="noLegalIssues" className="text-sm">No</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="noInfoLegalIssues" value="I do not want to provide information" />
              <Label htmlFor="noInfoLegalIssues" className="text-sm">I do not want to provide information</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="otherLegalIssues" value="Other" />
              <Label htmlFor="otherLegalIssues" className="text-sm">Other</Label>
            </div>
          </RadioGroup>
          {errors.legalIssuesStatus && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.legalIssuesStatus}</AlertDescription>
            </Alert>
          )}
        </div>
        {/* U.S. Citizenship or Residency Section */}
        <div className="mt-6">
          <Label className="text-sm font-bold">
            Are you a citizen, permanent resident, or resident of the United States?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            className="mt-4 space-y-2"
            value={formState.usResidencyStatus}
            onValueChange={(value) => handleChange("usResidencyStatus", value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="yesUsResident" value="Yes" />
              <Label htmlFor="yesUsResident" className="text-sm">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="noUsResident" value="No" />
              <Label htmlFor="noUsResident" className="text-sm">No</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="otherUsResident" value="Other" />
              <Label htmlFor="otherUsResident" className="text-sm">Other</Label>
            </div>
          </RadioGroup>
          {errors.usResidencyStatus && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.usResidencyStatus}</AlertDescription>
            </Alert>
          )}
        </div>
        {/* U.S. Residency Details Section */}
        <div className="mt-6">
          <Label htmlFor="usResidencyDetails" className="text-sm font-bold">
            If applicable to the above, fill in the relevant information such as ITIN number, Visa number, Green Card number, etc.
          </Label>
          <Input
            id="usResidencyDetails"
            placeholder="Enter relevant information"
            value={formState.usResidencyDetails}
            onChange={(e) => handleChange("usResidencyDetails", e.target.value)}
            className="w-full"
          />
          {errors.usResidencyDetails && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.usResidencyDetails}</AlertDescription>
            </Alert>
          )}
        </div>
        {/* Nature of Funds Section */}
        <div className="mt-6">
          <Label className="text-sm font-bold">
            After the establishment of this Hong Kong company, what is the nature of the funds you will accumulate business capital or deposit to your bank account in the future and the main sources of the funds? (Multiple selection possible){" "}
            <span className="text-red-500">*</span>
          </Label>
          <div className="mt-4 space-y-2">
            {[
              "After the establishment of the company, profits will be generated through business such as sales",
              "After incorporation or registration, the funds for the sale of assets will flow into the account",
              "After incorporation or registration, the actual owner will deposit investment or loan funds",
              "After incorporation or registration, the group or parent company will pay investment funds",
              "Other",
            ].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  onCheckedChange={(checked) =>
                    handleChange(
                      "natureOfFunds",
                      checked ? [...formState.natureOfFunds, option] : formState.natureOfFunds.filter((fund) => fund !== option)
                    )
                  }
                />
                <Label htmlFor={option} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </div>
          {errors.natureOfFunds && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.natureOfFunds}</AlertDescription>
            </Alert>
          )}
        </div>
        {/* Source of Funds Section */}
        <div className="mt-6">
          <Label className="text-sm font-bold">
            What is the source of the funds you would like to invest or lend to a company or deposit in a Hong Kong company's bank account after the establishment of this Hong Kong company?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <div className="mt-4 space-y-2">
            {[
              "Investments or loans will be paid to the Hong Kong company, and these funds are profits from other businesses in the past.",
              "Investments or loans will be paid to the Hong Kong company, which is generated from the sale of assets owned by the company in the past.",
              "Investment funds or loans will be paid to the Hong Kong company, and these funds are loans (borrowed) from others.",
              "Investments or loans will be paid to the Hong Kong company, and these are funds that other substantial owners wish to pay through their own.",
              "Investments or loans will be paid to the Hong Kong company, which is earned income from past tenure.",
              "Investments or loans will be paid to the Hong Kong company, and these funds are paid by the company or group to which the person is affiliated.",
              "Investments or loans will be paid to the Hong Kong company, and these funds were deposited in and owned by the bank.",
              "There is no plan to pay investment or loans to the Hong Kong company, and even if there is, it is a small amount, so this will be paid from the funds deposited in the bank.",
              "Other",
            ].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  onCheckedChange={(checked) =>
                    handleChange(
                      "sourceOfFunds",
                      checked ? [...formState.sourceOfFunds, option] : formState.sourceOfFunds.filter((fund) => fund !== option)
                    )
                  }
                />
                <Label htmlFor={option} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </div>
          {errors.sourceOfFunds && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{errors.sourceOfFunds}</AlertDescription>
            </Alert>
          )}
        </div>
        {/* Country of Fund Origin Section */}
        <div className="mt-6">
          <Label htmlFor="countryOfFundOrigin" className="text-sm font-bold">
            Please write down the country from which the fund flows from the two questions above.{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="countryOfFundOrigin"
            placeholder="Enter country of fund origin"
            value={formState.countryOfFundOrigin}
            onChange={(e) => handleChange("countryOfFundOrigin", e.target.value)}
            className={`w-full ${errors.countryOfFundOrigin ? "border-red-500" : ""}`}
          />
          {errors.countryOfFundOrigin && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.countryOfFundOrigin}</AlertDescription>
            </Alert>
          )}
        </div>
        {/* Uncharged Bankruptcy Section */}
        <div className="mt-6">
          <Label className="text-sm font-bold flex">
            Are you currently undischarged bankrupt?{" "}
            <span className="text-red-500">*</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
              </TooltipTrigger>
              {/* Tooltip Content */}
              <TooltipContent className="max-w-md text-sm">
                In accordance with Article 480, Paragraph 1 of the Company Ordinance
                (Cap.622), persons in the process of defaulting on debt shall not
                participate in the company's management, either directly or indirectly, as
                a director of the company without permission from the court. Violations of
                these provisions may result in a fine of HK$700,000 and imprisonment of two
                years upon prosecution and, on summary conviction, to a fine of $150,000
                and to imprisonment for 12 months.
              </TooltipContent>
            </Tooltip>
          </Label>
          <RadioGroup
            className="mt-4 space-y-2 "
            value={formState.undischargedBankruptcy}
            onValueChange={(value) => handleChange("undischargedBankruptcy", value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="bankruptcyYes" value="Yes" />
              <Label htmlFor="bankruptcyYes" className="text-sm">
                Yes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="bankruptcyNo" value="No" />
              <Label htmlFor="bankruptcyNo" className="text-sm">
                No
              </Label>
            </div>
          </RadioGroup>
          {errors.undischargedBankruptcy && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.undischargedBankruptcy}</AlertDescription>
            </Alert>
          )}
        </div>
        {/* Past Participation or Violations Section */}
        <div className="mt-6">
          <Label className="text-sm font-bold">
            In the past, have you established/joined/participated in a company/organization/business/joint venture/branch/contact office as a director/shareholder/cooperative/individual business entity in Hong Kong or have you ever violated company ordinances/tax ordinances/other laws due to refusal to subpoena a court subpoena, false report of submitted documents, etc., or have you ever been forcibly dissolved in accordance with a court order due to prosecution/bankruptcy/criminal violations?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            className="mt-4 space-y-2"
            value={formState.pastParticipation}
            onValueChange={(value) => handleChange("pastParticipation", value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="participationYes" value="Yes" />
              <Label htmlFor="participationYes" className="text-sm">
                Yes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="participationNo" value="No" />
              <Label htmlFor="participationNo" className="text-sm">
                No
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="participationNotProvide" value="I do not want to provide information" />
              <Label htmlFor="participationNotProvide" className="text-sm">
                I do not want to provide information
              </Label>
            </div>
          </RadioGroup>
          {errors.pastParticipation && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.pastParticipation}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Additional Information Section */}
        <div className="mt-6">
          <Label htmlFor="additionalInfo" className="text-sm font-bold">
            If any of the above questions apply, please describe your company name and related information.
          </Label>
          <Input
            id="additionalInfo"
            placeholder="Enter details"
            value={formState.additionalInfo}
            onChange={(e) => handleChange("additionalInfo", e.target.value)}
            className="w-full"
          />
          {errors.additionalInfo && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.additionalInfo}</AlertDescription>
            </Alert>
          )}
        </div>
        {/* Agreement and Declaration Section */}
        <div className="mt-6">
          <Label className="text-sm font-bold">
            You agree to provide documents and information for our business in connection with this service, and in connection with this service, you agree that the purpose of establishing and operating the company is legitimate and for legitimate business. In operation after the establishment of a company, the Company is not obligated to provide assistance or advice on matters that violate the law, and if it is judged that there is a legal violation or related intention, the Company will suspend the service after a certain period of notice. You have the right to do it. You and the signatory of this application declare that all statements are true, complete, and correct to the best of my knowledge. Do you agree with this?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            className="mt-4 space-y-2"
            value={formState.agreementDeclaration}
            onValueChange={(value) => handleChange("agreementDeclaration", value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="agreementYes" value="Yes" />
              <Label htmlFor="agreementYes" className="text-sm">
                Yes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="agreementNo" value="No" />
              <Label htmlFor="agreementNo" className="text-sm">
                No
              </Label>
            </div>
          </RadioGroup>
          {errors.agreementDeclaration && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.agreementDeclaration}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="mt-8 bg-gray-100 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-bold text-gray-800">Complete</h2>
          <p className="text-sm text-gray-600 mt-2">
            Thank you! We will check the contents of your reply and our consultant will contact you shortly.
          </p>
        </div>
        {/* Submit Button */}
        <div className="flex justify-end mt-6">
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShareHolderRegForm;