import { atom } from 'jotai';
export type switchFormSType = {
    _id: string;
    userId: string
    selectedServices: string[];
    otherServiceText: string;
    transferReasons: string[];
    otherReasonText: string;
    notifyCompany: string;
    otherNotifyText: string;
    submittedDocuments: string[];
    otherDocumentText: string;
    identityVerificationMethod: string;
    otherVerificationText: string;
    name: string;
    email: string;
    phoneNum: string;
    snsAccountId: {
        id: string;
        value: string;
    };
    establishedRelationshipType: string[];
    selectedRelation: string[];
    otherRelationText: string;
    businessIntentions: {
        legalIssues: string;
        legalIssuesOther: string;
        maintenanceCost: string;
        documents: string;
        taxExemption: string;
        falsifyTax: string;
        falsifyTaxOther: string;
    };
    tradeSanctions: {
        countryBusiness: string;
        sanctionedResidents: string;
        crimeaBusiness: string;
        sensitiveIndustry: string;
    };
    industry: string[];
    otherIndustryText: string;
    productServiceDescription: string;
    businessPurpose: string[];
    otherBusinessPurposeText: string;
    transactionInfo: {
        openedBankAccount: string;
        openedBankAccountOther: string;
        involvedCrypto: string;
        involvedCryptoOther: string;
    };
    accountingTaxation: {
        fiscalYearAnswer: string;
        otherFiscalYearAnswer: string;
        lastTaxReturnAnswer: string;
        otherLastTaxReturnAnswer: string;
        lastAuditAnswer: string;
        otherLastAuditAnswer: string;
        inHouseAccountingAnswer: string;
        otherInHouseAccountingAnswer: string;
        accountingRecordPreparedAnswer: string;
        xeroImplementationAnswer: string;
        otherXeroImplementationAnswer: string;
        separateAccountingSoftwareAnswer: string;
    };
};

const initialState: switchFormSType = {
    _id: '',
    userId: '',
    selectedServices: [''],
    otherServiceText: '',
    transferReasons: [''],
    otherReasonText: '',
    notifyCompany: '',
    otherNotifyText: '',
    submittedDocuments: [''],
    otherDocumentText: '',
    identityVerificationMethod: '',
    otherVerificationText: '',
    name: '',
    email: '',
    phoneNum: '',
    snsAccountId: { id: '', value: '' },
    establishedRelationshipType: [],
    selectedRelation: [''],
    otherRelationText: '',
    businessIntentions: {
        legalIssues: '',
        legalIssuesOther: '',
        maintenanceCost: '',
        documents: '',
        taxExemption: '',
        falsifyTax: '',
        falsifyTaxOther: ''
    },
    tradeSanctions: {
        countryBusiness: '',
        sanctionedResidents: '',
        crimeaBusiness: '',
        sensitiveIndustry: ''
    },
    industry: [],
    otherIndustryText: '',
    productServiceDescription: '',
    businessPurpose: [],
    otherBusinessPurposeText: '',
    transactionInfo: {
        openedBankAccount: '',
        openedBankAccountOther: '',
        involvedCrypto: '',
        involvedCryptoOther: ''
    },
    accountingTaxation: {
        fiscalYearAnswer: '',
        otherFiscalYearAnswer: '',
        lastTaxReturnAnswer: '',
        otherLastTaxReturnAnswer: '',
        lastAuditAnswer: '',
        otherLastAuditAnswer: '',
        inHouseAccountingAnswer: '',
        otherInHouseAccountingAnswer: '',
        accountingRecordPreparedAnswer: '',
        xeroImplementationAnswer: '',
        otherXeroImplementationAnswer: '',
        separateAccountingSoftwareAnswer: '',
    }

};

export const switchServicesAtom = atom<switchFormSType>(initialState);

export const switchServicesFormAtom = atom(
    (get) => get(switchServicesAtom),
    (_get, set, update: switchFormSType | 'reset') => {
        if (update === 'reset') {
            set(switchServicesAtom, initialState);
        } else {
            set(switchServicesAtom, update);
        }
    }
);
