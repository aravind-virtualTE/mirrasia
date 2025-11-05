/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import { useAtom } from "jotai";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Info, CheckCircle2, Lock } from "lucide-react";

// state atom (your existing atom export)
import { paFormWithResetAtom } from "./PaState";
import CommonServiceAgrementTxt from "../CommonServiceAgrementTxt";
import { toast } from "@/hooks/use-toast";
import { Item } from "@/components/SearchSelect";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTranslation } from "react-i18next";


/* -------------------------------------------------------------------------- */
/* Utils                                                                      */
/* -------------------------------------------------------------------------- */

const cx = (...classes: Array<string | false | undefined>) =>
    classes.filter(Boolean).join(" ");

const getDeep = (obj: any, path: string) => {
    const parts = path.split(".");
    return parts.reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

// supports dotted array index like "companyName.0"
const setDeep = (obj: any, path: string, value: any) => {
    const parts = path.split(".");
    const last = parts.pop()!;
    let ref = obj;

    for (const key of parts) {
        const isIdx = /^\d+$/.test(key);
        if (isIdx) {
            const i = Number(key);
            if (!Array.isArray(ref)) {
                // convert previous prop into array if needed
                // find previous key to set as array
                throw new Error("setDeep: numeric index without array parent");
            }
            if (ref[i] === undefined) ref[i] = {};
            ref = ref[i];
        } else {
            if (ref[key] === undefined) ref[key] = {};
            ref = ref[key];
        }
    }

    if (/^\d+$/.test(last)) {
        if (!Array.isArray(ref)) throw new Error("setDeep: final index without array");
        ref[Number(last)] = value;
    } else {
        ref[last] = value;
    }
};

const isEmpty = (v: any) =>
    v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Option = { id: string; value: string } | { value: string; label: string };

type FieldBase = {
    type:
    | "text"
    | "email"
    | "number"
    | "phone"
    | "textarea"
    | "select"
    | "multiselect"
    | "checkbox"
    | "repeater"
    | "companyNames"; // 3 separate inputs bound to string[]
    name: string;
    label: string;
    tooltip?: string;
    placeholder?: string;
    description?: string;
    required?: boolean;
    options?: Option[];
    itemFields?: Omit<FieldBase, "repeater" | "multiselect" | "companyNames">[];
    items?: Item[];
    minItems?: number;
    maxItems?: number;
    condition?: (form: Record<string, any>) => boolean;
    compute?: (form: Record<string, any>) => string;
};

type StepConfig = {
    id: string;
    title: string;
    description?: string;
    fields?: FieldBase[];                 // either fields…
    render?: React.ComponentType;         // …or a custom renderer 
};

type FormConfig = {
    title: string;
    steps: StepConfig[];
};


const paIncorpConfig: FormConfig = {
    title: "Company Incorporation — Panama",
    steps: [
        {
            id: "applicant",
            title: "1. Applicant information",
            description:
                "Provide your details and three proposed company names. Verify your email via OTP to proceed.",
            fields: [
                {
                    type: "email", name: "email", label: "Email", placeholder: "name@example.com", required: true, tooltip:
                        "newHk.steps.applicant.fields.applicantName.tooltip",
                },
                { type: "text", name: "name", label: "Applicant's Full Name", placeholder: "e.g., Kim Minsoo", required: true },

                // Three input boxes for company name (no chips)
                {
                    type: "companyNames",
                    name: "companyName",
                    label: "Proposed Panama company names (exactly 3)",
                    description: "Enter three unique options in order of preference.",
                    required: true,
                },
                { type: "phone", name: "phoneNum", label: "Mobile number", placeholder: "+507 6000 0000" },
            ],
        },
        {
            id: "aml",
            title: "2. AML CDD",
            description: "Basic declarations for compliance.",
            fields: [
                {
                    type: "multiselect",
                    name: "selectedIndustry",
                    label: "Industry / Business Nature",
                    options: [
                        { value: "consulting", label: "Consulting" },
                        { value: "it", label: "IT / Software" },
                        { value: "trading", label: "Trading" },
                        { value: "finance", label: "Financial Services (non-licensed)" },
                        { value: "other", label: "Other" },
                    ],
                },
                { type: "text", name: "otherIndustryText", label: "If Other, specify" },
                {
                    type: "multiselect",
                    name: "purposePaCompany",
                    label: "Purpose of the company",
                    options: [
                        { value: "holding", label: "Holding assets / shares" },
                        { value: "operations", label: "Operating business" },
                        { value: "payments", label: "Payments / invoicing" },
                        { value: "other", label: "Other" },
                    ],
                },
                { type: "text", name: "otherPurposePaCompany", label: "If Other, specify" },
                {
                    type: "select",
                    name: "sanctionedTiesPresent.id",
                    label: "Any sanctioned ties present?",
                    options: [
                        { id: "no", value: "No" },
                        { id: "yes", value: "Yes" },
                    ],
                    required: true,
                },
                {
                    type: "select",
                    name: "annualRenewalTermsAgreement.id",
                    label: "I confirm annual renewal compliance",
                    options: [
                        { id: "agree", value: "Agree" },
                        { id: "disagree", value: "Disagree" },
                    ],
                    required: true,
                },
            ],
        },
        {
            id: "company",
            title: "3. Company information",
            fields: [
                { type: "text", name: "pEntityInfo", label: "Brief business description", required: true },
                { type: "text", name: "address", label: "Registered address (if any)" },
                { type: "text", name: "typeOfShare", label: "Type of shares", placeholder: "e.g., Bearer shares not accepted; registered shares" },
                { type: "number", name: "noOfSharesIssued", label: "No. of shares issued", required: true },
                {
                    type: "repeater",
                    name: "shareHolders",
                    label: "Shareholders",
                    description: "Add individual or corporate owners.",
                    minItems: 1,
                    itemFields: [
                        { type: "text", name: "name", label: "Name", required: true },
                        { type: "email", name: "email", label: "Email" },
                        { type: "phone", name: "phone", label: "Phone" },
                        { type: "number", name: "ownershipRate", label: "% Ownership", required: true },
                        {
                            type: "select",
                            name: "isLegalPerson.id",
                            label: "Is legal person?",
                            options: [
                                { id: "no", value: "No" },
                                { id: "yes", value: "Yes" },
                            ],
                        },
                    ],
                },
                {
                    type: "repeater",
                    name: "legalDirectors",
                    label: "Directors / Officers",
                    minItems: 1,
                    itemFields: [
                        { type: "text", name: "name", label: "Name", required: true },
                        { type: "email", name: "email", label: "Email" },
                        { type: "phone", name: "phone", label: "Phone" },
                        { type: "number", name: "ownershipRate", label: "% Ownership (if any)" },
                        {
                            type: "select",
                            name: "isLegalPerson.id",
                            label: "Is legal person?",
                            options: [
                                { id: "no", value: "No" },
                                { id: "yes", value: "Yes" },
                            ],
                        },
                    ],
                },
            ],
        },

        // AGREEMENT: render-only step using shared component
        {
            id: "agreement",
            title: "4. Service Agreement",
            description: "Please confirm to proceed to invoicing.",
            render: CommonServiceAgrementTxt,
        },

        {
            id: "invoice",
            title: "5. Invoice",
            fields: [
                { type: "text", name: "registerCurrencyAtom.code", label: "Currency code", placeholder: "USD", required: true },
                { type: "number", name: "totalAmountCap", label: "Estimated invoice amount", required: true },
            ],
        },
        {
            id: "payment",
            title: "6. Payment",
            description: "Enter payment reference details (Stripe/Bank).",
            fields: [
                { type: "text", name: "paymentId", label: "Payment ID (Stripe / Bank Ref)", required: true },
                { type: "text", name: "receiptUrl", label: "Receipt URL" },
                { type: "text", name: "sessionId", label: "Session ID (if Stripe)" },
            ],
        },
        {
            id: "incorporation",
            title: "7. Incorporation",
            fields: [
                { type: "text", name: "status", label: "Current status", placeholder: "Draft / Filed / Approved" },
                { type: "text", name: "incorporationDate", label: "Incorporation date (YYYY-MM-DD)" },
                {
                    type: "checkbox",
                    name: "isTermsAndConditionsAccepted",
                    label: "I confirm all information is true and accurate.",
                    required: true,
                },
            ],
        },
    ],
};

/* -------------------------------------------------------------------------- */
/* Field renderer                                                             */
/* -------------------------------------------------------------------------- */

function Field({
    field,
    value,
    onChange,
}: {
    field: FieldBase;
    value: any;
    onChange: (v: any) => void;
}) {
    const { t } = useTranslation();
    const { type, label, placeholder, description, options } = field;
    const tooltipText = field.tooltip
        ? t(field.tooltip as any, field.tooltip)
        : undefined;
    const wrap = (control: React.ReactNode) => (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                    {label}
                    {field.required && <span className="text-red-500">*</span>}
                </Label>
                {tooltipText && (
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="size-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs text-sm">
                                {tooltipText}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
            {control}
            {description && (
                <p className="text-[12px] text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    {description}
                </p>
            )}
        </div>
    );

    switch (type) {
        case "text":
        case "email":
        case "number":
        case "phone":
            return wrap(
                <Input
                    type={type === "phone" ? "text" : type}
                    value={value ?? ""}
                    placeholder={placeholder}
                    onChange={(e) =>
                        onChange(
                            type === "number"
                                ? e.target.value === ""
                                    ? ""
                                    : Number(e.target.value)
                                : e.target.value
                        )
                    }
                />
            );

        case "textarea":
            return wrap(
                <Textarea
                    value={value ?? ""}
                    placeholder={placeholder}
                    onChange={(e) => onChange(e.target.value)}
                />
            );

        case "select": {
            const opts = (options ?? []).map((o: any) => ({
                id: o.id ?? o.value,
                label: o.value ?? o.label,
            }));
            return wrap(
                <Select value={value ?? ""} onValueChange={(v) => onChange(v)}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={placeholder ?? "Select"} />
                    </SelectTrigger>
                    <SelectContent>
                        {opts.map((o) => (
                            <SelectItem key={o.id} value={o.id}>
                                {o.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        }

        case "multiselect": {
            const opts = (options ?? []).map((o: any) => ({
                id: o.id ?? o.value,
                label: o.label ?? o.value,
            }));
            const arr: string[] = Array.isArray(value) ? value : [];
            return wrap(
                <div className="grid gap-2">
                    {opts.map((o) => (
                        <label key={o.id} className="flex items-center gap-2 text-sm">
                            <Checkbox
                                checked={arr.includes(o.id)}
                                onCheckedChange={(c) => {
                                    const next = new Set(arr);
                                    if (c) next.add(o.id);
                                    else next.delete(o.id);
                                    onChange(Array.from(next));
                                }}
                            />
                            <span>{o.label}</span>
                        </label>
                    ))}
                </div>
            );
        }

        case "checkbox":
            return (
                <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={!!value} onCheckedChange={(c) => onChange(!!c)} />
                    <span>
                        {label}
                        {field.required && <span className="text-red-500"> *</span>}
                    </span>
                </label>
            );

        case "repeater": {
            const items: any[] = Array.isArray(value) ? value : [];
            return (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">{field.label}</Label>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onChange([...(items || []), {}])}
                        >
                            <Plus className="h-4 w-4 mr-1" /> Add
                        </Button>
                    </div>
                    {items.length === 0 && (
                        <p className="text-sm text-muted-foreground">No items yet.</p>
                    )}
                    {items.map((it, idx) => (
                        <Card key={idx} className="border-dashed">
                            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(field.itemFields || []).map((sub, sIdx) => (
                                    <Field
                                        key={`${idx}-${sIdx}-${sub.name}`}
                                        field={sub as FieldBase}
                                        value={(it as any)[sub.name]}
                                        onChange={(v) => {
                                            const next = [...items];
                                            next[idx] = { ...next[idx], [sub.name]: v };
                                            onChange(next);
                                        }}
                                    />
                                ))}
                                <div className="md:col-span-2 flex justify-end">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            onChange(items.filter((_, i) => i !== idx))
                                        }
                                    >
                                        <X className="h-4 w-4 mr-1" /> Remove
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            );
        }

        // 3 company name inputs -> companyName[0..2]
        case "companyNames": {
            const arr: string[] = Array.isArray(value) ? value : ["", "", ""];
            const ensureLen = (a: string[]) => {
                const next = [...a];
                while (next.length < 3) next.push("");
                return next.slice(0, 3);
            };
            const vals = ensureLen(arr);
            return wrap(
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {vals.map((v, i) => (
                        <div key={i} className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                                {t("proposedName")} #{i + 1}
                            </Label>
                            <Input
                                value={v ?? ""}
                                placeholder={`Company name ${i + 1}`}
                                onChange={(e) => {
                                    const next = ensureLen(arr);
                                    next[i] = e.target.value;
                                    onChange(next);
                                }}
                            />
                        </div>
                    ))}
                </div>
            );
        }

        default:
            return null;
    }
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

function validateStep(step: StepConfig, form: any): string[] {
    const missing: string[] = [];

    // render-only steps have nothing to validate
    if (!step.fields || step.fields.length === 0) return missing;

    for (const f of step.fields) {
        if (!f.required) continue;

        if (f.type === "checkbox") {
            const v = getDeep(form, f.name);
            if (!v) missing.push(f.label);
            continue;
        }

        const v = getDeep(form, f.name);

        if (f.type === "companyNames") {
            const arr = Array.isArray(v) ? v : [];
            const filled = arr.filter((x) => (x ?? "").trim().length > 0);
            if (filled.length < 3) missing.push(`${f.label}`);
            continue;
        }

        if (f.type === "repeater") {
            const items = Array.isArray(v) ? v : [];
            if (f.minItems && items.length < f.minItems)
                missing.push(`${f.label} (min. ${f.minItems})`);
            if (f.itemFields) {
                items.forEach((it, idx) => {
                    f.itemFields!.forEach((sf) => {
                        if (sf.required && isEmpty(it[sf.name])) {
                            missing.push(`${f.label} #${idx + 1}: ${sf.label}`);
                        }
                    });
                });
            }
            continue;
        }

        if (isEmpty(v)) missing.push(f.label);
    }
    return missing;
}

/* -------------------------------------------------------------------------- */
/* TopBar (as requested)                                                      */
/* -------------------------------------------------------------------------- */

function TopBar({
    title,
    totalSteps,
    idx,
}: {
    title: string;
    totalSteps: number;
    idx: number;
}) {
    const { t } = useTranslation();
    const pct = Math.round(((idx + 1) / totalSteps) * 100);
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
                <div className="text-lg sm:text-xl font-extrabold truncate">
                    {t(title) || t("ppif.topbar.defaultTitle")}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                    {t("newHk.infoHelpIcon")}
                </div>
            </div>
            <div className="w-full sm:w-72 shrink-0">
                <Progress value={pct} />
                <div className="text-right text-xs text-muted-foreground mt-1">
                    {t("newHk.topbar.stepOf", { current: idx + 1, total: totalSteps })}
                </div>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Sidebar                                                                    */
/* -------------------------------------------------------------------------- */

type StepLike = { id: string; title: string };

function SidebarPanama({
    steps,
    idx,
    goto,
    canProceedFromCurrent,
}: {
    steps: StepLike[];
    idx: number;
    goto: (i: number) => void;
    canProceedFromCurrent: boolean;
}) {
    const { t } = useTranslation();
    const canJumpTo = (target: number) => {
        if (target === idx) return true;
        if (target < idx) return true;
        return canProceedFromCurrent;
    };

    const onTryGoto = (target: number) => {
        if (target === idx) return;
        if (target < idx) {
            goto(target);
            return;
        }
        if (!canProceedFromCurrent) {
            toast({
                title: t("newHk.sidebar.toasts.completeStepTitle"),
                description: t("newHk.sidebar.toasts.completeStepDesc"),
            });
            return;
        }
        goto(target);
    };

    return (
        <aside className="space-y-4 sticky top-0 h-[calc(100vh-2rem)] overflow-auto p-0">
            {/* Brand / badges */}
            <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded bg-red-600 shrink-0" />
                <div className="text-[11px] sm:text[13px] tracking-wide font-semibold truncate">
                    {t("newHk.sidebar.brand")}
                </div>
            </div>
            <div className="text-xs text-muted-foreground">
                <div className="flex flex-wrap gap-1">
                    <span className="inline-flex items-center gap-1 border rounded-full px-2 py-1 text-[10px] sm:text-xs">
                        {t("newHk.sidebar.badges.ssl")}
                    </span>
                    <span className="inline-flex items-center gap-1 border rounded-full px-2 py-1 text-[10px] sm:text-xs">
                        {t("newHk.sidebar.badges.registry")}
                    </span>
                    <span className="inline-flex items-center gap-1 border rounded-full px-2 py-1 text-[10px] sm:text-xs">
                        {t("newHk.sidebar.badges.aml")}
                    </span>
                </div>
            </div>

            {/* Steps */}
            <div className="space-y-1 mt-3">
                {steps.map((s, i) => {
                    const enabled = canJumpTo(i);
                    const isCurrent = i === idx;
                    const isDone = i < idx;
                    return (
                        <button
                            key={s.id}
                            onClick={() => onTryGoto(i)}
                            disabled={!enabled}
                            className={cx(
                                "w-full text-left rounded-lg border p-2 sm:p-3 transition touch-manipulation",
                                isCurrent ? "border-primary bg-accent/10" : "hover:bg-accent/10",
                                !enabled && "opacity-60 cursor-not-allowed"
                            )}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <div className="font-semibold text-xs sm:text-sm truncate">
                                    {i + 1}. {t(s.title as string)}
                                </div>
                                <div className="shrink-0 flex items-center gap-1">
                                    {isDone && (
                                        <Badge
                                            variant="secondary"
                                            className="text-[10px] sm:text-xs flex items-center gap-1"
                                        >
                                            <CheckCircle2 className="h-3.5 w-3.5" /> {t("newHk.sidebar.done")}
                                        </Badge>
                                    )}
                                    {!enabled && !isDone && (
                                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                                            <Lock className="h-3.5 w-3.5" />
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
                <p className="text-xs text-muted-foreground mt-2">
                    {t("newHk.sidebar.needHelp")}{" "}
                    <button
                        className="text-sky-600 underline-offset-2 hover:underline touch-manipulation"
                        onClick={() =>
                            toast({
                                title: t("ppif.sidebar.contactToastTitle"),
                                description: t("ppif.sidebar.contactToastDesc"),
                            })
                        }
                    >
                        {t("newHk.sidebar.chatCta")}
                    </button>
                </p>
            </div>
        </aside>
    );
}

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

export default function PanamaIncorporationForm() {
  const [form, setForm] = useAtom(paFormWithResetAtom);
  const [idx, setIdx] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false); // NEW
  const step = paIncorpConfig.steps[idx];
  const [errors, setErrors] = useState<string[]>([]);

  const onFieldChange = (name: string, value: any) => {
    const next = { ...form };
    setDeep(next, name, value);
    setForm(next);
  };
  const { t } = useTranslation();
  const currentMissing = validateStep(step, form);
  const canProceedFromCurrent = currentMissing.length === 0;

  const goto = (i: number) => setIdx(i);

  const handleNext = () => {
    const missing = validateStep(step, form);
    if (missing.length > 0) {
      setErrors(missing);
      return;
    }
    setErrors([]);
    setIdx((i) => Math.min(i + 1, paIncorpConfig.steps.length - 1));
  };

  const handlePrev = () => setIdx((i) => Math.max(0, i - 1));

  const stepsForSidebar = useMemo<StepLike[]>(
    () => paIncorpConfig.steps.map((s) => ({ id: s.id, title: s.title })),
    []
  );

  return (
    <div className="max-width mx-auto py-6">
      {/* Top Bar */}
      <TopBar title={paIncorpConfig.title} totalSteps={paIncorpConfig.steps.length} idx={idx} />

      {/* Mobile: Steps drawer trigger */}
      <div className="mt-4 md:hidden flex justify-start">
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              {t("newHk.sidebar.openSteps") || "Steps"}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[85vw] sm:w-96">
            <div className="p-4 border-b text-sm font-semibold">
              {t("newHk.sidebar.brand") || "Mirr Asia"}
            </div>
            {/* Render the same sidebar inside the sheet; close on selection */}
            <div className="p-3">
              <SidebarPanama
                steps={stepsForSidebar}
                idx={idx}
                canProceedFromCurrent={canProceedFromCurrent}
                goto={(i) => {
                  setIdx(i);
                  setMobileNavOpen(false);
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[260px,1fr] gap-6 mt-6">
        {/* Sidebar: hidden on mobile to let the form occupy full width */}
        <div className="hidden md:block">
          <SidebarPanama
            steps={stepsForSidebar}
            idx={idx}
            goto={goto}
            canProceedFromCurrent={canProceedFromCurrent}
          />
        </div>

        {/* Right content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{step.title}</CardTitle>
            {step.description && (
              <p className="text-sm text-muted-foreground">{step.description}</p>
            )}
          </CardHeader>

          <CardContent>
            {"fields" in step && step.fields?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {step.fields.map((f, i) => (
                  <div
                    key={f.name ?? i}
                    className={
                      f.type === "checkbox" ||
                      f.type === "repeater" ||
                      f.type === "companyNames"
                        ? "md:col-span-2"
                        : ""
                    }
                  >
                    <Field
                      field={f as any}
                      value={getDeep(form, f.name)}
                      onChange={(v: any) => onFieldChange(f.name, v)}
                    />
                  </div>
                ))}
              </div>
            ) : step.render ? (
              // custom renderer (e.g., your CommonServiceAgrementTxt)
              React.createElement(step.render as any)
            ) : null}

            {errors.length > 0 && (
              <div className="mt-4 border border-destructive/30 bg-destructive/5 text-destructive rounded-md p-3 text-sm">
                <p className="font-medium mb-1">Please complete the required fields:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sticky mobile action bar for easier nav (optional but nice) */}
            <div className="mt-6 flex items-center justify-between sticky bottom-2 md:static bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 rounded-md border md:border-0">
              <Button variant="ghost" onClick={handlePrev} disabled={idx === 0}>
                {t("usa.buttons.back","← Back")}
              </Button>
              <div className="flex items-center gap-2">
                {idx < paIncorpConfig.steps.length - 1 ? (
                  <Button onClick={handleNext}>{t("usa.buttons.next","Next →")}</Button>
                ) : (
                  <Button
                    onClick={() => {
                      const missing = validateStep(step, form);
                      if (missing.length > 0) {
                        setErrors(missing);
                        return;
                      }
                      console.log("Submit form", form);
                      alert("Form is ready to submit. Check console for payload.");
                    }}
                  >
                    {t("usa.buttons.finish") || "Finish"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
