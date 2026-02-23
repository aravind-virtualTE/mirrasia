/* eslint-disable @typescript-eslint/no-explicit-any */
import type { McapConfig, McapFeeItem, McapField } from "./types";

type ChCorporateVariant = "AG" | "GMBH";

type ChCorporateServiceItem = {
  id: string;
  label: string;
  amount: number;
  original: number;
  mandatory: boolean;
  kind?: "service" | "optional" | "other";
  info?: string;
};

const CH_CORPORATE_PRICING = {
  setup_and_maintenance_1y: 8500,
  local_director_support_1y: 18000,
  bank_opening_capital_operating: 2500,
  registered_office_pobox_1y: 3000,
  registered_office_flexidesk_1y: 6800,
  emi_list_provision: 0,
} as const;

const CH_INDUSTRY_OPTIONS = [
  { label: "Cryptocurrency-related", value: "crypto_related" },
  { label: "IT / Blockchain Development", value: "it_blockchain" },
  { label: "Finance / Investment", value: "finance_investment" },
  { label: "Trade / Wholesale", value: "trade_wholesale" },
  { label: "Manufacturing", value: "manufacturing" },
  { label: "E-commerce", value: "ecommerce" },
  { label: "Consulting", value: "consulting" },
  { label: "Other", value: "other" },
];

const CH_PURPOSE_OPTIONS = [
  { label: "Business expansion into European markets", value: "eu_expansion" },
  { label: "Regulatory diversification", value: "regulatory_diversification" },
  { label: "Investor / advisor recommendation", value: "advisor_recommendation" },
  { label: "Holding and asset management", value: "holding_asset_management" },
  { label: "International transaction structuring", value: "international_structuring" },
  { label: "Operational / tax optimization", value: "optimization" },
  { label: "Other", value: "other" },
];

const CH_QUOTE_ONLY_OPTIONS = [
  { label: "Annual Accounting / Tax Service (quote)", value: "annual_accounting_tax_quote" },
  { label: "EMI Account Opening Agency (quote)", value: "emi_account_opening_quote" },
  { label: "Legal Opinion (Swiss) (quote after whitepaper)", value: "legal_opinion_swiss_quote" },
  {
    label: "Legal Opinion (Domestic Exchange Listing) (quote after whitepaper)",
    value: "legal_opinion_exchange_quote",
  },
  { label: "Consulting (Feasibility / Regulation) (quote)", value: "consulting_quote" },
  { label: "Other quote-only request", value: "other" },
];

const getSelectedServiceIds = (data: Record<string, any>) => {
  const ids = new Set<string>();
  const optionalFeeIds = Array.isArray(data?.optionalFeeIds) ? data.optionalFeeIds : [];
  const serviceItemsSelected = Array.isArray(data?.serviceItemsSelected) ? data.serviceItemsSelected : [];
  optionalFeeIds.forEach((id: any) => ids.add(String(id)));
  serviceItemsSelected.forEach((id: any) => ids.add(String(id)));
  return ids;
};

const getBoardServiceMode = (data: Record<string, any>) => String(data?.boardServiceMode || "mirr_provided");
const getRegisteredOfficeMode = (data: Record<string, any>) => String(data?.registeredOfficeMode || "pobox");
const getBankOpeningMode = (data: Record<string, any>) => String(data?.bankOpeningMode || "mirr_opening");

