/* eslint-disable @typescript-eslint/no-explicit-any */
import { finYearOptions } from "@/pages/Company/NewHKForm/hkIncorpo";
import type { McapConfig, McapField } from "./types";

type AuServiceItem = {
  id: string;
  label: string;
  amount: number;
  original: number;
  mandatory: boolean;
  kind?: "government" | "service" | "optional" | "other";
  info?: string;
};

const YES_NO_UNKNOWN = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
  { label: "I don't know", value: "unknown" },
];

const APPLICANT_RELATIONSHIP_OPTIONS = [
  { label: "Director", value: "director" },
  { label: "Shareholder", value: "shareholder" },
  { label: "Authorized representative", value: "authorized" },
  { label: "Professional advisor", value: "professional" },
  { label: "Other", value: "other" },
];

const INDUSTRY_OPTIONS = [
  { label: "Technology / software / AI", value: "technology" },
  { label: "Consulting and professional services", value: "consulting" },
  { label: "Trading / import / export", value: "trading" },
  { label: "E-commerce", value: "ecommerce" },
  { label: "Investment / holding activities", value: "investment" },
  { label: "Manufacturing", value: "manufacturing" },
  { label: "Financial services / fintech", value: "fintech" },
  { label: "Other", value: "other" },
];

const PURPOSE_OPTIONS = [
  { label: "Expand into Australia market", value: "market_expansion" },
  { label: "Set up regional operations", value: "regional_operations" },
  { label: "Hold and manage assets/investments", value: "asset_holding" },
  { label: "Serve Australian customers locally", value: "local_customer_support" },
  { label: "Investor / partner requirement", value: "investor_requirement" },
  { label: "Other", value: "other" },
];

const AU_PRICING = {
  baseIncorporation: 2000,
  nomineeDirectorAnnual: 5000,
  registeredAddressAnnual: 700,
  expressService: 550,
  emiAccountAssistance: 600,
} as const;

const getSelectedServiceIds = (data: Record<string, any>) => {
  const ids = new Set<string>();
  const optionalFeeIds = Array.isArray(data?.optionalFeeIds) ? data.optionalFeeIds : [];
  const serviceItemsSelected = Array.isArray(data?.serviceItemsSelected) ? data.serviceItemsSelected : [];
  optionalFeeIds.forEach((id: any) => ids.add(String(id)));
  serviceItemsSelected.forEach((id: any) => ids.add(String(id)));
  return ids;
};

const isYes = (value: any, defaultValue = false) => {
  if (value === undefined || value === null || value === "") return defaultValue;
  return String(value).toLowerCase() === "yes";
};

export const buildAuServiceItems = (data: Record<string, any>): AuServiceItem[] => {
  const hasResidentDirector = isYes(data?.auHasResidentDirector, true);
  const hasOwnRegisteredAddress = isYes(data?.auHasOwnRegisteredAddress, true);
  const emiViaPartnerChannel = isYes(data?.auEmiViaPartnerChannel, false);

  const items: AuServiceItem[] = [
    {
      id: "au_base_incorporation",
      label: "Australian company incorporation (document preparation, electronic filing, standard corporate documents)",
      amount: AU_PRICING.baseIncorporation,
      original: AU_PRICING.baseIncorporation,
      mandatory: true,
      kind: "service",
      info: "Base incorporation fee. All amounts are exclusive of tax.",
    },
    {
      id: "au_nominee_director_service",
      label: "Nominee Director Service (annual)",
      amount: AU_PRICING.nomineeDirectorAnnual,
      original: AU_PRICING.nomineeDirectorAnnual,
      mandatory: !hasResidentDirector,
      kind: "service",
      info: "Mandatory when you do not have at least one Australian resident director. Includes mandatory KYC, contracts, and indemnities.",
    },
    {
      id: "au_registered_address_service",
      label: "Registered address service (annual)",
      amount: AU_PRICING.registeredAddressAnnual,
      original: AU_PRICING.registeredAddressAnnual,
      mandatory: !hasOwnRegisteredAddress,
      kind: "service",
      info: "Registered address for filing purposes only. Not a physical office space. P.O. Box is not accepted.",
    },
    {
      id: "au_express_service",
      label: "Express service",
      amount: AU_PRICING.expressService,
      original: AU_PRICING.expressService,
      mandatory: false,
      kind: "optional",
      info: "Targets ABN issuance within 4 business days. Typical processing uses an Australian resident-only structure first, then adds non-resident shareholders/directors.",
    },
    {
      id: "au_emi_account_assistance",
      label: "EMI account opening assistance",
      amount: emiViaPartnerChannel ? 0 : AU_PRICING.emiAccountAssistance,
      original: emiViaPartnerChannel ? 0 : AU_PRICING.emiAccountAssistance,
      mandatory: false,
      kind: "optional",
      info: emiViaPartnerChannel
        ? "Included at no additional fee when opened via approved partner channel."
        : "May be free when opened via approved partner channel.",
    },
  ];

  return items;
};

