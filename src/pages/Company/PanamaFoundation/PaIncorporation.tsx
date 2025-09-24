/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react"
import { atom, useAtom } from "jotai"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Info, AlertCircle, FileText, Users, Building, Shield, Banknote, Printer } from "lucide-react"

export interface PanamaPIFForm {
    _id: string
    email: string
    contactName: string
    phone: string
    contactPref: string
    foundationNameEn: string
    foundationNameEs: string
    altName1: string
    altName2: string
    purposeSummary: string
    duration: "" | "perpetual" | "fixed"
    baseCurrency: string
    initialEndowment: string
    founders: Array<{
        type: "individual" | "corporate" | ""
        name: string
        id: string
        email?: string
        tel?: string
    }>
    councilIndividuals: Array<{
        type: "individual" | "corporate" | ""
        name: string
        id: string
        email?: string
        tel?: string
    }>
    useNomineeDirector: boolean
    nomineeType: "" | "individual" | "corporate"
    nomineeRole: "" | "President" | "Treasurer" | "Secretary"
    councilCorporate: {
        corpMain: string
        addrRep: string
        signatory: string
        email: string
    }
    protectorsEnabled: boolean
    protectors: Array<{ name: string; contact: string }>
    beneficiariesMode: "fixed" | "class" | "mixed"
    beneficiaries: Array<{ name: string; contact: string }>
    bylawsMode: "standard" | "custom"
    bylawsPowers: string
    bylawsAdmin: string
    bankingNeed: "need" | "none" | "later" | ""
    bankingBizType: "" | "consulting" | "ecommerce" | "investment" | "crypto" | "manufacturing"
    shippingInfo: string
    pepAny: "yes" | "no" | ""
    taxOk: boolean
    truthOk: boolean
    privacyOk: boolean
    signName: string
    signDate: string
    signTitle: string
    status: string
}

const initialPIF: PanamaPIFForm = {
    _id: "",
    email: "",
    contactName: "",
    phone: "",
    contactPref: "",
    foundationNameEn: "",
    foundationNameEs: "",
    altName1: "",
    altName2: "",
    purposeSummary: "",
    duration: "",
    baseCurrency: "",
    initialEndowment: "",
    founders: [{ type: "", name: "", id: "", email: "", tel: "" }],
    councilIndividuals: [
        { type: "", name: "", id: "", email: "", tel: "" },
        { type: "", name: "", id: "", email: "", tel: "" },
        { type: "", name: "", id: "", email: "", tel: "" },
    ],
    useNomineeDirector: false,
    nomineeType: "",
    nomineeRole: "",
    councilCorporate: { corpMain: "", addrRep: "", signatory: "", email: "" },
    protectorsEnabled: true,
    protectors: [{ name: "", contact: "" }],
    beneficiariesMode: "fixed",
    beneficiaries: [{ name: "", contact: "" }],
    bylawsMode: "standard",
    bylawsPowers: "",
    bylawsAdmin: "",
    bankingNeed: "",
    bankingBizType: "",
    shippingInfo: "",
    pepAny: "no",
    taxOk: false,
    truthOk: false,
    privacyOk: false,
    signName: "",
    signDate: "",
    signTitle: "",
    status: "Pending",
}

export const pifFormAtom = atom<PanamaPIFForm>(initialPIF)
export const pifFormWithResetAtom = atom(
    (get) => get(pifFormAtom),
    (_get, set, update: PanamaPIFForm | "reset") => {
        if (update === "reset") set(pifFormAtom, initialPIF)
        else set(pifFormAtom, update)
    },
)

type FieldOption = { label: string; value: string }

type FieldBase = {
    type: "text" | "email" | "number" | "textarea" | "select" | "checkbox" | "radio-group" | "derived"
    name: keyof PanamaPIFForm | string
    label: string
    placeholder?: string
    required?: boolean
    options?: FieldOption[]
    rows?: number
    tooltip?: string
    colSpan?: 1 | 2
    hint?: string
}

type StepConfig =
    | {
        id: string
        title: string
        description?: string
        fields: FieldBase[]
    }
    | {
        id: string
        title: string
        description?: string
        render: React.FC
    }

interface FormConfig {
    title: string
    steps: StepConfig[]
}

