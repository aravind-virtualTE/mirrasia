/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Banknote, Building2, ShieldCheck, ReceiptText, Mail, Phone, CheckCircle2, Circle, Save } from "lucide-react";

// ----------------- Types -----------------
export type PIFRecord = {
  _id?: string;
  stepIdx?: number;
  email?: string;
  contactName?: string;
  phone?: string;
  foundationNameEn?: string;
  foundationNameEs?: string;
  altName1?: string;
  altName2?: string;
  purposeSummary?: string;
  industries?: string[];
  bizDesc?: string;
  createdAt?: string;
  updatedAt?: string;

  // Declarations
  truthOk?: boolean;
  taxOk?: boolean;
  privacyOk?: boolean;
  legalAndEthicalConcern?: "yes" | "no" | "";
  q_country?: "yes" | "no" | "";
  sanctionsExposureDeclaration?: "yes" | "no" | "";
  crimeaSevastapolPresence?: "yes" | "no" | "";
  russianEnergyPresence?: "yes" | "no" | "";
  signName?: string;
  signDate?: string;

  // Payment
  payMethod?: string;              // "card" | "bank" | etc.
  paymentStatus?: "paid" | "unpaid" | "rejected" | string;
  bankRef?: string;
  expiresAt?: string;              // ISO
  pricing?: { currency?: string; total?: number } | null;
  stripeLastStatus?: string;       // "succeeded" etc.
  stripeReceiptUrl?: string;
  uploadReceiptUrl?: string;

  // System fields
  incorporationStatus?: string;
};

// ----------------- Constants & helpers -----------------
const steps = [
  "Applicant",
  "Names",
  "Business",
  "Council",
  "Beneficiaries",
  "Declarations",
  "Payment",
  "Review"
];

const STATUS_OPTIONS = ["Pending", "KYC Review", "Docs Requested", "Incorporated", "On Hold", "Cancelled"]; 

function pctFromStep(stepIdx: number) {
  const maxIdx = steps.length - 1;
  const clamped = Math.max(0, Math.min(stepIdx ?? 0, maxIdx));
  return Math.round((clamped / maxIdx) * 100);
}

