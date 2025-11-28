/* eslint-disable @typescript-eslint/no-explicit-any */
import { atom } from "jotai"
import api from '@/services/fetch';

export type NdCount = 0 | 1 | 2 | 3
export interface PIFPricing {
  currency: "USD"
  entityType: "pif" | "corp"
  setupBase: number         // PIF: 3800
  ndSetup: NdCount
  nsSetup: boolean
  optEmi: boolean
  optBank: boolean
  optCbi: boolean
  nd3ReasonSetup?: string
  total: number             // setup total only (computed)
  recordStorageUseMirr? :boolean
}

export interface PanamaPIFForm {
  _id?: string;
  userId:string
  stepIdx: number;
  email: string;
  contactName: string;
  phone?: string;
  contactPref?: string;
  // --- Profile / Names ---
  foundationNameEn: string;
  foundationNameEs?: string;
  altName1?: string;
  altName2?: string;
  // --- Profile / Purpose & Endowment ---
  purposeSummary: string;
  duration?: "" | "perpetual" | "fixed";
  baseCurrency?: string;
  initialEndowment?: string;
  sourceOfFunds?: "" |
  "Employment Income" |
  "Savings/Deposits" |
  "Investment Income (stocks/bonds/funds)" |
  "Loan" |
  "Proceeds from Sale of Company/Shares" |
  "Business Income/Dividends" |
  "Inheritance/Gift" |
  "other";
  sourceOfFundsOther?: string;
  endowmentPayer?: string;
  registeredAddressMode?: "" | "mirr" | "own";
  ownRegisteredAddress?: string;
  industries?: string[];
  geoCountries?: string;
  bizDesc?: string;
  councilMode?: "" | "ind3" | "corp1";
  nomineePersons?: "" | "1" | "2" | "3";
  // --- Founders / Council ---
  founders: Array<{ type: "individual" | "corporate" | ""; name: string; id: string; email?: string; tel?: string; status?: string }>;
  councilIndividuals: Array<{ type: "individual" | "corporate" | ""; name: string; id: string; email?: string; tel?: string;status?: string }>;
  councilCorporate: { corpMain: string; addrRep: string; signatory?: string; email?: string };
  // --- Options / Roles ---
  useNomineeDirector: boolean;
  nomineeType?: "" | "individual" | "corporate";
  nomineeRole?: "" | "President" | "Treasurer" | "Secretary";
  // --- Protectors / Beneficiaries / Bylaws ---
  protectorsEnabled: boolean;
  protectors: Array<{ name: string; contact: string;status?: string }>;
  beneficiariesMode: "fixed" | "class" | "mixed";
  beneficiaries: Array<{ name: string; contact: string }>;
  bylawsMode: "standard" | "custom";
  bylawsPowers?: string;
  bylawsAdmin?: string;
  // --- Banking ---
  bankingNeed?: "need" | "none" | "later" | "";
  bankingBizType?: "" | "consulting" | "ecommerce" | "investment" | "crypto" | "manufacturing";
  // --- AML flags ---
  legalAndEthicalConcern?: "yes" | "no" | "";
  q_country?: "yes" | "no" | "";
  sanctionsExposureDeclaration?: "yes" | "no" | "";
  crimeaSevastapolPresence?: "yes" | "no" | "";
  russianEnergyPresence?: "yes" | "no" | "";
  // --- PEP / Declarations / Sign ---
  pepAny?: "yes" | "no" | "";
  taxOk: boolean;
  truthOk: boolean;
  privacyOk: boolean;
  signName: string;
  signDate: string;
  signTitle?: string;
  // --- Shipping ---
  shippingRecipientCompany?: string;
  shippingContactPerson?: string;
  shippingPhone?: string;
  shippingPostalCode?: string;
  shippingAddress?: string;
  // --- Record storage ---
  recordStorageAddress?: string;
  recordStorageResponsiblePerson?: string;
  recordStorageUseMirr?: boolean;
  // --- Status ---
  incorporationStatus: string;
  letterOfWishes: string;
  // --- Pricing ---
  pricing: PIFPricing;
  // --- Payment (new) ---
  payMethod?: "card" | "bank" | "other" | "fps";      // default card
  paymentStatus?: "unpaid" | "paid" | "failed" | "pending";
  expiresAt?: string;                                  // ISO
  updatedAt?: string;                                  // ISO
  // Stripe / uploads (optional fields mirrored from HK flow)
  paymentIntentId?: string;
  stripeLastStatus?: string;
  stripePaymentStatus?: string;
  stripeReceiptUrl?: string;
  stripeAmountCents?: number;
  stripeCurrency?: string;
  bankRef?: string;
  uploadReceiptUrl?: string;
  receiptUrl?: string;
  amount?: string;
  currency?: string;
  paymentIntentStatus?: string;
  createdAt ? : string;
  users?: { userId: string; role: string }[];
}

