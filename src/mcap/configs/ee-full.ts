/* eslint-disable @typescript-eslint/no-explicit-any */
import { applicantRoles, finYearOptions } from "@/pages/Company/NewHKForm/hkIncorpo";
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

const EE_BASE_CURRENCY = "EUR";

const YES_NO_UNKNOWN = [
  { label: "mcap.common.options.yes", value: "yes" },
  { label: "mcap.common.options.no", value: "no" },
  { label: "mcap.common.options.doNotKnow", value: "unknown" },
];

// const RELATIONSHIP_OPTIONS = [
//   { label: "ee.auto.k001", value: "officer" },
//   { label: "ee.auto.k002", value: "authorizedProxy" },
//   { label: "ee.auto.k003", value: "majorShareholder" },
//   { label: "ee.auto.k004", value: "professionalAdvisor" },
//   { label: "mcap.common.options.other", value: "other" },
// ];

const REQUESTED_SERVICE_OPTIONS = [
  {
    label: "ee.auto.k005",
    value: "estonia_llc_with_initial_maintenance",
  },
  { label: "ee.auto.k006", value: "emi_list" },
  { label: "ee.auto.k007", value: "emi_account_opening" },
  { label: "ee.auto.k008", value: "bank_account_opening" },
  { label: "ee.auto.k009", value: "legal_opinion_estonia" },
  { label: "ee.auto.k010", value: "legal_opinion_domestic_listing" },
  // { label: "ee.auto.k011", value: "legal_opinion_other_country" },
  { label: "ee.auto.k012", value: "business_consulting" },
  { label: "mcap.common.options.other", value: "other" },
];

const INDUSTRY_OPTIONS = [
  { label: "ee.auto.k013", value: "it_software_blockchain_dev" },
  { label: "ee.auto.k014", value: "ecommerce_retail_wholesale" },
  { label: "ee.auto.k015", value: "trading" },
  { label: "ee.auto.k016", value: "management_it_consulting" },
  { label: "ee.auto.k017", value: "manufacturing" },
  { label: "ee.auto.k018", value: "crypto_exchange_wallet" },
  { label: "ee.auto.k019", value: "crypto_investment_defi" },
  { label: "ee.auto.k020", value: "forex_finance_investment" },
  { label: "ee.auto.k021", value: "crypto_games_web3" },
  { label: "mcap.common.fields.otherDetails", value: "other" },
];

const PURPOSE_OPTIONS = [
  { label: "ee.auto.k025", value: "international_business_expansion_cross_border_trade" },
  { label: "ee.auto.k026", value: "service_provision_consulting_it_services" },
  { label: "ee.auto.k027", value: "holding_company_corporate_structure" },
  { label: "ee.auto.k028", value: "investment_wealth_management" },
  { label: "ee.auto.k029", value: "project_joint_venture_vehicle" },
  { label: "ee.auto.k030", value: "intellectual_property_holding" },
  { label: "mcap.common.fields.otherDetails", value: "other" },
];

