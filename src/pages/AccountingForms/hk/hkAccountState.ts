import { atom } from 'jotai';
import { Option } from '@/components/MultiSelectInput'


export type hkAccountFormState = {
    _id: string;
    userId: string;
    email: string;
    companyName: string;
    dateOfIncorporation: string;
    selectedIndustry: Option[];
    countryName:string;
    transactionDescription: string;
    costOfGoodsSold:Option[];
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
    }
}

const initialState: hkAccountFormState = {
    _id: "",
    userId: "",
    email: "",
    companyName: "",
    dateOfIncorporation: "",
    selectedIndustry: [],
    countryName:"",
    transactionDescription: "",
    costOfGoodsSold:[],
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
        salesExpenses: ""
    }
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