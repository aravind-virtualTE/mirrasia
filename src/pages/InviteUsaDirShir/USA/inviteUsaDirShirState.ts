import { atom } from 'jotai';
import { Option } from "@/components/MultiSelectInput";
  interface UsaFormData {
    email: string;
    userId: string;
    selectedState: string |number;
    selectedEntity: string;
    noOfSharesSelected: string | number;
    name: string;
    establishedRelationshipType: Option[];
    phoneNum : string;
    snsAccountId: string;
    serviceItemsSelected: Option[];
    hasLegalEthicalIssues: Option[];
    annualRenewalTermsAgreement: Option[];
    restrictedCountriesWithActivity : string;
    sanctionedTiesPresent: string;
    businessInCrimea: string;
    involvedInRussianEnergyDefense: string;
    selectedIndustry: Option[];
    descriptionOfProducts: string;
    descriptionOfBusiness: string;
    webAddress: string;
    purposeOfEstablishmentCompany: Option[];
    companyName: string[];
    totalCapital: string| number;
    companyExecutives :  string| number;
    localCompanyRegistration : string;
    businessAddress: string;
    noOfShareholders : string;
    noOfOfficers: string;
    shareHolders : {
      name: string;
      email: string;
      phone: string;
      ownershipRate: number;
      isDirector: boolean
    }[];
    designatedContact: string | number;
    accountingDataAddress : string;
    isTermsAndConditionsAccepted: string;
    paymentOption : string;
    postIncorporationCapabilities: string;    
    country : {
      code?: string;
      name?: string;
    }
  }

  const initialFormState: UsaFormData = {
    userId: '',
    email: '',
    selectedState: '',
    selectedEntity: '',
    noOfSharesSelected: '',
    name: '',
    establishedRelationshipType: [],
    phoneNum: '',
    country : {
      code: undefined,
      name: undefined,
    },
    snsAccountId: '',
    serviceItemsSelected: [],
    hasLegalEthicalIssues:[],
    annualRenewalTermsAgreement:[],
    restrictedCountriesWithActivity: '',
    sanctionedTiesPresent: '',
    businessInCrimea: '',
    involvedInRussianEnergyDefense: '',
    selectedIndustry: [],
    descriptionOfProducts: '',
    descriptionOfBusiness: '',
    webAddress: '',
    purposeOfEstablishmentCompany: [],
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
    (_get, set, update: UsaFormData | 'reset') => {
      if (update === 'reset') {
        set(usaFormAtom, initialFormState);
      } else {
        set(usaFormAtom, update);
      }
    }
  );

 