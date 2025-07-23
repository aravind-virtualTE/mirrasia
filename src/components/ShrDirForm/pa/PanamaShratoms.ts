/* eslint-disable @typescript-eslint/no-explicit-any */
import { atom } from 'jotai';

import api from '@/services/fetch'

export interface Question {
  id: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'textarea' | 'file' | 'checkbox';
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

export interface Answer {
  questionId: string;
  value: string | File;
  otherValue?: string; 
}

// export interface FormData {
//   answers: Answer[];
//   otherInputs: Record<string, string>; 
// }


// export const formDataAtom = atom<FormData>({
//   answers: [],
//   otherInputs: {}
// });

export interface PaShrFormData {
  _id?: string;
  userId: string;
  name: string;
  email: string;
  nameChanged: string;
  previousName: string;
  birthdate: string;
  maritalStatus: string;
  nationality: string;
  passport: string;
  job: string;
  residenceAddress: string;
  postalAddressSame: string;
  postalAddress: string;
  phone: string;
  companyName: string;
  corporationRelationship: string[];
  investedAmount: string;
  sharesAcquired: string;
  fundSource: string[];
  originFundInvestFromCountry: string;
  fundGenerated: string[];
  originFundGenerateCountry: string;
  taxCountry: string;
  taxNumber: string;
  annualSaleIncomePrevYr: string;
  currentNetWorth: string;
  isPoliticallyProminentFig: string;
  descPoliticImpRel: string;
  isCrimeConvitted: string;
  lawEnforced: string;
  isMoneyLaundered: string;
  isBankRupted: string;
  isInvolvedBankRuptedOfficer: string;
  isPartnerOfOtherComp: string;
  declarationAgreement: string;
  passportId: string;
  bankStatement3Mnth: string;
  addressProof: string;
  profRefLetter: string;
  engResume: string;
  otherInputs: Record<string, string>;
}


export const formDataAtom = atom<PaShrFormData>({
  userId: '',
  name: '',
  email: '',
  nameChanged: '',
  previousName: '',
  birthdate: '',
  maritalStatus: '',
  nationality: '',
  passport: '',
  job: '',
  residenceAddress: '',
  postalAddressSame: '',
  postalAddress: '',
  phone: '',
  companyName: '',
  corporationRelationship: [],
  investedAmount: '',
  sharesAcquired: '',
  fundSource: [],
  originFundInvestFromCountry: '',
  fundGenerated: [],
  originFundGenerateCountry: '',
  taxCountry: '',
  taxNumber: '',
  annualSaleIncomePrevYr: '',
  currentNetWorth: '',
  isPoliticallyProminentFig: '',
  descPoliticImpRel: '',
  isCrimeConvitted: '',
  lawEnforced: '',
  isMoneyLaundered: '',
  isBankRupted: '',
  isInvolvedBankRuptedOfficer: '',
  isPartnerOfOtherComp: '',
  declarationAgreement: '',
  passportId: '',
  bankStatement3Mnth: '',
  addressProof: '',
  profRefLetter: '',
  engResume: '',
  otherInputs: {}
});


export const saveShrPanamaInviteData = async (data: any, id?: string) => {
  // const form = new FormData();
  // console.log("data",data)
  // append answers (string values and File objects)
  // data.answers.forEach((answer: { value: string | Blob; questionId: string; }) => {
  //   if (answer.value instanceof File) {
  //     form.append(answer.questionId, answer.value);
  //   } else {
  //     form.append(answer.questionId, answer.value);
  //   }
  // });

  // append any “otherInputs” (text)
  // Object.entries(data.otherInputs).forEach(([key, value]) => {
  //   form.append(key, String(value));
  // });

  const response = await api.post(`/company/pa-shareholder-form/${id}`,data,
     { headers: { 'Content-Type': 'multipart/form-data' } });
  return response.data;
};


export const getPanamaShareHlderData = async (id: string) => {
  const response = await api.get(`/company/pa-shareholder-form/${id}`);
  return response.data;
};