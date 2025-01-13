import { atom } from "jotai";
import {
  FormData,
  HkFormData,
  serviceAggrementTypes,
  // ServiceAgreementData,
} from "@/types/hongkongForm";

export const initialFormState: Partial<FormData> = {
  personalInfo: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  },
  addressInfo: {
    street: "",
    city: "",
    state: "",
    zipCode: "",
  },
  employmentInfo: {
    company: "",
    position: "",
    startDate: "",
    currentlyEmployed: true,
  },
  currentStep: 0,
  isCompleted: false,
};

export const formDataAtom = atom<Partial<FormData>>(initialFormState);

export const currentStepAtom = atom(
  (get) => get(formDataAtom).currentStep || 0,
  (get, set, newStep: number) => {
    set(formDataAtom, {
      ...get(formDataAtom),
      currentStep: newStep,
    });
  }
);

export const initialHkFormState: Partial<HkFormData> = {
  _id: undefined,
  userId: undefined,
  country: {
    code: "",
    name: "",
  },
  applicantInfo: {
    name: "",
    relationships: [],
    contactInfo: "",
    snsAccountId: "",
    snsPlatform: "",
    phoneNumber: "",
    email: "",
    companyName: [],
  },
  companyBusinessInfo: {
    business_product_description: "",
    business_purpose: [],
    business_industry: "",
  },
  regCompanyInfo: {
    registerCompanyNameAtom: "",
    registerShareTypeAtom: [],
  },
  shareHolderDirectorController: {
    numShareHoldersAtom: undefined,
    numDirectorsAtom: undefined,
    shareHolderDirectorNameSharesNumAtom: "",
    significantControllerAtom: "",
    designatedContactPersonAtom: "",
    shareHolders: [
      {
        name: "",
        ownershipRate: 0,
        isDirector: false,
        isLegalPerson: false,
        email: "",
        phone: "",
      },
    ],
  },
  accountingTaxInfo: {
    anySoftwareInUse: "",
    finYearEnd: undefined,
    bookKeepCycle: undefined,
    implementSoftware: undefined,
  },
  businessInfoHkCompany: {
    sanctioned_countries: undefined,
    sanctions_presence: undefined,
    crimea_presence: undefined,
    russian_business_presence: undefined,
    legal_assessment: undefined,
  },
  serviceAgreementConsent: false,
  serviceSelection: [],
  sessionId: "",
  paymentId: "",
  currentStep: 0,
  isCompleted: false,
  status: "",
  paymentCompleted: false,
  createdAt: "",
  updatedAt: "",
  incorporationDate: null,
};

export const hkFormDataAtom = atom<Partial<HkFormData>>(initialHkFormState);

export const currentHkStepAtom = atom(
  (get) => get(hkFormDataAtom).currentStep || 0,
  (get, set, newStep: number) => {
    set(hkFormDataAtom, {
      ...get(hkFormDataAtom),
      currentStep: newStep,
    });
  }
);

