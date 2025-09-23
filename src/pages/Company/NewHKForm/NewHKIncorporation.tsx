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
import { Info } from "lucide-react";
import { FPSForm } from "../payment/FPSForm";
import { AppDoc, createInvoicePaymentIntent, deleteIncorpoPaymentBankProof, FieldBase, FormConfig, hkAppAtom, Party, saveIncorporationData, Step, updateCorporateInvoicePaymentIntent, uploadIncorpoPaymentBankProof, } from "./hkIncorpo";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { t } from "i18next";
import { toast } from "@/hooks/use-toast";
import { sendInviteToShDir } from "@/services/dataFetch";
import { isValidEmail } from "@/middleware";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import { TokenData } from "@/middleware/ProtectedRoutes";
import { businessNatureList } from "../HongKong/constants";
import SearchSelect from "@/components/SearchSelect";
import InvoicePreview from "./NewInvoicePreview";

const STRIPE_CLIENT_ID =
  import.meta.env.VITE_STRIPE_DETAILS || process.env.REACT_APP_STRIPE_DETAILS;

const stripePromise = loadStripe(STRIPE_CLIENT_ID);
// ---------- Types
// ---- Share types registry
const SHARE_TYPES = [
  { id: "ordinary", label: "Ordinary Shares" },
  { id: "preference", label: "Preference Shares" },
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


// ---------- Derived helpers
const computeBaseTotal = (app: AppDoc) => {
  const selectedIds = new Set(app.optionalFeeIds);
  let total = 0;
  [...feesConfig.government, ...feesConfig.service].forEach((item) => {
    const on = item.mandatory || selectedIds.has(item.id);
    if (on) total += item.amount;
  });
  return Number(total.toFixed(2));
};

const computeGrandTotal = (app: AppDoc) => {
  const base = computeBaseTotal(app);
  const pay = (app.form.payMethod || "card") as string;
  const surcharge = pay === "card" ? base * 0.035 : 0;
  return Number((base + surcharge).toFixed(2));
};

function Field({ field, form, setForm, }: {
  field: FieldBase;
  form: any; setForm: (fn: (prev: any) => any) => void;
}) {
  const visible = field.condition ? field.condition(form) : true;
  if (!visible) return null;

  const set = (name: string, value: any) => setForm((prev) => ({ ...prev, [name]: value }));

  const labelEl = (
    <div className="flex items-center gap-2">
      <Label htmlFor={field.name} className="font-semibold">
        {field.label}
      </Label>
      {field.tooltip && (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="size-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-sm">{field.tooltip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );

  const hintEl = field.hint ? <p className="text-xs text-muted-foreground mt-1">{field.hint}</p> : null;
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
            placeholder={field.placeholder}
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
            placeholder={field.placeholder}
            value={form[field.name] ?? ""}
            onChange={(e) => set(field.name, e.target.value)}
          />
          {hintEl}
        </div>
      );
    }
    case "select": {
      return (
        <div className={classNames("grid gap-2", spanClass)}>
          {labelEl}
          <Select value={String(form[field.name] ?? "")} onValueChange={(v) => set(field.name, v)}>
            <SelectTrigger id={field.name}>
              <SelectValue placeholder={field.placeholder || "Select"} />
            </SelectTrigger>
            <SelectContent>
              {(field.options || []).map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {t(o.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hintEl}
        </div>
      );
    }
    case "search-select": {
      // Expect field.options to be [{ code, label }]
      const selectedItem = form[field.name]
        ? field.items?.find((o: any) => o.code === form[field.name]) || null
        : null;

      const handleSelect = (item: { code: string; label: string }) => {
        set(field.name, item.code);
      };

      return (
        <div className={classNames("grid gap-2", spanClass)}>
          {labelEl}
          <SearchSelect
            items={field.items || []}
            placeholder={field.placeholder || "Select"}
            onSelect={handleSelect}
            selectedItem={selectedItem}
          />
          {hintEl}
        </div>
      );
    }

    case "checkbox": {
      return (
        <div className={classNames("flex items-center gap-2", spanClass)}>
          <Checkbox id={field.name} checked={!!form[field.name]} onCheckedChange={(v) => set(field.name, !!v)} />
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
      return (
        <div className={classNames("grid gap-2", spanClass)}>
          {labelEl}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
            {(field.options || []).map((o) => (
              <label key={o.value} className="flex items-center gap-2 rounded-md border p-2">
                <Checkbox checked={arr.includes(o.value)} onCheckedChange={(v) => toggle(o.value, !!v)} />
                <span className="text-sm">{o.label}</span>
              </label>
            ))}
          </div>
          {hintEl}
        </div>
      );
    }
    case "radio-group": {
      return (
        <div className="flex flex-col gap-3">
          {labelEl}
          <RadioGroup
            value={String(form[field.name] ?? "")}
            onValueChange={(v) => set(field.name, v)}
            className="flex flex-col gap-3"
          >
            {(field.options || []).map((o) => (
              <label key={o.value} className="flex items-start gap-3 text-sm text-gray-700 cursor-pointer">
                <RadioGroupItem
                  value={o.value}
                  id={`${field.name}-${o.value}`}
                  className="w-4 h-4 border-gray-300 focus:ring-primary mt-0.5 shrink-0"
                />
                <span className="leading-relaxed">{o.label}</span>
              </label>
            ))}
          </RadioGroup>

          {/* Optional hint */}
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

function Tip({ text, content }: { text?: string; content?: React.ReactNode }) {
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
  const form = app.form;
  const totalShares = React.useMemo(
    () => (form.shareCount === "other" ? Number(form.shareOther || 0) : Number(form.shareCount || 0)) || 0,
    [form.shareCount, form.shareOther]
  );

  const upd = (i: number, key: keyof Party, value: any) => {
    setApp((prev) => {
      const parties = [...prev.parties];
      (parties[i] as any)[key] = value;
      return { ...prev, parties, updatedAt: new Date().toISOString() };
    });
  };
  const del = (i: number) =>
    setApp((prev) => {
      const parties = prev.parties.filter((_, idx) => idx !== i);
      return { ...prev, parties, updatedAt: new Date().toISOString() };
    });
  const add = () =>
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
          typeOfShare: DEFAULT_SHARE_ID, // default
        },
      ],
      updatedAt: new Date().toISOString(),
    }));

  const assigned = app.parties.reduce((s, p) => s + (Number(p.shares) || 0), 0);
  const equal = totalShares > 0 && assigned === totalShares;
  const sendMailFunction = async () => {
    const extractedData = app.parties.map(item => {
      const { name, email } = item;
      if (!isValidEmail(email)) {
        toast({ title: "Error", description: `Invalid email format for ${name}: ${email}` });
      }
      return { name, email };
    });

    const payload = { _id: app._id || '', inviteData: extractedData, country: 'HK' };
    const response = await sendInviteToShDir(payload);
    console.log("response", response)
    if (response.summary.successful > 0) {
      setApp(prev => {
        const updated = prev.parties.map(p => {
          return { ...p, invited: true }
        });
        return { ...prev, parties: updated };
      });

      toast({
        title: 'Success',
        description: `Successfully sent invitation mail to ${response.summary.successful} people`,
      });
    }

    if (response.summary.alreadyExists > 0) {
      toast({
        title: 'Success',
        description: `Invite sent to member/director`,
      });
    }

    if (response.summary.failed > 0) {
      toast({
        title: 'Failed',
        description: `Some Invitations Failed`,
      });
    }

    console.log("send mail response", response);
  };


  return (
    <div className="space-y-3">
      <div
        className={classNames(
          "border rounded-xl p-3 text-sm",
          equal ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-red-200 bg-rose-50 text-rose-900"
        )}
      >
        {equal
          ? "All good — total number of shares allocated equals the company’s issued shares."
          : "Error: The total allocated shares must equal the company’s total number of shares. Please revise entries."}
      </div>
      {app.parties.map((p, i) => {
        const pct = totalShares ? ((Number(p.shares) || 0) / totalShares) * 100 : 0;
        return (
          <Card key={i} className="shadow-sm">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Full name / Entity name</Label>
                  <Input value={p.name} onChange={(e) => upd(i, "name", e.target.value)} />
                  <p className="text-xs text-muted-foreground">
                    Examples: <b>Jane Doe</b> (individual) or <b>ABC Holdings Limited</b> (corporate shareholder).
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input type="email" value={p.email} onChange={(e) => upd(i, "email", e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Phone</Label>
                  <Input value={p.phone} onChange={(e) => upd(i, "phone", e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>
                    Is this shareholder a corporate entity?{" "}
                    <Tip text="Select ‘Yes’ if the shareholder is a company (corporate shareholder). Select ‘No’ for an individual." />
                  </Label>
                  <Select value={String(p.isCorp)} onValueChange={(v) => upd(i, "isCorp", v === "true")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No — Individual</SelectItem>
                      <SelectItem value="true">Yes — Corporate shareholder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>
                    Will this person also serve as a director?{" "}
                    <Tip text="Directors manage the company and sign statutory filings. At least one individual director is required by law." />
                  </Label>
                  <Select value={String(p.isDirector)} onValueChange={(v) => upd(i, "isDirector", v === "true")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Number of shares</Label>
                  <Input
                    type="number"
                    value={String(p.shares)}
                    onChange={(e) => upd(i, "shares", Number(e.target.value || 0))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Shareholding % (auto)</Label>
                  <Input readOnly value={`${pct.toFixed(2)}%`} />
                </div>
                {/* Per-party Type of Shares (id only) */}
                <div className="grid gap-2 md:col-span-2">
                  <Label>Type of shares</Label>
                  <RadioGroup
                    value={p.typeOfShare ?? DEFAULT_SHARE_ID}
                    onValueChange={(v) => upd(i, "typeOfShare", (v as ShareTypeId) || DEFAULT_SHARE_ID)}
                  >
                    <div className="flex items-center gap-4 text-sm">
                      {SHARE_TYPES.map((t) => (
                        <label key={t.id} className="flex items-center gap-2">
                          <RadioGroupItem id={`stype-${t.id}-${i}`} value={t.id} />
                          {t.label}
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <Button variant="ghost" onClick={() => del(i)}>
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={add}>
          + Add shareholder / director
        </Button>
        <div className="text-sm text-muted-foreground">
          Total shares: {totalShares.toLocaleString()} • Assigned: {assigned.toLocaleString()}
        </div>
        <Button variant="outline" onClick={sendMailFunction}>
          Send Invitation
        </Button>
      </div>
    </div>
  );
}
// ---------- Fees / Invoice / Payment / Review
function FeesEstimator({ app, setApp }: { app: AppDoc; setApp: React.Dispatch<React.SetStateAction<AppDoc>> }) {
  const baseTotal = computeBaseTotal(app);

  const toggle = (id: string) => {
    setApp((prev) => {
      const has = prev.optionalFeeIds.includes(id);
      const optionalFeeIds = has ? prev.optionalFeeIds.filter((x) => x !== id) : [...prev.optionalFeeIds, id];
      return { ...prev, optionalFeeIds, updatedAt: new Date().toISOString() };
    });
  };

  function getRichTipContent(id: string): React.ReactNode | undefined {
    if (id === "reg_office") {
      return (
        <div className="space-y-2">
          <div className="font-semibold">Registered Office Address</div>
          <p>
            <span className="font-semibold">Mandatory:</span> Every Hong Kong company must have a registered office
            address in Hong Kong.
          </p>
          <div>
            <div className="font-semibold">Purpose:</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>This is the official legal address kept at the Companies Registry.</li>
              <li>
                All official government correspondence (e.g. Companies Registry, Inland Revenue Department, courts) is
                served to this address.
              </li>
              <li>Must be a physical address in Hong Kong (not a PO Box).</li>
            </ul>
          </div>
        </div>
      );
    }

    if (id === "corr_addr") {
      return (
        <div className="space-y-2">
          <div className="font-semibold">Correspondence Address</div>
          <p>
            This is an alternative mailing address for the directors, company secretary, or designated representatives.
          </p>
          <p>
            It is used when someone does not want their residential address made public in the Companies Registry records.
          </p>
          <p>
            Since 2018, Hong Kong allows directors to file a “correspondence address” instead of disclosing their full
            usual residential address on the public register.
          </p>
          <p className="text-sm">
            The residential address is still filed with the Companies Registry, but kept in a “protected” part of the
            register (only accessible to regulators and certain professionals).
          </p>
          <p>On the public records, only the correspondence address appears.</p>
        </div>
      );
    }

    return undefined;
  }

  // 3) Row using rich content for specific ids, fallback to plain info
  const Row = ({ item }: { item: any }) => {
    const richTip = getRichTipContent(item.id);

    return (
      <TableRow>
        <TableCell className="font-medium flex items-center gap-2">
          {item.label}
          <Tip content={richTip} text={!richTip ? item.info : undefined} />
        </TableCell>
        <TableCell>{item.original ? `USD ${item.original.toFixed(2)}` : "—"}</TableCell>
        <TableCell>{`USD ${item.amount.toFixed(2)}`}</TableCell>
        <TableCell className="w-[90px]">
          <Checkbox
            checked={item.mandatory || app.optionalFeeIds.includes(item.id)}
            disabled={item.mandatory}
            onCheckedChange={() => toggle(item.id)}
          />
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Service Description</TableHead>
            <TableHead>Original</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="w-[90px]">Select</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...feesConfig.government, ...feesConfig.service].map((x) => (
            <Row key={x.id} item={x} />
          ))}
        </TableBody>
      </Table>
      <div className="text-right font-bold">Total: USD {baseTotal.toFixed(2)}</div>
      <p className="text-sm text-muted-foreground">
        Government fees are statutory and payable by all companies. Optional items can be toggled before payment.
      </p>
    </div>
  );
}

type StripeSuccessInfo = {
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
          // Good practice to include a return_url for 3DS/redirect flows:
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

function PaymentStep({
  app,
  setApp,
}: {
  app: AppDoc;
  setApp: React.Dispatch<React.SetStateAction<AppDoc>>;
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
      alert("Payment already completed.");
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
    if (guard("Payment window expired. Please contact support to re-enable payment.")) return;
    if (!bankFile) return;
    setUploading(true);
    try {
      const result = await uploadIncorpoPaymentBankProof(app?._id || "", "hk", bankFile);
      if (result) setForm((p) => ({ ...p, uploadReceiptUrl: result?.url }));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBankProof = async () => {
    if (guard("Payment window expired. Please contact support to re-enable payment.")) return;
    await deleteIncorpoPaymentBankProof(app?._id || "", "hk");
    setForm((p: any) => ({ ...p, uploadReceiptUrl: undefined }));
  };

  // ----- Card payment flow (only when not paid & not expired) -----
  const handleProceedCard = async () => {
    if (guard("Payment window expired. Please contact support to re-enable payment.")) return;

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
      alert("Failed to prepare payment. Please try again.");
    } finally {
      setCreatingPI(false);
    }
  };

  return (
    <>
      {/* Success block (visible also on revisit) */}
      {isPaid && (
        <div className="mb-4 border rounded-md p-3 text-sm bg-emerald-50 border-emerald-200 text-emerald-900">
          <div className="font-semibold mb-1">Payment successful</div>
          <div className="space-y-1">
            {/* Amount is optional; render if saved */}
            {typeof app.form?.stripeAmountCents === "number" && app.form?.stripeCurrency ? (
              <div>
                Amount:{" "}
                <b>
                  {app.form.stripeCurrency.toUpperCase()} {(app.form.stripeAmountCents / 100).toFixed(2)}
                </b>
              </div>
            ) : null}
            <div>

              {app.form?.stripeReceiptUrl ? (
                <>
                  Receipt:&nbsp;
                  <a
                    href={app.form.stripeReceiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2"
                  >
                    View Stripe receipt
                  </a>
                </>
              ) : (
                null
              )}
            </div>
          </div>
        </div>
      )}

      {/* Expiry banner (hidden when paid) */}
      {!isPaid && (
        <div
          className={[
            "mb-4 rounded-md border p-3 text-sm",
            isExpired ? "border-red-200 bg-red-50 text-red-900" : "border-amber-200 bg-amber-50 text-amber-900",
          ].join(" ")}
        >
          {isExpired ? (
            <div className="font-medium">Payment window expired. Please contact support to re-enable payment.</div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="font-medium">Payment Timer</div>
              <div className="text-base font-bold tabular-nums">Time remaining: {formatRemaining(remainingMs)}</div>
            </div>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 space-y-2">
            <div className="font-bold">Payment Methods</div>
            {[
              { v: "card", label: "Card Payment — Stripe (3.5% processing fee)", tip: "Convenient for international cards. A processing fee is added to the invoice." },
              { v: "fps", label: "Fast Payment System (FPS) — Recommended (no extra fee)" },
              { v: "bank", label: "Bank Transfer — direct transfer with receipt upload" },
              { v: "other", label: "Other (cash) — with receipt upload" },
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
                <span className={isPaid || isExpired ? "text-muted-foreground" : ""}>{o.label}</span>
                {o.tip && !(isPaid || isExpired) && (
                  <span className="inline-flex ml-1">
                    <Tip text={o.tip} />
                  </span>
                )}
              </label>
            ))}
            {(isPaid || isExpired) && (
              <div className="mt-2 text-xs text-muted-foreground">
                {isPaid ? "Payment completed." : "Payment is disabled because the window has expired."}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-2">
            <div className="font-bold">Payment Conditions</div>
            <p>
              100% advance payment. All payments are <b>non-refundable</b>. The remitter bears all bank charges (including
              intermediary bank fees).
            </p>

            {["bank", "other"].includes(app.form.payMethod) && (
              <div className="mt-4 grid gap-3">
                <div className="grid gap-2">
                  <Label>Upload transfer reference</Label>
                  <Input
                    placeholder="e.g., HSBC TT reference"
                    value={app.form.bankRef || ""}
                    onChange={(e) => setForm((p) => ({ ...p, bankRef: e.target.value }))}
                    disabled={isPaid || isExpired}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Upload payment proof (PDF/JPG/PNG)</Label>
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setBankFile(f);
                    }}
                    disabled={isPaid || isExpired}
                  />
                  <Button onClick={handleBankProofSubmit} disabled={isPaid || isExpired || creatingPI || uploading}>
                    {uploading ? "Uploading…" : "Submit"}
                  </Button>
                </div>

                {app.form.uploadReceiptUrl ? (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Payment proof preview</div>
                      <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm" disabled={isPaid || isExpired}>
                          <a href={app.form.uploadReceiptUrl} target="_blank" rel="noopener noreferrer">
                            Open in new tab
                          </a>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleDeleteBankProof} disabled={isPaid || isExpired}>
                          Delete
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
                <Button onClick={handleProceedCard} disabled={isPaid || isExpired || creatingPI}>
                  {creatingPI ? "Preparing…" : "Proceed Card Payment"}
                </Button>
                <div className="text-xs text-muted-foreground mt-2">
                  {isExpired ? "Payment disabled — window expired." : "A secure Stripe card drawer will open to complete your payment."}
                </div>
              </div>
            )}

            {app.form.payMethod === "fps" ? <FPSForm /> : null}

            <div className="text-right font-bold mt-4">Grand Total: USD {grand.toFixed(2)}</div>
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
            // Persist success in local state so on revisit we show success w/o opening Elements
            setApp((prev) => ({
              ...prev,
              paymentStatus: info?.paymentIntentStatus === "succeeded" ? "paid" : prev.paymentStatus,
              form: {
                ...prev.form,
                stripeLastStatus: info?.paymentIntentStatus ?? prev.form.stripeLastStatus,
                stripeReceiptUrl: info?.receiptUrl ?? prev.form.stripeReceiptUrl,
                stripeAmountCents:
                  typeof info?.amount === "number" ? info.amount : prev.form.stripeAmountCents,
                stripeCurrency: info?.currency ?? prev.form.stripeCurrency,
              },
              updatedAt: new Date().toISOString(),
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

  const names = [form.name1 || "(TBD)", form.name2, form.name3].filter(Boolean).join(" / ");
  const chinese = [form.cname1, form.cname2].filter(Boolean).join(" / ");
  const owners = app.parties
    .map(
      (p) =>
        `${p.name || "Unknown"} — ${p.shares || 0} ${shareLabel(p.typeOfShare)}${p.isDirector ? " (Director)" : ""}${p.isCorp ? " (Corporate)" : ""
        }`
    )
    .join("\n");
  const shareCount = form.shareCount === "other" ? Number(form.shareOther || 0) : Number(form.shareCount || 0);
  const capTotal = form.capAmount === "other" ? Number(form.capOther || 0) : Number(form.capAmount || 0);
  const acctCycle = form.bookKeepingCycle || "";

  return (
    <div className="grid gap-3">
      <Card>
        <CardContent className="pt-6 space-y-3 text-sm">
          <div>
            <div className="font-semibold">Applicant</div>
            <div>
              {form.applicantName || "(not provided)"} — {form.email || ""}
            </div>
          </div>
          <div>
            <div className="font-semibold">Proposed Names</div>
            <div>
              {names}
              {chinese ? (
                <>
                  <br />
                  Chinese: {chinese}
                </>
              ) : null}
            </div>
          </div>
          <div>
            <div className="font-semibold">Industry</div>
            <div>{form.industry || "(not provided)"}</div>
          </div>
          <div>
            <div className="font-semibold">Description</div>
            <div>{form.bizdesc || "(not provided)"}</div>
          </div>
          <div>
            <div className="font-semibold">Share Capital</div>
            <div>
              {form.currency || "HKD"} {capTotal.toLocaleString()} • Shares: {shareCount.toLocaleString()} • Par:{" "}
              {(() => {
                const shares = shareCount || 1;
                const pv = capTotal && shares ? capTotal / shares : 0;
                return `${form.currency || "HKD"} ${pv.toFixed(2)}`;
              })()}
            </div>
          </div>
          <div>
            <div className="font-semibold">Owners</div>
            <div className="whitespace-pre-wrap mt-1">{owners || "—"}</div>
          </div>
          <div>
            <div className="font-semibold">Accounting Preferences</div>
            <div>
              Financial year-end : {form.finYrEnd || ""}, Bookkeeping: {acctCycle || "-"}, Software:{" "}
              {form.xero || "Recommendation required"}
              {form.softNote ? ` • Prefers: ${form.softNote}` : ""}
            </div>
          </div>
          <div>
            <div className="font-semibold">Total Amount</div>
            <div>
              Base: USD {base.toFixed(2)} • Payment: {(form.payMethod || "card").toUpperCase()} • Grand:{" "}
              <b>USD {grand.toFixed(2)}</b>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-2 text-sm">
          <div className="font-semibold">Declarations & Agreement</div>
          <div>
            <label className="flex items-center gap-2">
              <Checkbox
                id="truthfulnessDeclaration"
                checked={!!form.truthfulnessDeclaration}
                onCheckedChange={(v) => setForm((p) => ({ ...p, truthfulnessDeclaration: !!v }))}
              />{" "}
              I confirm that the information provided is true, complete, and accurate.
            </label>
            <label className="flex items-center gap-2 mt-2">
              <Checkbox
                id="legalTermsAcknowledgment"
                checked={!!form.legalTermsAcknowledgment}
                onCheckedChange={(v) => setForm((p) => ({ ...p, legalTermsAcknowledgment: !!v }))}
              />{" "}
              I have read and agree to the Engagement Terms & Registered Address terms.
            </label>
            <label className="flex items-center gap-2 mt-2">
              <Checkbox
                id="compliancePreconditionAcknowledgment"
                checked={!!form.compliancePreconditionAcknowledgment}
                onCheckedChange={(v) => setForm((p) => ({ ...p, compliancePreconditionAcknowledgment: !!v }))}
              />{" "}
              I understand that incorporation is subject to successful compliance review (KYC/CDD and sanctions checks).
            </label>
          </div>
          <div className="grid gap-2 mt-2">
            <Label>Electronic signature</Label>
            <Input
              id="eSign"
              placeholder="Type your full legal name here (e.g., JANE DOE)"
              value={form.eSign || ""}
              onChange={(e) => setForm((p) => ({ ...p, eSign: e.target.value }))}
            />
            <div className="text-xs text-muted-foreground">
              Your typed name will be recorded as an electronic signature with timestamp.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CongratsStep({ app }: { app: AppDoc }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') as string;
  const decodedToken = jwtDecode<any>(token);
  const navigateRoute = () => {
    localStorage.removeItem('companyRecordId');
    if (['admin', 'master'].includes(decodedToken.role)) navigate('/admin-dashboard');
    else navigate('/dashboard');
  }
  return (
    <div className="grid place-items-center gap-4 text-center py-6">
      <h2 className="text-xl font-extrabold">Congratulations!</h2>
      <p className="text-sm">
        Thank you{app.form.applicantName ? `, ${app.form.applicantName}` : ""}! Your application has been successfully
        submitted.
      </p>
      <div className="grid gap-3 w-full max-w-3xl text-left">
        {[
          {
            t: "Step 1 — Compliance review",
            s: "Our compliance officer will review your KYC/CDD and shareholding information. ETA: 1–2 business days.",
          },
          {
            t: "Step 2 — Filing with Companies Registry",
            s: "We will file the incorporation documents (NNC1, Articles, etc.).",
          },
          {
            t: "Step 3 — Registration certificates",
            s: "Expected: Certificate of Incorporation & Business Registration within ~5 business days.",
          },
          { t: "Step 4 — Bank/EMI account", s: "If selected, we arrange an account opening with your preferred bank/EMI." },
        ].map((x, i) => (
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
        <Button variant="outline" onClick={() => window.print()}>
          Print / Save Summary as PDF
        </Button>
        <Button onClick={navigateRoute}>Go to Dashboard</Button>
      </div>
    </div>
  );
}
function CompanyInfoStep({ app, setApp }: { app: AppDoc; setApp: React.Dispatch<React.SetStateAction<AppDoc>> }) {
  const form = app.form;
  const setForm = (updater: (prev: any) => any) =>
    setApp((prev) => ({ ...prev, form: updater(prev.form), updatedAt: new Date().toISOString() }));
  const incorporationPurposes = {
    operateHK: "Operate business in Hong Kong & Greater China",
    assetMgmt: "Asset management / investment",
    holdingCo: "Holding company for subsidiaries",
    crossBorder: "Cross-border trade advantages",
    taxNeutral: "Tax neutrality (no capital gains tax)",
  };

  const contactOptions = React.useMemo(
    () =>
      Array.from(
        new Set(
          (app.parties || [])
            .map((p) => (p?.name || "").trim())
            .filter(Boolean)
        )
      ),
    [app.parties]
  );

  React.useEffect(() => {
    if (form.dcp && !contactOptions.includes(form.dcp)) {
      setForm((p) => ({ ...p, dcp: "" }));
    }
  }, [contactOptions]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <SectionTitle>A. Business Details</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              field={{
                type: "search-select",
                name: "industry",
                label: "Business Industry",
                required: true,
                placeholder: "Select an industry",
                items: businessNatureList
              }}
              form={form}
              setForm={setForm}
            />
            <div className="grid gap-2">
              <Label>Purpose of Incorporation</Label>
              <div className="grid gap-2">
                {Object.entries(incorporationPurposes).map(([key, txt]) => (
                  <label key={key} className="flex items-center gap-2">
                    <Checkbox
                      checked={Array.isArray(form.purpose) && form.purpose.includes(key)}
                      onCheckedChange={(v) => {
                        const cur = new Set<string>(Array.isArray(form.purpose) ? form.purpose : []);
                        if (v) cur.add(key);
                        else cur.delete(key);
                        setForm((p) => ({ ...p, purpose: Array.from(cur) }));
                      }}
                    />{" "}
                    <span className="text-sm">{txt}</span>
                  </label>
                ))}
              </div>
            </div>
            <Field
              field={{
                type: "textarea",
                name: "bizdesc",
                label: "Description",
                placeholder: "Short description of the product/service and planned activities",
                colSpan: 2,
                rows: 4,
                tooltip:
                  "Describe the product name, service type, and main activities after incorporation. Example: B2B IT consulting for ERP integration; secondary: SaaS subscription.",
              }}
              form={form}
              setForm={setForm}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <SectionTitle>B. Share Capital</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              field={{
                type: "select",
                name: "currency",
                label: "Base currency",
                required: true,
                defaultValue: "HKD",
                options: [
                  { label: "HKD", value: "HKD" },
                  { label: "USD", value: "USD" },
                  { label: "CNY", value: "CNY" },
                ],
              }}
              form={form}
              setForm={setForm}
            />
            <Field
              field={{
                type: "select",
                name: "capAmount",
                label: "Total share capital",
                required: true,
                defaultValue: "10000",
                options: [
                  { label: "1,000", value: "1000" },
                  { label: "10,000", value: "10000" },
                  { label: "100,000", value: "100000" },
                  { label: "Other (enter amount)", value: "other" },
                ],
              }}
              form={form}
              setForm={setForm}
            />
            <Field
              field={{
                type: "number",
                name: "capOther",
                label: "Enter total capital",
                placeholder: "e.g., 25000",
                condition: (f) => f.capAmount === "other",
              }}
              form={form}
              setForm={setForm}
            />
            <Field
              field={{
                type: "select",
                name: "shareCount",
                label: "Total number of shares (min 1)",
                required: true,
                defaultValue: "10000",
                options: [
                  { label: "1", value: "1" },
                  { label: "10", value: "10" },
                  { label: "10,000", value: "10000" },
                  { label: "Other (enter quantity)", value: "other" },
                ],
              }}
              form={form}
              setForm={setForm}
            />
            <Field
              field={{
                type: "number",
                name: "shareOther",
                label: "Enter number of shares",
                placeholder: "e.g., 5000",
                condition: (f) => f.shareCount === "other",
              }}
              form={form}
              setForm={setForm}
            />
            <Field
              field={{
                type: "derived",
                name: "parValue",
                label: "Calculated par value (read-only)",
                compute: (f) => {
                  const currency = f.currency || "HKD";
                  const total = f.capAmount === "other" ? Number(f.capOther || 0) : Number(f.capAmount || 0);
                  const shares = f.shareCount === "other" ? Number(f.shareOther || 1) : Number(f.shareCount || 1);
                  if (!total || !shares) return `${currency} 0.00`;
                  const pv = total / shares;
                  return `${currency} ${pv.toFixed(2)}`;
                },
                hint: "Par value = total share capital ÷ number of shares.",
              }}
              form={form}
              setForm={setForm}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <SectionTitle>C. Shareholders / Directors</SectionTitle>
          <PartiesManager app={app} setApp={setApp} />
          {/* No global 'Type of shares' here — handled per-party */}
          <div className="grid gap-2 mt-4">
            <Field
              field={{
                type: "select",
                name: "dcp",
                label: "Designated Contact Person",
                placeholder: "Select a contact person",
                options: (app.parties || [])
                  .map((p) => ({
                    label: p?.name || "",
                    value: p?.name || "",
                  }))
                  .filter((o) => o.value.trim() !== ""),
              }}
              form={form}
              setForm={setForm}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
const EngagementTerms = () => {
  const terms = [
    { t: "1. Purpose of this Agreement", c: "The purpose of this agreement is to prevent misunderstandings about the scope and limitations of services provided by MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED (\"Mirr Asia\") to the client company to be incorporated in the HKSAR (the \"Client\")." },
    { t: "2. Role of Hong Kong Company Secretary & Limitation of Liability", c: "Mirr Asia will be appointed as company secretary in accordance with the Companies Ordinance (Cap 622) and the Client’s Articles of Association. Secretarial services are statutory in nature and differ from the role of an employed administrative secretary." },
    { t: "3. Registered Address & Limitations", c: "The Client may use Mirr Asia’s registered address in Hong Kong for statutory registration. Changes require written notice. The registered address is for registration and mail handling only; it is not a physical office. The Client must not use the address for unlawful purposes or misrepresent it as a place of business." },
    { t: "4. Scope of Services (Year 1)", c: "Company secretary registration and maintenance of statutory records; filings; registers; minutes; BRC at registered office; brief business/operational advice (non-legal)." },
    { t: "5. Fees & Exclusions", c: "Fees exclude accounting, audit, tax filings, bank account opening advice, and third-party charges (e.g., bank charges, government fees, taxes, courier)." },
    { t: "6. Assignment & Subcontractors", c: "Neither party may assign or transfer its rights/obligations without prior written consent of the other." },
    { t: "7. Confidentiality", c: "Both parties will keep confidential any non-public business or technical information obtained under this Agreement, except where disclosure is required by law or the information is already public." },
    { t: "8. Entire Agreement", c: "This Agreement is the complete understanding between the parties and supersedes prior communications." },
    { t: "9. Severability", c: "If any provision is invalid or unenforceable, the remainder remains in force." },
    { t: "10. No Third-party Beneficiaries", c: "No rights are created for third parties unless authorized in writing by Mirr Asia." },
    { t: "11. Governing Law & Dispute Resolution", c: "Hong Kong law governs this Agreement. Disputes will be referred to binding arbitration in Hong Kong." },
    { t: "12. Costs & Attorney’s Fees", c: "The prevailing party in any dispute may recover reasonable costs and attorney’s fees." },
    { t: "13. Client Confirmation & Declaration", c: "The Client confirms lawful use of services and accuracy of information; Mirr Asia may discontinue services if illegal activity is suspected." },
  ];

  return (
    <div className="space-y-3 text-sm">
      <div className="border border-dashed rounded-lg p-3 bg-muted/20">
        Please review the terms below. You will confirm acceptance at the Review & e-Sign step.
      </div>
      {terms.map((x, i) => (
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
        <div className="text-lg sm:text-xl font-extrabold truncate">{title}</div>
        <div className="text-xs sm:text-sm text-muted-foreground">
          Complete each step. Helpful tips (ⓘ) appear where terms may be unclear.
        </div>
      </div>
      <div className="w-full sm:w-72 shrink-0">
        <Progress value={pct} />
        <div className="text-right text-xs text-muted-foreground mt-1">
          Step {idx + 1} of {totalSteps}
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
        title: "Complete this step",
        description: "Please fill all required fields before continuing.",
      });
      return;
    }

    if (paymentStatus !== "paid" && target > 7) {
      toast({
        title: "Payment required",
        description: "Please complete the payment before proceeding to later steps.",
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
          MIRR ASIA — Incorporation
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        <div className="flex flex-wrap gap-1">
          <span className="inline-flex items-center gap-1 border rounded-full px-2 py-1 text-[10px] sm:text-xs">
            🔒 SSL Secured
          </span>
          <span className="inline-flex items-center gap-1 border rounded-full px-2 py-1 text-[10px] sm:text-xs">
            🏛️ Registry Compliant
          </span>
          <span className="inline-flex items-center gap-1 border rounded-full px-2 py-1 text-[10px] sm:text-xs">
            🧑‍⚖️ AML/CFT Ready
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
                  {i + 1}. {s.title}
                </div>
                {i < idx && <Badge variant="secondary" className="shrink-0 text-xs">Done</Badge>}
              </div>
            </button>
          );
        })}
        <p className="text-xs text-muted-foreground mt-2">
          Need help?{" "}
          <button
            className="text-sky-600 touch-manipulation"
            onClick={() => toast({ title: "Contact us", description: "Updating soon." })}
          >
            MirrAsia Chat
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
  console.log("result", result);
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

  const handleNext = async () => {
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
      console.log("stepIdx", stepIdx);
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
      payload.userId = decodedToken.userId;

      const res = await saveDraft(payload);
      console.log("saveDraft res", res);
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
  console.log("stepIdx", stepIdx)
  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6 space-y-4">
      <TopBar title={config.title} totalSteps={config.steps.length} idx={stepIdx} />
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-full justify-between touch-manipulation"
        >
          <span>Steps Menu</span>
          <span className="text-xs">
            Step {stepIdx + 1}/{config.steps.length}
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
                <h2 className="font-semibold">Steps</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  ✕
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
                {stepIdx + 1}. {step.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6">
              {step.description && (
                <div className="border border-dashed rounded-lg p-3 bg-muted/20 text-xs sm:text-sm">
                  {step.description}
                </div>
              )}
              {step.render ? (
                // setApp is guaranteed non-null here; cast for child props
                step.render({ app, setApp: setApp as React.Dispatch<React.SetStateAction<AppDoc>>, form, setForm })
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {(step.fields || []).map((f) => <Field key={f.name} field={f} form={form} setForm={setForm} />)}
                </div>
              )}
              {missing.length > 0 && (
                <div className="text-xs sm:text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <strong>Required fields:</strong> {missing.join(", ")}
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
                  ← Back
                </Button>
              </div>
              {stepIdx !== 9 && (
                <div className="w-full sm:w-auto">
                  <Button
                    onClick={handleNext}
                    disabled={step.fields ? !canNext || savingNext : savingNext}
                    className="w-full sm:w-auto touch-manipulation"
                  >
                    {savingNext ? "Saving…" : "Next →"}
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
  title: "Company Incorporation — Hong Kong",
  steps: [
    {
      id: "applicant",
      title: "Applicant & Proposed Company Names",
      description: "Provide your contact details and propose up to three English names (and optional Chinese names) in order of preference. This helps us obtain quick name pre‑screening before filing.",
      fields: [
        {
          type: "text",
          name: "applicantName",
          label: "Applicant's Full Name",
          placeholder: "e.g., Jane Doe",
          required: true,
          tooltip: "The person responsible for this application. Must be authorized to submit KYC and CDD documents.",
        },
        { type: "email", name: "email", label: "Email", placeholder: "Primary Email (verification required)", required: true },
        { type: "text", name: "phone", label: "Mobile (with country code)", placeholder: "+852 1234 5678" },
        { type: "text", name: "name1", label: "Proposed English Name — 1st", required: true, colSpan: 2 },
        { type: "text", name: "name2", label: "Proposed English Name — 2nd", colSpan: 2 },
        { type: "text", name: "name3", label: "Proposed English Name — 3rd", colSpan: 2 },
        { type: "text", name: "cname1", label: "Chinese Name — 1st (optional)" },
        { type: "text", name: "cname2", label: "Chinese Name — 2nd (optional)" },
        {
          type: "checkbox-group",
          name: "roles",
          label: "Role in the Company",
          tooltip: "Multiple choices allowed.",
          options: [
            { label: "Director", value: "Director" },
            { label: "Shareholder", value: "Shareholder" },
            { label: "Authorized Representative", value: "Authorized" },
            { label: "Professional Advisor", value: "Professional" },
            { label: "Other", value: "Other" },
          ],
          colSpan: 2,
        },
        {
          type: "select",
          name: "sns",
          label: "SNS Platform (optional)",
          placeholder: "Select SNS Platform",
          options: [
            { label: "WhatsApp", value: "WhatsApp" },
            { label: "WeChat", value: "WeChat" },
            { label: "Line", value: "Line" },
            { label: "KakaoTalk", value: "KakaoTalk" },
            { label: "Telegram", value: "Telegram" },
          ],
          colSpan: 1,
        },
        { type: "text", name: "snsId", label: "SNS Account ID", placeholder: "e.g., wechat_id", condition: (f) => !!f.sns },
      ],
    },
    {
      id: "compliance",
      title: "Compliance & Ethical Assessment (AML / CDD)",
      description: "Answer accurately based on your current knowledge. Select ‘Unsure’ if you need help.",
      fields: [
        {
          type: "radio-group",
          name: "legalAndEthicalConcern",
          label:
            "Are there any legal or ethical concerns related to the business (e.g., money laundering, gambling, tax evasion, asset concealment, fraud)?",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No — to the best of my knowledge", value: "no" },
            { label: "Unsure — request assistance", value: "unsure" },
          ],
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "q_country",
          label:
            "Does the Hong Kong company have any current or planned business activity in the following countries/regions: Iran, Sudan, North Korea, Syria, Cuba, South Sudan, Belarus, or Zimbabwe?",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No — to the best of my knowledge", value: "no" },
            { label: "Unsure — request assistance", value: "unsure" },
          ],
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "sanctionsExposureDeclaration",
          label:
            "Sanctions exposure: Do the company or any connected parties have a presence in, dealings with, or ownership ties to sanctioned persons or entities under UN, EU, UK HMT, HKMA, OFAC (US) or local sanctions law?",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No — to the best of my knowledge", value: "no" },
            { label: "Unsure — request assistance", value: "unsure" },
          ],
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "crimeaSevastapolPresence",
          label: "Any current or planned business in Crimea/Sevastopol Regions?",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No — to the best of my knowledge", value: "no" },
            { label: "Unsure — request assistance", value: "unsure" },
          ],
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "russianEnergyPresence",
          label: "Any current or planned exposure to Russia in the energy/oil/gas sector, the military, or defense?",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No — to the best of my knowledge", value: "no" },
            { label: "Unsure — request assistance", value: "unsure" },
          ],
          colSpan: 2,
        },
      ],
    },
    {
      id: "company",
      title: "Company Information",
      render: ({ app, setApp }) => <CompanyInfoStep app={app} setApp={setApp} />,
    },
    {
      id: "acct",
      title: "Accounting & Taxation",
      fields: [
        {
          type: "select",
          name: "finYrEnd",
          label: "Financial year-end date of the Hong Kong company",
          options: [
            { label: "December 31", value: "December 31" },
            { label: "March 31", value: "March 31" },
            { label: "June 30", value: "June 30" },
            { label: "September 30", value: "September 30" },
          ],
        },
        {
          type: "radio-group",
          name: "bookKeepingCycle",
          label: "Bookkeeping cycle",
          options: [
            { label: "Monthly (recommended for > ~50 txns/mo)", value: "Monthly" },
            { label: "Quarterly", value: "Quarterly" },
            { label: "Half-annually (every 6 months)", value: "Half-annually" },
            { label: "Annually (every 12 months) — lowest cost", value: "Annually" },
          ],
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "xero",
          label: "Would you like to implement online accounting software (e.g., Xero)?",
          options: [
            { label: "Yes (≈HKD 400/mo)", value: "Yes" },
            { label: "No", value: "No" },
            { label: "Recommendation required — we will suggest based on industry & volume", value: "Recommendation required" },
            { label: "Other", value: "Other" },
          ],
          colSpan: 2,
        },
        {
          type: "text",
          name: "softNote",
          label: "Do you currently use/prefer another accounting software? (optional)",
          placeholder: "e.g., QuickBooks Online, Wave, or leave blank",
          colSpan: 2,
        },
      ],
    },
    {
      id: "terms",
      title: "Engagement Terms & Service Agreement",
      render: () => <EngagementTerms />,
    },
    {
      id: "fees",
      title: "Incorporation Package & Optional Add-ons",
      // description: "Complete each step. Helpful tips (ⓘ) appear where terms may be unclear.",
      render: ({ app, setApp }) => <FeesEstimator app={app} setApp={setApp} />,
    },
    {
      id: "invoice",
      title: "Invoice — Preview",
      // description: "Complete each step. Helpful tips (ⓘ) appear where terms may be unclear.",
      render: ({ app }) => <InvoicePreview app={app} />,
    },
    {
      id: "payment",
      title: "Payment",
      render: ({ app, setApp }) => <PaymentStep app={app} setApp={setApp} />,
    },
    {
      id: "review",
      title: "Review & e-Sign",
      render: ({ app, setApp }) => <ReviewStep app={app} setApp={setApp} />,
    },
    {
      id: "congrats",
      title: "Confirmation",
      render: ({ app }) => <CongratsStep app={app} />,
    },
  ],
};

export default function ConfigDrivenHKForm() {
  React.useEffect(() => {
    document.title = "Company Incorporation - Mirr Asia";
  }, []);
  return <ConfigForm config={hkIncorpConfig} />;
}
