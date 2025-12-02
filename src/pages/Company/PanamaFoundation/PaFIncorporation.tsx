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
import { sendInviteToShDir } from "@/services/dataFetch"
import CommonServiceAgrementTxt from "../CommonServiceAgrementTxt"

const STRIPE_CLIENT_ID =
  import.meta.env.VITE_STRIPE_DETAILS || process.env.REACT_APP_STRIPE_DETAILS;

const stripePromise = loadStripe(STRIPE_CLIENT_ID);


function TopBar({ title, totalSteps, idx }: { title: string; totalSteps: number; idx: number }) {
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
    return canProceedFromCurrent
  }

  const onTryGoto = (target: number) => {
    if (target === idx) return
    if (target < idx) {
      goto(target)
      return
    }
    if (!canProceedFromCurrent) {
      toast({
        title: t("newHk.sidebar.toasts.completeStepTitle"),
        description: t("newHk.sidebar.toasts.completeStepDesc"),
      })
      return
    }
    goto(target)
  }

  return (
    <aside className="space-y-4 sticky top-0 h-[calc(100vh-2rem)] overflow-auto p-0">
      {/* Brand / badges */}
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
                  {i + 1}. {t(s.title as string)}
                </div>
                <div className="shrink-0 flex items-center gap-1">
                  {isDone && (
                    <Badge variant="secondary" className="text-[10px] sm:text-xs flex items-center gap-1">
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
          )
        })}
        <p className="text-xs text-muted-foreground mt-2">
          {t("newHk.sidebar.needHelp")}
          <button
            className="text-sky-600 underline-offset-2 hover:underline touch-manipulation"
            onClick={() => toast({ title: t("ppif.sidebar.contactToastTitle"), description: t("ppif.sidebar.contactToastDesc") })}
          >
            {t("newHk.sidebar.chatCta")}
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
  const span = field.colSpan === 2 ? "lg:col-span-2" : ""
  const id = String(field.name)
  const set = (name: string, value: any) => setForm({ ...form, [name]: value })

  const labelEl = (
    <div className="flex items-center gap-2">
      <Label htmlFor={id} className={labelSm}>
        {typeof field.label === "string" ? t(field.label) : field.label}
      </Label>
      {field.required ? <span className="text-destructive">*</span> : null}
      {field.tooltip ? (
        <span title={field.tooltip as string} className="text-muted-foreground/80">
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
            placeholder={typeof field.placeholder === "string" ? t(field.placeholder) : field.placeholder}
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
            placeholder={typeof field.placeholder === "string" ? t(field.placeholder) : field.placeholder}
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
              <SelectValue placeholder={t("ppif.placeholders.select")} />
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
              {typeof field.label === "string" ? t(field.label) : field.label}
            </Label>
            {hintEl}
          </div>
        </div>
      )
    case "radio-group":
      return (
        <div className={`grid gap-3 ${span} w-full`}>
          {labelEl}
          <RadioGroup
            value={String((form as any)[id] ?? "")}
            onValueChange={(v) => set(id, v)}
            className="flex flex-col gap-2.5 w-full"
          >
            {(field.options || []).map((o) => (
              <label key={o.value} className="flex items-start gap-2 text-sm cursor-pointer group w-full">
                <RadioGroupItem value={o.value} id={`${id}-${o.value}`} />
                <span className="leading-relaxed text-foreground group-hover:opacity-90 transition-opacity">
                  {typeof o.label === "string" ? t(o.label) : o.label}
                </span>
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
  const [form, setForm] = useAtom(pifFormAtom);

  const f = form.founders[idx];
  const update = (patch: Partial<(typeof form)["founders"][number]>) => {
    const next = [...form.founders];
    next[idx] = { ...next[idx], ...patch };
    setForm({ ...form, founders: next });
  };

  return (
    <Card className="border">
      <CardHeader className="py-3">
        <CardTitle className="text-base font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span>{t("ppif.founders.title", { n: idx + 1 })}</span>
          </div>

          {canRemove ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(idx)}
              className="text-muted-foreground hover:text-destructive"
              aria-label={t("ppif.founders.removeAria", { n: idx + 1 })}
              title={t("ppif.founders.removeTitle")}
            >
              <Trash className="h-4 w-4" />
            </Button>
          ) : null}
        </CardTitle>
      </CardHeader>

      <CardContent className="grid md:grid-cols-2 gap-3">
        {/* Founder Type */}
        <div className="grid gap-1.5">
          <Label className={labelSm}>
            {t("ppif.founders.type.label")}
            <span className="text-destructive">
              {t("ppif.validation.requiredAsterisk")}
            </span>
          </Label>

          <RadioGroup
            value={f.type}
            onValueChange={(v: "individual" | "corporate") => update({ type: v })}
            className="flex gap-6"
          >
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <RadioGroupItem value="individual" id={`f-type-i-${idx}`} />
              {t("ppif.founders.type.options.individual")}
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <RadioGroupItem value="corporate" id={`f-type-c-${idx}`} />
              {t("ppif.founders.type.options.corporate")}
            </label>
          </RadioGroup>
        </div>

        {/* Name */}
        <div className="grid gap-1.5">
          <Label className={labelSm}>
            {t("ppif.founders.name.label")}
            <span className="text-destructive">
              {t("ppif.validation.requiredAsterisk")}
            </span>
          </Label>
          <Input
            className={inputSm}
            value={f.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder={t("ppif.founders.name.placeholder")}
          />
        </div>

        {/* ID */}
        <div className="grid gap-1.5">
          <Label className={labelSm}>
            {t("ppif.founders.id.label")}
            <span className="text-destructive">
              {t("ppif.validation.requiredAsterisk")}
            </span>
          </Label>
          <Input
            className={inputSm}
            value={f.id}
            onChange={(e) => update({ id: e.target.value })}
            placeholder={t("ppif.founders.id.placeholder")}
          />
        </div>

        {/* Email */}
        <div className="grid gap-1.5">
          <Label className={labelSm}>{t("ppif.founders.email.label")}</Label>
          <Input
            className={inputSm}
            type="email"
            value={f.email || ""}
            onChange={(e) => update({ email: e.target.value })}
            placeholder={t("ppif.founders.email.placeholder")}
          />
        </div>

        {/* Phone */}
        <div className="grid gap-1.5">
          <Label className={labelSm}>{t("ppif.founders.phone.label")}</Label>
          <Input
            className={inputSm}
            value={f.tel || ""}
            onChange={(e) => update({ tel: e.target.value })}
            placeholder={t("ppif.founders.phone.placeholder")}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function FoundersManager() {
  const [form, setForm] = useAtom(pifFormAtom);

  const add = () =>
    setForm({
      ...form,
      founders: [...form.founders, { type: "", name: "", id: "", email: "", tel: "", status: "Pending" }],
    });

  const removeAt = (idx: number) => {
    if (form.founders.length <= 1) return;
    const next = form.founders.filter((_, i) => i !== idx);
    setForm({ ...form, founders: next });
  };

  const inviteFounderMembers = async () => {
    const extractedData = (form.founders || []).map((f) => ({
      name: f.name,
      email: f.email ? f.email : "",
    }));
    const payload = { _id: form._id || "", inviteData: extractedData, country: "pif" };

    try {
      const response = await sendInviteToShDir(payload);
      const successful = response?.summary?.successful ?? 0;
      const alreadyExists = response?.summary?.alreadyExists ?? 0;

      if (successful > 0) {
        setForm((prev) => ({
          ...prev,
          founders: (prev.founders || []).map((f) => ({ ...f, status: "Sent Invitation" })),
        }));
        toast({
          title: t("ppif.founders.toasts.invite.success.title"),
          description: t("ppif.founders.toasts.invite.success.desc", { count: successful }),
        });
      } else if (alreadyExists > 0) {
        setForm((prev) => ({
          ...prev,
          founders: (prev.founders || []).map((f) => ({ ...f, status: "Resent Invitation" })),
        }));
        toast({
          title: t("ppif.founders.toasts.invite.alreadyExists.title"),
          description: t("ppif.founders.toasts.invite.alreadyExists.desc", { count: alreadyExists }),
        });
      } else {
        toast({
          title: t("ppif.founders.toasts.invite.none.title"),
          description: t("ppif.founders.toasts.invite.none.desc"),
          variant: "destructive",
        });
      }

    } catch (e) {
      // Fallback to the "none" message on error
      toast({
        title: t("ppif.founders.toasts.invite.none.title"),
        description: t("ppif.founders.toasts.invite.none.desc"),
        variant: "destructive",
      });
      console.error("inviteFounderMembers error", e);
    }
  };

  return (
    <div className="space-y-3">
      <InfoBox>
        <strong>{t("ppif.founders.info.title")}</strong>: {t("ppif.founders.info.body")}
      </InfoBox>

      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={add}>
          <Users className="h-4 w-4 mr-2" />
          {t("ppif.founders.buttons.addFounder")}
        </Button>
      </div>

      {(form.founders || []).map((_, i) => (
        <FounderCard
          key={i}
          idx={i}
          onRemove={removeAt}
          canRemove={(form.founders || []).length > 1}
        />
      ))}

      <div className="flex justify-end pt-2">
        <Button onClick={inviteFounderMembers}>
          {t("ppif.founders.buttons.invite")}
        </Button>
      </div>
    </div>
  );
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
          form.councilIndividuals?.[2] ?? { type: "individual", name: "", id: "", email: "", tel: "" }
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

  const c = form.councilCorporate || { corpMain: "", addrRep: "", signatory: "", email: "" };
  const updateCorp = (patch: Partial<typeof c>) => set({ councilCorporate: { ...c, ...patch } });

  const showIndividuals = form.councilMode !== "corp1";
  const showCorporate = form.councilMode === "corp1";

  const inviteCouncilMembers = async () => {
    let payload = {
      _id: form._id || "",
      inviteData: [{ email: c.email ?? "", name: c.corpMain }],
      country: "pif"
    };

    if (form.councilMode === "ind3" && form.councilIndividuals) {
      const extractedData = form.councilIndividuals.map((m) => ({ name: m.name ?? "", email: m.email ?? "" }));
      payload = { _id: form._id || "", inviteData: extractedData, country: "pif" };
    }

    try {
      const response = await sendInviteToShDir(payload);
      const successful = response?.summary?.successful ?? 0;
      const alreadyExists = response?.summary?.alreadyExists ?? 0;

      if (successful > 0) {
        setForm((prev) => ({
          ...prev,
          councilIndividuals: (prev.councilIndividuals || []).map((f) => ({ ...f, status: "Sent Invitation" })),
          users:response.users
        }));
        toast({
          title: t("ppif.council.toasts.invite.success.title"),
          description: t("ppif.council.toasts.invite.success.desc")
        });
      } else if (alreadyExists > 0) {
        setForm((prev) => ({
          ...prev,
          councilIndividuals: (prev.councilIndividuals || []).map((f) => ({ ...f, status: "Resent Invitation" })),
          users:response.users
        }));
        toast({
          title: t("ppif.council.toasts.invite.alreadyExists.title"),
          description: t("ppif.council.toasts.invite.alreadyExists.desc", { count: alreadyExists })
        });
      } else {
        toast({
          title: t("ppif.council.toasts.invite.none.title"),
          description: t("ppif.council.toasts.invite.none.desc"),
          variant: "destructive"
        });
      }
    } catch (e) {
      toast({
        title: t("ppif.council.toasts.invite.none.title"),
        description: t("ppif.council.toasts.invite.none.desc"),
        variant: "destructive"
      });
      console.error("inviteCouncilMembers error", e);
    }
  };

  return (
    <div className="space-y-4">
      {/* Composition */}
      <Card className="border">
        <CardHeader className="py-3">
          <CardTitle className="text-sm">{t("ppif.council.composition.title")}</CardTitle>
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
                <Label htmlFor="c-mode-ind3" className="cursor-pointer">
                  {t("ppif.council.composition.modes.ind3")}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="corp1" id="c-mode-corp1" />
                <Label htmlFor="c-mode-corp1" className="cursor-pointer">
                  {t("ppif.council.composition.modes.corp1")}
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Individuals */}
      {showIndividuals && (
        <Card className="border">
          <CardHeader className="py-3">
            <CardTitle className="text-sm">{t("ppif.council.individuals.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border border-border p-2.5 text-[13px] bg-muted/30">
              {t("ppif.council.individuals.note")}
            </div>

            {form.councilIndividuals.map((m, i) => (
              <Card key={i} className="border border-dashed">
                <CardHeader className="py-2.5">
                  <CardTitle className="text-sm">
                    {t("ppif.council.individuals.memberCardTitle", { n: i + 1 })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label className={labelSm}>
                      {t("ppif.council.individuals.fields.name.label")}
                      <span className="text-destructive">{t("ppif.validation.requiredAsterisk")}</span>
                    </Label>
                    <Input
                      className={inputSm}
                      value={m.name}
                      onChange={(e) => updateInd(i, { name: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <Label className={labelSm}>
                      {t("ppif.council.individuals.fields.id.label")}
                      <span className="text-destructive">{t("ppif.validation.requiredAsterisk")}</span>
                    </Label>
                    <Input
                      className={inputSm}
                      value={m.id}
                      onChange={(e) => updateInd(i, { id: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <Label className={labelSm}>
                      {t("ppif.council.individuals.fields.email.label")}
                    </Label>
                    <Input
                      className={inputSm}
                      type="email"
                      value={m.email || ""}
                      onChange={(e) => updateInd(i, { email: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <Label className={labelSm}>
                      {t("ppif.council.individuals.fields.phone.label")}
                    </Label>
                    <Input
                      className={inputSm}
                      value={m.tel || ""}
                      onChange={(e) => updateInd(i, { tel: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <Label className="text-xs text-gray-600 mb-1">
                      {t(
                        "newHk.company.fields.isDcp.label",
                        "Will this person act as DCP?"
                      )}{" "}
                      <Tip
                        text={t(
                          "newHk.company.fields.isDcp.tip",
                          "Designated Contact Person for compliance/communication."
                        )}
                      />
                    </Label>
                    <Select
                      value={String(m.isDcp ?? false)}
                      // disabled={isLocked}
                      onValueChange={(v) =>
                        updateInd(i, {
                          isDcp: v === "true",
                        })
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">
                          {t(
                            "newHk.parties.fields.isDirector.options.yes"
                          )}
                        </SelectItem>
                        <SelectItem value="false">
                          {t(
                            "newHk.parties.fields.isDirector.options.no"
                          )}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="hr h-px bg-border" />

            <Label className={labelSm}>{t("ppif.council.individuals.nominee.askLabel")}</Label>
            <div className="flex items-center gap-2">
              <Checkbox
                id="useNominee"
                checked={form.useNomineeDirector}
                onCheckedChange={(v) => set({ useNomineeDirector: Boolean(v) })}
              />
              <Label htmlFor="useNominee" className={labelSm}>
                {t("ppif.council.individuals.nominee.checkboxLabel")}
              </Label>
            </div>

            {form.useNomineeDirector && (
              <div id="nomineeBlock" className="space-y-3">
                <InfoBox>
                  <b>{t("ppif.council.individuals.nominee.infoTitle")}</b>
                  <br />
                  {t("ppif.council.individuals.nominee.infoBody")}
                </InfoBox>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label className={labelSm}>{t("ppif.council.individuals.nominee.countLabel")}</Label>
                    <Select
                      value={form.nomineePersons || undefined}
                      onValueChange={(v: "1" | "2" | "3") => set({ nomineePersons: v })}
                    >
                      <SelectTrigger className={inputSm}>
                        {/* reuse global Select placeholder from earlier JSON */}
                        <SelectValue placeholder={t("ppif.profile.sourceOfFunds.placeholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">{t("ppif.council.individuals.nominee.options.1")}</SelectItem>
                        <SelectItem value="2">{t("ppif.council.individuals.nominee.options.2")}</SelectItem>
                        <SelectItem value="3">{t("ppif.council.individuals.nominee.options.3")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Corporate */}
      {showCorporate && (
        <Card className="border">
          <CardHeader className="py-3">
            <CardTitle className="text-sm">{t("ppif.council.corporate.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border border-border p-2.5 text-[13px] bg-muted/30">
              {t("ppif.council.corporate.note")}
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className={labelSm}>
                  {t("ppif.council.corporate.fields.corpMain.label")}
                  <span className="text-destructive">{t("ppif.validation.requiredAsterisk")}</span>
                </Label>
                <Input
                  className={inputSm}
                  value={c.corpMain}
                  onChange={(e) => updateCorp({ corpMain: e.target.value })}
                  placeholder={t("ppif.council.corporate.fields.corpMain.placeholder")}
                />
              </div>

              <div className="grid gap-1.5">
                <Label className={labelSm}>
                  {t("ppif.council.corporate.fields.addrRep.label")}
                  <span className="text-destructive">{t("ppif.validation.requiredAsterisk")}</span>
                </Label>
                <Input
                  className={inputSm}
                  value={c.addrRep}
                  onChange={(e) => updateCorp({ addrRep: e.target.value })}
                />
              </div>

              <div className="grid gap-1.5">
                <Label className={labelSm}>
                  {t("ppif.council.corporate.fields.signatory.label")}
                </Label>
                <Input
                  className={inputSm}
                  value={c.signatory || ""}
                  onChange={(e) => updateCorp({ signatory: e.target.value })}
                  placeholder={t("ppif.council.corporate.fields.signatory.placeholder")}
                />
              </div>

              <div className="grid gap-1.5">
                <Label className={labelSm}>
                  {t("ppif.council.corporate.fields.email.label")}
                </Label>
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
        <Button onClick={inviteCouncilMembers}>
          {t("ppif.council.buttons.invite")}
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
                {t("ppif.shared.repeater.title", { title, n: i + 1 })}
              </span>
              {onRemove ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(i)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={t("ppif.shared.repeater.removeAria", { title, n: i + 1 })}
                  title={t("ppif.shared.repeater.removeTitle")}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              ) : null}
            </CardTitle>
          </CardHeader>

          <CardContent className="grid md:grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label className={labelSm}>
                {t("ppif.shared.repeater.fields.name.label")}
              </Label>
              <Input
                className={inputSm}
                value={it.name}
                onChange={(e) => onUpdate(i, { name: e.target.value })}
              />
            </div>

            <div className="grid gap-1.5">
              <Label className={labelSm}>
                {t("ppif.shared.repeater.fields.contact.label")}
              </Label>
              <Input
                className={inputSm}
                value={it.contact}
                placeholder={t("ppif.shared.repeater.fields.contact.placeholder")}
                onChange={(e) => onUpdate(i, { contact: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ProtectorsManager() {
  const [form, setForm] = useAtom(pifFormAtom);

  const add = () =>
    setForm({ ...form, protectors: [...form.protectors, { name: "", contact: "" }] });

  const update = (idx: number, patch: Partial<{ name: string; contact: string }>) => {
    const next = [...form.protectors];
    next[idx] = { ...next[idx], ...patch } as any;
    setForm({ ...form, protectors: next });
  };

  const remove = (idx: number) => {
    const next = form.protectors.filter((_, i) => i !== idx);
    setForm({ ...form, protectors: next.length ? next : [{ name: "", contact: "" }] });
  };

  const inviteProtectors = async () => {
    const extractedData = (form.protectors || []).map((p) => ({
      name: p.name,
      email: p.contact ? p.contact : "",
    }));
    const payload = { _id: form._id || "", inviteData: extractedData, country: "pif" };

    try {
      const response = await sendInviteToShDir(payload);
      const successful = response?.summary?.successful ?? 0;
      const alreadyExists = response?.summary?.alreadyExists ?? 0;

      if (successful > 0) {
        setForm((prev) => ({
          ...prev,
          protectors: (prev.protectors || []).map((f) => ({ ...f, status: "Sent Invitation" })),
        }));
        toast({
          title: t("ppif.protectors.toasts.invite.success.title"),
          description: t("ppif.protectors.toasts.invite.success.desc", {
            count: successful,
          }),
        });
      } else if (alreadyExists > 0) {
        setForm((prev) => ({
          ...prev,
          protectors: (prev.protectors || []).map((f) => ({ ...f, status: "Resent Invitation" })),
        }));
        toast({
          title: t("ppif.protectors.toasts.invite.alreadyExists.title"),
          description: t("ppif.protectors.toasts.invite.alreadyExists.desc", {
            count: alreadyExists,
          }),
        });
      } else {
        toast({
          title: t("ppif.protectors.toasts.invite.none.title"),
          description: t("ppif.protectors.toasts.invite.none.desc"),
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: t("ppif.protectors.toasts.invite.none.title"),
        description: t("ppif.protectors.toasts.invite.none.desc"),
        variant: "destructive",
      });
      console.error("inviteProtectors error", e);
    }
  };

  return (
    <div className="space-y-3">
      <InfoBox>
        <span>
          <b>Protector</b> — {t("ppif.protectors.info.body")}
        </span>
        <br />
        <span>{t("ppif.protectors.info.examples")}</span>
      </InfoBox>

      <div className="flex flex-wrap items-center gap-4">
        <RadioGroup
          value={form.protectorsEnabled ? "yes" : "no"}
          onValueChange={(v) => setForm({ ...form, protectorsEnabled: v === "yes" })}
          className="flex gap-6"
        >
          <label className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="yes" /> {t("ppif.protectors.controls.appoint")}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="no" /> {t("ppif.protectors.controls.doNotAppoint")}
          </label>
        </RadioGroup>

        {form.protectorsEnabled && (
          <Button variant="outline" onClick={add}>
            {t("ppif.protectors.controls.add")}
          </Button>
        )}
      </div>

      {form.protectorsEnabled ? (
        <SimpleRepeater
          title={t("ppif.protectors.itemTitle")}
          items={form.protectors}
          onUpdate={update}
          onRemove={remove}
        />
      ) : null}

      <div className="flex justify-end pt-2">
        <Button onClick={inviteProtectors}>
          {t("ppif.protectors.buttons.invite")}
        </Button>
      </div>
    </div>
  );
}
function BeneficiariesManager() {
  const [form, setForm] = useAtom(pifFormAtom);

  const add = () =>
    setForm({
      ...form,
      beneficiaries: [...form.beneficiaries, { name: "", contact: "" }]
    });

  const update = (idx: number, patch: Partial<{ name: string; contact: string }>) => {
    const next = [...form.beneficiaries];
    next[idx] = { ...next[idx], ...patch } as any;
    setForm({ ...form, beneficiaries: next });
  };

  const remove = (idx: number) => {
    const next = form.beneficiaries.filter((_, i) => i !== idx);
    setForm({ ...form, beneficiaries: next.length ? next : [{ name: "", contact: "" }] });
  };

  const inviteBeneficiaries = async () => {
    const extractedData = (form.beneficiaries || []).map((f) => ({
      name: f.name,
      email: f.contact ? f.contact : ""
    }));
    const payload = { _id: form._id || "", inviteData: extractedData, country: "pif" };

    try {
      const response = await sendInviteToShDir(payload);
      const successful = response?.summary?.successful ?? 0;
      const alreadyExists = response?.summary?.alreadyExists ?? 0;

      if (successful > 0) {
        toast({
          title: t("ppif.beneficiaries.toasts.invite.success.title"),
          description: t("ppif.beneficiaries.toasts.invite.success.desc", { count: successful })
        });
      } else if (alreadyExists > 0) {
        toast({
          title: t("ppif.beneficiaries.toasts.invite.alreadyExists.title"),
          description: t("ppif.beneficiaries.toasts.invite.alreadyExists.desc", { count: alreadyExists })
        });
      } else {
        toast({
          title: t("ppif.beneficiaries.toasts.invite.none.title"),
          description: t("ppif.beneficiaries.toasts.invite.none.desc"),
          variant: "destructive"
        });
      }
    } catch (e) {
      toast({
        title: t("ppif.beneficiaries.toasts.invite.none.title"),
        description: t("ppif.beneficiaries.toasts.invite.none.desc"),
        variant: "destructive"
      });
      console.error("inviteBeneficiaries error", e);
    }
  };

  return (
    <section className="space-y-3">
      <InfoBox>
        <b>{t("ppif.beneficiaries.info.designTitle")}</b>: {t("ppif.beneficiaries.info.designBody")}
        <br />
        <b>{t("ppif.beneficiaries.info.lowTitle")}</b> — {t("ppif.beneficiaries.info.lowBody")}
      </InfoBox>

      {/* Mode + Add button */}
      <div className="flex flex-wrap items-center gap-4">
        <RadioGroup
          value={form.beneficiariesMode}
          onValueChange={(v: "fixed" | "class" | "mixed") => setForm({ ...form, beneficiariesMode: v })}
          className="flex gap-6"
        >
          <div className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="fixed" id="ben-mode-fixed" />
            <Label htmlFor="ben-mode-fixed" className="cursor-pointer">
              {t("ppif.beneficiaries.modes.fixed")}
            </Label>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="class" id="ben-mode-class" />
            <Label htmlFor="ben-mode-class" className="cursor-pointer">
              {t("ppif.beneficiaries.modes.class")}
            </Label>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="mixed" id="ben-mode-mixed" />
            <Label htmlFor="ben-mode-mixed" className="cursor-pointer">
              {t("ppif.beneficiaries.modes.mixed")}
            </Label>
          </div>
        </RadioGroup>

        <Button variant="outline" onClick={add} id="addBen">
          {t("ppif.beneficiaries.controls.add")}
        </Button>
      </div>

      {/* Beneficiaries list */}
      <SimpleRepeater
        title={t("ppif.beneficiaries.itemTitle")}
        items={form.beneficiaries}
        onUpdate={update}
        onRemove={remove}
      />

      {/* Letter of Wishes */}
      <div className="grid gap-1.5">
        <Label className={labelSm}>{t("ppif.beneficiaries.letterOfWishes.label")}</Label>
        <Textarea
          className="text-sm"
          rows={4}
          placeholder={t("ppif.beneficiaries.letterOfWishes.placeholder")}
          value={form.letterOfWishes || ""}
          onChange={(e) => setForm({ ...form, letterOfWishes: e.target.value })}
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={inviteBeneficiaries}>
          {t("ppif.beneficiaries.buttons.invite")}
        </Button>
      </div>
    </section>
  );
}

function BylawsStep() {
  const [form, setForm] = useAtom(pifFormAtom);

  return (
    <div className="space-y-3">
      <RadioGroup
        value={form.bylawsMode}
        onValueChange={(v: "standard" | "custom") => setForm({ ...form, bylawsMode: v })}
        className="flex gap-6"
      >
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <RadioGroupItem value="standard" id="bylaws-standard" />
          <Label htmlFor="bylaws-standard" className="cursor-pointer">
            {t("ppif.bylaws.modes.standard")}
          </Label>
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <RadioGroupItem value="custom" id="bylaws-custom" />
          <Label htmlFor="bylaws-custom" className="cursor-pointer">
            {t("ppif.bylaws.modes.custom")}
          </Label>
        </label>
      </RadioGroup>

      {form.bylawsMode === "custom" && (
        <div className="grid md:grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label className={labelSm}>{t("ppif.bylaws.fields.powers.label")}</Label>
            <Textarea
              className="text-sm"
              placeholder={t("ppif.bylaws.fields.powers.placeholder")}
              value={form.bylawsPowers}
              onChange={(e) => setForm({ ...form, bylawsPowers: e.target.value })}
            />
          </div>

          <div className="grid gap-1.5">
            <Label className={labelSm}>{t("ppif.bylaws.fields.admin.label")}</Label>
            <Textarea
              className="text-sm"
              placeholder={t("ppif.bylaws.fields.admin.placeholder")}
              value={form.bylawsAdmin}
              onChange={(e) => setForm({ ...form, bylawsAdmin: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function BankingStep() {
  const [form, setForm] = useAtom(pifFormAtom);
  const showGuide = form.bankingNeed === "need";

  return (
    <div className="space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        {/* Need to open an account */}
        <div className="grid gap-1.5">
          <Label className={labelSm}>
            {t("ppif.banking.need.label")}
            <span className="text-destructive">{t("ppif.validation.requiredAsterisk")}</span>
          </Label>

          <RadioGroup
            value={form.bankingNeed}
            onValueChange={(v: "need" | "none" | "later") => setForm({ ...form, bankingNeed: v })}
            className="flex gap-6"
          >
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <RadioGroupItem value="need" id="bank-need-yes" />
              <span>{t("ppif.banking.need.options.need")}</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <RadioGroupItem value="none" id="bank-need-no" />
              <span>{t("ppif.banking.need.options.none")}</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <RadioGroupItem value="later" id="bank-need-later" />
              <span>{t("ppif.banking.need.options.later")}</span>
            </label>
          </RadioGroup>
        </div>

        {/* Business activity type */}
        <div className="grid gap-1.5">
          <Label className={labelSm}>{t("ppif.banking.bizType.label")}</Label>

          <Select
            value={form.bankingBizType || undefined}
            onValueChange={(v) => setForm({ ...form, bankingBizType: v as any })}
          >
            <SelectTrigger className={inputSm}>
              {/* reuse shared Select placeholder from profile */}
              <SelectValue placeholder={t("ppif.profile.sourceOfFunds.placeholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="consulting">{t("ppif.banking.bizType.options.consulting")}</SelectItem>
              <SelectItem value="ecommerce">{t("ppif.banking.bizType.options.ecommerce")}</SelectItem>
              <SelectItem value="investment">{t("ppif.banking.bizType.options.investment")}</SelectItem>
              <SelectItem value="crypto">{t("ppif.banking.bizType.options.crypto")}</SelectItem>
              <SelectItem value="manufacturing">{t("ppif.banking.bizType.options.manufacturing")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Guidance box */}
      {showGuide && (
        <div className="space-y-2">
          <div className="rounded-md border border-border p-2.5 text-[13px] bg-muted/30">
            <b>{t("ppif.banking.guide.title")}</b>
            <ul className="list-disc ml-6 mt-1.5 space-y-1">
              <li>{t("ppif.banking.guide.list.panama")}</li>
              <li><b>{t("ppif.banking.bizType.options.crypto")}</b>: {t("ppif.banking.guide.list.crypto")}</li>
              <li>{t("ppif.banking.guide.list.emi")}</li>
            </ul>
          </div>

          {form.bankingBizType && (
            <div className="text-[13px] text-muted-foreground">
              {t("ppif.banking.guide.activityLabel")} {t(`ppif.banking.hints.${form.bankingBizType}`)}
            </div>
          )}

          <div className="text-[12px] text-muted-foreground">
            {t("ppif.banking.guide.docsNote")}
          </div>
        </div>
      )}
    </div>
  );
}

function DeliverablesStep() {
  const [form, setForm] = useAtom(pifFormAtom);
  const set = (patch: Partial<PanamaPIFForm>) => setForm({ ...form, ...patch });

  const items: Array<string> = [
    "publicDeed",
    "publicDeedTranslation",
    "registryCert",
    "registryCertTranslation",
    "foundationCert",
    "foundationCertTranslation",
    "councilRegister",
    "councilAcceptance",
    "bylaws",
    "boardMeeting",
    "incumbencyCert",
    "nomineeAgreement",
    "companyChop"
  ];

  return (
    <div className="grid md:grid-cols-2 gap-3">
      {/* Left: Deliverables list with collapsibles */}
      <div className="space-y-2">
        <div className="font-medium text-foreground">
          {t("ppif.deliverables.left.title")}
        </div>

        <div className="rounded-md border p-2.5 text-[13px] text-muted-foreground dl-list">
          {items.map((k) => (
            <details className="mb-1.5" key={k}>
              <summary className="cursor-pointer">
                {t(`ppif.deliverables.left.items.${k}.title`)}
              </summary>
              <div>
                {t(`ppif.deliverables.left.items.${k}.desc`)}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Right: Original Shipping Details */}
      <div className="space-y-3">
        <div className="text-[13px] text-muted-foreground">
          <span className="font-medium text-foreground">
            {t("ppif.deliverables.right.title")}
          </span>{" "}
          <span className="text-xs">
            {t("ppif.deliverables.right.note")}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label className={labelSm}>
              {t("ppif.deliverables.right.fields.recipientCompany.label")}
              <span className="text-destructive">
                {t("ppif.validation.requiredAsterisk")}
              </span>
            </Label>
            <Input
              className={inputSm}
              value={form.shippingRecipientCompany || ""}
              onChange={(e) => set({ shippingRecipientCompany: e.target.value })}
              placeholder={t("ppif.deliverables.right.fields.recipientCompany.placeholder")}
            />
          </div>

          <div className="grid gap-1.5">
            <Label className={labelSm}>
              {t("ppif.deliverables.right.fields.contactPerson.label")}
              <span className="text-destructive">
                {t("ppif.validation.requiredAsterisk")}
              </span>
            </Label>
            <Input
              className={inputSm}
              value={form.shippingContactPerson || ""}
              onChange={(e) => set({ shippingContactPerson: e.target.value })}
              placeholder={t("ppif.deliverables.right.fields.contactPerson.placeholder")}
            />
          </div>

          <div className="grid gap-1.5">
            <Label className={labelSm}>
              {t("ppif.deliverables.right.fields.phone.label")}
              <span className="text-destructive">
                {t("ppif.validation.requiredAsterisk")}
              </span>
            </Label>
            <Input
              className={inputSm}
              type="tel"
              value={form.shippingPhone || ""}
              onChange={(e) => set({ shippingPhone: e.target.value })}
              placeholder={t("ppif.deliverables.right.fields.phone.placeholder")}
            />
          </div>

          <div className="grid gap-1.5">
            <Label className={labelSm}>
              {t("ppif.deliverables.right.fields.postalCode.label")}
              <span className="text-destructive">
                {t("ppif.validation.requiredAsterisk")}
              </span>
            </Label>
            <Input
              className={inputSm}
              value={form.shippingPostalCode || ""}
              onChange={(e) => set({ shippingPostalCode: e.target.value })}
              placeholder={t("ppif.deliverables.right.fields.postalCode.placeholder")}
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label className={labelSm}>
            {t("ppif.deliverables.right.fields.address.label")}
            <span className="text-destructive">
              {t("ppif.validation.requiredAsterisk")}
            </span>
          </Label>
          <Textarea
            className="text-sm"
            rows={4}
            placeholder={t("ppif.deliverables.right.fields.address.placeholder")}
            value={form.shippingAddress || ""}
            onChange={(e) => set({ shippingAddress: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}


function DeclarationsStep() {
  const [form, setForm] = useAtom(pifFormAtom);
  const set = (patch: Partial<PanamaPIFForm>) => setForm({ ...form, ...patch });
  const EN_NAME_PATTERN = "^[A-Za-z][A-Za-z .'-]*[A-Za-z]$";
  const sanitizeEnglishName = (v: string) =>
    v
      .replace(/[^A-Za-z .'-]/g, "")     // strip non-English chars
      .replace(/\s+/g, " ")              // collapse spaces
      .replace(/^\s+|\s+$/g, "");

  const signName = form.signName ?? "";
  const signNameClean = sanitizeEnglishName(signName);
  const isSignNameValid =
    !signNameClean || new RegExp(EN_NAME_PATTERN).test(signNameClean);
  const signNameError =
    signName && !isSignNameValid
      ? "English letters only (A–Z, spaces, '.', ''', '-')."
      : "";
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <Checkbox checked={form.taxOk} onCheckedChange={(v) => set({ taxOk: Boolean(v) })} />
        <span className="text-sm">
          {t("ppif.declarations.checks.taxOk")}
          <span className="text-destructive">{t("ppif.validation.requiredAsterisk")}</span>
        </span>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox checked={form.truthOk} onCheckedChange={(v) => set({ truthOk: Boolean(v) })} />
        <span className="text-sm">
          {t("ppif.declarations.checks.truthOk")}
          <span className="text-destructive">{t("ppif.validation.requiredAsterisk")}</span>
        </span>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox checked={form.privacyOk} onCheckedChange={(v) => set({ privacyOk: Boolean(v) })} />
        <span className="text-sm">
          {t("ppif.declarations.checks.privacyOk")}
          <span className="text-destructive">{t("ppif.validation.requiredAsterisk")}</span>
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-3 mt-2">
        <div className="grid gap-1.5">
          <Label className={labelSm}>
            {t("ppif.declarations.fields.signName.label")}
            <span className="text-destructive">{t("ppif.validation.requiredAsterisk")}</span>
          </Label>
          <Input
            className={inputSm}
            required
            value={signName}
            onChange={(e) => set({ signName: sanitizeEnglishName(e.target.value) })}
            placeholder={t("ppif.declarations.fields.signName.placeholder")}
            inputMode="text"
            autoComplete="name"
            // native validation (also helps on form submit)
            pattern={EN_NAME_PATTERN}
            title="English letters only (A–Z, spaces, ., ', -)"
            aria-invalid={!!signNameError}
          />
          {signNameError && (
            <span className="text-[12px] text-destructive">{signNameError}</span>
          )}
        </div>

        <div className="grid gap-1.5">
          <Label className={labelSm}>
            {t("ppif.declarations.fields.signDate.label")}
            <span className="text-destructive">{t("ppif.validation.requiredAsterisk")}</span>
          </Label>
          <Input
            className={inputSm}
            type="date"
            value={form.signDate}
            onChange={(e) => set({ signDate: e.target.value })}
          />
        </div>

        <div className="grid gap-1.5 md:col-span-2">
          <Label className={labelSm}>{t("ppif.declarations.fields.signTitle.label")}</Label>
          <Input
            className={inputSm}
            value={form.signTitle || ""}
            onChange={(e) => set({ signTitle: e.target.value })}
            placeholder={t("ppif.declarations.fields.signTitle.placeholder")}
          />
        </div>

        <div className="text-[12px] text-muted-foreground md:col-span-2">
          {t("ppif.declarations.footnote")}
        </div>
      </div>
    </div>
  );
}

function AMLStep() {
  const [form, setForm] = useAtom(pifFormAtom);
  const set = (patch: Partial<PanamaPIFForm>) => setForm({ ...form, ...patch });

  const yesLabel = t("ppif.pep.options.yes");
  const noLabel = t("ppif.pep.options.no");

  return (
    <div className="space-y-4">
      <InfoBox>{t("ppif.aml.info")}</InfoBox>
      {/* 1) legalAndEthicalConcern */}
      <div className="rounded-lg border p-3 space-y-2">
        <div className="text-sm">
          <b>1)</b> {t("ppif.aml.q1.label")}
        </div>
        <RadioGroup
          className="flex gap-6"
          value={form.legalAndEthicalConcern || ""}
          onValueChange={(v: "yes" | "no" | "") => set({ legalAndEthicalConcern: v })}
        >
          <label className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="yes" /> {yesLabel}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="no" /> {noLabel}
          </label>
        </RadioGroup>
      </div>

      {/* 2) q_country */}
      <div className="rounded-lg border p-3 space-y-2">
        <div className="text-sm">
          <b>2)</b> {t("ppif.aml.q2.label")}
        </div>
        <RadioGroup
          className="flex gap-6"
          value={form.q_country || ""}
          onValueChange={(v: "yes" | "no" | "") => set({ q_country: v })}
        >
          <label className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="yes" /> {yesLabel}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="no" /> {noLabel}
          </label>
        </RadioGroup>
      </div>

      {/* 3) sanctionsExposureDeclaration */}
      <div className="rounded-lg border p-3 space-y-2">
        <div className="text-sm">
          <b>3)</b> {t("ppif.aml.q3.label")}
        </div>
        <RadioGroup
          className="flex gap-6"
          value={form.sanctionsExposureDeclaration || ""}
          onValueChange={(v: "yes" | "no" | "") => set({ sanctionsExposureDeclaration: v })}
        >
          <label className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="yes" /> {yesLabel}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="no" /> {noLabel}
          </label>
        </RadioGroup>
      </div>

      {/* 4) crimeaSevastapolPresence */}
      <div className="rounded-lg border p-3 space-y-2">
        <div className="text-sm">
          <b>4)</b> {t("ppif.aml.q4.label")}
        </div>
        <RadioGroup
          className="flex gap-6"
          value={form.crimeaSevastapolPresence || ""}
          onValueChange={(v: "yes" | "no" | "") => set({ crimeaSevastapolPresence: v })}
        >
          <label className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="yes" /> {yesLabel}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="no" /> {noLabel}
          </label>
        </RadioGroup>
      </div>

      {/* 5) russianEnergyPresence */}
      <div className="rounded-lg border p-3 space-y-2">
        <div className="text-sm">
          <b>5)</b> {t("ppif.aml.q5.label")}
        </div>
        <div className="text-xs text-muted-foreground">
          {t("ppif.aml.q5.examples")}
        </div>
        <RadioGroup
          className="flex gap-6 mt-1"
          value={form.russianEnergyPresence || ""}
          onValueChange={(v: "yes" | "no" | "") => set({ russianEnergyPresence: v })}
        >
          <label className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="yes" /> {yesLabel}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="no" /> {noLabel}
          </label>
        </RadioGroup>
      </div>
    </div>
  );
}

function AccountingRecordsStep() {
  const [form, setForm] = useAtom(pifFormAtom);
  const set = (patch: Partial<PanamaPIFForm>) => setForm({ ...form, ...patch });

  const usingMirr = Boolean(form.recordStorageUseMirr);

  const handleUseMirrToggle = (v: boolean | "indeterminate") => {
    const next = Boolean(v);
    // When using Mirr, clear manual fields to avoid stale values
    set({
      recordStorageUseMirr: next,
      ...(next
        ? {
          recordStorageAddress: "",
          recordStorageResponsiblePerson: "",
        }
        : {}), // keep as-is when unchecking
    });
  };

  return (
    <div className="space-y-3">
      <InfoBox>{t("ppif.accounting.info")}</InfoBox>

      <div className="grid md:grid-cols-2 gap-3">
        {/* Address */}
        <div className="md:col-span-2 grid gap-1.5">
          <Label className={labelSm}>
            {t("ppif.accounting.fields.address.label")}
            {!usingMirr && (
              <span className="text-destructive">
                {t("ppif.validation.requiredAsterisk")}
              </span>
            )}
          </Label>
          <Textarea
            className={`text-sm ${usingMirr ? "opacity-60 cursor-not-allowed" : ""}`}
            rows={4}
            placeholder={t("ppif.accounting.fields.address.placeholder")}
            value={form.recordStorageAddress || ""}
            onChange={(e) => set({ recordStorageAddress: e.target.value })}
            disabled={usingMirr}
            aria-disabled={usingMirr}
          />
        </div>

        {/* Responsible person */}
        <div className="grid gap-1.5">
          <Label className={labelSm}>
            {t("ppif.accounting.fields.responsible.label")}
            {!usingMirr && (
              <span className="text-destructive">
                {t("ppif.validation.requiredAsterisk")}
              </span>
            )}
          </Label>
          <Input
            className={`${inputSm} ${usingMirr ? "opacity-60 cursor-not-allowed" : ""}`}
            placeholder={t("ppif.accounting.fields.responsible.placeholder")}
            value={form.recordStorageResponsiblePerson || ""}
            onChange={(e) => set({ recordStorageResponsiblePerson: e.target.value })}
            disabled={usingMirr}
            aria-disabled={usingMirr}
          />
        </div>

        {/* Use Mirr checkbox */}
        <div className="flex items-start gap-3">
          <Checkbox
            id="recordStorageUseMirr"
            checked={usingMirr}
            onCheckedChange={handleUseMirrToggle}
          />
          <Label
            htmlFor="recordStorageUseMirr"
            className={`${labelSm} leading-relaxed cursor-pointer`}
          >
            {t("ppif.accounting.fields.useMirr.label")}
            {usingMirr && (
              <div className="text-xs text-muted-foreground mt-1">
                {t("ppif.accounting.fields.useMirr.helper", "We'll store records at our registered office and handle the responsible officer.")}
              </div>
            )}
          </Label>
        </div>
      </div>
    </div>
  );
}

function ProfileStepPanama() {
  const [form, setForm] = useAtom(pifFormAtom)
  const set = (patch: Partial<PanamaPIFForm>) => setForm({ ...form, ...patch })

  // Helpers
  const sofKeys = [
    "Employment Income",
    "Savings/Deposits",
    "Investment Income (stocks/bonds/funds)",
    "Loan",
    "Proceeds from Sale of Company/Shares",
    "Business Income/Dividends",
    "Inheritance/Gift",
    "other",
  ] as const

  const industryKeys = [
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

  const chipKeys = [
    "Asset Protection",
    "Succession Planning",
    "Hold & Manage Investment Interests",
    "Dividend & Interest Income Management",
    "Charitable Purposes",
    "Family-Trust Structure",
    "Blockchain Token-Related"
  ] as const;
  const parsePurposes = (str: string) =>
    str
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

  const uniqueJoin = (arr: string[]) =>
    Array.from(new Set(arr.map(s => s.trim()))).join(", ");
  // Purpose chips
  const addPurposeText = (txt: string) => {
    const current = parsePurposes(form.purposeSummary || "");
    // Add (or toggle) — choose ONE behavior:
    // A) Append only if not present:
    if (!current.includes(txt)) current.push(txt);

    // B) Toggle on/off (uncomment to enable toggle):
    // const idx = current.indexOf(txt);
    // if (idx === -1) current.push(txt); else current.splice(idx, 1);

    const next = uniqueJoin(current).slice(0, 280);
    set({ purposeSummary: next });
  }
  const handleFreeEdit = (raw: string) => {
    // Normalize user-typed commas/spaces into a clean list
    const next = uniqueJoin(parsePurposes(raw)).slice(0, 280);
    set({ purposeSummary: next });
  };

  const selectedSet = new Set(parsePurposes(form.purposeSummary || ""));
  const purposeLen = (form.purposeSummary || "").length;

  return (
    <div className="space-y-4">
      {/* Naming Guidelines */}
      <InfoBox>
        <b>{t("ppif.profile.namingGuidelines.title")}</b> — {t("ppif.profile.namingGuidelines.body")}
      </InfoBox>

      {/* Name choices */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label className={labelSm}>
            {t("ppif.profile.nameChoices.first.label")}
            <span className="text-destructive">{t("ppif.validation.requiredAsterisk")}</span>
          </Label>
          <Input
            className={inputSm}
            placeholder={t("ppif.profile.nameChoices.first.placeholder")}
            value={form.foundationNameEn}
            onChange={(e) => set({ foundationNameEn: e.target.value })}
          />
        </div>

        <div className="grid gap-1.5">
          <Label className={labelSm}>
            {t("ppif.profile.nameChoices.second.label")}
            <span className="text-destructive">{t("ppif.validation.requiredAsterisk")}</span>
          </Label>
          <Input
            className={inputSm}
            value={form.altName1 || ""}
            onChange={(e) => set({ altName1: e.target.value })}
          />
        </div>

        <div className="grid gap-1.5">
          <Label className={labelSm}>
            {t("ppif.profile.nameChoices.third.label")}
            <span className="text-destructive">{t("ppif.validation.requiredAsterisk")}</span>
          </Label>
          <Input
            className={inputSm}
            value={form.altName2 || ""}
            onChange={(e) => set({ altName2: e.target.value })}
          />
        </div>

        <div className="grid gap-1.5">
          <Label className={labelSm}>{t("ppif.profile.nameChoices.spanish.label")}</Label>
          <Input
            className={inputSm}
            placeholder={t("ppif.profile.nameChoices.spanish.placeholder")}
            value={form.foundationNameEs || ""}
            onChange={(e) => set({ foundationNameEs: e.target.value })}
          />
        </div>
      </div>

      {/* Initial Endowment + SOF */}
      <InfoBox>
        <b>{t("ppif.profile.endowmentInfo.title")}</b> — {t("ppif.profile.endowmentInfo.body")}
      </InfoBox>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label className={labelSm}>{t("ppif.profile.endowmentFields.amount.label")}</Label>
          <Input
            className={inputSm}
            type="number"
            inputMode="decimal"
            placeholder={t("ppif.profile.endowmentFields.amount.placeholder")}
            value={form.initialEndowment || ""}
            onChange={(e) => set({ initialEndowment: e.target.value })}
          />
        </div>

        <div className="grid gap-1.5">
          <Label className={labelSm}>
            {t("ppif.profile.sourceOfFunds.label")}
            <span className="text-destructive">{t("ppif.validation.requiredAsterisk")}</span>
          </Label>
          <Select
            value={form.sourceOfFunds || "__none"}
            onValueChange={(v) =>
              set({
                sourceOfFunds: v === "__none" ? undefined : (v as PanamaPIFForm["sourceOfFunds"]),
                sourceOfFundsOther: v === "other" ? (form.sourceOfFundsOther || "") : ""
              })
            }
          >
            <SelectTrigger className={inputSm}>
              <SelectValue placeholder={t("ppif.profile.sourceOfFunds.placeholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none">{t("ppif.profile.sourceOfFunds.placeholder")}</SelectItem>
              {sofKeys.map((k) => (
                <SelectItem key={k} value={k}>
                  {t(`ppif.profile.sourceOfFunds.options.${k}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label className={labelSm}>
            {t("ppif.profile.endowmentFields.payer.label")}
            <span className="text-destructive">{t("ppif.validation.requiredAsterisk")}</span>
          </Label>
          <Input
            className={inputSm}
            value={form.endowmentPayer || ""}
            onChange={(e) => set({ endowmentPayer: e.target.value })}
          />
        </div>

        {/* Registered Address */}
        <div className="grid gap-1.5">
          <Label className={labelSm}>
            {t("ppif.profile.registeredAddress.label")}
            <span className="text-destructive">{t("ppif.validation.requiredAsterisk")}</span>
          </Label>
          <RadioGroup
            value={form.registeredAddressMode || ""}
            onValueChange={(v: "mirr" | "own") => set({ registeredAddressMode: v })}
            className="flex flex-col gap-2"
          >
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <RadioGroupItem value="mirr" id="ra-mirr" />
              {t("ppif.profile.registeredAddress.options.mirr")}
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <RadioGroupItem value="own" id="ra-own" />
              {t("ppif.profile.registeredAddress.options.own")}
            </label>
          </RadioGroup>
        </div>
      </div>

      {form.registeredAddressMode === "own" && (
        <div className="grid gap-1.5">
          <Label className={labelSm}>{t("ppif.profile.registeredAddress.own.label")}</Label>
          <Textarea
            className="text-sm"
            placeholder={t("ppif.profile.registeredAddress.own.placeholder")}
            value={form.ownRegisteredAddress || ""}
            onChange={(e) => set({ ownRegisteredAddress: e.target.value })}
          />
        </div>
      )}

      {/* Purpose box */}
      <div className="space-y-2">
        <Label className={labelSm}>
          {t("ppif.profile.purpose.label")}
          <span className="text-destructive">{t("ppif.validation.requiredAsterisk")}</span>
        </Label>

        <div className="flex flex-wrap gap-2">
          {chipKeys.map((ck) => {
            const isSelected = selectedSet.has(ck);
            return (
              <Button
                key={ck}
                type="button"
                variant={isSelected ? "default" : "outline"} // highlight selected
                size="sm"
                onClick={() => addPurposeText(ck)}
              >
                {t(`ppif.profile.purpose.chips.${ck}.label`)}
              </Button>
            );
          })}
        </div>

        <Textarea
          id="purpose"
          required
          rows={4}
          placeholder={t("ppif.profile.purpose.placeholder")}
          className="text-sm"
          value={form.purposeSummary || ""}
          onChange={(e) => handleFreeEdit(e.target.value)}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {t("ppif.profile.purpose.helper")}
          </span>
          <span className="text-xs">{purposeLen}/280</span>
        </div>
      </div>


      <div className="border-t my-2" />

      {/* Business / Activities */}
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground font-medium">
          {t("ppif.profile.businessActivities.sectionLabel")}
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className={labelSm}>{t("ppif.profile.businessActivities.industries.label")}</Label>
            <div className="flex flex-col gap-1.5 text-sm">
              {industryKeys.map(([industryKey]) => (
                <label key={industryKey} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={(form.industries || []).includes(industryKey)}
                    onCheckedChange={() => toggleIndustry(industryKey)}
                  />
                  {t(`ppif.profile.businessActivities.industries.options.${industryKey}`)}
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label className={labelSm}>{t("ppif.profile.businessActivities.countries.label")}</Label>
            <Input
              className={inputSm}
              placeholder={t("ppif.profile.businessActivities.countries.placeholder")}
              value={form.geoCountries || ""}
              onChange={(e) => set({ geoCountries: e.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label className={labelSm}>{t("ppif.profile.businessActivities.description.label")}</Label>
          <Textarea
            className="text-sm"
            placeholder={t("ppif.profile.businessActivities.description.placeholder")}
            value={form.bizDesc || ""}
            onChange={(e) => set({ bizDesc: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

function InvoicePIF() {
  const [form, setForm] = useAtom(pifFormAtom);
  const { pricing } = form;

  const isLocked = form.paymentStatus === "paid";

  const updatePricing = <K extends keyof typeof pricing>(key: K, value: (typeof pricing)[K]) => {
    if (isLocked) return; // 🔒 no changes allowed after payment
    const next = { ...pricing, [key]: value };
    next.total = computePIFSetupTotal(next);
    setForm({ ...form, pricing: next });
  };

  React.useEffect(() => {
    const setupTotal = computePIFSetupTotal(pricing);
    if (setupTotal !== pricing.total) {
      setForm({ ...form, pricing: { ...pricing, total: setupTotal } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const base = pricing.total;

  // ✅ Mirr Asia record-storage address
  const recordStorageFee = form.recordStorageUseMirr ? 350 : 0;
  const totalWithStorage = base + recordStorageFee;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">
          {t("ppif.invoice.title")}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {isLocked && (
          <div className="border rounded-xl p-3 text-sm border-amber-200 bg-amber-50 text-amber-900 mb-2">
            {t("ppif.invoice.lockedMessage", "Payment completed. Invoice options are now locked.")}
          </div>
        )}

        <div className="border rounded-xl p-4">
          <h3 className="font-semibold mb-3">{t("ppif.invoice.setup.title")}</h3>

          {/* Entity/setup fee row with tooltip */}
          <div className="flex items-start justify-between gap-3 py-1">
            <div className="text-sm flex items-center gap-2">
              <span id="entity-label">
                {t("ppif.invoice.setup.entity.label")}
                <span
                  className="help sr-only"
                  data-title={t("ppif.invoice.setup.entity.tooltip.title")}
                  data-body={t("ppif.invoice.setup.entity.tooltip.body")}
                />
              </span>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={t("ppif.invoice.setup.entity.tooltip.aria")}
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full border text-muted-foreground"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  <div className="font-medium mb-1">
                    {t("ppif.invoice.setup.entity.tooltip.title")}
                  </div>
                  <div>{t("ppif.invoice.setup.entity.tooltip.body")}</div>
                </TooltipContent>
              </Tooltip>
            </div>

            <span className="text-sm font-medium">{money(pricing.setupBase)}</span>
          </div>

          {/* Selects & options */}
          <div className="space-y-3 mt-3">
            {/* Nominee director(s) setup */}
            <div className="space-y-1.5">
              <Label className={labelSm}>
                {t("ppif.invoice.setup.ndSetup.label")}
              </Label>
              <Select
                value={String(pricing.ndSetup)}
                onValueChange={(v) => updatePricing("ndSetup", Number(v) as any)}
                disabled={isLocked}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("ppif.profile.sourceOfFunds.placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">
                    {t("ppif.invoice.setup.ndSetup.options.0")}
                  </SelectItem>
                  <SelectItem value="1">
                    {t("ppif.invoice.setup.ndSetup.options.1", { price: money(1200) })}
                  </SelectItem>
                  <SelectItem value="2">
                    {t("ppif.invoice.setup.ndSetup.options.2", { price: money(1700) })}
                  </SelectItem>
                  <SelectItem value="3">
                    {t("ppif.invoice.setup.ndSetup.options.3", { price: money(2200) })}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reason for 3 ND (setup) */}
            {pricing.ndSetup === 3 && (
              <div className="space-y-1.5">
                <Label className="text-xs">
                  {t("ppif.invoice.setup.ndSetup.reason.label")}
                </Label>
                <Textarea
                  placeholder={t("ppif.invoice.setup.ndSetup.reason.placeholder")}
                  value={pricing.nd3ReasonSetup ?? ""}
                  onChange={(e) => updatePricing("nd3ReasonSetup", e.target.value)}
                  disabled={isLocked}
                />
                <p className="text-[12px] text-muted-foreground">
                  {t("ppif.invoice.setup.ndSetup.reason.hint")}
                </p>
              </div>
            )}

            {/* Nominee shareholder (setup) */}
            <div className="flex items-center gap-2">
              <Checkbox
                checked={pricing.nsSetup}
                onCheckedChange={(c) => updatePricing("nsSetup", Boolean(c))}
                id="ns-setup"
                disabled={isLocked}
              />
              <Label htmlFor="ns-setup">
                {t("ppif.invoice.setup.nsSetup.label", { price: money(1300) })}
              </Label>
            </div>

            <Separator />

            {/* Optional services */}
            <h4 className="font-medium">{t("ppif.invoice.setup.optional.title")}</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={pricing.optEmi}
                  onCheckedChange={(c) => updatePricing("optEmi", Boolean(c))}
                  id="opt-emi"
                  disabled={isLocked}
                />
                <Label htmlFor="opt-emi">
                  {t("ppif.invoice.setup.optional.emi", { price: money(400) })}
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={pricing.optBank}
                  onCheckedChange={(c) => updatePricing("optBank", Boolean(c))}
                  id="opt-bank"
                  disabled={isLocked}
                />
                <Label htmlFor="opt-bank">
                  {t("ppif.invoice.setup.optional.bank", { price: money(2000) })}
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={pricing.optCbi}
                  onCheckedChange={(c) => updatePricing("optCbi", Boolean(c))}
                  id="opt-cbi"
                  disabled={isLocked}
                />
                <Label htmlFor="opt-cbi">
                  {t("ppif.invoice.setup.optional.cbi", { price: money(3880) })}
                </Label>
              </div>
            </div>

            <Separator className="my-2" />

            {/* ✅ Mirr Asia record-storage line */}
            {form.recordStorageUseMirr && (
              <div className="flex items-start justify-between gap-3 py-1 text-sm">
                <span className="font-medium">
                  {t(
                    "ppif.invoice.setup.recordStorage.label",
                    "Use Mirr Asia record-storage address (Mirr Asia address used)"
                  )}
                </span>
                <span className="text-sm font-medium">{money(recordStorageFee)}</span>
              </div>
            )}

            {/* Totals */}
            <div className="flex items-start justify-between gap-3 py-1">
              <span className="text-sm font-medium">
                {t("ppif.invoice.setup.totals.setupY1")}
              </span>
              <span className="text-sm font-medium">
                {money(totalWithStorage)}
              </span>
            </div>
          </div>
        </div>

        {/* Includes */}
        <div className="rounded-lg border bg-muted/20 p-4 text-sm">
          <b>{t("ppif.invoice.includes.title")}</b>
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li>{t("ppif.invoice.includes.items.i1")}</li>
            <li>{t("ppif.invoice.includes.items.i2")}</li>
            <li>{t("ppif.invoice.includes.items.i3")}</li>
            <li>{t("ppif.invoice.includes.items.i4")}</li>
            <li>{t("ppif.invoice.includes.items.i5")}</li>
            <li>{t("ppif.invoice.includes.items.i6")}</li>
            <li>{t("ppif.invoice.includes.items.i7")}</li>
            <li>{t("ppif.invoice.includes.items.i8")}</li>
            <li>{t("ppif.invoice.includes.items.i9")}</li>
            <li>{t("ppif.invoice.includes.items.i10")}</li>
            <li>{t("ppif.invoice.includes.items.i11")}</li>
            <li>{t("ppif.invoice.includes.items.i12")}</li>
            <li>{t("ppif.invoice.includes.items.i13")}</li>
            <li>{t("ppif.invoice.includes.items.i14")}</li>
          </ol>
          <div className="mt-2 text-[12px] text-muted-foreground">
            <strong>Note:</strong> {t("ppif.invoice.includes.note")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StripePaymentForm({ app, onSuccess, onClose }: {
  app: PanamaPIFForm;
  onSuccess: (info: StripeSuccessInfo) => void;
  onClose: () => void;
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
      const { error: stripeErr, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: typeof window !== "undefined" ? window.location.href : ""
        },
        redirect: "if_required"
      });

      if (stripeErr) {
        setError(stripeErr.message ?? t("ppif.payment.stripe.form.errors.failedGeneric"));
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
              paymentIntentStatus: result?.paymentIntentStatus
            };

            if (result?.paymentIntentStatus === "succeeded") {
              setSuccessPayload(payload);
              onSuccess(payload);
              setSubmitting(false);
              return;
            }

            if (result?.paymentIntentStatus === "processing" || result?.paymentIntentStatus === "requires_capture") {
              setProcessingMsg(t("ppif.payment.stripe.form.processing.msg"));
              onSuccess(payload);
              setSubmitting(false);
              return;
            }
          }

          setError(t("ppif.payment.stripe.form.errors.backendReceiptMissing"));
          setSubmitting(false);
        } catch (e) {
          console.error("Failed to notify backend about PI update:", e);
          setError(t("ppif.payment.stripe.form.errors.backendSaveFailed"));
          setSubmitting(false);
        }
      };

      if (status === "succeeded" || status === "processing" || status === "requires_capture") {
        await notifyBackend();
      } else {
        setError(
          t("ppif.payment.stripe.form.errors.statusPrefix", { status: status ?? "unknown" })
        );
        setSubmitting(false);
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message || t("ppif.payment.stripe.form.errors.confirmGeneric"));
      setSubmitting(false);
    }
  };

  // Success view
  if (successPayload) {
    const amt = typeof successPayload.amount === "number" ? successPayload.amount : undefined;
    const currency =
      typeof successPayload.currency === "string" ? successPayload.currency.toUpperCase() : undefined;

    return (
      <div className="space-y-4">
        <div className="border rounded-md p-3 text-sm bg-emerald-50 border-emerald-200 text-emerald-900">
          <div className="font-semibold mb-1">
            {t("ppif.payment.stripe.form.success.title")}
          </div>
          <div className="space-y-1">
            {amt != null && currency ? (
              <div>
                {t("ppif.payment.stripe.form.success.amountLabel")}{" "}
                <b>
                  {currency} {(amt / 100).toFixed(2)}
                </b>
              </div>
            ) : null}
            <div>
              {successPayload.receiptUrl ? (
                <>
                  {t("ppif.payment.stripe.form.success.receiptLabel")}&nbsp;
                  <a
                    href={successPayload.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2"
                  >
                    {t("ppif.payment.stripe.form.success.viewReceipt")}
                  </a>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Button onClick={onClose}>{t("ppif.payment.stripe.form.success.doneBtn")}</Button>
        </div>
      </div>
    );
  }

  // Processing view (no receipt yet)
  if (processingMsg) {
    return (
      <div className="space-y-4">
        <div className="border rounded-md p-3 text-sm bg-amber-50 border-amber-200 text-amber-900">
          <div className="font-semibold mb-1">
            {t("ppif.payment.stripe.form.processing.title")}
          </div>
          <div>{processingMsg}</div>
        </div>
        <div className="flex items-center justify-end">
          <Button onClick={onClose}>{t("ppif.payment.stripe.form.processing.closeBtn")}</Button>
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
          {t("ppif.payment.stripe.form.controls.cancel")}
        </Button>
        <Button onClick={handleConfirm} disabled={!stripe || !elements || submitting}>
          {submitting ? t("ppif.payment.stripe.form.controls.processing") : t("ppif.payment.stripe.form.controls.payNow")}
        </Button>
      </div>
    </div>
  );
}

function StripeCardDrawer({ open, onOpenChange, clientSecret, amountUSD, app, onSuccess
}: {
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
      appearance: { theme: "stripe" as const }
    }),
    [clientSecret]
  );

  const note = app.payMethod === "card" ? t("ppif.payment.stripe.drawer.cardFeeNote") : "";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t("ppif.payment.stripe.drawer.title")}</SheetTitle>
          <SheetDescription>
            {t("ppif.payment.stripe.drawer.description", {
              amount: `USD ${amountUSD.toFixed(2)}`,
              note
            })}
          </SheetDescription>
        </SheetHeader>

        {clientSecret ? (
          <div className="mt-4">
            <Elements stripe={stripePromise} options={options}>
              <StripePaymentForm app={app} onSuccess={onSuccess} onClose={() => onOpenChange(false)} />
            </Elements>
          </div>
        ) : (
          <div className="mt-4 text-sm text-muted-foreground">
            {t("ppif.payment.stripe.drawer.preparing")}
          </div>
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
  const [form, setForm] = useAtom(pifFormAtom);

  const isPaid =
    form.paymentStatus === "paid" ||
    form.stripeLastStatus === "succeeded" ||
    form.stripePaymentStatus === "succeeded";

  React.useEffect(() => {
    if (isPaid) return;
    const now = Date.now();
    const current = form.expiresAt ? new Date(form.expiresAt).getTime() : 0;
    if (!current || current <= now) {
      const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
      const expiryISO = new Date(now + twoDaysMs).toISOString();
      setForm((prev) => ({ ...prev, expiresAt: expiryISO }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaid]);

  const [nowTs, setNowTs] = React.useState(() => Date.now());
  React.useEffect(() => {
    if (isPaid) return;
    const id = window.setInterval(() => setNowTs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [isPaid]);

  const expiresTs = form.expiresAt ? new Date(form.expiresAt).getTime() : 0;
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

  const guard = (msg: string) => {
    if (isPaid) {
      alert(t("ppif.payment.step.alerts.alreadyPaid"));
      return true;
    }
    if (isExpired) {
      alert(msg);
      return true;
    }
    return false;
  };

  const grand = computePIFGrandTotal(form);

  // UI state
  const [creatingPI, setCreatingPI] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [bankFile, setBankFile] = React.useState<File | null>(null);
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);
  const [cardDrawerOpen, setCardDrawerOpen] = React.useState(false);

  const handleProceedCard = async () => {
    if (guard(t("ppif.payment.step.alerts.expiredGuard"))) return;
    if (clientSecret && form.paymentIntentId) {
      setCardDrawerOpen(true);
      return;
    }
    setCreatingPI(true);
    try {
      const currentFP = {
        companyId: form?._id ?? null,
        totalCents: Math.round(grand * 100),
        country: "PIF"
      };
      const result = await createInvoicePaymentIntent(currentFP);
      if (result?.clientSecret && result?.id) {
        setClientSecret(result.clientSecret);
        setForm((p) => ({ ...p, paymentIntentId: result.id, payMethod: "card" }));
        setCardDrawerOpen(true);
      } else {
        alert(t("ppif.payment.step.alerts.cardInitError"));
      }
    } finally {
      setCreatingPI(false);
    }
  };

  const handleBankProofSubmit = async () => {
    if (guard(t("ppif.payment.step.alerts.expiredGuard"))) return;
    if (!bankFile) return;
    setUploading(true);
    const method = form.payMethod || "card";
    const expiresAt = form.expiresAt || "";
    try {
      const result = await uploadIncorpoPaymentBankProof(form?._id || "", "pif", bankFile, method, expiresAt);
      if (result) setForm((p) => ({ ...p, uploadReceiptUrl: result?.url }));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBankProof = async () => {
    if (guard(t("ppif.payment.step.alerts.expiredGuard"))) return;
    await deleteIncorpoPaymentBankProof(form?._id || "", "pif");
    setForm((p: any) => ({ ...p, uploadReceiptUrl: undefined }));
  };

  return (
    <>
      {/* Banner: Paid */}
      {isPaid && (
        <div className="mb-4 border rounded-md p-3 text-sm bg-emerald-50 border-emerald-200 text-emerald-900">
          <div className="font-semibold mb-1">{t("ppif.payment.step.banners.received.title")}</div>
          {typeof form.stripeAmountCents === "number" && form.stripeCurrency ? (
            <div>
              {t("ppif.payment.step.banners.received.amountLabel")}{" "}
              <b>
                {form.stripeCurrency.toUpperCase()} {(form.stripeAmountCents / 100).toFixed(2)}
              </b>
            </div>
          ) : null}
          {form.stripeReceiptUrl ? (
            <div>
              {t("ppif.payment.step.banners.received.receiptLabel")}{" "}
              <a
                className="underline underline-offset-2"
                href={form.stripeReceiptUrl}
                target="_blank"
                rel="noreferrer"
              >
                {t("ppif.payment.step.banners.received.view")}
              </a>
            </div>
          ) : null}
        </div>
      )}

      {/* Banner: Countdown / Expired */}
      {!isPaid && (
        <div
          className={`mb-4 rounded-md border p-3 text-sm ${isExpired ? "border-red-200 bg-red-50 text-red-900" : "border-amber-200 bg-amber-50 text-amber-900"
            }`}
        >
          {isExpired ? (
            <div className="font-medium">{t("ppif.payment.step.banners.expiredBox.expiredTitle")}</div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="font-medium">{t("ppif.payment.step.banners.expiredBox.windowTitle")}</div>
              <div className="text-base font-bold tabular-nums">{formatRemaining(remainingMs)}</div>
            </div>
          )}
        </div>
      )}

      {/* Main grid */}
      <>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Methods */}
          <Card>
            <CardContent className="pt-6 space-y-2">
              <div className="font-bold">{t("newHk.payment.methods.title")}</div>
              {[
                {
                  v: "card",
                  label: t("newHk.payment.methods.options.card.label"),
                  tip: t("newHk.payment.methods.options.card.tip")
                },
                { v: "fps", label: t("newHk.payment.methods.options.fps.label") },
                { v: "bank", label: t("newHk.payment.methods.options.bank.label") },
                { v: "other", label: t("newHk.payment.methods.options.other.label") }
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
                  {isPaid ? t("newHk.payment.methods.statusNote.paid") : t("newHk.payment.methods.statusNote.expired")}
                </div>
              )}
            </CardContent>
          </Card>
          {/* Conditions + uploads + card action */}
          <Card>
            <CardContent className="pt-6 space-y-2">
              <div className="font-bold">{t("newHk.payment.conditions.title")}</div>
              <p className="text-sm">
                <Trans i18nKey="newHk.payment.conditions.text">
                  100% advance payment. All payments are non-refundable.The remitter bears all bank charges (including
                  intermediary bank fees).
                </Trans>
              </p>

              {/* Bank/Other uploads */}
              {["bank", "other"].includes(form.payMethod ?? "") && (
                <div className="mt-4 grid gap-3">
                  <div className="grid gap-2">
                    <Label>{t("newHk.payment.bankUpload.refLabel")}</Label>
                    <Input
                      placeholder={t("newHk.payment.bankUpload.refPlaceholder")}
                      value={form.bankRef || ""}
                      onChange={(e) => setForm((p) => ({ ...p, bankRef: e.target.value }))}
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
                    <Button onClick={handleBankProofSubmit} disabled={isPaid || isExpired || creatingPI || uploading}>
                      {uploading ? t("newHk.payment.bankUpload.uploading") : t("newHk.payment.bankUpload.submit")}
                    </Button>
                  </div>

                  {form.uploadReceiptUrl ? (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{t("newHk.payment.bankUpload.previewTitle")}</div>
                        <div className="flex items-center gap-2">
                          <Button asChild variant="outline" size="sm" disabled={isPaid || isExpired}>
                            <a href={form.uploadReceiptUrl} target="_blank" rel="noopener noreferrer">
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
                          title={t("ppif.payment.step.iframe.paymentProofTitle")}
                          className="w-full h-[420px]"
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Card flow */}
              {form.payMethod === "card" && !isPaid && (
                <div className="mt-3">
                  <Button onClick={handleProceedCard} disabled={isPaid || isExpired || creatingPI}>
                    {creatingPI ? t("newHk.payment.card.preparing") : t("newHk.payment.card.proceed")}
                  </Button>
                  <div className="text-xs text-muted-foreground mt-2">
                    {isExpired ? t("newHk.payment.card.disabledExpired") : t("newHk.payment.card.drawerNote")}
                  </div>
                </div>
              )}

              {form.payMethod === "fps" ? <FPSForm /> : null}

              {/* Grand total */}
              <div className="text-right font-bold mt-4">
                {t("newHk.payment.totals.grandTotal", { amount: grand.toFixed(2) })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stripe drawer */}
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
                paymentStatus: info?.paymentIntentStatus === "succeeded" ? "paid" : prev.paymentStatus,
                stripeLastStatus: info?.paymentIntentStatus ?? prev.stripeLastStatus,
                stripeReceiptUrl: info?.receiptUrl ?? prev.stripeReceiptUrl,
                stripeAmountCents: typeof info?.amount === "number" ? info.amount : prev.stripeAmountCents,
                stripeCurrency: info?.currency ?? prev.stripeCurrency
              }));
              setCardDrawerOpen(false);
            }}
          />
        ) : null}
      </>
    </>
  );
}

function CongratsStep() {
  const [app,] = useAtom(pifFormAtom)
  const navigate = useNavigate();
  const token = localStorage.getItem("token") as string;
  const decodedToken = jwtDecode<any>(token);

  const navigateRoute = () => {
    localStorage.removeItem("companyRecordId");
    if (["admin", "master"].includes(decodedToken.role)) navigate("/admin-dashboard");
    else navigate("/dashboard");
  };

  const namePart = app.contactName ? t("newHk.congrats.thankYouName", { applicantName: app.contactName }) : "";

  const steps = [1, 2, 3, 4].map((i) => ({
    t: t(`ppif.steps.${i}.t`),
    s: t(`ppif.steps.${i}.s`),
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

const panamaPIFConfig: FormConfig = {
  title: "ppif.heading",
  steps: [
    {
      id: "applicant",
      title: "ppif.section1",
      description: "ppif.applicant.description",
      fields: [
        {
          type: "email",
          name: "email",
          label: "ppif.applicant.fields.email.label",
          placeholder: "ppif.applicant.fields.email.placeholder",
          required: true
        },
        {
          type: "text",
          name: "contactName",
          label: "ppif.applicant.fields.contactName.label",
          placeholder: "ppif.applicant.fields.contactName.placeholder",
          required: true
        },
        {
          type: "text",
          name: "phone",
          label: "ppif.applicant.fields.phone.label",
          placeholder: "ppif.applicant.fields.phone.placeholder"
        },
        {
          type: "text",
          name: "contactPref",
          label: "ppif.applicant.fields.contactPref.label",
          placeholder: "ppif.applicant.fields.contactPref.placeholder"
        }
      ]
    },
    {
      id: "profile",
      title: "ppif.section2",
      render: ProfileStepPanama
    },
    { id: "founders", title: "ppif.section3", render: FoundersManager },
    { id: "council", title: "ppif.section4", render: CouncilStep },
    { id: "protectors", title: "ppif.section5", render: ProtectorsManager },
    { id: "beneficiaries", title: "ppif.section6", render: BeneficiariesManager },
    { id: "bylaws", title: "ppif.section7", render: BylawsStep },
    {
      id: "es",
      title: "ppif.section8",
      description: "ppif.es.description",
      fields: []
    },
    { id: "banking", title: "ppif.section9", render: BankingStep },
    {
      id: "pep",
      title: "ppif.section10",
      fields: [
        {
          type: "radio-group",
          name: "pepAny",
          label: "ppif.pep.label",
          colSpan: 2,
          options: [
            { label: "ppif.pep.options.yes", value: "yes" },
            { label: "ppif.pep.options.no", value: "no" }
          ]
        }
      ]
    },
    { id: "aml", title: "ppif.section11", render: AMLStep },
    { id: "deliverables", title: "ppif.section12", render: DeliverablesStep },
    { id: "accounting", title: "ppif.section13", render: AccountingRecordsStep },
    { id: "agreement", title: "usa.steps.step4", render: CommonServiceAgrementTxt },
    { id: "invoice", title: "ppif.section14", render: InvoicePIF },
    { id: "payment", title: "ppif.section15", render: PaymentStepPIF },
    { id: "declarations", title: "ppif.section16", render: DeclarationsStep },
    { id: "congrats", title: "ppif.congrats", render: CongratsStep }
  ]
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
      const usingMirr = Boolean(form.recordStorageUseMirr);
      if (!usingMirr) {
        if (need(form.recordStorageAddress)) miss.push("Accounting Record Storage Address");
        if (need(form.recordStorageResponsiblePerson)) miss.push("Responsible Person (English Full Name)");
      }
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
        stepIdx,
      };

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

      const result = await createOrUpdatePaFIncorpo(payload);
      if (result) {
        setForm({ ...form, _id: result._id });
        toast({ title: t("ppif.save.successTitle"), description: t("ppif.save.successDesc") });
        window.history.pushState({}, "", `/company-register/PPIF/${result._id}`);
        return true;
      }
      toast({ variant: "destructive", title: t("ppif.save.errorTitle"), description: t("ppif.save.errorDesc") });
      return false;
    } catch (e) {
      console.error("saveAll error", e);
      toast({ variant: "destructive", title: t("ppif.save.errorTitle"), description: t("ppif.save.errorDesc") });
      return false;
    }
  };
  // console.log("missing0", stepIdx, "\n ", form)
  const handleNext = async () => {

    if (stepIdx >= config.steps.length - 1) return;
    if (missing.length > 0) {
      toast({
        variant: "destructive",
        title: t("newHk.sidebar.toasts.completeStepTitle"),
        description: `${t("ppif.validation.requiredFieldsPrefix")} ${missing.map((k) => t(k, k)).join(", ")}`
      });
      return;
    }
    try {

      setSavingNext(true);
      if (stepIdx == 10) {
        const q2 = form.legalAndEthicalConcern
        const q3 = form.q_country
        const q4 = form.sanctionsExposureDeclaration
        const q5 = form.crimeaSevastapolPresence
        const q6 = form.russianEnergyPresence
        const q2to6AllNo = [q2, q3, q4, q5, q6].every((x) => x === "no");
        // console.log("q2to6AllNo",q2to6AllNo)
        if (!q2to6AllNo) {
          await saveAll();
          toast({
            title: "",
            description: "Consultation Required.",
          });
          return
        }
      }
      const ok = await saveAll();
      if (!ok) return;
      goto(stepIdx + 1);
    } finally {
      setSavingNext(false);
    }
  };

  const handleBack = () => goto(stepIdx - 1)

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
          <span>{t("newHk.buttons.stepsMenu")}</span>
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
                <h2 className="font-semibold">{t("newHk.sidebar.stepsMenu")}</h2>
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="h-8 w-8 p-0">
                  {t("newHk.sidebar.close")}
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
                {stepIdx + 1}. {t((step as any).title)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6">
              {"description" in step && step.description ? (
                <div className="border border-dashed rounded-lg p-3 bg-muted/20 text-xs sm:text-sm">
                  {t(step.description)}
                </div>
              ) : null}

              {"fields" in step && (step as any).fields?.length ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {(step as any).fields.map((f: any, i: number) => (
                    <Field key={f.name ?? i} field={f as FieldBase} />
                  ))}
                </div>
              ) : (step as any).render ? (
                React.createElement((step as any).render)
              ) : null}

              {missing.length > 0 && (
                <div className="text-xs sm:text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <strong>{t("ppif.validation.requiredFieldsPrefix")}</strong>{" "}
                  {missing.map((k) => t(k, k)).join(", ")}
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
                  {t("newHk.buttons.back")}
                </Button>
              </div>

              {stepIdx !== config.steps.length - 1 && (
                <div className="w-full sm:w-auto">
                  <Button
                    onClick={handleNext}
                    disabled={savingNext}
                    className="w-full sm:w-auto touch-manipulation"
                  >
                    {savingNext ? t("newHk.buttons.saving") : t("newHk.buttons.next")}
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 print:hidden">
            <div className="text-[12px] text-muted-foreground">
              {t("ppif.footer.copyright")}
            </div>
            <div className="flex gap-2" />
          </div>
        </div>
      </div>
    </div>
  )
}
