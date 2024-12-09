import { atom } from 'jotai';
import { FormData, HkFormData } from '@/types/hongkongForm';

export const initialFormState: Partial<FormData> = {
    personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
    },
    addressInfo: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
    },
    employmentInfo: {
        company: '',
        position: '',
        startDate: '',
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
        code: '',
        name: '',
    },
    applicantInfo: {
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
        numShareHoldersAtom: undefined,
        numDirectorsAtom: undefined,
        shareHolderDirectorNameSharesNumAtom: '',
        significantControllerAtom: '',
        designatedContactPersonAtom: '',
        shareHolders: [{
            "name": "",
            "ownershipRate": 0,
            "isDirector": false,
            "isLegalPerson": false,
            "email": '',
            "phone": '',
        }]
    },
    accountingTaxInfo: {
        anySoftwareInUse: '',
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
    sessionId: '',
    paymentId: '',
    currentStep: 0,
    isCompleted: false,
    status: '',
    paymentCompleted: false,
    createdAt: '',
    updatedAt: '',
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