/* eslint-disable @typescript-eslint/no-explicit-any */
import { applicantRoles, finYearOptions } from "@/pages/Company/NewHKForm/hkIncorpo";
import type {
  McapConfig,
  McapFeeItem,
  McapField,
  McapFieldChangeAction,
  McapRuntimeContext,
  McapStep,
} from "./types";

export const CH_UNIFIED_FLOW_VERSION = "unified_v1";
export const CH_UNIFIED_FLOW_VERSION_FIELD = "chFlowVersion";
export const CH_INCORPORATION_TYPE_FIELD = "chIncorporationType";
export const CH_UNIFIED_CONFIG_ID = "ch-unified-full";

type ChIncorporationType = "ag" | "gmbh" | "foundation";
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

type ChFoundationServiceItem = {
  id: string;
  label: string;
  amount: number;
  original: number;
  mandatory: boolean;
  kind?: "government" | "service" | "optional" | "other";
  info?: string;
  estimated?: boolean;
};

const CH_FIXED_TITLE = "ch.unified.title";

const CH_INCORPORATION_TYPE_OPTIONS: Array<{ label: string; value: ChIncorporationType }> = [
  { label: "ch.unified.selector.options.ag", value: "ag" },
  { label: "ch.unified.selector.options.gmbh", value: "gmbh" },
  { label: "ch.unified.selector.options.foundation", value: "foundation" },
];

const CH_CORPORATE_PRICING = {
  setup_and_maintenance_1y: 8500,
  local_director_support_1y: 18000,
  bank_opening_capital_operating: 2500,
  registered_office_pobox_1y: 3000,
  registered_office_flexidesk_1y: 6800,
  emi_list_provision: 0,
} as const;

const CH_FOUNDATION_PRICING = {
  foundation_setup: 13500,
  local_board_member_1y: 20000,
  registered_office_pobox_1y: 3000,
  registered_office_flexidesk_1y: 6800,
  bank_opening_capital_operating: 2500,
  accounting_tax_annual: 3800,
  annual_foundation_report_estimated: 6000,
} as const;

const YES_NO_OPTIONS = [
  { label: "mcap.common.options.yes", value: "yes" },
  { label: "mcap.common.options.no", value: "no" },
];

const YES_NO_DONT_KNOW_OPTIONS = [
  { label: "mcap.common.options.yes", value: "yes" },
  { label: "mcap.common.options.no", value: "no" },
  { label: "mcap.common.options.doNotKnow", value: "unknown" },
];

const ANNUAL_RENEWAL_OPTIONS = [
  { label: "mcap.common.options.yes", value: "yes" },
  { label: "mcap.common.options.no", value: "no" },
  { label: "mcap.common.options.internalResolution", value: "internal_resolution" },
  { label: "mcap.common.options.noIfFixedAnnualCosts", value: "no_if_fixed_cost" },
  { label: "mcap.common.options.adviceRequiredBeforeProceeding", value: "advice_required" },
];

const CH_INDUSTRY_OPTIONS = [
  { label: "ch.options.industry.cryptoRelated", value: "crypto_related" },
  { label: "ch.options.industry.itBlockchain", value: "it_blockchain" },
  { label: "ch.options.industry.financeInvestment", value: "finance_investment" },
  { label: "ch.options.industry.tradeWholesale", value: "trade_wholesale" },
  { label: "ch.options.industry.manufacturing", value: "manufacturing" },
  { label: "ch.options.industry.ecommerce", value: "ecommerce" },
  { label: "ch.options.industry.consulting", value: "consulting" },
  { label: "mcap.common.options.other", value: "other" },
];

const CH_FOUNDATION_INDUSTRY_OPTIONS = [
  { label: "ch.options.industry.cryptoRelated", value: "crypto" },
  { label: "ch.options.industry.itBlockchain", value: "it_blockchain" },
  { label: "ch.options.industry.financeInvestment", value: "finance_investment" },
  { label: "ch.options.industry.tradeWholesale", value: "trade_wholesale" },
  { label: "ch.options.industry.manufacturing", value: "manufacturing" },
  { label: "ch.options.industry.ecommerce", value: "ecommerce" },
  { label: "ch.options.industry.consulting", value: "consulting" },
  { label: "mcap.common.options.other", value: "other" },
];

const CH_PURPOSE_OPTIONS = [
  { label: "ch.options.purpose.euExpansion", value: "eu_expansion" },
  { label: "ch.options.purpose.regulatoryDiversification", value: "regulatory_diversification" },
  { label: "ch.options.purpose.advisorRecommendation", value: "advisor_recommendation" },
  { label: "ch.options.purpose.holdingAssetManagement", value: "holding_asset_management" },
  { label: "ch.options.purpose.internationalStructuring", value: "international_structuring" },
  { label: "ch.options.purpose.optimization", value: "optimization" },
  { label: "mcap.common.options.other", value: "other" },
];

const CH_QUOTE_ONLY_OPTIONS = [
  { label: "ch.options.quoteOnly.annualAccountingTax", value: "annual_accounting_tax_quote" },
  { label: "ch.options.quoteOnly.emiOpening", value: "emi_account_opening_quote" },
  { label: "ch.options.quoteOnly.legalOpinionSwiss", value: "legal_opinion_swiss_quote" },
  { label: "ch.options.quoteOnly.legalOpinionExchange", value: "legal_opinion_exchange_quote" },
  { label: "ch.options.quoteOnly.consulting", value: "consulting_quote" },
  { label: "mcap.common.options.other", value: "other" },
];

const normalizeIncorporationType = (value: unknown): ChIncorporationType | null => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "ag" || normalized === "gmbh" || normalized === "foundation") {
    return normalized;
  }
  return null;
};

const resolveIncorporationType = (data: Record<string, any>): ChIncorporationType =>
  normalizeIncorporationType(data?.[CH_INCORPORATION_TYPE_FIELD]) || "ag";

