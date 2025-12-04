/* eslint-disable @typescript-eslint/no-explicit-any */
import { atom } from "jotai"
import api from '@/services/fetch';

export type MemberForm = {
    _id?: string
    companyName?:string;
    companyId?:string;
    userId?: string
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
    _id: "",
    userId: "",
    companyName:"",
    companyId:"",
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

export const pifFormWithResetAtom = atom(
  (get) => get(memberFormAtom),
  (_get, set, update: MemberForm | "reset") => {
    if (update === "reset") set(memberFormAtom, initialMemberForm)
    else set(memberFormAtom, update)
  },
)

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

export const getPpifMemberByid = async (id: string) => {
    try {
        const response = await api.get(`/incorporation/ppifMember/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching Panama Foundation data:", error);
        throw error;
    }
};

export const createOrUpdatePpifMember = async (data: any) => {
    try {
        const response = await api.post('/incorporation/ppifMember/', data);
        return response.data;
    } catch (error) {
        console.error("Error creating/updating Panama Foundation data:", error);
        throw error;
    }
};