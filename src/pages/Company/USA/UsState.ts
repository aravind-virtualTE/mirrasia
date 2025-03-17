import { atom } from 'jotai';

  interface UsaFormData {
    email: string;
    selectedState: string;
    selectedEntity: string;
    noOfSharesSelected: string;
    name: string;
    establishedRelationshipType: string;
    phoneNum : string;
    snsAccountId: string;
    serviceItemsSelected: string;
    hasLegalEthicalIssues: string;
    annualRenewalTermsAgreement: string;
    restrictedCountriesWithActivity : string;
    sanctionedTiesPresent: string;
    businessInCrimea: string;
    involvedInRussianEnergyDefense: string;
    selectedIndustry: string;
    descriptionOfProducts: string;
    descriptionOfBusiness: string;
    webAddress: string;
    purposeOfEstablishmentCompany: string;
    companyName: string[];
    totalCapital: string;
    companyExecutives :  string;
    localCompanyRegistration : string;
    businessAddress: string;
    noOfShareholders : string;
    noOfOfficers: string;
    shareHolders : {
      name: string;
      email: string;
      noOfSharesOwned: number;
    }[];
    designatedContact: string;
    accountingDataAddress : string;
    isTermsAndConditionsAccepted: string;
    paymentOption : string;
    postIncorporationCapabilities: string;    

  }

  const initialFormState: UsaFormData = {
    email: '',
    selectedState: '',
    selectedEntity: '',
    noOfSharesSelected: '',
    name: '',
    establishedRelationshipType: '',
    phoneNum: '',
    snsAccountId: '',
    serviceItemsSelected: '',
    hasLegalEthicalIssues: '',
    annualRenewalTermsAgreement: '',
    restrictedCountriesWithActivity: '',
    sanctionedTiesPresent: '',
    businessInCrimea: '',
    involvedInRussianEnergyDefense: '',
    selectedIndustry: '',
    descriptionOfProducts: '',
    descriptionOfBusiness: '',
    webAddress: '',
    purposeOfEstablishmentCompany: '',
    companyName: ['', '', ''],
    totalCapital: '',
    companyExecutives: '',
    localCompanyRegistration: '',
    businessAddress: '',
    noOfShareholders: '',
    noOfOfficers: '',
    shareHolders: [],
    designatedContact: '',
    accountingDataAddress: '',
    isTermsAndConditionsAccepted: '',
    paymentOption: '',
    postIncorporationCapabilities: ''
  };
  
  // Create the base atom
  export const usaFormAtom = atom<UsaFormData>(initialFormState);
  
  // Atom with reset functionality
  export const usaFormWithResetAtom = atom(
    (get) => get(usaFormAtom),
    (get, set, update: UsaFormData | 'reset') => {
      if (update === 'reset') {
        set(usaFormAtom, initialFormState);
      } else {
        set(usaFormAtom, update);
      }
    }
  );

  // Usage examples:
/*
// In your component:
import { useAtom } from 'jotai';
import { usaFormWithResetAtom } from './your-atom-file';

// Basic usage
const [formData, setFormData] = useAtom(usaFormWithResetAtom);

// To update/hydrate form data
const hydrateForm = (data: UsaFormData) => {
  setFormData(data);
};

// To reset form
const resetForm = () => {
  setFormData('reset');
};

// Example of updating specific field
const updateEmail = (email: string) => {
  setFormData({
    ...formData,
    email
  });
};

// Example of updating shareholders
const updateShareholders = (shareholders: { name: string; email: string; noOfSharesOwned: number }[]) => {
  setFormData({
    ...formData,
    shareHolders: shareholders
  });
};
*/