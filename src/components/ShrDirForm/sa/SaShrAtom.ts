/* eslint-disable @typescript-eslint/no-explicit-any */
import { atom } from 'jotai';
import api from '@/services/fetch'

export interface Question {
  id: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'textarea' | 'file' | 'checkbox' | 'radio';
  question: string;
  placeholder?: string;
  required: boolean;
  infoText?: string;
  options?: Array<{
    value: string;
    label: string;
    description?: string;
    allowOther?: boolean;
  }>;
  showIf?: {
    questionId: string;
    value: string;
  };
  validation?: {
    minLength?: number;
    pattern?: string;
    message: string;
  };
}

export interface FormData {
  userId: string;
  email: string;
  name: string;
  nameChanged: string;
  previousName: string;
  birthdate: string;
  nationality: string;
  passport: string;
  residenceAddress: string;
  postalAddressSame: string;
  postalAddress: string;
  phone: string;
  kakaoId: string;
  otherSNSIds: string;
  companyName: string;
  companyRelation: string;
  amountContributed: string;
  fundSource: string[];
  originFundInvestFromCountry: string;
  fundGenerated: string[];
  originFundGenerateCountry: string;
  usTaxStatus: string;
  usTIN: string;
  isPoliticallyProminentFig: string;
  descPoliticImpRel: string;
  isCrimeConvitted: string;
  lawEnforced: string;
  isMoneyLaundered: string;
  isBankRupted: string;
  isInvolvedBankRuptedOfficer: string;
  describeIfInvolvedBankRupted: string;
  declarationAgreement: string;
  otherInputs: Record<string, string>;
}

export const formDataAtom = atom<FormData>({
  userId: '',
  email: '',
  name: '',
  nameChanged: '',
  previousName: '',
  birthdate: '',
  nationality: '',
  passport: '',
  residenceAddress: '',
  postalAddressSame: '',
  postalAddress: '',
  phone: '',
  kakaoId: '',
  otherSNSIds: '',
  companyName:"",
  companyRelation: '',
  amountContributed: '',
  fundSource: [],
  originFundInvestFromCountry: '',
  fundGenerated: [],
  originFundGenerateCountry: '',
  usTaxStatus: '',
  usTIN: '',
  isPoliticallyProminentFig: '',
  descPoliticImpRel: '',
  isCrimeConvitted: '',
  lawEnforced: '',
  isMoneyLaundered: '',
  isBankRupted: '',
  isInvolvedBankRuptedOfficer: '',
  describeIfInvolvedBankRupted: '',
  declarationAgreement: '',
  otherInputs: {}
});

export const saveShrSgInviteData = async (data: any, id?: string) => {
  const response = await api.post(`/company/sg-shareholder-form/${id}`,data,
    //  { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  return response.data;
};


export const getSgShareHlderData = async (id: string) => {
  const response = await api.get(`/company/sg-shareholder-form/${id}`);
  return response.data;
};