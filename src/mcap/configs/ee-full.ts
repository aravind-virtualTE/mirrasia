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

const YES_NO_UNKNOWN = [
  { label: "mcap.common.options.yes", value: "yes" },
  { label: "mcap.common.options.no", value: "no" },
  { label: "mcap.common.options.doNotKnow", value: "unknown" },
];

// const RELATIONSHIP_OPTIONS = [
//   { label: "mcap.ee.auto.k001", value: "officer" },
//   { label: "mcap.ee.auto.k002", value: "authorizedProxy" },
//   { label: "mcap.ee.auto.k003", value: "majorShareholder" },
//   { label: "mcap.ee.auto.k004", value: "professionalAdvisor" },
//   { label: "mcap.common.options.other", value: "other" },
// ];

const REQUESTED_SERVICE_OPTIONS = [
  {
    label: "mcap.ee.auto.k005",
    value: "estonia_llc_with_initial_maintenance",
  },
  { label: "mcap.ee.auto.k006", value: "emi_list" },
  { label: "mcap.ee.auto.k007", value: "emi_account_opening" },
  { label: "mcap.ee.auto.k008", value: "bank_account_opening" },
  { label: "mcap.ee.auto.k009", value: "legal_opinion_estonia" },
  { label: "mcap.ee.auto.k010", value: "legal_opinion_domestic_listing" },
  { label: "mcap.ee.auto.k011", value: "legal_opinion_other_country" },
  { label: "mcap.ee.auto.k012", value: "business_consulting" },
  { label: "mcap.common.options.other", value: "other" },
];

const INDUSTRY_OPTIONS = [
  { label: "mcap.ee.auto.k013", value: "crypto_related" },
  { label: "mcap.ee.auto.k014", value: "it_blockchain_software" },
  { label: "mcap.ee.auto.k015", value: "crypto_investment" },
  { label: "mcap.ee.auto.k016", value: "crypto_games" },
  { label: "mcap.ee.auto.k017", value: "forex_trading" },
  { label: "mcap.ee.auto.k018", value: "finance_investment_consulting" },
  { label: "mcap.ee.auto.k019", value: "trade" },
  { label: "mcap.ee.auto.k020", value: "wholesale_retail" },
  { label: "mcap.ee.auto.k021", value: "consulting" },
  { label: "mcap.ee.auto.k022", value: "manufacturing" },
  { label: "mcap.ee.auto.k023", value: "ecommerce" },
  { label: "mcap.ee.auto.k024", value: "online_direct_purchase" },
  { label: "mcap.common.options.other", value: "other" },
];

const PURPOSE_OPTIONS = [
  { label: "mcap.ee.auto.k025", value: "business_diversification" },
  { label: "mcap.ee.auto.k026", value: "advisor_or_partner_suggestion" },
  { label: "mcap.ee.auto.k027", value: "international_expansion" },
  { label: "mcap.ee.auto.k028", value: "asset_management" },
  { label: "mcap.ee.auto.k029", value: "holding_company" },
  {
    label: "mcap.ee.auto.k030",
    value: "free_financial_policy_advantage",
  },
  { label: "mcap.ee.auto.k031", value: "low_tax_transaction_growth" },
  { label: "mcap.ee.auto.k032", value: "no_capital_gains_tax" },
  { label: "mcap.common.options.other", value: "other" },
];

