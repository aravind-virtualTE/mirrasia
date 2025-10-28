/* eslint-disable @typescript-eslint/no-explicit-any */
import { atom } from 'jotai';
export interface UsaFormData {
  _id: string;
  email: string;
  userId: string;
  // selectedState: string | number;
  selectedState: { id: string; name: string } | undefined;
  selectedEntity: string;
  noOfSharesSelected: string | number;
  name: string;
  establishedRelationshipType: string[];
  phoneNum: string;
  snsAccountId: { value: string, id: string };
  serviceItemsSelected: string[];
  hasLegalEthicalIssues: { id: string, value: string };
  annualRenewalTermsAgreement: { id: string, value: string };
  restrictedCountriesWithActivity: { id: string, value: string };
  sanctionedTiesPresent: { id: string, value: string };
  businessInCrimea: { id: string, value: string };
  involvedInRussianEnergyDefense: { id: string, value: string };
  selectedIndustry: string[];
  otherIndustryText: string;
  descriptionOfProducts: string;
  descriptionOfBusiness: string;
  webAddress: string;
  purposeOfEstablishmentCompany: string[];
  otherCompanyPurposeText: string;
  companyName: string[];
  totalCapital: string | number;
  companyExecutives: string | number;
  localCompanyRegistration: string;
  businessAddress: string;
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
  beneficialOwner: string | number;
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
  isDisabled: boolean
  receiptUrl: string
  sessionId: string
  paymentId: string
  status: string
  incorporationDate: string
  serviceAgreementConsent: boolean
  assignedTo: string
  isDeleted: boolean
  mobileOtpVerified?: boolean;
  emailOtpVerified?: boolean;

}

const initialFormState: UsaFormData = {
  _id: '',
  userId: '',
  email: '',
  selectedState: undefined,
  selectedEntity: '',
  noOfSharesSelected: '',
  name: '',
  establishedRelationshipType: [],
  phoneNum: '',
  country: { code: 'US', name: 'United States' },
  snsAccountId: {
    value: '',
    id: ''
  },
  serviceItemsSelected: [],
  hasLegalEthicalIssues: { id: '', value: '' },
  annualRenewalTermsAgreement: { id: '', value: '' },
  restrictedCountriesWithActivity: { id: '', value: '' },
  sanctionedTiesPresent: { id: '', value: '' },
  businessInCrimea: { id: '', value: '' },
  involvedInRussianEnergyDefense: { id: '', value: '' },
  selectedIndustry: [],
  otherIndustryText: "",
  descriptionOfProducts: '',
  descriptionOfBusiness: '',
  webAddress: '',
  purposeOfEstablishmentCompany: [],
  otherCompanyPurposeText: "",
  companyName: ['', '', ''],
  totalCapital: '',
  companyExecutives: '',
  localCompanyRegistration: '',
  businessAddress: '',
  noOfShareholders: '',
  noOfOfficers: '',
  shareHolders: [],
  designatedContact: '',
  beneficialOwner: "",
  accountingDataAddress: '',
  isTermsAndConditionsAccepted: '',
  paymentOption: '',
  postIncorporationCapabilities: '',
  confirmationBusinessIntention: false,
  transactionIntention: false,
  isDisabled: false,
  receiptUrl: "",
  sessionId: '',
  paymentId: '',
  status: "Pending",
  incorporationDate: "",
  serviceAgreementConsent: false,
  assignedTo: "",
  isDeleted: false,
  mobileOtpVerified: false,
  emailOtpVerified: false,

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
    } else {
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

const initial: any = {
  // Applicant section
  stepIdx : 0,
  _id: "",
  userId: "",
  name: "",
  email: "",
  emailOtpInput: "",
  emailOtpSent: false,
  emailOtpVerified: false,
  _emailOtpGenerated: "",
  companyName_1: "",
  companyName_2: "",
  companyName_3: "",
  establishedRelationshipType: [] as string[],
  phoneNum: "",
  sns: "",
  snsId: "",
  snsPlatform: "",
  snsHandle: "",
  // Compliance / declarations
  annualRenewalConsent: "",
  legalAndEthicalConcern: "",
  q_country: "",
  sanctionsExposureDeclaration: "",
  crimeaSevastapolPresence: "",
  russianEnergyPresence: "",
  // Incorporation choices
  selectedEntity: "",     // 'LLC (limited liability company)' | 'Corporation' | 'Consultation required before proceeding'
  selectedState: "",      // e.g. { code: "DE", name: "Delaware", id: "DE" } OR "Delaware" depending on usaList
  // Section 9 (Business Information)
  selectedIndustry: [] as string[],
  otherIndustryText: "",
  descriptionOfProducts: "",
  descriptionOfBusiness: "",
  webAddress: "",
  purposeOfEstablishmentCompany: [] as string[],
  otherCompanyPurposeText: "",
  // Section 12 (Shareholders/Directors)
  shareHolders: [
    {
      name: "",
      email: "",
      phone: "",
      ownershipRate: 0,
      isDirector: { id: "no", label: "AmlCdd.options.no" },
      isLegalPerson: { id: "no", label: "AmlCdd.options.no" },
      status: "",
    },
  ],
  designatedContact: "",
  beneficialOwner: "",
  // Section 13 (Accounting data address)
  accountingDataAddress: "",
  // Service selection / quote
  serviceItemsSelected: [] as string[], // <- added so includes() doesn't explode
  sessionId: "",
  // ---------- Payment fields (NEW) ----------
  payMethod: "card",          // "card" | "bank" | "fps" | "other"
  paymentStatus: "",          // "paid" | "" etc
  paymentIntentId: "",        // Stripe PI id
  stripeLastStatus: "",       // last known Stripe status
  stripePaymentStatus: "",    // mirror if you store separately
  stripeReceiptUrl: "",
  stripeAmountCents: undefined as number | undefined,
  stripeCurrency: "",
  bankRef: "",                // manual payment reference
  uploadReceiptUrl: "",       // proof-of-payment upload URL
  expiresAt: "",              // ISO string we set for 48h quote lock
  updatedAt: "",                         // <- referenced in handleCheckboxChange
  totalCapital: "",                // dropdown/custom capital amount
  companyExecutives: "",           // executive team selection
  localCompanyRegistration: "",    // address choice
  businessAddress: "",             // manual US business address if not using Mirr Asia address
  noOfSharesSelected: "",          // total number of shares / share structure
  truthfulnessDeclaration: false,
  legalTermsAcknowledgment: false,
  compliancePreconditionAcknowledgment: false,
  eSign: "",
}
export const usaApplicantFormAtom = atom<any>(initial);

export const usaAppWithResetAtom = atom(
  (get) => get(usaApplicantFormAtom),
  (_get, set, update: any | 'reset') => {
    if (update == 'reset') {
      set(usaApplicantFormAtom, initial);
    } else {
      set(usaApplicantFormAtom, update);
    }
  }
);