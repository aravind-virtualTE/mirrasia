/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { useNavigate, useParams } from "react-router-dom";
import { getShrDirRegData, saveShrDirRegData } from "@/services/dataFetch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { FileDialog } from '../ui/fileDialog'
import { correspondenceAddressOptions, foreignInvestmentOptions, foreignInvestmentReportOptions, legalIssuesOptions, natureOfFundsOptions, overseasResidentStatusOptions, politicallyExposedOptions, roleMap, significantControllerMap, sourceOfFundsOptions, usResidencyOptions } from "./ShrDirConstants";
import { useAtom } from "jotai";
import { multiShrDirResetAtom } from "../shareholderDirector/constants";

const HkShareHldrDir = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [multiData,] = useAtom<any>(multiShrDirResetAtom)
  
  const navigate = useNavigate();
  const { t } = useTranslation();
  // State Management
  const [formState, setFormState] = useState<ShareHolderRegistrationForm>({
    _id: "",
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
    regId: ""
  });

  const [errors, setErrors] = useState({
    _id: "",
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

  const [fileSource, setFileSource] = useState<any>('');
  const [openFile, setOpenFile] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      console.log('id--->', id)
      async function fetchData(id: string) {
        const data = await getShrDirRegData(id);
        // console.log("data", data)
        setFormState(data);
      }
      fetchData(id)
    }
    const multiShId = localStorage.getItem("shdrItem")
    const findData =  multiData.length >0
    ? multiData.find((item: { _id: string | null; }) => item._id === multiShId)
    : null;
    if(findData){
      setFormState({...formState, email:findData.email,companyName:findData.companyName  })
    }
    // console.log("multiShId",findData)
  }, [])

  
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
      _id: "",
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
    // console.log("Form formState-->", formState);
    setErrors(newErrors);
    if (Object.values(newErrors).every((error) => error === "")) {
      // const formData = new FormData();
      // formData.append("userData", JSON.stringify(formState));
      // // Append files (assuming you have file inputs in your frontend)
      // formData.append("passportCopy", formState.passportCopy);
      // formData.append("personalCertificate", formState.personalCertificate);
      // formData.append("proofOfAddress", formState.proofOfAddress);
      const result = await saveShrDirRegData(formState, id);
      // console.log("Form result-->", result);
      localStorage.removeItem('shdrItem')
      if (result.success == true) {
        setFormState(result.registeredData)
        navigate("/viewboard")
        toast({
          title: "Details submitted",
          description: "Saved successfully"
        });
        setShowSuccess(true)
      }
      console.log("Form submitted successfully:", formState);
    }else{
      toast({
        title: "Enter Missing Items",
        description: "PLease enter all required items"
      })
      setShowSuccess(false)
    }
  };

  const handleFileClick = (src: any) => {
    setFileSource(src);
    setOpenFile(true);
  }



  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t("hk_shldr.heading")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <>
          <p className="text-sm text-gray-500">
            {t("hk_shldr.p1")}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {t("hk_shldr.p2")}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {t("hk_shldr.p3")}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {t("hk_shldr.p4")}
          </p>
          <p className="text-sm font-bold mt-4">{t("SwitchService.Consultation.thanks")}</p>
          <div className="mt-4">
            <p className="text-sm">
              Mirr Asia<br />
              (Hong Kong) +852-2187-2428<br />
              (Korea) +82-2-543-6187<br />
              {t("dashboard.kakaoT")}: mirrasia<br />
              {t("dashboard.wechat")}: mirrasia_hk<br />
              {t("dashboard.Website")}:{" "}
              <a
                href="https://www.mirrasia.com"
                className="text-blue-500 underline"
              >
                www.mirrasia.com
              </a>
              <br />
              {t("dashboard.kakaChannel")}:{" "}
              <a
                href="https://pf.kakao.com/_KxmnZT"
                className="text-blue-500 underline"
              >
                https://pf.kakao.com/_KxmnZT
              </a>
            </p>
          </div>
        </>
        {/* Email Section */}
        <div className="mt-6">
          <div className="flex items-center gap-4">
            <Label htmlFor="email" className="text-sm font-bold flex-shrink-0">
              {t("ApplicantInfoForm.email")} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              placeholder={t("usa.AppInfo.emailPlaceholder")}
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
              {t("hk_shldr.compName")} <span className="text-red-500">* <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-md text-sm">
                company name is created by user and should be same across application process
              </TooltipContent>
            </Tooltip></span>
            </Label>
            <Input
              id="companyName"
              placeholder={t("hk_shldr.compNamePlaceholder")}
              disabled={true}
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
            {t("hk_shldr.rolesPlayed")}{" "}
            <span className="text-red-500">*</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-md text-sm">
                {t("hk_shldr.rolesPlayedInfo")}
              </TooltipContent>
            </Tooltip>
          </Label>
          <div className="mt-4 space-y-2">
            {roleMap.map(({ key, value }) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={formState.roles.includes(key)}
                  onCheckedChange={(checked) =>
                    handleChange(
                      "roles",
                      checked
                        ? [...formState.roles, key]
                        : formState.roles.filter((r) => r !== key)
                    )
                  }
                />
                <Label htmlFor={key} className="text-sm">
                  {t(value)}
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
            {t("hk_shldr.signiControl")}<span className="text-red-500">*</span>

            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-md text-sm">
                {t("hk_shldr.signiControlInfo")}
              </TooltipContent>
            </Tooltip>
          </Label>
          <RadioGroup
            className="mt-4 space-y-2"
            value={formState.significantController}
            onValueChange={(value) =>
              handleChange("significantController", value)
            }
          >
            {significantControllerMap.map(({ key, value }) => (
              <div key={key} className="flex items-center space-x-2">
                <RadioGroupItem id={key} value={key} />
                <Label htmlFor={key} className="text-sm">
                  {t(value)}
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
              {t("hk_shldr.fullName")}<span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              placeholder={t("hk_shldr.fNamPlacHldr")}
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
              {t("ApplicantInfoForm.phoneNum")} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="mobileNumber"
              placeholder={t("hk_shldr.mobilHlder")}
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
              {t("dashboard.kakaoT")}
            </Label>
            <Input
              id="kakaoTalkId"
              placeholder={t("hk_shldr.kakaoHlder")}
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
              {t("dashboard.wechat")}
            </Label>
            <Input
              id="weChatId"
              placeholder={t("hk_shldr.wechatHldr")}
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
              {t("hk_shldr.passport")}<span className="text-red-500">*</span>
              <Tooltip>
                <TooltipContent className="max-w-md text-sm">
                  {t("hk_shldr.passportInfo")}
                </TooltipContent>
              </Tooltip>
            </Label>
            {typeof formState.passportCopy === 'string' && formState.passportCopy?.split('/')[3] &&
              <span
                className={cn("flex h-9 w-1/4 pt-1 cursor-pointer")}
                onClick={() => {
                  handleFileClick(formState.passportCopy);
                }}
              >
                {formState.passportCopy.split('/')[3]}
              </span>}
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
              {t("hk_shldr.certifiedPass")}{" "}
              <span className="text-red-500">*</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-md text-sm">
                  {t("hk_shldr.chooseHead")}
                  <ol className="list-decimal list-inside">
                    <li>{t("hk_shldr.chList1")}</li>
                    <li>{t("hk_shldr.chList2")}</li>
                    <li>{t("hk_shldr.chList3")}</li>
                    <li>{t("hk_shldr.chList4")}</li>
                  </ol>
                  <p>{t("hk_shldr.chList5")}</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            {typeof formState.personalCertificate === 'string' && formState.personalCertificate?.split('/')[3] &&
              <span
                className={cn("flex h-9 w-1/2 pt-1 cursor-pointer")}
                onClick={() => {
                  handleFileClick(formState.personalCertificate);
                }}
              >
                {formState.personalCertificate.split('/')[3]}
              </span>}
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
              {t("hk_shldr.uploadProof")}{" "}
              <span className="text-red-500">*</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-md text-sm">
                  {t("hk_shldr.upHead")}
                  <ol className="list-decimal list-inside">
                    <li>{t("hk_shldr.up1")}</li>
                    <li>{t("hk_shldr.up2")}</li>
                    <li>{t("hk_shldr.up3")}</li>
                    <li>{t("hk_shldr.up4")}</li>
                  </ol>
                  <p>{t("hk_shldr.upPara")}</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            {typeof formState.proofOfAddress === 'string' && formState.proofOfAddress?.split('/')[3] &&
              <span
                className={cn("flex h-9 w-1/2 pt-1 cursor-pointer")}
                onClick={() => {
                  handleFileClick(formState.proofOfAddress);
                }}>
                {formState.proofOfAddress.split('/')[3]}
              </span>}
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
              {t("hk_shldr.first4Pass")}<span className="text-red-500">*</span>
            </Label>
            <Input
              id="passportDigits"
              placeholder={t("hk_shldr.first4PassInfo")}
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
              {t("hk_shldr.countryBirth")}<span className="text-red-500">*</span>
            </Label>
            <Input
              id="birthCountry"
              placeholder={t("hk_shldr.countryBirthInfo")}
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
              {t("hk_shldr.currentRedsidency")}<span className="text-red-500">*</span>
            </Label>
            <Input
              id="currentResidence"
              placeholder={t("hk_shldr.cRInfo")}
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
            {t("hk_shldr.participateNominee")}
            <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            className="mt-4 space-y-2"
            value={formState.nomineeParticipation || ""}
            onValueChange={(value) => handleChange("nomineeParticipation", value)}
          >
            {overseasResidentStatusOptions.map(({ key, value }) => (
              <div key={key} className="flex items-center space-x-2">
                <RadioGroupItem id={key} value={key} />
                <Label htmlFor={key} className="text-sm">
                  {t(value)}
                </Label>
              </div>
            ))}
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
            {t("hk_shldr.whatAddress")}{" "}
            <span className="text-red-500">*</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-md text-sm">
                {t("hk_shldr.whatAddressInfo")}
              </TooltipContent>
            </Tooltip>
          </Label>
          <RadioGroup
            className="mt-4 space-y-2"
            value={formState.correspondenceAddress}
            onValueChange={(value) => handleChange("correspondenceAddress", value)}
          >
            {correspondenceAddressOptions.map(({ key, label }) => (
              <div key={key} className="flex items-center space-x-2">
                <RadioGroupItem id={key} value={key} />
                <Label htmlFor={key} className="text-sm">
                  {t(label)}
                </Label>
              </div>
            ))}
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
            {t("hk_shldr.overSeasResident")}{" "}
            <span className="text-red-500">*</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-md text-sm">
                {t("hk_shldr.osRGuide")}
              </TooltipContent>
            </Tooltip>
          </Label>
          <RadioGroup
            className="mt-4 space-y-2"
            value={formState.overseasResidentStatus}
            onValueChange={(value) => handleChange("overseasResidentStatus", value)}
          >
            {overseasResidentStatusOptions.map(({ key, value }) => (
              <div key={key} className="flex items-center space-x-2">
                <RadioGroupItem id={key} value={key} />
                <Label htmlFor={key} className="text-sm">
                  {t(value)}
                </Label>
              </div>
            ))}
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
            {t("hk_shldr.foreignDirectRep")}
            <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            className="mt-4 space-y-2"
            value={formState.foreignInvestmentReport}
            onValueChange={(value) => handleChange("foreignInvestmentReport", value)}
          >
            {foreignInvestmentReportOptions.map(({ key, value }) => (
              <div key={key} className="flex items-center space-x-2">
                <RadioGroupItem id={key} value={value} />
                <Label htmlFor={key} className="text-sm">
                  {t(value)}
                </Label>
              </div>
            ))}
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
            {t("hk_shldr.accordanceLaws")}
            <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            className="mt-4 space-y-2"
            value={formState.foreignInvestmentAgreement}
            onValueChange={(value) => handleChange("foreignInvestmentAgreement", value)}
          >
            {foreignInvestmentOptions.map((option) => (
              <div key={option.key} className="flex items-center space-x-2">
                <RadioGroupItem id={option.key} value={option.key} />
                <Label htmlFor={option.key} className="text-sm">
                  {t(option.value)}
                </Label>
              </div>
            ))}
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
            {t("hk_shldr.politicalExposePersn")} <span className="text-red-500">*</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-md text-sm">
                {t("hk_shldr.ppExpInfo")}
              </TooltipContent>
            </Tooltip>
          </Label>
          <RadioGroup
            className="mt-4 space-y-2"
            value={formState.politicallyExposedStatus}
            onValueChange={(value) => handleChange("politicallyExposedStatus", value)}
          >
            {politicallyExposedOptions.map((option) => (
              <div key={option.key} className="flex items-center space-x-2">
                <RadioGroupItem id={option.key} value={option.key} />
                <Label htmlFor={option.key} className="text-sm">
                  {t(option.value)}
                </Label>
              </div>
            ))}
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
            {t("hk_shldr.politicalExplainDetails")}
          </Label>
          <Input
            id="politicalDetails"
            placeholder={t("hk_shldr.ppEInfo")}
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
            {t("hk_shldr.pendingThretenClaim")}
            <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            className="mt-4 space-y-2"
            value={formState.legalIssuesStatus}
            onValueChange={(value) => handleChange("legalIssuesStatus", value)}
          >
            {legalIssuesOptions.map((option) => (
              <div key={option.key} className="flex items-center space-x-2">
                <RadioGroupItem id={option.key} value={option.key} />
                <Label htmlFor={option.key} className="text-sm">
                  {t(option.value)}
                </Label>
              </div>
            ))}
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
            {t("hk_shldr.youCitizen")}
            <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            className="mt-4 space-y-2"
            value={formState.usResidencyStatus}
            onValueChange={(value) => handleChange("usResidencyStatus", value)}
          >
            {usResidencyOptions.map((option) => (
              <div key={option.key} className="flex items-center space-x-2">
                <RadioGroupItem id={option.key} value={option.key} />
                <Label htmlFor={option.key} className="text-sm">
                  {t(option.value)}
                </Label>
              </div>
            ))}
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
            {t("hk_shldr.iitnNum")}
          </Label>
          <Input
            id="usResidencyDetails"
            placeholder={t("hk_shldr.iitnInfo")}
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
            {t("hk_shldr.natureOfFunds")}
            <span className="text-red-500">*</span>
          </Label>
          <div className="mt-4 space-y-2">
            {natureOfFundsOptions.map((option) => (
              <div key={option.key} className="flex items-center space-x-2">
                <Checkbox
                  id={option.key}
                  onCheckedChange={(checked) =>
                    handleChange(
                      "natureOfFunds",
                      checked
                        ? [...formState.natureOfFunds, option.key]
                        : formState.natureOfFunds.filter((fund) => fund !== option.key)
                    )
                  }
                  checked={formState.natureOfFunds?.includes(option.key)}
                />
                <Label htmlFor={option.key} className="text-sm">
                  {t(option.value)}
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
            {t("hk_shldr.sourceOfFunds")}
            <span className="text-red-500">*</span>
          </Label>
          <div className="mt-4 space-y-2">
            {sourceOfFundsOptions.map((option) => (
              <div key={option.key} className="flex items-center space-x-2">
                <Checkbox
                  id={option.key}
                  onCheckedChange={(checked) =>
                    handleChange(
                      "sourceOfFunds",
                      checked
                        ? [...formState.sourceOfFunds, option.key]
                        : formState.sourceOfFunds.filter((fund) => fund !== option.key)
                    )
                  }
                  checked={formState.sourceOfFunds?.includes(option.key)}
                />
                <Label htmlFor={option.key} className="text-sm">
                  {t(option.value)}
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
            {t("hk_shldr.countryFundsFlow")}
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="countryOfFundOrigin"
            placeholder={t("hk_shldr.ccFInfo")}
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
            {t("hk_shldr.isBankrupt")}
            <span className="text-red-500">*</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
              </TooltipTrigger>
              {/* Tooltip Content */}
              <TooltipContent className="max-w-md text-sm">
                {t("hk_shldr.isBnkInfo")}
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
                {t("AmlCdd.options.yes")}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="bankruptcyNo" value="No" />
              <Label htmlFor="bankruptcyNo" className="text-sm">
                {t("AmlCdd.options.no")}
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
           {t("hk_shldr.violatedLaw")}
            <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            className="mt-4 space-y-2"
            value={formState.pastParticipation}
            onValueChange={(value) => handleChange("pastParticipation", value)}
          >
            {legalIssuesOptions.map((option) => (
              <div key={option.key} className="flex items-center space-x-2">
                <RadioGroupItem id={option.key} value={option.key} />
                <Label htmlFor={option.key} className="text-sm">
                  {t(option.value)}
                </Label>
              </div>
            ))}
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
            {t("hk_shldr.anyQuestionsApply")}
          </Label>
          <Input
            id="additionalInfo"
            placeholder={t("hk_shldr.enterDetails")}
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
            {t("hk_shldr.agreeDocsInfo")}
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
               {t("AmlCdd.options.yes")}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="agreementNo" value="No" />
              <Label htmlFor="agreementNo" className="text-sm">
               {t("AmlCdd.options.no")}
              </Label>
            </div>
          </RadioGroup>
          {errors.agreementDeclaration && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.agreementDeclaration}</AlertDescription>
            </Alert>
          )}
        </div>

        {showSuccess && <div className="mt-8 bg-gray-100 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-bold text-gray-800">{t("hk_shldr.complete")}</h2>
          <p className="text-sm text-gray-600 mt-2">
            {t("hk_shldr.thankYu")}
          </p>
        </div>}
        {/* Submit Button */}
        <div className="flex justify-end mt-6">
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
        <FileDialog
          open={openFile}
          onOpenChange={setOpenFile}
        >
          <iframe
            src={fileSource}
            className="w-full h-full object-contain"
            title="Receipt"
          />
        </FileDialog>
      </CardContent>
    </Card>
  );
};

export default HkShareHldrDir;