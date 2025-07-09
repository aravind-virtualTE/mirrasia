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
  sgAccountingDeclaration :{ id: string, value: string };
  hasLegalEthicalIssues: { id: string, value: string };
  annualRenewalTermsAgreement: { id: string, value: string };
  restrictedCountriesWithActivity: { id: string, value: string };
  sanctionedTiesPresent: { id: string, value: string };
  businessInCrimea: { id: string, value: string };
  involvedInRussianEnergyDefense: { id: string, value: string };
  [key: string]: any;
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
  isDisabled: boolean
  receiptUrl: string
  sessionId: string
  paymentId: string
  status: string
  incorporationDate: string
  serviceAgreementConsent: boolean
  assignedTo: string
  shareCapitalPayment?: {value: string,id: string};
  sgTotalCapPaid: string;
  registerAmountAtom: string | number;
  registerCurrencyAtom?: string;
  selectedIndustry: string[];
  establishmentPurpose: string[];
  issuedSharesType: string[];
  otherIndustryText?: string
  productDescription?: string
  otherEstablishmentPurpose?: string
  significantController?: Option[];
  designatedContactPerson?: string |number;
  finYearEnd?: { id: string, value: string };
  otherFinYrEnd?: string
  bookKeeping?: { label: string, value: string };
  otherBookKeep?: string
  onlineBooking?: { label: string, value: string };
  otherOnlineBooking?: string
  otherAccountingSoft?: string
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
    code: undefined,
    name: undefined,
  },
  snsAccountId: {
    value: '',
    id: ''
  },
  hasLegalEthicalIssues: { id: '', value: '' },
  offshoreTaxExemptionQuestion: { id: '', value: '' },  
  sgAccountingDeclaration : { id: '', value: '' },
  singaporeTaxFilingMythQuestion: { id: '', value: '' },
  annualRenewalTermsAgreement: { id: '', value: '' },
  restrictedCountriesWithActivity: { id: '', value: '' },
  sanctionedTiesPresent: { id: '', value: '' },
  businessInCrimea: { id: '', value: '' },
  involvedInRussianEnergyDefense: { id: '', value: '' },
  webAddress: '',
  companyName: ['', '', ''],
  noOfShareholders: '',
  noOfOfficers: '',
  shareHolders: [],
  designatedContact: '',
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
  shareCapitalPayment: {value: '', id: ''},
  sgTotalCapPaid: "",
  registerAmountAtom: '',
  registerCurrencyAtom: '',
  selectedIndustry: [],
  establishmentPurpose : [],
  otherIndustryText: "",
  otherEstablishmentPurpose: "",
  productDescription : "",
  issuedSharesType: [],
  significantController : [{value : "", label : ""}],
  designatedContactPerson: '',
  finYearEnd: {value: '', id: ''},
  otherFinYrEnd : "",
  bookKeeping: {value: '', label: ''},
  otherBookKeep : "",
  onlineBooking: {value: '', label: ''},
  otherOnlineBooking: "",
  otherAccountingSoft : ""
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

