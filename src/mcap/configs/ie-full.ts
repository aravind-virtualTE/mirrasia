/* eslint-disable @typescript-eslint/no-explicit-any */
import { finYearOptions } from "@/pages/Company/NewHKForm/hkIncorpo";
import type { McapConfig, McapFeeItem, McapField } from "./types";

type IeServiceItem = {
  id: string;
  label: string;
  amount: number;
  original: number;
  mandatory: boolean;
  kind?: "government" | "service" | "optional" | "other";
  info?: string;
};

const YES_NO_UNKNOWN = [
  { label: "mcap.common.options.yes", value: "yes" },
  { label: "mcap.common.options.no", value: "no" },
  { label: "mcap.common.options.doNotKnow", value: "unknown" },
];

const APPLICANT_RELATIONSHIP_OPTIONS = [
  { label: "mcap.ie.auto.k001", value: "director" },
  { label: "mcap.ie.auto.k002", value: "executive_manager" },
  { label: "mcap.ie.auto.k003", value: "delegate" },
  { label: "mcap.ie.auto.k004", value: "major_shareholder" },
  {
    label: "mcap.ie.auto.k005",
    value: "professional_advisor",
  },
  { label: "mcap.common.options.other", value: "other" },
];

const INDUSTRY_OPTIONS = [
  { label: "mcap.ie.auto.k006", value: "crypto_related" },
  { label: "mcap.ie.auto.k007", value: "it_blockchain_software" },
  { label: "mcap.ie.auto.k008", value: "crypto_investment" },
  { label: "mcap.ie.auto.k009", value: "crypto_games" },
  { label: "mcap.ie.auto.k010", value: "online_games" },
  { label: "mcap.ie.auto.k011", value: "forex_trading" },
  { label: "mcap.ie.auto.k012", value: "finance_investment_consulting" },
  { label: "mcap.ie.auto.k013", value: "trade" },
  { label: "mcap.ie.auto.k014", value: "wholesale_retail" },
  { label: "mcap.ie.auto.k015", value: "consulting" },
  { label: "mcap.ie.auto.k016", value: "manufacturing" },
  { label: "mcap.ie.auto.k017", value: "ecommerce" },
  { label: "mcap.ie.auto.k018", value: "online_purchase_delivery_agency" },
  { label: "mcap.common.options.other", value: "other" },
];

const PURPOSE_OPTIONS = [
  { label: "mcap.ie.auto.k019", value: "business_diversification" },
  { label: "mcap.ie.auto.k020", value: "advisor_partner_suggestion" },
  { label: "mcap.ie.auto.k021", value: "europe_expansion" },
  { label: "mcap.ie.auto.k022", value: "asset_management" },
  { label: "mcap.ie.auto.k023", value: "holding_company" },
  { label: "mcap.ie.auto.k024", value: "financial_policy_advantage" },
  { label: "mcap.ie.auto.k025", value: "tax_rate_advantage" },
  { label: "mcap.common.options.other", value: "other" },
];

const QUOTE_ONLY_OPTIONS = [
  {
    label: "mcap.ie.auto.k026",
    value: "consulting_quote",
  },
  { label: "mcap.ie.auto.k027", value: "other" },
];

const IE_PRICING = {
  incorporation_and_first_year_package: 3100,
  bank_account_opening: 1200,
  bond_2y_eur_reference: 2000,
  local_director_registration_1y: 5500,
  additional_local_director_1y: 2500,
  annual_company_renewal: 2500,
} as const;

const getSelectedServiceIds = (data: Record<string, any>) => {
  const ids = new Set<string>();
  const optionalFeeIds = Array.isArray(data?.optionalFeeIds) ? data.optionalFeeIds : [];
  const serviceItemsSelected = Array.isArray(data?.serviceItemsSelected) ? data.serviceItemsSelected : [];
  optionalFeeIds.forEach((id: any) => ids.add(String(id)));
  serviceItemsSelected.forEach((id: any) => ids.add(String(id)));
  return ids;
};

