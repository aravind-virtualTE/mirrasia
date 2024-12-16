import { atom } from 'jotai';
import { hkFormItem } from '@/types/hkForm';

export const initialFormState: Partial<hkFormItem> = {
  country: {
    code: '',
    name: '',
  },
  applicantInfoForm: {
    name: '',
    relationships: [],
    contactInfo: '',
    snsAccountId: '',
    snsPlatform: '',
    phoneNumber: '',
    email: '',
    companyName: [],
  },
  companyBusinessInfo: {
    business_product_description: '',
    business_purpose: [],
    business_industry: '',
  },
  regCompanyInfo: {
    registerCompanyNameAtom: '',
    registerShareTypeAtom: [],
  },
  shareHolderDirectorController: {
    shareHolderDirectorNameSharesNumAtom: '',
    significantControllerAtom: '',
    designatedContactPersonAtom: '',
    shareHolders: [],
  },
  accountingTaxInfo: {
    anySoftwareInUse: '',
    finYearEnd: '',
    bookKeepCycle: '',
    implementSoftware: '',
  },
  serviceAgreementConsent: false,
  status: '',
  is_draft: false,
  incorporationDate: null,
  sessionId: '',
  paymentId: '',
  __v: 0,
  businessInfoHkCompany: {
    sanctioned_countries: '',
    sanctions_presence: '',
    crimea_presence: '',
    russian_business_presence: '',
    legal_assessment: '',
  },
  serviceSelection: [],
  serviceSelectionState: {
    selectedServices: [],
    correspondenceCount: 0,
  },
};

export const formDataAtom = atom<Partial<hkFormItem>>(initialFormState);

export const currentStepAtom = atom(
  (get) => get(formDataAtom).status || 0,
  (get, set, newStep: string) => {
    set(formDataAtom, {
      ...get(formDataAtom),
      status: newStep,
    });
  }
);

export const resetFormDataAtom = atom(
  null, // Read function is not required
  (_get, set) => {
    set(formDataAtom, initialFormState); // Reset the form data atom to its initial state
  }
);