export const computeAuFees = (data: Record<string, any>) => {
  const selectedServiceIds = getSelectedServiceIds(data);
  const allItems = buildAuServiceItems(data);

  const selectedItems = allItems
    .filter((item) => item.mandatory || selectedServiceIds.has(item.id))
    .map((item) => ({
      id: item.id,
      label: item.label,
      amount: item.amount,
      kind: item.kind || (item.mandatory ? "service" : "optional"),
      original: item.original,
      ...(item.info ? { info: item.info } : {}),
    }));

  const total = selectedItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const paymentCurrency = String(data?.paymentCurrency || data?.currency || "AUD").toUpperCase();
  const cardFeePct = paymentCurrency === "USD" ? 0.06 : 0.04;
  const payMethod = String(data?.payMethod || "").toLowerCase();
  const cardFeeSurcharge = payMethod === "card" ? Number((total * cardFeePct).toFixed(2)) : 0;
  const grandTotal = Number((total + cardFeeSurcharge).toFixed(2));

  return {
    currency: paymentCurrency,
    items: selectedItems,
    government: 0,
    service: total,
    total,
    cardFeePct,
    cardFeeSurcharge,
    grandTotal,
    note:
      "All amounts are exclusive of tax. Corporate tax is generally 30% (small business rate of 25% may apply when eligible).",
  };
};

const buildApplicantFields = (): McapField[] => [
  { type: "text", name: "applicantName", label: "Applicant name", required: true, colSpan: 2 },
  { type: "email", name: "applicantEmail", label: "Applicant email", required: true, colSpan: 2 },
  { type: "text", name: "applicantPhone", label: "Applicant phone", required: true, colSpan: 2 },
  { type: "text", name: "companyName1", label: "Proposed company name (1st choice)", required: true, colSpan: 2 },
  { type: "text", name: "companyName2", label: "Proposed company name (2nd choice)", colSpan: 2 },
  { type: "text", name: "companyName3", label: "Proposed company name (3rd choice)", colSpan: 2 },
  {
    type: "checkbox-group",
    name: "applicantRelationshipType",
    label: "Relationship to the company to be incorporated",
    required: true,
    options: APPLICANT_RELATIONSHIP_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "applicantRelationshipOther",
    label: "Other relationship details",
    condition: (f) => Array.isArray(f.applicantRelationshipType) && f.applicantRelationshipType.includes("other"),
    required: true,
    colSpan: 2,
  },
  {
    type: "select",
    name: "sns",
    label: "Preferred messenger",
    options: [
      { label: "WhatsApp", value: "WhatsApp" },
      { label: "WeChat", value: "WeChat" },
      { label: "Line", value: "Line" },
      { label: "KakaoTalk", value: "KakaoTalk" },
      { label: "Telegram", value: "Telegram" },
    ],
  },
  {
    type: "text",
    name: "snsId",
    label: "Messenger ID",
    condition: (f) => !!f.sns,
  },
];

const buildComplianceFields = (): McapField[] => [
  {
    type: "radio-group",
    name: "annualRenewalConsent",
    label: "Do you acknowledge annual renewal, accounting, and tax obligations after incorporation?",
    required: true,
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
      { label: "I will self-handle after setup", value: "self_handle" },
      { label: "I will not proceed if fixed annual costs apply", value: "no_if_fixed_cost" },
      { label: "Advice required before proceeding", value: "advice_required" },
    ],
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "legalAndEthicalConcern",
    label: "Does the incorporation purpose involve legal/ethical concerns (money laundering, fraud, sanctions evasion, etc.)?",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "sanctionsExposureDeclaration",
    label: "Are any applicants or related parties connected to sanctioned countries, entities, or individuals?",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "corporateTaxAcknowledgement",
    label: "Do you acknowledge Australian corporate tax is generally 30% (25% may apply for qualifying small businesses)?",
    required: true,
    options: [
      { label: "Yes", value: "yes" },
      { label: "Need tax advice", value: "need_advice" },
      { label: "No", value: "no" },
    ],
    colSpan: 2,
  },
];

