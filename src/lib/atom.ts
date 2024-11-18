import { atom } from 'jotai';
// company Incorporation
// below variable is used at aml/cdd page for legal assessment
export const legalAssessmentDialougeAtom = atom(false);
// below variable is used at aml/cdd page for legal acknowledgement assessment
export const legalAcknowledgementDialougeAtom = atom(false);

//country selecting (section 0)
export const countryAtom = atom<Record<string, string | undefined>>({
  code: undefined,
  name: undefined,
});

type FormDataType = {
    name: string;
    relationships: string[];
    contactInfo: string;
    snsAccountId : string;
    email : string;
    phoneNumber : string;
    companyName : string;
};

// corporate incorporation applicant info (section 1)
export const applicantInfoFormAtom = atom<FormDataType>({
    name: '',
    relationships: [],
    contactInfo: '',
    snsAccountId : '',
    phoneNumber : '',
    email : '',
    companyName : ''
});

// corporate incorporation aml/cdd legal ethical assessment (section 2)
export const businessInfoHkCompanyAtom = atom<Record<string, string | undefined>>({
  sanctioned_countries: undefined,
  sanctions_presence: undefined,
  crimea_presence: undefined,
  russian_business_presence: undefined,
  legal_assessment: undefined,
});


// company incorporation BusinessInfo information
interface RegBusinessInfo {
    business_industry: string | undefined;
    business_product_description: string;
    business_purpose: string | undefined;
}

// corporate incorporation Company Information (section 3.1)
export const companyBusinessInfoAtom = atom<RegBusinessInfo>({
    business_industry: undefined,
    business_product_description: "",
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

// corporate incorporation Company Information (section 3.2)  
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
  
// corporate incorporation Director Shareholder Information (section 4)  

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
  
// corporate incorporation Accounting Tax Information (section 5)  

  export const accountingTaxInfoAtom = atom<AccountingTaxInfo>({
    finYearEnd: undefined,
    bookKeepCycle: undefined,
    implementSoftware: undefined,
    anySoftwareInUse : ""
  });

  export const companyIncorporationAtom = atom((get) => ({
    userId: '',
    status: 'Pending',
    is_draft: false,
    country: get(countryAtom),
    applicantInfoForm: get(applicantInfoFormAtom),
    businessInfoHkCompany: get(businessInfoHkCompanyAtom),
    companyBusinessInfo: get(companyBusinessInfoAtom),
    regCompanyInfo: get(regCompanyInfoAtom),
    shareHolderDirectorController: get(shareHolderDirectorControllerAtom),
    accountingTaxInfo: get(accountingTaxInfoAtom),
    incorporationDate: null
  }));