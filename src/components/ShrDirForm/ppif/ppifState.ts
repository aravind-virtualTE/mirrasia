import { atom } from "jotai"

export type MemberForm = {
  email: string
  fullName: string
  renamed: "yes" | "no" | ""
  dob: string
  pob: string
  maritalStatus: string
  nationality: string
  passport: string
  occupation: string
  mobile: string
  residentialAddress: string
  postalAddress: string

  is_founder: "yes" | "no" | ""
  contribution: string
  sourceOfFunds: string[]
  sourceOther: string
  inflowCountries: string
  remarks: string

  taxResidence: string
  tin: string

  roles: string[]
  futureFunds: string[]

  pep: "yes" | "no" | ""
  pepDetail: string

  doc_passport: boolean
  doc_bank: boolean
  doc_address: boolean
  doc_profref: boolean
  doc_cv: boolean
  doc_other: boolean

  is_bo: "yes" | "no" | ""
  lastIncome: string
  netWorth: string

  agreeAll: boolean
}

export const initialMemberForm: MemberForm = {
  email: "",
  fullName: "",
  renamed: "",
  dob: "",
  pob: "",
  maritalStatus: "",
  nationality: "",
  passport: "",
  occupation: "",
  mobile: "",
  residentialAddress: "",
  postalAddress: "",
  is_founder: "",
  contribution: "",
  sourceOfFunds: [],
  sourceOther: "",
  inflowCountries: "",
  remarks: "",
  taxResidence: "",
  tin: "",
  roles: [],
  futureFunds: [],
  pep: "",
  pepDetail: "",
  doc_passport: false,
  doc_bank: false,
  doc_address: false,
  doc_profref: false,
  doc_cv: false,
  doc_other: false,
  is_bo: "",
  lastIncome: "",
  netWorth: "",
  agreeAll: false,
}

export const memberFormAtom = atom<MemberForm>(initialMemberForm)

// ---------- FieldBase + renderer ----------
export type Option = { value: string; label: string }
export type FieldBase = {
  name: keyof MemberForm | string
  label?: string
  type:
    | "text"
    | "email"
    | "number"
    | "date"
    | "textarea"
    | "select"
    | "checkbox"
    | "radio-group"
    | "derived"
  placeholder?: string
  rows?: number
  required?: boolean
  tooltip?: string
  colSpan?: 1 | 2
  options?: Option[]
  hint?: string
}