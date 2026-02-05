/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/services/fetch';
export interface FormFieldOption {
  value: string;
  label: string;
}

export interface SearchSelectItem {
  code: string;
  label: string;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'radio-group' | 'number' | 'checkbox-group' | 'derived' | 'search-select' | 'dropdown-select' | 'email-otp' | 'mobile-otp';
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
  compute?: (form: Record<string, any>) => string;
  items?: SearchSelectItem[];
  readOnly?: boolean
}

export interface FormStep {
  id: string;
  title: string;
  shortTitle: string;
  description?: string;
  fields: FormField[];
  customComponent?: 'applicantDetails' | 'amlCompliance' | 'companyInfo' | 'accountingTaxation' | 'serviceAgreement' | 'invoice' | 'payment' | 'incorporation';
}

export const formConfig: FormStep[] = [
  {
    id: 'applicant-details',
    title: 'Applicant Details',
    shortTitle: '1. Applicant Details',
    description: 'Provide your personal information and company name choices.',
    fields: [
      { id: 'name', type: 'text', label: 'Full Name', required: true, tooltip: 'Enter your full legal name as it appears on official documents.' },
      { id: 'email', type: 'text', label: 'Email', required: true },
      { id: 'phoneNum', type: 'text', label: 'Phone Number', required: true, tooltip: 'Include country code (e.g., +506 for Costa Rica)' },
      {
        id: 'sns', type: 'select', label: 'Preferred Messenger',
        options: [
          { label: 'WhatsApp', value: 'WhatsApp' },
          { label: 'WeChat', value: 'WeChat' },
          { label: 'Line', value: 'Line' },
          { label: 'KakaoTalk', value: 'KakaoTalk' },
          { label: 'Telegram', value: 'Telegram' },
        ]
      },
      { id: 'snsId', type: 'text', label: 'Messenger ID', condition: (f) => !!f.sns },
      { id: 'address', type: 'text', label: 'Place of Residence', required: true, colSpan: 2 },
      { id: 'companyName_1', type: 'text', label: '1st Choice', required: true, helpText: '(Most preferred)', placeholder: 'e.g., Costa Tech Solutions S.R.L.' },
      { id: 'companyName_2', type: 'text', label: '2nd Choice', required: true, placeholder: 'Alternative company name' },
      { id: 'companyName_3', type: 'text', label: '3rd Choice', required: true, placeholder: 'Alternative company name' },
    ],
    customComponent: 'applicantDetails'
  },
  {
    id: 'aml-compliance',
    title: 'AML & Compliance',
    shortTitle: '2. AML & Compliance',
    description: 'Questions regarding compliance and sanctions.',
    fields: [ // Populating fields for usage in AmlComplianceStep
      {
        id: 'annualRenewalConsent',
        type: 'radio',
        label: 'Do you consent to annual compliance renewal and AML/KYC procedures?',
        required: true,
        tooltip: 'Annual compliance is required to maintain your company in good standing.',
        options: [{ label: 'Yes, I consent', value: 'yes' }, { label: 'No', value: 'no' }]
      },
      {
        id: 'sanctionsExposureDeclaration',
        type: 'radio',
        label: 'Sanctions exposure: Do the company or any connected parties have a presence in, dealings with, or ownership ties to sanctioned persons or entities under UN, EU, UK HMT, HKMA, OFAC (US) or local sanctions law?',
        required: true,
        tooltip: 'FATF, UNGC, and OFAC sanctions apply.',
        options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }, { label: "Don't Know", value: 'unknown' }]
      },
      { id: 'legalAndEthicalConcern', type: 'radio', label: 'Are there any legal or ethical concerns related to the business (e.g., money laundering, gambling, tax evasion, asset concealment, fraud)?', required: true, options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }, { label: "Don't Know", value: 'unknown' }] },
      { id: 'q_country', type: 'radio', label: 'Does the costa rica company have any current or planned business activity in the following countries/regions: Iran, Sudan, North Korea, Syria, Cuba, South Sudan, Belarus, or Zimbabwe?', required: true, options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }, { label: "Don't Know", value: 'unknown' }] },
      {
        id: 'crimeaSevastapolPresence',
        type: 'radio-group',
        label: 'Any current or planned business in Crimea/Sevastopol Regions?',
        required: true,
        options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }, { label: "Don't Know", value: 'unknown' }]
      },
      { id: 'russianEnergyPresence', type: 'radio', label: 'Any current or planned exposure to Russia in the energy/oil/gas sector, the military, or defense?', required: true, options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }, { label: "Don't Know", value: 'unknown' }] },
      // { id: 'politicallyExposed', type: 'radio', label: 'Are any persons PEP (Politically Exposed Person)?', required: true, options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }, { label: "Don't Know", value: 'unknown' }] },
      { id: 'criminalHistory', type: 'radio', label: 'Any history of financial crimes?', required: true, options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }, { label: "Don't Know", value: 'unknown' }] },
    ],
    customComponent: 'amlCompliance'
  },
  {
    id: 'company-info',
    title: 'Company Information',
    shortTitle: '3. Company Info',
    description: 'Business details, capital, officers, and members.',
    fields: [
      // Fields for CompanyInfoStep
      {
        id: 'selectedIndustry',
        type: 'checkbox-group',
        label: 'Industry Type',
        required: true,
        options: [
          { value: 'trade', label: 'Trade' },
          { value: 'retail', label: 'Retail/Wholesale Distribution' },
          { value: 'consulting', label: 'Consulting' },
          { value: 'manufacturing', label: 'Manufacturing' },
          { value: 'finance', label: 'Finance, Investment, and Advisory Services' },
          { value: 'ecommerce', label: 'Online Services (E-commerce)' },
          { value: 'proxy', label: 'Online Direct Purchase/Shipping Proxy' },
          { value: 'it', label: 'IT and Software Development' },
          { value: 'crypto', label: 'Cryptocurrency-related' },
          { value: 'other', label: 'Other' }
        ],
        colSpan: 2
      },
      { id: 'productDescription', type: 'textarea', label: 'Description of Goods/Services', required: true, colSpan: 2, rows: 4 },
      {
        id: 'establishmentPurpose',
        type: 'checkbox-group',
        label: 'Purpose of Establishment',
        required: true,
        options: [
          { value: 'expansion', label: 'Business expansion into the Americas and Europe' },
          { value: 'asset', label: 'Asset management' },
          { value: 'holding', label: 'Holding company' },
          { value: 'investor', label: 'Investors suggestion' },
          { value: 'international', label: 'International transactions' },
          { value: 'diversification', label: 'Business diversification' },
          { value: 'tax', label: 'Tax efficiency' },
          { value: 'capital-gain', label: 'No Capital Gain Tax' },
          { value: 'other', label: 'Other' }
        ],
        colSpan: 2
      },
      { id: 'listCountry', type: 'text', label: 'Countries for Business Transactions', required: true, tooltip: 'Avoid vague terms like "Worldwide".' },
      {
        id: 'sourceFunding',
        type: 'checkbox-group',
        label: 'Source of Funds',
        required: true,
        options: [
          { value: 'earned', label: 'Earned Income' },
          { value: 'savings', label: 'Savings' },
          { value: 'investment', label: 'Investment Income' },
          { value: 'loan', label: 'Loan' },
          { value: 'sale', label: 'Company Sale' },
          { value: 'business', label: 'Business Income' },
          { value: 'inheritance', label: 'Inheritance' },
          { value: 'other', label: 'Other' },
        ],
        colSpan: 2
      },
      {
        id: 'businessAddress',
        type: 'radio-group',
        label: 'Registered Business Address',
        required: true,
        options: [
          { value: 'mirasia', label: "Use MirAsia's Registration Address Service" },
          { value: 'own', label: 'Have a separate address within Costa Rica' },
          { value: 'other', label: 'Other' }
        ]
      },
      {
        id: 'currency',
        type: 'select',
        label: 'Currency',
        required: true,
        options: [
          { value: 'USD', label: 'USD - US Dollar' },
          { value: 'EUR', label: 'EUR - Euro' },
          { value: 'CRC', label: 'CRC - Costa Rican Colón' }
        ],
        defaultValue: 'USD'
      },
      {
        id: 'capAmount',
        type: 'dropdown-select',
        label: 'Capital Amount',
        required: true,
        options: [
          { value: '10000', label: '10,000' },
          { value: '50000', label: '50,000' },
          { value: '100000', label: '100,000' },
          { value: 'other', label: 'Other' }
        ]
      },
      {
        id: 'shareCount',
        type: 'dropdown-select',
        label: 'Number of Shares',
        required: true,
        options: [
          { value: '1', label: '1' },
          { value: '10', label: '10' },
          { value: '100', label: '100' },
          { value: '1000', label: '1,000' },
          { value: '10000', label: '10,000' },
          { value: '100000', label: '100,000' },
          { value: 'other', label: 'Other' }
        ]
      },
      {
        id: 'parValue', type: 'derived', label: 'Par Value per Share', compute: (form) => {
          const cap = Number(form.capAmount === 'other' ? form.capOther : form.capAmount) || 0;
          const shares = Number(form.shareCount === 'other' ? form.shareOther : form.shareCount) || 1;
          const val = shares > 0 ? (cap / shares).toFixed(2) : '0.00';
          return `${form.currency || 'USD'} ${val}`;
        }
      }
    ],
    customComponent: 'companyInfo'
  },
  {
    id: 'accounting-taxation',
    title: 'Accounting & Taxation',
    shortTitle: '4. Accounting',
    description: 'Accounting data storage and tax information.',
    fields: [
      { id: 'accountingAddress', type: 'textarea', label: 'Accounting Data Storage Address', required: true, rows: 3, helpText: 'Office or residential address.' },
      {
        id: 'xero',
        type: 'radio',
        label: 'Do you use Xero or other accounting software?',
        options: [
          { value: 'Yes', label: 'Yes' },
          { value: 'No', label: 'No' },
          { value: 'Recommendation required', label: 'Recommendation required' },
          { value: 'Other', label: 'Other' }
        ]
      },
      { id: 'softNote', type: 'text', label: 'Additional Notes' }
    ],
    customComponent: 'accountingTaxation'
  },
  {
    id: 'service-agreement',
    title: 'Service Agreement',
    shortTitle: '5. Agreement',
    description: 'Review the service agreement terms.',
    fields: [],
    customComponent: 'serviceAgreement'
  },
  {
    id: 'invoice',
    title: 'Invoice',
    shortTitle: '6. Invoice',
    description: 'Review your invoice and service fees.',
    fields: [
      {
        id: 'directorNominee',
        type: 'checkbox',
        label: '',
        options: [{ label: 'Director Nominee Service (+$2,500)', value: 'true' }]
      },
      {
        id: 'shareholderNominee',
        type: 'checkbox',
        label: '',
        options: [{ label: 'Shareholder Nominee Service (+$2,500)', value: 'true' }]
      }
    ],
    customComponent: 'invoice'
  },
  {
    id: 'payment',
    title: 'Payment',
    shortTitle: '7. Payment',
    description: 'Select your preferred payment method.',
    fields: [],
    customComponent: 'payment'
  },
  {
    id: 'incorporation',
    title: 'Incorporation',
    shortTitle: '8. Incorporation',
    description: 'Final agreement and declaration.',
    fields: [],
    customComponent: 'incorporation'
  }
];

