/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/services/fetch';
import { atom } from "jotai";

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
  name: string;
  label: string;
  placeholder?: string;
  hint?: string;
  tooltip?: string;
  colSpan?: 1 | 2;
  required?: boolean;
  options?: Option[];
  defaultValue?: any;
  rows?: number;
  condition?: (form: Record<string, any>) => boolean;
  compute?: (form: Record<string, any>) => string;
};

// ---------- Complex Step Renderers
export type RenderCtx = {
  app: AppDoc;
  setApp: React.Dispatch<React.SetStateAction<AppDoc>>;
  form: any;
  setForm: (fn: (prev: any) => any) => void;
};

export type Step = {
  id: string;
  title: string;
  description?: string;
  fields?: FieldBase[];
  render?: (ctx: RenderCtx) => React.ReactNode;
};

export type FormConfig = {
  title: string;
  steps: Step[];
};



/** Share type ids used across the app */
export type ShareTypeId = "ordinary" | "preference";

export type Party = {
  name: string;
  email: string;
  phone: string;
  isCorp: boolean;
  isDirector: boolean;
  shares: number;
  invited: boolean;
  typeOfShare: ShareTypeId; // id only
};

export type AppDoc = {
  stepIdx: number;
  form: Record<string, any>;
  parties: Party[];
  optionalFeeIds: string[];
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
};

/** Global HK incorporation state (null until hydrated) */
export const hkAppAtom = atom<AppDoc | null>(null);


export const getHkIncorpoData = async (id?: string) => {
  const response = await api.get(`/incorporation/hk/${id}`, );
  return response.data;
};

export const saveInvoiceBillableData = async (data: any) => {
  const response = await api.post(`/incorporation/hk/`, data,
    //  { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
};


export const updateInvoicePaymentIntent = (intentId: string, body: any) =>
  api.patch(`/incorporation/invoice-intent/${intentId}`, body).then(r => r.data);

export const notifyPaymentSuccess = async (payload: any) => {
  try {
    const res = await api.post("/incorporation/confirm-invoicePayment", payload);
    return res.data;
  } catch (err) {
    console.error("notifyPaymentSuccess error:", err);
    throw err;
  }
};

export const createInvoicePaymentIntent = async (data: any) => {
  try{
    const result = await api.post("/payment/invoice-intent-v1", data);
    return result.data;
  }catch(err){
    console.error("Error creating payment intent:", err);
  }
}

export const uploadIncorpoPaymentBankProof = async (docId: string,country:string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('id', docId);
  formData.append('country', country);
  const r = await api.post(`/incorporation/payment/${docId}/bank-proof`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return r.data;
}

export const deleteIncorpoPaymentBankProof = async (docId: string,country:string) => {
  const r = await api.delete(`/incorporation/payment/${docId}/bank-proof`, { data: { country } });
  return r.data;
}

export const updateCorporateInvoicePaymentIntent = async (data: any) => {
  try{
    const result = await api.post("/payment/update-intent-v1", data);
    return result.data;
  }catch(err){
    console.error("Error updating payment intent:", err);
  }
}