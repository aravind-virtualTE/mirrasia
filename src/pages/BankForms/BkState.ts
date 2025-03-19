import { atom } from 'jotai';


interface BkFormData {
  email: string;
  name: string;
  phoneNum: string;
  kakaoId: string;
  speaksEnglishOrChinese: string;
  holdsFinancialAssets: string;
  ownsOver25PercentHkShares: string;
  isUnder27OrOver55 : string  
  nationality  : string;
  countryOfResidence: string;
  isNationalityResidenceSame : string;
  usCitizenResidentTaxpayer: string;
  hasHkCard: string;
  pastHkAccountClosure : string;
  hasAtemptedHkAccountRejected : string;
  hasBeenRefusedServiceInPast : string;
  isPoliticallyExposedPerson : string;
  bankClosureRejectionReason: string;
  desiredMeetDate : string;
  desiredMeetTime : string;
  passportUrl: string;
  consentToPassportPrescreening: string;
  serviceSelected : string;
  purposeOfOpeningAccount : string;
  paymentMethod: string;
  agreesToProvideDocumentsForAccountOpening: string;
  agreesToLimitedAccountOpeningAssistance : string;
  agreesToProvideFurtherDocumentsIfRequired : string;
  understandsNoRefundPolicyForCustomerResponsibility : string;
  agreesToPotentialChangesInBankProcedures :string;
}

const initialBkFormState: BkFormData = {
    email: '',
    name: '',
    phoneNum: '',
    kakaoId: '',
    speaksEnglishOrChinese: '',
    holdsFinancialAssets: '',
    ownsOver25PercentHkShares: '',
    isUnder27OrOver55 : '',
    nationality : '',
    countryOfResidence: '',
    isNationalityResidenceSame : '',
    usCitizenResidentTaxpayer: '',
    hasHkCard: '',
    pastHkAccountClosure : '',
    hasAtemptedHkAccountRejected : '',
    hasBeenRefusedServiceInPast : '',
    isPoliticallyExposedPerson : '',
    bankClosureRejectionReason: '',
    desiredMeetDate : '',
    desiredMeetTime : '',
    passportUrl: '',
    consentToPassportPrescreening: '',
    serviceSelected : '',
    purposeOfOpeningAccount : '',
    paymentMethod: '',
    agreesToProvideDocumentsForAccountOpening: '',
    agreesToLimitedAccountOpeningAssistance : '',
    agreesToProvideFurtherDocumentsIfRequired : '',
    understandsNoRefundPolicyForCustomerResponsibility : '',
    agreesToPotentialChangesInBankProcedures : '',
};

export const hkBnkFormAtom = atom<BkFormData>(initialBkFormState);

export const bkFormWithResetAtom = atom(
    (get) => get(hkBnkFormAtom),
    (_get, set, update: BkFormData | 'reset') => {
      if (update === 'reset') {
        set(hkBnkFormAtom, initialBkFormState);
      } else {
        set(hkBnkFormAtom, update);
      }
    }
  );