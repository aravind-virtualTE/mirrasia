/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useAtom } from "jotai";
import { HelpCircle } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { ShareHolderRegistrationForm } from "@/types/hkForm";
import { getShrDirRegData, saveShrDirRegData } from "@/services/dataFetch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { FileDialog } from "@/components/ui/fileDialog";

import {
  correspondenceAddressOptions,
  foreignInvestmentOptions,
  foreignInvestmentReportOptions,
  legalIssuesOptions,
  natureOfFundsOptions,
  overseasResidentStatusOptions,
  politicallyExposedOptions,
  roleMap,
  significantControllerMap,
  sourceOfFundsOptions,
  usResidencyOptions,
} from "./ShrDirConstants";
import { multiShrDirResetAtom } from "../shareholderDirector/constants";

/* ---------- tiny ui bits (tailwind + shadcn) ---------- */

const BrandH1: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h1 className="text-[22px] font-semibold text-[#0F3D6E]">{children}</h1>
);

function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#0F3D6E] to-emerald-500 transition-[width]"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function Stepper({ steps, active }: { steps: string[]; active: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mt-3">
      {steps.map((s, i) => {
        const isActive = i === active;
        return (
          <div
            key={s}
            className={cn(
              "flex items-center gap-2 rounded-xl border p-2 text-xs bg-slate-50",
              isActive
                ? "border-[#0F3D6E] shadow-[0_0_0_2px] shadow-blue-500/15"
                : "border-slate-200"
            )}
          >
            <span
              className={cn(
                "inline-flex h-6 w-6 items-center justify-center rounded-full font-semibold",
                isActive ? "bg-[#0F3D6E] text-white" : "bg-slate-200 text-slate-700"
              )}
            >
              {i + 1}
            </span>
            <span className="truncate">{s}</span>
          </div>
        );
      })}
    </div>
  );
}

