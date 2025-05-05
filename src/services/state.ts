// import { companyIncorporationAtom } from '@/lib/atom';
import { atom } from 'jotai';
import { User } from "@/components/userList/UsersList";
export type AnyObject = Record<string, unknown>;
export const companyIncorporationList = atom<AnyObject[]>([]);

export const selectedServicesAtom = atom<string[]>([]);
export const companyIncorporateInvoiceAtom = atom<AnyObject[]>([]);

export const dashboardCompaniesAtom = atom<AnyObject[]>([]);

 export const allCompListAtom = atom(
    (get) => get(dashboardCompaniesAtom),
    (_get, set, update: AnyObject[] | 'reset') => {
      if (update === 'reset') {
        set(dashboardCompaniesAtom, []);
      } else {
        set(dashboardCompaniesAtom, update);
      }
    }
  );

  export const usersData = atom<User[]>([]);