const QUOTE_ONLY_OPTIONS = [
  { label: "ee.auto.k033", value: "emi_account_opening" },
  { label: "ee.auto.k034", value: "bank_account_opening" },
  { label: "ee.auto.k009", value: "legal_opinion_estonia" },
  { label: "ee.auto.k010", value: "legal_opinion_domestic_listing" },
  // { label: "ee.auto.k011", value: "legal_opinion_other_country" },
  { label: "ee.auto.k012", value: "business_consulting" },
  { label: "ee.auto.k035", value: "other" },
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
      label: "ee.auto.k036",
      amount: EE_PRICING.incorporation_professional,
      original: EE_PRICING.incorporation_professional,
      mandatory: true,
      kind: "service",
      info: "ee.auto.k037",
    },
    {
      id: "ee_state_fee",
      label: "ee.auto.k038",
      amount: EE_PRICING.state_fee,
      original: EE_PRICING.state_fee,
      mandatory: true,
      kind: "government",
      info: "ee.auto.k039",
    },
    {
      id: "ee_business_address_1y",
      label: "ee.auto.k040",
      amount: EE_PRICING.business_address_1y,
      original: EE_PRICING.business_address_1y,
      mandatory: true,
      kind: "service",
      info: "ee.auto.k041",
    },
    {
      id: "ee_management_followup_1y",
      label: "ee.auto.k042",
      amount: EE_PRICING.management_followup_1y,
      original: EE_PRICING.management_followup_1y,
      mandatory: true,
      kind: "service",
      info: "ee.auto.k043",
    },
  ];

  if (contactPersonMode === "mirr_provided") {
    items.push({
      id: "ee_contact_person_1y",
      label: "ee.auto.k044",
      amount: EE_PRICING.contact_person_1y,
      original: EE_PRICING.contact_person_1y,
      mandatory: true,
      kind: "service",
      // info: "ee.auto.k045",
    });
  }

  items.push(
    {
      id: "ee_poa_addon",
      label: "ee.auto.k046",
      amount: EE_PRICING.poa_addon,
      original: EE_PRICING.poa_addon,
      mandatory: false,
      kind: "optional",
    },
    {
      id: "ee_emi_list",
      label: "ee.auto.k047",
      amount: EE_PRICING.emi_list,
      original: EE_PRICING.emi_list,
      mandatory: false,
      kind: "optional",
      info: "ee.auto.k048",
    }
  );

  return items;
};

export const computeEeFees = (data: Record<string, any>) => {
  const selectedServiceIds = getSelectedServiceIds(data);
  const allItems = buildEeServiceItems(data);

  const selectedItemsBase: McapFeeItem[] = allItems
    .filter((item) => item.mandatory || selectedServiceIds.has(item.id))
    .map((item) => ({
      id: item.id,
      label: item.label,
      amount: item.amount,
      kind: item.kind || "service",
      ...(item.original !== undefined ? { original: item.original } : {}),
      ...(item.info ? { info: item.info } : {}),
    }));

  const totalBase = selectedItemsBase.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const paymentCurrency = String(data?.paymentCurrency || EE_BASE_CURRENCY).toUpperCase();
  const cachedComputedCurrency = String(data?.computedFees?.currency || "").toUpperCase();
  const exchangeRateUsedRaw = Number(data?.computedFees?.exchangeRateUsed || 0);
  const shouldConvertFromBase =
    paymentCurrency !== EE_BASE_CURRENCY
    && cachedComputedCurrency === paymentCurrency
    && Number.isFinite(exchangeRateUsedRaw)
    && exchangeRateUsedRaw > 0;

  const selectedItems = shouldConvertFromBase
    ? selectedItemsBase.map((item: any) => ({
      ...item,
      amount: Number((Number(item.amount || 0) * exchangeRateUsedRaw).toFixed(2)),
      ...(item.original !== undefined
        ? { original: Number((Number(item.original || 0) * exchangeRateUsedRaw).toFixed(2)) }
        : {}),
    }))
    : selectedItemsBase;

  const total = shouldConvertFromBase ? Number((totalBase * exchangeRateUsedRaw).toFixed(2)) : totalBase;
  const government = selectedItems
    .filter((item: any) => item.kind === "government")
    .reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
  const service = Number((total - government).toFixed(2));

  const cardFeePct = paymentCurrency === "HKD" ? 0.04 : 0.06;
  const payMethod = String(data?.payMethod || "").toLowerCase();
  const cardFeeSurcharge = payMethod === "card" ? Number((total * cardFeePct).toFixed(2)) : 0;
  const grandTotal = Number((total + cardFeeSurcharge).toFixed(2));

  return {
    currency: shouldConvertFromBase ? paymentCurrency : EE_BASE_CURRENCY,
    items: selectedItems,
    government,
    service,
    total,
    cardFeePct,
    cardFeeSurcharge,
    grandTotal,
    originalCurrency: EE_BASE_CURRENCY,
    originalAmount: totalBase,
    ...(shouldConvertFromBase ? { exchangeRateUsed: exchangeRateUsedRaw } : {}),
    note:
      "ee.auto.k049",
  };
};

