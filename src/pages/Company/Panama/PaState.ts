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
    // [x: string]: any;
    name: string;
    email: string;
    phone: string;
    ownershipRate: number;
    role:{
        value: string,
        id: string
    };
    isDirector: {
      value: string,
      id: string
    }
    isLegalPerson: {
      value: string,
      id: string
    }
  }[];
  legalDirectors: {
    [x: string]: any;
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
  typeOfShare:string[]
  serviceAgreementConsent: boolean
  assignedTo: string
  shareCapitalPayment?:  {
    value: string,
    id: string
  };
  paTotalCapPaid : string;
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
  legalDirectors : [],
  designatedContact: '',
  accountingDataAddress: '',
  isTermsAndConditionsAccepted: '',
  serviceItemsSelected: [],
  typeOfShare:[],
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
  paTotalCapPaid: "",
  registerAmountAtom: '',
  registerCurrencyAtom: '',
};

// Create the base atom
export const paFormAtom = atom<UsaFormData>(initialFormState);

// Atom with reset functionality
export const paFormWithResetAtom = atom(
  (get) => get(paFormAtom),
  (_get, set, update: UsaFormData | 'reset') => {
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
    }else{
      set(paPrice, update);
    }
  }
);

