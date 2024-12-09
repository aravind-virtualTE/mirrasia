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