const buildApplicantFields = (): McapField[] => [
  {
    type: "info",
    label: "ee.auto.k050",
    content:
      "ee.auto.k051",
    colSpan: 2,
  },
  {
    type: "text",
    name: "authorName",
    label: "mcap.common.fields.applicantName",
    required: true,
    colSpan: 2,
  },
   {
    type: "email",
    name: "email",
    label: "mcap.common.fields.applicantEmail",
    required: true,
    colSpan: 2,
  },
  {
    type: "text",
    name: "proposedCompanyName1",
    label: "ee.auto.k075",
    required: true,
    colSpan: 2,
  },
  {
    type: "text",
    name: "proposedCompanyName2",
    label: "ee.auto.k076",
    required: true,
    colSpan: 2,
  },
  {
    type: "text",
    name: "proposedCompanyName3",
    label: "ee.auto.k077",
    required: true,
    colSpan: 2,
  },
  {
    type: "checkbox-group",
    name: "relationshipToEstonianCorporation",
    label: "ee.auto.k053",
    required: true,
    options: applicantRoles,
    colSpan: 2,
  },
  {
    type: "text",
    name: "relationshipToEstonianCorporationOther",
    label: "mcap.common.fields.otherRelationshipDetails",
    condition: (f) =>
      Array.isArray(f.relationshipToEstonianCorporation) &&
      f.relationshipToEstonianCorporation.includes("Other"),
    required: true,
    colSpan: 2,
  },
  {
    type: "text",
    name: "phoneNumber",
    label: "ee.auto.k054",
    required: true,
    colSpan: 2,
  },
 
  {
    type: "text",
    name: "snsId",
    label: "ee.auto.k056",
    colSpan: 2,
  },
];