export type FormData = Record<string, string | string[] | boolean | number | undefined | object | object[]> & {
  // Payment & Service Fields
  paymentIntentId?: string;
  paymentIntentCurrency?: string;
  paymentCurrency?: string;
  exchangeRateUsed?: number;
  originalAmountUsd?: number;
  convertedAmountHkd?: number;
  stripeReceiptUrl?: string;
  stripeLastStatus?: string;
  stripeAmountCents?: number;
  stripeCurrency?: string;
  payMethod?: string; // 'card' | 'bank' | 'other'
  bankRef?: string;
  uploadReceiptUrl?: string;
  expiresAt?: string;
  paymentStatus?: string;

  // Nominee Services
  directorNominee?: boolean;
  shareholderNominee?: boolean;
  emailOtpVerified?: boolean;
  mobileOtpVerified?: boolean;
  userId?: string;
  users?: { userId: string; role: string }[];
  _id?: string;
};

export const createOrUpdateCRMember = async (data: any) => {
  try {
    const response = await api.post('/incorporation/createCrMember', data);
    return response.data;
  } catch (error) {
    console.error("Error creating/updating Costa Rica Member data:", error);
    throw error;
  }
};

export const getCRMember = async (id: any) => {
  try {
    const response = await api.get(`/incorporation/getCrMember/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error creating/updating Costa Rica Member data:", error);
    throw error;
  }
};

export const delCRMember = async (id: any) => {
  try {
    const response = await api.delete(`/incorporation/delCrMember/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error creating/updating Costa Rica Member data:", error);
    throw error;
  }
};