function fmtDate(s?: string | Date | null) {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function FallbackAvatar({ name }: { name?: string }) {
  const initials = (name?.trim().split(/\s+/).map(n => n[0]).slice(0, 2).join("") || "?").toUpperCase();
  return (
    <Avatar className="h-8 w-8">
      <AvatarFallback className="bg-muted/40 text-muted-foreground">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

function LabelValue({ label, children }: React.PropsWithChildren<{ label: string }>) {
  return (
    <div className="grid gap-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium break-words">{children || "—"}</div>
    </div>
  );
}

function BoolPill({ value, trueText = "Yes", falseText = "No" }: { value?: boolean; trueText?: string; falseText?: string }) {
  const isTrue = !!value;
  return (
    <Badge variant={isTrue ? "default" : "outline"} className={isTrue ? "bg-emerald-600 hover:bg-emerald-600" : "text-muted-foreground"}>
      {isTrue ? <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> : <Circle className="mr-1 h-3.5 w-3.5" />}
      {isTrue ? trueText : falseText}
    </Badge>
  );
}

function StepRail({ stepIdx }: { stepIdx: number }) {
  const pct = pctFromStep(stepIdx);
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Progress</div>
        <div className="text-sm font-semibold">{pct}%</div>
      </div>
      <Progress value={pct} className="h-2" />
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {steps.map((label, idx) => {
          const state = idx < (stepIdx ?? 0) ? "done" : idx === (stepIdx ?? 0) ? "current" : "todo";
          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className={
                  "h-2.5 w-2.5 rounded-full " +
                  (state === "done" ? "bg-primary" : state === "current" ? "bg-primary/40 ring-2 ring-primary/50" : "bg-muted")
                }
              />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ----------------- Test cases -----------------
// 1) Upload receipt case (user-provided)
const SAMPLE_UPLOAD: PIFRecord = {
  _id: "68dbd7458e08577071bec178",
  stepIdx: 0,
  email: "testppifuser@gmail.com",
  contactName: "ppifTest User",
  phone: "+981234123151",
  foundationNameEn: "PPifTest Foundation",
  foundationNameEs: "",
  altName1: "PPifTest2 Foundation",
  altName2: "PPifTest3 Foundation",
  purposeSummary: "Hold and manage investment interests",
  industries: ["trading"],
  bizDesc: "test activities",
  truthOk: true,
  taxOk: true,
  privacyOk: true,
  legalAndEthicalConcern: "no",
  q_country: "no",
  sanctionsExposureDeclaration: "no",
  crimeaSevastapolPresence: "no",
  russianEnergyPresence: "no",
  signName: "asteasdfas",
  signDate: "2025-09-30T00:00:00.000Z",
  payMethod: "bank",
  paymentStatus: "unpaid",
  bankRef: "teset1234",
  pricing: { currency: "USD", total: 6800 },
  stripeLastStatus: "",
  stripeReceiptUrl: "",
  uploadReceiptUrl: "https://mirrasia-regdoc.s3.ap-southeast-1.amazonaws.com/logo black text (420 Ã 60px)_1759238348229.png",
  expiresAt: "2025-10-02T13:18:46.279Z",
  createdAt: "2025-09-30T13:12:37.137Z",
  updatedAt: "2025-09-30T13:19:39.034Z",
  incorporationStatus: "Pending",
};

// 2) Stripe-paid case (derived from user's first sample)
const SAMPLE_STRIPE: PIFRecord = {
  _id: "68da8645aff54baace73511e",
  stepIdx: 0,
  email: "test@gmail.com",
  contactName: "test per1",
  phone: "1234567890",
  foundationNameEn: "test incFoundation",
  altName1: "tes1 inc Foundation",
  altName2: "test3 inc Foundation",
  purposeSummary: "Hold real estate, financial assets, equities, and digital assets; establish asset protection via a foundation",
  industries: ["trading"],
  bizDesc: "test",
  truthOk: true,
  taxOk: true,
  privacyOk: true,
  legalAndEthicalConcern: "no",
  q_country: "no",
  sanctionsExposureDeclaration: "no",
  crimeaSevastapolPresence: "no",
  russianEnergyPresence: "no",
  signName: "sadsfdafsadf",
  signDate: "2025-09-29T00:00:00.000Z",
  payMethod: "card",
  paymentStatus: "paid",
  pricing: { currency: "USD", total: 6300 },
  stripeLastStatus: "succeeded",
  stripeReceiptUrl: "https://pay.stripe.com/receipts/payment/CAcaFwoVYWNjdF8xRHB3U3ZLczdONjI3dzlMKOj77sYGMgarT8m5rk06LBYaP4y3Au_0PbJskl9Qo5SsSHGUHCZUvMALNkVpxHTgZGwuotB3vrcGMS8h",
  bankRef: "",
  uploadReceiptUrl: "",
  expiresAt: "2025-10-02T11:14:03.770Z",
  createdAt: "2025-09-29T13:14:45.376Z",
  updatedAt: "2025-09-30T11:25:33.222Z",
  incorporationStatus: "Pending",
};

// 3) Minimal/edge case: ensures UI doesn't crash when most fields are missing
const SAMPLE_MINIMAL: PIFRecord = {
  _id: "demo-minimal",
  stepIdx: 3,
  email: "",
  contactName: "",
  paymentStatus: "unpaid",
};

// Select default test case
const CURRENT_CASE: "upload" | "stripe" | "minimal" = "upload"; // <- change here to test

export default function PPifCompDetail({id}: { id: string }) {
  // Local state so inline controls still work (expiresAt/status)
  console.log("PPifCompDetail---id",id)
  const [data, setData] = React.useState<PIFRecord>(
    CURRENT_CASE === "stripe" ? SAMPLE_STRIPE : CURRENT_CASE === "minimal" ? SAMPLE_MINIMAL : SAMPLE_UPLOAD
  );
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : { role: "user" };

  // Safe field map (optional chaining to avoid runtime errors)
  const f = React.useMemo(() => ({
    applicantName: data?.contactName || "",
    email: data?.email || "",
    phone: data?.phone || "",
    name1: data?.foundationNameEn || "",
    name2: data?.foundationNameEs || "",
    name3: data?.altName1 || "",
    cname1: data?.altName2 || "",
    industry: data?.industries?.join(", ") || "",
    purpose: data?.purposeSummary ? [data?.purposeSummary] : [],
    bizdesc: data?.bizDesc || "",

    currency: data?.pricing?.currency,
    finalAmount: data?.pricing?.total,

    payMethod: data?.payMethod || "",
    bankRef: data?.bankRef || "",
    stripeLastStatus: data?.stripeLastStatus || "",
    stripeReceiptUrl: data?.stripeReceiptUrl || "",
    uploadReceiptUrl: data?.uploadReceiptUrl || "",

    truthfulnessDeclaration: !!data?.truthOk,
    legalTermsAcknowledgment: !!data?.privacyOk,
    compliancePreconditionAcknowledgment: !!data?.taxOk,

    legalAndEthicalConcern: data?.legalAndEthicalConcern || "",
    q_country: data?.q_country || "",
    sanctionsExposureDeclaration: data?.sanctionsExposureDeclaration || "",
    crimeaSevastapolPresence: data?.crimeaSevastapolPresence || "",
    russianEnergyPresence: data?.russianEnergyPresence || "",

    eSign: data?.signName ? `${data.signName} • ${fmtDate(data?.signDate)}` : "",
  }), [data]);

  // Local patch helper for interactive fields
  const patchCompany = (key: keyof PIFRecord, value: any) => setData(prev => ({ ...prev, [key]: value }));

  const onSave = async () => {
    setIsSaving(true);
    // simulate save delay
    await new Promise(res => setTimeout(res, 500));
    setIsSaving(false);
  };

  return (
     <section>
      <div className="mx-auto grid max-w-7xl gap-6 p-4 lg:grid-cols-3 pb-24">
        {/* LEFT */}
        <div className="lg:col-span-2 grid gap-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {isEditing ? (
                        <Input
                          value={f.name1 || ""}
                          onChange={(e) => patchCompany("foundationNameEn", e.target.value)}
                          className="h-8 text-base"
                          placeholder="Foundation Name"
                        />
                      ) : (
                        <CardTitle className="text-xl truncate">
                          {f.name1 || f.cname1 || "Untitled Foundation"}
                        </CardTitle>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="text-muted-foreground">{steps[data.stepIdx ?? 0] || "—"}</Badge>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Incorporation Status</span>
                          {user.role !== "user" ? (
                            <Select
                              value={data?.incorporationStatus || ""}
                              onValueChange={(val) => patchCompany("incorporationStatus", val)}
                            >
                              <SelectTrigger className="h-7 w-[220px]">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {STATUS_OPTIONS.map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant="default">{data?.incorporationStatus || "Pending"}</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Edit toggle */}
                    <div className="flex shrink-0 items-center gap-2">
                      {!isEditing ? (
                        <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>Edit</Button>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="grid gap-5">
              <StepRail stepIdx={data.stepIdx ?? 0} />

              {/* Basic info (editable) */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <LabelValue label="Applicant">
                  <div className="flex items-center gap-2">
                    <FallbackAvatar name={f.applicantName} />
                    <span className="font-medium">{f.applicantName || "—"}</span>
                  </div>
                </LabelValue>

                <LabelValue label="Contact">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="text-sm">{f.email || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5" />
                      <span className="text-sm">{f.phone || "—"}</span>
                    </div>
                  </div>
                </LabelValue>

                <LabelValue label="Alt / Local Names">
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Input value={f.name2 || ""} onChange={(e) => patchCompany("foundationNameEs", e.target.value)} placeholder="Alt Name (ES)" className="h-8" />
                      <Input value={f.name3 || ""} onChange={(e) => patchCompany("altName1", e.target.value)} placeholder="Alt Name 2" className="h-8" />
                      <Input value={f.cname1 || ""} onChange={(e) => patchCompany("altName2", e.target.value)} placeholder="Alt Name 3" className="h-8" />
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {[f.name2, f.name3, f.cname1].filter(Boolean).length ? (
                        [f.name2, f.name3, f.cname1].filter(Boolean).map((n, i) => (
                          <Badge key={String(n) + i} variant="secondary">
                            {n as string}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  )}
                </LabelValue>

                <LabelValue label="Industry">{f.industry || "—"}</LabelValue>
                <LabelValue label="Purpose">
                  <div className="flex flex-wrap gap-2">
                    {(f.purpose?.length ? f.purpose : ["—"]).map((p, i) => (
                      <Badge key={p + i} variant="secondary">{p}</Badge>
                    ))}
                  </div>
                </LabelValue>
                <LabelValue label="Business Description">{f.bizdesc || "—"}</LabelValue>
              </div>

              <Separator />
             {/* please add more fields about  */}

              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LabelValue label="Created">{fmtDate(data.createdAt)}</LabelValue>
                <LabelValue label="Updated">{fmtDate(data.updatedAt)}</LabelValue>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="grid gap-6">
          {/* Payment */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Banknote className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">Payment</CardTitle>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <ReceiptText className="h-3.5 w-3.5" />
                      {(f.payMethod || "").toUpperCase() || "—"}
                    </Badge>
                    {f.bankRef && <Badge variant="outline" className="gap-1">Ref: {f.bankRef}</Badge>}
                    {data.paymentStatus === "paid" && f.stripeLastStatus === "succeeded" && f.stripeReceiptUrl && (
                      <Badge className="bg-emerald-600 hover:bg-emerald-600">Stripe Paid</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="grid gap-4">
              {/* Receipt / Proof */}
              <div className="grid gap-2">
                <div className="text-xs text-muted-foreground">Receipt / Proof</div>

                {/* (A) Stripe success → green box w/ receipt link */}
                {data.paymentStatus === "paid" && f.stripeLastStatus === "succeeded" && f.stripeReceiptUrl ? (
                  <div className="rounded-md border bg-emerald-50 p-4 text-emerald-800">
                    <div className="text-sm font-medium">Payment successful via Stripe.</div>
                    <a href={f.stripeReceiptUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center text-sm underline">
                      View Stripe Receipt
                    </a>
                  </div>
                ) : f.uploadReceiptUrl ? (
                  // (B) Bank transfer or other → show uploaded proof image + admin status control
                  <div className="space-y-3">
                    <a href={f.uploadReceiptUrl} target="_blank" rel="noreferrer" className="group relative block overflow-hidden rounded-md border">
                      <img src={f.uploadReceiptUrl} alt="Payment receipt" className="h-44 w-full object-cover transition-transform duration-200 group-hover:scale-[1.01]" />
                    </a>

                    {user.role !== "user" && (
                      <div className="flex items-center gap-3">
                        <Label className="text-sm font-medium">Payment Status:</Label>
                        <Select value={data?.paymentStatus || "unpaid"} onValueChange={(val) => patchCompany("paymentStatus", val as any)}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unpaid">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">No file uploaded</div>
                )}
              </div>

              {/* Session details incl. editable expiresAt */}
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Amount</Label>
                  <div className="col-span-3 text-sm font-medium">
                    {typeof f.finalAmount === "number" ? `${f.finalAmount} ${f.currency || "USD"}` : "—"}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expiresAt" className="text-right">Expires</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={data.expiresAt ? String(data.expiresAt).slice(0, 10) : ""}
                    onChange={(e) => patchCompany("expiresAt", e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance & Declarations */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">Compliance & Declarations</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <LabelValue label="Truthfulness"><BoolPill value={!!f.truthfulnessDeclaration} /></LabelValue>
                <LabelValue label="Legal Terms"><BoolPill value={!!f.legalTermsAcknowledgment} /></LabelValue>
                <LabelValue label="Compliance Precondition"><BoolPill value={!!f.compliancePreconditionAcknowledgment} /></LabelValue>
                <LabelValue label="e-Sign">{f.eSign || "—"}</LabelValue>
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-3">
                <div className="text-xs text-muted-foreground">Sanctions / Restrictions</div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  {([
                    ["Legal or Ethical Concern", "legalAndEthicalConcern"],
                    ["Questioned Country", "q_country"],
                    ["Sanctions Exposure", "sanctionsExposureDeclaration"],
                    ["Crimea/Sevastopol Presence", "crimeaSevastapolPresence"],
                    ["Russian Energy Presence", "russianEnergyPresence"],
                  ] as const).map(([label, key]) => (
                    <div key={key} className="flex items-center justify-between gap-3">
                      <span>{label}</span>
                      <Badge
                        variant={(f as any)[key] === "yes" ? "destructive" : "outline"}
                        className={(f as any)[key] === "yes" ? "" : "text-muted-foreground"}
                      >
                        {(f as any)[key]?.toUpperCase() || "—"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sticky save bar */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 p-3">
            <div className="text-xs text-muted-foreground">
              Status: <strong>{data?.incorporationStatus || "Pending"}</strong>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={onSave}>
                <Save className="mr-1 h-4 w-4" />  {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
