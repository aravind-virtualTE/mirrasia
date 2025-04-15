import { atom } from 'jotai';

export type hkAccountFormState = {
    _id: string;
    userId: string;
    email: string;
    companyName: string;
    dateOfIncorporation: string;
    selectedIndustry: string[];
    isOtherIndustry: string;
    countryName:string;
    transactionDescription: string;
    costOfGoodsSold:string[];
    isOtherCostGoodSold : string;
    costSaleRatio: string;
    accountingForm :{
        inventory: string;
        accountsReceivable: string;
        tradeReceivables: string;
        loansOrAdvances: string;
        agentContract: string;
        subcontractingRelationship: string;
        cashDisbursements: string;
        nonBankTransactions: string;
        employeeSalaries: string;
        officeRent: string;
        salesExpenses: string;
    },
    accountInfoData: {
        affiliatedCompany: string | null;
        hasBranch: string | null;
        bankAccounts: string;
        salesExpenseFiles: File[];
        subsidiaryFiles: File[];
        branchFiles: File[];
        transactionFiles: File[];
    };
}

const initialState: hkAccountFormState = {
    _id: "",
    userId: "",
    email: "",
    companyName: "",
    dateOfIncorporation: "",
    selectedIndustry: [],
    isOtherIndustry:"",
    countryName:"",
    transactionDescription: "",
    costOfGoodsSold:[],
    isOtherCostGoodSold: "",
    costSaleRatio: "",
    accountingForm :{
        inventory: "",
        accountsReceivable: "",
        tradeReceivables: "",
        loansOrAdvances: "",
        agentContract: "",
        subcontractingRelationship: "",
        cashDisbursements: "",
        nonBankTransactions: "",
        employeeSalaries: "",
        officeRent: "",
        salesExpenses: "",
    },
    accountInfoData: {
        affiliatedCompany: null,
        hasBranch: null,
        bankAccounts: '',
        salesExpenseFiles: [],
        subsidiaryFiles: [],
        branchFiles: [],
        transactionFiles: [],
    },
}

export const accountingServicesAtom = atom<hkAccountFormState>(initialState);

export const switchServicesFormAtom = atom(
    (get) => get(accountingServicesAtom),
    (_get, set, update: hkAccountFormState | 'reset') => {
        if (update === 'reset') {
            set(accountingServicesAtom, initialState);
        } else {
            set(accountingServicesAtom, update);
        }
    }
);