// function SectionTitle({ children }: { children: React.ReactNode }) {
//   return <h3 className="text-lg font-semibold text-foreground">{children}</h3>
// }

function sanitizeOptions(opts?: FieldOption[]) {
    return (opts || []).filter((o) => typeof o.value === "string" && o.value !== "")
}

function Field({ field }: { field: FieldBase }) {
    const [form, setForm] = useAtom(pifFormAtom)
    const span = field.colSpan === 2 ? "md:col-span-2" : ""
    const id = String(field.name)
    const set = (name: string, value: any) => setForm({ ...form, [name]: value })
    const labelEl = (
        <div className="flex items-center gap-2">
            <Label htmlFor={id} className="text-sm font-medium text-foreground">
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
    const hintEl = field.hint ? (
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{field.hint}</p>
    ) : null
    switch (field.type) {
        case "text":
        case "email":
        case "number":
            return (
                <div className={`grid gap-2 ${span}`}>
                    {labelEl}
                    <Input
                        id={id}
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
                <div className={`grid gap-2 ${span}`}>
                    {labelEl}
                    <Textarea
                        id={id}
                        rows={field.rows ?? 4}
                        placeholder={field.placeholder}
                        value={(form as any)[id] ?? ""}
                        onChange={(e) => set(id, e.target.value)}
                        className="min-h-[96px] resize-y"
                    />
                    {hintEl}
                </div>
            )
        case "select":
            return (
                <div className={`grid gap-2 ${span}`}>
                    {labelEl}
                    <Select value={String((form as any)[id] ?? "")} onValueChange={(v) => set(id, v)}>
                        <SelectTrigger id={id}>
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
                        <Label htmlFor={id} className="text-sm font-medium leading-relaxed cursor-pointer">
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
                    <RadioGroup value={String((form as any)[id] ?? "")} onValueChange={(v) => set(id, v)} className="flex flex-col gap-3">
                        {(field.options || []).map((o) => (
                            <label key={o.value} className="flex items-start gap-3 text-sm cursor-pointer group">
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
                <div className={`grid gap-2 ${span}`}>
                    {labelEl}
                    <Input id={id} readOnly value={(form as any)[id] ?? ""} className="bg-muted" />
                    {hintEl}
                </div>
            )
    }
}

function FounderCard({ idx }: { idx: number }) {
    const [form, setForm] = useAtom(pifFormAtom)
    const f = form.founders[idx]
    const update = (patch: Partial<(typeof form)["founders"][number]>) => {
        const next = [...form.founders]
        next[idx] = { ...next[idx], ...patch }
        setForm({ ...form, founders: next })
    }

    return (
        <Card className="border border-border">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Founder #{idx + 1}
                </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label className="text-sm font-medium">Founder Type</Label>
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
                <div className="grid gap-2">
                    <Label className="text-sm font-medium">Full Name / Corporate Name</Label>
                    <Input value={f.name} onChange={(e) => update({ name: e.target.value })} placeholder="Enter full or corporate name" />
                </div>
                <div className="grid gap-2">
                    <Label className="text-sm font-medium">Passport / Reg. No.</Label>
                    <Input value={f.id} onChange={(e) => update({ id: e.target.value })} placeholder="Enter passport or registration number" />
                </div>
                <div className="grid gap-2">
                    <Label className="text-sm font-medium">Email</Label>
                    <Input type="email" value={f.email || ""} onChange={(e) => update({ email: e.target.value })} placeholder="email@example.com" />
                </div>
                <div className="grid gap-2">
                    <Label className="text-sm font-medium">Phone</Label>
                    <Input value={f.tel || ""} onChange={(e) => update({ tel: e.target.value })} placeholder="Enter phone number" />
                </div>
            </CardContent>
        </Card>
    )
}

function FoundersManager() {
    const [form, setForm] = useAtom(pifFormAtom)
    const add = () => setForm({ ...form, founders: [...form.founders, { type: "", name: "", id: "", email: "", tel: "" }] })
    const removeLast = () => setForm({ ...form, founders: form.founders.length > 1 ? form.founders.slice(0, -1) : form.founders })

    return (
        <div className="space-y-4">
            <InfoBox>
                <strong>Number of Founders</strong>: A Panama PIF can be founded by one or more persons (individual or corporate). Select the required number.
            </InfoBox>
            <div className="flex items-center gap-3">
                <Button variant="outline" onClick={add}>
                    <Users className="h-4 w-4 mr-2" />
                    Add Founder
                </Button>
                {form.founders.length > 1 && (
                    <Button variant="ghost" onClick={removeLast} className="text-muted-foreground">
                        Remove Last
                    </Button>
                )}
            </div>
            {form.founders.map((_, i) => (
                <FounderCard key={i} idx={i} />
            ))}
        </div>
    )
}

function CouncilIndividualsStep() {
    const [form, setForm] = useAtom(pifFormAtom)
    const update = (idx: number, patch: Partial<(typeof form)["councilIndividuals"][number]>) => {
        const next = [...form.councilIndividuals]
        next[idx] = { ...next[idx], ...patch }
        setForm({ ...form, councilIndividuals: next })
    }
    return (
        <div className="space-y-3">
            <div className="rounded-md border border-border p-3 text-sm bg-muted/30">
                Under Panamanian law, the council may consist of at least three individuals or one corporate. This section is for three individuals.
            </div>
            {form.councilIndividuals.map((m, i) => (
                <Card key={i} className="border border-dashed border-border">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Council Member #{i + 1} – Quick Info</CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label className="text-sm font-medium">Type</Label>
                            <RadioGroup value={m.type} onValueChange={(v: any) => update(i, { type: v })} className="flex gap-4">
                                <label className="flex items-center gap-2 text-sm">
                                    <RadioGroupItem value="individual" id={`c-type-i-${i}`} /> Individual
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <RadioGroupItem value="corporate" id={`c-type-c-${i}`} /> Corporate
                                </label>
                            </RadioGroup>
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-sm font-medium">Full Name / Corporate Name</Label>
                            <Input value={m.name} onChange={(e) => update(i, { name: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-sm font-medium">Passport / Reg. No.</Label>
                            <Input value={m.id} onChange={(e) => update(i, { id: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-sm font-medium">Email</Label>
                            <Input type="email" value={m.email || ""} onChange={(e) => update(i, { email: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-sm font-medium">Phone</Label>
                            <Input value={m.tel || ""} onChange={(e) => update(i, { tel: e.target.value })} />
                        </div>
                    </CardContent>
                </Card>
            ))}
            <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                    <Checkbox id="useNomineeDirector" checked={form.useNomineeDirector} onCheckedChange={(v) => setForm({ ...form, useNomineeDirector: Boolean(v) })} />
                    <Label htmlFor="useNomineeDirector">Use Nominee Director service</Label>
                </div>
                {form.useNomineeDirector && (
                    <div className="grid md:grid-cols-2 gap-3 col-span-2">
                        <div className="grid gap-2">
                            <Label className="text-sm font-medium">Nominee Director Type</Label>
                            <Select value={form.nomineeType} onValueChange={(v) => setForm({ ...form, nomineeType: v as any })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="individual">Individual</SelectItem>
                                    <SelectItem value="corporate">Corporate</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-sm font-medium">Director's Role</Label>
                            <Select value={form.nomineeRole} onValueChange={(v) => setForm({ ...form, nomineeRole: v as any })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="President">President</SelectItem>
                                    <SelectItem value="Treasurer">Treasurer</SelectItem>
                                    <SelectItem value="Secretary">Secretary</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function CouncilCorporateStep() {
    const [form, setForm] = useAtom(pifFormAtom)
    const c = form.councilCorporate
    const update = (patch: Partial<typeof c>) => setForm({ ...form, councilCorporate: { ...c, ...patch } })
    return (
        <div className="space-y-3">
            <div className="rounded-md border border-border p-3 text-sm bg-muted/30">
                If a corporate acts as the council (rarer structure), fill in the basics below. Authorized signatory (individual) will require separate KYC.
            </div>
            <div className="grid md:grid-cols-2 gap-3">
                <div className="grid gap-2">
                    <Label className="text-sm font-medium">Corporate Name / Reg. No. / Jurisdiction</Label>
                    <Input value={c.corpMain} onChange={(e) => update({ corpMain: e.target.value })} />
                </div>
                <div className="grid gap-2">
                    <Label className="text-sm font-medium">Registered Address / Representative</Label>
                    <Input value={c.addrRep} onChange={(e) => update({ addrRep: e.target.value })} />
                </div>
                <div className="grid gap-2">
                    <Label className="text-sm font-medium">Authorized Signatory (optional)</Label>
                    <Input value={c.signatory} onChange={(e) => update({ signatory: e.target.value })} />
                </div>
                <div className="grid gap-2">
                    <Label className="text-sm font-medium">Email</Label>
                    <Input type="email" value={c.email} onChange={(e) => update({ email: e.target.value })} />
                </div>
            </div>
        </div>
    )
}

function SimpleRepeater({
    title,
    items,
    onAdd,
    onUpdate,
    onRemove,
}: {
    title: string
    items: Array<{ name: string; contact: string }>
    onAdd: () => void
    onUpdate: (idx: number, patch: Partial<{ name: string; contact: string }>) => void
    onRemove?: (idx: number) => void
}) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Button variant="outline" onClick={onAdd}>+ Add {title}</Button>
            </div>
            {items.map((it, i) => (
                <Card className="border border-dashed border-border" key={i}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{title} #{i + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label className="text-sm font-medium">Name / Corporate / Class</Label>
                            <Input value={it.name} onChange={(e) => onUpdate(i, { name: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-sm font-medium">Contact (optional)</Label>
                            <Input value={it.contact} onChange={(e) => onUpdate(i, { contact: e.target.value })} />
                        </div>
                        {onRemove ? (
                            <div className="col-span-2">
                                <Button variant="ghost" size="sm" onClick={() => onRemove(i)}>Remove</Button>
                            </div>
                        ) : null}
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
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <RadioGroup value={form.protectorsEnabled ? "yes" : "no"} onValueChange={(v) => setForm({ ...form, protectorsEnabled: v === "yes" })} className="flex gap-6">
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
                <SimpleRepeater title="Protector" items={form.protectors} onAdd={add} onUpdate={update} onRemove={remove} />
            ) : null}
        </div>
    )
}

function BeneficiariesManager() {
    const [form, setForm] = useAtom(pifFormAtom)
    const add = () => setForm({ ...form, beneficiaries: [...form.beneficiaries, { name: "", contact: "" }] })
    const update = (idx: number, patch: Partial<{ name: string; contact: string }>) => {
        const next = [...form.beneficiaries]
        next[idx] = { ...next[idx], ...patch } as any
        setForm({ ...form, beneficiaries: next })
    }
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
                <RadioGroup value={form.beneficiariesMode} onValueChange={(v: any) => setForm({ ...form, beneficiariesMode: v })} className="flex gap-6">
                    <label className="flex items-center gap-2 text-sm">
                        <RadioGroupItem value="fixed" /> Fixed List
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                        <RadioGroupItem value="class" /> Class
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                        <RadioGroupItem value="mixed" /> Mixed
                    </label>
                </RadioGroup>
                <Button variant="outline" onClick={add}>+ Add Beneficiary</Button>
            </div>
            <SimpleRepeater title="Beneficiary" items={form.beneficiaries} onAdd={add} onUpdate={update} />
        </div>
    )
}

function BylawsStep() {
    const [form, setForm] = useAtom(pifFormAtom)
    return (
        <div className="space-y-4">
            <RadioGroup value={form.bylawsMode} onValueChange={(v: any) => setForm({ ...form, bylawsMode: v })} className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value="standard" /> Apply Standard Template
                </label>
                <label className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value="custom" /> Write Custom Details
                </label>
            </RadioGroup>
            {form.bylawsMode === "custom" && (
                <div className="grid md:grid-cols-2 gap-3">
                    <div className="grid gap-2">
                        <Label className="text-sm font-medium">Allocation of Powers (Council vs Protector)</Label>
                        <Textarea placeholder="Signing authority / approval rights / removal powers, etc." value={form.bylawsPowers} onChange={(e) => setForm({ ...form, bylawsPowers: e.target.value })} />
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-sm font-medium">Recordkeeping / Audit / Reporting · Dissolution Conditions</Label>
                        <Textarea placeholder="Retention periods, audit cycles, reporting lines / specific events & voting requirements, etc." value={form.bylawsAdmin} onChange={(e) => setForm({ ...form, bylawsAdmin: e.target.value })} />
                    </div>
                </div>
            )}
        </div>
    )
}

const bankingHints: Record<string, string> = {
    consulting: "General consulting/holding: mid risk. Expect clarity on revenue/contracts/organization & UBO. Remote onboarding limited.",
    ecommerce: "Online service/e-commerce: payment flows, customer countries, refund policy required. Consider PSP/EMI alongside bank account.",
    investment: "Investment/equity holding: if largely passive, banks may be less keen. Consider brokerage/custody accounts.",
    crypto: "Virtual assets: many banks restrict. Consider crypto-friendly banks (e.g., Towerbank) or VASP/EMI combinations.",
    manufacturing: "Manufacturing/trade: require substance docs (supply agreements, shipping docs). Trade finance assessed separately.",
}

function BankingStep() {
    const [form, setForm] = useAtom(pifFormAtom)
    const showGuide = form.bankingNeed === "need"
    return (
        <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
                <div className="grid gap-2">
                    <Label className="text-sm font-medium">Need to open an account?</Label>
                    <RadioGroup value={form.bankingNeed} onValueChange={(v: any) => setForm({ ...form, bankingNeed: v })} className="flex gap-6">
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
                <div className="grid gap-2">
                    <Label className="text-sm font-medium">Business Activity Type (for guidance)</Label>
                    <Select value={form.bankingBizType} onValueChange={(v) => setForm({ ...form, bankingBizType: v as any })}>
                        <SelectTrigger>
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
                <div className="space-y-3">
                    <div className="rounded-md border border-border p-3 text-sm bg-muted/30">
                        <b>Banks / EMIs (for reference)</b>
                        <ul className="list-disc ml-6 mt-2 space-y-1">
                            <li>Panama local banks often require in-person interview & UBO evidence for non-resident/foundation accounts.</li>
                            <li>Crypto-friendly: Towerbank (subject to policies & risk appetite).</li>
                            <li>EMI/foreign acceptance of “Foundation” varies — pre-check required.</li>
                        </ul>
                    </div>
                    {form.bankingBizType && (
                        <div className="text-sm text-muted-foreground">Activity guidance: {bankingHints[form.bankingBizType]}</div>
                    )}
                    <div className="text-xs text-muted-foreground">
                        Indicative documents: Foundation charter/registration, council register & acceptances, UBO chart, founders'/directors' passport & address proof, source of funds, business description/contracts, tax ID/residence proof, references, interview, etc.
                    </div>
                </div>
            )}
        </div>
    )
}

function DeliverablesStep() {
    const [form, setForm] = useAtom(pifFormAtom)
    return (
        <div className="grid md:grid-cols-2 gap-3">
            <div className="text-sm text-muted-foreground space-y-1">
                <div className="font-medium text-foreground">Deliverables (indicative)</div>
                <div>
                    Public Deed / Translation, Certificate of Public Registry / Translation, Foundation Certificate / Translation, Register of Council Members, Council’s Acceptance Letter, Regulations, Meeting of the Board, Certificate of Incumbency, Nominee Agreement (if any), Company Chop
                </div>
            </div>
            <div className="grid gap-2">
                <Label className="text-sm font-medium">Shipping Details</Label>
                <Textarea placeholder={"Recipient company / Contact person\nPhone number\nAddress\nPostal code"} value={form.shippingInfo} onChange={(e) => setForm({ ...form, shippingInfo: e.target.value })} />
            </div>
        </div>
    )
}

function DeclarationsStep() {
    const [form, setForm] = useAtom(pifFormAtom)
    const set = (patch: Partial<PanamaPIFForm>) => setForm({ ...form, ...patch })
    return (
        <div className="space-y-4">
            <div className="flex items-start gap-3">
                <Checkbox checked={form.taxOk} onCheckedChange={(v) => set({ taxOk: Boolean(v) })} />
                <span className="text-sm">I confirm compliance with applicable tax obligations and that the PIF is not intended for unlawful/sanctioned purposes.</span>
            </div>
            <div className="flex items-start gap-3">
                <Checkbox checked={form.truthOk} onCheckedChange={(v) => set({ truthOk: Boolean(v) })} />
                <span className="text-sm">I confirm the accuracy and completeness of the information provided.</span>
            </div>
            <div className="flex items-start gap-3">
                <Checkbox checked={form.privacyOk} onCheckedChange={(v) => set({ privacyOk: Boolean(v) })} />
                <span className="text-sm">I consent to the processing of personal data for KYC/sanctions screening and service delivery.</span>
            </div>
            <div className="grid md:grid-cols-2 gap-3 mt-2">
                <div className="grid gap-2">
                    <Label className="text-sm font-medium">Signature (type your name)</Label>
                    <Input value={form.signName} onChange={(e) => set({ signName: e.target.value })} />
                </div>
                <div className="grid gap-2">
                    <Label className="text-sm font-medium">Date</Label>
                    <Input type="date" value={form.signDate} onChange={(e) => set({ signDate: e.target.value })} />
                </div>
                <div className="grid gap-2 md:col-span-2">
                    <Label className="text-sm font-medium">Title / Capacity</Label>
                    <Input value={form.signTitle} onChange={(e) => set({ signTitle: e.target.value })} />
                </div>
                <div className="text-xs text-muted-foreground md:col-span-2">
                    ※ This form is for preliminary information gathering for review/quotation/KYC and does not constitute legal or tax advice.
                </div>
            </div>
        </div>
    )
}

const panamaPIFConfig: FormConfig = {
    title: "Panama Private Interest Foundation (PIF) — Application",
    steps: [
        {
            id: "applicant",
            title: "A. Applicant Details",
            description: "We’ll send documents, invoices, and status updates to the email below.",
            fields: [
                { type: "email", name: "email", label: "Email", placeholder: "you@example.com" },
                { type: "text", name: "contactName", label: "Contact Person (Full Name)", placeholder: "John Smith" },
                { type: "text", name: "phone", label: "Phone / Messenger", placeholder: "+82 ..." },
                {
                    type: "text",
                    name: "contactPref",
                    label: "Preferred Contact Time / Method",
                    placeholder: "e.g., Weekdays 10:00–18:00, email preferred",
                },
            ],
        },
        {
            id: "profile",
            title: "B. Foundation Profile",
            description:
                "“Duration” is the legal life of the foundation. Typically Perpetual is chosen. You may also opt for a Fixed Term with specific termination conditions.",
            fields: [
                { type: "text", name: "foundationNameEn", label: "Foundation Name (English)", placeholder: "EX: MIRR ASIA FOUNDATION" },
                { type: "text", name: "foundationNameEs", label: "Foundation Name (Spanish, optional)", placeholder: "(optional)" },
                { type: "text", name: "altName1", label: "Alternative Name (Option 1)" },
                { type: "text", name: "altName2", label: "Alternative Name (Option 2)" },
                { type: "textarea", name: "purposeSummary", label: "Purpose Summary", placeholder: "e.g., asset protection, succession planning, philanthropy, investment income management", colSpan: 2 },
                { type: "select", name: "duration", label: "Duration", options: [{ label: "Perpetual", value: "perpetual" }, { label: "Fixed Term", value: "fixed" }] },
                { type: "text", name: "baseCurrency", label: "Base Currency", placeholder: "e.g., USD" },
                { type: "number", name: "initialEndowment", label: "Initial Endowment", placeholder: "e.g., 10000" },
            ],
        },
        { id: "founders", title: "C. Founder(s)", render: FoundersManager },
        { id: "council-individuals", title: "D-1. Foundation Council: 3 Individuals", render: CouncilIndividualsStep },
        { id: "council-corporate", title: "D-2. Foundation Council: 1 Corporate", render: CouncilCorporateStep },
        { id: "protectors", title: "E. Protector (optional)", render: ProtectorsManager },
        { id: "beneficiaries", title: "F. Beneficiaries", render: BeneficiariesManager },
        { id: "bylaws", title: "G. By-Laws", render: BylawsStep },
        { id: "es", title: "H. Economic Substance (ES) Check", description: "Panama has not implemented a broad ES regime; general PIFs are typically not directly subject. Tax/reporting obligations vary by case.", fields: [] },
        { id: "banking", title: "I. Banking", render: BankingStep },
        { id: "pep", title: "J. Politically Exposed Person (PEP)", fields: [{ type: "radio-group", name: "pepAny", label: "Is any participant (founder, council, protector, beneficiary) a PEP? (Detailed checks occur in onboarding forms)", options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }] }] },
        { id: "deliverables", title: "K. Post-Incorporation Deliverables & Shipping", render: DeliverablesStep },
        { id: "declarations", title: "L. Declarations & e-Sign", render: DeclarationsStep },
    ],
}

function InfoBox({ children }: { children: React.ReactNode }) {
    return (
        <div className="rounded-md border border-border bg-muted/30 p-3">
            <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="text-sm leading-relaxed text-foreground">{children}</div>
            </div>
        </div>
    )
}

function StepBadge({ current, total }: { current: number; total: number }) {
    return (
        <Badge variant="outline" className="rounded-full">Step {current} / {total}</Badge>
    )
}

function StepShell({ step, idx, total }: { step: StepConfig; idx: number; total: number }) {
    const getStepIcon = (stepId: string) => {
        const iconMap: Record<string, any> = {
            applicant: FileText,
            profile: Building,
            founders: Users,
            "council-individuals": Shield,
            "council-corporate": Building,
            protectors: Shield,
            beneficiaries: Users,
            bylaws: FileText,
            banking: Banknote,
            deliverables: FileText,
            declarations: FileText,
        }
        return iconMap[stepId] || FileText
    }
    const StepIcon = getStepIcon(step.id)

    return (
        <Card className="border border-border shadow-sm mb-6">
            <CardHeader className="pb-4">
                <CardTitle>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-muted border border-border">
                                <StepIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-foreground">{step.title}</h2>
                                <div className="mt-1"><StepBadge current={idx + 1} total={total} /></div>
                            </div>
                        </div>
                    </div>
                </CardTitle>
                {"description" in step && step.description ? (
                    <div className="mt-3">
                        <InfoBox>{step.description}</InfoBox>
                    </div>
                ) : null}
            </CardHeader>
            <CardContent>
                {"fields" in step ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {step.fields.map((f, i) => (
                            <Field key={i} field={f} />
                        ))}
                    </div>
                ) : step.render ? (
                    React.createElement(step.render)
                ) : null}
            </CardContent>
        </Card>
    )
}

export default function PanamaFoundation() {
    const [form] = useAtom(pifFormAtom)

    React.useEffect(() => {
        document.title = "Panama PIF Application - Mirr Asia"
    }, [])

    const save = () => {
        console.log("PanamaPIFForm", form)
    }

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="max-w-5xl mx-auto p-4 lg:p-6 space-y-6 bg-background text-foreground">
            <header className="space-y-4" role="banner" aria-label="Panama PIF Application">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    <div className="lg:col-span-2">
                        <h1 className="text-3xl font-extrabold mb-2 leading-tight text-foreground">Panama Private Interest Foundation (PIF) – Application Form</h1>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                            Standard application form for establishing a Panama PIF, suitable for asset protection, succession, and international investment management. After completing, please <strong>Print / Save as PDF</strong> and submit per the instructions.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">Asset Protection</Badge>
                            <Badge variant="outline">Flexible By-Laws</Badge>
                            <Badge variant="outline">Beneficiary Planning</Badge>
                            <Badge variant="outline">Private & Confidential</Badge>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 lg:items-end print:hidden">
                        <Button onClick={handlePrint}>
                            <Printer className="h-4 w-4 mr-2" />
                            Print / Save as PDF
                        </Button>
                        <a
                            href="https://center-pf.kakao.com/_KxmnZT/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button asChild>
                                <span>Contact Us</span>
                            </Button>
                        </a>
                    </div>
                </div>
            </header>

            {/* Form Steps */}
            <div className="space-y-0">
                {panamaPIFConfig.steps.map((step, i) => (
                    <StepShell key={step.id} step={step} idx={i} total={panamaPIFConfig.steps.length} />
                ))}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-border print:hidden">
                <div className="text-xs text-muted-foreground">© Mirr Asia · Panama PIF – Information & Intake Form</div>
                <Button onClick={save} size="lg">
                    <FileText className="h-4 w-4 mr-2" />
                    Save Application
                </Button>
            </div>
        </div>
    )
}
