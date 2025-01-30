import { RegisterMembers } from "./hkForm";

export interface PersonalInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

export interface AddressInfo {
    street: string;
    city: string;
    state: string;
    zipCode: string;
}

export interface EmploymentInfo {
    company: string;
    position: string;
    startDate: string;
    currentlyEmployed: boolean;
}

export interface FormData {
    _id?: string;
    personalInfo: PersonalInfo;
    addressInfo: AddressInfo;
    employmentInfo: EmploymentInfo;
    currentStep: number;
    isCompleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CountryInfo {
    code: string
    name: string;
}

export interface ApplicantInfo {
    name: string;
    relationships: string[];
    contactInfo: string;
    snsAccountId: string;
    snsPlatform: string;
    email: string;
    phoneNumber: string;
    companyName: string[];
}

export interface BusinessInfo {
    business_industry: string | undefined;
    business_product_description: string;
    business_purpose: string[];
}

export interface RegCompanyInfo {
    registerCompanyNameAtom: string;
    registerShareTypeAtom: string[];
    registerPaymentShare?: string;
    registerCurrencyAtom?: string;
    registerAmountAtom?: string;
    registerNumSharesAtom?: string;
}

export interface ShareHolderDirectorController {
    numShareHoldersAtom?: string | undefined;
    numDirectorsAtom?: string | undefined; 
    shareHolderDirectorNameSharesNumAtom: string;
    significantControllerAtom: string
    designatedContactPersonAtom: string,
    shareHolders: {
        name: string;
        email: string;
        phone: string;
        ownershipRate: number;
        isDirector: boolean;
        isLegalPerson: boolean;
    }[]
}

export interface AccountingTaxInfo {
    finYearEnd?: string;
    bookKeepCycle?: string;
    implementSoftware?: string;
    anySoftwareInUse: string;
}

export interface businessInfoHkCompanyInfo {
    sanctioned_countries: string | undefined;
    sanctions_presence: string | undefined;
    crimea_presence: string | undefined;
    russian_business_presence: string | undefined;
    legal_assessment: string | undefined;
}
export type AnyObject = Record<string, unknown>;

export interface HkFormData {
    _id?: string;
    userId?: string;
    country: CountryInfo;
    applicantInfo: ApplicantInfo;
    companyBusinessInfo: BusinessInfo;
    regCompanyInfo: RegCompanyInfo;
    shareHolderDirectorController: ShareHolderDirectorController;
    accountingTaxInfo: AccountingTaxInfo;
    businessInfoHkCompany: businessInfoHkCompanyInfo;
    serviceAgreementConsent: boolean;
    serviceSelection: AnyObject[]
    sessionId: string;
    paymentId: string;
    currentStep: number;
    isCompleted: boolean;    
    status:string;
    paymentCompleted: boolean;
    createdAt: string;
    updatedAt: string;
    incorporationDate: string | null
}

export interface SigController {  
  name: string;
  correspondenceAddress: string;
  residentialAddress: string;
  passportNo: string;
  dateOfRegistrablePerson: string;
  dateOfCeasingRegistrablePerson: string;
  natureOfControlOverCompany: string;
  addressLine1: string;
  addressLine2: string;
  country : string
  signature : string
}

export interface signiControlReg {
  entryNo : number;
  dateOfEntry : string
  remarks : string
}

// director: { name: string; signature: string }[];
export interface serviceAggrementTypes {
  companyId: string;
  brnNo: string;
  id: string;
  appointmentDate: string;
  companyName: string;
  companyAddress: string;
  consentDate: string;
  consentStateDate: string;
  consentEndDate: string;
  contactEmail: string;
  consentSignDate: string;
  authorizedDetails: { name: string | number; email: string; tel: string; kakaoWechat: string }[];
  authorizedDesignated: { name: string; signature: string }[];
  founderMember: { name: string | number; signature: string }[];
  directorList:{
    name: string;
    signature: string;
  }[]
  shareholderList: {
    name: string;
    correspondenceAddress: string;
    residentialAddress: string;
    currentHolding: number;
    percentage: string;
    remarks: string;
    signature : string | null;
  }[];
  jurisdiction: string;
  registerChargesList: {
    dateOfCharges: string;
    description: string;
    amountSecured: string;
    entitledPerson: string;
    dateOfRegistration: string;
    dateOfDischarges: string;
  }[];
  registerChargeSignature: string;
  registerSecretariesList: {
    dateOfAppointment: string;
    fullName: string;
    idNumber: string;
    correspondenceAddress: string;
    type: string;
    dateCeasingToAct: string;
    entryMadeBy: string;
  }[];
  companySecretarySignature: string | null;
  registerDirector: {
    dateOfAppointment: string;
    name: string;
    nationality: string;
    correspondenceAddress: string;
    residentialAddress: string;
    directorShip: string;
    ceasingAct: string;
    entryMadeBy: string;
  }[];
  registerDirectorSignature: string | null;
  sharesDate: string;
  registeredMembers: RegisterMembers[];
  registeredMembersSignature: { name: string; signature: string }[];
  significantController: SigController[];
  signiControDetail : {
    entryNo : number;
    dateOfEntry : string;
    remarks : string;
  }[]
  chairman: { name: string; signature: string }[];
  customerDueDiligence: {
    personalInformation: {
      title: string;
      familyName: string;
      name: string;
      formerName: string;
      occupation: string;
      maritalStatus: string;
      cityBirthTown: string;
      birthCountry: string;
      dateOfBirth: string;
      nationality: string;
    };
    taxFacta: {
      factaReportingPuropose: boolean;
      isPublicAuthority: boolean;
      countryOfTaxResidence: string;
      taxIdNumber: string;
    };
    permanetResidence: {
      address: string;
      postCode: string;
      country: string;
    };
    otherContactDetails: {
      tel: string;
      mobile: string;
      email: string;
      fax: string;
    };
    preferredMethodOfContact: {
      telephone: boolean;
      mobile: boolean;
      email: boolean;
      fax: boolean;
      registeredPost: boolean;
      courier: boolean;
    };
    cddDate: string | number;
  };
  cddSignature: string | null;  
  politicallyExposed: boolean;
  politicallyNotExposed: boolean;
  pedSignature :string | null;
  pedDate :string;  
  currency: string | null
  registerAmount: string | number
}

export type ShrHolderDirector = {
  [key: string]: ShareholderValue;
};

type ShareholderValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ShareholderValue[] 
  | ShrHolderDirector;