export const buildIeServiceItems = (data: Record<string, any>): IeServiceItem[] => {
  const items: IeServiceItem[] = [
    {
      id: "ie_incorporation_first_year_package",
      label: "mcap.ie.auto.k028",
      amount: IE_PRICING.incorporation_and_first_year_package,
      original: IE_PRICING.incorporation_and_first_year_package,
      mandatory: true,
      kind: "service",
      info:
        "mcap.ie.auto.k029",
    },
    {
      id: "ie_bank_account_opening",
      label: "mcap.ie.auto.k030",
      amount: IE_PRICING.bank_account_opening,
      original: IE_PRICING.bank_account_opening,
      mandatory: false,
      kind: "service",
    },
    {
      id: "ie_bond_2y_eur_reference",
      label: "mcap.ie.auto.k031",
      amount: IE_PRICING.bond_2y_eur_reference,
      original: IE_PRICING.bond_2y_eur_reference,
      mandatory: false,
      kind: "other",
      info:
        "mcap.ie.auto.k032",
    },
    {
      id: "ie_local_director_registration_1y",
      label: "mcap.ie.auto.k033",
      amount: IE_PRICING.local_director_registration_1y,
      original: IE_PRICING.local_director_registration_1y,
      mandatory: false,
      kind: "service",
    },
    {
      id: "ie_additional_local_director_1y",
      label: "mcap.ie.auto.k034",
      amount: IE_PRICING.additional_local_director_1y,
      original: IE_PRICING.additional_local_director_1y,
      mandatory: false,
      kind: "service",
      info:
        "mcap.ie.auto.k035",
    },
    {
      id: "ie_annual_company_renewal",
      label: "mcap.ie.auto.k036",
      amount: IE_PRICING.annual_company_renewal,
      original: IE_PRICING.annual_company_renewal,
      mandatory: false,
      kind: "service",
      info:
        "mcap.ie.auto.k037",
    },
  ];

  const quoteOnlyRequests = Array.isArray(data?.ieQuoteOnlyServiceRequests)
    ? data.ieQuoteOnlyServiceRequests.map((entry: any) => String(entry))
    : [];

  if (quoteOnlyRequests.includes("consulting_quote")) {
    items.push({
      id: "ie_quote_only_consulting",
      label: "mcap.ie.auto.k038",
      amount: 0,
      original: 0,
      mandatory: true,
      kind: "other",
    });
  }

  if (quoteOnlyRequests.includes("other")) {
    items.push({
      id: "ie_quote_only_other",
      label: "mcap.ie.auto.k027",
      amount: 0,
      original: 0,
      mandatory: true,
      kind: "other",
      info: String(data?.ieQuoteOnlyServiceRequestsOther || "").trim() || "Other request captured in application.",
    });
  }

  return items;
};

export const computeIeFees = (data: Record<string, any>) => {
  const selectedServiceIds = getSelectedServiceIds(data);
  const allItems = buildIeServiceItems(data);

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
      "mcap.ie.auto.k039",
  };
};

const buildApplicantFields = (): McapField[] => [
  { type: "text", name: "applicantName", label: "newHk.steps.applicant.fields.applicantName.label", required: true },
  { type: "email", name: "applicantEmail", label: "newHk.steps.applicant.fields.email.label", required: true },
  { type: "text", name: "applicantPhone", label: "newHk.steps.applicant.fields.phone.label", required: true },
  { type: "text", name: "companyName1", label: "newHk.steps.applicant.fields.name1.label", required: true, colSpan: 2 },
  { type: "text", name: "companyName2", label: "newHk.steps.applicant.fields.name2.label", colSpan: 2 },
  { type: "text", name: "companyName3", label: "newHk.steps.applicant.fields.name3.label", colSpan: 2 },
  {
    type: "checkbox-group",
    name: "writerRelationship",
    label: "mcap.ie.auto.k040",
    required: true,
    options: APPLICANT_RELATIONSHIP_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "writerRelationshipOther",
    label: "mcap.common.fields.otherRelationshipDetails",
    condition: (f) => Array.isArray(f.writerRelationship) && f.writerRelationship.includes("other"),
    required: true,
  },
  {
    type: "select",
    name: "sns",
    label: "newHk.steps.applicant.fields.sns.label",
    options: [
      { label: "newHk.steps.applicant.fields.sns.options.WhatsApp", value: "WhatsApp" },
      { label: "newHk.steps.applicant.fields.sns.options.WeChat", value: "WeChat" },
      { label: "newHk.steps.applicant.fields.sns.options.Line", value: "Line" },
      { label: "newHk.steps.applicant.fields.sns.options.KakaoTalk", value: "KakaoTalk" },
      { label: "newHk.steps.applicant.fields.sns.options.Telegram", value: "Telegram" },
    ],
  },
  {
    type: "text",
    name: "snsId",
    label: "newHk.steps.applicant.fields.snsId.label",
    condition: (f) => !!f.sns,
  },
];

