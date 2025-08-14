import { Option } from '@/components/MultiSelectInput';
import { atom } from 'jotai';
import { atomWithReset, useResetAtom } from 'jotai/utils';
// company Incorporation
// below variable is used at aml/cdd page for legal assessment
export const legalAssessmentDialougeAtom = atom(false);
// below variable is used at aml/cdd page for legal acknowledgement assessment
export const legalAcknowledgementDialougeAtom = atom(false);

//country selecting (section 0)
export const countryAtom = atomWithReset<Record<string, string | undefined>>({
  code: undefined,
  name: undefined,
});

export type FormDataType = {
  name: string;
  relationships: string[];
  contactInfo: string;
  snsAccountId: string;
  snsPlatform: string;
  email: string;
  phoneNumber: string;
  mobileOtpVerified?: boolean;
  emailOtpVerified?: boolean;
  companyName: string[];
  chinaCompanyName: string[]
};
// corporate incorporation applicant info (section 1)
export const applicantInfoFormAtom = atomWithReset<FormDataType>({
  name: '',
  relationships: [],
  contactInfo: '',
  snsAccountId: '',
  snsPlatform: '',
  phoneNumber: '',
  email: '',
  mobileOtpVerified: false,
  emailOtpVerified: false,
  companyName: ["", "", ""],
  chinaCompanyName: ["", "", ""],
});