const QUOTE_ONLY_OPTIONS = [
  { label: "mcap.ee.auto.k033", value: "emi_account_opening" },
  { label: "mcap.ee.auto.k034", value: "bank_account_opening" },
  { label: "mcap.ee.auto.k009", value: "legal_opinion_estonia" },
  { label: "mcap.ee.auto.k010", value: "legal_opinion_domestic_listing" },
  { label: "mcap.ee.auto.k011", value: "legal_opinion_other_country" },
  { label: "mcap.ee.auto.k012", value: "business_consulting" },
  { label: "mcap.ee.auto.k035", value: "other" },
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
      label: "mcap.ee.auto.k036",
      amount: EE_PRICING.incorporation_professional,
      original: EE_PRICING.incorporation_professional,
      mandatory: true,
      kind: "service",
      info: "mcap.ee.auto.k037",
    },
    {
      id: "ee_state_fee",
      label: "mcap.ee.auto.k038",
      amount: EE_PRICING.state_fee,
      original: EE_PRICING.state_fee,
      mandatory: true,
      kind: "government",
      info: "mcap.ee.auto.k039",
    },
    {
      id: "ee_business_address_1y",
      label: "mcap.ee.auto.k040",
      amount: EE_PRICING.business_address_1y,
      original: EE_PRICING.business_address_1y,
      mandatory: true,
      kind: "service",
      info: "mcap.ee.auto.k041",
    },
    {
      id: "ee_management_followup_1y",
      label: "mcap.ee.auto.k042",
      amount: EE_PRICING.management_followup_1y,
      original: EE_PRICING.management_followup_1y,
      mandatory: true,
      kind: "service",
      info: "mcap.ee.auto.k043",
    },
  ];

  if (contactPersonMode === "mirr_provided") {
    items.push({
      id: "ee_contact_person_1y",
      label: "mcap.ee.auto.k044",
      amount: EE_PRICING.contact_person_1y,
      original: EE_PRICING.contact_person_1y,
      mandatory: true,
      kind: "service",
      info: "mcap.ee.auto.k045",
    });
  }

  items.push(
    {
      id: "ee_poa_addon",
      label: "mcap.ee.auto.k046",
      amount: EE_PRICING.poa_addon,
      original: EE_PRICING.poa_addon,
      mandatory: false,
      kind: "optional",
    },
    {
      id: "ee_emi_list",
      label: "mcap.ee.auto.k047",
      amount: EE_PRICING.emi_list,
      original: EE_PRICING.emi_list,
      mandatory: false,
      kind: "optional",
      info: "mcap.ee.auto.k048",
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
      "mcap.ee.auto.k049",
  };
};

const buildApplicantFields = (): McapField[] => [
  {
    type: "info",
    label: "mcap.ee.auto.k050",
    content:
      "mcap.ee.auto.k051",
    colSpan: 2,
  },
  {
    type: "text",
    name: "authorName",
    label: "mcap.ee.auto.k052",
    required: true,
    colSpan: 2,
  },
   {
    type: "email",
    name: "email",
    label: "mcap.ee.auto.k055",
    required: true,
    colSpan: 2,
  },
  {
    type: "text",
    name: "proposedCompanyName1",
    label: "mcap.ee.auto.k075",
    required: true,
    colSpan: 2,
  },
  {
    type: "text",
    name: "proposedCompanyName2",
    label: "mcap.ee.auto.k076",
    required: true,
    colSpan: 2,
  },
  {
    type: "text",
    name: "proposedCompanyName3",
    label: "mcap.ee.auto.k077",
    required: true,
    colSpan: 2,
  },
  {
    type: "checkbox-group",
    name: "relationshipToEstonianCorporation",
    label: "mcap.ee.auto.k053",
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
    label: "mcap.ee.auto.k054",
    required: true,
    colSpan: 2,
  },
 
  {
    type: "text",
    name: "snsId",
    label: "mcap.ee.auto.k056",
    colSpan: 2,
  },
];

