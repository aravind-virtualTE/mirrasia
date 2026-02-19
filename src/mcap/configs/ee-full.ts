/* eslint-disable @typescript-eslint/no-explicit-any */
import type { McapConfig, McapFeeItem, McapField } from "./types";

type EeServiceItem = {
  id: string;
  label: string;
  amount: number;
  original: number;
  mandatory: boolean;
  kind?: "government" | "service" | "optional" | "other";
  info?: string;
};

const EE_PRICING = {
  incorporation_professional: 700,
  state_fee: 190,
  business_address_1y: 300,
  contact_person_1y: 400,
  management_followup_1y: 400,
  poa_addon: 150,
  emi_list: 0,
} as const;

const YES_NO_UNKNOWN = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
  { label: "Do not know", value: "unknown" },
];

const RELATIONSHIP_OPTIONS = [
  { label: "Officer", value: "officer" },
  { label: "Authorized Proxy", value: "authorizedProxy" },
  { label: "Major Shareholder", value: "majorShareholder" },
  { label: "Professional Advisor", value: "professionalAdvisor" },
  { label: "Other", value: "other" },
];

const REQUESTED_SERVICE_OPTIONS = [
  {
    label: "Estonia OÜ incorporation with initial maintenance",
    value: "estonia_llc_with_initial_maintenance",
  },
  { label: "EMI list", value: "emi_list" },
  { label: "EMI account opening", value: "emi_account_opening" },
  { label: "Bank account opening", value: "bank_account_opening" },
  { label: "Legal opinion (Estonia)", value: "legal_opinion_estonia" },
  { label: "Legal opinion (domestic listing)", value: "legal_opinion_domestic_listing" },
  { label: "Legal opinion (other country)", value: "legal_opinion_other_country" },
  { label: "Business consulting", value: "business_consulting" },
  { label: "Other", value: "other" },
];

const INDUSTRY_OPTIONS = [
  { label: "Crypto-related", value: "crypto_related" },
  { label: "IT / Blockchain software", value: "it_blockchain_software" },
  { label: "Crypto investment", value: "crypto_investment" },
  { label: "Crypto games", value: "crypto_games" },
  { label: "Forex trading", value: "forex_trading" },
  { label: "Finance / Investment consulting", value: "finance_investment_consulting" },
  { label: "Trade", value: "trade" },
  { label: "Wholesale / Retail", value: "wholesale_retail" },
  { label: "Consulting", value: "consulting" },
  { label: "Manufacturing", value: "manufacturing" },
  { label: "E-commerce", value: "ecommerce" },
  { label: "Online direct purchase", value: "online_direct_purchase" },
  { label: "Other", value: "other" },
];

const PURPOSE_OPTIONS = [
  { label: "Business diversification", value: "business_diversification" },
  { label: "Advisor or partner suggestion", value: "advisor_or_partner_suggestion" },
  { label: "International expansion", value: "international_expansion" },
  { label: "Asset management", value: "asset_management" },
  { label: "Holding company", value: "holding_company" },
  {
    label: "Financial policy advantage",
    value: "free_financial_policy_advantage",
  },
  { label: "Low-tax transaction growth", value: "low_tax_transaction_growth" },
  { label: "No capital gains tax", value: "no_capital_gains_tax" },
  { label: "Other", value: "other" },
];

const QUOTE_ONLY_OPTIONS = [
  { label: "EMI account opening advisory", value: "emi_account_opening" },
  { label: "Bank account opening advisory", value: "bank_account_opening" },
  { label: "Legal opinion (Estonia)", value: "legal_opinion_estonia" },
  { label: "Legal opinion (domestic listing)", value: "legal_opinion_domestic_listing" },
  { label: "Legal opinion (other country)", value: "legal_opinion_other_country" },
  { label: "Business consulting", value: "business_consulting" },
  { label: "Other quote request", value: "other" },
];

const getSelectedServiceIds = (data: Record<string, any>) => {
  const ids = new Set<string>();
  const optionalFeeIds = Array.isArray(data?.optionalFeeIds) ? data.optionalFeeIds : [];
  const serviceItemsSelected = Array.isArray(data?.serviceItemsSelected) ? data.serviceItemsSelected : [];
  optionalFeeIds.forEach((id: any) => ids.add(String(id)));
  serviceItemsSelected.forEach((id: any) => ids.add(String(id)));
  return ids;
};

