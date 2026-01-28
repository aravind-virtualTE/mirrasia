/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/services/fetch';
import { atom } from "jotai";

export type VaspFormState = {
    _id? :string;
    email: string;
    personName: string;
    personTitle: string;
    personPhone: string;
    snsId: string;
    countries: string[];
    countriesOther: string;
    industries: string[];
    industriesOther: string;
    services: string[];
    servicesOther: string;
    productDescription: string;
    vaspInterest: string;
    structure: string;
    structureOther: string;
    materials: string[];
    materialsOther: string;
};

export const initialVaspFormState: VaspFormState = {
  _id: "",
  email: "",
  personName: "",
  personTitle: "",
  personPhone: "",
  snsId: "",
  countries: [],
  countriesOther: "",
  industries: [],
  industriesOther: "",
  services: [],
  servicesOther: "",
  productDescription: "",
  vaspInterest: "",
  structure: "",
  structureOther: "",
  materials: [],
  materialsOther: "",
};

export const vaspFormAtom = atom<VaspFormState>(initialVaspFormState);

export const vaspFormWithResetAtom = atom(
  (get) => get(vaspFormAtom),
  (_get, set, update: VaspFormState | "reset") => {
    if (update === "reset") {
      set(vaspFormAtom, initialVaspFormState);
    } else {
      set(vaspFormAtom, update);
    }
  }
);


export const fetchQuotationReq = async () =>  api.get(`/quotation-requests/`).then(r => r.data);

export const saveQuotationReq = async (payload: any) =>
  api.post(`/quotation-requests/`, payload).then(r => r.data);