export const buildChCorporateServiceItems = (
  data: Record<string, any>,
  variant: ChCorporateVariant
): ChCorporateServiceItem[] => {
  const boardServiceMode = getBoardServiceMode(data);
  const registeredOfficeMode = getRegisteredOfficeMode(data);
  const bankOpeningMode = getBankOpeningMode(data);

  const boardLabel =
    variant === "AG"
      ? "Registering 2 local directors (1 year)"
      : "Local operating officer / director support package (1 year)";
  const boardInfo =
    variant === "AG"
      ? "AG generally requires resident Swiss board presence. This package covers local director support."
      : "GmbH generally requires at least one Swiss-resident operating officer. This package covers local support.";

  const items: ChCorporateServiceItem[] = [
    {
      id: "ch_setup_maintenance_1y",
      label: "Swiss Incorporation + 1 year maintenance",
      amount: CH_CORPORATE_PRICING.setup_and_maintenance_1y,
      original: CH_CORPORATE_PRICING.setup_and_maintenance_1y,
      mandatory: true,
      kind: "service",
      info: "Includes establishment and first-year core maintenance services.",
    },
  ];

  if (boardServiceMode === "mirr_provided") {
    items.push({
      id: "ch_local_director_support_1y",
      label: boardLabel,
      amount: CH_CORPORATE_PRICING.local_director_support_1y,
      original: CH_CORPORATE_PRICING.local_director_support_1y,
      mandatory: true,
      kind: "service",
      info: boardInfo,
    });
  }

  if (registeredOfficeMode === "pobox") {
    items.push({
      id: "ch_registered_office_pobox_1y",
      label: "Business Address: PO Box (1 year)",
      amount: CH_CORPORATE_PRICING.registered_office_pobox_1y,
      original: CH_CORPORATE_PRICING.registered_office_pobox_1y,
      mandatory: true,
      kind: "service",
      info: "Registered office PO Box address service in Switzerland.",
    });
  } else if (registeredOfficeMode === "flexidesk") {
    items.push({
      id: "ch_registered_office_flexidesk_1y",
      label: "Business Address: Flexi-desk (1 year)",
      amount: CH_CORPORATE_PRICING.registered_office_flexidesk_1y,
      original: CH_CORPORATE_PRICING.registered_office_flexidesk_1y,
      mandatory: true,
      kind: "service",
      info: "Includes lease support, meeting room access, and Swiss phone number.",
    });
  }

  if (bankOpeningMode === "mirr_opening") {
    items.push({
      id: "ch_bank_opening_capital_operating",
      label: "Capital and bank account opening agency",
      amount: CH_CORPORATE_PRICING.bank_opening_capital_operating,
      original: CH_CORPORATE_PRICING.bank_opening_capital_operating,
      mandatory: true,
      kind: "service",
      info: "Support for capital account and operational bank account opening.",
    });
  }

  items.push({
    id: "ch_emi_list_provision",
    label: "EMI List Provision",
    amount: CH_CORPORATE_PRICING.emi_list_provision,
    original: CH_CORPORATE_PRICING.emi_list_provision,
    mandatory: false,
    kind: "optional",
    info: "Free informational EMI provider list.",
  });

  return items;
};

export const computeChCorporateFees = (data: Record<string, any>, variant: ChCorporateVariant) => {
  const selectedServiceIds = getSelectedServiceIds(data);
  const allItems = buildChCorporateServiceItems(data, variant);

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
  const shouldConvertToHkd = paymentCurrency === "HKD" && Number.isFinite(exchangeRateUsedRaw) && exchangeRateUsedRaw > 0;

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

  const cardFeePct = paymentCurrency === "HKD" ? 0.04 : 0.06;
  const payMethod = String(data?.payMethod || "").toLowerCase();
  const cardFeeSurcharge = payMethod === "card" ? Number((total * cardFeePct).toFixed(2)) : 0;
  const grandTotal = Number((total + cardFeeSurcharge).toFixed(2));

  return {
    currency: paymentCurrency === "HKD" ? "HKD" : "USD",
    items: selectedItems,
    government: 0,
    service: total,
    total,
    cardFeePct,
    cardFeeSurcharge,
    grandTotal,
    ...(shouldConvertToHkd ? { exchangeRateUsed: exchangeRateUsedRaw, originalAmountUsd: totalUsd } : {}),
    note: "Quote-only service requests are tracked separately and excluded from invoice totals until priced.",
  };
};

const buildApplicantFields = (entityLabel: string): McapField[] => [
  {
    type: "info",
    label: "Application Notice",
    content:
      "This form should be completed by a director or an authorized delegate. Please provide accurate details for compliance and onboarding.",
    colSpan: 2,
  },
  { type: "text", name: "applicantName", label: "Name of Author", required: true, colSpan: 2 },
  {
    type: "checkbox-group",
    name: "authorRelationship",
    label: `Relationship to the ${entityLabel}`,
    required: true,
    options: [
      { label: `Director of the ${entityLabel}`, value: "director" },
      { label: "Person delegated by the director", value: "delegate" },
      { label: "Direct/indirect shareholder", value: "shareholder" },
      { label: "Expert (lawyer, accountant, etc.)", value: "expert" },
      { label: "Other", value: "other" },
    ],
    colSpan: 2,
  },
  {
    type: "text",
    name: "authorRelationshipOther",
    label: "Other relationship details",
    condition: (f) => Array.isArray(f.authorRelationship) && f.authorRelationship.includes("other"),
    colSpan: 2,
  },
  { type: "email", name: "applicantEmail", label: "Applicant Email", required: true, colSpan: 2 },
  { type: "text", name: "applicantPhone", label: "Applicant Phone", required: true, colSpan: 2 },
  { type: "text", name: "authorContact", label: "Contact Information (Phone / SNS ID etc.)", required: true, colSpan: 2 },
  { type: "text", name: "companyName_1", label: "Desired Corporate Name (1st choice)", required: true, colSpan: 2 },
  { type: "text", name: "companyName_2", label: "Desired Corporate Name (2nd choice)", required: true, colSpan: 2 },
  { type: "text", name: "companyName_3", label: "Desired Corporate Name (3rd choice)", colSpan: 2 },
  {
    type: "select",
    name: "sns",
    label: "Preferred Messaging App",
    options: [
      { label: "WhatsApp", value: "WhatsApp" },
      { label: "WeChat", value: "WeChat" },
      { label: "Line", value: "Line" },
      { label: "KakaoTalk", value: "KakaoTalk" },
      { label: "Telegram", value: "Telegram" },
      { label: "Other", value: "Other" },
    ],
  },
  {
    type: "text",
    name: "snsId",
    label: "SNS ID",
    condition: (f) => !!f.sns,
  },
];

