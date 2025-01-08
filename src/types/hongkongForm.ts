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


// director: { name: string; signature: string }[];
export interface serviceAggrementTypes {
  companyId: string;
  ubiNo: string;
  id: string;
  appointmentDate: string;
  companyName: string;
  companyAddress: string;
  consentDate: string;
  consentStateDate: string;
  consentEndDate: string;
  contactEmail: string;
  consentSignDate: string;
  authorizedDetails: { name: string; email: string; tel: string; kakaoWechat: string }[];
  authorizedDesignated: { name: string; signature: string }[];
  founderMember: { name: string; signature: string }[];
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
  shareHolderSignatures: { name: string; signature: string }[];
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
    idNumberNote: string;
    correspondenceAddress: string;
    type: string;
    dateCeasingToAct: string;
    entryMadeBy: string;
  }[];
  chargesSignature: string;
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
  registerDirectorSignature: string;
  sharesDate: string;
  registeredMembers: {
    name: string;
    occupation: string;
    correspondenceAddress: string;
    dateCeasing: string;
    residentialAddress: string;
    sharesAcquired: {
      certificateNumber: string;
      distinctiveNumber: string;
      numberOfShares: string;
      considerationPaid: string;
    }[];
    sharesTransferred: {
      certificateNumber: string;
      distinctiveNumber: string;
      numberOfShares: string;
      considerationPaid: string;
    }[];
    totalSharesHeld: string;
    remarks: string;
    entryMadeBy: string;
    classOfShare: string;
    pervalueshare: string;
  }[];
  registeredMembersSignature: { name: string; signature: string }[];
  significantController: {
    name: string;
    correspondenceAddress: string;
    residentialAddress: string;
    passportNo: string;
    dateOfRegistrablePerson: string;
    dateOfCeasingRegistrablePerson: string;
    natureOfControlOverCompany: string;
  }[];
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
    declaration: {
      signature: string;
      date: string;
    };
    politicallyExposed: boolean;
    politicallyNotExposed: boolean;
    politicallyExposedDeclaration: {
      signature: string;
      date: string;
    };
  }[];
}




// type Director = {
//   dateOfAppointment: string;
//   fullName: string;
//   nationalityAndId: string;
//   correspondenceAddress: string;
//   residentialAddress: string;
//   businessOccupation: string;
//   dateCeasingToAct: string;
//   entryMadeBy: string;
// };

// type FounderMember = {
//   name: string;
//   signature: string;
// };

// type Shareholder = {
//   name: string;
//   correspondenceAddress: string;
//   residentialAddress: string;
//   currentHolding: number;
//   percentage: string;
//   remarks: string;
// };

// type Charge = {
//   dateOfCharges: string;
//   description: string;
//   amountSecured: string;
//   entitledPerson: string;
//   dateOfRegistration: string;
//   dateOfDischarges: string;
// };

// type Secretary = {
//   dateOfAppointment: string;
//   fullName: string;
//   idNumber: string;
//   idNumberNote: string;
//   correspondenceAddress: string;
//   type: string;
//   dateCeasingToAct: string;
//   entryMadeBy: string;
// };

// type Member = {
//   fullName: string;
//   occupation: string;
//   correspondenceAddress: string;
//   dateCeasing: string;
//   residentialAddress: string;
//   sharesAcquired: {
//     date: string;
//     certificateNumber: string;
//     distinctiveNoFrom: string;
//     distinctiveNoTo: string;
//     numberOfShares: string;
//     considerationPaid: string;
//   }[];
//   sharesTransferred: AnyObject[];
//   totalSharesHeld: string;
//   remarks: string;
//   entryMadeBy: string;
// };



// type SignificantController = {
//   entryNo: string;
//   dateOfEntry: string;
//   name: string;
//   correspondenceAddress: string;
//   residentialAddress: string;
//   passportInfo: string;
//   dateBecoming: string;
//   dateCeasing: string;
//   natureOfControl: {
//     name: string;
//     details: string;
//   };
// };

// type DesignatedRepresentative = {
//   entryNo: string;
//   dateOfEntry: string;
//   nameAndCapacity: string;
//   address: string;
//   tel: string;
//   fax: string;
// };

// type ShareCapDetails = {
//   founderMember: {
//     name: string;
//     noOfShares: string;
//     totalShares: string;
//   }[];
//   shareClass: string;
//   totalShares: string;
//   shareCapital: string;
//   paidUp: string;
//   unpaid: string;
// };

// type ResolutionData = {
//   company: {
//     name: string;
//     jurisdiction: string;
//   };
//   director: {
//     name: string;
//   };
//   secretary: {
//     name: string;
//   };
//   address: {
//     full: string;
//   };
// };

// export interface ServiceAgreementData {
//   appointmentDate: string;
//   ubiNo: string;
//   companyName: string;
//   directorName: string;
//   companyAddress: string;
//   date: string;
//   email: string;
//   startDate: string;
//   endDate: string;
//   signDate: string;
//   name: string;
//   tel: string;
//   kakaoWechat: string;
//   directors: Director[];
//   founderMember: FounderMember;
//   shareholders: Shareholder[];
//   charges: Charge[];
//   secretaries: Secretary[];
//   shareDetails: {
//     classOfShare: string;
//     parValuePerShare: string;
//   };
//   members: Member[];
//   docSigned: string;
//   userDetails: {
//     name: string;
//     residentialAddress: string;
//     nationalityAndId: string;
//     correspondenceAddress: string;
//     dateOfBecoming: string;
//     dateOfCeasingARegistrablePerson: string;
//     natureOfControl: string;
//   };
//   companyDetails: {
//     name: string;
//     // ubiNo: string;
//     director: string;
//   };
//   controllers: SignificantController[];
//   representatives: DesignatedRepresentative[];
//   shareCapDetails: ShareCapDetails;
//   resolutionData: ResolutionData;
//   resolutionDetails: {
//     inCorporatedDate: string;
//     regNumber: string;
//   };
//   formData: {
//     personalInfo: {
//       title: string;
//       firstName: string;
//       familyName: string;
//       formerName: string;
//       occupation: string;
//       cityOfBirth: string;
//       dateOfBirth: string;
//       countryOfBirth: string;
//       nationality: string;
//       maritalStatus: string;
//     };
//     isUsPerson: boolean;
//     isPublicAuthority: boolean;
//     address: {
//       residential: string;
//       country: string;
//       postCode: string;
//     };
//     contact: {
//       tel: string;
//       mobile: string;
//       email: string;
//       fax: string;
//     };
//     preferredContactMethods: {
//       telephone: boolean;
//       mobile: boolean;
//       email: boolean;
//       fax: boolean;
//       registeredPost: boolean;
//       courier: boolean;
//     };
//   };
// };