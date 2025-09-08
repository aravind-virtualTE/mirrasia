import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
import { Copy, Banknote, Building2,  ShieldCheck, Info, ReceiptText, Mail, Phone, CheckCircle2, Circle } from "lucide-react";


export type Party = {
  name: string;
  email?: string;
  phone?: string;
  isCorp?: boolean;
  isDirector?: boolean;
  shares?: number;
  invited?: boolean;
  typeOfShare?: string;
};

export type OnboardingRecord = {
  _id: string;
  stepIdx: number; // 0-based
  form: {
    applicantName?: string;
    email?: string;
    phone?: string;
    name1?: string; name2?: string; name3?: string;
    cname1?: string; cname2?: string;
    roles?: string[];
    sns?: string; snsId?: string;
    legalAndEthicalConcern?: string; // yes/no
    q_country?: string; // yes/no
    sanctionsExposureDeclaration?: string; // yes/no
    crimeaSevastapolPresence?: string; // yes/no
    russianEnergyPresence?: string; // yes/no
    finYrEnd?: string;
    bookKeepingCycle?: string;
    xero?: string; // Yes/No
    softNote?: string;
    payMethod?: string; // bank/card/fps/...
    paymentIntentId?: string;
    bankRef?: string;
    uploadReceiptUrl?: string;
    truthfulnessDeclaration?: boolean;
    legalTermsAcknowledgment?: boolean;
    compliancePreconditionAcknowledgment?: boolean;
    eSign?: string;
    dcp?: string;
    industry?: string;
    purpose?: string[];
    bizdesc?: string;
    currency?: string;
    capAmount?: string; // declared share capital amount
    shareCount?: string; // total shares
  };
  parties?: Party[];
  optionalFeeIds?: string[];
  createdAt?: string; updatedAt?: string;
  ok?: boolean;
};

const steps = [
  "Applicant",
  "Company Names",
  "Business Details",
  "Parties",
  "Capital",
  "Compliance",
  "KYC",
  "Payment",
  "e‑Sign",
  "Review"
] as const;

function pctFromStep(stepIdx: number) {
  const maxIdx = steps.length - 1; // 9
  const clamped = Math.max(0, Math.min(stepIdx, maxIdx));
  return Math.round((clamped / maxIdx) * 100);
}

