/* eslint-disable @typescript-eslint/no-explicit-any */
import { atom } from 'jotai';


export const multiShrDir = atom<any>([]);


export const multiShrDirResetAtom = atom(
  (get) => get(multiShrDir),
  (_get, set, update: any | 'reset') => {
    if (update === 'reset') {
      set(multiShrDir, []);
    } else {
      set(multiShrDir, update);
    }
  }
);