const getContactPersonMode = (data: Record<string, any>) =>
  String(data?.contactPersonMode || "mirr_provided");

export const buildEeServiceItems = (data: Record<string, any>): EeServiceItem[] => {
  const contactPersonMode = getContactPersonMode(data);

  const items: EeServiceItem[] = [
    {
      id: "ee_incorporation_professional",
      label: "Estonia OÜ Incorporation Service",
      amount: EE_PRICING.incorporation_professional,
      original: EE_PRICING.incorporation_professional,
      mandatory: true,
      kind: "service",
      info: "Incorporation preparation, document check, and filing support.",
    },
    {
      id: "ee_state_fee",
      label: "Estonian Government State Fee",
      amount: EE_PRICING.state_fee,
      original: EE_PRICING.state_fee,
      mandatory: true,
      kind: "government",
      info: "Statutory filing fee.",
    },
    {
      id: "ee_business_address_1y",
      label: "Estonia Business Address Service (1 year)",
      amount: EE_PRICING.business_address_1y,
      original: EE_PRICING.business_address_1y,
      mandatory: true,
      kind: "service",
      info: "Mandatory annual local business address service.",
    },
    {
      id: "ee_management_followup_1y",
      label: "Management and Case Follow-up",
      amount: EE_PRICING.management_followup_1y,
      original: EE_PRICING.management_followup_1y,
      mandatory: true,
      kind: "service",
      info: "Establishment advisory and case handling support.",
    },
  ];

  if (contactPersonMode === "mirr_provided") {
    items.push({
      id: "ee_contact_person_1y",
      label: "Estonian Contact Person Service (1 person / 1 year)",
      amount: EE_PRICING.contact_person_1y,
      original: EE_PRICING.contact_person_1y,
      mandatory: true,
      kind: "service",
      info: "Can be removed if designated contact person arrangement is client-provided.",
    });
  }

  items.push(
    {
      id: "ee_poa_addon",
      label: "Power of Attorney (POA)",
      amount: EE_PRICING.poa_addon,
      original: EE_PRICING.poa_addon,
      mandatory: false,
      kind: "optional",
    },
    {
      id: "ee_emi_list",
      label: "EMI List",
      amount: EE_PRICING.emi_list,
      original: EE_PRICING.emi_list,
      mandatory: false,
      kind: "optional",
      info: "Informational service list.",
    }
  );

  return items;
};

export const computeEeFees = (data: Record<string, any>) => {
  const selectedServiceIds = getSelectedServiceIds(data);
  const allItems = buildEeServiceItems(data);

  const selectedItemsUsd: McapFeeItem[] = allItems
    .filter((item) => item.mandatory || selectedServiceIds.has(item.id))
    .map((item) => ({
      id: item.id,
      label: item.label,
      amount: item.amount,
      kind: item.kind || "service",
      ...(item.original !== undefined ? { original: item.original } : {}),
      ...(item.info ? { info: item.info } : {}),
    }));

  const totalUsd = selectedItemsUsd.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const paymentCurrency = String(data?.paymentCurrency || data?.currency || "USD").toUpperCase();
  const exchangeRateUsedRaw = Number(data?.computedFees?.exchangeRateUsed || 0);
  const shouldConvertToHkd =
    paymentCurrency === "HKD" && Number.isFinite(exchangeRateUsedRaw) && exchangeRateUsedRaw > 0;

  const selectedItems = shouldConvertToHkd
    ? selectedItemsUsd.map((item: any) => ({
      ...item,
      amount: Number((Number(item.amount || 0) * exchangeRateUsedRaw).toFixed(2)),
      ...(item.original !== undefined
        ? { original: Number((Number(item.original || 0) * exchangeRateUsedRaw).toFixed(2)) }
        : {}),
    }))
    : selectedItemsUsd;

  const total = shouldConvertToHkd ? Number((totalUsd * exchangeRateUsedRaw).toFixed(2)) : totalUsd;
  const government = selectedItems
    .filter((item: any) => item.kind === "government")
    .reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
  const service = Number((total - government).toFixed(2));

  const cardFeePct = paymentCurrency === "HKD" ? 0.04 : 0.06;
  const payMethod = String(data?.payMethod || "").toLowerCase();
  const cardFeeSurcharge = payMethod === "card" ? Number((total * cardFeePct).toFixed(2)) : 0;
  const grandTotal = Number((total + cardFeeSurcharge).toFixed(2));

  return {
    currency: paymentCurrency === "HKD" ? "HKD" : "USD",
    items: selectedItems,
    government,
    service,
    total,
    cardFeePct,
    cardFeeSurcharge,
    grandTotal,
    ...(shouldConvertToHkd ? { exchangeRateUsed: exchangeRateUsedRaw, originalAmountUsd: totalUsd } : {}),
    note:
      "Quote-only service requests are tracked and excluded from invoice totals until priced. Pricing is sourced from EUR quote structure and currently billed via USD/HKD rails.",
  };
};

