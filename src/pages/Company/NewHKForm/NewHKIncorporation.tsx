/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useAtom } from "jotai";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp, Info, Send, UserIcon, Users, X } from "lucide-react";
import { FPSForm } from "../payment/FPSForm";
import { AppDoc, createInvoicePaymentIntent, deleteIncorpoPaymentBankProof, FieldBase, FormConfig, hkAppAtom, Party, saveIncorporationData, Step, updateCorporateInvoicePaymentIntent, uploadIncorpoPaymentBankProof, } from "./hkIncorpo";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { t } from "i18next";
import { toast, useToast } from "@/hooks/use-toast";
import { sendInviteToShDir } from "@/services/dataFetch";
import { isValidEmail } from "@/middleware";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import { TokenData } from "@/middleware/ProtectedRoutes";
import { businessNatureList } from "../HongKong/constants";
import SearchSelect from "@/components/SearchSelect";
import InvoicePreview from "./NewInvoicePreview";
import { Trans } from "react-i18next";
import { cn } from "@/lib/utils";
import CustomLoader from "@/components/ui/customLoader";

const STRIPE_CLIENT_ID =
  import.meta.env.VITE_STRIPE_DETAILS || process.env.REACT_APP_STRIPE_DETAILS;

const stripePromise = loadStripe(STRIPE_CLIENT_ID);
// ---------- Types
// ---- Share types registry
const SHARE_TYPES = [
  { id: "ordinary", label: "CompanyInformation.typeOfShare.ordinaryShares" },
  { id: "preference", label: "CompanyInformation.typeOfShare.preferenceShares" },
] as const;
type ShareTypeId = typeof SHARE_TYPES[number]["id"];
const DEFAULT_SHARE_ID: ShareTypeId = "ordinary";
const shareLabel = (id?: string) =>
  SHARE_TYPES.find((t) => t.id === id)?.label ?? SHARE_TYPES.find((t) => t.id === DEFAULT_SHARE_ID)!.label;


// ---------- Helpers
const classNames = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(" ");

// Non-field defaults that always exist in form
const NON_FIELD_DEFAULTS: Record<string, any> = {
  // Payment
  payMethod: "card",
  paymentIntentId: "",
  bankRef: "",
  uploadReceiptUrl: "",
  // Declarations & signing
  truthfulnessDeclaration: false,
  legalTermsAcknowledgment: false,
  compliancePreconditionAcknowledgment: false,
  eSign: "",

  // Misc
  dcp: "",
};

function initFromConfig(config: FormConfig, extras: Record<string, any> = {}) {
  const base: Record<string, any> = {};
  config.steps.forEach((s) =>
    (s.fields || []).forEach((f) => {
      if (typeof f.defaultValue !== "undefined") base[f.name] = f.defaultValue;
      else {
        switch (f.type) {
          case "checkbox":
            base[f.name] = false;
            break;
          case "checkbox-group":
            base[f.name] = [] as string[];
            break;
          default:
            base[f.name] = "";
        }
      }
    })
  );
  return { ...base, ...NON_FIELD_DEFAULTS, ...extras };
}

// Back-compat + normalization: accept old {id,label} object or missing, and return id only
const normalizeParties = (ps?: any[]): Party[] => {
  if (!Array.isArray(ps) || ps.length === 0) return [];
  return ps.map((p) => {
    const raw = p?.typeOfShare;
    let id: ShareTypeId = DEFAULT_SHARE_ID;
    if (typeof raw === "string") {
      id = (SHARE_TYPES.some((t) => t.id === raw) ? raw : DEFAULT_SHARE_ID) as ShareTypeId;
    } else if (raw?.id && typeof raw.id === "string") {
      id = (SHARE_TYPES.some((t) => t.id === raw.id) ? raw.id : DEFAULT_SHARE_ID) as ShareTypeId;
    }
    return {
      name: p?.name ?? "",
      email: p?.email ?? "",
      phone: p?.phone ?? "",
      isCorp: !!p?.isCorp,
      isDirector: !!p?.isDirector,
      shares: Number(p?.shares ?? 0),
      invited: !!p?.invited,
      typeOfShare: id,
    };
  });
};

function makeInitialAppDoc(
  config: FormConfig,
  extras: Record<string, any> = {},
  existing?: Partial<AppDoc>
): AppDoc {
  const mergedForm = initFromConfig(config, (existing?.form as any) || extras);

  let initialParties: Party[] = normalizeParties(existing?.parties) ?? [];

  if (initialParties.length === 0) {
    initialParties = [
      {
        name: "",
        email: "",
        phone: "",
        isCorp: false,
        isDirector: true,
        shares: 0,
        invited: false,
        typeOfShare: DEFAULT_SHARE_ID, // default Ordinary
      },
    ];
  }

  const base: AppDoc = {
    stepIdx: existing?.stepIdx ?? 0,
    userId: existing?.userId || extras.userId || "",
    paymentStatus: existing?.paymentStatus || "unpaid",
    expiresAt: existing?.expiresAt || "",
    form: mergedForm,
    parties: initialParties,
    optionalFeeIds: existing?.optionalFeeIds ?? [],
    _id: existing?._id,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // If server sent form keys, prefer them
  if (existing?.form) base.form = { ...mergedForm, ...existing.form };
  return base;
}

function requiredMissing(form: Record<string, any>, step: Step) {
  const missing: string[] = [];
  (step.fields || []).forEach((f) => {
    const visible = f.condition ? f.condition(form) : true;
    if (!visible || !f.required || f.type === "derived") return;
    const v = form[f.name];
    if (f.type === "checkbox-group") {
      if (!Array.isArray(v) || v.length === 0) missing.push(f.label);
    } else if (f.type === "checkbox") {
      if (!v) missing.push(f.label);
    } else {
      if (v === undefined || v === null || String(v).trim() === "") missing.push(f.label);
    }
  });
  return missing;
}

// ---------- Fees model (configurable)
const feesConfig = {
  government: [
    {
      id: "cr_fee",
      label: "HK Company Incorporation Government Fee to Companies Registry",
      original: 221,
      amount: 221,
      mandatory: true,
      info: "Statutory filing fee payable to the Companies Registry.",
    },
    {
      id: "br_fee",
      label: "Business Registration (government) fee",
      original: 283,
      amount: 283,
      mandatory: true,
      info: "Annual Business Registration levy.",
    },
  ],
  service: [
    {
      id: "inc_service",
      label: "Hong Kong Company Incorporation — service fee (discounted)",
      original: 219,
      amount: 0,
      mandatory: true,
      info: "Mirr Asia incorporation service — fully discounted in the package.",
    },
    {
      id: "sec_annual",
      label: "Company Secretary Annual Service Charge",
      original: 450,
      amount: 225,
      mandatory: true,
      info: "Includes statutory record keeping and filings.",
    },
    {
      id: "kyc",
      label: "KYC / Due Diligence fee (1st year)",
      original: 65,
      amount: 0,
      mandatory: true,
      info: "Included for the first year.",
    },
    {
      id: "reg_office",
      label: "Registered Office Address (annual, optional)",
      original: 322,
      amount: 161,
      mandatory: false,
      info: "50% off for the first year.",
    },
    {
      id: "bank_arr",
      label: "Bank/EMI Account Opening Arrangement (optional)",
      original: 400,
      amount: 400,
      mandatory: false,
      info: "Introduction and scheduling support.",
    },
    {
      id: "kit",
      label: "Company Kit Producing cost (optional)",
      original: 70,
      amount: 70,
      mandatory: false,
      info: "Company chop, share certificates, etc.",
    },
    {
      id: "corr_addr",
      label: "Correspondence Address Annual Service (optional)",
      original: 65,
      amount: 65,
      mandatory: false,
      info: "Mail handling for directors/shareholders.",
    },
  ],
};

const computeShareholderKycExtras = (app: AppDoc): number => {
  // defensive: handle missing or malformed parties
  const shareholders = Array.isArray((app as any).parties) ? (app as any).parties : [];

  // // treat as shareholders only those with > 0 shares
  // const shareholders = parties.filter((p) => {
  //   const shares = Number(p?.shares ?? 0);
  //   return shares > 0;
  // });

  // map to old logic: legalPersonFees = isLegalPerson; here isCorp ~ isLegalPerson
  const legalPersonCount = shareholders.filter((p: any) => p?.isCorp === true).length;
  const individualCount = shareholders.length - legalPersonCount;

  // constants consistent with old ServiceSelection
  const LEGAL_PERSON_KYC_FEE = 130; // per corporate shareholder
  const INDIVIDUAL_KYC_SLOT_FEE = 65; // covers up to 2 extra individuals

  let extra = 0;

  // 1) All corporate shareholders are charged at 130 each
  if (legalPersonCount > 0) {
    extra += legalPersonCount * LEGAL_PERSON_KYC_FEE;
  }

  // 2) For individuals: first 2 are included (amount = 0 in base "kyc" line)
  if (individualCount > 2) {
    const peopleNeedingKyc = individualCount - 2;
    const kycSlots = Math.ceil(peopleNeedingKyc / 2); // same as old logic
    extra += kycSlots * INDIVIDUAL_KYC_SLOT_FEE;
  }

  // console.log("KYC extras detail", {
  //   legalPersonCount,
  //   individualCount,
  //   extra,
  // });

  return extra;
};
// ---------- Derived helpers
const computeBaseTotal = (app: AppDoc) => {
  const selectedIds = new Set(app.optionalFeeIds || []);
  let total = 0;

  // base government + service fees
  [...feesConfig.government, ...feesConfig.service].forEach((item) => {
    const on = item.mandatory || selectedIds.has(item.id);
    if (on) total += item.amount;
  });

  // add shareholder-based KYC extras (corporate + extra individuals)
  const kycExtras = computeShareholderKycExtras(app);
  total += kycExtras;

  // console.log("selectedIds", selectedIds);
  // console.log("baseWithoutKycExtras", Number((total - kycExtras).toFixed(2)));
  // console.log("kycExtras", kycExtras);
  // console.log("baseWithKycExtras", Number(total.toFixed(2)));

  return Number(total.toFixed(2));
};

const computeGrandTotal = (app: AppDoc) => {
  const base = computeBaseTotal(app);
  const pay = (app.form.payMethod || "card") as string;
  const surcharge = pay === "card" ? base * 0.035 : 0;
  return Number((base + surcharge).toFixed(2));
};


function Field({ field, form, setForm, }: { field: FieldBase; form: any; setForm: (fn: (prev: any) => any) => void; }) {
  const visible = field.condition ? field.condition(form) : true;
  if (!visible) return null;

  const set = (name: string, value: any) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const labelText = t(field.label as any, field.label);
  const tooltipText = field.tooltip ? t(field.tooltip as any, field.tooltip) : undefined;
  const placeholderText = field.placeholder
    ? t(field.placeholder as any, field.placeholder)
    : undefined;
  const hintText = field.hint ? t(field.hint as any, field.hint) : undefined;

  const labelEl = (
    <div className="flex items-center gap-2">
      <Label htmlFor={field.name} className="font-semibold">
        {labelText}
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
  );

  const hintEl = hintText ? (
    <p className="text-xs text-muted-foreground mt-1">{hintText}</p>
  ) : null;

  const spanClass = field.colSpan === 2 ? "md:col-span-2" : "";

  switch (field.type) {
    case "text":
    case "email":
    case "number": {
      return (
        <div className={classNames("grid gap-2", spanClass)}>
          {labelEl}
          <Input
            id={field.name}
            type={field.type === "number" ? "number" : field.type}
            placeholder={placeholderText}
            value={form[field.name] ?? ""}
            onChange={(e) => set(field.name, e.target.value)}
          />
          {hintEl}
        </div>
      );
    }
    case "textarea": {
      return (
        <div className={classNames("grid gap-2", spanClass)}>
          {labelEl}
          <Textarea
            id={field.name}
            rows={field.rows ?? 4}
            placeholder={placeholderText}
            value={form[field.name] ?? ""}
            onChange={(e) => set(field.name, e.target.value)}
          />
          {hintEl}
        </div>
      );
    }
    case "select": {
      const options = (field.options || []).map((o) => ({
        ...o,
        _label: t(o.label as any, o.label),
      }));
      return (
        <div className={classNames("grid gap-2", spanClass)}>
          {labelEl}
          <Select
            value={String(form[field.name] ?? "")}
            onValueChange={(v) => set(field.name, v)}
          >
            <SelectTrigger id={field.name}>
              <SelectValue
                placeholder={placeholderText || t("common.select", "Select")}
              />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o._label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hintEl}
        </div>
      );
    }
    case "search-select": {
      // Expect field.items to be [{ code, label }]
      const selectedItem = form[field.name]
        ? field.items?.find((o: any) => o.code === form[field.name]) || null
        : null;

      const handleSelect = (item: { code: string; label: string }) => {
        set(field.name, item.code);
      };

      const items = (field.items || []).map((it: any) => ({
        ...it,
        label: t(it.label as any, it.label),
      }));

      return (
        <div className={classNames("grid gap-2", spanClass)}>
          {labelEl}
          <SearchSelect
            items={items}
            placeholder={placeholderText || t("common.select", "Select")}
            onSelect={handleSelect}
            selectedItem={
              selectedItem
                ? { ...selectedItem, label: t(selectedItem.label as any, selectedItem.label) }
                : null
            }
          />
          {hintEl}
        </div>
      );
    }
    case "checkbox": {
      return (
        <div className={classNames("flex items-center gap-2", spanClass)}>
          <Checkbox
            id={field.name}
            checked={!!form[field.name]}
            onCheckedChange={(v) => set(field.name, !!v)}
          />
          {labelEl}
          {hintEl}
        </div>
      );
    }
    case "checkbox-group": {
      const arr: string[] = Array.isArray(form[field.name]) ? form[field.name] : [];
      const toggle = (val: string, on: boolean) => {
        const next = new Set(arr);
        if (on) next.add(val);
        else next.delete(val);
        set(field.name, Array.from(next));
      };
      const options = (field.options || []).map((o) => ({
        ...o,
        _label: t(o.label as any, o.label),
      }));
      return (
        <div className={classNames("grid gap-2", spanClass)}>
          {labelEl}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
            {options.map((o) => (
              <label key={o.value} className="flex items-center gap-2 rounded-md border p-2">
                <Checkbox
                  checked={arr.includes(o.value)}
                  onCheckedChange={(v) => toggle(o.value, !!v)}
                />
                <span className="text-sm">{o._label}</span>
              </label>
            ))}
          </div>
          {hintEl}
        </div>
      );
    }
    case "radio-group": {
      const options = (field.options || []).map((o) => ({
        ...o,
        _label: t(o.label as any, o.label),
      }));
      return (
        <div className="flex flex-col gap-3">
          {labelEl}
          <RadioGroup
            value={String(form[field.name] ?? "")}
            onValueChange={(v) => set(field.name, v)}
            className="flex flex-col gap-3"
          >
            {options.map((o) => (
              <label
                key={o.value}
                className="flex items-start gap-3 text-sm text-gray-700 cursor-pointer"
              >
                <RadioGroupItem
                  value={o.value}
                  id={`${field.name}-${o.value}`}
                  className="w-4 h-4 border-gray-300 focus:ring-primary mt-0.5 shrink-0"
                />
                <span className="leading-relaxed">{o._label}</span>
              </label>
            ))}
          </RadioGroup>
          {hintEl}
        </div>
      );
    }
    case "derived": {
      const val = (field.compute ? field.compute(form) : "") ?? "";
      return (
        <div className={classNames("grid gap-2", spanClass)}>
          {labelEl}
          <Input id={field.name} readOnly value={val} />
          {hintEl}
        </div>
      );
    }
  }
}