const buildComplianceFields = (): McapField[] => [
  {
    type: "radio-group",
    name: "legalOrEthicalIssuesConcern",
    label: "mcap.ee.auto.k057",
    required: true,
    options: [
      { label: "mcap.common.options.yes", value: "yes" },
      { label: "mcap.common.options.no", value: "no" },
      { label: "mcap.common.options.doNotKnow", value: "unknown" },
      { label: "mcap.common.options.other", value: "other" },
    ],
    colSpan: 2,
  },
  {
    type: "text",
    name: "legalOrEthicalIssuesConcernOther",
    label: "mcap.ee.auto.k058",
    condition: (f) => f.legalOrEthicalIssuesConcern === "other",
    required: true,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "annualRenewalAgreement",
    label: "mcap.ee.auto.k059",
    required: true,
    options: [
      { label: "mcap.common.options.yes", value: "yes" },
      { label: "mcap.common.options.no", value: "no" },
      { label: "mcap.ee.auto.k060", value: "self_handle" },
      { label: "mcap.ee.auto.k061", value: "no_if_fixed_cost" },
      { label: "mcap.ee.auto.k062", value: "advice_required" },
    ],
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "businessInSanctionedCountries",
    label: "mcap.ee.auto.k063",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "personsResidingInSanctionedCountries",
    label: "mcap.ee.auto.k064",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "ownershipBySanctionedPersons",
    label: "mcap.ee.auto.k065",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "crimeaOrSevastopolActivity",
    label: "mcap.ee.auto.k066",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "oilGasMilitaryEnergySectorActivity",
    label: "mcap.ee.auto.k067",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
];

const buildCompanyFields = (): McapField[] => [
  {
    type: "checkbox-group",
    name: "industries",
    label: "mcap.ee.auto.k068",
    required: true,
    options: INDUSTRY_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "otherIndustryDetails",
    label: "mcap.ee.auto.k069",
    condition: (f) => Array.isArray(f.industries) && f.industries.includes("other"),
    required: true,
    colSpan: 2,
  },
  {
    type: "textarea",
    name: "businessDescription",
    label: "mcap.ee.auto.k070",
    required: true,
    rows: 4,
    colSpan: 2,
  },
  {
    type: "text",
    name: "website",
    label: "mcap.ee.auto.k071",
    placeholder: "mcap.ee.auto.k072",
    colSpan: 2,
  },
  {
    type: "checkbox-group",
    name: "purposeOfEstablishment",
    label: "mcap.ee.auto.k073",
    required: true,
    options: PURPOSE_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "otherPurposeDetails",
    label: "mcap.ee.auto.k074",
    condition: (f) => Array.isArray(f.purposeOfEstablishment) && f.purposeOfEstablishment.includes("other"),
    required: true,
    colSpan: 2,
  },
  
  {
    type: "radio-group",
    name: "totalCapitalEUR",
    label: "mcap.ee.auto.k078",
    required: true,
    defaultValue: "1",
    options: [
      { label: "mcap.ee.auto.k079", value: "1" },
      { label: "mcap.ee.auto.k080", value: "2500" },
      { label: "mcap.ee.auto.k081", value: "25000" },
      { label: "mcap.common.options.other", value: "other" },
    ],
    colSpan: 2,
  },
  {
    type: "number",
    name: "totalCapitalEUROther",
    label: "mcap.ee.auto.k082",
    condition: (f) => f.totalCapitalEUR === "other",
    required: true,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "executiveComposition",
    label: "mcap.ee.auto.k083",
    required: true,
    options: [
      { label: "mcap.ee.auto.k084", value: "single_dcp_led" },
      { label: "mcap.ee.auto.k085", value: "multiple_individuals" },
      { label: "mcap.ee.auto.k086", value: "corporate_member_structure" },
      { label: "mcap.common.options.other", value: "other" },
    ],
    colSpan: 2,
  },
  {
    type: "text",
    name: "executiveCompositionOther",
    label: "mcap.ee.auto.k087",
    condition: (f) => f.executiveComposition === "other",
    required: true,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "registeredAddressOption",
    label: "mcap.ee.auto.k088",
    required: true,
    options: [
      {
        label: "mcap.ee.auto.k089",
        value: "mirr_business_address",
      },
      {
        label: "mcap.ee.auto.k090",
        value: "own_address",
      },
    ],
    colSpan: 2,
  },
  {
    type: "textarea",
    name: "registeredAddressDetails",
    label: "mcap.ee.auto.k091",
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
    label: "mcap.ee.auto.k092",
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
      { label: "mcap.ee.auto.k093", value: "advice" },
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
  {
    type: "info",
    label: "mcap.ee.auto.k094",
    content:
      "mcap.ee.auto.k095",
    colSpan: 2,
  },
  {
    type: "select",
    name: "contactPersonMode",
    label: "mcap.ee.auto.k096",
    required: true,
    defaultValue: "mirr_provided",
    options: [
      {
        label: "mcap.ee.auto.k097",
        value: "mirr_provided",
      },
      {
        label: "mcap.ee.auto.k098",
        value: "dcp_provided",
      },
    ],
    colSpan: 2,
  },
  {
    type: "checkbox-group",
    name: "requestedServices",
    label: "mcap.ee.auto.k099",
    defaultValue: ["estonia_llc_with_initial_maintenance"],
    options: REQUESTED_SERVICE_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "requestedServicesOther",
    label: "mcap.ee.auto.k100",
    condition: (f) => Array.isArray(f.requestedServices) && f.requestedServices.includes("other"),
    required: true,
    colSpan: 2,
  },
  {
    type: "checkbox-group",
    name: "eeQuoteOnlyServiceRequests",
    label: "mcap.ee.auto.k101",
    options: QUOTE_ONLY_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "eeQuoteOnlyServiceRequestsOther",
    label: "mcap.ee.auto.k102",
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
  title: "mcap.ee.auto.k103",
  confirmationDetails: {
    title: "mcap.ee.auto.k104",
    message:
      "mcap.ee.auto.k105",
    steps: [
      {
        title: "mcap.ee.auto.k106",
        description:
          "mcap.ee.auto.k107",
      },
      {
        title: "mcap.ee.auto.k108",
        description:
          "mcap.ee.auto.k109",
      },
      {
        title: "mcap.ee.auto.k110",
        description:
          "mcap.ee.auto.k111",
      },
    ],
  },
  steps: [
    {
      id: "applicant",
      title: "mcap.common.steps.applicant",
      description: "mcap.ee.auto.k112",
      fields: buildApplicantFields(),
    },
    {
      id: "compliance",
      title: "mcap.ee.auto.k113",
      description: "mcap.ee.auto.k114",
      fields: buildComplianceFields(),
    },
    {
      id: "company",
      title: "mcap.common.steps.company",
      description: "mcap.ee.auto.k115",
      fields: buildCompanyFields(),
    },
    {
      id: "parties",
      title: "mcap.common.steps.parties",
      description: "mcap.ee.auto.k116",
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
      title: "mcap.ee.auto.k117",
      description: "mcap.ee.auto.k118",
      widget: "ServiceSelectionWidget",
      fields: buildServiceFields(),
      serviceItems: (data) => buildEeServiceItems(data),
      supportedCurrencies: ["USD", "HKD"],
      computeFees: (data) => computeEeFees(data),
    },
    {
      id: "invoice",
      title: "mcap.common.steps.invoice",
      description: "mcap.ee.auto.k119",
      widget: "InvoiceWidget",
      computeFees: (data) => computeEeFees(data),
    },
    {
      id: "payment",
      title: "mcap.ee.auto.k120",
      description: "mcap.ee.auto.k121",
      widget: "PaymentWidget",
      supportedCurrencies: ["USD", "HKD"],
      computeFees: (data) => computeEeFees(data),
    },
    {
      id: "review",
      title: "mcap.ee.auto.k122",
      fields: [
        {
          type: "checkbox",
          name: "agreeToTerms",
          label: "mcap.ee.auto.k123",
          required: true,
          colSpan: 2,
        },
        {
          type: "checkbox",
          name: "truthfulnessDeclaration",
          label: "mcap.ee.auto.k124",
          required: true,
          colSpan: 2,
        },
        {
          type: "checkbox",
          name: "compliancePreconditionAcknowledgment",
          label:
            "mcap.ee.auto.k125",
          required: true,
          colSpan: 2,
        },
        {
          type: "text",
          name: "eSign",
          label: "mcap.common.fields.electronicSignature",
          required: true,
          colSpan: 2,
        },
      ],
    },
  ],
};