const isPaymentCompleted = (paymentStatus: unknown) =>
  String(paymentStatus || "").trim().toLowerCase() === "paid";

const getSelectedServiceIds = (data: Record<string, any>) => {
  const ids = new Set<string>();
  const optionalFeeIds = Array.isArray(data?.optionalFeeIds) ? data.optionalFeeIds : [];
  const serviceItemsSelected = Array.isArray(data?.serviceItemsSelected) ? data.serviceItemsSelected : [];
  optionalFeeIds.forEach((id: any) => ids.add(String(id)));
  serviceItemsSelected.forEach((id: any) => ids.add(String(id)));
  return ids;
};

const getBoardServiceMode = (data: Record<string, any>) =>
  String(data?.boardServiceMode || "mirr_provided");

const getRegisteredOfficeMode = (data: Record<string, any>) =>
  String(data?.registeredOfficeMode || "pobox");

const getBankOpeningMode = (data: Record<string, any>) =>
  String(data?.bankOpeningMode || "mirr_opening");

const buildSelectorStep = (): McapStep => ({
  id: "ch-company-type",
  title: "ch.unified.steps.companyType.title",
  description: "ch.unified.steps.companyType.description",
  fields: [
    {
      type: "info",
      content: "ch.unified.selector.help",
      colSpan: 2,
    },
    {
      type: "select",
      name: CH_INCORPORATION_TYPE_FIELD,
      label: "ch.unified.selector.label",
      required: true,
      options: CH_INCORPORATION_TYPE_OPTIONS,
      colSpan: 2,
    },
    {
      type: "info",
      content: "ch.unified.typeChange.lockedAfterPayment",
      condition: (data) => isPaymentCompleted(data?.paymentStatus),
      colSpan: 2,
    },
    {
      type: "info",
      content: "ch.unified.typeChange.resetNote",
      condition: (data) =>
        !!normalizeIncorporationType(data?.[CH_INCORPORATION_TYPE_FIELD])
        && !isPaymentCompleted(data?.paymentStatus),
      colSpan: 2,
    },
  ],
});

const buildSelectorFields = () => buildSelectorStep().fields || [];

const injectSelectorIntoApplicantStep = (targetConfig: McapConfig): McapConfig => {
  const selectorFields = buildSelectorFields();
  if (selectorFields.length === 0) return targetConfig;

  const steps = (targetConfig.steps || []).map((step) => {
    if (String(step.id || "").trim().toLowerCase() !== "applicant") {
      return step;
    }

    const existingNames = new Set(
      (step.fields || [])
        .map((field) => String(field?.name || "").trim())
        .filter(Boolean)
    );
    if (existingNames.has(CH_INCORPORATION_TYPE_FIELD)) {
      return step;
    }

    return {
      ...step,
      fields: [...selectorFields, ...(step.fields || [])],
    };
  });

  return {
    ...targetConfig,
    steps,
  };
};

