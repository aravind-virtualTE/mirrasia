// import { companyIncorporationAtom } from '@/lib/atom';
import { atom } from 'jotai';



type AnyObject = Record<string, unknown>;
export const companyIncorporationList = atom<AnyObject[]>([]);

