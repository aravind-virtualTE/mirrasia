export interface Country {
    code: string;
    name: string;
  }
  
  export interface ApplicantInfoForm {
    name: string;
    relationships: string[];
    contactInfo: string;
    snsAccountId: string;
    snsPlatform: string;
    phoneNumber: string;
    email: string;
    companyName: string[];
  }
  
  export interface CompanyBusinessInfo {
    business_product_description: string;
    business_purpose: string[];
    business_industry: string;
  }
  
  export interface RegCompanyInfo {
    registerCompanyNameAtom: string;
    registerShareTypeAtom: string[];
  }
  
  export interface ShareHolder {
    name: string;
    email: string;
    phone: string;
    ownershipRate: number;
    isDirector: boolean;
    isLegalPerson: boolean;
  }
  
  export interface ShareHolderDirectorController {
    shareHolders: ShareHolder[];
    numShareHoldersAtom?: string;
      numDirectorsAtom?: string;
      shareHolderDirectorNameSharesNumAtom: string;
      significantControllerAtom:  {
        value: string
        label: string
    }[];
      designatedContactPersonAtom: string | number,
  }
  
  export interface AccountingTaxInfo {
    anySoftwareInUse: string;
    finYearEnd: string;
    bookKeepCycle: string;
    implementSoftware: string;
  }
  
  export interface BusinessInfoHkCompany {
    sanctioned_countries: string;
    sanctions_presence: string;
    crimea_presence: string;
    russian_business_presence: string;
    legal_assessment: string;
  }
  
  export interface ServiceSelectionState {
    selectedServices: string[];
    correspondenceCount: number;
  }

  export type AnyObject = Record<string, unknown>;
  
  export interface hkFormItem {
    _id: string;
    userId: string;
    country: Country;
    applicantInfoForm: ApplicantInfoForm;
    companyBusinessInfo: CompanyBusinessInfo;
    regCompanyInfo: RegCompanyInfo;
    shareHolderDirectorController: ShareHolderDirectorController;
    accountingTaxInfo: AccountingTaxInfo;
    serviceAgreementConsent: boolean;
    status: string;
    is_draft: boolean;
    incorporationDate: Date | null;
    sessionId: string;
    paymentId: string;
    __v: number;
    businessInfoHkCompany: BusinessInfoHkCompany;
    serviceSelection: AnyObject[]; 
    serviceSelectionState: ServiceSelectionState;
  }


  export interface ShareEntry {
    date?: string ;
    acquired: {
      certificateNumber: string ;
      distinctiveNumber: {
        from: string | number;
        to: string | number;
      };
      numberOfShares:string | number ;
      considerationPaid: string |number ;
    };
    transferred: {
      certificateNumber: string ;
      considerationPaid: string | number;
      numberOfTransfer: string ;
      distinctiveNumber: {
        from: string | number;
        to: string | number;
      };
      numberOfShares:string | number ;
    };
    totalSharesHeld:string | number ;
    remarks: string ;
    entryMadeBy: string ;
  }
  
  export interface ShareClass {
    type: string ;
    valuePerShare:string | number ;
  }

  export interface RegisterMembers {
    name: string ;
    occupation: string ;
    correspondenceAddress: string ;
    residentialAddress: string ;
    dateEntered: string ;
    dateCeasing: string ;
    entries : ShareEntry[];
    shareClass: ShareClass;
  }


  export interface ShareHolderRegistrationForm {
    email: string;
    companyName: string;
    roles: string[];
    significantController: string;
    fullName: string;
    mobileNumber: string;
    kakaoTalkId: string;
    weChatId: string;
    passportCopy: string| Blob;
    personalCertificate: string| Blob;
    proofOfAddress: string| Blob;
    passportDigits: string;
    birthCountry: string;
    currentResidence: string;
    nomineeParticipation: string;
    correspondenceAddress: string;
    overseasResidentStatus: string;
    foreignInvestmentReport: string;
    foreignInvestmentAgreement: string;
    politicallyExposedStatus: string;
    politicalDetails: string;
    legalIssuesStatus: string;
    usResidencyStatus: string;
    usResidencyDetails: string;
    natureOfFunds: string[];
    sourceOfFunds: string[];
    countryOfFundOrigin: string;
    undischargedBankruptcy: string;
    pastParticipation: string;
    additionalInfo: string;
    agreementDeclaration: string;
  }