// corporate incorporation aml/cdd legal ethical assessment (section 2)
export const businessInfoHkCompanyAtom = atomWithReset<Record<string, string | undefined>>({
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
  business_purpose: string[];
}

// corporate incorporation Company Information (section 3.1)
export const companyBusinessInfoAtom = atomWithReset<RegBusinessInfo>({
  business_industry: undefined,
  business_product_description: "",
  business_purpose: [],
});

//   registration Details for hong kong company incorporation
interface RegCompanyInfo {
  registerCompanyNameAtom: string;
  registerShareTypeAtom: string[];
  registerPaymentShare?: string;
  registerCurrencyAtom?: string;
  registerAmountAtom?: string | number;
  registerNumSharesAtom?: string | number;
}

// corporate incorporation Company Information (section 3.2)  
export const regCompanyInfoAtom = atomWithReset<RegCompanyInfo>({
  registerCompanyNameAtom: '',
  registerShareTypeAtom: [],
  registerPaymentShare: undefined,
  registerCurrencyAtom: undefined,
  registerAmountAtom: undefined,
  registerNumSharesAtom: undefined,
});

interface ShareHolderDirectorController {
  numShareHoldersAtom?: string;
  numDirectorsAtom?: string;
  shareHolderDirectorNameSharesNumAtom: string;
  significantControllerAtom: Option[];
  designatedContactPersonAtom: string | number,
  shareHolders: {
    name: string;
    email: string;
    phone: string;
    ownershipRate: number;
    isDirector: boolean;
    isLegalPerson: boolean;
  }[]
}

// corporate incorporation Director Shareholder Information (section 4)  

export const shareHolderDirectorControllerAtom = atomWithReset<ShareHolderDirectorController>({
  numShareHoldersAtom: undefined,
  numDirectorsAtom: undefined,
  shareHolderDirectorNameSharesNumAtom: '',
  significantControllerAtom: [{ value: "", label: "" }],
  designatedContactPersonAtom: '',
  shareHolders: [{
    "name": "",
    "ownershipRate": 0,
    "isDirector": false,
    "isLegalPerson": false,
    "email": '',
    "phone": '',
  }]
});

interface AccountingTaxInfo {
  finYearEnd?: string | number;
  bookKeepCycle?: string;
  implementSoftware?: string;
  anySoftwareInUse: string;
}

// corporate incorporation Accounting Tax Information (section 5)  

export const accountingTaxInfoAtom = atomWithReset<AccountingTaxInfo>({
  finYearEnd: "",
  bookKeepCycle: undefined,
  implementSoftware: undefined,
  anySoftwareInUse: ""
});

export const companyServiceAgreementConsentAtom = atomWithReset(false);

export const PaymentSessionId = atomWithReset("");
export const paymentId = atomWithReset("");
export const isDisabled = atomWithReset(false);
export const icorporationDoc = atomWithReset("");
// type AnyObject = Record<string, unknown>;


export interface ServiceSelectionState {
  selectedServices: string[];
  correspondenceCount: number;
}

export interface CompanyDocManager {
  docName: string;
  docUrl: string;
  id: string;
}

export const companyDocManager = atomWithReset<CompanyDocManager[]>([]);
export const serviceSelectionStateAtom = atomWithReset<ServiceSelectionState | null>(null);
export const receiptUrl = atomWithReset("");
export const assignedTo = atomWithReset("");
export const isDeleted = atomWithReset(false);
export const companyUserIdAtom = atomWithReset<string>('');
export const companyStatusAtom = atomWithReset<string>('Pending');
// hong kong company incorporation Atom for state management
export const companyIncorporationAtom = atom((get) => ({
  userId: get(companyUserIdAtom),          // was: ''
  status: get(companyStatusAtom),
  is_draft: false,
  isDisabled: get(isDisabled),
  country: get(countryAtom),
  applicantInfoForm: get(applicantInfoFormAtom),
  businessInfoHkCompany: get(businessInfoHkCompanyAtom),
  companyBusinessInfo: get(companyBusinessInfoAtom),
  regCompanyInfo: get(regCompanyInfoAtom),
  shareHolderDirectorController: get(shareHolderDirectorControllerAtom),
  accountingTaxInfo: get(accountingTaxInfoAtom),
  incorporationDate: null,
  serviceAgreementConsent: get(companyServiceAgreementConsentAtom),
  sessionId: get(PaymentSessionId),
  paymentId: get(paymentId),
  icorporationDoc: get(icorporationDoc),
  serviceSelectionState: get(serviceSelectionStateAtom),
  companyDocs: get(companyDocManager),
  receiptUrl: get(receiptUrl),
  assignedTo: get(assignedTo),
  isDeleted: get(isDeleted),
}));


export const useResetAllForms = () => {
  const resetApplicantInfo = useResetAtom(applicantInfoFormAtom);
  const resetBusinessInfo = useResetAtom(businessInfoHkCompanyAtom);
  const resetCompanyBusinessInfo = useResetAtom(companyBusinessInfoAtom);
  const resetRegCompanyInfo = useResetAtom(regCompanyInfoAtom);
  const resetShareHolderDirectorController = useResetAtom(shareHolderDirectorControllerAtom);
  const resetAccountingTaxInfo = useResetAtom(accountingTaxInfoAtom);
  const resetConsent = useResetAtom(companyServiceAgreementConsentAtom);
  const resetCountry = useResetAtom(countryAtom);
  const resetSessionPayment = useResetAtom(PaymentSessionId);
  const resetPaymentID = useResetAtom(paymentId);
  const resetisDisabled = useResetAtom(isDisabled);
  const resetcompPaymentDetails = useResetAtom(serviceSelectionStateAtom);
  const reseticorporationDoc = useResetAtom(icorporationDoc)
  const resetCompanyDocManager = useResetAtom(companyDocManager)
  const resetReceiptUrl = useResetAtom(receiptUrl)
  const resetAssignedTo = useResetAtom(assignedTo)
  const resetIsDeleted = useResetAtom(isDeleted)



  const resetAll = () => {
    resetApplicantInfo();
    resetBusinessInfo();
    resetCompanyBusinessInfo();
    resetRegCompanyInfo();
    resetShareHolderDirectorController();
    resetAccountingTaxInfo();
    resetConsent();
    resetCountry();
    resetSessionPayment()
    resetPaymentID()
    resetcompPaymentDetails()
    reseticorporationDoc()
    resetisDisabled()
    resetCompanyDocManager()
    resetReceiptUrl()
    resetAssignedTo()
    resetIsDeleted()
  };

  return resetAll;
};


export const updateCompanyIncorporationAtom = atom(
  null,
  (
    _get,
    set,
    updates: Partial<{
      userId: typeof companyUserIdAtom['init']; 
      status: typeof companyStatusAtom['init']; 
      country: Record<string, string | undefined>;
      applicantInfoForm: typeof applicantInfoFormAtom['init'];
      businessInfoHkCompany: typeof businessInfoHkCompanyAtom['init'];
      companyBusinessInfo: typeof companyBusinessInfoAtom['init'];
      regCompanyInfo: typeof regCompanyInfoAtom['init'];
      shareHolderDirectorController: typeof shareHolderDirectorControllerAtom['init'];
      accountingTaxInfo: typeof accountingTaxInfoAtom['init'];
      serviceAgreementConsent: boolean;
      sessionId: string;
      paymentId: string;
      isDisabled: boolean;
      serviceSelectionState: typeof serviceSelectionStateAtom['init'];
      icorporationDoc: typeof icorporationDoc['init']
      companyDocs: typeof companyDocManager['init']
      receiptUrl: string;
      assignedTo: string
      isDeleted: boolean
    }>
  ) => {
    if ('userId' in updates) {
      set(companyUserIdAtom, updates.userId as string);
    }
    if ('status' in updates) {
      set(companyStatusAtom, updates.status as string);
    }
    if (updates.country) {
      set(countryAtom, updates.country);
    }
    if (updates.icorporationDoc) {
      set(icorporationDoc, updates.icorporationDoc);
    }
    if (updates.receiptUrl) {
      set(receiptUrl, updates.receiptUrl);
    }
    if (updates.assignedTo) {
      set(assignedTo, updates.assignedTo);
    }
    if (updates.isDeleted) {
      set(isDeleted, updates.isDeleted);
    }
    if (updates.companyDocs) {
      set(companyDocManager, updates.companyDocs);
    }
    if (updates.serviceSelectionState) {
      set(serviceSelectionStateAtom, updates.serviceSelectionState);
    }
    if (updates.sessionId) {
      set(PaymentSessionId, updates.sessionId);
    }
    if (updates.paymentId) {
      set(paymentId, updates.paymentId);
    }
    if (updates.isDisabled) {
      set(isDisabled, updates.isDisabled);
    }
    if (updates.applicantInfoForm) {
      set(applicantInfoFormAtom, updates.applicantInfoForm);
    }
    if (updates.businessInfoHkCompany) {
      set(businessInfoHkCompanyAtom, updates.businessInfoHkCompany);
    }
    if (updates.companyBusinessInfo) {
      set(companyBusinessInfoAtom, updates.companyBusinessInfo);
    }
    if (updates.regCompanyInfo) {
      set(regCompanyInfoAtom, updates.regCompanyInfo);
    }
    if (updates.shareHolderDirectorController) {
      set(shareHolderDirectorControllerAtom, updates.shareHolderDirectorController);
    }
    if (updates.accountingTaxInfo) {
      set(accountingTaxInfoAtom, updates.accountingTaxInfo);
    }
    if (updates.serviceAgreementConsent !== undefined) {
      set(companyServiceAgreementConsentAtom, updates.serviceAgreementConsent);
    }
  }
);