const buildApplicantFields = (): McapField[] => [
  {
    type: "info",
    label: "Application Notice",
    content:
      "This application should be completed by an officer or authorized representative. Please provide accurate information for compliance and filing review.",
    colSpan: 2,
  },
  {
    type: "text",
    name: "authorName",
    label: "Author Name",
    required: true,
    colSpan: 2,
  },
  {
    type: "checkbox-group",
    name: "relationshipToEstonianCorporation",
    label: "Relationship to Estonian Corporation",
    required: true,
    options: RELATIONSHIP_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "relationshipToEstonianCorporationOther",
    label: "Other relationship details",
    condition: (f) =>
      Array.isArray(f.relationshipToEstonianCorporation) &&
      f.relationshipToEstonianCorporation.includes("other"),
    required: true,
    colSpan: 2,
  },
  {
    type: "text",
    name: "phoneNumber",
    label: "Phone Number",
    required: true,
    colSpan: 2,
  },
  {
    type: "email",
    name: "email",
    label: "Email",
    required: true,
    colSpan: 2,
  },
  {
    type: "text",
    name: "snsId",
    label: "SNS / Messaging ID",
    colSpan: 2,
  },
];

const buildComplianceFields = (): McapField[] => [
  {
    type: "radio-group",
    name: "legalOrEthicalIssuesConcern",
    label: "Any legal or ethical concerns related to the intended business?",
    required: true,
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
      { label: "Do not know", value: "unknown" },
      { label: "Other", value: "other" },
    ],
    colSpan: 2,
  },
  {
    type: "text",
    name: "legalOrEthicalIssuesConcernOther",
    label: "Other legal or ethical concern details",
    condition: (f) => f.legalOrEthicalIssuesConcern === "other",
    required: true,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "annualRenewalAgreement",
    label: "Do you agree to annual renewal obligations and recurring compliance costs?",
    required: true,
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
      { label: "Can be handled internally", value: "self_handle" },
      { label: "Will not proceed if fixed annual costs apply", value: "no_if_fixed_cost" },
      { label: "Need advisory before confirming", value: "advice_required" },
    ],
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "businessInSanctionedCountries",
    label: "Any business in sanctioned countries or regions?",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "personsResidingInSanctionedCountries",
    label: "Any involved persons residing in sanctioned countries or regions?",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "ownershipBySanctionedPersons",
    label: "Any ownership/control by sanctioned persons or entities?",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "crimeaOrSevastopolActivity",
    label: "Any current or planned activity in Crimea or Sevastopol?",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "oilGasMilitaryEnergySectorActivity",
    label: "Any current or planned activity in oil, gas, military, or energy sectors?",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
];

