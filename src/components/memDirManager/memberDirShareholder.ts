import { atom } from 'jotai';
import { Company } from '../companyDocumentManager/cdm';
import api from '@/services/fetch';


export const STRIPE_CLIENT_ID = import.meta.env.VITE_STRIPE_DETAILS || process.env.REACT_APP_STRIPE_DETAILS;
export const CARD_FEE_RATE = 0.04; // Card fee rate (4% for HKD, 6% for USD)
export const countryAtom = atom("");
export const selectedCompanyAtom = atom<Company[]>([]);
export const selectedCompanyIdAtom = atom<Company | null>(null);

// type FilingState = {
//   indivSHAdd: number;
//   corpSHAdd: number;
//   indivDirAdd: number;
//   corpDirAdd: number;
//   indivDirRemove: number;
//   corpDirRemove: number;
// };

//  const filingStateAtom = atom({
//   indivSHAdd: 0,
//   corpSHAdd: 0,
//   indivDirAdd: 0,
//   corpDirAdd: 0,
//   indivDirRemove: 0,
//   corpDirRemove: 0,
// });

// export const writableFilingStateAtom = atom(
//   (get) => get(filingStateAtom), 
//   (get, set, update: Partial<FilingState>) => {
//     set(filingStateAtom, { ...get(filingStateAtom), ...update });
//   }
// );

export const fetchInvoicesOrders = async () =>
  api.get(`/payment/invoice-orders-list/`).then(r => r.data);