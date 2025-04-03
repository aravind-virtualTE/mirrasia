import { atom } from 'jotai';
import { Option } from "@/components/MultiSelectInput";
export interface UsaFormData {
  _id: string;
  email: string;
  userId: string;
  selectedState: string | number;
  selectedEntity: string;
  noOfSharesSelected: string | number;
  name: string;
  establishedRelationshipType: string[];
  phoneNum: string;
  snsAccountId: {
    value: string
    id: string
  };
  serviceItemsSelected: string[];
  hasLegalEthicalIssues: string | undefined;
  annualRenewalTermsAgreement: string | undefined;
  restrictedCountriesWithActivity: string;
  sanctionedTiesPresent: string;
  businessInCrimea: string;
  involvedInRussianEnergyDefense: string;
  selectedIndustry: Option[];
  descriptionOfProducts: string;
  descriptionOfBusiness: string;
  webAddress: string;
  purposeOfEstablishmentCompany: Option[];
  companyName: string[];
  totalCapital: string | number;
  companyExecutives: string | number;
  localCompanyRegistration: string;
  businessAddress: string;
  noOfShareholders: string;
  noOfOfficers: string;
  shareHolders: {
    name: string;
    email: string;
    phone: string;
    ownershipRate: number;
    isDirector: string
    isLegalPerson: string
  }[];
  designatedContact: string | number;
  accountingDataAddress: string;
  isTermsAndConditionsAccepted: string;
  paymentOption: string;
  postIncorporationCapabilities: string;
  country: {
    code?: string;
    name?: string;
  }
  confirmationBusinessIntention: boolean
  transactionIntention: boolean
  isDisabled : boolean
  receiptUrl: string
  sessionId: string
  paymentId: string
  status: string
  incorporationDate: string
}

const initialFormState: UsaFormData = {
  _id: '',
  userId: '',
  email: '',
  selectedState: '',
  selectedEntity: '',
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
  serviceItemsSelected: [],
  hasLegalEthicalIssues: "",
  annualRenewalTermsAgreement: "",
  restrictedCountriesWithActivity: '',
  sanctionedTiesPresent: '',
  businessInCrimea: '',
  involvedInRussianEnergyDefense: '',
  selectedIndustry: [],
  descriptionOfProducts: '',
  descriptionOfBusiness: '',
  webAddress: '',
  purposeOfEstablishmentCompany: [],
  companyName: ['', '', ''],
  totalCapital: '',
  companyExecutives: '',
  localCompanyRegistration: '',
  businessAddress: '',
  noOfShareholders: '',
  noOfOfficers: '',
  shareHolders: [],
  designatedContact: '',
  accountingDataAddress: '',
  isTermsAndConditionsAccepted: '',
  paymentOption: '',
  postIncorporationCapabilities: '',
  confirmationBusinessIntention: false,
  transactionIntention: false,
  isDisabled : false,
  receiptUrl : "",
  sessionId: '',
  paymentId: '',
  status: "pending",
  incorporationDate:"",
};

// Create the base atom
export const usaFormAtom = atom<UsaFormData>(initialFormState);

// Atom with reset functionality
export const usaFormWithResetAtom = atom(
  (get) => get(usaFormAtom),
  (_get, set, update: UsaFormData | 'reset') => {
    if (update === 'reset') {
      set(usaFormAtom, initialFormState);
    } else {
      set(usaFormAtom, update);
    }
  }
);

const usPrice = atom(0)
export const usaPriceAtom = atom(
  (get) => get(usPrice),
  (_get, set, update: number | 'reset') => {
    if (update === 'reset') {
      set(usPrice, 0);
    }else{
      set(usPrice, update);
    }
  }
);

// Usage examples:
/*
// In your component:
import { useAtom } from 'jotai';
import { usaFormWithResetAtom } from './your-atom-file';

// Basic usage
const [formData, setFormData] = useAtom(usaFormWithResetAtom);

// To update/hydrate form data
const hydrateForm = (data: UsaFormData) => {
  setFormData(data);
};

// To reset form
const resetForm = () => {
  setFormData('reset');
};

// Example of updating specific field
const updateEmail = (email: string) => {
  setFormData({
    ...formData,
    email
  });
};

// Example of updating shareholders
const updateShareholders = (shareholders: { name: string; email: string; ownershipRate: number }[]) => {
  setFormData({
    ...formData,
    shareHolders: shareholders
  });
};
*/