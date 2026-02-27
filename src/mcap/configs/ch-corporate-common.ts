/* eslint-disable @typescript-eslint/no-explicit-any */
import { finYearOptions } from "@/pages/Company/NewHKForm/hkIncorpo";
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
  { label: "mcap.ch.options.industry.cryptoRelated", value: "crypto_related" },
  { label: "mcap.ch.options.industry.itBlockchain", value: "it_blockchain" },
  { label: "mcap.ch.options.industry.financeInvestment", value: "finance_investment" },
  { label: "mcap.ch.options.industry.tradeWholesale", value: "trade_wholesale" },
  { label: "mcap.ch.options.industry.manufacturing", value: "manufacturing" },
  { label: "mcap.ch.options.industry.ecommerce", value: "ecommerce" },
  { label: "mcap.ch.options.industry.consulting", value: "consulting" },
  { label: "mcap.common.options.other", value: "other" },
];

const CH_PURPOSE_OPTIONS = [
  { label: "mcap.ch.options.purpose.euExpansion", value: "eu_expansion" },
  { label: "mcap.ch.options.purpose.regulatoryDiversification", value: "regulatory_diversification" },
  { label: "mcap.ch.options.purpose.advisorRecommendation", value: "advisor_recommendation" },
  { label: "mcap.ch.options.purpose.holdingAssetManagement", value: "holding_asset_management" },
  { label: "mcap.ch.options.purpose.internationalStructuring", value: "international_structuring" },
  { label: "mcap.ch.options.purpose.optimization", value: "optimization" },
  { label: "mcap.common.options.other", value: "other" },
];

const CH_QUOTE_ONLY_OPTIONS = [
  { label: "mcap.ch.options.quoteOnly.annualAccountingTax", value: "annual_accounting_tax_quote" },
  { label: "mcap.ch.options.quoteOnly.emiOpening", value: "emi_account_opening_quote" },
  { label: "mcap.ch.options.quoteOnly.legalOpinionSwiss", value: "legal_opinion_swiss_quote" },
  { label: "mcap.ch.options.quoteOnly.legalOpinionExchange", value: "legal_opinion_exchange_quote" },
  { label: "mcap.ch.options.quoteOnly.consulting", value: "consulting_quote" },
  { label: "mcap.common.options.other", value: "other" },
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

  const localSupportKeyPrefix =
    variant === "AG"
      ? "mcap.ch.corporate.services.items.localSupport.ag"
      : "mcap.ch.corporate.services.items.localSupport.gmbh";

  const items: ChCorporateServiceItem[] = [
    {
      id: "ch_setup_maintenance_1y",
      label: "mcap.ch.corporate.services.items.setupMaintenance.label",
      amount: CH_CORPORATE_PRICING.setup_and_maintenance_1y,
      original: CH_CORPORATE_PRICING.setup_and_maintenance_1y,
      mandatory: true,
      kind: "service",
      info: "mcap.ch.corporate.services.items.setupMaintenance.info",
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
      label: "mcap.ch.corporate.services.items.registeredOfficePobox.label",
      amount: CH_CORPORATE_PRICING.registered_office_pobox_1y,
      original: CH_CORPORATE_PRICING.registered_office_pobox_1y,
      mandatory: true,
      kind: "service",
      info: "mcap.ch.corporate.services.items.registeredOfficePobox.info",
    });
  } else if (registeredOfficeMode === "flexidesk") {
    items.push({
      id: "ch_registered_office_flexidesk_1y",
      label: "mcap.ch.corporate.services.items.registeredOfficeFlexidesk.label",
      amount: CH_CORPORATE_PRICING.registered_office_flexidesk_1y,
      original: CH_CORPORATE_PRICING.registered_office_flexidesk_1y,
      mandatory: true,
      kind: "service",
      info: "mcap.ch.corporate.services.items.registeredOfficeFlexidesk.info",
    });
  }

  if (bankOpeningMode === "mirr_opening") {
    items.push({
      id: "ch_bank_opening_capital_operating",
      label: "mcap.ch.corporate.services.items.bankOpening.label",
      amount: CH_CORPORATE_PRICING.bank_opening_capital_operating,
      original: CH_CORPORATE_PRICING.bank_opening_capital_operating,
      mandatory: true,
      kind: "service",
      info: "mcap.ch.corporate.services.items.bankOpening.info",
    });
  }

  items.push({
    id: "ch_emi_list_provision",
    label: "mcap.ch.corporate.services.items.emiListProvision.label",
    amount: CH_CORPORATE_PRICING.emi_list_provision,
    original: CH_CORPORATE_PRICING.emi_list_provision,
    mandatory: false,
    kind: "optional",
    info: "mcap.ch.corporate.services.items.emiListProvision.info",
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
    note: "mcap.ch.corporate.fees.note",
  };
};