function fmtDate(s?: string) {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "—";
  // ISO without seconds
  return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function FallbackAvatar({ name }: { name?: string }) {
  const initials = (name?.trim().split(/\s+/).map(n => n[0]).slice(0, 2).join("") || "?" ).toUpperCase();
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

function Copyable({ text, className }: { text?: string; className?: string }) {
  if (!text) return <span className="text-muted-foreground">—</span>;
  return (
    <div className={"group inline-flex items-center gap-2 " + (className || "") }>
      <span className="font-medium text-sm break-all">{text}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigator.clipboard.writeText(text)}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Copy</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
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
          const state = idx < stepIdx ? "done" : idx === stepIdx ? "current" : "todo";
          return (
            <div key={label} className="flex items-center gap-2">
              <div className={
                "h-2.5 w-2.5 rounded-full " +
                (state === "done" ? "bg-primary" : state === "current" ? "bg-primary/40 ring-2 ring-primary/50" : "bg-muted")
              } />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PartyRow({ p, totalShares }: { p: Party; totalShares?: number }) {
  const pct = p.shares && totalShares ? Math.round((p.shares / totalShares) * 1000) / 10 : undefined;
  return (
    <TableRow>
      <TableCell className="py-3">
        <div className="flex items-center gap-2">
          <FallbackAvatar name={p.name} />
          <div className="grid">
            <div className="font-medium leading-tight">{p.name || "—"}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              {p.email && (<span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{p.email}</span>)}
              {p.phone && (<span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{p.phone}</span>)}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="py-3">
        <Badge variant="secondary" className="mr-2">{p.isCorp ? "Corporate" : "Individual"}</Badge>
        {p.isDirector && <Badge variant="outline">Director</Badge>}
      </TableCell>
      <TableCell className="py-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{p.typeOfShare || "—"}</Badge>
          <span className="text-sm">{p.shares ?? "—"}</span>
          {typeof pct === "number" && (
            <span className="text-xs text-muted-foreground">({pct}%)</span>
          )}
        </div>
      </TableCell>
      <TableCell className="py-3">
        <Badge variant={p.invited ? "default" : "outline"} className={p.invited ? "bg-emerald-600 hover:bg-emerald-600" : "text-muted-foreground"}>
          {p.invited ? "Invite sent" : "Not invited"}
        </Badge>
      </TableCell>
    </TableRow>
  );
}

export default function MirrSummary({ record }: { record?: OnboardingRecord }) {
  // Example fallback for local preview: paste your JSON object here or pass via props
  const data: OnboardingRecord = record ?? {
    _id: "68bedb5ee164e67b5fd3afa8",
    stepIdx: 9,
    form: {
      applicantName: "test",
      email: "quauppaconovo-9088@yopmail.com",
      phone: "1234567890",
      name1: "TestInc Ltd",
      cname1: "cname 1",
      roles: ["Shareholder", "Authorized"],
      sns: "WeChat",
      snsId: "123532425",
      legalAndEthicalConcern: "no",
      q_country: "no",
      sanctionsExposureDeclaration: "no",
      crimeaSevastapolPresence: "no",
      russianEnergyPresence: "no",
      finYrEnd: "March 31",
      bookKeepingCycle: "Half-annually",
      xero: "No",
      softNote: "test1",
      payMethod: "bank",
      paymentIntentId: "",
      bankRef: "test1234",
      uploadReceiptUrl: "https://mirrasia-regdoc.s3.ap-southeast-1.amazonaws.com/businessMan_1757338663687.jpg",
      truthfulnessDeclaration: true,
      legalTermsAcknowledgment: true,
      compliancePreconditionAcknowledgment: true,
      eSign: "Esign Aravind",
      dcp: "test1",
      industry: "462 — Wholesale trade (non-specialized)",
      purpose: ["assetMgmt"],
      bizdesc: "test",
      currency: "USD",
      capAmount: "10000",
      shareCount: "10000",
    },
    parties: [
      { name: "test1", email: "test@gmail.com", phone: "+91234513132", isCorp: false, isDirector: false, shares: 10000, invited: false, typeOfShare: "ordinary" },
    ],
    optionalFeeIds: ["reg_office"],
    createdAt: "2025-09-08T13:28:30.068Z",
    updatedAt: "2025-09-08T13:54:08.023Z",
    ok: true,
  };

  const f = data.form || ({} as OnboardingRecord["form"]);
  const pct = pctFromStep(data.stepIdx);
  const currentStep = steps[Math.min(Math.max(data.stepIdx, 0), steps.length - 1)];
  const totalShares = Number(f.shareCount) || (data.parties?.reduce((a, b) => a + (b.shares || 0), 0) ?? 0) || undefined;
  const isComplete = pct === 100;

  return (
    <div className="mx-auto grid max-w-7xl gap-6 p-4 lg:grid-cols-3">
      {/* LEFT: Overview & Company */}
      <div className="lg:col-span-2 grid gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl">{f.name1 || f.cname1 || "Untitled Company"}</CardTitle>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge variant={isComplete ? "default" : "secondary"} className={isComplete ? "bg-emerald-600 hover:bg-emerald-600" : ""}>
                    {isComplete ? "Completed" : `Step ${data.stepIdx + 1} / ${steps.length}`}
                  </Badge>
                  <Badge variant="outline" className="text-muted-foreground">{currentStep}</Badge>
                  {data.ok && (
                    <Badge variant="outline" className="gap-1"><ShieldCheck className="h-3.5 w-3.5" />OK</Badge>
                  )}
                  <Badge variant="outline" className="gap-1"><Info className="h-3.5 w-3.5" />ID: {data._id.slice(-6)}</Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-5">
            <StepRail stepIdx={data.stepIdx} />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <LabelValue label="Applicant">
                <div className="flex items-center gap-2">
                  <FallbackAvatar name={f.applicantName} />
                  <span className="font-medium">{f.applicantName || "—"}</span>
                </div>
              </LabelValue>
              <LabelValue label="Contact">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  {f.email && (<span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{f.email}</span>)}
                  {f.phone && (<span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{f.phone}</span>)}
                </div>
              </LabelValue>

              <LabelValue label="Alt / Local Names">
                <div className="flex flex-wrap gap-2">
                  {[f.name2, f.name3, f.cname1, f.cname2].filter(Boolean).length ? (
                    [f.name2, f.name3, f.cname1, f.cname2].filter(Boolean).map((n, i) => (
                      <Badge key={String(n) + i} variant="secondary">{n}</Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </LabelValue>

              <LabelValue label="Roles">
                <div className="flex flex-wrap gap-2">
                  {(f.roles?.length ? f.roles : ["—"]).map((r, i) => (
                    <Badge key={r + i} variant="outline">{r}</Badge>
                  ))}
                </div>
              </LabelValue>

              <LabelValue label="Industry">
                {f.industry || "—"}
              </LabelValue>
              <LabelValue label="Purpose">
                <div className="flex flex-wrap gap-2">
                  {(f.purpose?.length ? f.purpose : ["—"]).map((p, i) => (
                    <Badge key={p + i} variant="secondary">{p}</Badge>
                  ))}
                </div>
              </LabelValue>

              <LabelValue label="Business Description">{f.bizdesc || "—"}</LabelValue>
              <LabelValue label="Notes">{f.softNote || "—"}</LabelValue>
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <LabelValue label="Currency"><Badge variant="outline">{f.currency || "—"}</Badge></LabelValue>
              <LabelValue label="Declared Capital"><Copyable text={f.capAmount} /></LabelValue>
              <LabelValue label="Total Shares"><Copyable text={f.shareCount} /></LabelValue>
              <LabelValue label="Financial Year End">{f.finYrEnd || "—"}</LabelValue>
              <LabelValue label="Bookkeeping Cycle">{f.bookKeepingCycle || "—"}</LabelValue>
              <LabelValue label="Xero">{f.xero || "—"}</LabelValue>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LabelValue label="Created">{fmtDate(data.createdAt)}</LabelValue>
              <LabelValue label="Updated">{fmtDate(data.updatedAt)}</LabelValue>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shareholding & Parties</CardTitle>
          </CardHeader>
          <CardContent>
            {data.parties && data.parties.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[45%]">Party</TableHead>
                      <TableHead className="w-[20%]">Type / Roles</TableHead>
                      <TableHead className="w-[20%]">Shares</TableHead>
                      <TableHead className="w-[15%]">Invite</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.parties.map((p, i) => (
                      <PartyRow key={p.name + i} p={p} totalShares={totalShares} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">No parties added.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* RIGHT: Payments, Compliance, Attachments */}
      <div className="grid gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Banknote className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">Payment</CardTitle>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="gap-1"><ReceiptText className="h-3.5 w-3.5" />{(f.payMethod || "").toUpperCase() || "—"}</Badge>
                  {f.bankRef && <Badge variant="outline" className="gap-1">Ref: {f.bankRef}</Badge>}
                  {f.paymentIntentId && <Badge variant="outline" className="gap-1">PI: {f.paymentIntentId.slice(0, 10)}…</Badge>}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <div className="text-xs text-muted-foreground">Receipt / Proof</div>
              {f.uploadReceiptUrl ? (
                <a href={f.uploadReceiptUrl} target="_blank" rel="noreferrer" className="group relative block overflow-hidden rounded-md border">
                  <img src={f.uploadReceiptUrl} alt="Payment receipt" className="h-44 w-full object-cover transition-transform duration-200 group-hover:scale-[1.01]" />
                </a>
              ) : (
                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">No file uploaded</div>
              )}
            </div>

            {data.optionalFeeIds && data.optionalFeeIds.length > 0 && (
              <div className="grid gap-2">
                <div className="text-xs text-muted-foreground">Add‑ons</div>
                <div className="flex flex-wrap gap-2">
                  {data.optionalFeeIds.map((id) => (
                    <Badge key={id} variant="outline">{id}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

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
              <LabelValue label="Truthfulness">
                <BoolPill value={!!f.truthfulnessDeclaration} />
              </LabelValue>
              <LabelValue label="Legal Terms">
                <BoolPill value={!!f.legalTermsAcknowledgment} />
              </LabelValue>
              <LabelValue label="Compliance Precondition">
                <BoolPill value={!!f.compliancePreconditionAcknowledgment} />
              </LabelValue>
              <LabelValue label="e‑Sign">
                {f.eSign || "—"}
              </LabelValue>
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-3">
              <div className="text-xs text-muted-foreground">Sanctions / Restrictions</div>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span>Legal or Ethical Concern</span>
                  <Badge variant={f.legalAndEthicalConcern === "yes" ? "destructive" : "outline"} className={f.legalAndEthicalConcern === "yes" ? "" : "text-muted-foreground"}>
                    {f.legalAndEthicalConcern?.toUpperCase() || "—"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Questioned Country</span>
                  <Badge variant={f.q_country === "yes" ? "destructive" : "outline"} className={f.q_country === "yes" ? "" : "text-muted-foreground"}>
                    {f.q_country?.toUpperCase() || "—"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Sanctions Exposure</span>
                  <Badge variant={f.sanctionsExposureDeclaration === "yes" ? "destructive" : "outline"} className={f.sanctionsExposureDeclaration === "yes" ? "" : "text-muted-foreground"}>
                    {f.sanctionsExposureDeclaration?.toUpperCase() || "—"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Crimea/Sevastopol Presence</span>
                  <Badge variant={f.crimeaSevastapolPresence === "yes" ? "destructive" : "outline"} className={f.crimeaSevastapolPresence === "yes" ? "" : "text-muted-foreground"}>
                    {f.crimeaSevastapolPresence?.toUpperCase() || "—"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Russian Energy Presence</span>
                  <Badge variant={f.russianEnergyPresence === "yes" ? "destructive" : "outline"} className={f.russianEnergyPresence === "yes" ? "" : "text-muted-foreground"}>
                    {f.russianEnergyPresence?.toUpperCase() || "—"}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <LabelValue label="Social App">{f.sns || "—"}</LabelValue>
              <LabelValue label="Handle / ID">{f.snsId || "—"}</LabelValue>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