const buildCompanyFields = (): McapField[] => [
  {
    type: "info",
    label: "Australia Incorporation Requirements",
    content:
      "At least one Australian resident director is required by law. A physical Australian registered address is required (P.O. Box not accepted). Estimated timeline: Standard 2-3 months, Express 1-2 weeks (target ABN within 4 business days). Financial institution onboarding timelines are separate.",
    colSpan: 2,
  },
  {
    type: "checkbox-group",
    name: "selectedIndustry",
    label: "Select industry (multiple choices allowed)",
    required: true,
    options: INDUSTRY_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "selectedIndustryOther",
    label: "Other industry details",
    condition: (f) => Array.isArray(f.selectedIndustry) && f.selectedIndustry.includes("other"),
    required: true,
    colSpan: 2,
  },
  {
    type: "textarea",
    name: "businessDescription",
    label: "Describe your business activities",
    required: true,
    rows: 3,
    colSpan: 2,
  },
  {
    type: "text",
    name: "website",
    label: "Website address (if available)",
    placeholder: "https://",
    colSpan: 2,
  },
  {
    type: "checkbox-group",
    name: "establishmentPurpose",
    label: "Purpose of establishing the Australian company",
    required: true,
    options: PURPOSE_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "establishmentPurposeOther",
    label: "Other purpose details",
    condition: (f) => Array.isArray(f.establishmentPurpose) && f.establishmentPurpose.includes("other"),
    required: true,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "auHasResidentDirector",
    label: "Do you currently have at least one Australian resident director?",
    required: true,
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
    ],
    colSpan: 2,
  },
  {
    type: "checkbox",
    name: "auNomineeDirectorAcknowledgment",
    label: "I understand Nominee Director Service (A$5,000/year) is mandatory if I do not have an Australian resident director.",
    condition: (f) => f.auHasResidentDirector === "no",
    required: true,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "auHasOwnRegisteredAddress",
    label: "Do you have your own physical Australian registered address?",
    required: true,
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
    ],
    colSpan: 2,
  },
  {
    type: "textarea",
    name: "auRegisteredAddressDetails",
    label: "Australian registered address details",
    condition: (f) => f.auHasOwnRegisteredAddress === "yes",
    required: true,
    rows: 2,
    colSpan: 2,
  },
  {
    type: "checkbox",
    name: "auNoPoBoxAcknowledgement",
    label: "I confirm this registered address is a physical address and not a P.O. Box.",
    condition: (f) => f.auHasOwnRegisteredAddress === "yes",
    required: true,
    colSpan: 2,
  },
  {
    type: "select",
    name: "capitalCurrency",
    label: "Capital currency",
    required: true,
    options: [
      { label: "AUD", value: "AUD" },
      { label: "USD", value: "USD" },
      { label: "Other", value: "other" },
    ],
  },
  {
    type: "text",
    name: "capitalCurrencyOther",
    label: "Capital currency (other)",
    condition: (f) => f.capitalCurrency === "other",
    required: true,
  },
  {
    type: "select",
    name: "capitalAmount",
    label: "Total capital to be paid in",
    required: true,
    options: [
      { label: "1", value: "1" },
      { label: "100", value: "100" },
      { label: "1,000", value: "1000" },
      { label: "10,000", value: "10000" },
      { label: "100,000", value: "100000" },
      { label: "Other", value: "other" },
    ],
  },
  {
    type: "number",
    name: "capitalAmountOther",
    label: "Capital amount (other)",
    condition: (f) => f.capitalAmount === "other",
    required: true,
  },
  {
    type: "select",
    name: "shareCount",
    label: "Total number of shares",
    required: true,
    options: [
      { label: "1", value: "1" },
      { label: "100", value: "100" },
      { label: "1,000", value: "1000" },
      { label: "10,000", value: "10000" },
      { label: "100,000", value: "100000" },
      { label: "Other", value: "other" },
    ],
  },
  {
    type: "number",
    name: "shareCountOther",
    label: "Share count (other)",
    condition: (f) => f.shareCount === "other",
    required: true,
  },
  {
    type: "derived",
    name: "parValuePerShare",
    label: "Par value per share",
    compute: (f) => {
      const currency = f.capitalCurrency === "other" ? (String(f.capitalCurrencyOther || "AUD").toUpperCase()) : (f.capitalCurrency || "AUD");
      const total = f.capitalAmount === "other" ? Number(f.capitalAmountOther || 0) : Number(f.capitalAmount || 0);
      const shares = f.shareCount === "other" ? Number(f.shareCountOther || 0) : Number(f.shareCount || 0);
      if (!total || !shares) return `${currency} 0.00`;
      return `${currency} ${(total / shares).toFixed(2)}`;
    },
  },
];

