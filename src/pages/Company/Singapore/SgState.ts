/* eslint-disable @typescript-eslint/no-explicit-any */
import { atom } from 'jotai';
export interface UsaFormData {
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
  phoneNum: string;
  snsAccountId: {  value: string,  id: string };
  webAddress: string;
  companyName: string[];
  noOfShareholders: string;
  noOfOfficers: string;
  shareHolders: {
    [x: string]: any;
    name: string;
    email: string;
    phone: string;
    ownershipRate: number;
    isDirector: {
      value: string,
      id: string
    }
    isLegalPerson: {
      value: string,
      id: string
    }
  }[];
  designatedContact: string | number;
  accountingDataAddress: string;
  serviceItemsSelected: string[];
  isTermsAndConditionsAccepted: string;
  isDisabled : boolean
  receiptUrl: string
  sessionId: string
  paymentId: string
  status: string
  incorporationDate: string
  serviceAgreementConsent: boolean
  assignedTo: string
  shareCapitalPayment?:  {
    value: string,
    id: string
  };
  sgTotalCapPaid : string;
  registerAmountAtom : string | number;
  registerCurrencyAtom?: string;

}

const initialFormState: UsaFormData = {
  _id: '',
  userId: '',
  email: '',
  noOfSharesSelected: '',
  name: '',
  establishedRelationshipType: [],
  phoneNum: '',
  country: {
    code: undefined,
    name: undefined,
  },
  snsAccountId:{
    value: '',
    id: ''
  }, 
  webAddress: '',
  companyName: ['', '', ''],
  noOfShareholders: '',
  noOfOfficers: '',
  shareHolders: [],
  designatedContact: '',
  accountingDataAddress: '',
  isTermsAndConditionsAccepted: '',
  serviceItemsSelected: [],
  isDisabled : false,
  receiptUrl : "",
  sessionId: '',
  paymentId: '',
  status: "Pending",
  incorporationDate:"",
  serviceAgreementConsent:false,
  assignedTo : "",
  shareCapitalPayment: {
    value: '',
    id: ''
  },
  sgTotalCapPaid: "",
  registerAmountAtom: '',
  registerCurrencyAtom: '',
};

// Create the base atom
export const sgFormAtom = atom<UsaFormData>(initialFormState);

// Atom with reset functionality
export const sgFormWithResetAtom = atom(
  (get) => get(sgFormAtom),
  (_get, set, update: UsaFormData | 'reset') => {
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
    }else{
      set(sgPrice, update);
    }
  }
);