export const initialPIF: PanamaPIFForm = {
  _id: "",
  userId: "",
  stepIdx: 0,
  email: "",
  contactName: "",
  phone: "",
  contactPref: "",
  // Names
  foundationNameEn: "",
  foundationNameEs: "",
  altName1: "",
  altName2: "",
  // Purpose & Endowment
  purposeSummary: "",
  duration: "",
  baseCurrency: "",
  initialEndowment: "",
  sourceOfFunds: undefined,
  sourceOfFundsOther: "",
  endowmentPayer: "",
  registeredAddressMode: "",
  ownRegisteredAddress: "",
  industries: [],
  geoCountries: "",
  bizDesc: "",
  councilMode: "ind3",
  nomineePersons: "",
  // Founders / Council
  founders: [{ type: "", name: "", id: "", email: "", tel: "" }],
  councilIndividuals: [
    { type: "", name: "", id: "", email: "", tel: "" },
    { type: "", name: "", id: "", email: "", tel: "" },
    { type: "", name: "", id: "", email: "", tel: "" },
  ],
  councilCorporate: { corpMain: "", addrRep: "", signatory: "", email: "" },
  // Options / Roles
  useNomineeDirector: false,
  nomineeType: "",
  nomineeRole: "",
  // Protectors / Beneficiaries / Bylaws
  protectorsEnabled: true,
  protectors: [{ name: "", contact: "" }],
  beneficiariesMode: "fixed",
  beneficiaries: [{ name: "", contact: "" }],
  bylawsMode: "standard",
  bylawsPowers: "",
  bylawsAdmin: "",
  // Banking
  bankingNeed: "",
  bankingBizType: "",
  // AML
  legalAndEthicalConcern: "",
  q_country: "",
  sanctionsExposureDeclaration: "",
  crimeaSevastapolPresence: "",
  russianEnergyPresence: "",
  // Shipping
  shippingRecipientCompany: "",
  shippingContactPerson: "",
  shippingPhone: "",
  shippingPostalCode: "",
  shippingAddress: "",
  // PEP / Declarations / Sign
  pepAny: "no",
  taxOk: false,
  truthOk: false,
  privacyOk: false,
  signName: "",
  signDate: "",
  signTitle: "",
  // Record storage
  recordStorageAddress: "",
  recordStorageResponsiblePerson: "",
  recordStorageUseMirr: false,
  // Status
  incorporationStatus: "Pending",
  letterOfWishes: "",
  // Pricing
  pricing: {
    currency: "USD",
    entityType: "pif",
    setupBase: 3800,
    ndSetup: 0,
    nsSetup: false,
    optEmi: false,
    optBank: false,
    optCbi: false,
    nd3ReasonSetup: "",
    total: 3800,
  },
  // Payment defaults
  payMethod: "card",
  paymentStatus: "unpaid",
  expiresAt: "",       // set by component on mount
  updatedAt: "",
  paymentIntentId: undefined,
  stripeLastStatus: undefined,
  stripePaymentStatus: undefined,
  stripeReceiptUrl: undefined,
  stripeAmountCents: undefined,
  stripeCurrency: "usd",
  bankRef: "",
  uploadReceiptUrl: undefined,
  receiptUrl: '',
  amount: '',        // cents
  currency: '',    // e.g., "usd"
  paymentIntentStatus: '',
  createdAt: "",
  users: [],
}

export const pifFormAtom = atom<PanamaPIFForm>(initialPIF)
export const pifFormWithResetAtom = atom(
  (get) => get(pifFormAtom),
  (_get, set, update: PanamaPIFForm | "reset") => {
    if (update === "reset") set(pifFormAtom, initialPIF)
    else set(pifFormAtom, update)
  },
)

/* ---------- Field types ---------- */
export type FieldOption = { label: string; value: string }
export type FieldBase = {
  type: "text" | "email" | "number" | "textarea" | "select" | "checkbox" | "radio-group" | "derived"
  name: string
  label: string
  placeholder?: string
  hint?: string
  rows?: number
  required?: boolean
  options?: FieldOption[]
  colSpan?: 1 | 2
  tooltip?: string
}
export type StepConfig =
  | { id: string; title: string; description?: string; fields: FieldBase[] }
  | { id: string; title: string; description?: string; render: React.ComponentType<any> }

export type FormConfig = {
  title: string
  steps: StepConfig[]
}


/* ---------- Fetching Data ---------- */
export const getPaFIncorpoData = async (id: string) => {
  try {
    const response = await api.get(`/incorporation/paif/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Panama Foundation data:", error);
    throw error;
  }
};

export const createOrUpdatePaFIncorpo = async (data: any) => {
  try {
    const response = await api.post('/incorporation/paif/', data);
    return response.data;
  } catch (error) {
    console.error("Error creating/updating Panama Foundation data:", error);
    throw error;
  }
};