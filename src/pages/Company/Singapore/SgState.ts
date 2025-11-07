/* eslint-disable @typescript-eslint/no-explicit-any */
import { atom } from 'jotai';
import { Option } from '@/components/MultiSelectInput';
export interface SgFormData {
  _id: string;
  userId: string;
  email: string;
  country: {
    code?: string;
    name?: string;
  }
  noOfSharesSelected: string | number;
  name: string;
  establishedRelationshipType: string[];
  isOtherRelation: string;
  phoneNum: string;
  snsAccountId: { value: string, id: string };
  offshoreTaxExemptionQuestion: { value: string, id: string };
  singaporeTaxFilingMythQuestion: { value: string, id: string };
  sgAccountingDeclaration: { id: string, value: string };
  hasLegalEthicalIssues: { id: string, value: string };
  annualRenewalTermsAgreement: { id: string, value: string };
  restrictedCountriesWithActivity: { id: string, value: string };
  sanctionedTiesPresent: { id: string, value: string };
  businessInCrimea: { id: string, value: string };
  involvedInRussianEnergyDefense: { id: string, value: string };
  [key: string]: any;
  webAddress: string;
  sgBusinessList: string;
  companyName: string[];
  noOfShareholders: string;
  noOfOfficers: string;
  shareHolders: {
    [x: string]: any;
    name: string;
    email: string;
    phone: string;
    ownershipRate: number;
    address: string;
    legalEntity: {
      value: string,
      id: string
    }
  }[];
  directors: {
    [x: string]: any;
    name: string;
    email: string;
    phone: string;
    address: string;
    legalEntity: {
      value: string,
      id: string
    }
  }[];
  accountingDataAddress: string;
  serviceItemsSelected: string[];
  isTermsAndConditionsAccepted: string;
  isDisabled: boolean
  receiptUrl: string
  sessionId: string
  paymentId: string
  status: string
  incorporationDate: string
  serviceAgreementConsent: boolean
  assignedTo: string
  shareCapitalPayment: { value: string, id: string };
  sgTotalCapPaid: string | number;
  registerAmountAtom: string | number;
  registerCurrencyAtom: string;
  selectedIndustry: string[];
  establishmentPurpose: string[];
  issuedSharesType: string[];
  otherIndustryText?: string
  productDescription: string
  otherEstablishmentPurpose?: string
  significantController: Option[];
  designatedContactPerson: string | number;
  finYearEnd: { id: string, value: string };
  businessAddress: { id: string, value: string };
  otherFinYrEnd?: string
  otherBusinessAddress?: string
  bookKeeping: { label: string, value: string };
  otherBookKeep?: string
  onlineAccountingSoftware: { label: string, value: string };
  seperateAccountingSoftware: string
  otherAccountingSoftware: string
  governanceStructure: { label: string, value: string };
  otherGoveranceStructure?: string,
  mobileOtpVerified?: boolean;
  emailOtpVerified?: boolean;

}

const initialFormState: SgFormData = {
  _id: '',
  userId: '',
  email: '',
  noOfSharesSelected: '',
  name: '',
  establishedRelationshipType: [],
  isOtherRelation: "",
  phoneNum: '',
  country: {
    code: 'SG',
    name: 'Singapore',
  },
  snsAccountId: {
    value: '',
    id: ''
  },
  hasLegalEthicalIssues: { id: '', value: '' },
  offshoreTaxExemptionQuestion: { id: '', value: '' },
  sgAccountingDeclaration: { id: '', value: '' },
  singaporeTaxFilingMythQuestion: { id: '', value: '' },
  annualRenewalTermsAgreement: { id: '', value: '' },
  restrictedCountriesWithActivity: { id: '', value: '' },
  sanctionedTiesPresent: { id: '', value: '' },
  businessInCrimea: { id: '', value: '' },
  involvedInRussianEnergyDefense: { id: '', value: '' },
  webAddress: '',
  sgBusinessList: "",
  companyName: ['', '', ''],
  noOfShareholders: '',
  noOfOfficers: '',
  shareHolders: [{
    name: '',
    email: '',
    phone: '',
    address: '',
    ownershipRate: 0,
    legalEntity: { id: "No", value: "No" },
  }],
  directors: [{
    name: '',
    email: '',
    phone: '',
    address: '',
    legalEntity: { id: "No", value: "No" },
  }],
  accountingDataAddress: '',
  isTermsAndConditionsAccepted: '',
  serviceItemsSelected: [],
  isDisabled: false,
  receiptUrl: "",
  sessionId: '',
  paymentId: '',
  status: "Pending",
  incorporationDate: "",
  serviceAgreementConsent: false,
  assignedTo: "",
  shareCapitalPayment: { value: '', id: '' },
  sgTotalCapPaid: "",
  registerAmountAtom: '',
  registerCurrencyAtom: '',
  selectedIndustry: [],
  establishmentPurpose: [],
  otherIndustryText: "",
  otherEstablishmentPurpose: "",
  productDescription: "",
  issuedSharesType: [],
  significantController: [],
  designatedContactPerson: '',
  finYearEnd: { value: '', id: '' },
  businessAddress: { value: '', id: '' },
  otherFinYrEnd: "",
  otherBusinessAddress: "",
  bookKeeping: { value: '', label: '' },
  otherBookKeep: "",
  onlineAccountingSoftware: { value: '', label: '' },
  governanceStructure: { value: '', label: '' },
  seperateAccountingSoftware: "",
  otherAccountingSoftware: "",
  otherGoveranceStructure: "",
  mobileOtpVerified: false,
  emailOtpVerified: false,
};

// Create the base atom
export const sgFormAtom = atom<SgFormData>(initialFormState);

// Atom with reset functionality
export const sgFormWithResetAtom = atom(
  (get) => get(sgFormAtom),
  (_get, set, update: SgFormData | 'reset') => {
    if (update === 'reset') {
      set(sgFormAtom, initialFormState);
    } else {
      set(sgFormAtom, update);
    }
  }
);

export const sgPrice = atom(0)
export const sgPriceAtom = atom(
  (get) => get(sgPrice),
  (_get, set, update: number | 'reset') => {
    if (update === 'reset') {
      set(sgPrice, 0);
    } else {
      set(sgPrice, update);
    }
  }
);

export const sgFormAtom1 = atom<any>({});

export const sgFormWithResetAtom1 = atom(
  (get) => get(sgFormAtom1),
  (_get, set, update: any | 'reset') => {
    if (update === 'reset') {
      set(sgFormAtom1, initialFormState);
    } else {
      set(sgFormAtom1, update);
    }
  }
);

export type Party = {
  name: string;
  email: string;
  phone: string;
  // isDirector: boolean; // removed from UI (kept here only if you still persist it)
  isCorp: boolean;
  shares: number;
  invited?: boolean;
  status?: "Invited" | "Not Invited" | "";
  typeOfShare?: string;
  // NEW FIELDS
  address?: string;
  isSignificant?: boolean;
  isDesignatedContact?: boolean;
  isDirector?: boolean,
};

export type FeeRow = {
  id: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  isOptional: boolean;
  note?: string;
  isHighlight?: boolean;
};