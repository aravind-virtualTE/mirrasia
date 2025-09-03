/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { atom, useAtom, useSetAtom } from "jotai";
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

/**
 * Config-driven multi-step form using shadcn/ui + jotai
 * ----------------------------------------------------------------
 * This version ports the provided HTML (10 steps) into a React +
 * config-driven renderer, while keeping styling close to shadcn
 * conventions. It also fixes the Select empty-value issue.
 *
 * Major features now covered:
 * - 10-step flow with sidebar stepper & top progress
 * - Applicant, Compliance, Company (incl. Share Capital with Par Value)
 * - Dynamic Parties (shareholders/directors) with share-allocation check
 * - Fee Estimator (mandatory + optional) -> Invoice Preview
 * - Payment method (card/fps/bank/other) with card surcharge (3.5%)
 * - Review & e‑Sign (3 declarations + signature) -> Submit -> Congrats
 * - Dev Tests panel to guard regressions
 */

// ----- Types
export type Option = { label: string; value: string };
export type FieldBase = {
  type:
    | "text"
    | "email"
    | "number"
    | "textarea"
    | "select"
    | "checkbox"
    | "checkbox-group"
    | "radio-group"
    | "derived";
  name: string; // flat key into form object
  label: string;
  placeholder?: string;
  hint?: string;
  tooltip?: string;
  colSpan?: 1 | 2; // grid columns
  required?: boolean;
  options?: Option[]; // for select/checkbox-group/radio-group
  defaultValue?: any;
  rows?: number; // textarea
  condition?: (form: Record<string, any>) => boolean; // visibility condition
  compute?: (form: Record<string, any>) => string; // for derived fields
};

export type Step = {
  id: string;
  title: string;
  description?: string;
  fields?: FieldBase[];
  // when a step is more complex than field rendering
  render?: (ctx: RenderCtx) => React.ReactNode;
};

export type FormConfig = {
  title: string;
  steps: Step[];
};

// ----- Global atoms & helpers
const classNames = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(" ");

function initFromConfig(config: FormConfig) {
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
            base[f.name] = ""; // empty string lets Select show placeholder
        }
      }
    })
  );
  // defaults used elsewhere in flow
  base.payMethod = base.payMethod || "card";
  base.decl1 = false; base.decl2 = false; base.decl3 = false; base.sig = "";
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

// ------ Fees model (configurable)
const feesConfig = {
  government: [
    { id: "cr_fee", label: "HK Company Incorporation Government Fee to Companies Registry", original: 221, amount: 221, mandatory: true, info: "Statutory filing fee payable to the Companies Registry." },
    { id: "br_fee", label: "Business Registration (government) fee", original: 283, amount: 283, mandatory: true, info: "Annual Business Registration levy." },
  ],
  service: [
    { id: "inc_service", label: "Hong Kong Company Incorporation — service fee (discounted)", original: 219, amount: 0, mandatory: true, info: "Mirr Asia incorporation service — fully discounted in the package." },
    { id: "sec_annual", label: "Company Secretary Annual Service Charge", original: 450, amount: 225, mandatory: true, info: "Includes statutory record keeping and filings." },
    { id: "kyc", label: "KYC / Due Diligence fee (1st year)", original: 65, amount: 0, mandatory: true, info: "Included for the first year." },
    { id: "reg_office", label: "Registered Office Address (annual, optional)", original: 322, amount: 161, mandatory: false, info: "50% off for the first year." },
    { id: "bank_arr", label: "Bank/EMI Account Opening Arrangement (optional)", original: 400, amount: 400, mandatory: false, info: "Introduction and scheduling support." },
    { id: "kit", label: "Company Kit Producing cost (optional)", original: 70, amount: 70, mandatory: false, info: "Company chop, share certificates, etc." },
    { id: "corr_addr", label: "Correspondence Address Annual Service (optional)", original: 65, amount: 65, mandatory: false, info: "Mail handling for directors/shareholders." },
  ],
};

//  ----- Atoms that power the app
const configAtom = atom<FormConfig | null>(null);
const formAtom = atom<Record<string, any>>({});
const stepAtom = atom(0);

// dynamic parties (shareholders/directors)
export type Party = {
  name: string;
  email: string;
  phone: string;
  isCorp: boolean;
  isDirector: boolean;
  shares: number;
  invited: boolean;
};
const partiesAtom = atom<Party[]>([]);

// optional fees toggles (store ids of optional items that are ON)
const optionalFeeIdsAtom = atom<string[]>([]);

// derived atoms
const totalSharesSelector = atom((get) => {
  const f = get(formAtom);
  const shareCount = f.shareCount === "other" ? Number(f.shareOther || 0) : Number(f.shareCount || 0);
  return shareCount || 0;
});

const baseTotalFeesSelector = atom((get) => {
  const selectedIds = new Set(get(optionalFeeIdsAtom));
  let total = 0;
  [...feesConfig.government, ...feesConfig.service].forEach((item) => {
    const on = item.mandatory || selectedIds.has(item.id);
    if (on) total += item.amount;
  });
  return Number(total.toFixed(2));
});