const buildCompanyFields = (): McapField[] => [
  {
    type: "checkbox-group",
    name: "industries",
    label: "Industry selection",
    required: true,
    options: INDUSTRY_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "otherIndustryDetails",
    label: "Other industry details",
    condition: (f) => Array.isArray(f.industries) && f.industries.includes("other"),
    required: true,
    colSpan: 2,
  },
  {
    type: "textarea",
    name: "businessDescription",
    label: "Business description",
    required: true,
    rows: 4,
    colSpan: 2,
  },
  {
    type: "text",
    name: "website",
    label: "Website",
    placeholder: "https://",
    colSpan: 2,
  },
  {
    type: "checkbox-group",
    name: "purposeOfEstablishment",
    label: "Purpose of establishment",
    required: true,
    options: PURPOSE_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "otherPurposeDetails",
    label: "Other purpose details",
    condition: (f) => Array.isArray(f.purposeOfEstablishment) && f.purposeOfEstablishment.includes("other"),
    required: true,
    colSpan: 2,
  },
  {
    type: "text",
    name: "proposedCompanyName1",
    label: "Proposed company name (priority 1)",
    required: true,
    colSpan: 2,
  },
  {
    type: "text",
    name: "proposedCompanyName2",
    label: "Proposed company name (priority 2)",
    required: true,
    colSpan: 2,
  },
  {
    type: "text",
    name: "proposedCompanyName3",
    label: "Proposed company name (priority 3)",
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "totalCapitalEUR",
    label: "Total capital (EUR)",
    required: true,
    defaultValue: "1",
    options: [
      { label: "EUR 1", value: "1" },
      { label: "EUR 2,500", value: "2500" },
      { label: "EUR 25,000", value: "25000" },
      { label: "Other", value: "other" },
    ],
    colSpan: 2,
  },
  {
    type: "number",
    name: "totalCapitalEUROther",
    label: "Total capital (other amount in EUR)",
    condition: (f) => f.totalCapitalEUR === "other",
    required: true,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "executiveComposition",
    label: "Executive composition",
    required: true,
    options: [
      { label: "Single responsible executive / DCP-led", value: "single_dcp_led" },
      { label: "Multiple individual executives", value: "multiple_individuals" },
      { label: "Includes corporate member representation", value: "corporate_member_structure" },
      { label: "Other", value: "other" },
    ],
    colSpan: 2,
  },
  {
    type: "text",
    name: "executiveCompositionOther",
    label: "Other executive composition details",
    condition: (f) => f.executiveComposition === "other",
    required: true,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "registeredAddressOption",
    label: "Registered address option",
    required: true,
    options: [
      {
        label: "Use Mirr Asia Estonia business address service (mandatory package item)",
        value: "mirr_business_address",
      },
      {
        label: "Use own address (subject to compliance review, mandatory package item remains)",
        value: "own_address",
      },
    ],
    colSpan: 2,
  },
  {
    type: "textarea",
    name: "registeredAddressDetails",
    label: "Own registered address details",
    condition: (f) => f.registeredAddressOption === "own_address",
    required: true,
    rows: 3,
    colSpan: 2,
  },
];

const buildAccountingFields = (): McapField[] => [
  {
    type: "select",
    name: "finYrEnd",
    label: "Financial Year End",
    options: [
      { label: "December 31", value: "December 31" },
      { label: "March 31", value: "March 31" },
      { label: "June 30", value: "June 30" },
      { label: "September 30", value: "September 30" },
    ],
  },
  {
    type: "radio-group",
    name: "bookKeepingCycle",
    label: "Bookkeeping cycle",
    options: [
      { label: "Monthly", value: "monthly" },
      { label: "Quarterly", value: "quarterly" },
      { label: "Half-annually", value: "half_yearly" },
      { label: "Annually", value: "annually" },
    ],
    colSpan: 2,
  },
  {
    type: "select",
    name: "expectedAnnualTransactions",
    label: "Expected annual transaction count",
    options: [
      { label: "Up to 300", value: "up_to_300" },
      { label: "301 - 1000", value: "301_1000" },
      { label: "More than 1000", value: "1000_plus" },
    ],
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "vatAndTaxSupportNeed",
    label: "Do you need VAT/tax filing support?",
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
      { label: "Need advisory", value: "advice" },
    ],
    colSpan: 2,
  },
  {
    type: "textarea",
    name: "accountingOperationalNotes",
    label: "Accounting and tax notes",
    rows: 3,
    colSpan: 2,
  },
];

