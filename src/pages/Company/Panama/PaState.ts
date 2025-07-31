/* eslint-disable @typescript-eslint/no-explicit-any */
import { atom } from 'jotai';
export interface PaFormData {
  _id: string;
  userId: string;
  email: string;
  country: {
    code?: string;
    name?: string;
  }
  noOfSharesIssued: string | number;
  name: string;
  legalEntity: string;
  address: string;
  // establishedRelationshipType: string[];
  phoneNum: string;
  snsAccountId: { value: string, id: string };
  // webAddress: string;
  companyName: string[];
  panamaEntity: { id: string, value: string };
  pEntityInfo: string;
  otherPanamaEntity: string
  // noOfShareholders: string;
  // noOfOfficers: string;
  shareHolders: {
    // [x: string]: any;
    name: string;
    email: string;
    phone: string;
    ownershipRate: number;
    role: {
      value: string,
      id: string
    };
    // isDirector: {
    //   value: string,
    //   id: string
    // }
    isLegalPerson: {
      value: string,
      id: string
    }
  }[];
  legalDirectors: {
    [x: string]: any;
    ownershipRate: number;
    role?: {
      value: string,
      id: string
    };
    // isDirector: {
    //   value: string,
    //   id: string
    // }
    isLegalPerson: {
      value: string,
      id: string
    }
  }[];
  // designatedContact: string | number;
  accountingDataAddress: string;
  otherAccountingAddress: string;
  serviceItemsSelected: string[];
  isTermsAndConditionsAccepted: string;
  isDisabled: boolean
  receiptUrl: string
  sessionId: string
  paymentId: string
  status: string
  incorporationDate: string
  typeOfShare: string;
  serviceAgreementConsent: boolean
  assignedTo: string
  shareCapitalPayment?: {
    value: string,
    id: string
  };
  paTotalCapPaid: string;
  totalAmountCap: string | number;
  registerCurrencyAtom: { code: string, label: string };
  selectedIndustry: string[];
  otherIndustryText: string;
  tradeAfterIncorporation: string;
  purposePaCompany: string[]
  otherPurposePaCompany: string
  listCountry: string
  sourceFunding: string[],
  otherSourceFund: string
  specificProvisions: string
  restrictedCountriesWithActivity: { id: string, value: string };
  sanctionedTiesPresent: { id: string, value: string };
  businessInCrimea: { id: string, value: string };
  involvedInRussianEnergyDefense: { id: string, value: string };
  hasLegalEthicalIssues: { id: string, value: string };
  annualRenewalTermsAgreement: { id: string, value: string };
  mobileOtpVerified?: boolean;
  emailOtpVerified?: boolean;

  [key: string]: any;
}

const initialFormState: PaFormData = {
  _id: '',
  userId: '',
  email: '',
  noOfSharesIssued: '',
  name: '',
  // establishedRelationshipType: [],
  legalEntity: '',
  panamaEntity: { id: '', value: '' },
  otherPanamaEntity: "",
  pEntityInfo: '',
  phoneNum: '',
  country: {
    code: 'PA',
    name: 'Panama',
  },
  snsAccountId: {
    value: '',
    id: ''
  },
  address: "",
  // webAddress: '',
  companyName: ['', '', ''],
  // noOfShareholders: '',
  // noOfOfficers: '',
  shareHolders: [],
  legalDirectors: [],
  // designatedContact: '',
  accountingDataAddress: '',
  otherAccountingAddress: '',
  isTermsAndConditionsAccepted: '',
  serviceItemsSelected: [],
  typeOfShare: '',
  isDisabled: false,
  receiptUrl: "",
  sessionId: '',
  paymentId: '',
  status: "Pending",
  incorporationDate: "",
  serviceAgreementConsent: false,
  assignedTo: "",
  shareCapitalPayment: {
    value: '',
    id: ''
  },
  paTotalCapPaid: "",
  totalAmountCap: '',
  registerCurrencyAtom: { code: '', label: '' },
  selectedIndustry: [],
  otherIndustryText: "",
  tradeAfterIncorporation: "",
  purposePaCompany: [],
  otherPurposePaCompany: '',
  listCountry: '',
  sourceFunding: [],
  otherSourceFund: '',
  specificProvisions: '',
  restrictedCountriesWithActivity: { id: '', value: '' },
  sanctionedTiesPresent: { id: '', value: '' },
  businessInCrimea: { id: '', value: '' },
  involvedInRussianEnergyDefense: { id: '', value: '' },
  annualRenewalTermsAgreement: { id: '', value: '' },
  hasLegalEthicalIssues: { id: '', value: '' },
  mobileOtpVerified: false,
  emailOtpVerified: false,

};

// Create the base atom
export const paFormAtom = atom<PaFormData>(initialFormState);

// Atom with reset functionality
export const paFormWithResetAtom = atom(
  (get) => get(paFormAtom),
  (_get, set, update: PaFormData | 'reset') => {
    if (update === 'reset') {
      set(paFormAtom, initialFormState);
    } else {
      set(paFormAtom, update);
    }
  }
);

export const paPrice = atom(0)
export const paPriceAtom = atom(
  (get) => get(paPrice),
  (_get, set, update: number | 'reset') => {
    if (update === 'reset') {
      set(paPrice, 0);
    } else {
      set(paPrice, update);
    }
  }
);