const buildAccountingFields = (): McapField[] => [
  {
    type: "select",
    name: "finYrEnd",
    label: "Financial year end",
    options: finYearOptions,
  },
  {
    type: "text",
    name: "finYrEndOther",
    label: "Other financial year end",
    condition: (f) => f.finYrEnd === "Other",
  },
  {
    type: "radio-group",
    name: "bookKeepingCycle",
    label: "Bookkeeping cycle",
    options: [
      { label: "Monthly", value: "monthly" },
      { label: "Quarterly", value: "quarterly" },
      { label: "Half-yearly", value: "half_yearly" },
      { label: "Annually", value: "annually" },
    ],
    colSpan: 2,
  },
  {
    type: "textarea",
    name: "accountingNotes",
    label: "Accounting and tax notes",
    rows: 3,
    colSpan: 2,
  },
];

const buildServiceFields = (): McapField[] => [
  {
    type: "info",
    label: "Australia Pricing Summary",
    content:
      "Base incorporation fee: A$2,000. Estimated timeline: Standard 2-3 months, Express 1-2 weeks (target ABN within 4 business days). All amounts are exclusive of tax.",
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "auEmiViaPartnerChannel",
    label: "Will EMI account opening be processed through our partner channel?",
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
      { label: "Not sure yet", value: "unknown" },
    ],
    colSpan: 2,
  },
];

export const AU_FULL_CONFIG: McapConfig = {
  id: "au-full",
  countryCode: "AU",
  countryName: "Australia",
  currency: "AUD",
  title: "Australia Company Incorporation",
  confirmationDetails: {
    title: "Australia Incorporation Request Submitted",
    message:
      "We have received your Australia incorporation request. Standard processing is typically 2-3 months. Express processing is typically 1-2 weeks, with ABN target within 4 business days. Financial institution onboarding timelines are separate.",
    steps: [
      {
        title: "Compliance Review",
        description: "KYC/CDD and sanctions review for all proposed parties and control persons.",
      },
      {
        title: "Structure Validation",
        description: "Director residency and registered address requirements are verified before filing.",
      },
      {
        title: "Incorporation and ABN Processing",
        description: "We file incorporation documents and proceed with ABN processing based on the selected service level.",
      },
      {
        title: "Post-Incorporation Support",
        description: "Optional EMI assistance and onboarding support are coordinated where selected.",
      },
    ],
  },
  steps: [
    {
      id: "applicant",
      title: "Applicant Information",
      fields: buildApplicantFields(),
    },
    {
      id: "compliance",
      title: "Compliance",
      description: "Provide compliance and annual-obligation confirmations before filing.",
      fields: buildComplianceFields(),
    },
    {
      id: "company",
      title: "Company Information",
      fields: buildCompanyFields(),
    },
    {
      id: "parties",
      title: "Parties and Invites",
      description: "Invite all shareholders/directors and designate at least one contact person.",
      widget: "PartiesManager",
      minParties: 1,
      requireDcp: true,
      requirePartyInvite: true,
      partyFields: [
        {
          key: "shareType",
          label: "Share type",
          type: "radio-group",
          options: [
            { label: "Ordinary shares", value: "ordinary" },
            { label: "Preference shares", value: "preferred" },
          ],
          roles: ["shareholder"],
          storage: "root",
        },
        {
          key: "auIsDirector",
          label: "Director appointment",
          type: "select",
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
          storage: "details",
        },
        {
          key: "auIsResidentDirector",
          label: "Australian resident director",
          type: "select",
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
          storage: "details",
        },
      ],
      partyCoverageRules: [
        {
          key: "auIsDirector",
          storage: "details",
          requiredValues: ["yes"],
          label: "Director coverage",
          valueLabels: {
            yes: "At least one appointed director",
          },
        },
      ],
    },
    {
      id: "accounting",
      title: "Accounting and Taxation",
      fields: buildAccountingFields(),
    },
    {
      id: "services",
      title: "Service Selection",
      description: "Select services and review tax-exclusive pricing in AUD.",
      widget: "ServiceSelectionWidget",
      fields: buildServiceFields(),
      serviceItems: (data) => buildAuServiceItems(data),
      supportedCurrencies: ["AUD"],
      computeFees: (data) => computeAuFees(data),
    },
    {
      id: "invoice",
      title: "Invoice Preview",
      widget: "InvoiceWidget",
      computeFees: (data) => computeAuFees(data),
    },
    {
      id: "payment",
      title: "Payment",
      widget: "PaymentWidget",
      supportedCurrencies: ["AUD"],
      computeFees: (data) => computeAuFees(data),
    },
  ],
};