const buildComplianceFields = (): McapField[] => [
  {
    type: "radio-group",
    name: "ethicalLegalConfirmation",
    label:
      "Does the business purpose raise legal/ethical issues (money laundering, gambling, tax evasion, etc.)?",
    required: true,
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
      { label: "I don't know", value: "unknown" },
      { label: "Consider legal advice", value: "legal_advice" },
    ],
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "annualRenewalAgreement",
    label: "Do you agree to annual renewals and associated fixed costs?",
    required: true,
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
      { label: "Can be resolved internally", value: "internal_resolution" },
      { label: "No intention if fixed costs incur", value: "no_if_fixed_cost" },
      { label: "Advice required", value: "advice_required" },
    ],
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "sanctionedCountriesBusiness",
    label: "Do you conduct business in sanctioned countries or regions?",
    required: true,
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
      { label: "I don't know", value: "unknown" },
    ],
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "sanctionedPersonsInvolved",
    label: "Are any involved persons residing in sanctioned regions?",
    required: true,
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
      { label: "I don't know", value: "unknown" },
    ],
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "restrictedSectors",
    label: "Are you engaged in oil, gas, military, or defense sectors?",
    required: true,
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
      { label: "I don't know", value: "unknown" },
    ],
    colSpan: 2,
  },
];

