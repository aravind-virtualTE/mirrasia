import { atom } from "jotai";

export interface GoogleIntegrationState {
  connected: boolean;
  scopes: string[];
  loading: boolean;
}

export const googleIntegrationAtom = atom<GoogleIntegrationState>({
  connected: false,
  scopes: [],
  loading: true,
});