const buildApplicantFields = (): McapField[] => [
  {
    type: "info",
    label: "mcap.ch.corporate.applicant.notice.label",
    content: "mcap.ch.corporate.applicant.notice.content",
    colSpan: 2,
  },
  { type: "text", name: "applicantName", label: "mcap.common.fields.applicantName", required: true, colSpan: 2 },
  {
    type: "checkbox-group",
    name: "authorRelationship",
    label: "mcap.ch.corporate.applicant.fields.authorRelationship.label",
    required: true,
    options: [
      { label: "mcap.ch.options.relationship.directorOfSwissEntity", value: "director" },
      { label: "mcap.ch.options.relationship.delegate", value: "delegate" },
      { label: "mcap.ch.options.relationship.directOrIndirectShareholder", value: "shareholder" },
      { label: "mcap.ch.options.relationship.expert", value: "expert" },
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
    name: "companyName_1",
    label: "mcap.common.fields.companyNameFirstChoice",
    required: true,
    colSpan: 2,
  },
  {
    type: "text",
    name: "companyName_2",
    label: "mcap.common.fields.companyNameSecondChoice",
    required: true,
    colSpan: 2,
  },
  {
    type: "text",
    name: "companyName_3",
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

const buildComplianceFields = (): McapField[] => [
  {
    type: "radio-group",
    name: "ethicalLegalConfirmation",
    label: "mcap.ch.common.compliance.ethicalLegalConfirmation.label",
    required: true,
    options: [
      { label: "mcap.common.options.yes", value: "yes" },
      { label: "mcap.common.options.no", value: "no" },
      { label: "mcap.common.options.doNotKnow", value: "unknown" },
      { label: "mcap.ch.common.options.considerLegalAdvice", value: "legal_advice" },
    ],
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "annualRenewalAgreement",
    label: "mcap.ch.common.compliance.annualRenewalAgreement.label",
    required: true,
    options: ANNUAL_RENEWAL_OPTIONS,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "sanctionedCountriesBusiness",
    label: "mcap.ch.common.compliance.sanctionedCountriesBusiness.label",
    required: true,
    options: YES_NO_DONT_KNOW_OPTIONS,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "sanctionedPersonsInvolved",
    label: "mcap.ch.common.compliance.sanctionedPersonsInvolved.label",
    required: true,
    options: YES_NO_DONT_KNOW_OPTIONS,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "restrictedSectors",
    label: "mcap.ch.common.compliance.restrictedSectors.label",
    required: true,
    options: YES_NO_DONT_KNOW_OPTIONS,
    colSpan: 2,
  },
];

const buildCompanyFields = (variant: ChCorporateVariant): McapField[] => {
  const contextContentKey =
    variant === "AG"
      ? "mcap.ch.corporate.company.context.contentAg"
      : "mcap.ch.corporate.company.context.contentGmbh";
  const totalCapitalLabelKey =
    variant === "AG"
      ? "mcap.ch.corporate.company.fields.totalCapital.ag.label"
      : "mcap.ch.corporate.company.fields.totalCapital.gmbh.label";
  const totalCapitalDefaultKey =
    variant === "AG"
      ? "mcap.ch.corporate.options.totalCapital.agDefault"
      : "mcap.ch.corporate.options.totalCapital.gmbhDefault";

  return [
    {
      type: "info",
      label: "mcap.ch.corporate.company.context.label",
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
      label: "mcap.ch.corporate.company.fields.purposeOfEstablishment.label",
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
      label: "mcap.ch.corporate.company.fields.tokenIssuancePlanned.label",
      required: true,
      options: YES_NO_OPTIONS,
      colSpan: 2,
    },
    {
      type: "radio-group",
      name: "tokenUtilityAtIssuance",
      label: "mcap.ch.corporate.company.fields.tokenUtilityAtIssuance.label",
      required: true,
      condition: (f) => f.tokenIssuancePlanned === "yes",
      options: YES_NO_DONT_KNOW_OPTIONS,
      colSpan: 2,
    },
    {
      type: "radio-group",
      name: "tokenRightsFeatures",
      label: "mcap.ch.corporate.company.fields.tokenRightsFeatures.label",
      required: true,
      condition: (f) => f.tokenIssuancePlanned === "yes",
      options: YES_NO_DONT_KNOW_OPTIONS,
      colSpan: 2,
    },
    {
      type: "radio-group",
      name: "sroMembershipPlan",
      label: "mcap.ch.corporate.company.fields.sroMembershipPlan.label",
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
      label: "mcap.ch.corporate.company.fields.addressServiceChoice.label",
      required: true,
      options: [
        { label: "mcap.ch.corporate.options.addressServiceChoice.mirr", value: "mirr" },
        { label: "mcap.ch.corporate.options.addressServiceChoice.own", value: "own" },
      ],
      colSpan: 2,
    },
    {
      type: "textarea",
      name: "addressServiceOwnAddress",
      label: "mcap.ch.corporate.company.fields.addressServiceOwnAddress.label",
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

const buildAccountingFields = (): McapField[] => [
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

const buildServicesFields = (variant: ChCorporateVariant): McapField[] => {
  const boardServiceLabelKey =
    variant === "AG"
      ? "mcap.ch.corporate.services.fields.boardServiceMode.ag.label"
      : "mcap.ch.corporate.services.fields.boardServiceMode.gmbh.label";

  return [
    {
      type: "select",
      name: "boardServiceMode",
      label: boardServiceLabelKey,
      required: true,
      defaultValue: "mirr_provided",
      options: [
        { label: "mcap.ch.corporate.services.options.boardServiceMode.mirrProvided", value: "mirr_provided" },
        { label: "mcap.ch.corporate.services.options.boardServiceMode.clientProvided", value: "client_provided" },
      ],
    },
    {
      type: "select",
      name: "registeredOfficeMode",
      label: "mcap.ch.common.services.fields.registeredOfficeMode.label",
      required: true,
      defaultValue: "pobox",
      options: [
        { label: "mcap.ch.common.services.options.registeredOfficeMode.pobox", value: "pobox" },
        { label: "mcap.ch.common.services.options.registeredOfficeMode.flexidesk", value: "flexidesk" },
        { label: "mcap.ch.common.services.options.registeredOfficeMode.clientAddress", value: "client_address" },
      ],
    },
    {
      type: "textarea",
      name: "registeredOfficeClientAddress",
      label: "mcap.ch.common.services.fields.registeredOfficeClientAddress.label",
      required: true,
      condition: (f) => f.registeredOfficeMode === "client_address",
      rows: 3,
      colSpan: 2,
    },
    {
      type: "select",
      name: "bankOpeningMode",
      label: "mcap.ch.common.services.fields.bankOpeningMode.label",
      required: true,
      defaultValue: "mirr_opening",
      options: [
        { label: "mcap.ch.common.services.options.bankOpeningMode.mirrOpening", value: "mirr_opening" },
        { label: "mcap.ch.common.services.options.bankOpeningMode.selfArranged", value: "self_arranged" },
      ],
    },
    {
      type: "checkbox-group",
      name: "chQuoteOnlyServices",
      label: "mcap.ch.corporate.services.fields.quoteOnlyServices.label",
      options: CH_QUOTE_ONLY_OPTIONS,
      colSpan: 2,
    },
    {
      type: "textarea",
      name: "chQuoteOnlyServicesOther",
      label: "mcap.ch.corporate.services.fields.quoteOnlyServicesOther.label",
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
  const confirmationTitle =
    variant === "AG" ? "mcap.ch.ag.confirmation.title" : "mcap.ch.gmbh.confirmation.title";

  return {
    id,
    countryCode,
    countryName,
    currency: "USD",
    title,
    confirmationDetails: {
      title: confirmationTitle,
      message: "mcap.ch.corporate.confirmation.message",
      steps: [
        {
          title: "mcap.ch.corporate.confirmation.steps.complianceReview.title",
          description: "mcap.ch.corporate.confirmation.steps.complianceReview.description",
        },
        {
          title: "mcap.ch.corporate.confirmation.steps.registrationPreparation.title",
          description: "mcap.ch.corporate.confirmation.steps.registrationPreparation.description",
        },
        {
          title: "mcap.ch.corporate.confirmation.steps.filingAndSupport.title",
          description: "mcap.ch.corporate.confirmation.steps.filingAndSupport.description",
        },
      ],
    },
    steps: [
      {
        id: "applicant",
        title: "mcap.common.steps.applicant",
        description: "mcap.ch.corporate.steps.applicant.description",
        fields: buildApplicantFields(),
      },
      {
        id: "compliance",
        title: "mcap.common.steps.compliance",
        description: "mcap.ch.corporate.steps.compliance.description",
        fields: buildComplianceFields(),
      },
      {
        id: "company",
        title: "mcap.common.steps.company",
        description: "mcap.ch.corporate.steps.company.description",
        fields: buildCompanyFields(variant),
      },
      {
        id: "parties",
        title: "mcap.common.steps.parties",
        description: "mcap.ch.common.steps.parties.description",
        widget: "PartiesManager",
        minParties: 1,
        requireDcp: true,
        requirePartyInvite: true,
        partyFields: [
          {
            key: "swissResidencyStatus",
            label: "mcap.ch.corporate.parties.fields.swissResidencyStatus.label",
            type: "select",
            options: [
              { label: "mcap.ch.corporate.options.swissResidencyStatus.swissResident", value: "swiss_resident" },
              { label: "mcap.ch.corporate.options.swissResidencyStatus.nonSwissResident", value: "non_swiss_resident" },
            ],
            storage: "details",
          },
        ],
        partyCoverageRules: [
          {
            key: "swissResidencyStatus",
            storage: "details",
            requiredValues: ["swiss_resident"],
            label: "mcap.ch.corporate.coverage.swissResidency.label",
            valueLabels: {
              swiss_resident: "mcap.ch.corporate.coverage.swissResidency.swissResidentRequired",
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
        description: "mcap.ch.corporate.steps.services.description",
        widget: "ServiceSelectionWidget",
        fields: buildServicesFields(variant),
        serviceItems: (data) => buildChCorporateServiceItems(data, variant),
        supportedCurrencies: ["USD", "HKD"],
        computeFees: (data) => computeChCorporateFees(data, variant),
      },
      {
        id: "invoice",
        title: "mcap.common.steps.invoice",
        description: "mcap.ch.corporate.steps.invoice.description",
        widget: "InvoiceWidget",
        computeFees: (data) => computeChCorporateFees(data, variant),
      },
      {
        id: "payment",
        title: "mcap.common.steps.payment",
        description: "mcap.ch.corporate.steps.payment.description",
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
            content: "mcap.ch.corporate.review.declaration.content",
            colSpan: 2,
          },
          {
            type: "radio-group",
            name: "finalAgreement",
            label: "mcap.common.fields.doYouAgreeToDeclaration",
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
            label: "mcap.common.fields.complianceSuspensionAcknowledgement",
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
};
