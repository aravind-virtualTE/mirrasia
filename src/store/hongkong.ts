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

const initialPartialState: Partial<serviceAggrementTypes> = {
  companyId: "",
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
      signature: null,
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
      residentialAddress: "",
      dateEntered: "",
      dateCeasing: "",
      entries: [{
        date: "",
        acquired: {
          certificateNumber: "",
          considerationPaid: "",
          distinctiveNumber: {
            from: "",
            to: "",
          },
          numberOfShares: "",
        },
        transferred: {
          certificateNumber: "",
          considerationPaid: 0,
          numberOfTransfer: "",
          distinctiveNumber: {
            from: "",
            to: "",
          },
          numberOfShares: 0,
        },
        totalSharesHeld: 0,
        remarks: "",
        entryMadeBy: ""
      }],
      shareClass: {
        type: "",
        valuePerShare: 0,
      },
    },
  ],
  registeredMembersSignature: [{ name: "", signature: "" }],
  significantController: [
    {
      name: "",
      correspondenceAddress: "",
      residentialAddress: "",
      passportNo: "",
      dateOfRegistrablePerson: "",
      dateOfCeasingRegistrablePerson: "",
      natureOfControlOverCompany: "",
      addressLine1: "",
      addressLine2: "",
      country: "",
      signature: "",
    },
  ], signiControDetail: [{
    entryNo: 0,
    dateOfEntry: "",
    remarks: ""
  }],

  chairman: [{ name: "", signature: "" }],
  customerDueDiligence: {
    personalInformation: {
      title: "",
      familyName: "",
      name: "",
      formerName: "",
      occupation: "",
      maritalStatus: "",
      cityBirthTown: "",
      birthCountry: "",
      dateOfBirth: "",
      nationality: "",
    },
    taxFacta: {
      factaReportingPuropose: false,
      isPublicAuthority: false,
      countryOfTaxResidence: "",
      taxIdNumber: "",
    },
    permanetResidence: {
      address: "",
      postCode: "",
      country: "",
    },
    otherContactDetails: {
      tel: "",
      mobile: "",
      email: "",
      fax: "",
    },
    preferredMethodOfContact: {
      telephone: false,
      mobile: false,
      email: false,
      fax: false,
      registeredPost: false,
      courier: false,
    },
    cddDate: "",
  },
  cddSignature: "",
  politicallyExposed: false,
  politicallyNotExposed: false,
  pedSignature: "",
  pedDate: "",
  currency: "",
  registerAmount: "",
  articleAssociation: {
    shareClass: "Ordinary",
    paidUp: "0",
    unpaid: "0",
    shareCapital : "0",
    founderMembers: [{ name: "", noOfShares: "0", totalShares: "0" }]
  },
};
export const serviceAgreement =
  atom<Partial<serviceAggrementTypes>>(initialPartialState);

export const signaturesAtom = atom<string[]>([]);