const grandTotalSelector = atom((get) => {
  const base = get(baseTotalFeesSelector);
  const pay = (get(formAtom).payMethod || "card") as string;
  const surcharge = pay === "card" ? base * 0.035 : 0;
  return Number((base + surcharge).toFixed(2));
});

const ownershipOkSelector = atom((get) => {
  const total = get(totalSharesSelector);
  const parties = get(partiesAtom);
  const assigned = parties.reduce((s, p) => s + (Number(p.shares) || 0), 0);
  return total > 0 && assigned === total;
});
console.log("ownershipOkSelector",ownershipOkSelector)
// ----- Generic Field Renderer
function Field({ field, form, setForm }: { field: FieldBase; form: any; setForm: (fn: (prev: any) => any) => void }) {
  const visible = field.condition ? field.condition(form) : true;
  if (!visible) return null;

  const set = (name: string, value: any) => setForm((prev) => ({ ...prev, [name]: value }));

  const labelEl = (
    <div className="flex items-center gap-2">
      <Label htmlFor={field.name} className="font-semibold">
        {field.label}
      </Label>
      {field.tooltip && (
        <TooltipProvider>
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
      // Note: value may be an empty string to show placeholder; but no SelectItem uses ""
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
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        <div className={classNames("grid gap-2", spanClass)}>
          {labelEl}
          <RadioGroup value={String(form[field.name] ?? "")} onValueChange={(v) => set(field.name, v)}>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
              {(field.options || []).map((o) => (
                <label key={o.value} className="flex items-center gap-2 rounded-md border p-2">
                  <RadioGroupItem value={o.value} id={`${field.name}-${o.value}`} />
                  <span className="text-sm">{o.label}</span>
                </label>
              ))}
            </div>
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

// ----- Basic config validator (also used by tests)
// function validateConfig(config: FormConfig) {
//   const errors: string[] = [];
//   config.steps.forEach((s, si) => {
//     (s.fields || []).forEach((f, fi) => {
//       if (f.type === "select" && f.options) {
//         f.options.forEach((o, oi) => {
//           if (o.value === "") {
//             errors.push(`steps[${si}].fields[${fi}] select option[${oi}] has empty value for label "${o.label}"`);
//           }
//         });
//       }
//     });
//   });
//   return errors;
// }

// ----- Dev tests
// type TestCase = { name: string; pass: boolean; message?: string };
// function runConfigTests(config: FormConfig, helpers: { par: () => string; ownershipOK: () => boolean; totals: () => { base: number; grandCard: number; grandFPS: number } }) {
//   const tests: TestCase[] = [];

//   // 1) No SelectItem has empty value
//   const valErrs = validateConfig(config);
//   tests.push({ name: "Select options have non-empty values", pass: valErrs.length === 0, message: valErrs.join("; ") });

//   // 2) Derived par value calculation
//   const par = helpers.par();
//   tests.push({ name: "Derived par value calculation", pass: par === "HKD 1.00", message: `value: ${par}` });

//   // 3) Ownership allocation check
//   tests.push({ name: "Ownership allocation equals total shares", pass: helpers.ownershipOK() });

//   // 4) Fees totals & surcharge
//   const totals = helpers.totals();
//   tests.push({ name: "Base total (mandatory + selected optionals)", pass: totals.base === 729, message: `base=${totals.base}` });
//   tests.push({ name: "Grand total (card 3.5%)", pass: Number(totals.grandCard.toFixed(2)) === Number((729 * 1.035).toFixed(2)), message: `grandCard=${totals.grandCard}` });
//   tests.push({ name: "Grand total (FPS no fee)", pass: totals.grandFPS === 729, message: `grandFPS=${totals.grandFPS}` });

//   // 5) Step count is 10
//   tests.push({ name: "Has 10 steps", pass: config.steps.length === 10 });

//   return tests;
// }

// function TestPanel({ config, helpers }: { config: FormConfig; helpers: { par: () => string; ownershipOK: () => boolean; totals: () => { base: number; grandCard: number; grandFPS: number } } }) {
//   const tests = React.useMemo(() => runConfigTests(config, helpers), [config, helpers]);
//   return (
//     <Card className="mt-4">
//       <CardHeader>
//         <CardTitle className="text-base">Dev Tests</CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-2">
//         {tests.map((t, i) => (
//           <div key={i} className="flex items-start justify-between gap-4 text-sm">
//             <div>
//               <div className="font-medium">{t.name}</div>
//               {t.message && <div className="text-muted-foreground text-xs">{t.message}</div>}
//             </div>
//             <Badge variant={t.pass ? "default" : "destructive"}>{t.pass ? "PASS" : "FAIL"}</Badge>
//           </div>
//         ))}
//       </CardContent>
//     </Card>
//   );
// }

// ----- Reusable UI bits
function Tip({ text }: { text: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted/60 text-foreground/80 text-[10px] font-bold cursor-help">i</span>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm whitespace-pre-wrap">{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-base font-extrabold mb-3">{children}</div>;
}

// ----- Complex sub-views
function PartiesManager() {
  const [parties, setParties] = useAtom(partiesAtom);
  const [form] = useAtom(formAtom);
  const totalShares = React.useMemo(() => (form.shareCount === "other" ? Number(form.shareOther || 0) : Number(form.shareCount || 0)) || 0, [form.shareCount, form.shareOther]);

  const upd = (i: number, key: keyof Party, value: any) => {
    setParties((prev) => {
      const next = [...prev];
      (next[i] as any)[key] = value;
      return next;
    });
  };
  const del = (i: number) => setParties((prev) => prev.filter((_, idx) => idx !== i));
  const add = () => setParties((prev) => [...prev, { name: "", email: "", phone: "", isCorp: false, isDirector: false, shares: 0, invited: false }]);

  const assigned = parties.reduce((s, p) => s + (Number(p.shares) || 0), 0);
  const equal = totalShares > 0 && assigned === totalShares;

  return (
    <div className="space-y-3">
      <div className={classNames("border rounded-xl p-3 text-sm", equal ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-red-200 bg-rose-50 text-rose-900")}> 
        {equal ? "All good — total number of shares allocated equals the company’s issued shares." : "Error: The total allocated shares must equal the company’s total number of shares. Please revise entries."}
      </div>

      {parties.map((p, i) => {
        const pct = totalShares ? ((Number(p.shares) || 0) / totalShares) * 100 : 0;
        return (
          <Card key={i} className="shadow-sm">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Full name / Entity name</Label>
                  <Input value={p.name} onChange={(e) => upd(i, "name", e.target.value)} />
                  <p className="text-xs text-muted-foreground">Examples: <b>Jane Doe</b> (individual) or <b>ABC Holdings Limited</b> (corporate shareholder).</p>
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
                  <Label>Is this shareholder a corporate entity? <Tip text="Select ‘Yes’ if the shareholder is a company (corporate shareholder). Select ‘No’ for an individual." /></Label>
                  <Select value={String(p.isCorp)} onValueChange={(v) => upd(i, "isCorp", v === "true") }>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No — Individual</SelectItem>
                      <SelectItem value="true">Yes — Corporate shareholder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Will this person also serve as a director? <Tip text="Directors manage the company and sign statutory filings. At least one individual director is required by law." /></Label>
                  <Select value={String(p.isDirector)} onValueChange={(v) => upd(i, "isDirector", v === "true") }>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Number of shares</Label>
                  <Input type="number" value={String(p.shares)} onChange={(e) => upd(i, "shares", Number(e.target.value || 0))} />
                </div>
                <div className="grid gap-2">
                  <Label>Shareholding % (auto)</Label>
                  <Input readOnly value={`${pct.toFixed(2)}%`} />
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <Button variant="ghost" onClick={() => del(i)}>Remove</Button>
                {p.invited ? (
                  <span className="text-sm text-muted-foreground">Invitation sent</span>
                ) : (
                  <Button variant="outline" onClick={() => upd(i, "invited", true)}>Send Invitation</Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={add}>+ Add shareholder / director</Button>
        <div className="text-sm text-muted-foreground">Total shares: {totalShares.toLocaleString()} • Assigned: {assigned.toLocaleString()}</div>
      </div>
    </div>
  );
}

function FeesEstimator() {
  const [optionalIds, setOptional] = useAtom(optionalFeeIdsAtom);
  const baseTotal = useAtom(baseTotalFeesSelector)[0];

  const toggle = (id: string) => {
    setOptional((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const Row = ({ item }: { item: any }) => (
    <TableRow>
      <TableCell className="font-medium flex items-center gap-2">{item.label}<Tip text={item.info} /></TableCell>
      <TableCell>{item.original ? `USD ${item.original.toFixed(2)}` : "—"}</TableCell>
      <TableCell>{`USD ${item.amount.toFixed(2)}`}</TableCell>
      <TableCell className="w-[90px]">
        <Checkbox checked={item.mandatory || optionalIds.includes(item.id)} disabled={item.mandatory} onCheckedChange={() => toggle(item.id)} />
      </TableCell>
    </TableRow>
  );

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
      <p className="text-sm text-muted-foreground">Government fees are statutory and payable by all companies. Optional items can be toggled before payment.</p>
    </div>
  );
}

function InvoicePreview() {
  const base = useAtom(baseTotalFeesSelector)[0];
  const grand = useAtom(grandTotalSelector)[0];
  const [form] = useAtom(formAtom);
  const optional = useAtom(optionalFeeIdsAtom)[0];
  const chosenGov = feesConfig.government; // always mandatory
  const chosenSvc = feesConfig.service.filter((x) => x.mandatory || optional.includes(x.id));
    console.log("base",base)

  const TableMini = ({ list }: { list: any[] }) => (
    <Table>
      <TableBody>
        {list.map((x) => (
          <TableRow key={x.id}>
            <TableCell className="font-medium">{x.label}</TableCell>
            <TableCell className="w-36">USD {x.amount.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="grid gap-3">
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">Generated: {new Date().toLocaleDateString()} • Currency: USD</div>
          <div className="mt-4 font-bold">Government Fees</div>
          <TableMini list={chosenGov} />
          <div className="mt-4 font-bold">Our Service Fees</div>
          <TableMini list={chosenSvc} />
          <div className="text-right mt-3 text-base font-bold">Grand Total: USD {grand.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground mt-1">Prices are in USD for convenience. Government fees may change based on official notices.</div>
          {form.payMethod === "card" && (
            <div className="text-xs text-muted-foreground mt-2">Includes 3.5% card processing surcharge.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PaymentStep() {
  const [form, setForm] = useAtom(formAtom);
  const grand = useAtom(grandTotalSelector)[0];
  return (
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
              <input type="radio" name="pay" value={o.v} checked={form.payMethod === o.v} onChange={() => setForm((p) => ({ ...p, payMethod: o.v }))} />
              <span>{o.label}</span>
              {o.tip && <span className="inline-flex ml-1"><Tip text={o.tip} /></span>}
            </label>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6 space-y-2">
          <div className="font-bold">Payment Conditions</div>
          <p>100% advance payment. All payments are <b>non‑refundable</b>. The remitter bears all bank charges (including intermediary bank fees).</p>
          {form.payMethod === "fps" ? (
            <div className="border rounded-xl p-3 text-sm border-emerald-200 bg-emerald-50 text-emerald-900">No fees are added when paying via FPS.</div>
          ) : null}
          <div className="text-right font-bold mt-4">Grand Total: USD {grand.toFixed(2)}</div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReviewStep() {
  const [form] = useAtom(formAtom);
  const [parties] = useAtom(partiesAtom);
  const base = useAtom(baseTotalFeesSelector)[0];
  const grand = useAtom(grandTotalSelector)[0];

  const names = [form.name1 || "(TBD)", form.name2, form.name3].filter(Boolean).join(" / ");
  const chinese = [form.cname1, form.cname2].filter(Boolean).join(" / ");
  const owners = parties
    .map((p) => `${p.name || "Unknown"} — ${p.shares || 0} shares${p.isDirector ? " (Director)" : ""}${p.isCorp ? " (Corporate)" : ""}`)
    .join("\n");
  const shareCount = form.shareCount === "other" ? Number(form.shareOther || 0) : Number(form.shareCount || 0);
  const capTotal = form.capAmount === "other" ? Number(form.capOther || 0) : Number(form.capAmount || 0);

  const feeLines = [...feesConfig.government, ...feesConfig.service]
    .filter((x) => x.mandatory || false || true)
    .map((x) => `${x.label}: USD ${x.amount.toFixed(2)}`)
    .join("\n");
    console.log("feeLines",feeLines)

  const acctCycle = form.bk || "";

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
              {chinese ? <><br />Chinese: {chinese}</> : null}
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
              {form.currency || "HKD"} {capTotal.toLocaleString()} • Shares: {shareCount.toLocaleString()} • Par: {(() => {
                const shares = shareCount || 1;
                const pv = capTotal && shares ? capTotal / shares : 0;
                return `${form.currency || "HKD"} ${pv.toFixed(2)}`;
              })()}
            </div>
          </div>
          <div>
            <div className="font-semibold">Owners</div>
            <pre className="whitespace-pre-wrap text-xs mt-1">{owners || "—"}</pre>
          </div>
          <div>
            <div className="font-semibold">Accounting Preferences</div>
            <div>
              FYE: {form.fye || ""}, Bookkeeping: {acctCycle || "-"}, Software: {form.xero || "Recommendation required"}
              {form.softNote ? ` • Prefers: ${form.softNote}` : ""}
            </div>
          </div>
          <div>
            <div className="font-semibold">Estimated Total</div>
            <div>
              Base: USD {base.toFixed(2)} • Payment: {(form.payMethod || "card").toUpperCase()} • Grand: <b>USD {grand.toFixed(2)}</b>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-2 text-sm">
          <div className="font-semibold">Declarations & Agreement</div>
          <div>
            <label className="flex items-center gap-2"><Checkbox id="decl1" checked={!!form.decl1} onCheckedChange={() => { /* will be handled externally via buttons */ }} /> I confirm that the information provided is true, complete, and accurate.</label>
            <label className="flex items-center gap-2 mt-2"><Checkbox id="decl2" checked={!!form.decl2} onCheckedChange={() => {}} /> I have read and agree to the Engagement Terms & Registered Address terms.</label>
            <label className="flex items-center gap-2 mt-2"><Checkbox id="decl3" checked={!!form.decl3} onCheckedChange={() => {}} /> I understand that incorporation is subject to successful compliance review (KYC/CDD and sanctions checks).</label>
          </div>
          <div className="grid gap-2 mt-2">
            <Label>Electronic signature</Label>
            <Input id="sig" placeholder="Type your full legal name here (e.g., JANE DOE)" defaultValue={form.sig} />
            <div className="text-xs text-muted-foreground">Your typed name will be recorded as an electronic signature with timestamp.</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CongratsStep() {
  const [form] = useAtom(formAtom);
  return (
    <div className="grid place-items-center gap-4 text-center py-6">
      <div className="w-20 h-20 rounded-full text-white font-black grid place-items-center shadow-lg" style={{ background: "conic-gradient(#16a34a 0 270deg, #e5e7eb 0)" }}>✓</div>
      <h2 className="text-xl font-extrabold">Congratulations!</h2>
      <p className="text-sm">Thank you{form.applicantName ? `, ${form.applicantName}` : ""}! Your application has been successfully submitted.</p>
      <div className="grid gap-3 w-full max-w-3xl text-left">
        {[
          { t: "Step 1 — Compliance review", s: "Our compliance officer will review your KYC/CDD and shareholding information. ETA: 1–2 business days." },
          { t: "Step 2 — Filing with Companies Registry", s: "We will file the incorporation documents (NNC1, Articles, etc.)." },
          { t: "Step 3 — Registration certificates", s: "Expected: Certificate of Incorporation & Business Registration within ~5 business days." },
          { t: "Step 4 — Bank/EMI account", s: "If selected, we arrange an account opening with your preferred bank/EMI." },
        ].map((x, i) => (
          <div key={i} className="grid grid-cols-[12px_1fr] gap-3 text-sm">
            <div className="mt-2 w-3 h-3 rounded-full bg-sky-500" />
            <div><b>{x.t}</b><br /><span className="text-muted-foreground">{x.s}</span></div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 justify-center">
        <Button variant="outline" onClick={() => window.print()}>Print / Save Summary as PDF</Button>
        <Button>Go to Dashboard</Button>
      </div>
    </div>
  );
}

// ----- Complex Step Renderers that assemble Field()s with headings
function CompanyInfoStep() {
  const [form, setForm] = useAtom(formAtom);
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <SectionTitle>A. Business Details</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              field={{ type: "select", name: "industry", label: "Business Industry", required: true, placeholder: "Select an industry", options: [
                { label: "001 — Crop & animal production", value: "001 — Crop and animal production" },
                { label: "462 — Wholesale trade (non‑specialized)", value: "462 — Wholesale trade (non‑specialized)" },
                { label: "620 — IT consulting / software", value: "620 — IT consulting / software" },
                { label: "631 — E‑commerce / online retail", value: "631 — E‑commerce / online retail" },
                { label: "681 — Real estate holding / investment", value: "681 — Real estate holding / investment" },
              ] }}
              form={form}
              setForm={setForm}
            />
            <div className="grid gap-2">
              <Label>Purpose of Incorporation</Label>
              <div className="grid gap-2">
                {["Operate business in Hong Kong & Greater China","Asset management / investment","Holding company for subsidiaries","Cross‑border trade advantages","Tax neutrality (no capital gains tax)"].map((txt) => (
                  <label key={txt} className="flex items-center gap-2"><Checkbox checked={Array.isArray(form.purpose) && form.purpose.includes(txt)} onCheckedChange={(v) => {
                    const cur = new Set<string>(Array.isArray(form.purpose) ? form.purpose : []);
                    if (v) cur.add(txt); else cur.delete(txt);
                    setForm((p) => ({ ...p, purpose: Array.from(cur) }));
                  }} /> <span className="text-sm">{txt}</span></label>
                ))}
              </div>
            </div>
            <Field field={{ type: "textarea", name: "bizdesc", label: "Description", placeholder: "Short description of the product/service and planned activities", colSpan: 2, rows: 4, tooltip: "Describe the product name, service type, and main activities after incorporation. Example: B2B IT consulting for ERP integration; secondary: SaaS subscription." }} form={form} setForm={setForm} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <SectionTitle>B. Share Capital</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field field={{ type: "select", name: "currency", label: "Base currency", required: true, defaultValue: "HKD", options: [ { label: "HKD", value: "HKD" }, { label: "USD", value: "USD" }, { label: "CNY", value: "CNY" } ] }} form={form} setForm={setForm} />
            <Field field={{ type: "select", name: "capAmount", label: "Total share capital", required: true, defaultValue: "10000", options: [ { label: "HKD 1,000", value: "1000" }, { label: "HKD 10,000", value: "10000" }, { label: "HKD 100,000", value: "100000" }, { label: "Other (enter amount)", value: "other" } ] }} form={form} setForm={setForm} />
            <Field field={{ type: "number", name: "capOther", label: "Enter total capital", placeholder: "e.g., 25000", condition: (f) => f.capAmount === "other" }} form={form} setForm={setForm} />
            <Field field={{ type: "select", name: "shareCount", label: "Total number of shares (min 1)", required: true, defaultValue: "10000", options: [ { label: "1", value: "1" }, { label: "10", value: "10" }, { label: "10,000", value: "10000" }, { label: "Other (enter quantity)", value: "other" } ] }} form={form} setForm={setForm} />
            <Field field={{ type: "number", name: "shareOther", label: "Enter number of shares", placeholder: "e.g., 5000", condition: (f) => f.shareCount === "other" }} form={form} setForm={setForm} />
            <Field field={{ type: "derived", name: "parValue", label: "Calculated par value (read‑only)", compute: (f) => { const currency = f.currency || "HKD"; const total = f.capAmount === "other" ? Number(f.capOther || 0) : Number(f.capAmount || 0); const shares = f.shareCount === "other" ? Number(f.shareOther || 1) : Number(f.shareCount || 1); if (!total || !shares) return `${currency} 0.00`; const pv = total / shares; return `${currency} ${pv.toFixed(2)}`; }, hint: "Par value = total share capital ÷ number of shares." }} form={form} setForm={setForm} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <SectionTitle>C. Shareholders / Directors</SectionTitle>
          <PartiesManager />
          <div className="grid gap-2 mt-4">
            <Label>Type of shares</Label>
            <div className="flex items-center gap-4 text-sm">
              <label className="flex items-center gap-2"><input type="radio" name="stype" defaultChecked /> Ordinary Shares</label>
              <label className="flex items-center gap-2"><input type="radio" name="stype" /> Preference Shares</label>
            </div>
            <div className="grid gap-2 mt-2">
              <Label>Designated Contact Person</Label>
              <Input placeholder="e.g., Jane Doe" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EngagementTerms() {
  return (
    <div className="space-y-3 text-sm">
      <div className="border border-dashed rounded-lg p-3 bg-muted/20">Please review the terms below. You will confirm acceptance at the Review & e‑Sign step.</div>
      {[{t: "1. Purpose of this Agreement", c: "The purpose of this agreement is to prevent misunderstandings about the scope and limitations of services provided by MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED (\"Mirr Asia\") to the client company to be incorporated in the HKSAR (the \"Client\")."},
        {t: "2. Role of Hong Kong Company Secretary & Limitation of Liability", c: "Mirr Asia will be appointed as company secretary in accordance with the Companies Ordinance (Cap 622) and the Client’s Articles of Association. Secretarial services are statutory in nature and differ from the role of an employed administrative secretary."},
        {t: "3. Registered Address & Limitations", c: "The Client may use Mirr Asia’s registered address in Hong Kong for statutory registration. Changes require written notice. The registered address is for registration and mail handling only; it is not a physical office. The Client must not use the address for unlawful purposes or misrepresent it as a place of business."},
        {t: "4. Scope of Services (Year 1)", c: "Company secretary registration and maintenance of statutory records; filings; registers; minutes; BRC at registered office; brief business/operational advice (non-legal)."},
        {t: "5. Fees & Exclusions", c: "Fees exclude accounting, audit, tax filings, bank account opening advice, and third‑party charges (e.g., bank charges, government fees, taxes, courier)."},
        {t: "6. Assignment & Subcontractors", c: "Neither party may assign or transfer its rights/obligations without prior written consent of the other."},
        {t: "7. Confidentiality", c: "Both parties will keep confidential any non‑public business or technical information obtained under this Agreement, except where disclosure is required by law or the information is already public."},
        {t: "8. Entire Agreement", c: "This Agreement is the complete understanding between the parties and supersedes prior communications."},
        {t: "9. Severability", c: "If any provision is invalid or unenforceable, the remainder remains in force."},
        {t: "10. No Third‑party Beneficiaries", c: "No rights are created for third parties unless authorized in writing by Mirr Asia."},
        {t: "11. Governing Law & Dispute Resolution", c: "Hong Kong law governs this Agreement. Disputes will be referred to binding arbitration in Hong Kong."},
        {t: "12. Costs & Attorney’s Fees", c: "The prevailing party in any dispute may recover reasonable costs and attorney’s fees."},
        {t: "13. Client Confirmation & Declaration", c: "The Client confirms lawful use of services and accuracy of information; Mirr Asia may discontinue services if illegal activity is suspected."},
      ].map((x, i) => (
        <details key={i} className="border rounded-lg p-3">
          <summary className="font-semibold">{x.t}</summary>
          <p className="mt-2 text-muted-foreground">{x.c}</p>
        </details>
      ))}
    </div>
  );
}

// ----- Renderer
export type RenderCtx = {
  form: any;
  setForm: ReturnType<typeof useSetAtom> | ((fn: (prev: any) => any) => void);
};

function TopBar({ title, totalSteps, idx }: { title: string; totalSteps: number; idx: number }) {
  const pct = Math.round(((idx + 1) / totalSteps) * 100);
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div>
        <div className="text-xl font-extrabold">{title}</div>
        <div className="text-sm text-muted-foreground">Complete each step. Helpful tips appear where terms may be unclear.</div>
      </div>
      <div className="w-full md:w-72">
        <Progress value={pct} />
        <div className="text-right text-xs text-muted-foreground mt-1">Step {idx + 1} of {totalSteps}</div>
      </div>
    </div>
  );
}

function Sidebar({ steps, idx, goto }: { steps: Step[]; idx: number; goto: (i: number) => void }) {
  return (
    <aside className="space-y-4 sticky top-0 h-[calc(100vh-2rem)] overflow-auto p-0">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-5 h-5 rounded bg-red-600" />
        <div className="text-[13px] tracking-wide font-semibold">MIRR ASIA — Incorporation</div>
      </div>
      <div className="text-xs text-muted-foreground"> <span className="inline-flex items-center gap-1 border rounded-full px-2 py-1 mr-1">🔒 SSL Secured</span><span className="inline-flex items-center gap-1 border rounded-full px-2 py-1 mr-1">🏛️ Companies Registry Compliant</span><span className="inline-flex items-center gap-1 border rounded-full px-2 py-1">🧑‍⚖️ AML/CFT Ready</span></div>
      <div className="space-y-1 mt-3">
        {steps.map((s, i) => (
          <button key={s.id} onClick={() => goto(i)} className={classNames("w-full text-left rounded-lg border p-3 hover:bg-accent/10 transition", i === idx && "border-primary bg-accent/10") }>
            <div className="flex items-center justify-between">
              <div className="font-semibold text-sm">{i + 1}. {s.title}</div>
              {i < idx && <Badge variant="secondary">Done</Badge>}
            </div>
            {s.description && <p className="text-xs text-muted-foreground mt-1">{s.description}</p>}
          </button>
        ))}
        <p className="text-xs text-muted-foreground mt-2">Need help? <button className="text-sky-600" onClick={() => alert("For demo only — hook to chat/support.")}>MirrAsia Chat</button></p>
      </div>
    </aside>
  );
}

// function StepCard({ title, children, footer }: { title: string; children: React.ReactNode; footer?: React.ReactNode }) {
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>{title}</CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-4">{children}</CardContent>
//       {footer && <CardFooter className="flex items-center justify-between">{footer}</CardFooter>}
//     </Card>
//   );
// }

function ConfigForm({ config }: { config: FormConfig }) {
  // set global config once
  const setConfig = useSetAtom(configAtom);
  React.useEffect(() => setConfig(config), [config, setConfig]);

  // atoms
  const [form, setForm] = useAtom(React.useMemo(() => atom(initFromConfig(config)), [config]));
  const [stepIdx, setStepIdx] = useAtom(stepAtom);
  const step = config.steps[stepIdx];

  // initialize parties default (mirror HTML default)
  const setParties = useSetAtom(partiesAtom);
  const totalShares = form.shareCount === "other" ? Number(form.shareOther || 0) : Number(form.shareCount || 0) || 10000;
  React.useEffect(() => {
    setParties([{ name: "Jane Doe", email: "jane@example.com", phone: "+852 1234 5678", isCorp: false, isDirector: true, shares: totalShares, invited: false }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // progress
  const missing = step.fields ? requiredMissing(form, step) : [];
  const canNext = missing.length === 0;
  const goto = (i: number) => setStepIdx(Math.max(0, Math.min(config.steps.length - 1, i)));

  const onSubmit = () => {
    // Validate declarations
    const ok = !!form.decl1 && !!form.decl2 && !!form.decl3 && String(form.sig || "").trim().length >= 3;
    if (!ok) {
      alert("Please confirm all declarations and enter your electronic signature (full legal name).");
      return;
    }
    goto(config.steps.length - 1); // Congrats
  };

  // helpers for tests
//   const helpers = React.useMemo(() => ({
//     par: () => {
//       const currency = form.currency || "HKD";
//       const total = form.capAmount === "other" ? Number(form.capOther || 0) : Number(form.capAmount || 0);
//       const shares = form.shareCount === "other" ? Number(form.shareOther || 1) : Number(form.shareCount || 1);
//       const pv = total && shares ? total / shares : 0;
//       return `${currency} ${pv.toFixed(2)}`;
//     },
//     ownershipOK: () => {
//       const total = form.shareCount === "other" ? Number(form.shareOther || 0) : Number(form.shareCount || 0);
//       const assigned =  (window as any).__parties_for_test__ as Party[] | undefined;
//       if (!assigned) return true; // fallback in dev
//       const sum = assigned.reduce((s, p) => s + (Number(p.shares) || 0), 0);
//       return total > 0 && sum === total;
//     },
//     totals: () => {
//       // mandatory only = 221 + 283 + 0 + 225 + 0 = 729
//       const base = 729;
//       return { base, grandCard: Number((base * 1.035).toFixed(2)), grandFPS: base };
//     },
//   }), [form]);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4">
      <TopBar title={config.title} totalSteps={config.steps.length} idx={stepIdx} />

      <div className="grid md:grid-cols-[260px_1fr] gap-4">
        <Sidebar steps={config.steps} idx={stepIdx} goto={goto} />

        {/* Step content */}
        <Card>
          <CardHeader>
            <CardTitle>{stepIdx + 1}. {step.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {step.description && <div className="border border-dashed rounded-lg p-3 bg-muted/20 text-sm">{step.description}</div>}

            {step.render ? (
              step.render({ form, setForm })
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(step.fields || []).map((f) => (
                  <Field key={f.name} field={f} form={form} setForm={setForm} />
                ))}
              </div>
            )}

            {missing.length > 0 && (
              <div className="text-sm text-destructive">Required: {missing.join(", ")}</div>
            )}
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <Button variant="outline" disabled={stepIdx === 0} onClick={() => goto(stepIdx - 1)}>← Back</Button>
            {stepIdx < config.steps.length - 1 ? (
              <Button onClick={() => goto(stepIdx + 1)} disabled={step.fields ? !canNext : false}>Next →</Button>
            ) : (
              <Button onClick={onSubmit}>Submit Application →</Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* <TestPanel config={config} helpers={helpers} /> */}
    </div>
  );
}

// ----- App config with all 10 steps
const hkIncorpConfig: FormConfig = {
  title: "Company Incorporation — Hong Kong",
  steps: [
    {
      id: "applicant",
      title: "Applicant & Proposed Company Names",
      description: "Provide contact details and propose up to three English names (and optional Chinese names) in order of preference.",
      fields: [
        { type: "text", name: "applicantName", label: "Applicant's Full Name", placeholder: "e.g., Jane Doe", required: true, tooltip: "The person responsible for this application. Must be authorized to submit KYC and CDD documents." },
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
        { type: "radio-group", name: "q1", label: "Any legal or ethical concerns (e.g., ML, gambling, tax evasion, asset concealment, fraud)?", required: true, options: [ { label: "Yes", value: "yes" }, { label: "No — to the best of my knowledge", value: "no" }, { label: "Unsure — request assistance", value: "unsure" } ], colSpan: 2 },
        { type: "radio-group", name: "q_country", label: "Any activity in: Iran, Sudan, North Korea, Syria, Cuba, South Sudan, Belarus, or Zimbabwe?", required: true, options: [ { label: "Yes", value: "yes" }, { label: "No — to the best of my knowledge", value: "no" }, { label: "Unsure — request assistance", value: "unsure" } ], colSpan: 2 },
        { type: "radio-group", name: "q2", label: "Sanctions exposure under UN/EU/UK HMT/HKMA/OFAC or local regimes?", required: true, options: [ { label: "Yes", value: "yes" }, { label: "No — to the best of my knowledge", value: "no" }, { label: "Unsure — request assistance", value: "unsure" } ], colSpan: 2 },
        { type: "radio-group", name: "q3", label: "Any current or planned business in Crimea/Sevastopol Regions?", required: true, options: [ { label: "Yes", value: "yes" }, { label: "No — to the best of my knowledge", value: "no" }, { label: "Unsure — request assistance", value: "unsure" } ], colSpan: 2 },
        { type: "radio-group", name: "q4", label: "Any exposure to Russia in energy/oil/gas, military, or defense?", required: true, options: [ { label: "Yes", value: "yes" }, { label: "No — to the best of my knowledge", value: "no" }, { label: "Unsure — request assistance", value: "unsure" } ], colSpan: 2 },
      ],
    },
    {
      id: "company",
      title: "Company Information",
      render: () => <CompanyInfoStep />,
    },
    {
      id: "acct",
      title: "Accounting & Taxation",
      fields: [
        { type: "select", name: "fye", label: "Financial year‑end date of the Hong Kong company", options: [ { label: "December 31", value: "December 31" }, { label: "March 31", value: "March 31" }, { label: "June 30", value: "June 30" }, { label: "September 30", value: "September 30" } ] },
        { type: "radio-group", name: "bk", label: "Bookkeeping cycle", options: [ { label: "Monthly (recommended for > ~50 txns/mo)", value: "Monthly" }, { label: "Quarterly", value: "Quarterly" }, { label: "Half‑annually (every 6 months)", value: "Half‑annually" }, { label: "Annually (every 12 months) — lowest cost", value: "Annually" } ], colSpan: 2 },
        { type: "radio-group", name: "xero", label: "Would you like to implement online accounting software (e.g., Xero)?", options: [ { label: "Yes (≈HKD 400/mo)", value: "Yes" }, { label: "No", value: "No" }, { label: "Recommendation required — we will suggest based on industry & volume", value: "Recommendation required" }, { label: "Other", value: "Other" } ], colSpan: 2 },
        { type: "text", name: "softNote", label: "Do you currently use/prefer another accounting software? (optional)", placeholder: "e.g., QuickBooks Online, Wave, or leave blank", colSpan: 2 },
      ],
    },
    {
      id: "terms",
      title: "Engagement Terms & Service Agreement",
      render: () => <EngagementTerms />,
    },
    {
      id: "fees",
      title: "Incorporation Package & Optional Add‑ons",
      render: () => <FeesEstimator />,
    },
    {
      id: "invoice",
      title: "Invoice — Preview",
      render: () => <InvoicePreview />,
    },
    {
      id: "payment",
      title: "Payment",
      render: () => <PaymentStep />,
    },
    {
      id: "review",
      title: "Review & e‑Sign",
      render: () => <ReviewStep />,
    },
    {
      id: "congrats",
      title: "Confirmation",
      render: () => <CongratsStep />,
    },
  ],
};

// ----- Default Export: Demo page (drop-in)
export default function ConfigDrivenHKFormDemo() {
  // stash parties in window for test helper ownershipOK()
  const setParties = useSetAtom(partiesAtom);
  React.useEffect(() => {
    (window as any).__parties_for_test__ = [ { name: "Jane Doe", email: "jane@example.com", phone: "+852 1234 5678", isCorp: false, isDirector: true, shares: 10000, invited: false } ];
    setParties((window as any).__parties_for_test__);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <ConfigForm config={hkIncorpConfig} />;
}