export function Tip({ text, content }: { text?: string; content?: React.ReactNode }) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted/60 text-foreground/80 text-[10px] font-bold cursor-help">
            i
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm text-sm">
          {content ? content : <div className="whitespace-pre-wrap">{text}</div>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-base font-extrabold mb-3">{children}</div>;
}
// ---------- Parties Manager (per-party typeOfShare = id only)
function PartiesManager({ app, setApp }: { app: AppDoc; setApp: React.Dispatch<React.SetStateAction<AppDoc>> }) {
  const { toast } = useToast();
  const form = app.form;
  const isLocked = app.paymentStatus === "paid";

  const totalShares = React.useMemo(
    () => (form.shareCount === "other" ? Number(form.shareOther || 0) : Number(form.shareCount || 0)) || 0,
    [form.shareCount, form.shareOther]
  );

  const assigned = app.parties.reduce((s, p) => s + (Number(p.shares) || 0), 0);
  const equal = totalShares > 0 && assigned === totalShares;

  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);
  const [isInviting, setIsInviting] = React.useState(false);

  const upd = (i: number, key: keyof Party, value: any) => {
    if (isLocked) return;
    setApp((prev) => {
      const parties = [...prev.parties];
      (parties[i] as any)[key] = value;
      return { ...prev, parties, updatedAt: new Date().toISOString() };
    });
  };

  const del = (i: number) => {
    if (isLocked) return;
    setApp((prev) => {
      const parties = prev.parties.filter((_, idx) => idx !== i);
      return { ...prev, parties, updatedAt: new Date().toISOString() };
    });
  };

  const add = () => {
    if (isLocked) return;
    setApp((prev) => ({
      ...prev,
      parties: [
        ...prev.parties,
        {
          name: "",
          email: "",
          phone: "",
          isCorp: false,
          isDirector: false,
          shares: 0,
          invited: false,
          isDcp: false,
          typeOfShare: DEFAULT_SHARE_ID,
        },
      ],
      updatedAt: new Date().toISOString(),
    }));
  };

  const sendMailFunction = async () => {
    if (isLocked) return;

    const extractedData = app.parties.map((item) => {
      const { name, email, isDcp } = item;
      if (!isValidEmail(email)) {
        toast({
          title: t("newHk.parties.toasts.invalidEmail.title"),
          description: t("newHk.parties.toasts.invalidEmail.desc", { name, email }),
        });
      }
      return { name, email, isDcp };
    });

    const payload = { _id: app._id || "", inviteData: extractedData, country: "HK" };

    try {
      setIsInviting(true);
      const response = await sendInviteToShDir(payload);

      if (response.summary.successful > 0) {
        setApp((prev) => {
          const updated = prev.parties.map((p) => ({ ...p, invited: true, status: "Invited" }));
          return { ...prev, parties: updated, users: response.users , partyInvited:true};
        });
        toast({
          title: t("newHk.parties.toasts.invite.success.title"),
          description: t("newHk.parties.toasts.invite.success.desc", {
            count: response.summary.successful,
          }),
        });
      }

      if (response.summary.alreadyExists > 0) {
        setApp((prev) => {
          const updated = prev.parties.map((p) => ({ ...p, invited: true, status: "Invited" }));
          return { ...prev, parties: updated,users: response.users ,partyInvited:true };
        });
        toast({
          title: t("newHk.parties.toasts.invite.exists.title"),
          description: t("newHk.parties.toasts.invite.exists.desc"),
        });
      }

      if (response.summary.failed > 0) {
        setApp((prev) => {
          const updated = prev.parties.map((p) => ({ ...p, status: "Not Invited" }));
          return { ...prev, parties: updated };
        });
        toast({
          title: t("newHk.parties.toasts.invite.failed.title"),
          description: t("newHk.parties.toasts.invite.failed.desc"),
        });
      }
    } finally {
      setIsInviting(false);
    }
  };

  const statusText = equal ? t("newHk.parties.banner.ok") : t("newHk.parties.banner.err");
  const statusColor = equal ? "text-green-600" : "text-red-600";

  return (
    <div className="max-width mx-auto p-2 space-y-4">
      {/* Header with status + totals (Panama-style) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {t("newHk.parties.title", "Shareholders / Directors / DCP")}
            </h2>
            <p className={cn("text-xs mt-0.5", statusColor)}>{statusText}</p>
            {isLocked && (
              <p className="text-xs text-amber-600 mt-0.5">
                {t("newHk.parties.banner.locked") ||
                  "Payment completed. Details can no longer be edited."}
              </p>
            )}
          </div>
        </div>

        <div className="text-right">
          <p
            className={cn(
              "text-sm",
              totalShares > 0
                ? assigned === totalShares
                  ? "text-green-600"
                  : assigned > totalShares
                    ? "text-red-600"
                    : "text-gray-500"
                : "text-gray-500"
            )}
          >
            {t("newHk.parties.totals", {
              total: totalShares.toLocaleString(),
              assigned: assigned.toLocaleString(),
            })}
          </p>
        </div>
      </div>

      {/* Parties list (Panama-style cards with compact headers) */}
      <div className="space-y-2">
        {app.parties.map((p, i) => {
          const pct = totalShares ? ((Number(p.shares) || 0) / totalShares) * 100 : 0;
          const isExpanded = expandedIndex === i;

          return (
            <Card key={i} className="overflow-hidden transition-all hover:shadow-md">
              {/* Compact Header */}
              <div
                className={cn(
                  "p-2 cursor-pointer flex items-center justify-between hover:bg-gray-50",
                  isLocked && "cursor-default"
                )}
                onClick={() => {
                  if (isLocked) return;
                  setExpandedIndex(isExpanded ? null : i);
                }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100">
                    <UserIcon className="w-4 h-4 text-blue-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 truncate">
                        {p.name || t("newHk.parties.fields.name.label")}
                      </span>
                      {p.status && (
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            p.status === "Invited"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          )}
                        >
                          {p.status}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {p.email || t("common.noEmail", "No email")}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="font-semibold text-gray-900">
                      {Number(p.shares || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">{pct.toFixed(2)}%</div>
                  </div>
                </div>

                <button
                  className="ml-4 p-1 hover:bg-gray-200 rounded disabled:opacity-40"
                  type="button"
                  disabled={isLocked}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <CardContent className="pt-0 pb-4 px-4 border-t bg-gray-50">
                  <div className="grid md:grid-cols-2 gap-3 mt-4">
                    {/* Name */}
                    <div className="grid gap-2">
                      <Label className="text-xs text-gray-600 mb-1">
                        {t("newHk.parties.fields.name.label")}
                      </Label><span
                        className="text-[11px] text-muted-foreground"
                        dangerouslySetInnerHTML={{
                          __html: t("newHk.parties.fields.name.example"),
                        }}
                      />
                      <Input
                        value={p.name}
                        disabled={isLocked}
                        onChange={(e) => upd(i, "name", e.target.value)}
                        className="h-9"
                      />

                    </div>

                    {/* Email */}
                    <div className="grid gap-2">
                      <Label className="text-xs text-gray-600 mb-1">
                        {t("newHk.parties.fields.email.label")}
                      </Label>
                      <Input
                        type="email"
                        value={p.email}
                        disabled={isLocked}
                        onChange={(e) => upd(i, "email", e.target.value)}
                        className="h-9"
                      />
                    </div>

                    {/* Phone */}
                    <div className="grid gap-2">
                      <Label className="text-xs text-gray-600 mb-1">
                        {t("newHk.parties.fields.phone.label")}
                      </Label>
                      <Input
                        value={p.phone}
                        disabled={isLocked}
                        onChange={(e) => upd(i, "phone", e.target.value)}
                        className="h-9"
                      />
                    </div>

                    {/* Is Corp */}
                    <div className="grid gap-2">
                      <Label className="text-xs text-gray-600 mb-1">
                        {t("newHk.parties.fields.isCorp.label")}{" "}
                        <Tip text={t("newHk.parties.fields.isCorp.tip")} />
                      </Label>
                      <Select
                        value={String(p.isCorp)}
                        disabled={isLocked}
                        onValueChange={(v) => upd(i, "isCorp", v === "true")}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="false">
                            {t("newHk.parties.fields.isCorp.options.no")}
                          </SelectItem>
                          <SelectItem value="true">
                            {t("newHk.parties.fields.isCorp.options.yes")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Is Director */}
                    <div className="grid gap-2">
                      <Label className="text-xs text-gray-600 mb-1">
                        {t("newHk.parties.fields.isDirector.label")}{" "}
                        <Tip text={t("newHk.parties.fields.isDirector.tip")} />
                      </Label>
                      <Select
                        value={String(p.isDirector)}
                        disabled={isLocked}
                        onValueChange={(v) => upd(i, "isDirector", v === "true")}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">
                            {t("newHk.parties.fields.isDirector.options.yes")}
                          </SelectItem>
                          <SelectItem value="false">
                            {t("newHk.parties.fields.isDirector.options.no")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Is Dcp */}
                    <div className="grid gap-2">
                      <Label className="text-xs text-gray-600 mb-1">
                        {t("newHk.company.fields.isDcp.label", "Will this person act as DCP?")}{" "}
                        <Tip text={t("newHk.company.fields.isDcp.tip", "Designated Contact Person for compliance/communication.")} />
                      </Label>
                      <Select
                        value={String(p.isDcp ?? false)}
                        disabled={isLocked}
                        onValueChange={(v) => upd(i, "isDcp", v === "true")}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">
                            {t("newHk.parties.fields.isDirector.options.yes")}
                          </SelectItem>
                          <SelectItem value="false">
                            {t("newHk.parties.fields.isDirector.options.no")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Shares */}
                    <div className="grid gap-2">
                      <Label className="text-xs text-gray-600 mb-1">
                        {t("newHk.parties.fields.shares.label")}
                      </Label>
                      <Input
                        type="number"
                        value={String(p.shares)}
                        disabled={isLocked}
                        onChange={(e) => upd(i, "shares", Number(e.target.value || 0))}
                        className="h-9"
                      />
                    </div>

                    {/* Percentage */}
                    <div className="grid gap-2">
                      <Label className="text-xs text-gray-600 mb-1">
                        {t("newHk.parties.fields.pct.label")}
                      </Label>
                      <Input readOnly value={`${pct.toFixed(2)}%`} className="h-9" />
                    </div>

                    {/* Type of Shares (same field, radio-group, Panama-style layout) */}
                    <div className="grid gap-2 md:col-span-2">
                      <Label className="text-xs text-gray-600 mb-1">
                        {t("newHk.parties.fields.type.label")}
                      </Label>
                      <RadioGroup
                        value={p.typeOfShare ?? DEFAULT_SHARE_ID}
                        onValueChange={(v) =>
                          upd(i, "typeOfShare", (v as ShareTypeId) || DEFAULT_SHARE_ID)
                        }
                        className={isLocked ? "pointer-events-none opacity-60" : ""}
                      >
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          {SHARE_TYPES.map((tdef) => (
                            <label key={tdef.id} className="flex items-center gap-2">
                              <RadioGroupItem
                                id={`stype-${tdef.id}-${i}`}
                                value={tdef.id}
                              />
                              {t(tdef.label)}
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  {/* Remove button */}
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      variant="ghost"
                      onClick={() => del(i)}
                      disabled={isLocked}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      {t("newHk.parties.buttons.remove")}
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Actions (Panama-style row) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
        <Button
          variant="outline"
          onClick={add}
          disabled={isLocked}
          className="flex items-center gap-2"
        >
          {t("newHk.parties.buttons.add")}
        </Button>

        <div className="text-sm text-muted-foreground flex-1 text-center md:text-left">
          {t("newHk.parties.totals", {
            total: totalShares.toLocaleString(),
            assigned: assigned.toLocaleString(),
          })}
        </div>

        <Button
          variant="default"
          onClick={sendMailFunction}
          // disabled={isLocked || isInviting}
          className="flex items-center gap-2 hover:bg-green-700"
        >
          {isInviting ? (
            <CustomLoader />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span className="ml-1">{t("newHk.parties.buttons.invite")}</span>
        </Button>
      </div>
    </div>
  );
}

// ---------- Fees / Invoice / Payment / Review
function FeesEstimator({ app, setApp }: { app: AppDoc; setApp: React.Dispatch<React.SetStateAction<AppDoc>> }) {
  const baseTotal = computeBaseTotal(app);

  // lock when payment is completed
  const isLocked = app.paymentStatus === "paid";

  const toggle = (id: string) => {
    if (isLocked) return; // 🔒 no changes after payment
    setApp((prev) => {
      const has = prev.optionalFeeIds.includes(id);
      const optionalFeeIds = has
        ? prev.optionalFeeIds.filter((x) => x !== id)
        : [...prev.optionalFeeIds, id];
      return { ...prev, optionalFeeIds, updatedAt: new Date().toISOString() };
    });
  };

  // ---- EXTRA KYC ROWS (based on shareholders) ----
  const parties = Array.isArray((app as any).parties) ? (app as any).parties : [];

  const shareholders = parties.filter((p: any) => {
    const shares = Number(p?.shares ?? 0);
    return shares > 0;
  });

  const legalPersonCount = shareholders.filter((p: any) => p?.isCorp === true).length;
  const individualCount = shareholders.length - legalPersonCount;

  const extraKycItems: {
    id: string;
    label: string;
    original: number;
    amount: number;
    mandatory: boolean;
    info?: string;
  }[] = [];

  // 1) Legal person KYC rows (130 each)
  for (let i = 0; i < legalPersonCount; i++) {
    extraKycItems.push({
      id: `kyc_legal_${i + 1}`,
      label: "KYC / Due Diligence fee (Legal Person)",
      original: 130,
      amount: 130,
      mandatory: true,
      info:
        "KYC for corporate shareholders (legal persons). Includes company documents, registers and UBO/KYC checks.",
    });
  }

  // 2) Additional individual KYC rows (beyond 2 included)
  if (individualCount > 2) {
    const peopleNeedingKyc = individualCount - 2;
    const kycSlots = Math.ceil(peopleNeedingKyc / 2);

    for (let i = 0; i < kycSlots; i++) {
      extraKycItems.push({
        id: `kyc_extra_${i + 1}`,
        label: "KYC / Due Diligence fee (Additional individuals)",
        original: 65,
        amount: 65,
        mandatory: true,
        info:
          "Additional KYC checks for individual shareholders/directors beyond the two already included in the package.",
      });
    }
  }

  function getRichTipContent(id: string): React.ReactNode | undefined {
    if (id === "reg_office") {
      return (
        <div className="space-y-2">
          <div className="font-semibold">
            {t("newHk.fees.richTips.reg_office.title")}
          </div>
          <p>
            <span className="font-semibold">
              {t("newHk.fees.richTips.reg_office.mandatoryTitle")}
            </span>{" "}
            {t("newHk.fees.richTips.reg_office.mandatoryText")}
          </p>
          <div>
            <div className="font-semibold">
              {t("newHk.fees.richTips.reg_office.purposeTitle")}
            </div>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("newHk.fees.richTips.reg_office.bullets.0")}</li>
              <li>{t("newHk.fees.richTips.reg_office.bullets.1")}</li>
              <li>{t("newHk.fees.richTips.reg_office.bullets.2")}</li>
            </ul>
          </div>
        </div>
      );
    }

    if (id === "corr_addr") {
      return (
        <div className="space-y-2">
          <div className="font-semibold">
            {t("newHk.fees.richTips.corr_addr.title")}
          </div>
          <p>{t("newHk.fees.richTips.corr_addr.p1")}</p>
          <p>{t("newHk.fees.richTips.corr_addr.p2")}</p>
          <p>{t("newHk.fees.richTips.corr_addr.p3")}</p>
          <p className="text-sm">{t("newHk.fees.richTips.corr_addr.p4")}</p>
          <p>{t("newHk.fees.richTips.corr_addr.p5")}</p>
        </div>
      );
    }

    return undefined;
  }

  const Row = ({ item }: { item: any }) => {
    const itemKey = `newHk.fees.items.${item.id}`;
    const label = t(`${itemKey}.label`, item.label);
    const info = t(`${itemKey}.info`, item.info);
    const richTip = getRichTipContent(item.id);

    const checked = item.mandatory || app.optionalFeeIds.includes(item.id);
    const disabled = item.mandatory || isLocked; // 🔒 cannot toggle when locked

    return (
      <TableRow>
        <TableCell className="font-medium flex items-center gap-2">
          {String(label)}
          <Tip content={richTip} text={!richTip ? String(info) : undefined} />
        </TableCell>
        <TableCell>
          {item.original ? `USD ${item.original.toFixed(2)}` : "—"}
        </TableCell>
        <TableCell>{`USD ${item.amount.toFixed(2)}`}</TableCell>
        <TableCell className="w-[90px]">
          <Checkbox
            checked={checked}
            disabled={disabled}
            onCheckedChange={() => toggle(item.id)}
          />
        </TableCell>
      </TableRow>
    );
  };

  const allItems = [
    ...feesConfig.government,
    ...feesConfig.service,
    ...extraKycItems,
  ];

  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("newHk.fees.table.headers.description")}</TableHead>
            <TableHead>{t("newHk.fees.table.headers.original")}</TableHead>
            <TableHead>{t("newHk.fees.table.headers.amount")}</TableHead>
            <TableHead className="w-[90px]">
              {t("newHk.fees.table.headers.select")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allItems.map((x) => (
            <Row key={x.id} item={x} />
          ))}
        </TableBody>
      </Table>

      <div className="text-right font-bold">
        {t("newHk.fees.table.totalLabel", { amount: baseTotal.toFixed(2) })}
      </div>

      <p className="text-sm text-muted-foreground">
        <Trans i18nKey="newHk.fees.table.note">
          Government fees are statutory and payable by all companies. Optional
          items can be toggled before payment.
        </Trans>
        {isLocked && (
          <> {" "}
            {/* extra hint when locked */}
            {t("newHk.fees.table.lockedNote", "After payment, fee selections are locked and cannot be changed.")}
          </>
        )}
      </p>
    </div>
  );
}



export type StripeSuccessInfo = {
  receiptUrl?: string;
  amount?: number;
  currency?: string;
  paymentIntentStatus?: string;
};

function StripePaymentForm({ app, onSuccess, onClose }: {
  app: AppDoc;
  onSuccess: (info: StripeSuccessInfo) => void; onClose: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Success / processing UI
  const [successPayload, setSuccessPayload] = React.useState<{
    receiptUrl?: string;
    amount?: number;
    currency?: string;
    paymentIntentStatus?: string;
  } | null>(null);
  const [processingMsg, setProcessingMsg] = React.useState<string | null>(null);

  const handleConfirm = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);
    setSuccessPayload(null);
    setProcessingMsg(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: typeof window !== "undefined" ? window.location.href : "",
        },
        redirect: "if_required",
      });

      if (error) {
        setError(error.message ?? "Payment failed. Please try again.");
        setSubmitting(false);
        return;
      }

      const status = paymentIntent?.status;

      const notifyBackend = async () => {
        try {
          const result = await updateCorporateInvoicePaymentIntent({
            paymentIntentId: app.form.paymentIntentId,
            companyId: app._id,
            companyName: app.form.name1 || app.form.name2 || app.form.name3 || "Company (TBD)",
            userEmail: app.form.email,
          });
          if (result?.ok) {
            const payload: StripeSuccessInfo = {
              receiptUrl: result?.receiptUrl,
              amount: result?.amount,
              currency: result?.currency,
              paymentIntentStatus: result?.paymentIntentStatus,
            };
            if (result?.paymentIntentStatus === "succeeded") {
              setSuccessPayload(payload);
              onSuccess(payload);
              setSubmitting(false);
              return;
            }
            // Processing or not final yet
            if (result?.paymentIntentStatus === "processing" || result?.paymentIntentStatus === "requires_capture") {
              setProcessingMsg(
                "Your payment is processing. You’ll receive a receipt once the Transaction gets confirmed."
              );
              onSuccess(payload);
              setSubmitting(false);
              return;
            }
          }
          // Backend returned non-ok or unexpected
          setError(
            "Payment confirmed, but we couldn’t retrieve the receipt from the server. Please contact support if you didn’t receive an email."
          );
          setSubmitting(false);
        } catch (e) {
          console.error("Failed to notify backend about PI update:", e);
          setError(
            "Payment confirmed, but saving the payment on the server failed. We’ll email your receipt soon or contact support."
          );
          setSubmitting(false);
        }
      };

      if (status === "succeeded") {
        await notifyBackend();
      } else if (status === "processing" || status === "requires_capture") {
        await notifyBackend();
      } else {
        setError(`Payment status: ${status ?? "unknown"}. If this persists, contact support.`);
        setSubmitting(false);
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Something went wrong while confirming payment.");
      setSubmitting(false);
    }
  };

  if (successPayload) {
    const amt = typeof successPayload.amount === "number" ? successPayload.amount : undefined;
    const currency =
      typeof successPayload.currency === "string" ? successPayload.currency.toUpperCase() : undefined;

    return (
      <div className="space-y-4">
        <div className="border rounded-md p-3 text-sm bg-emerald-50 border-emerald-200 text-emerald-900">
          <div className="font-semibold mb-1">Payment successful</div>
          <div className="space-y-1">
            {amt != null && currency ? (
              <div>
                Amount: <b>{currency} {(amt / 100).toFixed(2)}</b>
              </div>
            ) : null}
            <div>
              {successPayload.receiptUrl ? (
                <>
                  Receipt:&nbsp;
                  <a
                    href={successPayload.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2"
                  >
                    View Stripe receipt
                  </a>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    );
  }
  // Processing view (no receipt yet)
  if (processingMsg) {
    return (
      <div className="space-y-4">
        <div className="border rounded-md p-3 text-sm bg-amber-50 border-amber-200 text-amber-900">
          <div className="font-semibold mb-1">Payment is processing</div>
          <div>{processingMsg}</div>
        </div>
        <div className="flex items-center justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }
  // Default payment form
  return (
    <div className="space-y-4">
      <PaymentElement />
      {error ? (
        <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-2">
          {error}
        </div>
      ) : null}
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} disabled={!stripe || !elements || submitting}>
          {submitting ? "Processing…" : "Pay now"}
        </Button>
      </div>
    </div>
  );
}

function StripeCardDrawer({ open, onOpenChange, clientSecret, amountUSD, app, onSuccess, }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  clientSecret: string;
  amountUSD: number;
  app: AppDoc;
  onSuccess: (info: StripeSuccessInfo) => void;
}) {
  const options = React.useMemo(
    () => ({
      clientSecret,
      appearance: { theme: "stripe" as const },
    }),
    [clientSecret]
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Stripe Card Payment</SheetTitle>
          <SheetDescription>
            Grand Total: <b>USD {amountUSD.toFixed(2)}</b> {app.form.payMethod === "card" ? "(incl. 3.5% card fee)" : ""}
          </SheetDescription>
        </SheetHeader>

        {/* Mount Elements only when we have a clientSecret */}
        {clientSecret ? (
          <div className="mt-4">
            <Elements stripe={stripePromise} options={options}>
              <StripePaymentForm
                app={app}
                onSuccess={onSuccess}
                onClose={() => onOpenChange(false)}
              />
            </Elements>
          </div>
        ) : (
          <div className="mt-4 text-sm text-muted-foreground">Preparing secure payment…</div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function PaymentStep({ app, setApp, }: {
  app: AppDoc; setApp: React.Dispatch<React.SetStateAction<AppDoc>>;
}) {
  const grand = computeGrandTotal(app);
  const setForm = (updater: (prev: any) => any) =>
    setApp((prev) => ({ ...prev, form: updater(prev.form) }));

  // ----- PAID? (from persisted state) -----
  const isPaid =
    app.paymentStatus === "paid" ||
    app.form?.stripeLastStatus === "succeeded" ||
    app.form?.stripePaymentStatus === "succeeded";

  // ----- Expiry (only if NOT paid) -----
  React.useEffect(() => {
    if (isPaid) return; // don't set/modify when already paid
    const now = Date.now();
    const current = app.expiresAt ? new Date(app.expiresAt).getTime() : 0;
    if (!current || current <= now) {
      const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
      const expiryISO = new Date(now + twoDaysMs).toISOString();
      setApp((prev) => ({ ...prev, expiresAt: expiryISO, updatedAt: new Date().toISOString() }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaid]);

  // Countdown only when not paid
  const [nowTs, setNowTs] = React.useState(() => Date.now());
  React.useEffect(() => {
    if (isPaid) return; // stop timer entirely when paid
    const id = window.setInterval(() => setNowTs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [isPaid]);

  const expiresTs = app.expiresAt ? new Date(app.expiresAt).getTime() : 0;
  const remainingMs = Math.max(0, expiresTs - nowTs);
  const isExpired = !isPaid && (!expiresTs || remainingMs <= 0);

  const formatRemaining = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return d > 0
      ? `${d}d ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
      : `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  // ----- Local UI state for Stripe drawer (only used when not paid & not expired) -----
  const [creatingPI, setCreatingPI] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [bankFile, setBankFile] = React.useState<File | null>(null);
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);
  const [cardDrawerOpen, setCardDrawerOpen] = React.useState(false);

  const guard = (msg: string) => {
    if (isPaid) {
      alert(t("newHk.payment.alerts.alreadyPaid"));
      return true;
    }
    if (isExpired) {
      alert(msg);
      return true;
    }
    return false;
  };

  // ----- Bank/Other upload handlers -----
  const handleBankProofSubmit = async () => {
    if (guard(t("newHk.payment.alerts.expiredGuard"))) return;
    if (!bankFile) return;
    setUploading(true);
    // console.log("Uploading bank proof...", app);
    const method = app.form.payMethod
    const expiresAt = app.expiresAt || ''
    try {
      const result = await uploadIncorpoPaymentBankProof(app?._id || "", "hk", bankFile, method, expiresAt);

      if (result) setForm((p) => ({ ...p, uploadReceiptUrl: result?.url, }));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBankProof = async () => {
    if (guard(t("newHk.payment.alerts.expiredGuard"))) return;
    await deleteIncorpoPaymentBankProof(app?._id || "", "hk");
    setForm((p: any) => ({ ...p, uploadReceiptUrl: undefined }));
  };

  // ----- Card payment flow (only when not paid & not expired) -----
  const handleProceedCard = async () => {
    if (guard(t("newHk.payment.alerts.expiredGuard"))) return;

    if (clientSecret && app.form.paymentIntentId) {
      setCardDrawerOpen(true);
      return;
    }

    setCreatingPI(true);
    try {
      const currentFP = {
        companyId: app?._id ?? null,
        totalCents: Math.round(grand * 100),
        country: "HK",
      };
      const result = await createInvoicePaymentIntent(currentFP);
      if (result?.clientSecret && result?.id) {
        setClientSecret(result.clientSecret);
        setForm((p) => ({ ...p, paymentIntentId: result.id, payMethod: "card" }));
        setCardDrawerOpen(true);
      } else {
        alert("Could not initialize card payment. Please try again.");
      }
    } catch (e) {
      console.error("PI creation failed:", e);
      alert(t("newHk.payment.alerts.prepareFailedDesc"));
    } finally {
      setCreatingPI(false);
    }
  };

  return (
    <>
      {/* Success block (visible also on revisit) */}
      {isPaid && (
        <div className="mb-4 border rounded-md p-3 text-sm bg-emerald-50 border-emerald-200 text-emerald-900">
          <div className="font-semibold mb-1">
            {t("newHk.payment.success.title")}
          </div>
          <div className="space-y-1">
            {typeof app.form?.stripeAmountCents === "number" &&
              app.form?.stripeCurrency ? (
              <div>
                {t("newHk.payment.success.amountLabel")}{" "}
                <b>
                  {app.form.stripeCurrency.toUpperCase()}{" "}
                  {(app.form.stripeAmountCents / 100).toFixed(2)}
                </b>
              </div>
            ) : null}
            <div>
              {app.form?.stripeReceiptUrl ? (
                <>
                  {t("newHk.payment.success.receiptLabel")}&nbsp;
                  <a
                    href={app.form.stripeReceiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2"
                  >
                    {t("newHk.payment.success.viewStripeReceipt")}
                  </a>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Expiry banner (hidden when paid) */}
      {!isPaid && (
        <div
          className={[
            "mb-4 rounded-md border p-3 text-sm",
            isExpired
              ? "border-red-200 bg-red-50 text-red-900"
              : "border-amber-200 bg-amber-50 text-amber-900",
          ].join(" ")}
        >
          {isExpired ? (
            <div className="font-medium">
              {t("newHk.payment.expiryBanner.expiredMessage")}
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="font-medium">
                {t("newHk.payment.expiryBanner.timerTitle")}
              </div>
              <div className="text-base font-bold tabular-nums">
                {t("newHk.payment.expiryBanner.timeRemaining", {
                  time: formatRemaining(remainingMs),
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 space-y-2">
            <div className="font-bold">
              {t("newHk.payment.methods.title")}
            </div>
            {[
              {
                v: "card",
                label: t("newHk.payment.methods.options.card.label"),
                tip: t("newHk.payment.methods.options.card.tip"),
              },
              {
                v: "fps",
                label: t("newHk.payment.methods.options.fps.label"),
              },
              {
                v: "bank",
                label: t("newHk.payment.methods.options.bank.label"),
              },
              {
                v: "other",
                label: t("newHk.payment.methods.options.other.label"),
              },
            ].map((o) => (
              <label key={o.v} className="block space-x-2">
                <input
                  type="radio"
                  name="pay"
                  value={o.v}
                  checked={app.form.payMethod === o.v}
                  onChange={() => setForm((p) => ({ ...p, payMethod: o.v }))}
                  disabled={isPaid || isExpired}
                />
                <span className={isPaid || isExpired ? "text-muted-foreground" : ""}>
                  {o.label}
                </span>
                {o.tip && !(isPaid || isExpired) && (
                  <span className="inline-flex ml-1">
                    <Tip text={o.tip} />
                  </span>
                )}
              </label>
            ))}
            {(isPaid || isExpired) && (
              <div className="mt-2 text-xs text-muted-foreground">
                {isPaid
                  ? t("newHk.payment.methods.statusNote.paid")
                  : t("newHk.payment.methods.statusNote.expired")}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-2">
            <div className="font-bold">
              {t("newHk.payment.conditions.title")}
            </div>
            <p className="text-sm">
              <Trans i18nKey="newHk.payment.conditions.text">
                100% advance payment. All payments are non-refundable.The
                remitter bears all bank charges (including intermediary bank fees).
              </Trans>
            </p>

            {["bank", "other"].includes(app.form.payMethod) && (
              <div className="mt-4 grid gap-3">
                <div className="grid gap-2">
                  <Label>{t("newHk.payment.bankUpload.refLabel")}</Label>
                  <Input
                    placeholder={t("newHk.payment.bankUpload.refPlaceholder")}
                    value={app.form.bankRef || ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, bankRef: e.target.value }))
                    }
                    disabled={isPaid || isExpired}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>{t("newHk.payment.bankUpload.proofLabel")}</Label>
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setBankFile(f);
                    }}
                    disabled={isPaid || isExpired}
                  />
                  <Button
                    onClick={handleBankProofSubmit}
                    disabled={isPaid || isExpired || creatingPI || uploading}
                  >
                    {uploading
                      ? t("newHk.payment.bankUpload.uploading")
                      : t("newHk.payment.bankUpload.submit")}
                  </Button>
                </div>

                {app.form.uploadReceiptUrl ? (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">
                        {t("newHk.payment.bankUpload.previewTitle")}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm" disabled={isPaid || isExpired}>
                          <a
                            href={app.form.uploadReceiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {t("newHk.payment.bankUpload.openInNewTab")}
                          </a>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleDeleteBankProof}
                          disabled={isPaid || isExpired}
                        >
                          {t("newHk.payment.bankUpload.delete")}
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-lg border overflow-hidden">
                      <iframe
                        key={app.form.uploadReceiptUrl}
                        src={app.form.uploadReceiptUrl}
                        title="Payment Proof"
                        className="w-full h-[420px]"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {app.form.payMethod === "card" && !isPaid && (
              <div className="mt-3">
                <Button
                  onClick={handleProceedCard}
                  disabled={isPaid || isExpired || creatingPI}
                >
                  {creatingPI
                    ? t("newHk.payment.card.preparing")
                    : t("newHk.payment.card.proceed")}
                </Button>
                <div className="text-xs text-muted-foreground mt-2">
                  {isExpired
                    ? t("newHk.payment.card.disabledExpired")
                    : t("newHk.payment.card.drawerNote")}
                </div>
              </div>
            )}

            {app.form.payMethod === "fps" ? <FPSForm /> : null}

            <div className="text-right font-bold mt-4">
              {t("newHk.payment.totals.grandTotal", {
                amount: grand.toFixed(2),
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Only mount Stripe drawer when NOT paid and NOT expired */}
      {clientSecret && !isPaid && !isExpired ? (
        <StripeCardDrawer
          open={cardDrawerOpen}
          onOpenChange={setCardDrawerOpen}
          clientSecret={clientSecret}
          amountUSD={grand}
          app={app}
          onSuccess={(info) => {
            setApp((prev) => ({
              ...prev,
              paymentStatus:"paid",
              form: {
                ...prev.form,
                stripeLastStatus:
                  info?.paymentIntentStatus ?? prev.form.stripeLastStatus,
                stripeReceiptUrl:
                  info?.receiptUrl ?? prev.form.stripeReceiptUrl,
                stripeAmountCents:
                  typeof info?.amount === "number"
                    ? info.amount
                    : prev.form.stripeAmountCents,
                stripeCurrency: info?.currency ?? prev.form.stripeCurrency,
                paymentDate: new Date().toISOString(),
              },
            }));
            setCardDrawerOpen(false);
          }}
        />
      ) : null}
    </>
  );
}

function ReviewStep({ app, setApp }: { app: AppDoc; setApp: React.Dispatch<React.SetStateAction<AppDoc>> }) {
  const base = computeBaseTotal(app);
  const grand = computeGrandTotal(app);
  const form = app.form;

  const setForm = (updater: (prev: any) => any) =>
    setApp((prev) => ({ ...prev, form: updater(prev.form), updatedAt: new Date().toISOString() }));

  const tbd = t("newHk.review.placeholders.tbd", "(TBD)");
  const notProvided = t("newHk.review.placeholders.notProvided", "(not provided)");
  const dash = t("newHk.review.placeholders.dash", "-");
  const defaultCcy = t("newHk.review.currency.default", "HKD");
  const usd = t("newHk.review.currency.usd", "USD");

  const names = [form.name1 || tbd, form.name2, form.name3].filter(Boolean).join(" / ");
  const chinese = [form.cname1, form.cname2].filter(Boolean).join(" / ");

  const owners = app.parties
    .map((p) => {
      const unknown = t("newHk.review.placeholders.unknownParty", "Unknown");
      const dirTag = p.isDirector ? t("newHk.review.tags.director", " (Director)") : "";
      const corpTag = p.isCorp ? t("newHk.review.tags.corporate", " (Corporate)") : "";
      return `${p.name || unknown} — ${p.shares || 0} ${shareLabel(p.typeOfShare)}${dirTag}${corpTag}`;
    })
    .join("\n");

  const shareCount =
    form.shareCount === "other" ? Number(form.shareOther || 0) : Number(form.shareCount || 0);
  const capTotal =
    form.capAmount === "other" ? Number(form.capOther || 0) : Number(form.capAmount || 0);
  const acctCycle = form.bookKeepingCycle || "";

  return (
    <div className="grid gap-3">
      <Card>
        <CardContent className="pt-6 space-y-3 text-sm">
          <div>
            <div className="font-semibold">{t("newHk.review.labels.applicant")}</div>
            <div>
              {form.applicantName || notProvided} — {form.email || ""}
            </div>
          </div>

          <div>
            <div className="font-semibold">{t("newHk.review.labels.proposedNames")}</div>
            <div>
              {names}
              {chinese ? (
                <>
                  <br />
                  {t("newHk.review.labels.chinesePrefix")} {chinese}
                </>
              ) : null}
            </div>
          </div>

          <div>
            <div className="font-semibold">{t("newHk.review.labels.industry")}</div>
            <div>{form.industry || notProvided}</div>
          </div>

          <div>
            <div className="font-semibold">{t("newHk.review.labels.description")}</div>
            <div>{form.bizdesc || notProvided}</div>
          </div>

          <div>
            <div className="font-semibold">{t("newHk.review.labels.shareCapital")}</div>
            <div>
              {(form.currency || defaultCcy)} {capTotal.toLocaleString()} • {t("newHk.review.labels.shares", "Shares:")}{" "}
              {shareCount.toLocaleString()} • {t("newHk.review.labels.par", "Par:")}{" "}
              {(() => {
                const shares = shareCount || 1;
                const pv = capTotal && shares ? capTotal / shares : 0;
                return `${form.currency || defaultCcy} ${pv.toFixed(2)}`;
              })()}
            </div>
          </div>

          <div>
            <div className="font-semibold">{t("newHk.review.labels.owners")}</div>
            <div className="whitespace-pre-wrap mt-1">{owners || "—"}</div>
          </div>

          <div>
            <div className="font-semibold">{t("newHk.review.labels.acctPrefs")}</div>
            <div>
              {t("newHk.review.labels.fyEnd")} {form.finYrEnd || ""}, {t("newHk.review.labels.bookkeeping")}{" "}
              {acctCycle || dash}, {t("newHk.review.labels.software")} {form.xero || t("newHk.steps.acct.fields.xero.options.Recommendation required", "Recommendation required")}
              {form.softNote ? ` • ${t("newHk.review.labels.prefers")} ${form.softNote}` : ""}
            </div>
          </div>

          <div>
            <div className="font-semibold">{t("newHk.review.labels.totalAmount")}</div>
            <div>
              {t("newHk.review.labels.base")} {usd} {base.toFixed(2)} • {t("newHk.review.labels.payment")} {(form.payMethod || "card").toUpperCase()} • {t("newHk.review.labels.grand")}{" "}
              <b>
                {usd} {grand.toFixed(2)}
              </b>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-2 text-sm">
          <div className="font-semibold">{t("newHk.review.declarations.title")}</div>

          <div>
            <label className="flex items-center gap-2">
              <Checkbox
                id="truthfulnessDeclaration"
                checked={!!form.truthfulnessDeclaration}
                onCheckedChange={(v) => setForm((p) => ({ ...p, truthfulnessDeclaration: !!v }))}
              />{" "}
              {t("newHk.review.declarations.truth")}
            </label>

            <label className="flex items-center gap-2 mt-2">
              <Checkbox
                id="legalTermsAcknowledgment"
                checked={!!form.legalTermsAcknowledgment}
                onCheckedChange={(v) => setForm((p) => ({ ...p, legalTermsAcknowledgment: !!v }))}
              />{" "}
              {t("newHk.review.declarations.terms")}
            </label>

            <label className="flex items-center gap-2 mt-2">
              <Checkbox
                id="compliancePreconditionAcknowledgment"
                checked={!!form.compliancePreconditionAcknowledgment}
                onCheckedChange={(v) => setForm((p) => ({ ...p, compliancePreconditionAcknowledgment: !!v }))}
              />{" "}
              {t("newHk.review.declarations.compliance")}
            </label>
          </div>

          <div className="grid gap-2 mt-2">
            <Label>{t("newHk.review.esign.label")}</Label>
            <Input
              id="eSign"
              placeholder={t("newHk.review.placeholders.signaturePlaceholder")}
              value={form.eSign || ""}
              onChange={(e) => setForm((p) => ({ ...p, eSign: e.target.value }))}
            />
            <div className="text-xs text-muted-foreground">
              {t("newHk.review.esign.helper")}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CongratsStep({ app }: { app: AppDoc }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token") as string;
  const decodedToken = jwtDecode<any>(token);

  const navigateRoute = () => {
    localStorage.removeItem("companyRecordId");
    if (["admin", "master"].includes(decodedToken.role)) navigate("/admin-dashboard");
    else navigate("/dashboard");
  };

  const namePart = app.form.applicantName
    ? t("newHk.congrats.thankYouName", { applicantName: app.form.applicantName })
    : "";

  const steps = [1, 2, 3, 4].map((i) => ({
    t: t(`newHk.congrats.steps.${i}.t`),
    s: t(`newHk.congrats.steps.${i}.s`),
  }));

  return (
    <div className="grid place-items-center gap-4 text-center py-6">
      <h2 className="text-xl font-extrabold">{t("newHk.congrats.title")}</h2>
      <p className="text-sm">
        {t("newHk.congrats.thankYou", { name: namePart })}
      </p>

      <div className="grid gap-3 w-full max-w-3xl text-left">
        {steps.map((x, i) => (
          <div key={i} className="grid grid-cols-[12px_1fr] gap-3 text-sm">
            <div className="mt-2 w-3 h-3 rounded-full bg-sky-500" />
            <div>
              <b>{x.t}</b>
              <br />
              <span className="text-muted-foreground">{x.s}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 justify-center">
        <Button onClick={navigateRoute}>{t("newHk.congrats.buttons.dashboard")}</Button>
      </div>
    </div>
  );
}
function CompanyInfoStep({ app, setApp }: { app: AppDoc; setApp: React.Dispatch<React.SetStateAction<AppDoc>> }) {
  const form = app.form;
  const setForm = (updater: (prev: any) => any) =>
    setApp((prev) => ({ ...prev, form: updater(prev.form) }));
  // keys are stored in form; labels come from i18n when rendering
  const incorporationPurposeKeys = ["operateHK", "assetMgmt", "holdingCo", "crossBorder", "taxNeutral"] as const;

  // const contactOptions = React.useMemo(
  //   () =>
  //     Array.from(
  //       new Set((app.parties || []).map((p) => (p?.name || "").trim()).filter(Boolean))
  //     ),
  //   [app.parties]
  // );

  // React.useEffect(() => {
  //   if (form.dcp && !contactOptions.includes(form.dcp)) {
  //     setForm((p) => ({ ...p, dcp: "" }));
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [contactOptions]);


  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <SectionTitle>{t("newHk.company.sections.a")}</SectionTitle>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              field={{
                type: "search-select",
                name: "industry",
                label: "newHk.company.fields.industry.label",
                required: true,
                placeholder: "newHk.company.fields.industry.placeholder",
                items: businessNatureList // assumed list; labels can be keys or plain strings
              }}
              form={form}
              setForm={setForm}
            />

            <div className="grid gap-2">
              <Label>{t("newHk.company.fields.purpose.label")}</Label>
              <div className="grid gap-2">
                {incorporationPurposeKeys.map((key) => {
                  const checked = Array.isArray(form.purpose) && form.purpose.includes(key);
                  return (
                    <label key={key} className="flex items-center gap-2">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => {
                          const cur = new Set<string>(Array.isArray(form.purpose) ? form.purpose : []);
                          if (v) cur.add(key);
                          else cur.delete(key);
                          setForm((p) => ({ ...p, purpose: Array.from(cur) }));
                        }}
                      />
                      <span className="text-sm">
                        {t(`newHk.company.fields.purpose.options.${key}`)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <Field
              field={{
                type: "textarea",
                name: "bizdesc",
                label: "newHk.company.fields.bizdesc.label",
                placeholder: "newHk.company.fields.bizdesc.placeholder",
                colSpan: 2,
                rows: 4,
                tooltip: "newHk.company.fields.bizdesc.tooltip"
              }}
              form={form}
              setForm={setForm}
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <SectionTitle>{t("newHk.company.sections.b")}</SectionTitle>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              field={{
                type: "select",
                name: "currency",
                label: "newHk.company.fields.currency.label",
                required: true,
                defaultValue: "HKD",
                options: [
                  { label: "newHk.company.fields.currency.options.HKD", value: "HKD" },
                  { label: "newHk.company.fields.currency.options.USD", value: "USD" },
                  { label: "newHk.company.fields.currency.options.CNY", value: "CNY" }
                ]
              }}
              form={form}
              setForm={setForm}
            />

            <Field
              field={{
                type: "select",
                name: "capAmount",
                label: "newHk.company.fields.capAmount.label",
                required: true,
                defaultValue: "10000",
                options: [
                  { label: "newHk.company.fields.capAmount.options.1", value: "1" },
                  { label: "newHk.company.fields.capAmount.options.10", value: "10" },
                  { label: "newHk.company.fields.capAmount.options.100", value: "100" },
                  { label: "newHk.company.fields.capAmount.options.1000", value: "1000" },
                  { label: "newHk.company.fields.capAmount.options.10000", value: "10000" },
                  { label: "newHk.company.fields.capAmount.options.100000", value: "100000" },
                  { label: "newHk.company.fields.capAmount.options.other", value: "other" }
                ]
              }}
              form={form}
              setForm={setForm}
            />

            <Field
              field={{
                type: "number",
                name: "capOther",
                label: "newHk.company.fields.capOther.label",
                placeholder: "newHk.company.fields.capOther.placeholder",
                condition: (f) => f.capAmount === "other"
              }}
              form={form}
              setForm={setForm}
            />

            <Field
              field={{
                type: "select",
                name: "shareCount",
                label: "newHk.company.fields.shareCount.label",
                required: true,
                defaultValue: "10000",
                options: [
                  { label: "newHk.company.fields.capAmount.options.1", value: "1" },
                  { label: "newHk.company.fields.capAmount.options.10", value: "10" },
                  { label: "newHk.company.fields.capAmount.options.100", value: "100" },
                  { label: "newHk.company.fields.capAmount.options.1000", value: "1000" },
                  { label: "newHk.company.fields.capAmount.options.10000", value: "10000" },
                  { label: "newHk.company.fields.capAmount.options.100000", value: "100000" },
                  { label: "newHk.company.fields.shareCount.options.other", value: "other" }
                ]
              }}
              form={form}
              setForm={setForm}
            />

            <Field
              field={{
                type: "number",
                name: "shareOther",
                label: "newHk.company.fields.shareOther.label",
                placeholder: "newHk.company.fields.shareOther.placeholder",
                condition: (f) => f.shareCount === "other"
              }}
              form={form}
              setForm={setForm}
            />

            <Field
              field={{
                type: "derived",
                name: "parValue",
                label: "newHk.company.fields.parValue.label",
                compute: (f) => {
                  const currency = f.currency || "HKD";
                  const total = f.capAmount === "other" ? Number(f.capOther || 0) : Number(f.capAmount || 0);
                  const shares = f.shareCount === "other" ? Number(f.shareOther || 1) : Number(f.shareCount || 1);
                  if (!total || !shares) return `${currency} 0.00`;
                  const pv = total / shares;
                  return `${currency} ${pv.toFixed(2)}`;
                },
                hint: "newHk.company.fields.parValue.hint"
              }}
              form={form}
              setForm={setForm}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <SectionTitle>{t("newHk.parties.title")}</SectionTitle>

          <PartiesManager app={app} setApp={setApp} />
          {/* <div className="grid gap-2 mt-4">
            <Field
              field={{
                type: "select",
                name: "dcp",
                label: "newHk.company.fields.dcp.label",
                placeholder: "newHk.company.fields.dcp.placeholder",
                options: (app.parties || [])
                  .map((p) => ({
                    label: p?.name || "",
                    value: p?.name || ""
                  }))
                  .filter((o) => o.value.trim() !== "")
              }}
              form={form}
              setForm={setForm}
            />
          </div> */}
          <Label className="text-lg text-red-600 m-2">
            {t("newHk.company.fields.inviteText", "Invite Shareholders/Directors Members before proceeding Next")}
          </Label>
        </CardContent>
      </Card>
    </div>
  );
}
export const EngagementTerms = () => {

  const items = Array.from({ length: 22 }).map((_, idx) => {
    const k = String(idx + 1);
    return {
      t: t(`newHk.terms.items.${k}.t`, ""),
      c: t(`newHk.terms.items.${k}.c`, "")
    };
  });
  return (
    <div className="space-y-3 text-sm">
      <div className="border border-dashed rounded-lg p-3 bg-muted/20">
        {t("newHk.terms.intro", "Please review the terms below. You will confirm acceptance at the Review & e-Sign step.")}
      </div>
      {items.map((x, i) => (
        <details key={i} className="border rounded-lg p-3">
          <summary className="font-semibold">{x.t}</summary>
          <p className="mt-2 text-muted-foreground">{x.c}</p>
        </details>
      ))}
    </div>
  );
};
function TopBar({ title, totalSteps, idx }: { title: string; totalSteps: number; idx: number }) {
  const pct = Math.round(((idx + 1) / totalSteps) * 100);
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="text-lg sm:text-xl font-extrabold truncate">{t(title, "Company Incorporation — Hong Kong")}</div>
        <div className="text-xs sm:text-sm text-muted-foreground">
          {t('newHk.infoHelpIcon', "Complete each step. Helpful tips (ⓘ) appear where terms may be unclear.")}
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

function Sidebar({
  steps,
  idx,
  goto,
  canProceedFromCurrent,
  paymentStatus = "unpaid",
}: {
  steps: Step[];
  idx: number;
  goto: (i: number) => void;
  canProceedFromCurrent: boolean; // derived from requiredMissing => canNext
  paymentStatus?: string;         // "paid" or anything else
}) {
  const canJumpTo = (target: number) => {
    if (target === idx) return true;    // current step
    if (target < idx) return true;      // always allow going back

    // Moving forward: block if current step incomplete
    if (!canProceedFromCurrent) return false;

    // Payment gate: block navigating to any step AFTER payment (index 7) unless paid
    if (paymentStatus !== "paid" && target > 7) return false;

    return true;
  };

  const onTryGoto = (target: number) => {
    if (target === idx) return;

    // If going backward, always allow
    if (target < idx) {
      goto(target);
      return;
    }

    // Forward navigation checks
    if (!canProceedFromCurrent) {
      toast({
        title: t("newHk.sidebar.toasts.completeStepTitle"),
        description: t("newHk.sidebar.toasts.completeStepDesc")
      });
      return;
    }

    if (paymentStatus !== "paid" && target > 7) {
      toast({
        title: t("newHk.sidebar.toasts.paymentReqTitle"),
        description: t("newHk.sidebar.toasts.paymentReqDesc")
      });
      return;
    }

    goto(target);
  };

  return (
    <aside className="space-y-4 sticky top-0 h-[calc(100vh-2rem)] overflow-auto p-0 lg:block">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-5 h-5 rounded bg-red-600 shrink-0" />
        <div className="text-[11px] sm:text-[13px] tracking-wide font-semibold truncate">
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

      <div className="space-y-1 mt-3">
        {steps.map((s, i) => {
          const enabled = canJumpTo(i);
          return (
            <button
              key={s.id}
              onClick={() => onTryGoto(i)}
              disabled={!enabled}
              className={classNames(
                "w-full text-left rounded-lg border p-2 sm:p-3 transition touch-manipulation",
                i === idx ? "border-primary bg-accent/10" : "hover:bg-accent/10",
                !enabled && "opacity-60 cursor-not-allowed"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold text-xs sm:text-sm truncate">
                  {i + 1}. {t(s.title as string, s.title as string)}
                </div>
                {i < idx && <Badge variant="secondary" className="shrink-0 text-xs">{t("newHk.sidebar.done", "Done")}</Badge>}
              </div>
            </button>
          );
        })}
        <p className="text-xs text-muted-foreground mt-2">
          {t("newHk.sidebar.needHelp")}
          <button
            className="text-sky-600 touch-manipulation"
            onClick={() => toast({ title: "Contact us", description: "Updating soon." })}
          >
            {t("newHk.sidebar.chatCta")}
          </button>
        </p>
      </div>
    </aside>
  );
}

async function saveDraft(doc: AppDoc): Promise<{ ok: boolean; _id?: string }> {
  const result = await saveIncorporationData(doc);
  if (result) {
    window.history.pushState({}, "", `/company-register/HK/${result._id}`);
  }
  result.ok = true
  // console.log("result", result);
  return result;
}

function ConfigForm({ config, existing }: { config: FormConfig; existing?: Partial<AppDoc> }) {
  const [app, setApp] = useAtom(hkAppAtom);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [savingNext, setSavingNext] = React.useState(false);
  const setForm = React.useCallback(
    (updater: (prev: any) => any) =>
      setApp((prev) => ({ ...prev!, form: updater(prev!.form), updatedAt: new Date().toISOString() })),
    [setApp]
  );
  const existingKey = React.useMemo(() => JSON.stringify(existing ?? {}), [existing]);
  React.useEffect(() => {
    if (!app) setApp(makeInitialAppDoc(config, {}, existing));
  }, [app, setApp, config, existingKey]);

  if (!app) {
    return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  }

  const stepIdx = app.stepIdx;
  const step = config.steps[stepIdx];

  const form = app.form;
  const goto = (i: number) => {
    setApp((prev) => ({
      ...prev!,
      stepIdx: Math.max(0, Math.min(config.steps.length - 1, i)),
      updatedAt: new Date().toISOString(),
    }));
    // Close sidebar on mobile after navigation
    setSidebarOpen(false);
  };
  const missing = step.fields ? requiredMissing(form, step) : [];
  const canNext = missing.length === 0;
  // console.log("stepIdx", stepIdx);
  const handleNext = async () => {
    // console.log("app---->",app)
    if (stepIdx >= config.steps.length - 1) return;
    if (stepIdx === 7 && app.paymentStatus !== "paid") {
      toast({ title: "Payment required", description: "Please complete the payment to continue." });
      return;
    }

    if (step.fields && !canNext) return; // should already be disabled, guard anyway
    try {
      setSavingNext(true);
      const grand = computeGrandTotal(app);
      app.form.finalAmount = grand
      const payload: AppDoc = { ...app, stepIdx: Math.min(stepIdx + 1, config.steps.length - 1) };


      if (stepIdx == 8) {
        const f = app.form;
        const ok =
          !!f.truthfulnessDeclaration &&
          !!f.legalTermsAcknowledgment &&
          !!f.compliancePreconditionAcknowledgment &&
          String(f.eSign || "").trim().length >= 3;
        if (!ok) {
          toast({ title: "Incomplete", description: "Please confirm all declarations and enter your electronic signature (full legal name)." });
          return;
        }
      }

      const token = localStorage.getItem("token") as string;
      const decodedToken = jwtDecode<TokenData>(token);

      if (!payload.userId) {
        payload.userId = decodedToken.userId;
        payload.users = [{ "userId": decodedToken.userId, "role": "applicant" }];
      } else {
        // If userId exists but belongs to someone else, do NOT override
        if (payload.userId !== decodedToken.userId) {
          // Just leave it as is — do nothing
        } else {
          // Same user — keep as is or update (your choice)
        }
      }
      if(stepIdx == 2){
        if(!app.partyInvited ) {
          toast({ title: "Shareholders/Directors Members Invitation Pending", description: "Please invite Shareholders/Directors Members before proceeding Next" });
          return 
        }
      }
      if (stepIdx == 1) {
        const q1 = form.legalAndEthicalConcern
        const q2 = form.q_country
        const q3 = form.sanctionsExposureDeclaration
        const q4 = form.crimeaSevastapolPresence
        const q5 = form.russianEnergyPresence
        const anyRisk = [q1, q2, q3, q4, q5].some((x) => x !== "no");
        if (anyRisk) {
          await saveDraft(payload);
          toast({
            title: "",
            description: "Consultation Required.",
          });
          return;
        }
        const res = await saveDraft(payload);

        // console.log("saveDraft res", res);
        if (res?.ok) {
          if (res._id && !app._id) {
            setApp((prev) => ({ ...prev!, _id: res._id }));
          }
          goto(stepIdx + 1);
        } else {
          toast({ title: "Error", description: "Could not save draft. Please try again." });
        }
      }
      const res = await saveDraft(payload);

      // console.log("saveDraft res", res);
      if (res?.ok) {
        if (res._id && !app._id) {
          setApp((prev) => ({ ...prev!, _id: res._id }));
        }
        goto(stepIdx + 1);
      } else {
        toast({ title: "Error", description: "Could not save draft. Please try again." });
      }

    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Could not save draft. Please try again." });
    } finally {
      setSavingNext(false);
    }
  };
  // console.log("stepIdx", stepIdx)
  // console.log("app", app);
  return (
    <div className="max-width mx-auto p-3 sm:p-4 md:p-6 space-y-4">
      <TopBar title={config.title} totalSteps={config.steps.length} idx={stepIdx} />
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-full justify-between touch-manipulation"
        >
          <span>{t("newHk.buttons.stepsMenu", "Steps Menu")}</span>
          <span className="text-xs">
            {t("newHk.topbar.stepOf", { current: stepIdx + 1, total: config.steps.length })}
          </span>
        </Button>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-4 lg:gap-6">
        {/* Mobile overlay sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-background border-r p-4 overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">{t("newHk.sidebar.stepsMenu", "Steps")}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  {t("newHk.sidebar.close", "✕")}
                </Button>
              </div>
              <Sidebar
                steps={config.steps}
                idx={stepIdx}
                goto={goto}
                canProceedFromCurrent={canNext}
                paymentStatus={app.paymentStatus || "unpaid"}
              />
            </div>
          </div>
        )}

        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            steps={config.steps}
            idx={stepIdx}
            goto={goto}
            canProceedFromCurrent={canNext}
            paymentStatus={app.paymentStatus || "unpaid"}
          />
        </div>

        {/* Main content */}
        <div className="min-w-0">
          <Card>
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">
                {stepIdx + 1}. {t(step.title as string, step.title as string)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6">
              {step.description && (
                <div className="border border-dashed rounded-lg p-3 bg-muted/20 text-xs sm:text-sm">
                  {t(step.description as string, step.description as string)}
                </div>
              )}
              {step.render ? (
                step.render({ app, setApp: setApp as React.Dispatch<React.SetStateAction<AppDoc>>, form, setForm })
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {(step.fields || []).map((f) => <Field key={f.name} field={f} form={form} setForm={setForm} />)}
                </div>
              )}
              {missing.length > 0 && (
                <div className="text-xs sm:text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <strong>{t("newHk.validation.requiredFieldsPrefix")}</strong>{" "}
                  {missing.map((k) => t(k, k)).join(", ")}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 sm:pt-6 px-4 sm:px-6">
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  disabled={stepIdx === 0}
                  onClick={() => goto(stepIdx - 1)}
                  className="flex-1 sm:flex-none touch-manipulation"
                >
                  {t("newHk.buttons.back", "← Back")}
                </Button>
              </div>
              {stepIdx !== 9 && (
                <div className="w-full sm:w-auto">
                  <Button
                    onClick={handleNext}
                    disabled={step.fields ? !canNext || savingNext : savingNext}
                    className="w-full sm:w-auto touch-manipulation"
                  >
                    {savingNext ? t("newHk.buttons.saving", "Saving…") : t("newHk.buttons.next", "Next →")}
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
const hkIncorpConfig: FormConfig = {
  title: "newHk.hkTitle",
  steps: [
    {
      id: "applicant",
      title: "newHk.steps.applicant.title",
      description: "newHk.steps.applicant.description",
      fields: [
        {
          type: "text",
          name: "applicantName",
          label: "newHk.steps.applicant.fields.applicantName.label",
          placeholder: "newHk.steps.applicant.fields.applicantName.placeholder",
          required: true,
          tooltip: "newHk.steps.applicant.fields.applicantName.tooltip"
        },
        { type: "email", name: "email", label: "newHk.steps.applicant.fields.email.label", placeholder: "newHk.steps.applicant.fields.email.placeholder", required: true },
        { type: "text", name: "phone", label: "newHk.steps.applicant.fields.phone.label", placeholder: "newHk.steps.applicant.fields.phone.placeholder" },
        { type: "text", name: "name1", label: "newHk.steps.applicant.fields.name1.label", required: true, colSpan: 2 },
        { type: "text", name: "name2", label: "newHk.steps.applicant.fields.name2.label", colSpan: 2 },
        { type: "text", name: "name3", label: "newHk.steps.applicant.fields.name3.label", colSpan: 2 },
        { type: "text", name: "cname1", label: "newHk.steps.applicant.fields.cname1.label" },
        { type: "text", name: "cname2", label: "newHk.steps.applicant.fields.cname2.label" },
        {
          type: "checkbox-group",
          name: "roles",
          label: "newHk.steps.applicant.fields.roles.label",
          tooltip: "newHk.steps.applicant.fields.roles.tooltip",
          options: [
            { label: "newHk.steps.applicant.fields.roles.options.Director", value: "Director" },
            { label: "newHk.steps.applicant.fields.roles.options.Shareholder", value: "Shareholder" },
            { label: "newHk.steps.applicant.fields.roles.options.Authorized", value: "Authorized" },
            { label: "newHk.steps.applicant.fields.roles.options.Professional", value: "Professional" },
            { label: "newHk.steps.applicant.fields.roles.options.Other", value: "Other" }
          ],
          colSpan: 2
        },
        {
          type: "select",
          name: "sns",
          label: "newHk.steps.applicant.fields.sns.label",
          placeholder: "newHk.steps.applicant.fields.sns.placeholder",
          options: [
            { label: "newHk.steps.applicant.fields.sns.options.WhatsApp", value: "WhatsApp" },
            { label: "newHk.steps.applicant.fields.sns.options.WeChat", value: "WeChat" },
            { label: "newHk.steps.applicant.fields.sns.options.Line", value: "Line" },
            { label: "newHk.steps.applicant.fields.sns.options.KakaoTalk", value: "KakaoTalk" },
            { label: "newHk.steps.applicant.fields.sns.options.Telegram", value: "Telegram" }
          ],
          colSpan: 1
        },
        { type: "text", name: "snsId", label: "newHk.steps.applicant.fields.snsId.label", placeholder: "newHk.steps.applicant.fields.snsId.placeholder", condition: (f) => !!f.sns }
      ]
    },
    {
      id: "compliance",
      title: "newHk.steps.compliance.title",
      description: "newHk.steps.compliance.description",
      fields: [
        {
          type: "radio-group",
          name: "legalAndEthicalConcern",
          label: "newHk.steps.compliance.questions.legalAndEthicalConcern",
          required: true,
          options: [
            { label: "newHk.steps.compliance.options.yes", value: "yes" },
            { label: "newHk.steps.compliance.options.no", value: "no" },
            { label: "newHk.steps.compliance.options.unsure", value: "unsure" }
          ],
          colSpan: 2
        },
        {
          type: "radio-group",
          name: "q_country",
          label: "newHk.steps.compliance.questions.q_country",
          required: true,
          options: [
            { label: "newHk.steps.compliance.options.yes", value: "yes" },
            { label: "newHk.steps.compliance.options.no", value: "no" },
            { label: "newHk.steps.compliance.options.unsure", value: "unsure" }
          ],
          colSpan: 2
        },
        {
          type: "radio-group",
          name: "sanctionsExposureDeclaration",
          label: "newHk.steps.compliance.questions.sanctionsExposureDeclaration",
          required: true,
          options: [
            { label: "newHk.steps.compliance.options.yes", value: "yes" },
            { label: "newHk.steps.compliance.options.no", value: "no" },
            { label: "newHk.steps.compliance.options.unsure", value: "unsure" }
          ],
          colSpan: 2
        },
        {
          type: "radio-group",
          name: "crimeaSevastapolPresence",
          label: "newHk.steps.compliance.questions.crimeaSevastapolPresence",
          required: true,
          options: [
            { label: "newHk.steps.compliance.options.yes", value: "yes" },
            { label: "newHk.steps.compliance.options.no", value: "no" },
            { label: "newHk.steps.compliance.options.unsure", value: "unsure" }
          ],
          colSpan: 2
        },
        {
          type: "radio-group",
          name: "russianEnergyPresence",
          label: "newHk.steps.compliance.questions.russianEnergyPresence",
          required: true,
          options: [
            { label: "newHk.steps.compliance.options.yes", value: "yes" },
            { label: "newHk.steps.compliance.options.no", value: "no" },
            { label: "newHk.steps.compliance.options.unsure", value: "unsure" }
          ],
          colSpan: 2
        }
      ]
    },
    { id: "company", title: "newHk.steps.company.title", render: ({ app, setApp }) => <CompanyInfoStep app={app} setApp={setApp} /> },
    {
      id: "acct",
      title: "newHk.steps.acct.title",
      fields: [
        {
          type: "select", name: "finYrEnd", label: "newHk.steps.acct.fields.finYrEnd.label",
          options: [
            { label: "newHk.steps.acct.fields.finYrEnd.options.December 31", value: "December 31" },
            { label: "newHk.steps.acct.fields.finYrEnd.options.March 31", value: "March 31" },
            { label: "newHk.steps.acct.fields.finYrEnd.options.June 30", value: "June 30" },
            { label: "newHk.steps.acct.fields.finYrEnd.options.September 30", value: "September 30" }
          ]
        },
        {
          type: "radio-group", name: "bookKeepingCycle", label: "newHk.steps.acct.fields.bookKeepingCycle.label",
          options: [
            { label: "newHk.steps.acct.fields.bookKeepingCycle.options.Monthly", value: "Monthly" },
            { label: "newHk.steps.acct.fields.bookKeepingCycle.options.Quarterly", value: "Quarterly" },
            { label: "newHk.steps.acct.fields.bookKeepingCycle.options.Half-annually", value: "Half-annually" },
            { label: "newHk.steps.acct.fields.bookKeepingCycle.options.Annually", value: "Annually" }
          ],
          colSpan: 2
        },
        {
          type: "radio-group", name: "xero", label: "newHk.steps.acct.fields.xero.label",
          options: [
            { label: "newHk.steps.acct.fields.xero.options.Yes", value: "Yes" },
            { label: "newHk.steps.acct.fields.xero.options.No", value: "No" },
            { label: "newHk.steps.acct.fields.xero.options.Recommendation required", value: "Recommendation required" },
            { label: "newHk.steps.acct.fields.xero.options.Other", value: "Other" }
          ],
          colSpan: 2
        },
        { type: "text", name: "softNote", label: "newHk.steps.acct.fields.softNote.label", placeholder: "newHk.steps.acct.fields.softNote.placeholder", colSpan: 2 }
      ]
    },
    { id: "terms", title: "newHk.steps.termsStep.title", render: () => <EngagementTerms /> },
    { id: "fees", title: "newHk.steps.fees.title", render: ({ app, setApp }) => <FeesEstimator app={app} setApp={setApp} /> },
    { id: "invoice", title: "newHk.steps.invoice.title", render: ({ app }) => <InvoicePreview app={app} /> },
    { id: "payment", title: "newHk.steps.payment.title", render: ({ app, setApp }) => <PaymentStep app={app} setApp={setApp} /> },
    { id: "review", title: "newHk.steps.review.title", render: ({ app, setApp }) => <ReviewStep app={app} setApp={setApp} /> },
    { id: "congrats", title: "newHk.steps.congrats.title", render: ({ app }) => <CongratsStep app={app} /> }
  ]
};

export default function ConfigDrivenHKForm() {
  React.useEffect(() => {
    document.title = "Company Incorporation - Mirr Asia";
  }, []);
  return <ConfigForm config={hkIncorpConfig} />;
}
