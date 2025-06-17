import { atom } from 'jotai';

export interface Director {
    name: string
    email: string
    phone: string
}
export interface Shareholder {
    name: string
    email: string
    totalShares: number
}
export interface DesignatedContact {
    name: string
    email: string
    phone: string
}
export interface Company {
    _id?: string
    status: string
    jurisdiction: string
    comments: string
    incorporationDate: string
    companyNameEng: string
    companyNameChi: string
    companyType: string
    brnNo: string
    noOfShares: number
    shareCapital: string
    directors: Director[]
    shareholders: Shareholder[]
    designatedContact: DesignatedContact
    companySecretarialService: string
    registeredBusinessAddressService: string
    bank: string
}


// const initialFormState: Company = {
//     _id: '',
//     status: '',
//     jurisdiction: "",
//     comments: "",
//     incorporationDate: "",
//     companyNameEng: "",
//     companyNameChi: "",
//     companyType: "",
//     brnNo: "",
//     noOfShares: 0,
//     shareCapital: "",
//     directors: [{ name: "", email: "", phone: "" }, { name: "", email: "", phone: "" }],
//     shareholders: [{ name: "", email: "", totalShares: 0 }, { name: "", email: "", totalShares: 0 }],
//     designatedContact: { name: "", email: "", phone: "" },
//     companySecretarialService: "No",
//     registeredBusinessAddressService: "No",
// }

// Create the base atom
export const cccCompanyData = atom<Company[]>([])