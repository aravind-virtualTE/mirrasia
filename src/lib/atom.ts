import { atom } from 'jotai';


export const legalAssessmentDialougeAtom = atom(false);

export const businessInfoHkCompanyAtom = atom<Record<string, string | undefined>>({
    sanctioned_countries: undefined,
    sanctions_presence: undefined,
    crimea_presence: undefined,
    russian_business_presence: undefined,
    legal_assessment: undefined,
  });


type FormDataType = {
    name: string;
    relationships: string[];
    contactInfo: string;
};

// corporate incorporation applicant info
export const applicantInfoFormAtom = atom<FormDataType>({
    name: '',
    relationships: [],
    contactInfo: ''
});

export const applicantInfoNameAtom = atom(
    (get) => get(applicantInfoFormAtom).name,
    (get, set, name: string) => set(applicantInfoFormAtom, { ...get(applicantInfoFormAtom), name })
);

export const applicantInfoRelationshipsAtom = atom(
    (get) => get(applicantInfoFormAtom).relationships,
    (get, set, relationships: string[]) => set(applicantInfoFormAtom, { ...get(applicantInfoFormAtom), relationships })
);

export const applicantInfoContactInfoAtom = atom(
    (get) => get(applicantInfoFormAtom).contactInfo,
    (get, set, contactInfo: string) => set(applicantInfoFormAtom, { ...get(applicantInfoFormAtom), contactInfo })
);

// company incorporation information
interface RegBusinessInfo {
    business_industry: string | undefined;
    business_description: string;
    business_purpose: string | undefined;
}

export const companyBusinessInfoAtom = atom<RegBusinessInfo>({
    business_industry: undefined,
    business_description: "",
    business_purpose: undefined,
});

//   registration Details for hong kong company incorporation
interface RegCompanyInfo {
    registerCompanyNameAtom: string;
    registerShareTypeAtom?: string;
    registerPaymentShare?: string;
    registerCurrencyAtom?: string;
    registerAmountAtom?: string;
    registerNumSharesAtom?: string;
    registerShareholdersAtom?: string;
    registerShareholderNameAtom: string;
    registerDirectorAtom?: string;
    registerAddressAtom?: string;
  }
  
  export const regCompanyInfoAtom = atom<RegCompanyInfo>({
    registerCompanyNameAtom: '',
    registerShareTypeAtom: undefined,
    registerPaymentShare: undefined,
    registerCurrencyAtom: undefined,
    registerAmountAtom: undefined,
    registerNumSharesAtom: undefined,
    registerShareholdersAtom: undefined,
    registerShareholderNameAtom: "",
    registerDirectorAtom: undefined,
    registerAddressAtom: undefined,
  });

interface ShareHolderDirectorController {
    numShareHoldersAtom?: string ;
    numDirectorsAtom?: string;
    shareHolderDirectorNameSharesNumAtom: string;
    significantControllerAtom: string
    designatedContactPersonAtom: string
  }
  
  export const shareHolderDirectorControllerAtom = atom<ShareHolderDirectorController>({
    numShareHoldersAtom: undefined,
    numDirectorsAtom: undefined,
    shareHolderDirectorNameSharesNumAtom: '',
    significantControllerAtom : '',
    designatedContactPersonAtom: ''
  });

  interface AccountingTaxInfo {
    finYearEnd?: string;
    bookKeepCycle?: string;
    implementSoftware?: string;
    anySoftwareInUse: string;
  }
  
  export const accountingTaxInfoAtom = atom<AccountingTaxInfo>({
    finYearEnd: undefined,
    bookKeepCycle: undefined,
    implementSoftware: undefined,
    anySoftwareInUse : ""
  });