// export const initialServiceAgrementState: Partial<ServiceAgreementData> = {
//   appointmentDate: "",
//   brnNo: "",
//   companyName: "",
//   directorName: "",
//   companyAddress: "",
//   date: "",
//   email: "",
//   startDate: "",
//   endDate: "",
//   signDate: "",
//   name: "",
//   tel: "",
//   kakaoWechat: "",
//   directors: [
//     {
//       dateOfAppointment: "",
//       fullName: "",
//       nationalityAndId: "",
//       correspondenceAddress: "",
//       residentialAddress: "",
//       businessOccupation: "",
//       dateCeasingToAct: "",
//       entryMadeBy: "",
//     },
//     ...Array(3).fill({
//       dateOfAppointment: "",
//       fullName: "",
//       nationalityAndId: "",
//       correspondenceAddress: "",
//       residentialAddress: "",
//       businessOccupation: "",
//       dateCeasingToAct: "",
//       entryMadeBy: "",
//     }),
//   ],
//   founderMember: { name: "", signature: "" },
//   shareholders: [
//     {
//       name: "",
//       correspondenceAddress: "",
//       residentialAddress: "",
//       currentHolding: 100,
//       percentage: "100%",
//       remarks: "Shareholder",
//     },
//     ...Array(3).fill({
//       name: "",
//       correspondenceAddress: "",
//       residentialAddress: "",
//       currentHolding: 0,
//       percentage: "",
//       remarks: "",
//     }),
//   ],
//   charges: [
//     {
//       dateOfCharges: "",
//       description: "No Charges",
//       amountSecured: "",
//       entitledPerson: "",
//       dateOfRegistration: "",
//       dateOfDischarges: "",
//     },
//     ...Array(3).fill({
//       dateOfCharges: "",
//       description: "",
//       amountSecured: "",
//       entitledPerson: "",
//       dateOfRegistration: "",
//       dateOfDischarges: "",
//     }),
//   ],
//   secretaries: [
//     {
//       dateOfAppointment: "",
//       fullName: "MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED",
//       idNumber: "50673946",
//       idNumberNote: "(Registered in Hong Kong)",
//       correspondenceAddress: "",
//       type: "",
//       dateCeasingToAct: "",
//       entryMadeBy: "",
//     },
//     ...Array(3).fill({
//       dateOfAppointment: "",
//       fullName: "",
//       idNumber: "",
//       correspondenceAddress: "",
//       type: "",
//       dateCeasingToAct: "",
//       entryMadeBy: "",
//     }),
//   ],
//   shareDetails: {
//     classOfShare: "ORDINARY",
//     parValuePerShare: "USD 100.00",
//   },
//   members: [
//     {
//       fullName: "",
//       occupation: "",
//       correspondenceAddress: "",
//       dateCeasing: "",
//       residentialAddress: "",
//       sharesAcquired: [
//         {
//           date: "",
//           certificateNumber: "1",
//           distinctiveNoFrom: "1",
//           distinctiveNoTo: "",
//           numberOfShares: "",
//           considerationPaid: "USD 00.00",
//         },
//       ],
//       sharesTransferred: [],
//       totalSharesHeld: "100",
//       remarks: "",
//       entryMadeBy: "",
//     },
//   ],
//   docSigned: "",
//   userDetails: {
//     name: "",
//     residentialAddress: "",
//     nationalityAndId: "",
//     correspondenceAddress: "",
//     dateOfBecoming: "",
//     dateOfCeasingARegistrablePerson: "",
//     natureOfControl: "",
//   },
//   companyDetails: {
//     name: "",
//     // brnNo: '',
//     director: "",
//   },
//   controllers: [
//     {
//       entryNo: "",
//       dateOfEntry: "",
//       name: "",
//       correspondenceAddress: "",
//       residentialAddress: "",
//       passportInfo: "",
//       dateBecoming: "",
//       dateCeasing: "",
//       natureOfControl: {
//         name: "",
//         details: "",
//       },
//     },
//   ],
//   representatives: [
//     {
//       entryNo: "",
//       dateOfEntry: "",
//       nameAndCapacity: "",
//       address: "",
//       tel: "",
//       fax: "",
//     },
//   ],
//   shareCapDetails: {
//     founderMember: [{ name: "", noOfShares: "", totalShares: "" }],
//     shareClass: "",
//     totalShares: "",
//     shareCapital: "",
//     paidUp: "",
//     unpaid: "",
//   },
//   resolutionData: {
//     company: {
//       name: "",
//       jurisdiction: "",
//     },
//     director: {
//       name: "",
//     },
//     secretary: {
//       name: "MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED",
//     },
//     address: {
//       full: "WORKSHOP UNIT B50, 2/F, KWAI SHING IND. BLDG., PHASE 1, 36-40 TAI LIN PAI RD, KWAI CHUNG, N.T., HONG KONG",
//     },
//   },
//   resolutionDetails: {
//     inCorporatedDate: "",
//     regNumber: "",
//   },
//   formData: {
//     personalInfo: {
//       title: "",
//       firstName: "",
//       familyName: "",
//       formerName: "",
//       occupation: "",
//       cityOfBirth: "",
//       dateOfBirth: "",
//       countryOfBirth: "",
//       nationality: "",
//       maritalStatus: "",
//     },
//     isUsPerson: false,
//     isPublicAuthority: false,
//     address: {
//       residential: "",
//       country: "",
//       postCode: "",
//     },
//     contact: {
//       tel: "",
//       mobile: "",
//       email: "",
//       fax: "",
//     },
//     preferredContactMethods: {
//       telephone: false,
//       mobile: false,
//       email: false,
//       fax: false,
//       registeredPost: false,
//       courier: false,
//     },
//   },
// };

