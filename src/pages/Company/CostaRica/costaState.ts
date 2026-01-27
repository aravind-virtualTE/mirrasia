/* eslint-disable @typescript-eslint/no-explicit-any */

import { atom } from 'jotai';
import { FormData } from './costaFormConfig';
import api from '@/services/fetch';

export const formDataAtom = atom<FormData>({});

export const isSubmittedAtom = atom<boolean>(false);

// Derived atom to check if form is complete
export const costaRicaFormAtom = atom(
    (get) => get(formDataAtom),
    (_get, set, update: any | 'reset') => {
      if (update === 'reset') {
        set(formDataAtom, {});
      } else {
        set(formDataAtom, update);
      } 
    }
)

export const createOrUpdateCRIncorpo = async (data: any) => {
  try {
    const response = await api.post('/incorporation/incorporateCountryData', data);
    return response.data;
  } catch (error) {
    console.error("Error creating/updating Costa Rica Incorporation data:", error);
    throw error;
  }
};