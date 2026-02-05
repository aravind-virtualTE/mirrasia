/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { HelpCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { PartyField, PartyFormConfig, PartyStep } from "./partyKycTypes";

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
            key={`${s}-${i}`}
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

function Field({
  label,
  required,
  tooltip,
  children,
  hint,
  className,
}: {
  label?: React.ReactNode;
  required?: boolean;
  tooltip?: React.ReactNode;
  children: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative rounded-xl border border-slate-200 bg-white p-4", className)}>
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

function FileInput({
  id,
  onChange,
  accept,
  existingName,
  uploading,
}: {
  id: string;
  onChange: (f: File | undefined) => void;
  accept?: string;
  existingName?: string;
  uploading?: boolean;
}) {
  const ref = useRef<HTMLInputElement | null>(null);
  return (
    <div
      className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-4 text-center hover:bg-slate-50 transition cursor-pointer"
      onClick={() => ref.current?.click()}
    >
      <Input
        id={id}
        ref={ref}
        type="file"
        accept={accept}
        className="mt-3 w-full cursor-pointer file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-slate-700 hover:file:bg-slate-200"
        onChange={(e) => onChange(e.target.files?.[0])}
        onClick={(e) => e.stopPropagation()}
      />
      {uploading && (
        <div className="mt-2 flex items-center justify-center text-xs text-slate-500">
          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> Uploading...
        </div>
      )}
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

type PartyKycHeader = {
  companyName?: string;
  countryName?: string;
  partyName?: string;
  roles?: string[];
  kycStatus?: string;
};

type PartyKycEngineProps = {
  config: PartyFormConfig;
  initialValues?: Record<string, any>;
  header?: PartyKycHeader;
  onSave: (values: Record<string, any>, status: "in_progress" | "submitted") => Promise<void>;
  onFileUpload: (field: string, file: File) => Promise<string>;
  onFileRemove?: (field: string, value?: string) => Promise<void> | void;
  mode?: "edit" | "detail";
};

const isEmptyValue = (field: PartyField, value: any) => {
  if (field.type === "checkbox-group") {
    return !Array.isArray(value) || value.length === 0;
  }
  if (field.type === "checkbox") return !value;
  if (field.type === "file") return !value;
  return value === undefined || value === null || String(value).trim() === "";
};

const getFileName = (value?: string) => {
  if (!value) return "";
  const parts = value.split("/");
  return parts[parts.length - 1];
};

export default function PartyKycEngine({
  config,
  initialValues,
  header,
  onSave,
  onFileUpload,
  onFileRemove,
  mode = "edit",
}: PartyKycEngineProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const isReadOnly = mode === "detail";
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [removing, setRemoving] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  const steps = config.steps || [];

  useEffect(() => {
    if (initialValues) setFormData((prev) => ({ ...initialValues, ...prev }));
  }, [initialValues]);

  const stepChecks = useMemo(() => {
    return steps.map((step) => {
      const requiredFields = step.fields.filter(
        (f) => f.required && (!f.condition || f.condition(formData))
      );
      return requiredFields.every((f) => !isEmptyValue(f, formData[f.name]));
    });
  }, [steps, formData]);

  const currentStep = steps[currentStepIdx] as PartyStep;
  const activeStep = stepChecks.findIndex((v) => !v);
  const currentActiveStep = activeStep === -1 ? steps.length - 1 : activeStep;
  const progressValue = useMemo(() => {
    const total = stepChecks.length || 1;
    const completed = stepChecks.filter((f) => f).length;
    return (completed / total) * 100;
  }, [stepChecks]);

  const validateStep = (step: PartyStep) => {
    const nextErrors: Record<string, string> = {};
    step.fields.forEach((field) => {
      if (field.condition && !field.condition(formData)) return;
      if (!field.required) return;
      const value = formData[field.name];
      if (isEmptyValue(field, value)) {
        nextErrors[field.name] = "Required";
      }
    });
    return nextErrors;
  };

  const validateAll = () => {
    const allErrors: Record<string, string> = {};
    steps.forEach((step) => {
      Object.assign(allErrors, validateStep(step));
    });
    return allErrors;
  };

  const handleNext = async () => {
    if (!currentStep) return;
    if (isReadOnly) {
      setCurrentStepIdx((prev) => Math.min(prev + 1, steps.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const nextErrors = validateStep(currentStep);
    setErrors((prev) => ({ ...prev, ...nextErrors }));
    if (Object.keys(nextErrors).length > 0) {
      toast({ title: "Missing info", description: "Please complete required fields." });
      return;
    }
    setCurrentStepIdx((prev) => Math.min(prev + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setCurrentStepIdx((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async (status: "in_progress" | "submitted") => {
    const nextErrors = status === "submitted" ? validateAll() : validateStep(currentStep);
    setErrors(nextErrors);
    if (status === "submitted" && Object.keys(nextErrors).length > 0) {
      const firstErrorStep = steps.findIndex((step) =>
        step.fields.some((f) => nextErrors[f.name])
      );
      if (firstErrorStep >= 0) setCurrentStepIdx(firstErrorStep);
      toast({ title: "Missing info", description: "Please complete required fields." });
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData, status);
      toast({
        title: status === "submitted" ? "KYC submitted" : "Saved",
        description: status === "submitted" ? "Your KYC is under review." : "Draft saved.",
      });
    } catch (err) {
      toast({ title: "Save failed", description: "Unable to save. Please retry.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (field: PartyField, file?: File) => {
    if (!file) return;
    setUploading((prev) => ({ ...prev, [field.name]: true }));
    try {
      const url = await onFileUpload(field.name, file);
      updateField(field.name, url);
    } catch (err) {
      toast({ title: "Upload failed", description: "Could not upload file.", variant: "destructive" });
    } finally {
      setUploading((prev) => ({ ...prev, [field.name]: false }));
    }
  };

  const handleFileRemove = async (field: PartyField) => {
    const currentValue = formData[field.name];
    if (!currentValue) return;
    setRemoving((prev) => ({ ...prev, [field.name]: true }));
    try {
      if (onFileRemove) {
        await onFileRemove(field.name, currentValue);
      }
      updateField(field.name, "");
    } catch (err) {
      toast({ title: "Remove failed", description: "Could not remove file.", variant: "destructive" });
    } finally {
      setRemoving((prev) => ({ ...prev, [field.name]: false }));
    }
  };

  const renderField = (field: PartyField) => {
    if (field.condition && !field.condition(formData)) return null;
    const error = errors[field.name];
    const value = formData[field.name];
    const colSpan = field.colSpan === 2 ? "md:col-span-2" : "";
    const tooltipNode = field.tooltip ? <IHelp>{t(field.tooltip, field.tooltip)}</IHelp> : undefined;
    const labelText = t(field.label, field.label);
    const placeholderText = field.placeholder ? t(field.placeholder, field.placeholder) : undefined;

    const isDisabled = isReadOnly || field.readOnly;

    if (field.type === "text" || field.type === "email" || field.type === "number" || field.type === "date" || field.type === "tel") {
      return (
        <Field key={field.name} label={labelText} required={field.required} tooltip={tooltipNode} className={colSpan}>
          <Input
            type={field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "tel" ? "tel" : "text"}
            value={value || ""}
            readOnly={isDisabled}
            disabled={isDisabled}
            placeholder={placeholderText}
            onChange={(e) => updateField(field.name, e.target.value)}
            className={cn(error && "border-red-500", isDisabled && "bg-slate-100")}
          />
          {error && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </Field>
      );
    }

    if (field.type === "textarea") {
      return (
        <Field key={field.name} label={labelText} required={field.required} tooltip={tooltipNode} className={colSpan}>
          <Textarea
            value={value || ""}
            placeholder={placeholderText}
            readOnly={isDisabled}
            disabled={isDisabled}
            onChange={(e) => updateField(field.name, e.target.value)}
            className={cn(error && "border-red-500", isDisabled && "bg-slate-100")}
          />
          {error && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </Field>
      );
    }

    if (field.type === "select") {
      return (
        <Field key={field.name} label={labelText} required={field.required} tooltip={tooltipNode} className={colSpan}>
          <Select value={value || ""} onValueChange={(v) => updateField(field.name, v)}>
            <SelectTrigger disabled={isDisabled}>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {(field.options || []).map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {t(opt.label, opt.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </Field>
      );
    }

    if (field.type === "radio") {
      return (
        <Field key={field.name} label={labelText} required={field.required} tooltip={tooltipNode} className={colSpan}>
          <RadioGroup
            value={value || ""}
            onValueChange={(v) => updateField(field.name, v)}
            className="space-y-2"
          >
            {(field.options || []).map((opt) => (
              <div key={opt.value} className="flex items-center space-x-2">
                <RadioGroupItem id={`${field.name}-${opt.value}`} value={opt.value} disabled={isDisabled} />
                <Label htmlFor={`${field.name}-${opt.value}`} className="text-sm">
                  {t(opt.label, opt.label)}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {error && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </Field>
      );
    }

    if (field.type === "checkbox-group") {
      const selected = Array.isArray(value) ? value : [];
      return (
        <Field key={field.name} label={labelText} required={field.required} tooltip={tooltipNode} className={colSpan}>
          <div className="space-y-2">
            {(field.options || []).map((opt) => (
              <div key={opt.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.name}-${opt.value}`}
                  checked={selected.includes(opt.value)}
                  disabled={isDisabled}
                  onCheckedChange={(checked) => {
                    const next = new Set(selected);
                    if (checked) next.add(opt.value);
                    else next.delete(opt.value);
                    updateField(field.name, Array.from(next));
                  }}
                />
                <Label htmlFor={`${field.name}-${opt.value}`} className="text-sm">
                  {t(opt.label, opt.label)}
                </Label>
              </div>
            ))}
          </div>
          {error && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </Field>
      );
    }

    if (field.type === "checkbox") {
      return (
        <Field key={field.name} label={labelText} required={field.required} tooltip={tooltipNode} className={colSpan}>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={!!value}
              disabled={isDisabled}
              onCheckedChange={(checked) => updateField(field.name, !!checked)}
            />
            <Label htmlFor={field.name} className="text-sm">
              {labelText}
            </Label>
          </div>
          {error && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </Field>
      );
    }

    if (field.type === "file") {
      const hasValue = !!value;
      const fileName = getFileName(value);
      const canView = typeof value === "string" && value.startsWith("http");
      return (
        <Field key={field.name} label={labelText} required={field.required} tooltip={tooltipNode} className={colSpan}>
          {isReadOnly ? (
            value ? (
              <div className="rounded-lg border border-slate-200 p-3 text-sm flex items-center justify-between gap-2">
                <span className="truncate">{fileName}</span>
                {typeof value === "string" && value.startsWith("http") && (
                  <a href={value} target="_blank" rel="noreferrer" className="text-blue-600 text-xs underline">
                    View
                  </a>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No file uploaded</p>
            )
          ) : (
            <>
              {hasValue && (
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                  <span className="truncate">{fileName || "File"}</span>
                  <div className="flex items-center gap-2">
                    {canView && (
                      <a href={String(value)} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">
                        View
                      </a>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isDisabled || removing[field.name]}
                      onClick={() => handleFileRemove(field)}
                    >
                      {removing[field.name] ? "Removing..." : "Remove"}
                    </Button>
                  </div>
                </div>
              )}
              <FileInput
                id={field.name}
                accept={field.accept}
                existingName={hasValue ? undefined : fileName}
                uploading={uploading[field.name]}
                onChange={(file) => handleFileChange(field, file)}
              />
            </>
          )}
          {error && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </Field>
      );
    }

    return null;
  };

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 md:px-6 py-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
      <BrandH1>{t(config.title, config.title)}</BrandH1>
        {header?.kycStatus && (
          <span className="text-xs rounded-full border px-2 py-1 text-slate-600">
            KYC: {header.kycStatus}
          </span>
        )}
      </div>

      {header?.companyName && (
        <div className="mb-4 text-sm text-slate-600">
          Company: <span className="font-medium text-slate-800">{header.companyName}</span>
          {header.countryName ? ` (${header.countryName})` : ""}
        </div>
      )}

      <ProgressBar value={progressValue} />
      <Stepper steps={steps.map((s) => t(s.title, s.title))} active={currentActiveStep} />

      {currentStep ? (
        <Card className="mt-5 rounded-2xl border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              {currentStepIdx + 1}) {t(currentStep.title, currentStep.title)}
            </CardTitle>
            {currentStep.description && (
              <p className="text-sm text-slate-500">{t(currentStep.description, currentStep.description)}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {currentStep.fields.map((field) => renderField(field))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={handleBack} disabled={currentStepIdx === 0 || isSaving}>
          Back
        </Button>
        <div className="flex items-center gap-2">
          {isReadOnly ? (
            currentStepIdx < steps.length - 1 && (
              <Button onClick={handleNext} disabled={isSaving}>
                Next Step
              </Button>
            )
          ) : (
            <>
              <Button variant="outline" onClick={() => handleSave("in_progress")} disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Draft
              </Button>
              {currentStepIdx < steps.length - 1 ? (
                <Button onClick={handleNext} disabled={isSaving}>
                  Next Step
                </Button>
              ) : (
                <Button onClick={() => handleSave("submitted")} disabled={isSaving}>
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Submit KYC
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