// export const serviceAgrement = atom<Partial<ServiceAgreementData>>(
//   initialServiceAgrementState
// );



const initialPartialState: Partial<serviceAggrementTypes> = {
  companyId:"",
  brnNo: "",
  directorList: [{ name: "", signature: "" }],
  appointmentDate: "",
  companyName: "",
  companyAddress: "",
  consentDate: "",
  consentStateDate: "",
  consentEndDate: "",
  contactEmail: "",
  consentSignDate: "",
  authorizedDetails: [{ name: "", email: "", tel: "", kakaoWechat: "" }],
  authorizedDesignated: [{ name: "", signature: "" }],
  founderMember: [{ name: "", signature: "" }],
  shareholderList: [
    {
      name: "",
      correspondenceAddress: "",
      residentialAddress: "",
      currentHolding: 0,
      percentage: "",
      remarks: "",
      signature: null
    },
  ],
  registerChargesList: [
    {
      dateOfCharges: "",
      description: "",
      amountSecured: "",
      entitledPerson: "",
      dateOfRegistration: "",
      dateOfDischarges: "",
    },
  ],
  registerChargeSignature: "",
  registerSecretariesList: [
    {
      dateOfAppointment: "",
      fullName: "",
      idNumber: "",
      idNumberNote: "",
      correspondenceAddress: "",
      type: "",
      dateCeasingToAct: "",
      entryMadeBy: "",
    },
  ],
  companySecretarySignature: "",
  registerDirector: [
    {
      dateOfAppointment: "",
      name: "",
      nationality: "",
      correspondenceAddress: "",
      residentialAddress: "",
      directorShip: "",
      ceasingAct: "",
      entryMadeBy: "",
    },
  ],
  registerDirectorSignature: "",
  sharesDate: "",
  registeredMembers: [
    {
      name: "",
      occupation: "",
      correspondenceAddress: "",
      dateCeasing: "",
      residentialAddress: "",
      sharesAcquired: [
        {
          certificateNumber: "",
          distinctiveNumber: "",
          numberOfShares: "",
          considerationPaid: "",
        },
      ],
      sharesTransferred: [
        {
          certificateNumber: "",
          distinctiveNumber: "",
          numberOfShares: "",
          considerationPaid: "",
        },
      ],
      totalSharesHeld: "",
      remarks: "",
      entryMadeBy: "",
      classOfShare : "",
      pervalueshare : "",
    },
  ],
  registeredMembersSignature: [{name: "", signature: ""}],
  significantController : [{
    name : "",
    correspondenceAddress : "",
    residentialAddress : "",
    passportNo : "",
    dateOfRegistrablePerson : "",
    dateOfCeasingRegistrablePerson : "",
    natureOfControlOverCompany : "",
  }],
  chairman : [{name : "", signature : ""}],
  customerDueDiligence : {
    personalInformation : {
      title : "",
      familyName : "",
      name : "",
      formerName : "",
      occupation : "",
      maritalStatus : "",
      cityBirthTown : "",
      birthCountry: "",
      dateOfBirth : "",
      nationality : "",
    },
    taxFacta : {
      factaReportingPuropose : false,
      isPublicAuthority : false,
      countryOfTaxResidence : "",
      taxIdNumber : ""
    },
    permanetResidence : {
      address : "",
      postCode : "",
      country : ""
    },
    otherContactDetails : {
      tel : "",
      mobile : "",
      email : "",
      fax :""
    },
    preferredMethodOfContact : {
      telephone: false,
      mobile: false,
      email: false,
      fax: false,
      registeredPost: false,
      courier: false
    },
    cddDate : "",
  },
  cddSignature : "",
  politicallyExposed : false,
  politicallyNotExposed : false,
  pedSignature : "",
  pedDate : "",
  
};
export const serviceAgreement  = atom<Partial<serviceAggrementTypes>>(initialPartialState);

export const signaturesAtom = atom<string[]>([]);