const buildComplianceFields = (): McapField[] => [
  {
    type: "radio-group",
    name: "legalOrEthicalIssuesConcern",
    label: "ee.auto.k057",
    required: true,
    options: [
      { label: "mcap.common.options.no", value: "no" },
      { label: "mcap.common.options.yes", value: "yes" },
      { label: "ee.auto.k058", value: "seek_legal_advice" },
    ],
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "annualRenewalAgreement",
    label: "ee.auto.k059",
    required: true,
    options: [
      { label: "mcap.common.options.yes", value: "yes" },
      { label: "ee.auto.k060", value: "self_handle" },
      { label: "ee.auto.k061", value: "no_if_fixed_cost" },
      { label: "ee.auto.k062", value: "advice_required" },
    ],
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "businessInSanctionedCountries",
    label: "ee.auto.k063",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "personsResidingInSanctionedCountries",
    label: "ee.auto.k064",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "ownershipBySanctionedPersons",
    label: "ee.auto.k065",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "oilGasMilitaryEnergySectorActivity",
    label: "ee.auto.k066",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
];

const buildCompanyFields = (): McapField[] => [
  {
    type: "checkbox-group",
    name: "industries",
    label: "ee.auto.k068",
    required: true,
    options: INDUSTRY_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "otherIndustryDetails",
    label: "ee.auto.k069",
    condition: (f) => Array.isArray(f.industries) && f.industries.includes("other"),
    required: true,
    colSpan: 2,
  },
  {
    type: "textarea",
    name: "businessDescription",
    label: "ee.auto.k070",
    required: true,
    rows: 4,
    colSpan: 2,
  },
  {
    type: "text",
    name: "website",
    label: "ee.auto.k071",
    placeholder: "ee.auto.k072",
    colSpan: 2,
  },
  {
    type: "checkbox-group",
    name: "purposeOfEstablishment",
    label: "ee.auto.k073",
    required: true,
    options: PURPOSE_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "otherPurposeDetails",
    label: "ee.auto.k074",
    condition: (f) => Array.isArray(f.purposeOfEstablishment) && f.purposeOfEstablishment.includes("other"),
    required: true,
    colSpan: 2,
  },
  
  {
    type: "radio-group",
    name: "totalCapitalEUR",
    label: "ee.auto.k078",
    tooltip:  "ee.auto.totalCapitalTooltip",
    required: true,
    defaultValue: "1",
    options: [
      { label: "ee.auto.k079", value: "1" },
      { label: "ee.auto.k080", value: "2500" },
      { label: "ee.auto.k081", value: "25000" },
      { label: "mcap.common.options.other", value: "other" },
    ],
    colSpan: 2,
  },
  {
    type: "number",
    name: "totalCapitalEUROther",
    label: "ee.auto.k082",
    condition: (f) => f.totalCapitalEUR === "other",
    required: true,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "executiveComposition",
    label: "ee.auto.k083",
    required: true,
    options: [
      { label: "ee.auto.k084", value: "single_dcp_led", tooltip: "ee.auto.k084Info" },
      { label: "ee.auto.k085", value: "multiple_individuals", tooltip: "ee.auto.k085Info" },
      { label: "ee.auto.k086", value: "corporate_member_structure", tooltip: "ee.auto.k086Info" },
      { label: "mcap.common.options.other", value: "other" },
    ],
    colSpan: 2,
  },
  {
    type: "text",
    name: "executiveCompositionOther",
    label: "ee.auto.k087",
    condition: (f) => f.executiveComposition === "other",
    required: true,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "registeredAddressOption",
    label: "ee.auto.k088",
    required: true,
    options: [
      {
        label: "ee.auto.k089",
        value: "mirr_business_address",
      },
      {
        label: "ee.auto.k090",
        value: "own_address",
      },
    ],
    colSpan: 2,
  },
  {
    type: "textarea",
    name: "registeredAddressDetails",
    label: "ee.auto.k091",
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
    label: "newHk.steps.acct.fields.finYrEnd.label",
    options: finYearOptions,
  },
  {
    type: "text",
    name: "finYrEndOther",
    label: "newHk.common.other",
    condition: (f) => f.finYrEnd === "Other",
  },
  {
    type: "radio-group",
    name: "bookKeepingCycle",
    label: "mcap.common.fields.bookKeepingCycle",
    options: [
      { label: "mcap.common.bookkeeping.monthly", value: "monthly" },
      { label: "mcap.common.bookkeeping.quarterly", value: "quarterly" },
      { label: "mcap.common.bookkeeping.halfYearly", value: "half_yearly" },
      { label: "mcap.common.bookkeeping.annually", value: "annually" },
    ],
    colSpan: 2,
  },
  {
    type: "select",
    name: "expectedAnnualTransactions",
    label: "ee.auto.k092",
    options: [
      { label: "mcap.common.options.upTo300", value: "up_to_300" },
      { label: "mcap.common.options.from301To1000", value: "301_1000" },
      { label: "mcap.common.options.moreThan1000", value: "1000_plus" },
    ],
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "vatAndTaxSupportNeed",
    label: "mcap.common.fields.vatTaxSupportNeed",
    options: [
      { label: "mcap.common.options.yes", value: "yes" },
      { label: "mcap.common.options.no", value: "no" },
      { label: "ee.auto.k093", value: "advice" },
    ],
    colSpan: 2,
  },
  {
    type: "textarea",
    name: "accountingOperationalNotes",
    label: "mcap.common.fields.accountingAndTaxNotes",
    rows: 3,
    colSpan: 2,
  },
];

const buildServiceFields = (): McapField[] => [
  // {
  //   type: "info",
  //   label: "ee.auto.k094",
  //   content:
  //     "ee.auto.k095",
  //   colSpan: 2,
  // },
  {
    type: "select",
    name: "contactPersonMode",
    label: "ee.auto.k096",
    required: true,
    defaultValue: "mirr_provided",
    options: [
      {
        label: "ee.auto.k097",
        value: "mirr_provided",
      },
      // {
      //   label: "ee.auto.k098",
      //   value: "dcp_provided",
      // },
    ],
    colSpan: 2,
  },
  {
    type: "checkbox-group",
    name: "requestedServices",
    label: "ee.auto.k099",
    defaultValue: ["estonia_llc_with_initial_maintenance"],
    options: REQUESTED_SERVICE_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "requestedServicesOther",
    label: "ee.auto.k100",
    condition: (f) => Array.isArray(f.requestedServices) && f.requestedServices.includes("other"),
    required: true,
    colSpan: 2,
  },
  {
    type: "checkbox-group",
    name: "eeQuoteOnlyServiceRequests",
    label: "ee.auto.k101",
    options: QUOTE_ONLY_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "eeQuoteOnlyServiceRequestsOther",
    label: "ee.auto.k102",
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
  currency: "EUR",
  title: "ee.auto.k103",
  confirmationDetails: {
    title: "ee.auto.k104",
    message:
      "ee.auto.k105",
    steps: [
      {
        title: "ee.auto.k106",
        description:
          "ee.auto.k107",
      },
      {
        title: "ee.auto.k108",
        description:
          "ee.auto.k109",
      },
      {
        title: "ee.auto.k110",
        description:
          "ee.auto.k111",
      },
    ],
  },
  reviewSummary: [
    {
      id: "applicant",
      kind: "field",
      label: "mcap.review.summary.applicant",
      fieldNames: ["authorName"],
    },
    {
      id: "companyName",
      kind: "field",
      label: "mcap.review.summary.companyName",
      fieldNames: ["proposedCompanyName1"],
    },
    {
      id: "email",
      kind: "field",
      label: "mcap.review.summary.email",
      fieldNames: ["email"],
    },
    {
      id: "phone",
      kind: "field",
      label: "mcap.review.summary.phone",
      fieldNames: ["phoneNumber"],
    },
    {
      id: "relationshipToEstonianCorporation",
      kind: "field",
      label: "mcap.review.summary.entityType",
      fieldNames: ["relationshipToEstonianCorporation"],
      useFieldLabel: true,
    },
    {
      id: "industries",
      kind: "field",
      label: "mcap.review.summary.industry",
      fieldNames: ["industries"],
      useFieldLabel: true,
    },
    {
      id: "parties",
      kind: "parties",
      label: "mcap.review.summary.parties",
    },
    {
      id: "services",
      kind: "services",
      label: "mcap.review.summary.services",
    },
  ],
  steps: [
    {
      id: "applicant",
      title: "mcap.common.steps.applicant",
      description: "ee.auto.k112",
      fields: buildApplicantFields(),
    },
    {
      id: "compliance",
      title: "ee.auto.k113",
      description: "ee.auto.k114",
      fields: buildComplianceFields(),
    },
    {
      id: "company",
      title: "mcap.common.steps.company",
      description: "ee.auto.k115",
      fields: buildCompanyFields(),
    },
    {
      id: "parties",
      title: "mcap.common.steps.parties",
      description: "ee.auto.k116",
      widget: "PartiesManager",
      minParties: 1,
      requireDcp: true,
      requirePartyInvite: true,
    },
    {
      id: "accounting",
      title: "mcap.common.steps.accounting",
      fields: buildAccountingFields(),
    },
    {
      id: "services",
      title: "ee.auto.k117",
      description: "ee.auto.k118",
      widget: "ServiceSelectionWidget",
      fields: buildServiceFields(),
      serviceItems: (data) => buildEeServiceItems(data),
      supportedCurrencies: ["EUR", "USD", "HKD"],
      computeFees: (data) => computeEeFees(data),
    },
    {
      id: "invoice",
      title: "mcap.common.steps.invoice",
      description: "ee.auto.k119",
      widget: "InvoiceWidget",
      computeFees: (data) => computeEeFees(data),
    },
    {
      id: "payment",
      title: "ee.auto.k120",
      description: "ee.auto.k121",
      widget: "PaymentWidget",
      supportedCurrencies: ["EUR", "USD", "HKD"],
      computeFees: (data) => computeEeFees(data),
    },
    {
      id: "review",
      title: "ee.auto.k122",
      fields: [
        {
          type: "checkbox",
          name: "agreeToTerms",
          label: "ee.auto.k123",
          required: true,
          colSpan: 2,
        },
        {
          type: "checkbox",
          name: "truthfulnessDeclaration",
          label: "ee.auto.k124",
          required: true,
          colSpan: 2,
        },
        {
          type: "checkbox",
          name: "compliancePreconditionAcknowledgment",
          label:
            "ee.auto.k125",
          required: true,
          colSpan: 2,
        },
        {
          type: "signature",
          name: "eSign",
          label: "mcap.common.fields.electronicSignature",
          required: true,
          colSpan: 2,
        },
      ],
    },
  ],
};
