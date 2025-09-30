/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react"
import { useMemo } from "react"
import { useAtom } from "jotai"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"
import {Option,memberFormAtom,FieldBase,MemberForm } from './ppifState'

// ---------- Small design tokens ----------
const gapSm = "gap-2.5"
const labelSm = "text-[13px] font-semibold text-foreground"
const inputSm = "h-9 text-sm"

function sanitizeOptions(list?: Option[]): Option[] {
  // Filter out nullish and any empty-string values to satisfy shadcn <SelectItem /> requirement
  return (list || []).filter(
    (o) => !!o && typeof o.value === "string" && o.value.trim() !== ""
  )
}

function Field({ field }: { field: FieldBase }) {
  const [form, setForm] = useAtom(memberFormAtom)
  const span = field.colSpan === 2 ? "md:col-span-2" : ""
  const id = String(field.name)
  const set = (name: string, value: any) => setForm({ ...form, [name]: value })

  const labelEl = field.label ? (
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
  ) : null

  const hintEl = field.hint ? (
    <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">{field.hint}</p>
  ) : null

  switch (field.type) {
    case "text":
    case "email":
    case "number":
    case "date":
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
          <Checkbox
            id={id}
            checked={Boolean((form as any)[id])}
            onCheckedChange={(v) => set(id, Boolean(v))}
          />
          <div className="grid gap-1">
            {labelEl}
            {hintEl}
          </div>
        </div>
      )
    case "radio-group":
      return (
        <div className={`grid gap-3 ${span}`}>
          {labelEl}
          <RadioGroup
            value={String((form as any)[id] ?? "")}
            onValueChange={(v) => set(id, v)}
            className="flex flex-col gap-2.5"
          >
            {(field.options || []).map((o) => (
              <label key={o.value} className="flex items-start gap-2 text-sm cursor-pointer group">
                <RadioGroupItem value={o.value} id={`${id}-${o.value}`} />
                <span className="leading-relaxed text-foreground group-hover:opacity-90 transition-opacity">
                  {o.label}
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

// ---------- Specialized compact groups ----------
function ChipsGrid({
  title,
  columns = 2,
  items,
  value,
  onChange,
  small = false,
}: {
  title?: string
  columns?: 2 | 3
  items: { value: string; label: string }[]
  value: string[]
  onChange: (next: string[]) => void
  small?: boolean
}) {
  const gridCols = columns === 3 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"
  return (
    <div className="grid gap-2">
      {title ? (
        <Label className={labelSm}>{title}</Label>
      ) : null}
      <div className={`grid ${gridCols} gap-2.5`}>
        {items.map((it) => {
          const checked = value.includes(it.value)
          return (
            <label
              key={it.value}
              className={`flex items-start gap-2 rounded-md border bg-background p-2.5 text-sm hover:bg-accent/50 transition ${
                checked ? "border-primary" : "border-border"
              }`}
            >
              <Checkbox
                checked={checked}
                onCheckedChange={(v) => {
                  const on = Boolean(v)
                  onChange(on ? [...value, it.value] : value.filter((x) => x !== it.value))
                }}
              />
              <div>
                <div className="font-semibold leading-5">{it.label.split("||")[0]}</div>
                {it.label.includes("||") ? (
                  <div className={`mt-0.5 ${small ? "text-[12px]" : "text-[12.5px]"} text-muted-foreground`}>
                    {it.label.split("||")[1]}
                  </div>
                ) : null}
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}

// ---------- Main Component ----------
export default function PanamaFoundationInvite() {
  const [form, setForm] = useAtom(memberFormAtom)

  // Effects that mirror original HTML interactions
  const founderEnabled = form.is_founder === "yes"
  const pepOn = form.pep === "yes"
  const showSrcOther = form.sourceOfFunds.includes("other")

  const set = (patch: Partial<MemberForm>) => setForm({ ...form, ...patch })

  // Options (config-driven)
  const maritalOptions = useMemo<Option[]>(
    () => [
      // No empty-string values in SelectItem options; placeholder shown via <SelectValue />
      { value: "Married", label: "Married" },
      { value: "Single", label: "Single" },
      { value: "Other", label: "Other" },
    ],
    []
  )

  const incomeBands: Option[] = [
    // No empty-string option; placeholder will handle the empty state
    { value: "Under 25,000", label: "Under 25,000" },
    { value: "25,000 - 39,999", label: "25,000 - 39,999" },
    { value: "40,000 - 49,999", label: "40,000 - 49,999" },
    { value: "50,000 - 64,999", label: "50,000 - 64,999" },
    { value: "65,000 - 124,999", label: "65,000 - 124,999" },
    { value: "125,000 - 499,999", label: "125,000 - 499,999" },
    { value: "500,000 - 999,999", label: "500,000 - 999,999" },
    { value: "Over 1 Million", label: "Over 1 Million" },
  ]

  return (
    <div className="mx-auto w-full p-3 md:p-4">
      {/* Header */}
      <Card className="mb-4 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-[21px]">Panama Private Interest Foundation – Member Registration Form</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-[13.5px] text-muted-foreground">
          <p>
            This form collects required information for the <b>individual registration of PIF participants</b> (Founder,
            Council, Protector, Beneficiary, etc.). Individuals use this form; a separate form applies to corporates.
          </p>
          <div className="mt-2 rounded-xl border border-dashed p-3 text-foreground bg-accent/20">
            ※ This is baseline information for KYC/AML and regulatory compliance. Please complete all required fields
            accurately.
          </div>
        </CardContent>
      </Card>

      {/* 1) Basic Information */}
      <Section title="1) Basic Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field
            field={{ name: "email", label: "Email Address *", type: "email", placeholder: "you@example.com" }}
          />
          <Field field={{ name: "fullName", label: "Full Name *", type: "text", placeholder: "John Smith" }} />

          <div className="grid gap-2.5">
            <Label className={labelSm}>Name Change (ever changed your legal name?) *</Label>
            <RadioGroup
              value={form.renamed}
              onValueChange={(v) => set({ renamed: v as MemberForm["renamed"] })}
              className="grid grid-cols-2 gap-2"
            >
              {[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ].map((o) => (
                <label key={o.value} className="flex items-center gap-2 text-sm cursor-pointer">
                  <RadioGroupItem id={`renamed-${o.value}`} value={o.value} />
                  <span>{o.label}</span>
                </label>
              ))}
            </RadioGroup>
            <p className="text-[12.5px] text-muted-foreground">
              If yes, please add your <i>former English full name</i> in the remarks below.
            </p>
          </div>

          <Field field={{ name: "dob", label: "Date of Birth *", type: "date" }} />
          <Field
            field={{ name: "pob", label: "Place of Birth *", type: "text", placeholder: "e.g., Seoul, Republic of Korea" }}
          />
          <Field
            field={{ name: "maritalStatus", label: "Marital Status *", type: "select", options: maritalOptions, placeholder: "Select" }}
          />

          <Field
            field={{ name: "nationality", label: "Nationality *", type: "text", placeholder: "e.g., Republic of Korea" }}
          />
          <Field field={{ name: "passport", label: "Passport Number *", type: "text" }} />
          <Field
            field={{ name: "occupation", label: "Occupation *", type: "text", placeholder: "e.g., Attorney / Entrepreneur" }}
          />
          <Field field={{ name: "mobile", label: "Mobile Phone (reachable) *", type: "text", placeholder: "+82 ..." }} />
          <Field
            field={{
              name: "residentialAddress",
              label: "Residential Address *",
              type: "textarea",
              placeholder: "English address preferred",
              rows: 4,
              colSpan: 2,
            }}
          />
          <Field
            field={{ name: "postalAddress", label: "Postal Address (if different)", type: "textarea", rows: 4, colSpan: 2 }}
          />
        </div>
      </Section>

      {/* 2) Founder & Contribution */}
      <Section title="2) Founder Status & Contribution">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="grid gap-2.5">
            <Label className={labelSm}>Are you a Founder of the PIF to be established? *</Label>
            <RadioGroup
              value={form.is_founder}
              onValueChange={(v) => set({ is_founder: v as MemberForm["is_founder"] })}
              className="grid grid-cols-2 gap-2"
            >
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <RadioGroupItem value="yes" id="is_founder-yes" />
                <span>Yes</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <RadioGroupItem value="no" id="is_founder-no" />
                <span>No</span>
              </label>
            </RadioGroup>
          </div>

          <div className="grid gap-2.5">
            <Label className={labelSm} htmlFor="contribution">
              (If Founder) Contribution Amount (USD)
            </Label>
            <Input
              id="contribution"
              className={inputSm}
              type="number"
              inputMode="decimal"
              placeholder="e.g., 10000"
              disabled={!founderEnabled}
              value={form.contribution}
              onChange={(e) => set({ contribution: e.target.value })}
            />
            <p className="text-[12.5px] text-muted-foreground">
              ※ In Panamanian practice it is shown as “Initial Endowment”. Lawful minimum USD 10,000 (no mandatory funding
              required).
            </p>
          </div>
        </div>

        {/* Source of Funds cards */}
        <div className="mt-2 grid gap-2.5">
          <Label className={labelSm}>Source of Funds for Contribution (select all that apply)</Label>
          <ChipsGrid
            columns={3}
            items={[
              { value: "salary", label: "Employment Income||Salary, bonus, etc." },
              { value: "savings", label: "Savings / Deposits||Long-term personal savings" },
              { value: "invest", label: "Investment Income||Real estate, equities, bonds, funds" },
              { value: "loan", label: "Loans||Borrowings from financial institutions" },
              { value: "disposal", label: "Business/Share Disposal||Proceeds from sale of business or shares" },
              { value: "bizdiv", label: "Business Income / Dividends||Operating profits, dividend income" },
              { value: "inherit", label: "Inheritance / Gift||Bequests, inter vivos gifts" },
              { value: "other", label: "Other||Please specify below" },
            ]}
            value={form.sourceOfFunds}
            onChange={(next) => set({ sourceOfFunds: next })}
            small
          />

          {showSrcOther ? (
            <div className="grid gap-2.5 max-w-xl">
              <Label className={labelSm}>Other – details</Label>
              <Input
                className={inputSm}
                placeholder="Please specify the other source of funds"
                value={form.sourceOther}
                onChange={(e) => set({ sourceOther: e.target.value })}
              />
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          <Field
            field={{ name: "inflowCountries", label: "Country(ies) of Funds Inflow *", type: "text", placeholder: "e.g., KR, HK, SG" }}
          />
          <Field
            field={{ name: "remarks", label: "Remarks (former English name / additional notes)", type: "text", placeholder: "Optional" }}
          />
        </div>
      </Section>

      {/* 3) Tax Information */}
      <Section title="3) Tax Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field
            field={{ name: "taxResidence", label: "Tax Residence Country *", type: "text", placeholder: "e.g., Republic of Korea" }}
          />
          <Field
            field={{ name: "tin", label: "Taxpayer Identification Number (TIN) *", type: "text", placeholder: "If unavailable, provide local equivalent" }}
          />
        </div>
        <p className="text-[12.5px] text-muted-foreground mt-1">
          ※ “Tax residence” generally refers to the jurisdiction where you spend ≥183 days/year or are otherwise liable to
          income tax.
        </p>
      </Section>

      {/* 4) Role(s) in the Foundation */}
      <Section title="4) Role(s) in the Foundation (select all that apply)">
        <ChipsGrid
          columns={3}
          items={[
            { value: "president", label: "President (Council)" },
            { value: "secretary", label: "Secretary (Council)" },
            { value: "treasurer", label: "Treasurer (Council)" },
            { value: "protector", label: "Protector" },
            { value: "beneficiary", label: "Beneficiary" },
            { value: "nominee", label: "Nominee / Representative" },
            { value: "dcp", label: "Designated Contact Person" },
          ]}
          value={form.roles}
          onChange={(next) => set({ roles: next })}
          small
        />
        <div className="mt-2 rounded-xl border border-dashed p-3 text-[13.5px]">
          <b>Protector</b>: may hold oversight/approval rights (e.g., appointment/removal of council, by-laws amendments).<br />
          <b>Beneficiary</b>: receives economic benefits. For privacy, beneficiary details can be structured via By-Laws / Letter of Wishes.
        </div>
      </Section>

      {/* 5) Future Funds */}
      <Section title="5) Future Funds Inflow/Generation to the PIF">
        <ChipsGrid
          columns={3}
          items={[
            { value: "pif_income", label: "Income generated by the PIF" },
            { value: "addl_contrib", label: "Additional contributions to the PIF" },
            { value: "interest", label: "Interest income" },
            { value: "investment", label: "Investment income" },
            { value: "disposal", label: "Business/share disposal proceeds" },
            { value: "inheritance", label: "Inheritance/gifts" },
            { value: "loans", label: "Loans/escrow/deposits" },
            { value: "other", label: "Other" },
          ]}
          value={form.futureFunds}
          onChange={(next) => set({ futureFunds: next })}
          small
        />
      </Section>

      {/* 6) PEP */}
      <Section title="6) Politically Exposed Person (PEP) Check">
        <div className="rounded-xl border border-dashed p-3 text-[13.5px]">
          <b>PEP</b>: includes current/former senior public officials, senior political party officials, SOE executives, and senior officials of international organizations, as well as their <u>family members and close associates</u> (per FATF guidance).  
          Examples: ministers/vice-ministers, members of parliament, supreme court justices, senior military officers, CEOs of state-owned enterprises, directors of international organizations, etc.
        </div>
        <div className="grid grid-cols-2 gap-3 mt-2 max-w-sm">
          <RadioGroup
            value={form.pep}
            onValueChange={(val) => set({ pep: val as MemberForm["pep"] })}
            className="grid grid-cols-2 gap-2"
          >
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <RadioGroupItem id="pep-yes" value="yes" />
              <span>Yes</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <RadioGroupItem id="pep-no" value="no" />
              <span>No</span>
            </label>
          </RadioGroup>
        </div>
        {pepOn ? (
          <div className="grid gap-2.5 mt-2">
            <Label className={labelSm}>If Yes, please describe</Label>
            <Textarea
              id="pepDetail"
              className="text-sm"
              placeholder="Full name / position / relationship / period, etc."
              value={form.pepDetail}
              onChange={(e) => set({ pepDetail: e.target.value })}
            />
          </div>
        ) : null}
      </Section>

      {/* 7) Required Documents */}
      <Section title="7) Required Documents Checklist">
        <div className="rounded-xl border border-dashed p-3 text-[12.5px] text-foreground/90">
          All documents should be <b>issued within the last 3 months</b>. Non-English documents may require certified translation. Certified passport copies can be obtained from local authorities.
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2 text-[13px]">
          <CheckLine
            id="doc_passport"
            label="Passport copy + Certificate of Passport Copy (notarized/certified)"
          />
          <CheckLine id="doc_bank" label="Bank statement(s) for the last 12 months or a Bank Reference Letter" />
          <CheckLine id="doc_address" label="Proof of address (e.g., resident register extract / utility bill)" />
          <CheckLine
            id="doc_profref"
            label="Professional reference (lawyer/accountant/banker; ≥2 years relationship)"
          />
          <CheckLine id="doc_cv" label="Curriculum Vitae (English)" />
          <CheckLine id="doc_other" label="Others (if applicable): additional supporting documents" />
        </div>
      </Section>

      {/* 8) Beneficial Owner */}
      <Section title="8) Beneficial Owner (BO) Confirmation">
        <div className="rounded-xl border border-dashed p-3 text-[13.5px]">
          <b>Summary Definition</b>: the <u>natural person(s)</u> who ultimately <u>owns or controls</u> the legal arrangement (FATF/OECD).  
          Examples: (1) Founder retains practical control/ability to reclaim assets; (2) Council/Protector effectively controls via decision rights; (3) Beneficiary ultimately enjoys economic benefits. <br />
          <span className="text-[12.5px]">*In practice, founders, council members, protectors, and economic beneficiaries may all qualify as BOs.</span>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-2 max-w-sm">
          <RadioGroup
            value={form.is_bo}
            onValueChange={(v) => set({ is_bo: v as MemberForm["is_bo"] })}
            className="grid grid-cols-2 gap-2"
          >
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <RadioGroupItem id="is_bo-yes" value="yes" />
              <span>Yes</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <RadioGroupItem id="is_bo-no" value="no" />
              <span>No</span>
            </label>
          </RadioGroup>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          <Field field={{ name: "lastIncome", label: "Last Year’s Income (USD)", type: "select", options: incomeBands, placeholder: "Select" }} />
          <Field field={{ name: "netWorth", label: "Current Net Worth (USD)", type: "select", options: incomeBands, placeholder: "Select" }} />
        </div>
      </Section>

      {/* 9) Declarations & Consents */}
      <Section title="9) Declarations & Consents">
        <div className="rounded-xl border border-dashed p-3 text-[12.5px]">
          I hereby confirm and agree to the following:<br /><br />
          ① The funds stated herein are <b>owned by me</b> and I have <b>full authority</b> to transfer them to the PIF.<br />
          ② The assets, net worth, income, or activities of the PIF are <b>not connected</b> to illicit weapons/WMD, money laundering, illegal narcotics, or any activity deemed <b>unlawful</b> in my citizenship/tax residence/country of residence and/or the place of establishment.<br />
          ③ I have obtained, or had access to, <b>appropriate legal and/or tax advice</b> prior to this application.<br />
          ④ I acknowledge the <b>obligation to pay annual fees</b> related to the services and that <b>electronic communications</b> (email/fax, etc.) may be used for notices and confirmations.
        </div>
        <div className="mt-2">
          <label className="flex items-start gap-2 text-sm">
            <Checkbox checked={form.agreeAll} onCheckedChange={(v) => set({ agreeAll: Boolean(v) })} />
            <span>I have read and agree to all of the above.</span>
          </label>
        </div>
      </Section>

      {/* Toolbar */}
      <div className="sticky bottom-3 mt-3 flex justify-end">
        <Button
          className="rounded-xl shadow-sm"
          type="button"
          onClick={() => console.log("Save clicked", form)}
        >
            Save 
        </Button>
      </div>
    </div>
  )
}

// ---------- Sub-components ----------
function Section({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return (
    <Card className="mb-2 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-[18px]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  )
}

function CheckLine({ id, label }: { id: keyof MemberForm; label: string }) {
  const [form, setForm] = useAtom(memberFormAtom)
  return (
    <label className="flex items-start gap-2 text-sm cursor-pointer">
      <Checkbox
        id={String(id)}
        checked={Boolean((form as any)[id])}
        onCheckedChange={(v) => setForm({ ...form, [id]: Boolean(v) } as any)}
      />
      <span className="leading-5">{label}</span>
    </label>
  )
}
