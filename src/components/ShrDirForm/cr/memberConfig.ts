/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/services/fetch';

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'radio-group' | 'number' | 'checkbox-group';
  placeholder?: string;
  required?: boolean;
  options?: FormFieldOption[];
  helpText?: string;
  multiSelect?: boolean;
  defaultValue?: string | string[];
  condition?: (form: Record<string, any>) => boolean;
  colSpan?: 1 | 2;
  tooltip?: string;
  hint?: string;
  rows?: number;
  readOnly?: boolean;
}

export interface MemberFormStep {
  id: string;
  title: string;
  shortTitle: string;
  description?: string;
  fields: FormField[];
}

export const RELATIONSHIP_OPTIONS = [
  { value: 'member', label: '1) Member' },
  { value: 'ubo', label: '2) UBO (Ultimate Beneficiary Owner) - directly/indirectly owns 25%+ shares' },
  { value: 'nominee_member', label: '3) Nominee for a member (Trust administrator acting on behalf of a member)' },
  { value: 'director', label: '4) Director (Administrator)' },
  { value: 'nominee_director', label: '5) Nominee for a director (Agent registered and acting on behalf of a director)' },
  { value: 'designated_contact', label: '6) Designated Contact Person (Representative who will communicate on behalf of the company)' },
];

export const SOURCE_OF_FUNDS_OPTIONS = [
  { value: 'employment_income', label: 'Employment income' },
  { value: 'savings_deposits', label: 'Savings, deposits' },
  { value: 'investment_income', label: 'Income from real estate, stocks, and other investment assets' },
  { value: 'loans', label: 'Loans' },
  { value: 'company_sale', label: 'Company or equity sale proceeds' },
  { value: 'business_income', label: 'Business income/dividends' },
  { value: 'inheritance', label: 'Inheritance' },
  { value: 'other', label: 'Other' },
];