const buildServiceFields = (): McapField[] => [
  {
    type: "info",
    label: "Service Setup Notice",
    content:
      "Estonia business address service remains mandatory in this package. Contact person service can be removed when a designated contact person arrangement is client-provided.",
    colSpan: 2,
  },
  {
    type: "select",
    name: "contactPersonMode",
    label: "Contact person service mode",
    required: true,
    defaultValue: "mirr_provided",
    options: [
      {
        label: "Use Mirr Asia contact person service (USD 400/year)",
        value: "mirr_provided",
      },
      {
        label: "Client-provided DCP contact person arrangement (no service fee)",
        value: "dcp_provided",
      },
    ],
    colSpan: 2,
  },
  {
    type: "checkbox-group",
    name: "requestedServices",
    label: "Requested services intake",
    defaultValue: ["estonia_llc_with_initial_maintenance"],
    options: REQUESTED_SERVICE_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "requestedServicesOther",
    label: "Other requested service details",
    condition: (f) => Array.isArray(f.requestedServices) && f.requestedServices.includes("other"),
    required: true,
    colSpan: 2,
  },
  {
    type: "checkbox-group",
    name: "eeQuoteOnlyServiceRequests",
    label: "Quote-only service requests (tracked, excluded from invoice totals)",
    options: QUOTE_ONLY_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "eeQuoteOnlyServiceRequestsOther",
    label: "Other quote-only request details",
    condition: (f) =>
      Array.isArray(f.eeQuoteOnlyServiceRequests) &&
      f.eeQuoteOnlyServiceRequests.includes("other"),
    required: true,
    colSpan: 2,
  },
];

export const EE_FULL_CONFIG: McapConfig = {
  id: "ee-full",
  countryCode: "EE",
  countryName: "Estonia OÜ",
  currency: "USD",
  title: "Estonia OÜ Incorporation",
  confirmationDetails: {
    title: "Estonia OÜ Application Submitted",
    message:
      "Your Estonia incorporation request has been received. Typical processing timeline is 3 to 5 business days after document and compliance checks.",
    steps: [
      {
        title: "Preparation and KYC",
        description:
          "Preparation, document check, and KYC confirmation are typically completed in 2 to 3 business days.",
      },
      {
        title: "Incorporation Filing",
        description:
          "Filing and incorporation process is typically completed in 1 to 2 business days after readiness.",
      },
      {
        title: "Post-filing Support",
        description:
          "Address/contact service setup and follow-up support are coordinated based on selected services.",
      },
    ],
  },
  steps: [
    {
      id: "applicant",
      title: "Applicant Information",
      description: "Author details and relationship to the planned Estonian corporation.",
      fields: buildApplicantFields(),
    },
    {
      id: "compliance",
      title: "AML / CDD",
      description: "Business intent, sanctions screening, and annual-renewal consent.",
      fields: buildComplianceFields(),
    },
    {
      id: "company",
      title: "Company Information",
      description: "Business profile and registration details.",
      fields: buildCompanyFields(),
    },
    {
      id: "parties",
      title: "Parties and Invites",
      description: "Invite parties and assign a designated contact person.",
      widget: "PartiesManager",
      minParties: 1,
      requireDcp: true,
      requirePartyInvite: true,
    },
    {
      id: "accounting",
      title: "Accounting and Taxation",
      fields: buildAccountingFields(),
    },
    {
      id: "services",
      title: "Service Customization",
      description: "Review mandatory package items and optional add-ons.",
      widget: "ServiceSelectionWidget",
      fields: buildServiceFields(),
      serviceItems: (data) => buildEeServiceItems(data),
    },
    {
      id: "invoice",
      title: "Invoice Preview",
      description: "Review final billable fees before payment.",
      widget: "InvoiceWidget",
      computeFees: (data) => computeEeFees(data),
    },
    {
      id: "payment",
      title: "Payment Processing",
      description: "Proceed with card payment or bank transfer proof upload.",
      widget: "PaymentWidget",
      supportedCurrencies: ["USD", "HKD"],
      computeFees: (data) => computeEeFees(data),
    },
    {
      id: "review",
      title: "Review and Declaration",
      fields: [
        {
          type: "checkbox",
          name: "agreeToTerms",
          label: "I agree to the terms and declarations for this application.",
          required: true,
          colSpan: 2,
        },
        {
          type: "checkbox",
          name: "truthfulnessDeclaration",
          label: "I confirm that all submitted information is true and accurate.",
          required: true,
          colSpan: 2,
        },
        {
          type: "checkbox",
          name: "compliancePreconditionAcknowledgment",
          label:
            "I understand services may be suspended if legal or compliance violations are identified.",
          required: true,
          colSpan: 2,
        },
        {
          type: "text",
          name: "eSign",
          label: "Electronic signature (full name)",
          required: true,
          colSpan: 2,
        },
      ],
    },
  ],
};