const buildCompanyFields = (variant: ChCorporateVariant): McapField[] => {
  const variantName = variant === "AG" ? "Swiss corporation (AG)" : "Swiss GmbH / LLC";
  const capitalLabel =
    variant === "AG"
      ? "Total capital to be paid (minimum CHF 100,000)"
      : "Total capital to be paid (typical minimum CHF 20,000 for GmbH)";
  const capitalDefault = variant === "AG" ? "CHF 100,000" : "CHF 20,000";
  const directorRule =
    variant === "AG"
      ? "Majority of board members must be Swiss residents."
      : "At least one operating officer must be a Swiss resident.";

  return [
    {
      type: "info",
      label: "Swiss Corporate Setup Context",
      content: `You selected ${variantName}. ${directorRule}`,
      colSpan: 2,
    },
    {
      type: "checkbox-group",
      name: "industrySelection",
      label: "Select Industry",
      required: true,
      options: CH_INDUSTRY_OPTIONS,
      colSpan: 2,
    },
    {
      type: "text",
      name: "industrySelectionOther",
      label: "Other industry details",
      condition: (f) => Array.isArray(f.industrySelection) && f.industrySelection.includes("other"),
      colSpan: 2,
    },
    {
      type: "textarea",
      name: "productServiceDescription",
      label: "Description of product/service to be traded",
      required: true,
      rows: 3,
      colSpan: 2,
    },
    {
      type: "textarea",
      name: "businessSummary",
      label: "Describe business in 3-4 sentences",
      required: true,
      rows: 4,
      colSpan: 2,
    },
    {
      type: "text",
      name: "websiteUrl",
      label: "Website address",
      colSpan: 2,
    },
    {
      type: "checkbox-group",
      name: "purposeOfEstablishment",
      label: "Purpose and expected effects of establishing this Swiss entity",
      required: true,
      options: CH_PURPOSE_OPTIONS,
      colSpan: 2,
    },
    {
      type: "text",
      name: "purposeOfEstablishmentOther",
      label: "Other purpose details",
      condition: (f) => Array.isArray(f.purposeOfEstablishment) && f.purposeOfEstablishment.includes("other"),
      colSpan: 2,
    },
    {
      type: "textarea",
      name: "businessCountries",
      label: "Countries where business will be conducted",
      required: true,
      rows: 3,
      colSpan: 2,
    },
    {
      type: "radio-group",
      name: "tokenIssuancePlanned",
      label: "Will the entity issue or distribute tokens?",
      required: true,
      options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ],
      colSpan: 2,
    },
    {
      type: "radio-group",
      name: "tokenUtilityAtIssuance",
      label: "If tokens are issued, will utility exist at issuance?",
      required: true,
      condition: (f) => f.tokenIssuancePlanned === "yes",
      options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
        { label: "Not sure", value: "unknown" },
      ],
      colSpan: 2,
    },
    {
      type: "radio-group",
      name: "tokenRightsFeatures",
      label: "Will tokens include dividend/profit/voting rights?",
      required: true,
      condition: (f) => f.tokenIssuancePlanned === "yes",
      options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
        { label: "Not sure", value: "unknown" },
      ],
      colSpan: 2,
    },
    {
      type: "radio-group",
      name: "sroMembershipPlan",
      label: "Do you understand and plan for SRO membership if acting as a financial intermediary?",
      required: true,
      options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
        { label: "Need advisory", value: "advice" },
      ],
      colSpan: 2,
    },
    {
      type: "radio-group",
      name: "totalCapital",
      label: capitalLabel,
      required: true,
      options: [
        { label: capitalDefault, value: "default" },
        { label: "Other", value: "other" },
      ],
      colSpan: 2,
    },
    {
      type: "text",
      name: "totalCapitalOther",
      label: "Total capital (other)",
      required: true,
      condition: (f) => f.totalCapital === "other",
      colSpan: 2,
    },
    // {
    //   type: "radio-group",
    //   name: "directorComposition",
    //   label: variant === "AG" ? "Composition of Directors" : "Composition of Directors / Operating Officers",
    //   required: true,
    //   options:
    //     variant === "AG"
    //       ? [
    //         { label: "2 Swiss residents + 1 non-Swiss resident", value: "2_local_1_foreign" },
    //         { label: "Other", value: "other" },
    //       ]
    //       : [
    //         { label: "At least 1 Swiss-resident operating officer", value: "min_1_local_officer" },
    //         { label: "Other", value: "other" },
    //       ],
    //   colSpan: 2,
    // },
    // {
    //   type: "text",
    //   name: "directorCompositionOther",
    //   label: "Director / officer composition details (other)",
    //   required: true,
    //   condition: (f) => f.directorComposition === "other",
    //   colSpan: 2,
    // },
    {
      type: "radio-group",
      name: "addressServiceChoice",
      label: "Local Corporate Address Choice",
      required: true,
      options: [
        { label: "Use Mirr Asia's registration address service", value: "mirr" },
        { label: "Have a separate address", value: "own" },
      ],
      colSpan: 2,
    },
    {
      type: "textarea",
      name: "addressServiceOwnAddress",
      label: "Provide separate address details",
      required: true,
      condition: (f) => f.addressServiceChoice === "own",
      rows: 3,
      colSpan: 2,
    },
    {
      type: "checkbox",
      name: "capitalRequirementAcknowledged",
      label: "I understand capital requirements are compliance requirements and excluded from invoice totals.",
      required: true,
      colSpan: 2,
    },
  ];
};

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
    label: "Accounting and tax operational notes",
    rows: 3,
    colSpan: 2,
  },
];

const buildServicesFields = (variant: ChCorporateVariant): McapField[] => {
  const boardLabel =
    variant === "AG"
      ? "Local director support selection"
      : "Local operating officer / director support selection";
  return [
    {
      type: "select",
      name: "boardServiceMode",
      label: boardLabel,
      required: true,
      defaultValue: "mirr_provided",
      options: [
        { label: "Use Mirr Asia local support service", value: "mirr_provided" },
        { label: "Client provides own compliant local executives", value: "client_provided" },
      ],
    },
    {
      type: "select",
      name: "registeredOfficeMode",
      label: "Registered office option",
      required: true,
      defaultValue: "pobox",
      options: [
        { label: "PO Box (USD 3,000/year)", value: "pobox" },
        { label: "Flexi-desk (USD 6,800/year)", value: "flexidesk" },
        { label: "Client address (no Mirr address service)", value: "client_address" },
      ],
    },
    {
      type: "textarea",
      name: "registeredOfficeClientAddress",
      label: "Client-provided Swiss address details",
      required: true,
      condition: (f) => f.registeredOfficeMode === "client_address",
      rows: 3,
      colSpan: 2,
    },
    {
      type: "select",
      name: "bankOpeningMode",
      label: "Capital and bank account opening service",
      required: true,
      defaultValue: "mirr_opening",
      options: [
        { label: "Use Mirr Asia bank opening agency", value: "mirr_opening" },
        { label: "Client arranges bank opening directly", value: "self_arranged" },
      ],
    },
    {
      type: "checkbox-group",
      name: "chQuoteOnlyServices",
      label: "Quote-only service requests (tracked, excluded from invoice totals)",
      options: CH_QUOTE_ONLY_OPTIONS,
      colSpan: 2,
    },
    {
      type: "textarea",
      name: "chQuoteOnlyServicesOther",
      label: "Other quote-only request details",
      condition: (f) => Array.isArray(f.chQuoteOnlyServices) && f.chQuoteOnlyServices.includes("other"),
      rows: 3,
      colSpan: 2,
    },
  ];
};