export const memberFormConfig: MemberFormStep[] = [
  {
    id: 'personal-info',
    title: 'Personal Information',
    shortTitle: 'Personal Info',
    description: 'Provide your personal details and contact information.',
    fields: [
      {
        id: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'your@email.com',
        required: true,
      },
      {
        id: 'fullName',
        label: 'Name',
        type: 'text',
        placeholder: 'Enter your full name',
        required: true,
      },
      {
        id: 'nameChanged',
        label: 'Have you changed your name?',
        type: 'radio-group',
        required: true,
        options: [
          { value: 'yes', label: 'Yes (Please write your previous English name in the "Other" section below)' },
          { value: 'no', label: 'No' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        id: 'dateOfBirth',
        label: 'Date of birth',
        type: 'text',
        placeholder: 'YYYY-MM-DD',
        required: true,
      },
      {
        id: 'placeOfBirth',
        label: 'Place of birth',
        type: 'text',
        placeholder: 'City, Country',
        required: true,
      },
      {
        id: 'maritalStatus',
        label: 'Marital status',
        type: 'text',
        placeholder: 'Single, Married, etc.',
        required: true,
      },
      {
        id: 'nationality',
        label: 'Nationality',
        type: 'text',
        placeholder: 'Your nationality',
        required: true,
      },
      {
        id: 'passportNumber',
        label: 'Passport Number',
        type: 'text',
        placeholder: 'Your passport number',
        required: true,
      },
      {
        id: 'occupation',
        label: 'Occupation',
        type: 'text',
        placeholder: 'Your occupation',
        required: true,
      },
    ],
  },
  {
    id: 'relationship',
    title: 'Relationship to Corporation',
    shortTitle: 'Relationship',
    description: 'Select your relationship to the corporation you are establishing.',
    fields: [
      {
        id: 'corporationRelationship',
        label: 'Relationship to the corporation you are establishing (select all that apply)',
        type: 'checkbox-group',
        required: true,
        options: RELATIONSHIP_OPTIONS,
        tooltip: '[Explanation of Designated Contact Person] You must appoint a designated contact person who will handle the company\'s business communications, and this designated contact person will handle key business communications with us. Their duties include inquiries related to the company and business, checking progress, and communications related to registration documents, etc. The designated contact person can view your company\'s information and documents, as well as your company\'s mail documents. The appointment of one contact person is free of charge; for two or more people, an annual fee of USD 250 per person will be incurred.',
      },
      {
        id: 'investmentAmount',
        label: 'The amount to be invested in the corporation to be established (CRC)',
        type: 'text',
        placeholder: 'Enter amount in CRC',
        required: true,
        hint: 'Supporting documents for the source of funds may be required.',
      },
      {
        id: 'sourceOfFunds',
        label: 'Source of funds',
        type: 'checkbox-group',
        required: true,
        options: SOURCE_OF_FUNDS_OPTIONS,
      },
    ],
  },
  {
    id: 'address-contact',
    title: 'Address & Contact',
    shortTitle: 'Address',
    description: 'Provide your residential address and contact information.',
    fields: [
      {
        id: 'residentialAddress',
        label: 'Confirmation of residential address and duration of residence',
        type: 'textarea',
        placeholder: 'Please include your postal code and the duration you have resided in your current country of residence.',
        required: true,
        rows: 3,
      },
      {
        id: 'mailingAddress',
        label: 'Mailing address (if different from residential address)',
        type: 'textarea',
        placeholder: 'Enter mailing address if different',
        rows: 3,
      },
      {
        id: 'mobilePhone',
        label: 'Contact mobile phone number',
        type: 'text',
        placeholder: '+1 234 567 8900',
        required: true,
      },      
      {
        id: 'isPEPFamily',
        label: 'Do you, your immediate family, or close acquaintances hold a high-ranking public, political, government, military, or judicial position?',
        type: 'radio-group',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
      },
    ],
  },
  {
    id: 'pep-confirmation',
    title: 'Politically Exposed Person Confirmation',
    shortTitle: 'PEP',
    description: 'Politically Exposed Person (PEP) confirmation details.',
    fields: [
      {
        id: 'isPEP',
        label: 'Are you a Politically Exposed Person corresponding to the above descriptions, or does your immediate family or close acquaintance correspond to a Politically Exposed Person such as a high-ranking public official, political figure, government official, military personnel, or international organization official?',
        type: 'radio-group',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
      },
      {
        id: 'pepDescription',
        label: 'Describe a key political figure',
        type: 'textarea',
        placeholder: 'Please describe in detail whether you are a key political figure or your relationship with such a figure.',
        rows: 4,
        condition: (form) => form.isPEP === 'yes',
      },
    ],
  },
  {
    id: 'declaration',
    title: 'Declaration',
    shortTitle: 'Declaration',
    description: 'Please read each question carefully and answer.',
    fields: [
      {
        id: 'crimeConviction',
        label: 'Have you ever been arrested or convicted of a crime that violates the law?',
        type: 'radio-group',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
      },
      {
        id: 'lawEnforcementInvestigation',
        label: 'Have you ever been investigated by law enforcement agencies (police, prosecutors) or tax authorities?',
        type: 'radio-group',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
      },
      {
        id: 'moneyLaundering',
        label: 'Are you involved in crimes, money laundering, bribery, or terrorist activities related to business and personal funds, or funds derived from other illegal activities?',
        type: 'radio-group',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
      },
      {
        id: 'personalBankruptcy',
        label: 'Have you ever been personally involved in bankruptcy or liquidation?',
        type: 'radio-group',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
      },
      {
        id: 'companyBankruptcy',
        label: 'Have you ever been involved in bankruptcy or liquidation as an executive of a company?',
        type: 'radio-group',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
      },
      {
        id: 'otherCompanyRoles',
        label: 'Are you a director / shareholder / beneficial owner (UBO) / associate / partner of another company, or an associate of another organisation or association?',
        type: 'radio-group',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
        hint: 'If applicable, please state the company name, country of incorporation, and your position in the next section.',
      },
      {
        id: 'declarationDetails',
        label: 'If you selected "Yes" to any of the statements in the declaration section, please provide specific details regarding that selection.',
        type: 'textarea',
        placeholder: 'Provide details here...',
        rows: 4,
        condition: (form) => 
          form.crimeConviction === 'yes' || 
          form.lawEnforcementInvestigation === 'yes' || 
          form.moneyLaundering === 'yes' || 
          form.personalBankruptcy === 'yes' || 
          form.companyBankruptcy === 'yes' ||
          form.otherCompanyRoles === 'yes',
      },
    ],
  },
  {
    id: 'agreement',
    title: 'Declaration and Agreement',
    shortTitle: 'Agreement',
    description: 'Please confirm and agree to the following declaration.',
    fields: [
      {
        id: 'finalAgreement',
        label: 'Have you confirmed the above and do you agree to it?',
        type: 'radio-group',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'other', label: 'Other' },
        ],
      },
    ],
  },
];

export type MemberFormData = Record<string, string | string[] | boolean | number | undefined>;

export const createUpdateCrMember = async (data:any) =>{
    try{
        const response = await api.post("incorporation/createCrMember", data)
        return response.data
    }catch(e){
        console.log("Error",e)
    }
}

export const getCrMemberData = async (id:string) =>{
    try{
        const result = await api.get(`incorporation/getCrMember/${id}`)
        return result.data
    }catch(e){
        console.log("err",e)
    }
}