export const buildChCorporateServiceItems = (
  data: Record<string, any>,
  variant: ChCorporateVariant
): ChCorporateServiceItem[] => {
  const boardServiceMode = getBoardServiceMode(data);
  const registeredOfficeMode = getRegisteredOfficeMode(data);
  const bankOpeningMode = getBankOpeningMode(data);

  const localSupportKeyPrefix =
    variant === "AG"
      ? "ch.corporate.services.items.localSupport.ag"
      : "ch.corporate.services.items.localSupport.gmbh";

  const items: ChCorporateServiceItem[] = [
    {
      id: "ch_setup_maintenance_1y",
      label: "ch.corporate.services.items.setupMaintenance.label",
      amount: CH_CORPORATE_PRICING.setup_and_maintenance_1y,
      original: CH_CORPORATE_PRICING.setup_and_maintenance_1y,
      mandatory: true,
      kind: "service",
      info: "ch.corporate.services.items.setupMaintenance.info",
    },
  ];

  if (boardServiceMode === "mirr_provided") {
    items.push({
      id: "ch_local_director_support_1y",
      label: `${localSupportKeyPrefix}.label`,
      amount: CH_CORPORATE_PRICING.local_director_support_1y,
      original: CH_CORPORATE_PRICING.local_director_support_1y,
      mandatory: true,
      kind: "service",
      info: `${localSupportKeyPrefix}.info`,
    });
  }

  if (registeredOfficeMode === "pobox") {
    items.push({
      id: "ch_registered_office_pobox_1y",
      label: "ch.corporate.services.items.registeredOfficePobox.label",
      amount: CH_CORPORATE_PRICING.registered_office_pobox_1y,
      original: CH_CORPORATE_PRICING.registered_office_pobox_1y,
      mandatory: true,
      kind: "service",
      info: "ch.corporate.services.items.registeredOfficePobox.info",
    });
  } else if (registeredOfficeMode === "flexidesk") {
    items.push({
      id: "ch_registered_office_flexidesk_1y",
      label: "ch.corporate.services.items.registeredOfficeFlexidesk.label",
      amount: CH_CORPORATE_PRICING.registered_office_flexidesk_1y,
      original: CH_CORPORATE_PRICING.registered_office_flexidesk_1y,
      mandatory: true,
      kind: "service",
      info: "ch.corporate.services.items.registeredOfficeFlexidesk.info",
    });
  }

  if (bankOpeningMode === "mirr_opening") {
    items.push({
      id: "ch_bank_opening_capital_operating",
      label: "ch.corporate.services.items.bankOpening.label",
      amount: CH_CORPORATE_PRICING.bank_opening_capital_operating,
      original: CH_CORPORATE_PRICING.bank_opening_capital_operating,
      mandatory: true,
      kind: "service",
      info: "ch.corporate.services.items.bankOpening.info",
    });
  }

  items.push({
    id: "ch_emi_list_provision",
    label: "ch.corporate.services.items.emiListProvision.label",
    amount: CH_CORPORATE_PRICING.emi_list_provision,
    original: CH_CORPORATE_PRICING.emi_list_provision,
    mandatory: false,
    kind: "optional",
    info: "ch.corporate.services.items.emiListProvision.info",
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
    note: "ch.corporate.fees.note",
  };
};

const buildCorporateApplicantFields = (): McapField[] => [
  {
    type: "info",
    label: "ch.corporate.applicant.notice.label",
    content: "ch.corporate.applicant.notice.content",
    colSpan: 2,
  },
  { type: "text", name: "applicantName", label: "mcap.common.fields.applicantName", required: true, colSpan: 2 },
  {
    type: "checkbox-group",
    name: "authorRelationship",
    label: "newHk.steps.applicant.fields.roles.label",
    required: true,
    options: applicantRoles,
    colSpan: 2,
  },
  {
    type: "text",
    name: "authorRelationshipOther",
    label: "mcap.common.fields.otherRelationshipDetails",
    condition: (f) => Array.isArray(f.authorRelationship) && f.authorRelationship.includes("other"),
    colSpan: 2,
  },
  { type: "email", name: "applicantEmail", label: "mcap.common.fields.applicantEmail", required: true, colSpan: 2 },
  { type: "text", name: "applicantPhone", label: "mcap.common.fields.applicantPhone", required: true, colSpan: 2 },
  {
    type: "text",
    name: "authorContact",
    label: "mcap.common.fields.additionalContactInfo",
    required: true,
    colSpan: 2,
  },
  {
    type: "text",
    name: "companyName1",
    label: "mcap.common.fields.companyNameFirstChoice",
    required: true,
    colSpan: 2,
  },
  {
    type: "text",
    name: "companyName2",
    label: "mcap.common.fields.companyNameSecondChoice",
    required: true,
    colSpan: 2,
  },
  {
    type: "text",
    name: "companyName3",
    label: "mcap.common.fields.companyNameThirdChoice",
    colSpan: 2,
  },
  {
    type: "select",
    name: "sns",
    label: "mcap.common.fields.preferredMessenger",
    options: [
      { label: "mcap.common.messenger.whatsApp", value: "WhatsApp" },
      { label: "mcap.common.messenger.weChat", value: "WeChat" },
      { label: "mcap.common.messenger.line", value: "Line" },
      { label: "mcap.common.messenger.kakaoTalk", value: "KakaoTalk" },
      { label: "mcap.common.messenger.telegram", value: "Telegram" },
      { label: "mcap.common.options.other", value: "Other" },
    ],
  },
  {
    type: "text",
    name: "snsId",
    label: "mcap.common.fields.messengerId",
    condition: (f) => !!f.sns,
  },
];

const buildCorporateComplianceFields = (): McapField[] => [
  {
    type: "radio-group",
    name: "ethicalLegalConfirmation",
    label: "ch.common.compliance.ethicalLegalConfirmation.label",
    required: true,
    options: [
      { label: "mcap.common.options.yes", value: "yes" },
      { label: "mcap.common.options.no", value: "no" },
      { label: "mcap.common.options.doNotKnow", value: "unknown" },
      { label: "ch.common.options.considerLegalAdvice", value: "legal_advice" },
    ],
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "annualRenewalAgreement",
    label: "ch.common.compliance.annualRenewalAgreement.label",
    required: true,
    options: ANNUAL_RENEWAL_OPTIONS,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "sanctionedCountriesBusiness",
    label: "ch.common.compliance.sanctionedCountriesBusiness.label",
    required: true,
    options: YES_NO_DONT_KNOW_OPTIONS,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "sanctionedPersonsInvolved",
    label: "ch.common.compliance.sanctionedPersonsInvolved.label",
    required: true,
    options: YES_NO_DONT_KNOW_OPTIONS,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "restrictedSectors",
    label: "ch.common.compliance.restrictedSectors.label",
    required: true,
    options: YES_NO_DONT_KNOW_OPTIONS,
    colSpan: 2,
  },
];

const buildCorporateCompanyFields = (variant: ChCorporateVariant): McapField[] => {
  const contextContentKey =
    variant === "AG"
      ? "ch.corporate.company.context.contentAg"
      : "ch.corporate.company.context.contentGmbh";
  const totalCapitalLabelKey =
    variant === "AG"
      ? "ch.corporate.company.fields.totalCapital.ag.label"
      : "ch.corporate.company.fields.totalCapital.gmbh.label";
  const totalCapitalDefaultKey =
    variant === "AG"
      ? "ch.corporate.options.totalCapital.agDefault"
      : "ch.corporate.options.totalCapital.gmbhDefault";

  return [
    {
      type: "info",
      label: "ch.corporate.company.context.label",
      content: contextContentKey,
      colSpan: 2,
    },
    {
      type: "checkbox-group",
      name: "industrySelection",
      label: "mcap.common.fields.selectedIndustry",
      required: true,
      options: CH_INDUSTRY_OPTIONS,
      colSpan: 2,
    },
    {
      type: "text",
      name: "industrySelectionOther",
      label: "mcap.common.fields.otherIndustryDetails",
      condition: (f) => Array.isArray(f.industrySelection) && f.industrySelection.includes("other"),
      colSpan: 2,
    },
    {
      type: "textarea",
      name: "productServiceDescription",
      label: "mcap.common.fields.productServiceDescription",
      required: true,
      rows: 3,
      colSpan: 2,
    },
    {
      type: "textarea",
      name: "businessSummary",
      label: "mcap.common.fields.businessSummary",
      required: true,
      rows: 4,
      colSpan: 2,
    },
    {
      type: "text",
      name: "websiteUrl",
      label: "mcap.common.fields.websiteAddressOptional",
      colSpan: 2,
    },
    {
      type: "checkbox-group",
      name: "purposeOfEstablishment",
      label: "ch.corporate.company.fields.purposeOfEstablishment.label",
      required: true,
      options: CH_PURPOSE_OPTIONS,
      colSpan: 2,
    },
    {
      type: "text",
      name: "purposeOfEstablishmentOther",
      label: "mcap.common.fields.otherPurposeDetails",
      condition: (f) => Array.isArray(f.purposeOfEstablishment) && f.purposeOfEstablishment.includes("other"),
      colSpan: 2,
    },
    {
      type: "textarea",
      name: "businessCountries",
      label: "mcap.common.fields.businessOperatingCountries",
      required: true,
      rows: 3,
      colSpan: 2,
    },
    {
      type: "radio-group",
      name: "tokenIssuancePlanned",
      label: "ch.corporate.company.fields.tokenIssuancePlanned.label",
      required: true,
      options: YES_NO_OPTIONS,
      colSpan: 2,
    },
    {
      type: "radio-group",
      name: "tokenUtilityAtIssuance",
      label: "ch.corporate.company.fields.tokenUtilityAtIssuance.label",
      required: true,
      condition: (f) => f.tokenIssuancePlanned === "yes",
      options: YES_NO_DONT_KNOW_OPTIONS,
      colSpan: 2,
    },
    {
      type: "radio-group",
      name: "tokenRightsFeatures",
      label: "ch.corporate.company.fields.tokenRightsFeatures.label",
      required: true,
      condition: (f) => f.tokenIssuancePlanned === "yes",
      options: YES_NO_DONT_KNOW_OPTIONS,
      colSpan: 2,
    },
    {
      type: "radio-group",
      name: "sroMembershipPlan",
      label: "ch.corporate.company.fields.sroMembershipPlan.label",
      required: true,
      options: [
        { label: "mcap.common.options.yes", value: "yes" },
        { label: "mcap.common.options.no", value: "no" },
        { label: "mcap.common.options.adviceRequiredBeforeProceeding", value: "advice" },
      ],
      colSpan: 2,
    },
    {
      type: "radio-group",
      name: "totalCapital",
      label: totalCapitalLabelKey,
      required: true,
      options: [
        { label: totalCapitalDefaultKey, value: "default" },
        { label: "mcap.common.options.other", value: "other" },
      ],
      colSpan: 2,
    },
    {
      type: "text",
      name: "totalCapitalOther",
      label: "mcap.common.fields.totalCapitalToBePaidOther",
      required: true,
      condition: (f) => f.totalCapital === "other",
      colSpan: 2,
    },
    {
      type: "radio-group",
      name: "addressServiceChoice",
      label: "ch.corporate.company.fields.addressServiceChoice.label",
      required: true,
      options: [
        { label: "ch.corporate.options.addressServiceChoice.mirr", value: "mirr" },
        { label: "ch.corporate.options.addressServiceChoice.own", value: "own" },
      ],
      colSpan: 2,
    },
    {
      type: "textarea",
      name: "addressServiceOwnAddress",
      label: "ch.corporate.company.fields.addressServiceOwnAddress.label",
      required: true,
      condition: (f) => f.addressServiceChoice === "own",
      rows: 3,
      colSpan: 2,
    },
    {
      type: "checkbox",
      name: "capitalRequirementAcknowledged",
      label: "mcap.common.fields.capitalRequirementAcknowledged",
      required: true,
      colSpan: 2,
    },
  ];
};

const buildCorporateAccountingFields = (): McapField[] => [
  {
    type: "select",
    name: "finYrEnd",
    label: "mcap.common.fields.financialYearEnd",
    options: finYearOptions,
  },
  {
    type: "text",
    name: "finYrEndOther",
    label: "mcap.common.fields.otherFinancialYearEnd",
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
    label: "mcap.common.fields.expectedAnnualTransactions",
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
      { label: "mcap.common.options.adviceRequiredBeforeProceeding", value: "advice" },
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

const buildCorporateServicesFields = (variant: ChCorporateVariant): McapField[] => {
  const boardServiceLabelKey =
    variant === "AG"
      ? "ch.corporate.services.fields.boardServiceMode.ag.label"
      : "ch.corporate.services.fields.boardServiceMode.gmbh.label";

  return [
    {
      type: "select",
      name: "boardServiceMode",
      label: boardServiceLabelKey,
      required: true,
      defaultValue: "mirr_provided",
      options: [
        { label: "ch.corporate.services.options.boardServiceMode.mirrProvided", value: "mirr_provided" },
        { label: "ch.corporate.services.options.boardServiceMode.clientProvided", value: "client_provided" },
      ],
    },
    {
      type: "select",
      name: "registeredOfficeMode",
      label: "ch.common.services.fields.registeredOfficeMode.label",
      required: true,
      defaultValue: "pobox",
      options: [
        { label: "ch.common.services.options.registeredOfficeMode.pobox", value: "pobox" },
        { label: "ch.common.services.options.registeredOfficeMode.flexidesk", value: "flexidesk" },
        { label: "ch.common.services.options.registeredOfficeMode.clientAddress", value: "client_address" },
      ],
    },
    {
      type: "textarea",
      name: "registeredOfficeClientAddress",
      label: "ch.common.services.fields.registeredOfficeClientAddress.label",
      required: true,
      condition: (f) => f.registeredOfficeMode === "client_address",
      rows: 3,
      colSpan: 2,
    },
    {
      type: "select",
      name: "bankOpeningMode",
      label: "ch.common.services.fields.bankOpeningMode.label",
      required: true,
      defaultValue: "mirr_opening",
      options: [
        { label: "ch.common.services.options.bankOpeningMode.mirrOpening", value: "mirr_opening" },
        { label: "ch.common.services.options.bankOpeningMode.selfArranged", value: "self_arranged" },
      ],
    },
    {
      type: "checkbox-group",
      name: "chQuoteOnlyServices",
      label: "ch.corporate.services.fields.quoteOnlyServices.label",
      options: CH_QUOTE_ONLY_OPTIONS,
      colSpan: 2,
    },
    {
      type: "textarea",
      name: "chQuoteOnlyServicesOther",
      label: "ch.corporate.services.fields.quoteOnlyServicesOther.label",
      condition: (f) => Array.isArray(f.chQuoteOnlyServices) && f.chQuoteOnlyServices.includes("other"),
      rows: 3,
      colSpan: 2,
    },
  ];
};

const createChCorporateConfig = ({
  id,
  countryCode,
  countryName,
  variant,
}: {
  id: string;
  countryCode: string;
  countryName: string;
  variant: ChCorporateVariant;
}): McapConfig => {
  const confirmationTitle =
    variant === "AG" ? "ch.ag.confirmation.title" : "ch.gmbh.confirmation.title";

  return {
    id,
    countryCode,
    countryName,
    currency: "USD",
    title: CH_FIXED_TITLE,
    confirmationDetails: {
      title: confirmationTitle,
      message: "ch.corporate.confirmation.message",
      steps: [
        {
          title: "ch.corporate.confirmation.steps.complianceReview.title",
          description: "ch.corporate.confirmation.steps.complianceReview.description",
        },
        {
          title: "ch.corporate.confirmation.steps.registrationPreparation.title",
          description: "ch.corporate.confirmation.steps.registrationPreparation.description",
        },
        {
          title: "ch.corporate.confirmation.steps.filingAndSupport.title",
          description: "ch.corporate.confirmation.steps.filingAndSupport.description",
        },
      ],
    },
    steps: [
      {
        id: "applicant",
        title: "mcap.common.steps.applicant",
        description: "ch.corporate.steps.applicant.description",
        fields: buildCorporateApplicantFields(),
      },
      {
        id: "compliance",
        title: "mcap.common.steps.compliance",
        description: "ch.corporate.steps.compliance.description",
        fields: buildCorporateComplianceFields(),
      },
      {
        id: "company",
        title: "mcap.common.steps.company",
        description: "ch.corporate.steps.company.description",
        fields: buildCorporateCompanyFields(variant),
      },
      {
        id: "parties",
        title: "mcap.common.steps.parties",
        description: "ch.common.steps.parties.description",
        widget: "PartiesManager",
        minParties: 1,
        requireDcp: true,
        requirePartyInvite: true,
        partyFields: [
          {
            key: "swissResidencyStatus",
            label: "ch.corporate.parties.fields.swissResidencyStatus.label",
            type: "select",
            options: [
              { label: "ch.corporate.options.swissResidencyStatus.swissResident", value: "swiss_resident" },
              { label: "ch.corporate.options.swissResidencyStatus.nonSwissResident", value: "non_swiss_resident" },
            ],
            storage: "details",
          },
        ],
        partyCoverageRules: [
          {
            key: "swissResidencyStatus",
            storage: "details",
            requiredValues: ["swiss_resident"],
            label: "ch.corporate.coverage.swissResidency.label",
            valueLabels: {
              swiss_resident: "ch.corporate.coverage.swissResidency.swissResidentRequired",
            },
          },
        ],
      },
      {
        id: "accounting",
        title: "mcap.common.steps.accounting",
        fields: buildCorporateAccountingFields(),
      },
      {
        id: "services",
        title: "mcap.common.steps.services",
        description: "ch.corporate.steps.services.description",
        widget: "ServiceSelectionWidget",
        fields: buildCorporateServicesFields(variant),
        serviceItems: (data) => buildChCorporateServiceItems(data, variant),
        supportedCurrencies: ["USD", "HKD"],
        computeFees: (data) => computeChCorporateFees(data, variant),
      },
      {
        id: "invoice",
        title: "mcap.common.steps.invoice",
        description: "ch.corporate.steps.invoice.description",
        widget: "InvoiceWidget",
        computeFees: (data) => computeChCorporateFees(data, variant),
      },
      {
        id: "payment",
        title: "mcap.common.steps.payment",
        description: "ch.corporate.steps.payment.description",
        widget: "PaymentWidget",
        supportedCurrencies: ["USD", "HKD"],
        computeFees: (data) => computeChCorporateFees(data, variant),
      },
      {
        id: "review",
        title: "mcap.common.steps.review",
        fields: [
          {
            type: "info",
            label: "mcap.common.fields.agreementAndDeclaration",
            content: "ch.corporate.review.declaration.content",
            colSpan: 2,
          },
          {
            type: "radio-group",
            name: "finalAgreement",
            label: "mcap.common.fields.doYouAgreeToDeclaration",
            required: true,
            options: YES_NO_OPTIONS,
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
            label: "mcap.common.fields.complianceSuspensionAcknowledgement",
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
};

export const buildChFoundationServiceItems = (data: Record<string, any>): ChFoundationServiceItem[] => {
  const boardServiceMode = getBoardServiceMode(data);
  const registeredOfficeMode = getRegisteredOfficeMode(data);
  const bankOpeningMode = getBankOpeningMode(data);

  const items: ChFoundationServiceItem[] = [
    {
      id: "chf_foundation_setup",
      label: "ch.foundation.services.items.foundationSetup.label",
      amount: CH_FOUNDATION_PRICING.foundation_setup,
      original: CH_FOUNDATION_PRICING.foundation_setup,
      mandatory: true,
      kind: "service",
      info: "ch.foundation.services.items.foundationSetup.info",
    },
  ];

  if (boardServiceMode === "mirr_provided") {
    items.push({
      id: "chf_local_board_member_1y",
      label: "ch.foundation.services.items.localBoardMember.label",
      amount: CH_FOUNDATION_PRICING.local_board_member_1y,
      original: CH_FOUNDATION_PRICING.local_board_member_1y,
      mandatory: true,
      kind: "service",
      info: "ch.foundation.services.items.localBoardMember.info",
    });
  }

  if (registeredOfficeMode === "pobox") {
    items.push({
      id: "chf_registered_office_pobox_1y",
      label: "ch.foundation.services.items.registeredOfficePobox.label",
      amount: CH_FOUNDATION_PRICING.registered_office_pobox_1y,
      original: CH_FOUNDATION_PRICING.registered_office_pobox_1y,
      mandatory: true,
      kind: "service",
      info: "ch.foundation.services.items.registeredOfficePobox.info",
    });
  } else if (registeredOfficeMode === "flexidesk") {
    items.push({
      id: "chf_registered_office_flexidesk_1y",
      label: "ch.foundation.services.items.registeredOfficeFlexidesk.label",
      amount: CH_FOUNDATION_PRICING.registered_office_flexidesk_1y,
      original: CH_FOUNDATION_PRICING.registered_office_flexidesk_1y,
      mandatory: true,
      kind: "service",
      info: "ch.foundation.services.items.registeredOfficeFlexidesk.info",
    });
  }

  if (bankOpeningMode === "mirr_opening") {
    items.push({
      id: "chf_bank_opening_capital_operating",
      label: "ch.foundation.services.items.bankOpening.label",
      amount: CH_FOUNDATION_PRICING.bank_opening_capital_operating,
      original: CH_FOUNDATION_PRICING.bank_opening_capital_operating,
      mandatory: true,
      kind: "service",
      info: "ch.foundation.services.items.bankOpening.info",
    });
  }

  items.push(
    {
      id: "chf_accounting_tax_annual",
      label: "ch.foundation.services.items.accountingTaxAnnual.label",
      amount: CH_FOUNDATION_PRICING.accounting_tax_annual,
      original: CH_FOUNDATION_PRICING.accounting_tax_annual,
      mandatory: false,
      kind: "optional",
      info: "ch.foundation.services.items.accountingTaxAnnual.info",
    },
    {
      id: "chf_annual_foundation_report_estimated",
      label: "ch.foundation.services.items.annualFoundationReport.label",
      amount: CH_FOUNDATION_PRICING.annual_foundation_report_estimated,
      original: CH_FOUNDATION_PRICING.annual_foundation_report_estimated,
      mandatory: false,
      kind: "optional",
      estimated: true,
      info: "ch.foundation.services.items.annualFoundationReport.info",
    }
  );

  return items;
};

export const computeChFoundationFees = (data: Record<string, any>) => {
  const selectedServiceIds = getSelectedServiceIds(data);
  const allItems = buildChFoundationServiceItems(data);

  const selectedItemsUsd = allItems
    .filter((item) => item.mandatory || selectedServiceIds.has(item.id))
    .map((item) => ({
      id: item.id,
      label: item.label,
      amount: item.amount,
      original: item.original,
      kind: item.kind || "service",
      info: item.info,
      estimated: item.estimated,
    }));

  const totalUsd = selectedItemsUsd.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const paymentCurrency = String(data?.paymentCurrency || data?.currency || "USD").toUpperCase();
  const exchangeRateUsedRaw = Number(data?.computedFees?.exchangeRateUsed || 0);
  const shouldConvertToHkd =
    paymentCurrency === "HKD" && Number.isFinite(exchangeRateUsedRaw) && exchangeRateUsedRaw > 0;

  const selectedItems = shouldConvertToHkd
    ? selectedItemsUsd.map((item) => ({
      ...item,
      amount: Number((Number(item.amount || 0) * exchangeRateUsedRaw).toFixed(2)),
      original: Number((Number(item.original || 0) * exchangeRateUsedRaw).toFixed(2)),
    }))
    : selectedItemsUsd;

  const total = shouldConvertToHkd
    ? Number((totalUsd * exchangeRateUsedRaw).toFixed(2))
    : totalUsd;

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
    note: "ch.foundation.fees.note",
  };
};

const createChFoundationConfig = (): McapConfig => ({
  id: "ch-foundation-full",
  countryCode: "CH_FOUNDATION",
  countryName: "Switzerland Foundation",
  currency: "USD",
  title: CH_FIXED_TITLE,
  confirmationDetails: {
    title: "ch.foundation.confirmation.title",
    message: "ch.foundation.confirmation.message",
    steps: [
      {
        title: "ch.foundation.confirmation.steps.complianceReview.title",
        description: "ch.foundation.confirmation.steps.complianceReview.description",
      },
      {
        title: "ch.foundation.confirmation.steps.foundationFilingPreparation.title",
        description: "ch.foundation.confirmation.steps.foundationFilingPreparation.description",
      },
      {
        title: "ch.foundation.confirmation.steps.registrationTaxSetup.title",
        description: "ch.foundation.confirmation.steps.registrationTaxSetup.description",
      },
      {
        title: "ch.foundation.confirmation.steps.postFilingServices.title",
        description: "ch.foundation.confirmation.steps.postFilingServices.description",
      },
    ],
  },
  steps: [
    {
      id: "applicant",
      title: "mcap.common.steps.applicant",
      description: "ch.foundation.steps.applicant.description",
      fields: [
        {
          type: "text",
          name: "applicantName",
          label: "mcap.common.fields.applicantName",
          required: true,
          colSpan: 2,
        },
        {
          type: "checkbox-group",
          name: "authorRelationship",
          label: "ch.foundation.applicant.fields.authorRelationship.label",
          required: true,
          options: [
            { label: "ch.foundation.options.relationship.director", value: "director" },
            { label: "ch.options.relationship.delegate", value: "delegate" },
            { label: "ch.options.relationship.directOrIndirectShareholder", value: "shareholder" },
            { label: "ch.options.relationship.expert", value: "expert" },
            { label: "mcap.common.options.other", value: "other" },
          ],
          colSpan: 2,
        },
        {
          type: "text",
          name: "authorRelationshipOther",
          label: "mcap.common.fields.otherRelationshipDetails",
          condition: (f) => Array.isArray(f.authorRelationship) && f.authorRelationship.includes("other"),
          colSpan: 2,
        },
        {
          type: "email",
          name: "applicantEmail",
          label: "mcap.common.fields.applicantEmail",
          required: true,
          colSpan: 2,
        },
        {
          type: "text",
          name: "applicantPhone",
          label: "mcap.common.fields.applicantPhone",
          required: true,
          colSpan: 2,
        },
        {
          type: "text",
          name: "authorContactInfo",
          label: "mcap.common.fields.additionalContactInfo",
          required: true,
          colSpan: 2,
        },
      ],
    },
    {
      id: "compliance",
      title: "mcap.common.steps.compliance",
      description: "ch.foundation.steps.compliance.description",
      fields: [
        {
          type: "radio-group",
          name: "legalAndEthicalConcern",
          label: "ch.common.compliance.ethicalLegalConfirmation.label",
          required: true,
          options: [
            { label: "mcap.common.options.yes", value: "yes" },
            { label: "mcap.common.options.no", value: "no" },
            { label: "mcap.common.options.doNotKnow", value: "unknown" },
            { label: "ch.common.options.considerLegalAdvice", value: "legal_advice" },
          ],
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "annualRenewalConsent",
          label: "ch.common.compliance.annualRenewalAgreement.label",
          required: true,
          options: ANNUAL_RENEWAL_OPTIONS,
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "sanctionedCountriesBusiness",
          label: "ch.common.compliance.sanctionedCountriesBusiness.label",
          required: true,
          options: YES_NO_DONT_KNOW_OPTIONS,
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "sanctionedPersonsInvolved",
          label: "ch.common.compliance.sanctionedPersonsInvolved.label",
          required: true,
          options: YES_NO_DONT_KNOW_OPTIONS,
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "restrictedSectors",
          label: "ch.common.compliance.restrictedSectors.label",
          required: true,
          options: YES_NO_DONT_KNOW_OPTIONS,
          colSpan: 2,
        },
      ],
    },
    {
      id: "company",
      title: "mcap.common.steps.company",
      description: "ch.foundation.steps.company.description",
      fields: [
        {
          type: "text",
          name: "companyName1",
          label: "ch.foundation.company.fields.foundationNameFirstChoice.label",
          required: true,
          colSpan: 2,
        },
        {
          type: "text",
          name: "companyName2",
          label: "ch.foundation.company.fields.foundationNameSecondChoice.label",
          required: true,
          colSpan: 2,
        },
        {
          type: "checkbox-group",
          name: "industrySelection",
          label: "mcap.common.fields.selectedIndustry",
          required: true,
          options: CH_FOUNDATION_INDUSTRY_OPTIONS,
          colSpan: 2,
        },
        {
          type: "text",
          name: "industrySelectionOther",
          label: "mcap.common.fields.otherIndustryDetails",
          condition: (f) => Array.isArray(f.industrySelection) && f.industrySelection.includes("other"),
          colSpan: 2,
        },
        {
          type: "textarea",
          name: "productServiceDescription",
          label: "mcap.common.fields.productServiceDescription",
          required: true,
          rows: 3,
          colSpan: 2,
        },
        {
          type: "textarea",
          name: "businessSummary",
          label: "mcap.common.fields.businessSummary",
          required: true,
          rows: 4,
          colSpan: 2,
        },
        {
          type: "text",
          name: "websiteUrl",
          label: "mcap.common.fields.websiteAddressOptional",
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "capitalRequirementChoice",
          label: "ch.foundation.company.fields.capitalRequirementChoice.label",
          required: true,
          options: [
            {
              label: "ch.foundation.options.capitalRequirementChoice.acknowledged",
              value: "acknowledged",
            },
            {
              label: "ch.foundation.options.capitalRequirementChoice.otherArrangement",
              value: "other",
            },
          ],
          colSpan: 2,
        },
        {
          type: "textarea",
          name: "capitalRequirementOther",
          label: "ch.foundation.company.fields.capitalRequirementOther.label",
          required: true,
          condition: (f) => f.capitalRequirementChoice === "other",
          rows: 3,
          colSpan: 2,
        },
        {
          type: "checkbox",
          name: "capitalRequirementAcknowledged",
          label: "mcap.common.fields.capitalRequirementAcknowledged",
          required: true,
          colSpan: 2,
        },
      ],
    },
    {
      id: "parties",
      title: "mcap.common.steps.parties",
      description: "ch.common.steps.parties.description",
      widget: "PartiesManager",
      minParties: 1,
      requireDcp: true,
      requirePartyInvite: true,
    },
    {
      id: "accounting",
      title: "mcap.common.steps.accounting",
      description: "ch.foundation.steps.accounting.description",
      fields: [
        {
          type: "select",
          name: "finYrEnd",
          label: "mcap.common.fields.financialYearEnd",
          options: finYearOptions,
        },
        {
          type: "text",
          name: "finYrEndOther",
          label: "mcap.common.fields.otherFinancialYearEnd",
          condition: (f) => f.finYrEnd === "Other",
        },
        {
          type: "select",
          name: "expectedAnnualTransactions",
          label: "mcap.common.fields.expectedAnnualTransactions",
          options: [
            { label: "mcap.common.options.upTo300", value: "up_to_300" },
            { label: "mcap.common.options.from301To1000", value: "301_1000" },
            { label: "mcap.common.options.moreThan1000", value: "1000_plus" },
          ],
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "vatRegistrationNeed",
          label: "mcap.common.fields.vatRegistrationSupport",
          options: [
            { label: "mcap.common.options.yes", value: "yes" },
            { label: "mcap.common.options.no", value: "no" },
            { label: "mcap.common.options.adviceRequiredBeforeProceeding", value: "advice" },
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
      ],
    },
    {
      id: "services",
      title: "mcap.common.steps.services",
      description: "ch.foundation.steps.services.description",
      widget: "ServiceSelectionWidget",
      fields: [
        {
          type: "select",
          name: "boardServiceMode",
          label: "ch.foundation.services.fields.boardServiceMode.label",
          required: true,
          defaultValue: "mirr_provided",
          options: [
            { label: "ch.foundation.services.options.boardServiceMode.mirrProvided", value: "mirr_provided" },
            { label: "ch.foundation.services.options.boardServiceMode.clientProvided", value: "client_provided" },
          ],
        },
        {
          type: "select",
          name: "registeredOfficeMode",
          label: "ch.common.services.fields.registeredOfficeMode.label",
          required: true,
          defaultValue: "pobox",
          options: [
            { label: "ch.common.services.options.registeredOfficeMode.pobox", value: "pobox" },
            { label: "ch.common.services.options.registeredOfficeMode.flexidesk", value: "flexidesk" },
            { label: "ch.common.services.options.registeredOfficeMode.clientAddress", value: "client_address" },
          ],
        },
        {
          type: "textarea",
          name: "clientRegisteredOfficeAddress",
          label: "ch.common.services.fields.registeredOfficeClientAddress.label",
          required: true,
          condition: (f) => f.registeredOfficeMode === "client_address",
          rows: 3,
          colSpan: 2,
        },
        {
          type: "select",
          name: "bankOpeningMode",
          label: "ch.common.services.fields.bankOpeningMode.label",
          required: true,
          defaultValue: "mirr_opening",
          options: [
            { label: "ch.common.services.options.bankOpeningMode.mirrOpening", value: "mirr_opening" },
            { label: "ch.common.services.options.bankOpeningMode.selfArranged", value: "self_arranged" },
          ],
        },
      ],
      serviceItems: (data) => buildChFoundationServiceItems(data),
      supportedCurrencies: ["USD", "HKD"],
      computeFees: (data) => computeChFoundationFees(data),
    },
    {
      id: "invoice",
      title: "mcap.common.steps.invoice",
      description: "ch.foundation.steps.invoice.description",
      widget: "InvoiceWidget",
      computeFees: (data) => computeChFoundationFees(data),
    },
    {
      id: "payment",
      title: "mcap.common.steps.payment",
      description: "ch.foundation.steps.payment.description",
      widget: "PaymentWidget",
      supportedCurrencies: ["USD", "HKD"],
      computeFees: (data) => computeChFoundationFees(data),
    },
    {
      id: "review",
      title: "mcap.common.steps.review",
      fields: [
        {
          type: "info",
          label: "mcap.common.fields.agreementAndDeclaration",
          content: "ch.foundation.review.declaration.content",
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "finalAgreement",
          label: "mcap.common.fields.doYouAgreeToDeclaration",
          required: true,
          options: YES_NO_OPTIONS,
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
          label: "mcap.common.fields.complianceSuspensionAcknowledgement",
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
});

export const CH_AG_FULL_CONFIG = createChCorporateConfig({
  id: "ch-ag-full",
  countryCode: "CH",
  countryName: "Swiss Corporation (AG)",
  variant: "AG",
});

export const CH_GMBH_FULL_CONFIG = createChCorporateConfig({
  id: "ch-gmbh-full",
  countryCode: "CH_LLC",
  countryName: "Swiss Limited Liability Company (GmbH; LLC)",
  variant: "GMBH",
});

export const CH_FOUNDATION_FULL_CONFIG = createChFoundationConfig();

type CreateChUnifiedConfigOptions = {
  agConfig: McapConfig;
  gmbhConfig: McapConfig;
  foundationConfig: McapConfig;
};

export const createChUnifiedFullConfig = ({
  agConfig,
  gmbhConfig,
  foundationConfig,
}: CreateChUnifiedConfigOptions): McapConfig => {
  const subtypeConfigByType: Record<ChIncorporationType, McapConfig> = {
    ag: agConfig,
    gmbh: gmbhConfig,
    foundation: foundationConfig,
  };

  const countryContextByType: Record<ChIncorporationType, { countryCode: string; countryName: string }> = {
    ag: {
      countryCode: agConfig.countryCode,
      countryName: agConfig.countryName,
    },
    gmbh: {
      countryCode: gmbhConfig.countryCode,
      countryName: gmbhConfig.countryName,
    },
    foundation: {
      countryCode: foundationConfig.countryCode,
      countryName: foundationConfig.countryName,
    },
  };

  const onFieldChange = ({
    fieldName,
    prevValue,
    nextValue,
    paymentStatus,
  }: {
    fieldName: string;
    prevValue: any;
    nextValue: any;
    paymentStatus: string;
  }): McapFieldChangeAction | null => {
    if (fieldName !== CH_INCORPORATION_TYPE_FIELD) return null;

    const previousType = normalizeIncorporationType(prevValue);
    const nextType = normalizeIncorporationType(nextValue);
    if (!previousType || !nextType || previousType === nextType) return null;

    if (isPaymentCompleted(paymentStatus)) {
      return {
        mode: "block",
        blockMessage: "ch.unified.typeChange.lockedAfterPayment",
      };
    }

    return {
      mode: "reset",
    };
  };

  return {
    id: CH_UNIFIED_CONFIG_ID,
    countryCode: "CH",
    countryName: "Switzerland",
    currency: agConfig.currency || "USD",
    title: CH_FIXED_TITLE,
    steps: injectSelectorIntoApplicantStep(agConfig).steps,
    launcherEnabled: true,
    skipNormalization: true,
    seedData: {
      [CH_UNIFIED_FLOW_VERSION_FIELD]: CH_UNIFIED_FLOW_VERSION,
    },
    runtimeResolutionKeys: [CH_INCORPORATION_TYPE_FIELD],
    resolveRuntimeConfig: ({ data }: McapRuntimeContext) => {
      const type = resolveIncorporationType(data || {});
      const subtypeConfig = injectSelectorIntoApplicantStep(subtypeConfigByType[type]);
      return {
        ...subtypeConfig,
        id: CH_UNIFIED_CONFIG_ID,
        title: CH_FIXED_TITLE,
      };
    },
    resolveCountryContext: ({ data }: McapRuntimeContext) => {
      const type = resolveIncorporationType(data || {});
      return countryContextByType[type];
    },
    onFieldChange: ({
      fieldName,
      prevValue,
      nextValue,
      paymentStatus,
    }) => onFieldChange({ fieldName, prevValue, nextValue, paymentStatus }),
  };
};
