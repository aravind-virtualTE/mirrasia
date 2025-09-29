/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react"
import { useAtom } from "jotai"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Info, AlertCircle, Users, Trash, CheckCircle2, Lock } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { t } from "i18next"
import { createOrUpdatePaFIncorpo, FieldBase, FieldOption, FormConfig, initialPIF, PanamaPIFForm, pifFormAtom, StepConfig } from "./PaState"
import { computePIFGrandTotal, computePIFSetupTotal, money } from "./PaConstants"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { createInvoicePaymentIntent, deleteIncorpoPaymentBankProof, updateCorporateInvoicePaymentIntent, uploadIncorpoPaymentBankProof } from "../NewHKForm/hkIncorpo"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { StripeSuccessInfo } from "../NewHKForm/NewHKIncorporation"
import { loadStripe } from "@stripe/stripe-js";
import jwtDecode from "jwt-decode"
import { TokenData } from "@/middleware/ProtectedRoutes"
import { useNavigate } from "react-router-dom"
import { Trans } from "react-i18next"
import { FPSForm } from "../payment/FPSForm"

const STRIPE_CLIENT_ID =
  import.meta.env.VITE_STRIPE_DETAILS || process.env.REACT_APP_STRIPE_DETAILS;

const stripePromise = loadStripe(STRIPE_CLIENT_ID);


function TopBar({ title, totalSteps, idx }: { title: string; totalSteps: number; idx: number }) {
  const pct = Math.round(((idx + 1) / totalSteps) * 100);
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="text-lg sm:text-xl font-extrabold truncate">{t(title, "Company Incorporation — Panama Private Interest Foundation")}</div>
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

const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(" ")
type StepLike = { id: string; title: string }

function SidebarPanama({ steps, idx, goto, canProceedFromCurrent, }: {
  steps: StepLike[]
  idx: number
  goto: (i: number) => void
  canProceedFromCurrent: boolean
}) {
  const canJumpTo = (target: number) => {
    if (target === idx) return true
    if (target < idx) return true
    return canProceedFromCurrent               // forward only if current step valid
  }

  const onTryGoto = (target: number) => {
    if (target === idx) return
    if (target < idx) {
      goto(target)
      return
    }
    if (!canProceedFromCurrent) {
      toast({
        title: t("newHk.sidebar.toasts.completeStepTitle", "Please complete this step"),
        description: t(
          "newHk.sidebar.toasts.completeStepDesc",
          "Fill the required fields before moving forward."
        ),
      })
      return
    }
    goto(target)
  }
  return (
    <aside className="space-y-4 sticky top-0 h-[calc(100vh-2rem)] overflow-auto p-0">
      {/* Brand / badges like HK */}
      <div className="flex items-center gap-2 mb-1">
        <div className="w-5 h-5 rounded bg-red-600 shrink-0" />
        <div className="text-[11px] sm:text-[13px] tracking-wide font-semibold truncate">
          {t("newHk.sidebar.brand", "MIRR ASIA · PANAMA")}
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        <div className="flex flex-wrap gap-1">
          <span className="inline-flex items-center gap-1 border rounded-full px-2 py-1 text-[10px] sm:text-xs">
            {t("newHk.sidebar.badges.ssl", "SSL Secured")}
          </span>
          <span className="inline-flex items-center gap-1 border rounded-full px-2 py-1 text-[10px] sm:text-xs">
            {t("newHk.sidebar.badges.registry", "Registrar-ready")}
          </span>
          <span className="inline-flex items-center gap-1 border rounded-full px-2 py-1 text-[10px] sm:text-xs">
            {t("newHk.sidebar.badges.aml", "KYC/AML")}
          </span>
        </div>
      </div>
      {/* Steps */}
      <div className="space-y-1 mt-3">
        {steps.map((s, i) => {
          const enabled = canJumpTo(i)
          const isCurrent = i === idx
          const isDone = i < idx
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
                  {i + 1}. {t(s.title as string, s.title as string)}
                </div>
                <div className="shrink-0 flex items-center gap-1">
                  {isDone && (
                    <Badge variant="secondary" className="text-[10px] sm:text-xs flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {t("newHk.sidebar.done", "Done")}
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
          )
        })}
        <p className="text-xs text-muted-foreground mt-2">
          {t("newHk.sidebar.needHelp", "Need help? ")}
          <button
            className="text-sky-600 underline-offset-2 hover:underline touch-manipulation"
            onClick={() => toast({ title: "Contact us", description: "We’ll follow up shortly." })}
          >
            {t("newHk.sidebar.chatCta", "Chat with us")}
          </button>
        </p>
      </div>
    </aside>
  )
}

/* ---------- Compact tokens ---------- */
const inputSm = "h-9 text-sm"
const labelSm = "text-[13px] font-medium"
const gapSm = "gap-1.5"

/* ---------- Utils ---------- */
function sanitizeOptions(opts?: FieldOption[]) {
  return (opts || []).filter((o) => typeof o.value === "string" && o.value !== "")
}
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
// Simple international phone check: starts with + or digit, contains 7–20 digits total
const phoneOk = (v: string) => v.trim() === "" || /^[+()\-.\s\d]{7,}$/.test(v)

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border bg-muted/40 p-2.5">
      <div className="flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div className="text-[13px] leading-relaxed text-foreground">{children}</div>
      </div>
    </div>
  )
}

/* ---------- Field Renderer (compact) ---------- */
function Field({ field }: { field: FieldBase }) {
  const [form, setForm] = useAtom(pifFormAtom)
  const span = field.colSpan === 2 ? "md:col-span-2" : ""
  const id = String(field.name)
  const set = (name: string, value: any) => setForm({ ...form, [name]: value })

  const labelEl = (
    <div className="flex items-center gap-2">
      <Label htmlFor={id} className={labelSm}>
        {field.label}
      </Label>
      {field.required ? <span className="text-destructive">*</span> : null}
      {field.tooltip ? (
        <span title={field.tooltip} className="text-muted-foreground/80">
          <Info className="h-4 w-4" />
        </span>
      ) : null}
    </div>
  )
  const hintEl = field.hint ? <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">{field.hint}</p> : null

  switch (field.type) {
    case "text":
    case "email":
    case "number":
      return (
        <div className={`grid ${gapSm} ${span}`}>
          {labelEl}
          <Input
            id={id}
            className={inputSm}
            type={field.type === "number" ? "number" : field.type}
            placeholder={field.placeholder}
            value={(form as any)[id] ?? ""}
            onChange={(e) => set(id, e.target.value)}
          />
          {hintEl}
        </div>
      )
    case "textarea":
      return (
        <div className={`grid ${gapSm} ${span}`}>
          {labelEl}
          <Textarea
            id={id}
            rows={field.rows ?? 4}
            placeholder={field.placeholder}
            value={(form as any)[id] ?? ""}
            onChange={(e) => set(id, e.target.value)}
            className="text-sm resize-y"
          />
          {hintEl}
        </div>
      )
    case "select":
      return (
        <div className={`grid ${gapSm} ${span}`}>
          {labelEl}
          <Select value={String((form as any)[id] ?? "")} onValueChange={(v) => set(id, v)}>
            <SelectTrigger id={id} className={inputSm}>
              <SelectValue placeholder={field.placeholder || "Select"} />
            </SelectTrigger>
            <SelectContent>
              {sanitizeOptions(field.options).map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hintEl}
        </div>
      )
    case "checkbox":
      return (
        <div className={`flex items-start gap-3 ${span}`}>
          <Checkbox id={id} checked={Boolean((form as any)[id])} onCheckedChange={(v) => set(id, Boolean(v))} />
          <div className="grid gap-1">
            <Label htmlFor={id} className={`${labelSm} leading-relaxed cursor-pointer`}>
              {field.label}
            </Label>
            {hintEl}
          </div>
        </div>
      )
    case "radio-group":
      return (
        <div className={`grid gap-3 ${span}`}>
          {labelEl}
          <RadioGroup value={String((form as any)[id] ?? "")} onValueChange={(v) => set(id, v)} className="flex flex-col gap-2.5">
            {(field.options || []).map((o) => (
              <label key={o.value} className="flex items-start gap-2 text-sm cursor-pointer group">
                <RadioGroupItem value={o.value} id={`${id}-${o.value}`} />
                <span className="leading-relaxed text-foreground group-hover:opacity-90 transition-opacity">{o.label}</span>
              </label>
            ))}
          </RadioGroup>
          {hintEl}
        </div>
      )
    case "derived":
      return (
        <div className={`grid ${gapSm} ${span}`}>
          {labelEl}
          <Input id={id} readOnly value={(form as any)[id] ?? ""} className={`${inputSm} bg-muted`} />
          {hintEl}
        </div>
      )
  }
}