export const createChCorporateConfig = ({
  id,
  countryCode,
  countryName,
  title,
  variant,
}: {
  id: string;
  countryCode: string;
  countryName: string;
  title: string;
  variant: ChCorporateVariant;
}): McapConfig => {
  const entityLabel = variant === "AG" ? "Swiss corporation (AG)" : "Swiss Limited Liability Company (GmbH; LLC)";

  return {
    id,
    countryCode,
    countryName,
    currency: "USD",
    title,
    confirmationDetails: {
      title: `${countryName} Application Submitted`,
      message:
        "We have received your Swiss incorporation request. Our team will review compliance, structure, and selected services before filing.",
      steps: [
        {
          title: "Compliance Review",
          description: "KYC/CDD and sanctions checks are completed before filing.",
        },
        {
          title: "Registration Preparation",
          description: "Corporate structure and onboarding documents are validated.",
        },
        {
          title: "Filing and Post-filing Support",
          description: "Entity filing, operational setup, and optional services are coordinated.",
        },
      ],
    },
    steps: [
      {
        id: "applicant",
        title: "Applicant Information",
        description: "Author and contact details for this application.",
        fields: buildApplicantFields(entityLabel),
      },
      {
        id: "compliance",
        title: "AML / CDD",
        description: "Sanctions and legal-risk declarations.",
        fields: buildComplianceFields(),
      },
      {
        id: "company",
        title: "Company Information",
        description: "Business, registration, and capital details.",
        fields: buildCompanyFields(variant),
      },
      {
        id: "parties",
        title: "Parties and Invites",
        description: "Invite all required parties and assign a designated contact person.",
        widget: "PartiesManager",
        minParties: 1,
        requireDcp: true,
        requirePartyInvite: true,
        partyFields: [
          {
            key: "swissResidencyStatus",
            label: "Swiss residency status",
            type: "select",
            options: [
              { label: "Swiss resident", value: "swiss_resident" },
              { label: "Non-Swiss resident", value: "non_swiss_resident" },
            ],
            storage: "details",
          },
        ],
        partyCoverageRules: [
          {
            key: "swissResidencyStatus",
            storage: "details",
            requiredValues: ["swiss_resident"],
            label: "Swiss residency coverage",
            valueLabels: {
              swiss_resident: "Swiss resident",
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
        title: "Service Customization",
        description: "Select billable services and track quote-only requests.",
        widget: "ServiceSelectionWidget",
        fields: buildServicesFields(variant),
        serviceItems: (data) => buildChCorporateServiceItems(data, variant),
        supportedCurrencies: ["USD", "HKD"],
        computeFees: (data) => computeChCorporateFees(data, variant),
      },
      {
        id: "invoice",
        title: "Invoice Preview",
        description: "Review billable services before payment.",
        widget: "InvoiceWidget",
        computeFees: (data) => computeChCorporateFees(data, variant),
      },
      {
        id: "payment",
        title: "Payment Processing",
        description: "Proceed with card payment or bank transfer upload.",
        widget: "PaymentWidget",
        supportedCurrencies: ["USD", "HKD"],
        computeFees: (data) => computeChCorporateFees(data, variant),
      },
      {
        id: "review",
        title: "Review and Declaration",
        fields: [
          {
            type: "info",
            label: "Final Declaration",
            content:
              "I confirm all provided information is true and complete, and the intended business is legitimate.",
            colSpan: 2,
          },
          {
            type: "radio-group",
            name: "finalAgreement",
            label: "Do you agree to the final declaration?",
            required: true,
            options: [
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" },
            ],
            colSpan: 2,
          },
          {
            type: "checkbox",
            name: "truthfulnessDeclaration",
            label: "I confirm the submitted information is true and accurate.",
            required: true,
            colSpan: 2,
          },
          {
            type: "checkbox",
            name: "compliancePreconditionAcknowledgment",
            label: "I understand services may be suspended if legal/compliance violations are identified.",
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
};