function Field({
  label,
  required,
  tooltip,
  children,
  hint,
}: {
  label?: React.ReactNode;
  required?: boolean;
  tooltip?: React.ReactNode;
  children: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <div className="relative rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between">
        {label ? (
          <Label className="font-semibold">
            {label} {required && <span className="text-red-600 ml-0.5">*</span>}
          </Label>
        ) : (
          <div />
        )}
        {tooltip}
      </div>
      <div className="mt-2">{children}</div>
      {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function IHelp({ children }: { children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700"
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-sm text-xs">{children}</TooltipContent>
    </Tooltip>
  );
}

/** A nicer file input using Tailwind's `file:` utilities (no external libs) */
function FileInput({
  id,
  onChange,
  accept,
  multiple,
  existingName,
}: {
  id: string;
  onChange: (f: File | undefined) => void;
  accept?: string;
  multiple?: boolean;
  existingName?: string;
}) {
  const ref = useRef<HTMLInputElement | null>(null);

  return (
    <div
      className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-4 text-center hover:bg-slate-50 transition cursor-pointer"
      onClick={() => {
        ref.current?.click();
      }}
    >
      {/* Hidden file input */}
      <Input
        id={id}
        ref={ref}
        type="file"
        accept={accept}
        multiple={multiple}
        className="mt-3 w-full cursor-pointer file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-slate-700 hover:file:bg-slate-200"
        onChange={(e) => {
          onChange(e.target.files?.[0]);
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      />

      {existingName ? (
        <div className="mt-3 text-left text-sm">
          <div className="rounded-lg border border-slate-200 p-2">
            <span className="truncate block">{existingName}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* --------------------- main component --------------------- */

const HkShareHldrDir = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [multiData] = useAtom<any>(multiShrDirResetAtom);

  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formState, setFormState] = useState<ShareHolderRegistrationForm>({
    _id: "",
    email: "",
    companyName: "",
    companyId: "",
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
    regId: "",
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

  const [fileSource, setFileSource] = useState<any>("");
  const [openFile, setOpenFile] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      (async () => {
        const data = await getShrDirRegData(id);
        setFormState(data);
      })();
    }
    const multiShId = localStorage.getItem("shdrItem");
    const findData =
      multiData.length > 0
        ? multiData.find((item: { _id: string | null }) => item._id === multiShId)
        : null;
    if (findData) {
      setFormState((s) => ({
        ...s,
        email: findData.email,
        companyName: findData.companyName,
        companyId: findData.companyId,
      }));
    }
  }, []);

  const handleChange = <T extends keyof typeof formState>(
    field: T,
    value: typeof formState[T]
  ) => setFormState((prev) => ({ ...prev, [field]: value }));

    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null


  const handleSubmit = async () => {
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach((k) => ((newErrors as any)[k] = ""));

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
      newErrors.foreignInvestmentAgreement =
        "Please agree or disagree with the foreign direct investment responsibility";
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
    // console.log("newErrors",newErrors)
    // console.log("formState",formState)
    setErrors(newErrors);
    if (Object.values(newErrors).every((e) => e === "")) {
      const result = await saveShrDirRegData(formState, id);
      localStorage.removeItem("shdrItem");
      if (result.success == true) {
        setFormState(result.registeredData);
        navigate(user.role === "admin" ? "/admin-dashboard" : "/dashboard");
        toast({ title: "Details submitted", description: "Saved successfully" });
        setShowSuccess(true);
      }
    } else {
      toast({ title: "Enter Missing Items", description: "PLease enter all required items" });
      setShowSuccess(false);
    }
  };

  const handleFileClick = (src: any) => {
    setFileSource(src);
    setOpenFile(true);
  };

  /* progress/steps (visual only, no behavior change) */
  const steps = [
    "Company/Contact",
    "Roles",
    "Personal",
    "Uploads",
    "Legal/Risk",
    "Funds/Consent",
  ];
  const stepChecks = [
    () => !!formState.email && !!formState.companyName,
    () => formState.roles.length > 0 && !!formState.significantController,
    () => !!formState.fullName && !!formState.mobileNumber,
    () =>
      !!formState.passportDigits &&
      !!formState.birthCountry &&
      !!formState.currentResidence &&
      !!formState.passportCopy &&
      !!formState.personalCertificate &&
      !!formState.proofOfAddress,
    () =>
      !!formState.politicallyExposedStatus &&
      !!formState.legalIssuesStatus &&
      !!formState.undischargedBankruptcy &&
      !!formState.usResidencyStatus,
    () =>
      formState.natureOfFunds.length > 0 &&
      formState.sourceOfFunds.length > 0 &&
      !!formState.countryOfFundOrigin &&
      !!formState.correspondenceAddress &&
      !!formState.overseasResidentStatus &&
      !!formState.foreignInvestmentReport &&
      !!formState.foreignInvestmentAgreement &&
      !!formState.pastParticipation &&
      !!formState.agreementDeclaration,
  ];
  const activeStep = stepChecks.findIndex((fn) => !fn());
  const currentStep = activeStep === -1 ? steps.length - 1 : activeStep;
  const progressValue = useMemo(() => {
    const total = stepChecks.length;
    const completed = stepChecks.filter((f) => f()).length;
    return (completed / total) * 100;
  }, [formState]); // eslint-disable-line

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 md:px-6 py-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <BrandH1>{t("hk_shldr.heading")}</BrandH1>
      </div>

      <ProgressBar value={progressValue} />
      <Stepper steps={steps} active={currentStep} />

      {/* Intro card */}
      <Card className="mt-4 rounded-2xl border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">0) {t("hk_shldr.heading")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>{t("hk_shldr.p1")}</p>
          <p>{t("hk_shldr.p2")}</p>
          <p>{t("hk_shldr.p3")}</p>
          <p>{t("hk_shldr.p4")}</p>
          <p className="font-semibold mt-2">{t("SwitchService.Consultation.thanks")}</p>
          <div className="text-slate-700">
            Mirr Asia <br />
            (Hong Kong) +852-2187-2428 <br />
            (Korea) +82-2-543-6187 <br />
            {t("dashboard.kakaoT")}: mirrasia &nbsp;|&nbsp; {t("dashboard.wechat")}: mirrasia_hk
            <br />
            {t("dashboard.Website")}:{" "}
            <a href="https://www.mirrasia.com" className="text-blue-600 underline">
              www.mirrasia.com
            </a>
            <br />
            {t("dashboard.kakaChannel")}:{" "}
            <a href="https://pf.kakao.com/_KxmnZT" className="text-blue-600 underline">
              https://pf.kakao.com/_KxmnZT
            </a>
          </div>

          {/* Email + Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <Field
              label={t("ApplicantInfoForm.email")}
              required
              tooltip={
                <IHelp>
                  <ul className="list-disc pl-4">
                    <li>Submission receipt & deficiency notices</li>
                    <li>E-signature link delivery</li>
                    <li>Mandatory regulatory notifications</li>
                  </ul>
                </IHelp>
              }
            >
              <Input
                id="email"
                placeholder={t("usa.AppInfo.emailPlaceholder")}
                value={formState.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={cn(errors.email && "border-red-500")}
              />
              {errors.email && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{errors.email}</AlertDescription>
                </Alert>
              )}
            </Field>

            <Field
              label={t("hk_shldr.compName")}
              required
              tooltip={
                <IHelp>
                  <ul className="list-disc pl-4">
                    <li>Enter the exact English legal name.</li>
                    <li>If undecided, write “To be confirmed”.</li>
                  </ul>
                </IHelp>
              }
            >
              <Input
                id="companyName"
                placeholder={t("hk_shldr.compNamePlaceholder")}
                disabled
                value={formState.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                className={cn(errors.companyName && "border-red-500")}
              />
              {errors.companyName && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{errors.companyName}</AlertDescription>
                </Alert>
              )}
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* 1) Roles */}
      <Card className="mt-5 rounded-2xl border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            1) {t("hk_shldr.rolesPlayed")} <span className="text-red-600">*</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span>{t("hk_shldr.rolesPlayed")}</span>
              <IHelp>{t("hk_shldr.rolesPlayedInfo")}</IHelp>
            </div>
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
        </CardContent>
      </Card>

      {/* 2) Significant Controller */}
      <Card className="mt-5 rounded-2xl border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            2) {t("hk_shldr.signiControl")} <span className="text-red-600">*</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Field
            tooltip={
              <IHelp>
                <ul className="list-disc pl-4">
                  <li>5 holders × 20% → same share</li>
                  <li>Holdco owns 100%; you own 30% of holdco → “holdco ≥25%”</li>
                  <li>&lt;25% yet largest stake → “largest shareholder”</li>
                </ul>
              </IHelp>
            }
          >
            <RadioGroup
              className="space-y-2"
              value={formState.significantController}
              onValueChange={(value) => handleChange("significantController", value)}
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
          </Field>
        </CardContent>
      </Card>

      {/* 3) Personal info */}
      <Card className="mt-5 rounded-2xl border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">3) {t("hk_shldr.personal")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label={t("hk_shldr.fullName")} required hint="Must exactly match the passport (spelling & order).">
              <Input
                id="fullName"
                placeholder={t("hk_shldr.fNamPlacHldr")}
                value={formState.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                className={cn(errors.fullName && "border-red-500")}
              />
              {errors.fullName && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{errors.fullName}</AlertDescription>
                </Alert>
              )}
            </Field>

            <Field label={t("ApplicantInfoForm.phoneNum")} required hint="Include country code (+852, +82, etc.).">
              <Input
                id="mobileNumber"
                placeholder={t("hk_shldr.mobilHlder")}
                value={formState.mobileNumber}
                onChange={(e) => handleChange("mobileNumber", e.target.value)}
                className={cn(errors.mobileNumber && "border-red-500")}
              />
              {errors.mobileNumber && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{errors.mobileNumber}</AlertDescription>
                </Alert>
              )}
            </Field>

            <Field label={t("dashboard.kakaoT")}>
              <Input
                id="kakaoTalkId"
                placeholder={t("hk_shldr.kakaoHlder")}
                value={formState.kakaoTalkId}
                onChange={(e) => handleChange("kakaoTalkId", e.target.value)}
              />
            </Field>

            <Field label={t("dashboard.wechat")}>
              <Input
                id="weChatId"
                placeholder={t("hk_shldr.wechatHldr")}
                value={formState.weChatId}
                onChange={(e) => handleChange("weChatId", e.target.value)}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* 4) Identity / Address & Uploads */}
      <Card className="mt-5 rounded-2xl border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">4) Identity / Address & Document Uploads</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Field label={t("hk_shldr.first4Pass")} required>
              <Input
                id="passportDigits"
                maxLength={4}
                placeholder={t("hk_shldr.first4PassInfo")}
                value={formState.passportDigits || ""}
                onChange={(e) => handleChange("passportDigits", e.target.value)}
                className={cn(errors.passportDigits && "border-red-500")}
              />
              {errors.passportDigits && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{errors.passportDigits}</AlertDescription>
                </Alert>
              )}
            </Field>

            <Field label={t("hk_shldr.countryBirth")} required>
              <Input
                id="birthCountry"
                placeholder={t("hk_shldr.countryBirthInfo")}
                value={formState.birthCountry || ""}
                onChange={(e) => handleChange("birthCountry", e.target.value)}
                className={cn(errors.birthCountry && "border-red-500")}
              />
              {errors.birthCountry && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{errors.birthCountry}</AlertDescription>
                </Alert>
              )}
            </Field>

            <Field label={t("hk_shldr.currentRedsidency")} required>
              <Input
                id="currentResidence"
                placeholder={t("hk_shldr.cRInfo")}
                value={formState.currentResidence || ""}
                onChange={(e) => handleChange("currentResidence", e.target.value)}
                className={cn(errors.currentResidence && "border-red-500")}
              />
              {errors.currentResidence && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{errors.currentResidence}</AlertDescription>
                </Alert>
              )}
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Field
              label={t("hk_shldr.passport")}
              required
              tooltip={
                <IHelp>
                  <ul className="list-disc pl-4">
                    <li>PDF/JPG/PNG, ≤ 10MB</li>
                    <li>Color, all corners visible</li>
                    <li>Avoid glare and shadow</li>
                  </ul>
                </IHelp>
              }
            >
              <FileInput
                id="passportCopy"
                accept=".pdf,.jpg,.png,.jpeg"
                onChange={(f) => handleChange("passportCopy", f || "")}
                existingName={
                  typeof formState.passportCopy === "string"
                    ? formState.passportCopy.split("/")[3]
                    : undefined
                }
              />
              {typeof formState.passportCopy === "string" &&
                formState.passportCopy?.split("/")[3] && (
                  <Button
                    variant="ghost"
                    className="mt-3"
                    onClick={() => handleFileClick(formState.passportCopy)}
                  >
                    View: {formState.passportCopy.split("/")[3]}
                  </Button>
                )}
              {errors.passportCopy && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{errors.passportCopy}</AlertDescription>
                </Alert>
              )}
            </Field>

            <Field
              label={t("hk_shldr.certifiedPass")}
              required
              tooltip={
                <IHelp>
                  <ul className="list-disc pl-4">
                    <li>Issued within 3 months</li>
                    <li>Notary/authority seal and signature</li>
                    <li>Marked “True Copy”</li>
                  </ul>
                </IHelp>
              }
            >
              <FileInput
                id="personalCertificate"
                accept=".pdf,.jpg,.png,.jpeg"
                onChange={(f) => handleChange("personalCertificate", f || "")}
                existingName={
                  typeof formState.personalCertificate === "string"
                    ? formState.personalCertificate.split("/")[3]
                    : undefined
                }
              />
              {typeof formState.personalCertificate === "string" &&
                formState.personalCertificate?.split("/")[3] && (
                  <Button
                    variant="ghost"
                    className="mt-3"
                    onClick={() => handleFileClick(formState.personalCertificate)}
                  >
                    View: {formState.personalCertificate.split("/")[3]}
                  </Button>
                )}
              {errors.personalCertificate && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{errors.personalCertificate}</AlertDescription>
                </Alert>
              )}
            </Field>

            <Field
              label={t("hk_shldr.uploadProof")}
              required
              tooltip={
                <IHelp>
                  <ul className="list-disc pl-4">
                    <li>{t("hk_shldr.up1")}</li>
                    <li>{t("hk_shldr.up2")}</li>
                    <li>{t("hk_shldr.up3")}</li>
                    <li>{t("hk_shldr.up4")}</li>
                  </ul>
                </IHelp>
              }
            >
              <FileInput
                id="proofOfAddress"
                accept=".pdf,.jpg,.png,.jpeg"
                onChange={(f) => handleChange("proofOfAddress", f || "")}
                existingName={
                  typeof formState.proofOfAddress === "string"
                    ? formState.proofOfAddress.split("/")[3]
                    : undefined
                }
              />
              {typeof formState.proofOfAddress === "string" &&
                formState.proofOfAddress?.split("/")[3] && (
                  <Button
                    variant="ghost"
                    className="mt-3"
                    onClick={() => handleFileClick(formState.proofOfAddress)}
                  >
                    View: {formState.proofOfAddress.split("/")[3]}
                  </Button>
                )}
              {errors.proofOfAddress && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{errors.proofOfAddress}</AlertDescription>
                </Alert>
              )}
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* 5) Nominee/Correspondence/FDI */}
      <Card className="mt-5 rounded-2xl border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">5) Nominee/Trustee • Correspondence Address • FDI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field
              label={t("hk_shldr.participateNominee")}
              required
              tooltip={
                <IHelp>
                  Includes acting in name only on behalf of the ultimate beneficial owner.
                </IHelp>
              }
            >
              <RadioGroup
                className="space-y-2"
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
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{errors.nomineeParticipation}</AlertDescription>
                </Alert>
              )}
            </Field>

            <Field
              label={t("hk_shldr.whatAddress")}
              required
              tooltip={
                <IHelp>
                  Publicly disclosed mailing/contact address. Use registered business address if you
                  prefer privacy.
                </IHelp>
              }
            >
              <RadioGroup
                className="space-y-2"
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
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Field
              label={t("hk_shldr.foreignDirectRep")}
              required
              tooltip={<IHelp>Your country may require FDI reporting.</IHelp>}
            >
              <RadioGroup
                className="space-y-2"
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
            </Field>

            <Field
              label={t("hk_shldr.accordanceLaws")}
              required
              tooltip={<IHelp>If you have an obligation, indicate the current status.</IHelp>}
            >
              <RadioGroup
                className="space-y-2"
                value={formState.foreignInvestmentAgreement}
                onValueChange={(value) => handleChange("foreignInvestmentAgreement", value)}
              >
                {foreignInvestmentOptions.map((opt) => (
                  <div key={opt.key} className="flex items-center space-x-2">
                    <RadioGroupItem id={opt.key} value={opt.key} />
                    <Label htmlFor={opt.key} className="text-sm">
                      {t(opt.value)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.foreignInvestmentAgreement && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{errors.foreignInvestmentAgreement}</AlertDescription>
                </Alert>
              )}
            </Field>

            <Field
              label={t("hk_shldr.overSeasResident")}
              required
              tooltip={<IHelp>{t("hk_shldr.osRGuide")}</IHelp>}
            >
              <RadioGroup
                className="space-y-2"
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
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* 6) PEP / Legal / US */}
      <Card className="mt-5 rounded-2xl border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">6) PEP / Legal issues / US tax</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field
            label={t("hk_shldr.politicalExposePersn")}
            required
            tooltip={<IHelp>{t("hk_shldr.ppExpInfo")}</IHelp>}
          >
            <RadioGroup
              className="space-y-2"
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
          </Field>

          <Field label={t("hk_shldr.politicalExplainDetails")}>
            <Input
              id="politicalDetails"
              placeholder={t("hk_shldr.ppEInfo")}
              value={formState.politicalDetails}
              onChange={(e) => handleChange("politicalDetails", e.target.value)}
            />
            {errors.politicalDetails && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>{errors.politicalDetails}</AlertDescription>
              </Alert>
            )}
          </Field>

          <Field
            label={t("hk_shldr.pendingThretenClaim")}
            required
            tooltip={
              <IHelp>
                Any pending claims, convictions, investigations or court proceedings.
              </IHelp>
            }
          >
            <RadioGroup
              className="space-y-2"
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
          </Field>

          <Field label={t("hk_shldr.youCitizen")} required>
            <RadioGroup
              className="space-y-2"
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
          </Field>

          <Field label={t("hk_shldr.iitnNum")}>
            <Input
              id="usResidencyDetails"
              placeholder={t("hk_shldr.iitnInfo")}
              value={formState.usResidencyDetails}
              onChange={(e) => handleChange("usResidencyDetails", e.target.value)}
            />
            {errors.usResidencyDetails && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>{errors.usResidencyDetails}</AlertDescription>
              </Alert>
            )}
          </Field>
        </CardContent>
      </Card>

      {/* 7) Nature & Source of Funds */}
      <Card className="mt-5 rounded-2xl border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">7) {t("hk_shldr.natureOfFunds")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field
              label={t("hk_shldr.natureOfFunds")}
              required
              tooltip={<IHelp>Multiple selections allowed.</IHelp>}
            >
              <div className="space-y-2">
                {natureOfFundsOptions.map((option) => (
                  <div key={option.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.key}
                      checked={formState.natureOfFunds?.includes(option.key)}
                      onCheckedChange={(checked) =>
                        handleChange(
                          "natureOfFunds",
                          checked
                            ? [...formState.natureOfFunds, option.key]
                            : formState.natureOfFunds.filter((fund) => fund !== option.key)
                        )
                      }
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
            </Field>

            <Field
              label={t("hk_shldr.sourceOfFunds")}
              required
              tooltip={<IHelp>Explain origin of the money & wealth.</IHelp>}
            >
              <div className="space-y-2">
                {sourceOfFundsOptions.map((option) => (
                  <div key={option.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.key}
                      checked={formState.sourceOfFunds?.includes(option.key)}
                      onCheckedChange={(checked) =>
                        handleChange(
                          "sourceOfFunds",
                          checked
                            ? [...formState.sourceOfFunds, option.key]
                            : formState.sourceOfFunds.filter((fund) => fund !== option.key)
                        )
                      }
                    />
                    <Label htmlFor={option.key} className="text-sm">
                      {t(option.value)}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.sourceOfFunds && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{errors.sourceOfFunds}</AlertDescription>
                </Alert>
              )}
            </Field>
          </div>

          <Field label={t("hk_shldr.countryFundsFlow")} required>
            <Input
              id="countryOfFundOrigin"
              placeholder={t("hk_shldr.ccFInfo")}
              value={formState.countryOfFundOrigin}
              onChange={(e) => handleChange("countryOfFundOrigin", e.target.value)}
              className={cn(errors.countryOfFundOrigin && "border-red-500")}
            />
            {errors.countryOfFundOrigin && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>{errors.countryOfFundOrigin}</AlertDescription>
              </Alert>
            )}
          </Field>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">8) {t("hk_shldr.finalConfirm", "Miscellaneous")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <Field label="Are you currently undischarged bankrupt?" required>
            <RadioGroup
              className="space-y-2"
              value={formState.undischargedBankruptcy}
              onValueChange={(value) => handleChange("undischargedBankruptcy", value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="undischargeBankruptYes" value="Yes" />
                <Label htmlFor="undischargeBankruptYes" className="text-sm">
                  {t("AmlCdd.options.yes")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="undischargeBankruptNo" value="No" />
                <Label htmlFor="undischargeBankruptNo" className="text-sm">
                  {t("AmlCdd.options.no")}
                </Label>
              </div>
            </RadioGroup>
            {errors.undischargedBankruptcy && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>{errors.undischargedBankruptcy}</AlertDescription>
              </Alert>
            )}
          </Field>
           <Field label="In the past, have you established/joined/participated in a company/organization/business/joint venture/branch/contact office as a director/shareholder/cooperative/individual business entity in Hong Kong or have you ever violated company ordinances/tax ordinances/other laws due to refusal to subpoena a court subpoena, false report of submitted documents, etc., or have you ever been forcibly dissolved in accordance with a court order due to prosecution/bankruptcy/criminal violations?" required>
            <RadioGroup
              className="space-y-2"
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
          </Field>
          <Field label={t("hk_shldr.anyQuestionsApply")}>
            <Input
              id="additionalInfo"
              placeholder={t("hk_shldr.enterDetails")}
              value={formState.additionalInfo}
              onChange={(e) => handleChange("additionalInfo", e.target.value)}
            />
            {errors.additionalInfo && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>{errors.additionalInfo}</AlertDescription>
              </Alert>
            )}
          </Field>
        </CardContent>
      </Card>  

      {/* 8) Final */}
      <Card className="mt-5 rounded-2xl border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">9) {t("hk_shldr.finalConfirm", "Final Confirmation & Consent")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <Field label={t("hk_shldr.agreeDocsInfo")} required>
            <RadioGroup
              className="space-y-2"
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
          </Field>          

          {showSuccess && (
            <div className="rounded-xl bg-slate-50 p-5 border border-slate-200 shadow-sm">
              <h2 className="text-base font-semibold text-slate-800">{t("hk_shldr.complete")}</h2>
              <p className="mt-2 text-sm text-slate-600">{t("hk_shldr.thankYu")}</p>
            </div>
          )}

          <div className="flex items-center justify-end">
            <Button onClick={handleSubmit} className="rounded-xl bg-[#0F3D6E] hover:bg-[#0d355f]">
              Submit
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 text-center text-xs text-slate-500">
        © MIRR ASIA — HK Company KYC / Registration Intake
      </div>

      {/* File preview dialog (unchanged api) */}
      <FileDialog open={openFile} onOpenChange={setOpenFile}>
        <iframe src={fileSource} className="w-full h-full object-contain" title="Receipt" />
      </FileDialog>
    </div>
  );
};

export default HkShareHldrDir;