/* ---------- Cards / Managers (compact spacing) ---------- */
function FounderCard({ idx, onRemove, canRemove, }: {
  idx: number
  onRemove: (idx: number) => void
  canRemove: boolean
}) {
  const [form, setForm] = useAtom(pifFormAtom)
  const f = form.founders[idx]
  const update = (patch: Partial<(typeof form)["founders"][number]>) => {
    const next = [...form.founders]
    next[idx] = { ...next[idx], ...patch }
    setForm({ ...form, founders: next })
  }

  return (
    <Card className="border">
      <CardHeader className="py-3">
        <CardTitle className="text-base font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span>Founder #{idx + 1}</span>
          </div>
          {canRemove ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(idx)}
              className="text-muted-foreground hover:text-destructive"
              aria-label={`Remove founder #${idx + 1}`}
              title="Remove"
            >
              <Trash className="h-4 w-4" />
            </Button>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label className={labelSm}>
            Founder Type<span className="text-destructive">*</span>
          </Label>
          <RadioGroup value={f.type} onValueChange={(v: any) => update({ type: v })} className="flex gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <RadioGroupItem value="individual" id={`f-type-i-${idx}`} />
              Individual
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <RadioGroupItem value="corporate" id={`f-type-c-${idx}`} />
              Corporate
            </label>
          </RadioGroup>
        </div>
        <div className="grid gap-1.5">
          <Label className={labelSm}>
            Full Name / Corporate Name<span className="text-destructive">*</span>
          </Label>
          <Input
            className={inputSm}
            value={f.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="Enter full or corporate name"
          />
        </div>
        <div className="grid gap-1.5">
          <Label className={labelSm}>
            Passport / Reg. No.<span className="text-destructive">*</span>
          </Label>
          <Input
            className={inputSm}
            value={f.id}
            onChange={(e) => update({ id: e.target.value })}
            placeholder="Enter passport or registration number"
          />
        </div>
        <div className="grid gap-1.5">
          <Label className={labelSm}>Email</Label>
          <Input
            className={inputSm}
            type="email"
            value={f.email || ""}
            onChange={(e) => update({ email: e.target.value })}
            placeholder="email@example.com"
          />
        </div>
        <div className="grid gap-1.5">
          <Label className={labelSm}>Phone</Label>
          <Input
            className={inputSm}
            value={f.tel || ""}
            onChange={(e) => update({ tel: e.target.value })}
            placeholder="Enter phone number"
          />
        </div>
      </CardContent>
    </Card>
  )
}

function FoundersManager() {
  const [form, setForm] = useAtom(pifFormAtom)
  const add = () =>
    setForm({
      ...form,
      founders: [...form.founders, { type: "", name: "", id: "", email: "", tel: "" }],
    })

  const removeAt = (idx: number) => {
    if (form.founders.length <= 1) return
    const next = form.founders.filter((_, i) => i !== idx)
    setForm({ ...form, founders: next })
  }

  const inviteFounderMembers = async () => {
    console.log("Invite Founder Members clicked");
  }

  return (
    <div className="space-y-3">
      <InfoBox>
        <strong>Number of Founders</strong>: A Panama PIF can be founded by one or more persons (individual or corporate). Add required members.
      </InfoBox>
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={add}>
          <Users className="h-4 w-4 mr-2" />
          Add Founder
        </Button>
      </div>
      {form.founders.map((_, i) => (
        <FounderCard key={i} idx={i} onRemove={removeAt} canRemove={form.founders.length > 1} />
      ))}
      <div className="flex justify-end pt-2">
        <Button onClick={inviteFounderMembers} >
          Invite Founder Members
        </Button>
      </div>
    </div>
  )
}

function CouncilStep() {
  const [form, setForm] = useAtom(pifFormAtom);
  const set = (patch: Partial<PanamaPIFForm>) => setForm({ ...form, ...patch });

  // ensure exactly 3 individual slots
  React.useEffect(() => {
    if (form.councilIndividuals?.length !== 3) {
      set({
        councilIndividuals: [
          form.councilIndividuals?.[0] ?? { type: "individual", name: "", id: "", email: "", tel: "" },
          form.councilIndividuals?.[1] ?? { type: "individual", name: "", id: "", email: "", tel: "" },
          form.councilIndividuals?.[2] ?? { type: "individual", name: "", id: "", email: "", tel: "" },
        ]
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateInd = (idx: number, patch: Partial<(typeof form)["councilIndividuals"][number]>) => {
    const next = [...form.councilIndividuals];
    next[idx] = { ...next[idx], ...patch, type: "individual" };
    set({ councilIndividuals: next });
  };

  const c = form.councilCorporate;
  const updateCorp = (patch: Partial<typeof c>) =>
    set({ councilCorporate: { ...c, ...patch } });

  const showIndividuals = form.councilMode !== "corp1";
  const showCorporate = form.councilMode === "corp1";
  const inviteCouncilMembers = async () => {
    console.log("Invite sent council members ");
    toast({
      title: "Invite Sent",
      description: "Council members have been invited to complete their onboarding forms.",
    });
  }
  return (
    <div className="space-y-4">
      {/* D. Foundation Council — Composition (preselect) */}
      <Card className="border">
        <CardHeader className="py-3">
          <CardTitle className="text-sm">D. Foundation Council — Composition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="inline-flex flex-wrap gap-6 text-sm">
            <RadioGroup
              value={form.councilMode || "ind3"}
              onValueChange={(v: "ind3" | "corp1") => set({ councilMode: v })}
              className="flex gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="ind3" id="c-mode-ind3" />
                <Label htmlFor="c-mode-ind3" className="cursor-pointer">Three Individuals</Label>
              </div>

              <div className="flex items-center gap-2">
                <RadioGroupItem value="corp1" id="c-mode-corp1" />
                <Label htmlFor="c-mode-corp1" className="cursor-pointer">One Corporate</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* D-1. Council: Individuals + nominee block */}
      {showIndividuals && (
        <Card className="border">
          <CardHeader className="py-3">
            <CardTitle className="text-sm">D-1. Three Individual Council Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border border-border p-2.5 text-[13px] bg-muted/30">
              Each member files a separate <b>Member Registration Form</b>. <b>Nominee Director</b> service is available if needed.
            </div>

            {form.councilIndividuals.map((m, i) => (
              <Card key={i} className="border border-dashed">
                <CardHeader className="py-2.5">
                  <CardTitle className="text-sm">Council Member #{i + 1} – Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label className={labelSm}>
                      Full Name<span className="text-destructive">*</span>
                    </Label>
                    <Input
                      className={inputSm}
                      value={m.name}
                      onChange={(e) => updateInd(i, { name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className={labelSm}>
                      Passport / ID No.<span className="text-destructive">*</span>
                    </Label>
                    <Input
                      className={inputSm}
                      value={m.id}
                      onChange={(e) => updateInd(i, { id: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className={labelSm}>Email</Label>
                    <Input
                      className={inputSm}
                      type="email"
                      value={m.email || ""}
                      onChange={(e) => updateInd(i, { email: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className={labelSm}>Phone</Label>
                    <Input
                      className={inputSm}
                      value={m.tel || ""}
                      onChange={(e) => updateInd(i, { tel: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="hr h-px bg-border" />

            <Label className={labelSm}>Use Nominee Director Service?</Label>
            <div className="flex items-center gap-2">
              <Checkbox
                id="useNominee"
                checked={form.useNomineeDirector}
                onCheckedChange={(v) => set({ useNomineeDirector: Boolean(v) })}
              />
              <Label htmlFor="useNominee" className={labelSm}>Use Nominee Director Service</Label>
            </div>

            {form.useNomineeDirector && (
              <div id="nomineeBlock" className="space-y-3">
                <InfoBox>
                  <b>Nominee Director — Details</b><br />
                  Officer details are viewable at the public registry; we can list nominees if needed.
                  Nominees <u>do not exercise control/management</u> nor claim ownership. UBO/significant
                  controller verification is still required for banks/exchanges. We perform in-person/video KYC
                  and keep records per AML laws. Fees (annual): 1 person <b>USD 1,200</b>, 2 persons <b>USD 1,700</b>,
                  3 persons <b>USD 2,200</b> (justification recommended). Nominee shareholder: <b>USD 1,300</b>.
                </InfoBox>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label className={labelSm}>Nominee Director — Number of Persons</Label>
                    <Select
                      value={form.nomineePersons || undefined}
                      onValueChange={(v: "1" | "2" | "3") => set({ nomineePersons: v })}
                    >
                      <SelectTrigger className={inputSm}>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 person (USD 1,200)</SelectItem>
                        <SelectItem value="2">2 persons (USD 1,700)</SelectItem>
                        <SelectItem value="3">3 persons (USD 2,200) — justification recommended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* D-2. Council: Corporate */}
      {showCorporate && (
        <Card className="border">
          <CardHeader className="py-3">
            <CardTitle className="text-sm">D-2. Council via One Corporate — Basic Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border border-border p-2.5 text-[13px] bg-muted/30">
              Uncommon structure. Even if a corporate acts as Council, KYC of human signatory(ies) is still required.
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className={labelSm}>
                  Entity Name / Reg. No. / Jurisdiction<span className="text-destructive">*</span>
                </Label>
                <Input
                  className={inputSm}
                  value={c.corpMain}
                  onChange={(e) => updateCorp({ corpMain: e.target.value })}
                  placeholder="EX: ABC TRUSTEES LTD / 123456 / PA"
                />
              </div>
              <div className="grid gap-1.5">
                <Label className={labelSm}>
                  Registered Address / Representative<span className="text-destructive">*</span>
                </Label>
                <Input
                  className={inputSm}
                  value={c.addrRep}
                  onChange={(e) => updateCorp({ addrRep: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className={labelSm}>Authorized Signatory (Optional)</Label>
                <Input
                  className={inputSm}
                  value={c.signatory || ""}
                  onChange={(e) => updateCorp({ signatory: e.target.value })}
                  placeholder="Name · Title · Contact"
                />
              </div>
              <div className="grid gap-1.5">
                <Label className={labelSm}>Contact Email</Label>
                <Input
                  className={inputSm}
                  type="email"
                  value={c.email || ""}
                  onChange={(e) => updateCorp({ email: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end pt-2">
        <Button onClick={inviteCouncilMembers} >
          Invite Council Members
        </Button>
      </div>
    </div>
  );
}

function SimpleRepeater({ title, items, onUpdate, onRemove, }: {
  title: string
  items: Array<{ name: string; contact: string }>
  onUpdate: (idx: number, patch: Partial<{ name: string; contact: string }>) => void
  onRemove?: (idx: number) => void
}) {
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <Card className="border border-dashed border-border" key={i}>
          <CardHeader className="py-2.5">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>
                {title} #{i + 1}
              </span>
              {onRemove ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(i)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Remove ${title.toLowerCase()} #${i + 1}`}
                  title="Remove"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label className={labelSm}>Name / Corporate / Class</Label>
              <Input className={inputSm} value={it.name} onChange={(e) => onUpdate(i, { name: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label className={labelSm}>Contact (optional)</Label>
              <Input className={inputSm} value={it.contact} onChange={(e) => onUpdate(i, { contact: e.target.value })} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ProtectorsManager() {
  const [form, setForm] = useAtom(pifFormAtom)
  const add = () => setForm({ ...form, protectors: [...form.protectors, { name: "", contact: "" }] })
  const update = (idx: number, patch: Partial<{ name: string; contact: string }>) => {
    const next = [...form.protectors]
    next[idx] = { ...next[idx], ...patch } as any
    setForm({ ...form, protectors: next })
  }
  const remove = (idx: number) => {
    const next = form.protectors.filter((_, i) => i !== idx)
    setForm({ ...form, protectors: next.length ? next : [{ name: "", contact: "" }] })
  }
  const inviteProtectors = async () => {
    console.log("Invite Protector clicked");
  }

  return (
    <div className="space-y-3">
      <InfoBox>
        A <b>Protector</b> does not run daily operations but <u>approves/oversees</u> major decisions.
        <br />
        Examples: approval for appointment/removal of council members, approval of by-laws changes, consent to certain distribution guidelines, etc. Multiple protectors may be appointed.
      </InfoBox>

      <div className="flex flex-wrap items-center gap-4">
        <RadioGroup
          value={form.protectorsEnabled ? "yes" : "no"}
          onValueChange={(v) => setForm({ ...form, protectorsEnabled: v === "yes" })}
          className="flex gap-6"
        >
          <label className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="yes" /> Appoint
          </label>
          <label className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="no" /> Do not appoint
          </label>
        </RadioGroup>
        {form.protectorsEnabled && (
          <Button variant="outline" onClick={add}>+ Add</Button>
        )}
      </div>

      {form.protectorsEnabled ? (
        <SimpleRepeater title="Protector" items={form.protectors} onUpdate={update} onRemove={remove} />
      ) : null}
      <div className="flex justify-end pt-2">
        <Button onClick={inviteProtectors} >
          Invite Protector
        </Button>
      </div>
    </div>
  )
}

function BeneficiariesManager() {
  const [form, setForm] = useAtom(pifFormAtom)

  const add = () =>
    setForm({
      ...form,
      beneficiaries: [...form.beneficiaries, { name: "", contact: "" }],
    })

  const update = (idx: number, patch: Partial<{ name: string; contact: string }>) => {
    const next = [...form.beneficiaries]
    next[idx] = { ...next[idx], ...patch } as any
    setForm({ ...form, beneficiaries: next })
  }

  const remove = (idx: number) => {
    const next = form.beneficiaries.filter((_, i) => i !== idx)
    setForm({ ...form, beneficiaries: next.length ? next : [{ name: "", contact: "" }] })
  }
  const inviteBeneficiaries = async () => {
    console.log("Invite Beneficiaries clicked");
  }

  return (
    <section className="space-y-3">
      <InfoBox>
        <b>Design</b>: ① Fixed list (named) ② By class (spouse/descendants/guardians, etc.) ③ Hybrid. For privacy/flexibility, <u>class-based</u> is common.
        A <b>Letter of Wishes</b> gives testamentary guidance (who/when/how much) and is relied on in practice.
      </InfoBox>

      {/* Mode + Add button (inline row like the HTML) */}
      <div className="flex flex-wrap items-center gap-4">
        <RadioGroup
          value={form.beneficiariesMode}
          onValueChange={(v: "fixed" | "class" | "mixed") => setForm({ ...form, beneficiariesMode: v })}
          className="flex gap-6"
        >
          <div className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="fixed" id="ben-mode-fixed" />
            <Label htmlFor="ben-mode-fixed" className="cursor-pointer">Fixed List</Label>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="class" id="ben-mode-class" />
            <Label htmlFor="ben-mode-class" className="cursor-pointer">By Class</Label>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="mixed" id="ben-mode-mixed" />
            <Label htmlFor="ben-mode-mixed" className="cursor-pointer">Hybrid</Label>
          </div>
        </RadioGroup>

        <Button variant="outline" onClick={add} id="addBen">+ Add Beneficiary</Button>
      </div>
      {/* Beneficiaries list */}
      <SimpleRepeater
        title="Beneficiary"
        items={form.beneficiaries}
        onUpdate={update}
        onRemove={remove}
      />
      {/* Letter of Wishes textarea */}
      <div className="grid gap-1.5">
        <Label className={labelSm}>Letter of Wishes</Label>
        <Textarea
          className="text-sm"
          rows={4}
          placeholder="(Optional) Testamentary guidance for distributions, priorities, timing, etc."
          value={form.letterOfWishes || ""}
          onChange={(e) => setForm({ ...form, letterOfWishes: e.target.value })}
        />
      </div>
      <div className="flex justify-end pt-2">
        <Button onClick={inviteBeneficiaries} >
          Invite Beneficiaries
        </Button>
      </div>
    </section>
  )
}

function BylawsStep() {
  const [form, setForm] = useAtom(pifFormAtom)
  return (
    <div className="space-y-3">
      <RadioGroup
        value={form.bylawsMode}
        onValueChange={(v: any) => setForm({ ...form, bylawsMode: v })}
        className="flex gap-6"
      >
        <label className="flex items-center gap-2 text-sm">
          <RadioGroupItem value="standard" /> Apply Standard Template
        </label>
        <label className="flex items-center gap-2 text-sm">
          <RadioGroupItem value="custom" /> Write Custom Details
        </label>
      </RadioGroup>
      {form.bylawsMode === "custom" && (
        <div className="grid md:grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label className={labelSm}>Allocation of Powers (Council vs Protector)</Label>
            <Textarea
              className="text-sm"
              placeholder="Signing authority / approval rights / removal powers, etc."
              value={form.bylawsPowers}
              onChange={(e) => setForm({ ...form, bylawsPowers: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label className={labelSm}>Recordkeeping / Audit / Reporting · Dissolution Conditions</Label>
            <Textarea
              className="text-sm"
              placeholder="Retention periods, audit cycles, reporting lines / specific events & voting requirements, etc."
              value={form.bylawsAdmin}
              onChange={(e) => setForm({ ...form, bylawsAdmin: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  )
}

const bankingHints: Record<string, string> = {
  consulting:
    "General consulting/holding: mid risk. Expect clarity on revenue/contracts/organization & UBO. Remote onboarding limited.",
  ecommerce:
    "Online service/e-commerce: payment flows, customer countries, refund policy required. Consider PSP/EMI alongside bank account.",
  investment:
    "Investment/equity holding: if largely passive, banks may be less keen. Consider brokerage/custody accounts.",
  crypto:
    "Virtual assets: many banks restrict. Consider crypto-friendly banks (e.g., Towerbank) or VASP/EMI combinations.",
  manufacturing:
    "Manufacturing/trade: require substance docs (supply agreements, shipping docs). Trade finance assessed separately.",
}

function BankingStep() {
  const [form, setForm] = useAtom(pifFormAtom)
  const showGuide = form.bankingNeed === "need"
  return (
    <div className="space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label className={labelSm}>
            Need to open an account?<span className="text-destructive">*</span>
          </Label>
          <RadioGroup
            value={form.bankingNeed}
            onValueChange={(v: any) => setForm({ ...form, bankingNeed: v })}
            className="flex gap-6"
          >
            <label className="flex items-center gap-2 text-sm">
              <RadioGroupItem value="need" /> Yes
            </label>
            <label className="flex items-center gap-2 text-sm">
              <RadioGroupItem value="none" /> No
            </label>
            <label className="flex items-center gap-2 text-sm">
              <RadioGroupItem value="later" /> Decide Later
            </label>
          </RadioGroup>
        </div>
        <div className="grid gap-1.5">
          <Label className={labelSm}>Business Activity Type (for guidance)</Label>
          <Select value={form.bankingBizType} onValueChange={(v) => setForm({ ...form, bankingBizType: v as any })}>
            <SelectTrigger className={inputSm}>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="consulting">General Consulting / Holding</SelectItem>
              <SelectItem value="ecommerce">Online Service / E-commerce</SelectItem>
              <SelectItem value="investment">Investment / Equity Holding</SelectItem>
              <SelectItem value="crypto">Virtual Assets Related</SelectItem>
              <SelectItem value="manufacturing">Manufacturing / Trade</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {showGuide && (
        <div className="space-y-2">
          <div className="rounded-md border border-border p-2.5 text-[13px] bg-muted/30">
            <b>Banks / EMIs (for reference)</b>
            <ul className="list-disc ml-6 mt-1.5 space-y-1">
              <li>Panama local banks often require in-person interview &amp; UBO evidence for non-resident/foundation accounts.</li>
              <li>
                <b>Crypto-friendly</b>: Towerbank (subject to policies &amp; risk appetite).
              </li>
              <li>EMI/foreign acceptance of “Foundation” varies — pre-check required.</li>
            </ul>
          </div>
          {form.bankingBizType && (
            <div className="text-[13px] text-muted-foreground">
              Activity guidance: {bankingHints[form.bankingBizType]}
            </div>
          )}
          <div className="text-[12px] text-muted-foreground">
            Indicative documents: Foundation charter/registration, council register &amp; acceptances, UBO chart,
            founders'/directors' passport &amp; address proof, source of funds, business description/contracts, tax
            ID/residence proof, references, interview, etc.
          </div>
        </div>
      )}
    </div>
  )
}

function DeliverablesStep() {
  const [form, setForm] = useAtom(pifFormAtom)
  const set = (patch: Partial<PanamaPIFForm>) => setForm({ ...form, ...patch })

  return (
    <div className="grid md:grid-cols-2 gap-3">
      {/* Left: Deliverables list with collapsibles */}
      <div className="space-y-2">
        <div className="font-medium text-foreground">Deliverables (click to expand)</div>
        <div className="rounded-md border p-2.5 text-[13px] text-muted-foreground dl-list">
          <details className="mb-1.5"><summary className="cursor-pointer">Public Deed</summary><div>Notarized deed for formation; includes purpose, council, registered agent, etc.</div></details>
          <details className="mb-1.5"><summary className="cursor-pointer">Public Deed Translation</summary><div>Translation (for requests/submissions).</div></details>
          <details className="mb-1.5"><summary className="cursor-pointer">Certificate of Public Registry</summary><div>Certificate issued by the Public Registry (legal existence).</div></details>
          <details className="mb-1.5"><summary className="cursor-pointer">Certificate of Public Registry Translation</summary><div>Translation of the registry certificate.</div></details>
          <details className="mb-1.5"><summary className="cursor-pointer">Foundation Certificate</summary><div>Certificate summarizing the foundation.</div></details>
          <details className="mb-1.5"><summary className="cursor-pointer">Foundation Certificate Translation</summary><div>Translation of the certificate.</div></details>
          <details className="mb-1.5"><summary className="cursor-pointer">Register of Council Members</summary><div>List of council members (3 individuals / 1 corporate).</div></details>
          <details className="mb-1.5"><summary className="cursor-pointer">Council’s Acceptance Letter</summary><div>Acceptance of office.</div></details>
          <details className="mb-1.5"><summary className="cursor-pointer">Regulations (By-Laws)</summary><div>Private internal regulations: powers, procedures, distribution, records, dissolution, etc.</div></details>
          <details className="mb-1.5"><summary className="cursor-pointer">Meeting of the Board</summary><div>Sample resolutions/minutes.</div></details>
          <details className="mb-1.5"><summary className="cursor-pointer">Certificate of Incumbency</summary><div>Certificate of current officers.</div></details>
          <details className="mb-1.5"><summary className="cursor-pointer">Nominee Agreement (if applicable)</summary><div>Agreement for nominee services.</div></details>
          <details className="mb-1.5"><summary className="cursor-pointer">Company Chop</summary><div>Official seal.</div></details>
        </div>
      </div>

      {/* Right: Original Shipping Details */}
      <div className="space-y-3">
        <div className="text-[13px] text-muted-foreground">
          <span className="font-medium text-foreground">Original Shipping Details</span>{" "}
          <span className="text-xs">(If Korean address, please write in Korean)</span>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label className={labelSm}>
              Recipient Company<span className="text-destructive">*</span>
            </Label>
            <Input
              className={inputSm}
              value={form.shippingRecipientCompany || ""}
              onChange={(e) => set({ shippingRecipientCompany: e.target.value })}
              placeholder="Company / Foundation name"
            />
          </div>

          <div className="grid gap-1.5">
            <Label className={labelSm}>
              Contact Person<span className="text-destructive">*</span>
            </Label>
            <Input
              className={inputSm}
              value={form.shippingContactPerson || ""}
              onChange={(e) => set({ shippingContactPerson: e.target.value })}
              placeholder="Full name"
            />
          </div>

          <div className="grid gap-1.5">
            <Label className={labelSm}>
              Phone<span className="text-destructive">*</span>
            </Label>
            <Input
              className={inputSm}
              type="tel"
              value={form.shippingPhone || ""}
              onChange={(e) => set({ shippingPhone: e.target.value })}
              placeholder="+82 ..."
            />
          </div>

          <div className="grid gap-1.5">
            <Label className={labelSm}>
              Postal Code<span className="text-destructive">*</span>
            </Label>
            <Input
              className={inputSm}
              value={form.shippingPostalCode || ""}
              onChange={(e) => set({ shippingPostalCode: e.target.value })}
              placeholder="e.g., 12345"
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label className={labelSm}>
            Address<span className="text-destructive">*</span>
          </Label>
          <Textarea
            className="text-sm"
            rows={4}
            placeholder="Street / Building / Unit, etc."
            value={form.shippingAddress || ""}
            onChange={(e) => set({ shippingAddress: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}

function DeclarationsStep() {
  const [form, setForm] = useAtom(pifFormAtom)
  const set = (patch: Partial<PanamaPIFForm>) => setForm({ ...form, ...patch })
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <Checkbox checked={form.taxOk} onCheckedChange={(v) => set({ taxOk: Boolean(v) })} />
        <span className="text-sm">
          I confirm compliance with applicable tax obligations and that the PIF is not intended for unlawful/sanctioned
          purposes.<span className="text-destructive">*</span>
        </span>
      </div>
      <div className="flex items-start gap-3">
        <Checkbox checked={form.truthOk} onCheckedChange={(v) => set({ truthOk: Boolean(v) })} />
        <span className="text-sm">
          I confirm the accuracy and completeness of the information provided.<span className="text-destructive">*</span>
        </span>
      </div>
      <div className="flex items-start gap-3">
        <Checkbox checked={form.privacyOk} onCheckedChange={(v) => set({ privacyOk: Boolean(v) })} />
        <span className="text-sm">
          I consent to the processing of personal data for KYC/sanctions screening and service delivery.
          <span className="text-destructive">*</span>
        </span>
      </div>
      <div className="grid md:grid-cols-2 gap-3 mt-2">
        <div className="grid gap-1.5">
          <Label className={labelSm}>
            Signature (type your name)<span className="text-destructive">*</span>
          </Label>
          <Input className={inputSm} value={form.signName} onChange={(e) => set({ signName: e.target.value })} />
        </div>
        <div className="grid gap-1.5">
          <Label className={labelSm}>
            Date<span className="text-destructive">*</span>
          </Label>
          <Input className={inputSm} type="date" value={form.signDate} onChange={(e) => set({ signDate: e.target.value })} />
        </div>
        <div className="grid gap-1.5 md:col-span-2">
          <Label className={labelSm}>Title / Capacity</Label>
          <Input className={inputSm} value={form.signTitle || ""} onChange={(e) => set({ signTitle: e.target.value })} />
        </div>
        <div className="text-[12px] text-muted-foreground md:col-span-2">
          ※ This form is for preliminary information gathering for review/quotation/KYC and does not constitute legal or tax advice.
        </div>
      </div>
    </div>
  )
}

function AMLStep() {
  const [form, setForm] = useAtom(pifFormAtom)
  const set = (patch: Partial<PanamaPIFForm>) => setForm({ ...form, ...patch })

  return (
    <div className="space-y-4">
      <InfoBox>
        In line with FATF, UN, EU, OFAC, UK HMT, HKMA, etc., confirm any dealings with
        <b> sanctioned countries/persons</b>.
      </InfoBox>

      {/* 1) legalAndEthicalConcern */}
      <div className="rounded-lg border p-3 space-y-2">
        <div className="text-sm">
          <b>1)</b> Operate now / plan to operate with
          <u> Iran, Sudan, South Sudan, North Korea, Syria, Cuba, Belarus, Zimbabwe, Russia</u> or
          areas in <u>Ukraine outside government control</u>?
        </div>
        <RadioGroup
          className="flex gap-6"
          value={form.legalAndEthicalConcern || ""}
          onValueChange={(v: "yes" | "no" | "") => set({ legalAndEthicalConcern: v })}
        >
          <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="yes" /> Yes</label>
          <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="no" /> No</label>
        </RadioGroup>
      </div>

      {/* 2) q_country */}
      <div className="rounded-lg border p-3 space-y-2">
        <div className="text-sm">
          <b>2)</b> Any related persons reside in those countries or in a country sanctioned by
          <u> UN, EU, UK HMT, HKMA, OFAC</u> (or Ukrainian areas outside gov’t control)?
        </div>
        <RadioGroup
          className="flex gap-6"
          value={form.q_country || ""}
          onValueChange={(v: "yes" | "no" | "") => set({ q_country: v })}
        >
          <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="yes" /> Yes</label>
          <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="no" /> No</label>
        </RadioGroup>
      </div>

      {/* 3) sanctionsExposureDeclaration */}
      <div className="rounded-lg border p-3 space-y-2">
        <div className="text-sm">
          <b>3)</b> Is/will the PIF be <u>owned/controlled/acting for</u> sanctioned persons/entities or
          persons in <u>Afghanistan, Belarus, Cuba, Iran, North Korea, Russia, Syria, or Ukrainian areas outside gov’t control</u>?
        </div>
        <RadioGroup
          className="flex gap-6"
          value={form.sanctionsExposureDeclaration || ""}
          onValueChange={(v: "yes" | "no" | "") => set({ sanctionsExposureDeclaration: v })}
        >
          <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="yes" /> Yes</label>
          <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="no" /> No</label>
        </RadioGroup>
      </div>

      {/* 4) crimeaSevastapolPresence */}
      <div className="rounded-lg border p-3 space-y-2">
        <div className="text-sm">
          <b>4)</b> Any related persons currently operate or plan to operate in <u>Crimea</u> or <u>Sevastopol</u>?
        </div>
        <RadioGroup
          className="flex gap-6"
          value={form.crimeaSevastapolPresence || ""}
          onValueChange={(v: "yes" | "no" | "") => set({ crimeaSevastapolPresence: v })}
        >
          <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="yes" /> Yes</label>
          <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="no" /> No</label>
        </RadioGroup>
      </div>

      {/* 5) russianEnergyPresence */}
      <div className="rounded-lg border p-3 space-y-2">
        <div className="text-sm">
          <b>5)</b> Do the PIF/holding/group/affiliates operate now or plan to operate in
          <u> oil, gas, energy, military, defense</u> sectors (incl. critical goods)?
        </div>
        <div className="text-xs text-muted-foreground">
          Examples: explosives, lubricants, sensors, micro-electronics, comms modules, passive components, navigation,
          electrical parts, PCB production/QC tools, CNC machines/parts.
        </div>
        <RadioGroup
          className="flex gap-6 mt-1"
          value={form.russianEnergyPresence || ""}
          onValueChange={(v: "yes" | "no" | "") => set({ russianEnergyPresence: v })}
        >
          <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="yes" /> Yes</label>
          <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="no" /> No</label>
        </RadioGroup>
      </div>
    </div>
  )
}

function AccountingRecordsStep() {
  const [form, setForm] = useAtom(pifFormAtom)
  const set = (patch: Partial<PanamaPIFForm>) => setForm({ ...form, ...patch })
  return (
    <div className="space-y-3">
      <InfoBox>
        Regulations require disclosing the <b>address where accounting records are stored</b>. You may provide an
        office or residential address. If you use our address, <b>USD 350 per year</b> applies; records must be
        provided to us periodically.
      </InfoBox>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="md:col-span-2 grid gap-1.5">
          <Label className={labelSm}>
            Accounting Record Storage Address (English)<span className="text-destructive">*</span>
          </Label>
          <Textarea
            className="text-sm"
            rows={4}
            placeholder="Full address in English"
            value={form.recordStorageAddress || ""}
            onChange={(e) => set({ recordStorageAddress: e.target.value })}
          />
        </div>

        <div className="grid gap-1.5">
          <Label className={labelSm}>
            Responsible Person (English Full Name)<span className="text-destructive">*</span>
          </Label>
          <Input
            className={inputSm}
            placeholder="e.g., John Smith"
            value={form.recordStorageResponsiblePerson || ""}
            onChange={(e) => set({ recordStorageResponsiblePerson: e.target.value })}
          />
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="recordStorageUseMirr"
            checked={Boolean(form.recordStorageUseMirr)}
            onCheckedChange={(v) => set({ recordStorageUseMirr: Boolean(v) })}
          />
          <Label htmlFor="recordStorageUseMirr" className={`${labelSm} leading-relaxed cursor-pointer`}>
            Use Mirr Asia record-storage address (USD 350/yr)
          </Label>
        </div>
      </div>
    </div>
  )
}

function ProfileStepPanama() {
  const [form, setForm] = useAtom(pifFormAtom)
  const set = (patch: Partial<PanamaPIFForm>) => setForm({ ...form, ...patch })

  // Helpers
  const sofOpts = [
    "Employment Income",
    "Savings/Deposits",
    "Investment Income (stocks/bonds/funds)",
    "Loan",
    "Proceeds from Sale of Company/Shares",
    "Business Income/Dividends",
    "Inheritance/Gift",
    "other",
  ] as const

  const industryMap = [
    ["trading", "Trading"],
    ["wholesale", "Wholesale/Retail/Distribution"],
    ["consulting", "Consulting"],
    ["manufacturing", "Manufacturing"],
    ["finance", "Finance/Investment/Advisory"],
    ["online", "Online Services/e-Commerce"],
    ["it", "IT/Software/Blockchain"],
    ["crypto", "Digital Assets"],
    ["other", "Other"],
  ] as const

  const toggleIndustry = (key: string) => {
    const list = new Set(form.industries || [])
    if (list.has(key)) list.delete(key)
    else list.add(key)
    set({ industries: Array.from(list) })
  }

  // Purpose chips
  const addPurposeText = (txt: string) => {
    const cur = form.purposeSummary || ""
    const next = (cur ? cur + (cur.endsWith(" ") ? "" : " ") : "") + txt
    set({ purposeSummary: next.slice(0, 280) })
  }
  const purposeLen = (form.purposeSummary || "").length

  return (
    <div className="space-y-4">
      {/* Naming Guidelines */}
      <InfoBox>
        <b>Naming Guidelines</b> — The name must contain <u>“Foundation”</u> or <u>“Fundación”</u>. Identical or
        confusingly similar names cannot be registered. <span className="text-xs">Please provide 1st/2nd/3rd choices; we will check availability.</span>
      </InfoBox>

      {/* Name choices (1st/2nd/3rd + Spanish) */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label className={labelSm}>1st Choice<span className="text-destructive">*</span></Label>
          <Input
            className={inputSm}
            placeholder="e.g., MIRR ASIA FOUNDATION"
            value={form.foundationNameEn}
            onChange={(e) => set({ foundationNameEn: e.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label className={labelSm}>2nd Choice<span className="text-destructive">*</span></Label>
          <Input
            className={inputSm}
            value={form.altName1 || ""}
            onChange={(e) => set({ altName1: e.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label className={labelSm}>3rd Choice<span className="text-destructive">*</span></Label>
          <Input
            className={inputSm}
            value={form.altName2 || ""}
            onChange={(e) => set({ altName2: e.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label className={labelSm}>Spanish Name (Optional)</Label>
          <Input
            className={inputSm}
            placeholder="Fundación …"
            value={form.foundationNameEs || ""}
            onChange={(e) => set({ foundationNameEs: e.target.value })}
          />
        </div>
      </div>

      {/* Initial Endowment + Source of Funds */}
      <InfoBox>
        <b>Initial Endowment</b> — Often recorded as “Initial Capital / Endowment”. <u>Nominal minimum is USD 10,000 and
          there is no immediate funding obligation</u> (it is recorded in the Charter as a commitment and can be
        funded/adjusted later).
      </InfoBox>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label className={labelSm}>Initial Endowment (USD)</Label>
          <Input
            className={inputSm}
            type="number"
            inputMode="decimal"
            placeholder="e.g., 10000"
            value={form.initialEndowment || ""}
            onChange={(e) => set({ initialEndowment: e.target.value })}
          />
        </div>

        <div className="grid gap-1.5">
          <Label className={labelSm}>
            Source of Funds<span className="text-destructive">*</span>
          </Label>
          <Select
            value={form.sourceOfFunds || "__none"}
            onValueChange={(v) =>
              set({
                sourceOfFunds: v === "__none" ? undefined : (v as PanamaPIFForm["sourceOfFunds"]),
                sourceOfFundsOther: v === "other" ? (form.sourceOfFundsOther || "") : "",
              })
            }
          >
            <SelectTrigger className={inputSm}>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none">Select</SelectItem>
              {sofOpts.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>

        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label className={labelSm}>Payer of Initial Endowment (Name/Entity)<span className="text-destructive">*</span></Label>
          <Input
            className={inputSm}
            value={form.endowmentPayer || ""}
            onChange={(e) => set({ endowmentPayer: e.target.value })}
          />
        </div>

        {/* Registered Address (Panama) */}
        <div className="grid gap-1.5">
          <Label className={labelSm}>Registered Address (Panama)<span className="text-destructive">*</span></Label>
          <RadioGroup
            value={form.registeredAddressMode || ""}
            onValueChange={(v: "mirr" | "own") => set({ registeredAddressMode: v })}
            className="flex flex-col gap-2"
          >
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <RadioGroupItem value="mirr" id="ra-mirr" />
              Use Mirr Asia registered address (no extra charge)
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <RadioGroupItem value="own" id="ra-own" />
              I have my own registered address (provide below)
            </label>
          </RadioGroup>
        </div>
      </div>

      {form.registeredAddressMode === "own" && (
        <div className="grid gap-1.5">
          <Label className={labelSm}>Separate Registered Address (English)</Label>
          <Textarea
            className="text-sm"
            placeholder="Addressee / Contact / Address / Postal Code (English recommended)"
            value={form.ownRegisteredAddress || ""}
            onChange={(e) => set({ ownRegisteredAddress: e.target.value })}
          />
        </div>
      )}

      {/* Purpose box with chips + counter */}
      <div className="space-y-2">
        <Label className={labelSm}>Purpose of Establishment<span className="text-destructive">*</span></Label>

        <div className="flex flex-wrap gap-2">
          {[
            ["Asset Protection", "Hold real estate, financial assets, equities, and digital assets; establish asset protection via a foundation"],
            ["Succession Planning", "Hold and operate assets through the foundation and plan intergenerational succession"],
            ["Hold & Manage Investment Interests", "Hold and manage investment interests"],
            ["Dividend & Interest Income Management", "Manage dividend and interest income"],
            ["Charitable Purposes", "Operate funds for charitable or religious purposes"],
            ["Family-Trust Structure", "Structure and operate as a family-trust style vehicle"],
            ["Blockchain Token-Related", "Issue tokens to support a blockchain ecosystem"],
          ].map(([label, val]) => (
            <Button key={label} type="button" variant="outline" size="sm" onClick={() => addPurposeText(val as string)}>
              {label}
            </Button>
          ))}
        </div>

        <Textarea
          id="purpose"
          required
          rows={4}
          placeholder="e.g., Asset protection, succession and charitable allocation, overseas shareholding and dividend management, etc."
          className="text-sm"
          value={form.purposeSummary || ""}
          onChange={(e) => set({ purposeSummary: e.target.value.slice(0, 280) })}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Combine the keywords or write freely.</span>
          <span className="text-xs">{purposeLen}/280</span>
        </div>
      </div>

      <div className="border-t my-2" />

      {/* Business / Activities */}
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground font-medium">Business / Activities</div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className={labelSm}>Main Industries (multi-select)</Label>
            <div className="flex flex-col gap-1.5 text-sm">
              {industryMap.map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={(form.industries || []).includes(key)}
                    onCheckedChange={() => toggleIndustry(key)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label className={labelSm}>Countries of Activity (planned)</Label>
            <Input
              className={inputSm}
              placeholder="e.g., PA, US, EU, HK, KR ..."
              value={form.geoCountries || ""}
              onChange={(e) => set({ geoCountries: e.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label className={labelSm}>Key Post-Incorporation Activities & Description</Label>
          <Textarea
            className="text-sm"
            placeholder="e.g., Hold foreign equity and receive dividends, operate online services and payment processing, allocate charitable funds, etc."
            value={form.bizDesc || ""}
            onChange={(e) => set({ bizDesc: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}

function InvoicePIF() {
  const [form, setForm] = useAtom(pifFormAtom)
  const { pricing } = form

  const updatePricing = <K extends keyof typeof pricing>(key: K, value: (typeof pricing)[K]) => {
    const next = { ...pricing, [key]: value }
    next.total = computePIFSetupTotal(next)
    setForm({ ...form, pricing: next })
  }

  React.useEffect(() => {
    const setupTotal = computePIFSetupTotal(pricing)
    if (setupTotal !== pricing.total) {
      setForm({ ...form, pricing: { ...pricing, total: setupTotal } })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const base = pricing.total
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Invoice & Quote — Panama PIF (Setup Only)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border rounded-xl p-4">
          <h3 className="font-semibold mb-3">Setup (Year 1)</h3>
          <div className="flex items-start justify-between gap-3 py-1">
            <div className="text-sm flex items-center gap-2">
              <span id="entity-label">
                Mirr Asia setup fee + first-year services
                <span
                  className="help sr-only"
                  data-title="Setup package (all-in)"
                  data-body="Includes government fees (corporation USD 300 / PIF separate), Resident Agent, and Registered Office."
                />
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="Setup package (all-in) details"
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full border text-muted-foreground"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  <div className="font-medium mb-1">Setup package (all-in)</div>
                  <div>Includes government fees (corporation USD 300 / PIF separate), Resident Agent, and Registered Office.</div>
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="text-sm font-medium">{money(pricing.setupBase)}</span>
          </div>
          <div className="space-y-3 mt-3">
            <div className="space-y-1.5">
              <Label>Nominee Director(s) — setup</Label>
              <Select value={String(pricing.ndSetup)} onValueChange={(v) => updatePricing("ndSetup", Number(v) as any)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">None (0)</SelectItem>
                  <SelectItem value="1">1 person (+{money(1200)})</SelectItem>
                  <SelectItem value="2">2 people (+{money(1700)})</SelectItem>
                  <SelectItem value="3">3 people (+{money(2200)})</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {pricing.ndSetup === 3 && (
              <div className="space-y-1.5">
                <Label className="text-xs">Reason for selecting 3 nominee directors (setup)</Label>
                <Textarea
                  placeholder="Please state why 3 nominee directors are needed."
                  value={pricing.nd3ReasonSetup ?? ""}
                  onChange={(e) => updatePricing("nd3ReasonSetup", e.target.value)}
                />
                <p className="text-[12px] text-muted-foreground">* We recommend providing a reason when selecting 3.</p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Checkbox
                checked={pricing.nsSetup}
                onCheckedChange={(c) => updatePricing("nsSetup", Boolean(c))}
                id="ns-setup"
              />
              <Label htmlFor="ns-setup">Nominee Shareholder (setup) (+{money(1300)})</Label>
            </div>
            <Separator />
            <h4 className="font-medium">Optional services (setup)</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={pricing.optEmi}
                  onCheckedChange={(c) => updatePricing("optEmi", Boolean(c))}
                  id="opt-emi"
                />
                <Label htmlFor="opt-emi">EMI account opening (+{money(400)})</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={pricing.optBank}
                  onCheckedChange={(c) => updatePricing("optBank", Boolean(c))}
                  id="opt-bank"
                />
                <Label htmlFor="opt-bank">Panama local bank account opening (+{money(2000)})</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={pricing.optCbi}
                  onCheckedChange={(c) => updatePricing("optCbi", Boolean(c))}
                  id="opt-cbi"
                />
                <Label htmlFor="opt-cbi">Puerto Rico CBI account opening (+{money(3880)})</Label>
              </div>
            </div>
            <Separator className="my-2" />
            <div className="flex items-start justify-between gap-3 py-1">
              <span className="text-sm font-medium">Setup (Year 1) total</span>
              <span className="text-sm font-medium">{money(base)}</span>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-muted/20 p-4 text-sm">
          <b>Setup package includes (PIF):</b>
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li>Draft foundation charter (EN/ES)</li>
            <li>Founder nomination</li>
            <li>Notarization and registration of the charter</li>
            <li>Incorporation fees and registry taxes</li>
            <li>Certificate of Establishment</li>
            <li>Resolution organizing the foundation council</li>
            <li>Resolutions appointing Protector/beneficiaries</li>
            <li>Drafting of regulations</li>
            <li>Notarized translations</li>
            <li>Certificate of Incumbency</li>
            <li>Registered office (1 year)</li>
            <li>Registered agent/secretary (1 year)</li>
            <li>KYC/Due Diligence</li>
            <li>International courier</li>
          </ol>
          <div className="mt-2 text-[12px] text-muted-foreground">
            <strong>Note:</strong> Accounting fees are not included; bookkeeping/audit/tax filings are quoted separately.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StripePaymentForm({ app, onSuccess, onClose }: {
  app: PanamaPIFForm;
  onSuccess: (info: StripeSuccessInfo) => void; onClose: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
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
            paymentIntentId: app.paymentIntentId,
            companyId: app._id,
            companyName: app.foundationNameEn || app.foundationNameEs || "Company (TBD)",
            userEmail: app.email,
            country: "pif"
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
  app: PanamaPIFForm;
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
            Grand Total: <b>USD {amountUSD.toFixed(2)}</b> {app.payMethod === "card" ? "(incl. 3.5% card fee)" : ""}
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

function PaymentStepPIF() {
  const [form, setForm] = useAtom(pifFormAtom)

  const isPaid =
    form.paymentStatus === "paid" ||
    form.stripeLastStatus === "succeeded" ||
    form.stripePaymentStatus === "succeeded"

  React.useEffect(() => {
    if (isPaid) return
    const now = Date.now()
    const current = form.expiresAt ? new Date(form.expiresAt).getTime() : 0
    if (!current || current <= now) {
      const twoDaysMs = 2 * 24 * 60 * 60 * 1000
      const expiryISO = new Date(now + twoDaysMs).toISOString()
      setForm((prev) => ({ ...prev, expiresAt: expiryISO }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaid])

  const [nowTs, setNowTs] = React.useState(() => Date.now())
  React.useEffect(() => {
    if (isPaid) return
    const id = window.setInterval(() => setNowTs(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [isPaid])

  const expiresTs = form.expiresAt ? new Date(form.expiresAt).getTime() : 0
  const remainingMs = Math.max(0, expiresTs - nowTs)
  const isExpired = !isPaid && (!expiresTs || remainingMs <= 0)
  const formatRemaining = (ms: number) => {
    const s = Math.floor(ms / 1000)
    const d = Math.floor(s / 86400)
    const h = Math.floor((s % 86400) / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return d > 0
      ? `${d}d ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
      : `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
  }

  const guard = (msg: string) => {
    if (isPaid) {
      alert("Already paid.")
      return true
    }
    if (isExpired) {
      alert(msg)
      return true
    }
    return false
  }

  const grand = computePIFGrandTotal(form)

  // placeholders for your future integrations:
  const [creatingPI, setCreatingPI] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [bankFile, setBankFile] = React.useState<File | null>(null)
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);
  const [cardDrawerOpen, setCardDrawerOpen] = React.useState(false);

  const handleProceedCard = async () => {
    if (guard("This quote expired. Please refresh or contact us.")) return
    if (clientSecret && form.paymentIntentId) {
      setCardDrawerOpen(true);
      return;
    }
    setCreatingPI(true)
    try {
      const currentFP = {
        companyId: form?._id ?? null,
        totalCents: Math.round(grand * 100),
        country: "PIF",
      };
      const result = await createInvoicePaymentIntent(currentFP);
      if (result?.clientSecret && result?.id) {
        setClientSecret(result.clientSecret);
        setForm((p) => ({ ...p, paymentIntentId: result.id, payMethod: "card" }));
        setCardDrawerOpen(true);
      } else {
        alert("Could not initialize card payment. Please try again.");
      }
    } finally {
      setCreatingPI(false)
    }
  }

  const handleBankProofSubmit = async () => {
    if (guard("This quote expired. Please refresh or contact us.")) return
    if (!bankFile) return
    setUploading(true)
    const method = form.payMethod || 'card'
    const expiresAt = form.expiresAt || ''
    try {
      // TODO: integrate your upload API here
      console.log("Upload bank proof (Panama):", { bankFile, payMethod: form.payMethod })
      const result = await uploadIncorpoPaymentBankProof(form?._id || "", "pif", bankFile, method, expiresAt);

      if (result) setForm((p) => ({ ...p, uploadReceiptUrl: result?.url, }));
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteBankProof = async () => {
    if (guard(t("newHk.payment.alerts.expiredGuard"))) return;
    await deleteIncorpoPaymentBankProof(form?._id || "", "pif");
    setForm((p: any) => ({ ...p, uploadReceiptUrl: undefined }));
  };

  return (
    <>
      {isPaid && (
        <div className="mb-4 border rounded-md p-3 text-sm bg-emerald-50 border-emerald-200 text-emerald-900">
          <div className="font-semibold mb-1">Payment received</div>
          {typeof form.stripeAmountCents === "number" && form.stripeCurrency ? (
            <div>
              Amount: <b>{form.stripeCurrency.toUpperCase()} {(form.stripeAmountCents / 100).toFixed(2)}</b>
            </div>
          ) : null}
          {form.stripeReceiptUrl ? (
            <div>
              Receipt:{" "}
              <a className="underline underline-offset-2" href={form.stripeReceiptUrl} target="_blank" rel="noreferrer">View</a>
            </div>
          ) : null}
        </div>
      )}
      {!isPaid && (
        <div className={`mb-4 rounded-md border p-3 text-sm ${isExpired ? "border-red-200 bg-red-50 text-red-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
          {isExpired ? (
            <div className="font-medium">This quote has expired.</div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="font-medium">Payment window</div>
              <div className="text-base font-bold tabular-nums">{formatRemaining(remainingMs)}</div>
            </div>
          )}
        </div>
      )}

      <>
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
                    checked={form.payMethod === o.v}
                    onChange={() => setForm((p) => ({ ...p, payMethod: o.v as PanamaPIFForm["payMethod"] }))}
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

              {["bank", "other"].includes(form.payMethod ?? "") && (
                <div className="mt-4 grid gap-3">
                  <div className="grid gap-2">
                    <Label>{t("newHk.payment.bankUpload.refLabel")}</Label>
                    <Input
                      placeholder={t("newHk.payment.bankUpload.refPlaceholder")}
                      value={form.bankRef || ""}
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

                  {form.uploadReceiptUrl ? (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">
                          {t("newHk.payment.bankUpload.previewTitle")}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button asChild variant="outline" size="sm" disabled={isPaid || isExpired}>
                            <a
                              href={form.uploadReceiptUrl}
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
                          key={form.uploadReceiptUrl}
                          src={form.uploadReceiptUrl}
                          title="Payment Proof"
                          className="w-full h-[420px]"
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {form.payMethod === "card" && !isPaid && (
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
              {form.payMethod === "fps" ? <FPSForm /> : null}
              <div className="text-right font-bold mt-4">
                {t("newHk.payment.totals.grandTotal", {
                  amount: grand.toFixed(2),
                })}
              </div>
            </CardContent>
          </Card>
        </div>
        {clientSecret && !isPaid && !isExpired ? (
          <StripeCardDrawer
            open={cardDrawerOpen}
            onOpenChange={setCardDrawerOpen}
            clientSecret={clientSecret}
            amountUSD={grand}
            app={form}
            onSuccess={(info) => {
              setForm((prev) => ({
                ...prev,
                paymentStatus:
                  info?.paymentIntentStatus === "succeeded"
                    ? "paid"
                    : prev.paymentStatus,
                stripeLastStatus:
                  info?.paymentIntentStatus ?? prev.stripeLastStatus,
                stripeReceiptUrl:
                  info?.receiptUrl ?? prev.stripeReceiptUrl,
                stripeAmountCents:
                  typeof info?.amount === "number"
                    ? info.amount
                    : prev.stripeAmountCents,
                stripeCurrency: info?.currency ?? prev.stripeCurrency,
              }));
              setCardDrawerOpen(false);
            }}
          />
        ) : null}
      </>
    </>
  )
}

function CongratsStep() {
  const [app] = useAtom(pifFormAtom);
  const navigate = useNavigate();
  const token = localStorage.getItem("token") as string;
  const decodedToken = jwtDecode<any>(token);

  const navigateRoute = () => {
    localStorage.removeItem("companyRecordId");
    if (["admin", "master"].includes(decodedToken.role)) navigate("/admin-dashboard");
    else navigate("/dashboard");
  };

  const namePart = app.contactName
    ? t("newHk.congrats.thankYouName", { applicantName: app.contactName })
    : "";


  return (
    <div className="grid place-items-center gap-4 text-center py-6">
      <h2 className="text-xl font-extrabold">{t("newHk.congrats.title")}</h2>
      <p className="text-sm">
        {t("newHk.congrats.thankYou", { name: namePart })}
      </p>
      <div className="flex items-center gap-2 justify-center">
        <Button onClick={navigateRoute}>{t("newHk.congrats.buttons.dashboard")}</Button>
      </div>
    </div>
  );
}

const panamaPIFConfig: FormConfig = {
  title: "Panama Private Interest Foundation (PIF) — Application",
  steps: [
    {
      id: "applicant",
      title: "A. Applicant Details",
      description: "We’ll send documents, invoices, and status updates to the email below.",
      fields: [
        { type: "email", name: "email", label: "Email", placeholder: "you@example.com", required: true },
        { type: "text", name: "contactName", label: "Contact Person (Full Name)", placeholder: "John Smith", required: true },
        { type: "text", name: "phone", label: "Phone / Messenger", placeholder: "+82 ..." },
        { type: "text", name: "contactPref", label: "Preferred Contact Time / Method", placeholder: "e.g., Weekdays 10:00–18:00, email preferred" },
      ],
    },
    {
      id: "profile",
      title: "B. Foundation Profile",
      render: ProfileStepPanama,
    },
    { id: "founders", title: "C. Founder(s)", render: FoundersManager },
    { id: "council", title: "D. Foundation Council — Composition", render: CouncilStep },
    { id: "protectors", title: "E. Protector (optional)", render: ProtectorsManager },
    { id: "beneficiaries", title: "F. Beneficiaries", render: BeneficiariesManager },
    { id: "bylaws", title: "G. By-Laws", render: BylawsStep },
    {
      id: "es",
      title: "H. Economic Substance (ES) Check",
      description:
        "Panama has not implemented a general ES regime; ES applies mainly to certain special regimes (e.g., Multinational Headquarters SEM). In practice, General PIFs are not directly subject to ES requirements (tax/reporting obligations should be reviewed separately).※ Tax residence & activity in other countries may trigger taxation/CRS impacts — review case-by-case.",
      fields: [],
    },
    { id: "banking", title: "I. Banking", render: BankingStep },
    {
      id: "pep",
      title: "J. Politically Exposed Person (PEP)",
      fields: [
        {
          type: "radio-group",
          name: "pepAny",
          label:
            "A PEP is a current/former senior public official and their family/close associates. Here we only confirm whether any PIF participant is a PEP. Detailed checks are performed in the individual onboarding forms.",
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
      ],
    },
    { id: "aml", title: "K. AML & Sanctions", render: AMLStep },
    { id: "deliverables", title: "L. Post-Incorporation Deliverables & Shipping", render: DeliverablesStep },
    { id: "accounting", title: "M. Accounting Record Storage & Responsible Person", render: AccountingRecordsStep },
    { id: "invoice", title: "N. Invoice & Quote", render: InvoicePIF },
    { id: "payment", title: "O. Payment", render: PaymentStepPIF },
    { id: "declarations", title: "P. Declarations & e-Sign", render: DeclarationsStep },
    { id: "congrats", title: "Congratulations", render: CongratsStep },

  ],
}

function requiredMissingForStep(form: PanamaPIFForm, step: StepConfig): string[] {
  const id = (step as any).id as string;
  const miss: string[] = [];
  const need = (v?: string | null) => !v || String(v).trim() === "";

  switch (id) {
    /* A. Applicant */
    case "applicant": {
      if (!form.email || !emailOk(form.email)) miss.push("Valid Email");
      if (need(form.contactName)) miss.push("Contact Person (Full Name)");
      if (form.phone && !phoneOk(form.phone)) miss.push("Phone (format)");
      break;
    }
    /* B. Foundation Profile */
    case "profile": {
      // Name choices
      if (need(form.foundationNameEn)) miss.push("1st Choice (English)");
      if (need(form.altName1)) miss.push("2nd Choice (English)");
      if (need(form.altName2)) miss.push("3rd Choice (English)");
      // Purpose
      if (need(form.purposeSummary)) miss.push("Purpose of Establishment");
      // Source of funds
      if (!form.sourceOfFunds) miss.push("Source of Funds");
      if (form.sourceOfFunds === "other" && need(form.sourceOfFundsOther)) {
        miss.push("Source of Funds (Other) – please specify");
      }
      // Endowment payer
      if (need(form.endowmentPayer)) miss.push("Payer of Initial Endowment (Name/Entity)");
      // Registered address selection + details if own
      if (!form.registeredAddressMode) {
        miss.push("Registered Address (Panama)");
      } else if (form.registeredAddressMode === "own" && need(form.ownRegisteredAddress)) {
        miss.push("Separate Registered Address (English)");
      }
      break;
    }
    /* C. Founder(s) */
    case "founders": {
      if (!Array.isArray(form.founders) || form.founders.length === 0) {
        miss.push("At least 1 Founder");
      }
      (form.founders || []).forEach((x, i) => {
        if (!x.type) miss.push(`Founder #${i + 1}: Type`);
        if (need(x.name)) miss.push(`Founder #${i + 1}: Name`);
        if (need(x.id)) miss.push(`Founder #${i + 1}: Passport/Reg. No.`);
        if (x.email && !emailOk(x.email)) miss.push(`Founder #${i + 1}: Email format`);
        if (x.tel && !phoneOk(x.tel)) miss.push(`Founder #${i + 1}: Phone format`);
      });
      break;
    }
    /* D. Foundation Council — Composition */
    case "council": {
      if (!form.councilMode) miss.push("Choose Council composition");
      if (form.councilMode === "ind3") {
        (form.councilIndividuals || []).forEach((m, i) => {
          if (need(m.name)) miss.push(`Council Member #${i + 1}: Name`);
          if (need(m.id)) miss.push(`Council Member #${i + 1}: Passport/ID No.`);
          if (m.email && !emailOk(m.email)) miss.push(`Council Member #${i + 1}: Email format`);
          if (m.tel && !phoneOk(m.tel)) miss.push(`Council Member #${i + 1}: Phone format`);
        });
        if (form.useNomineeDirector && !form.nomineePersons) {
          miss.push("Nominee Director — Number of Persons");
        }
      }
      if (form.councilMode === "corp1") {
        if (need(form.councilCorporate?.corpMain))
          miss.push("Council (Corporate): Entity Name / Reg. No. / Jurisdiction");
        if (need(form.councilCorporate?.addrRep))
          miss.push("Council (Corporate): Registered Address / Representative");
        if (form.councilCorporate?.email && !emailOk(form.councilCorporate.email))
          miss.push("Council (Corporate): Email format");
      }
      break;
    }
    /* E. Protector (optional) */
    case "protectors": {
      if (form.protectorsEnabled) {
        const list = form.protectors || [];
        if (list.length === 0) miss.push("At least 1 Protector");
        list.forEach((p, i) => {
          if (need(p.name)) miss.push(`Protector #${i + 1}: Name/Corporate/Class`);
        });
      }
      break;
    }
    /* F. Beneficiaries */
    case "beneficiaries": {
      if (!form.beneficiariesMode) miss.push("Beneficiaries: Mode");
      if (form.beneficiariesMode === "fixed" || form.beneficiariesMode === "mixed") {
        const list = form.beneficiaries || [];
        if (list.length === 0) miss.push("At least 1 Beneficiary");
        list.forEach((b, i) => {
          if (need(b.name)) miss.push(`Beneficiary #${i + 1}: Name/Corporate/Class`);
        });
      }
      // mode "class": free-form via Letter of Wishes; no hard requirement
      break;
    }
    /* G. By-Laws */
    case "bylaws": {
      if (!form.bylawsMode) miss.push("By-Laws: Select Standard or Custom");
      if (form.bylawsMode === "custom") {
        if (need(form.bylawsPowers) && need(form.bylawsAdmin)) {
          miss.push("By-Laws (Custom): Provide Powers and/or Admin details");
        }
      }
      break;
    }
    /* H. Economic Substance (informational only) */
    case "es": {
      break;
    }
    /* I. Banking */
    case "banking": {
      if (!form.bankingNeed) miss.push("Select whether you need to open an account");
      break;
    }
    /* J. PEP */
    case "pep": {
      // Field exists with default "no"; still ensure it is set to a valid value.
      if (form.pepAny !== "yes" && form.pepAny !== "no") miss.push("PEP confirmation (Yes/No)");
      break;
    }
    /* K. AML & Sanctions */
    case "aml": {
      if (need(form.legalAndEthicalConcern)) miss.push("AML Q1");
      if (need(form.q_country)) miss.push("AML Q2");
      if (need(form.sanctionsExposureDeclaration)) miss.push("AML Q3");
      if (need(form.crimeaSevastapolPresence)) miss.push("AML Q4");
      if (need(form.russianEnergyPresence)) miss.push("AML Q5");
      break;
    }
    /* L. Post-Incorporation Deliverables & Shipping */
    case "deliverables": {
      if (need(form.shippingRecipientCompany)) miss.push("Recipient Company");
      if (need(form.shippingContactPerson)) miss.push("Contact Person");
      if (need(form.shippingPhone)) miss.push("Phone");
      if (form.shippingPhone && !phoneOk(form.shippingPhone)) miss.push("Phone (format)");
      if (need(form.shippingPostalCode)) miss.push("Postal Code");
      if (need(form.shippingAddress)) miss.push("Address");
      break;
    }
    /* M. Accounting Record Storage */
    case "accounting": {
      if (need(form.recordStorageAddress)) miss.push("Accounting Record Storage Address");
      if (need(form.recordStorageResponsiblePerson))
        miss.push("Responsible Person (English Full Name)");
      break;
    }
    /* N. Invoice — no required fields */
    case "invoice": {
      break;
    }
    /* O. Payment — not enforced */
    case "payment": {
      break;
    }
    /* P. Declarations & e-Sign */
    case "declarations": {
      if (!form.taxOk) miss.push("Tax compliance confirmation");
      if (!form.truthOk) miss.push("Accuracy/completeness confirmation");
      if (!form.privacyOk) miss.push("Privacy/KYC consent");
      if (need(form.signName)) miss.push("Signature (type your name)");
      if (need(form.signDate)) miss.push("Date");
      // signTitle optional
      break;
    }
    default:
      break;
  }
  return miss;
}


export default function PanamaPIFWizard() {
  const [form, setForm] = useAtom(pifFormAtom)
  React.useEffect(() => {
    document.title = "Panama PIF Application - Mirr Asia"
  }, [])
  const config = panamaPIFConfig
  const [stepIdx, setStepIdx] = React.useState(0)
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [savingNext, setSavingNext] = React.useState(false)
  React.useEffect(() => {
    if (!form) setForm(initialPIF)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const step = config.steps[stepIdx]
  const goto = (i: number) => {
    setStepIdx(Math.max(0, Math.min(config.steps.length - 1, i)))
    setSidebarOpen(false)
  }

  const missing = requiredMissingForStep(form, step)
  const canNext = missing.length === 0

  const saveAll = async () => {
    try {
      const token = localStorage.getItem("token") as string;
      const decodedToken = jwtDecode<TokenData>(token);

      const payload = {
        ...form,
        userId: decodedToken?.userId ?? form.userId ?? "",
        updatedAt: new Date().toISOString(),
      };

      const result = await createOrUpdatePaFIncorpo(payload);
      if (result) {
        toast({ title: "Saved", description: "Your application data has been saved." });
        return true;
      }
      toast({ variant: "destructive", title: "Error", description: "Failed to save application. Please try again." });
      return false;
    } catch (e) {
      console.error("saveAll error", e);
      toast({ variant: "destructive", title: "Error", description: "Failed to save application. Please try again." });
      return false;
    }
  };


  const handleNext = async () => {
    if (stepIdx >= config.steps.length - 1) return;
    if (missing.length > 0) {
      toast({
        variant: "destructive",
        title: "Please complete required fields",
        description: missing.join(", "),
      });     
      return;
    }
    try {
      setSavingNext(true);
      const ok = await saveAll();
      if (!ok) return;
      // proceed to next step
      goto(stepIdx + 1);
      // reset the tried flag for the new step
    } finally {
      setSavingNext(false);
    }
  };

  const handleBack = () => goto(stepIdx - 1)

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
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-background border-r p-4 overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">{t("newHk.sidebar.stepsMenu", "Steps")}</h2>
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="h-8 w-8 p-0">
                  {t("newHk.sidebar.close", "✕")}
                </Button>
              </div>
              <SidebarPanama
                steps={config.steps as any}
                idx={stepIdx}
                goto={goto}
                canProceedFromCurrent={canNext}
              />
            </div>
          </div>
        )}

        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <SidebarPanama
            steps={config.steps as any}
            idx={stepIdx}
            goto={goto}
            canProceedFromCurrent={canNext}
          />
        </div>

        {/* Main content */}
        <div className="min-w-0">
          <Card>
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">
                {stepIdx + 1}. {(step as any).title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6">
              {"description" in step && step.description ? (
                <div className="border border-dashed rounded-lg p-3 bg-muted/20 text-xs sm:text-sm">
                  {step.description}
                </div>
              ) : null}

              {"fields" in step && step.fields?.length ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {step.fields.map((f, i) => (
                    <Field key={(f as any).name ?? i} field={f as FieldBase} />
                  ))}
                </div>
              ) : (step as any).render ? (
                React.createElement((step as any).render)
              ) : null}

              {missing.length > 0 && (
                <div className="text-xs sm:text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <strong>{t("newHk.validation.requiredFieldsPrefix", "Required fields:")}</strong>{" "}
                  {missing.join(", ")}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 sm:pt-6 px-4 sm:px-6">
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  disabled={stepIdx === 0}
                  onClick={handleBack}
                  className="flex-1 sm:flex-none touch-manipulation"
                >
                  {t("newHk.buttons.back", "← Back")}
                </Button>
              </div>

              {stepIdx !== config.steps.length - 1 && (
                <div className="w-full sm:w-auto">
                  <Button
                    onClick={handleNext}
                    disabled={savingNext}
                    className="w-full sm:w-auto touch-manipulation"
                  >
                    {savingNext ? t("newHk.buttons.saving", "Saving…") : t("newHk.buttons.next", "Next →")}
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 print:hidden">
            <div className="text-[12px] text-muted-foreground">© Mirr Asia · Panama PIF – Information & Intake Form</div>
            <div className="flex gap-2">
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