const buildComplianceFields = (): McapField[] => [
  {
    type: "radio-group",
    name: "legalEthicalIssues",
    label:
      "mcap.ie.auto.k041",
    required: true,
    options: [
      { label: "mcap.common.options.yes", value: "yes" },
      { label: "mcap.common.options.no", value: "no" },
      { label: "mcap.common.options.doNotKnow", value: "unknown" },
      { label: "mcap.ie.auto.k042", value: "consider_legal_advice" },
      { label: "mcap.common.options.other", value: "other" },
    ],
    colSpan: 2,
  },
  {
    type: "text",
    name: "legalEthicalIssuesOther",
    label: "mcap.ie.auto.k043",
    condition: (f) => f.legalEthicalIssues === "other",
    required: true,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "annualRenewalConsent",
    label:
      "mcap.ie.auto.k044",
    required: true,
    options: [
      { label: "mcap.common.options.yes", value: "yes" },
      { label: "mcap.common.options.no", value: "no" },
      { label: "mcap.ie.auto.k045", value: "internal_after_establishment" },
      { label: "mcap.ie.auto.k046", value: "no_if_fixed_annual_cost" },
      { label: "mcap.ie.auto.k047", value: "advice_required" },
    ],
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "sanctionedCountryBusiness",
    label:
      "mcap.ie.auto.k048",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "sanctionedResidenceExposure",
    label:
      "mcap.ie.auto.k049",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "sanctionedOwnershipOrAgency",
    label:
      "mcap.ie.auto.k050",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "crimeaSevastopolExposure",
    label: "mcap.ie.auto.k051",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "restrictedSectorExposure",
    label:
      "mcap.ie.auto.k052",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
];

const buildCompanyFields = (): McapField[] => [
  {
    type: "info",
    label: "mcap.ie.auto.k053",
    content:
      "mcap.ie.auto.k054",
    colSpan: 2,
  },
  {
    type: "checkbox-group",
    name: "industrySelection",
    label: "mcap.ie.auto.k055",
    required: true,
    options: INDUSTRY_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "industrySelectionOther",
    label: "mcap.ie.auto.k056",
    condition: (f) => Array.isArray(f.industrySelection) && f.industrySelection.includes("other"),
    required: true,
    colSpan: 2,
  },
  {
    type: "textarea",
    name: "productServiceDescription",
    label: "mcap.ie.auto.k057",
    required: true,
    rows: 3,
    colSpan: 2,
  },
  {
    type: "textarea",
    name: "businessSummary",
    label: "mcap.ie.auto.k058",
    required: true,
    rows: 4,
    colSpan: 2,
  },
  {
    type: "text",
    name: "websiteAddress",
    label: "mcap.common.fields.websiteAddressOptional",
    placeholder: "mcap.ie.auto.k059",
    colSpan: 2,
  },
  {
    type: "checkbox-group",
    name: "purposeOfEstablishment",
    label: "mcap.ie.auto.k060",
    required: true,
    options: PURPOSE_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "purposeOfEstablishmentOther",
    label: "mcap.ie.auto.k061",
    condition: (f) => Array.isArray(f.purposeOfEstablishment) && f.purposeOfEstablishment.includes("other"),
    required: true,
    colSpan: 2,
  },

  {
    type: "select",
    name: "totalShares",
    label: "mcap.ie.auto.k062",
    required: true,
    options: [
      { label: "mcap.ie.auto.k063", value: "1" },
      { label: "mcap.ie.auto.k064", value: "100" },
      { label: "mcap.ie.auto.k065", value: "1000" },
      { label: "mcap.ie.auto.k066", value: "10000" },
      { label: "mcap.ie.auto.k067", value: "100000" },
      { label: "mcap.common.options.other", value: "other" },
    ],
  },
  {
    type: "text",
    name: "totalSharesOther",
    label: "mcap.ie.auto.k068",
    condition: (f) => f.totalShares === "other",
    required: true,
  },
  {
    type: "select",
    name: "paidInCapitalEur",
    label: "mcap.ie.auto.k069",
    required: true,
    options: [
      { label: "mcap.ie.auto.k070", value: "0.01" },
      { label: "mcap.ie.auto.k071", value: "1" },
      { label: "mcap.ie.auto.k072", value: "100" },
      { label: "mcap.ie.auto.k073", value: "1000" },
      { label: "mcap.ie.auto.k074", value: "10000" },
      { label: "mcap.ie.auto.k075", value: "100000" },
      { label: "mcap.common.options.other", value: "other" },
    ],
  },
  {
    type: "text",
    name: "paidInCapitalEurOther",
    label: "mcap.ie.auto.k076",
    condition: (f) => f.paidInCapitalEur === "other",
    required: true,
  },
  {
    type: "derived",
    name: "parValuePerShareEur",
    label: "mcap.ie.auto.k077",
    compute: (f) => {
      const parseNumeric = (value: any) => {
        const cleaned = String(value ?? "")
          .replace(/[,\s]/g, "")
          .replace(/eur/gi, "")
          .trim();
        const num = Number(cleaned);
        return Number.isFinite(num) ? num : 0;
      };

      const totalShares =
        String(f.totalShares || "") === "other"
          ? parseNumeric(f.totalSharesOther)
          : parseNumeric(f.totalShares);

      const paidInCapital =
        String(f.paidInCapitalEur || "") === "other"
          ? parseNumeric(f.paidInCapitalEurOther)
          : parseNumeric(f.paidInCapitalEur);

      if (!totalShares || totalShares <= 0) return "EUR 0.00";
      return `EUR ${(paidInCapital / totalShares).toFixed(4)}`;
    },
  },

  {
    type: "radio-group",
    name: "eeaDirectorOrBondPlan",
    label: "mcap.ie.auto.k078",
    required: true,
    options: [
      { label: "mcap.ie.auto.k079", value: "already_has_eea_director" },
      { label: "mcap.ie.auto.k080", value: "use_local_director_service" },
      { label: "mcap.ie.auto.k081", value: "purchase_bond" },
      { label: "mcap.ie.auto.k082", value: "need_advice" },
    ],
    colSpan: 2,
  },
  // {
  //   type: "radio-group",
  //   name: "naturalPersonDirectorConfirmation",
  //   label: "mcap.ie.auto.k083",
  //   required: true,
  //   options: [
  //     { label: "mcap.common.options.yes", value: "yes" },
  //     { label: "mcap.common.options.no", value: "no" },
  //     { label: "mcap.ie.auto.k084", value: "need_advice" },
  //   ],
  //   colSpan: 2,
  // },
  // {
  //   type: "radio-group",
  //   name: "secretaryArrangement",
  //   label: "mcap.ie.auto.k085",
  //   required: true,
  //   options: [
  //     { label: "mcap.ie.auto.k086", value: "director_also_secretary" },
  //     { label: "mcap.ie.auto.k087", value: "separate_secretary" },
  //   ],
  //   colSpan: 2,
  // },
  {
    type: "checkbox",
    name: "singleDirectorSecretaryAcknowledgment",
    label: "mcap.ie.auto.k088",
    required: true,
    condition: (f) => f.directorCountStructure === "one_director",
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "registeredAddressChoice",
    label: "mcap.ie.auto.k089",
    required: true,
    options: [
      { label: "mcap.ie.auto.k090", value: "use_mir_asia_address" },
      { label: "mcap.ie.auto.k091", value: "use_own_address" },
    ],
    colSpan: 2,
  },
  {
    type: "textarea",
    name: "registeredAddressOwnDetails",
    label: "mcap.ie.auto.k092",
    condition: (f) => f.registeredAddressChoice === "use_own_address",
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
    type: "textarea",
    name: "accountingNotes",
    label: "mcap.common.fields.accountingAndTaxNotes",
    rows: 3,
    colSpan: 2,
  },
];

const buildServiceFields = (): McapField[] => [
  {
    type: "info",
    label: "mcap.ie.auto.k093",
    content:
      "mcap.ie.auto.k094",
    colSpan: 2,
  },
  {
    type: "checkbox-group",
    name: "ieQuoteOnlyServiceRequests",
    label: "mcap.ie.auto.k095",
    options: QUOTE_ONLY_OPTIONS,
    colSpan: 2,
  },
  {
    type: "textarea",
    name: "ieQuoteOnlyServiceRequestsOther",
    label: "mcap.ie.auto.k096",
    condition: (f) =>
      Array.isArray(f.ieQuoteOnlyServiceRequests) && f.ieQuoteOnlyServiceRequests.includes("other"),
    required: true,
    rows: 3,
    colSpan: 2,
  },
];

export const IE_FULL_CONFIG: McapConfig = {
  id: "ie-full",
  countryCode: "IE",
  countryName: "Ireland",
  currency: "USD",
  title: "mcap.ie.auto.k097",
  confirmationDetails: {
    title: "mcap.ie.auto.k098",
    message:
      "mcap.ie.auto.k099",
    steps: [
      {
        title: "mcap.ie.auto.k100",
        description:
          "mcap.ie.auto.k101",
      },
      {
        title: "mcap.ie.auto.k102",
        description:
          "mcap.ie.auto.k103",
      },
      {
        title: "mcap.ie.auto.k104",
        description:
          "mcap.ie.auto.k105",
      },
    ],
  },
  steps: [
    {
      id: "applicant",
      title: "mcap.common.steps.applicant",
      description: "mcap.ie.auto.k106",
      fields: buildApplicantFields(),
    },
    {
      id: "compliance",
      title: "mcap.ie.auto.k107",
      description: "mcap.ie.auto.k108",
      fields: buildComplianceFields(),
    },
    {
      id: "company",
      title: "mcap.common.steps.company",
      description: "mcap.ie.auto.k109",
      fields: buildCompanyFields(),
    },
    {
      id: "parties",
      title: "mcap.common.steps.parties",
      description: "mcap.ie.auto.k110",
      widget: "PartiesManager",
      minParties: 1,
      requireDcp: true,
      requirePartyInvite: true,
      partyFields: [
        {
          key: "ieIsDirector",
          label: "mcap.ie.auto.k111",
          type: "select",
          options: [
            { label: "mcap.common.options.yes", value: "yes" },
            { label: "mcap.common.options.no", value: "no" },
          ],
          storage: "details",
        },
        {
          key: "ieIsSecretary",
          label: "mcap.ie.auto.k112",
          type: "select",
          options: [
            { label: "mcap.common.options.yes", value: "yes" },
            { label: "mcap.common.options.no", value: "no" },
          ],
          storage: "details",
        },
      ],
      partyCoverageRules: [
        {
          key: "ieIsDirector",
          storage: "details",
          requiredValues: ["yes"],
          label: "mcap.ie.auto.k113",
          valueLabels: {
            yes: "At least one director",
          },
        },
        {
          key: "ieIsSecretary",
          storage: "details",
          requiredValues: ["yes"],
          label: "mcap.ie.auto.k114",
          valueLabels: {
            yes: "At least one secretary",
          },
        },
      ],
    },
    {
      id: "accounting",
      title: "mcap.common.steps.accounting",
      fields: buildAccountingFields(),
    },
    {
      id: "services",
      title: "mcap.common.steps.services",
      description: "mcap.ie.auto.k115",
      widget: "ServiceSelectionWidget",
      fields: buildServiceFields(),
      serviceItems: (data) => buildIeServiceItems(data),
      supportedCurrencies: ["USD", "HKD"],
      computeFees: (data) => computeIeFees(data),
    },
    {
      id: "invoice",
      title: "mcap.common.steps.invoice",
      description: "mcap.ie.auto.k116",
      widget: "InvoiceWidget",
      computeFees: (data) => computeIeFees(data),
    },
    {
      id: "payment",
      title: "mcap.ie.auto.k117",
      description: "mcap.ie.auto.k118",
      widget: "PaymentWidget",
      supportedCurrencies: ["USD", "HKD"],
      computeFees: (data) => computeIeFees(data),
    },
    {
      id: "review",
      title: "mcap.ie.auto.k119",
      fields: [
        {
          type: "info",
          label: "mcap.ie.auto.k120",
          content:
            "mcap.ie.auto.k121",
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "applicationAgreement",
          label: "mcap.ie.auto.k122",
          required: true,
          options: [
            { label: "mcap.common.options.yes", value: "yes" },
            { label: "mcap.common.options.no", value: "no" },
          ],
          colSpan: 2,
        },
        {
          type: "checkbox",
          name: "truthfulnessDeclaration",
          label: "mcap.common.fields.truthfulnessDeclaration",
          required: true,
          colSpan: 2,
        },
        {
          type: "checkbox",
          name: "compliancePreconditionAcknowledgment",
          label: "mcap.ie.auto.k123",
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
