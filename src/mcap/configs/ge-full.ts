/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { finYearOptions } from "@/pages/Company/NewHKForm/hkIncorpo";
import type { McapConfig, McapFeeItem, McapField } from "./types";

type GeServiceItem = {
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
  { label: "ge.applicant.relationship.options.officer", value: "officer" },
  { label: "ge.applicant.relationship.options.authorized", value: "authorized" },
  { label: "ge.applicant.relationship.options.member", value: "member" },
  { label: "ge.applicant.relationship.options.professional", value: "professional" },
  { label: "mcap.common.options.other", value: "other" },
];

const INDUSTRY_OPTIONS = [
  { label: "ge.company.industryOptions.crypto", value: "crypto_related" },
  { label: "ge.company.industryOptions.it", value: "it_blockchain_software" },
  { label: "ge.company.industryOptions.cryptoInvestment", value: "crypto_investment" },
  { label: "ge.company.industryOptions.cryptoGames", value: "crypto_games" },
  { label: "ge.company.industryOptions.forex", value: "forex" },
  { label: "ge.company.industryOptions.finance", value: "finance_investment_consulting_lending" },
  { label: "ge.company.industryOptions.trading", value: "trading" },
  { label: "ge.company.industryOptions.wholesaleRetail", value: "wholesale_retail_distribution" },
  { label: "ge.company.industryOptions.consulting", value: "consulting" },
  { label: "ge.company.industryOptions.manufacturing", value: "manufacturing" },
  { label: "ge.company.industryOptions.ecommerce", value: "online_service_ecommerce" },
  { label: "ge.company.industryOptions.onlinePurchase", value: "online_direct_purchase_shipping_agent" },
  { label: "mcap.common.options.other", value: "other" },
];

const PURPOSE_OPTIONS = [
  { label: "ge.company.purposeOptions.relaxedRegulation", value: "business_diversification_relaxed_regulations" },
  { label: "ge.company.purposeOptions.advisorSuggestion", value: "advisor_investor_partner_suggestion" },
  { label: "ge.company.purposeOptions.internationalExpansion", value: "international_business_expansion" },
  { label: "ge.company.purposeOptions.assetManagement", value: "asset_management_real_estate_financial_assets" },
  { label: "ge.company.purposeOptions.holding", value: "holding_company_investment_management" },
  { label: "ge.company.purposeOptions.financialPolicy", value: "free_financial_policy_advantage" },
  { label: "ge.company.purposeOptions.lowTax", value: "low_tax_non_vat_trade_volume_expansion" },
  { label: "ge.company.purposeOptions.capitalGains", value: "capital_gains_tax_investment_advantage" },
  { label: "mcap.common.options.other", value: "other" },
];

const GE_PRICING = {
  llc_remote_formation: 2950,
  ge_remote_bank_opening: 2500,
  sekerbank_offshore_alternative: 400,
} as const;



export const buildGeServiceItems = (_data: Record<string, any>): GeServiceItem[] => {
  const items: GeServiceItem[] = [
    {
      id: "ge_llc_remote_formation",
      label: "ge.services.items.base.label",
      amount: GE_PRICING.llc_remote_formation,
      original: GE_PRICING.llc_remote_formation,
      mandatory: true,
      kind: "service",
      info: "ge.services.items.base.info",
    },
    {
      id: "ge_remote_bank_opening",
      label: "ge.services.bankingChoice.options.georgiaRemoteBankOpening",
      amount: GE_PRICING.ge_remote_bank_opening,
      original: GE_PRICING.ge_remote_bank_opening,
      mandatory: false,
      kind: "service",
      info: "ge.services.items.bankOpening.info",
    },
    {
      id: "sekerbank_offshore_alternative",
      label: "ge.services.bankingChoice.options.sekerbankOffshoreAlternative",
      amount: GE_PRICING.sekerbank_offshore_alternative,
      original: GE_PRICING.sekerbank_offshore_alternative,
      mandatory: false,
      kind: "service",
      info: "ge.services.items.sekerbankAlternative.info",
    }
  ];

  return items;
};

const getSelectedGeServiceIds = (data: Record<string, any>) => {
  const ids = new Set<string>();

  const optionalFeeIds = Array.isArray(data?.optionalFeeIds) ? data.optionalFeeIds : [];
  const serviceItemsSelected = Array.isArray(data?.serviceItemsSelected)
    ? data.serviceItemsSelected
    : [];

  optionalFeeIds.forEach((id: any) => ids.add(String(id)));
  serviceItemsSelected.forEach((id: any) => ids.add(String(id)));

  const bankingChoice = data?.geBankingServiceChoice;
  if (Array.isArray(bankingChoice)) {
    bankingChoice.forEach((id: any) => ids.add(String(id)));
  } else if (typeof bankingChoice === "string" && bankingChoice.trim()) {
    ids.add(bankingChoice.trim());
  }

  return ids;
};

export const computeGeFees = (data: Record<string, any>) => {
  const selectedServiceIds = getSelectedGeServiceIds(data);
  const allItems = buildGeServiceItems(data);
  const selectedItemsSource = allItems.filter(
    (item) => item.mandatory || selectedServiceIds.has(item.id)
  );

  const selectedItemsUsd: McapFeeItem[] = selectedItemsSource.map((item) => ({
    id: item.id,
    label: item.label,
    amount: item.amount,
    kind: item.kind || "service",
    original: item.original,
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
      original: Number((Number(item.original || 0) * exchangeRateUsedRaw).toFixed(2)),
    }))
    : selectedItemsUsd;

  const total = shouldConvertToHkd ? Number((totalUsd * exchangeRateUsedRaw).toFixed(2)) : totalUsd;
  const government = 0;
  const service = total;
  const cardFeePct = paymentCurrency === "HKD" ? 0.04 : 0.06;
  const payMethod = String(data?.payMethod || "").toLowerCase();
  const cardFeeSurcharge = payMethod === "card" ? Number((total * cardFeePct).toFixed(2)) : 0;
  const grandTotal = Number((total + cardFeeSurcharge).toFixed(2));

  return {
    currency: shouldConvertToHkd ? "HKD" : "USD",
    items: selectedItems,
    government,
    service,
    total,
    cardFeePct,
    cardFeeSurcharge,
    grandTotal,
    originalCurrency: "USD",
    originalAmount: totalUsd,
    ...(shouldConvertToHkd ? { exchangeRateUsed: exchangeRateUsedRaw, originalAmountUsd: totalUsd } : {}),
    note: "ge.fees.note",
  };
};

const buildApplicantFields = (): McapField[] => [
  {
    type: "info",
    label: "ge.applicant.guidance.label",
    content: "ge.applicant.guidance.content",
    colSpan: 2,
  },
  {
    type: "text",
    name: "applicantName",
    label: "mcap.common.fields.applicantName",
    required: true,
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
    required: true,
    colSpan: 2,
  },
  {
    type: "checkbox-group",
    name: "applicantRelationshipType",
    label: "ge.applicant.relationship.label",
    required: true,
    options: APPLICANT_RELATIONSHIP_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "applicantRelationshipOther",
    label: "ge.applicant.relationship.other",
    condition: (f) =>
      Array.isArray(f.applicantRelationshipType) && f.applicantRelationshipType.includes("other"),
    required: true,
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
      { label: "mcap.common.options.other", value: "other" },
    ],
    colSpan: 2,
  },
  {
    type: "text",
    name: "snsId",
    label: "mcap.common.fields.messengerId",
    condition: (f) => !!f.sns,
    colSpan: 2,
  },
];

const buildComplianceFields = (): McapField[] => [
  {
    type: "radio-group",
    name: "legalAndEthicalConcern",
    label: "ge.compliance.legalAndEthicalConcern.label",
    required: true,
    options: [
      { label: "mcap.common.options.yes", value: "yes" },
      { label: "mcap.common.options.no", value: "no" },
      { label: "mcap.common.options.doNotKnow", value: "unknown" },
      { label: "ge.compliance.options.considerLegalAdvice", value: "consider_legal_advice" },
      { label: "mcap.common.options.other", value: "other" },
    ],
    colSpan: 2,
  },
  {
    type: "text",
    name: "legalAndEthicalConcernOther",
    label: "mcap.common.fields.otherDetails",
    condition: (f) => f.legalAndEthicalConcern === "other",
    required: true,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "annualRenewalConsent",
    label: "ge.compliance.annualRenewalConsent.label",
    required: true,
    options: [
      { label: "mcap.common.options.yes", value: "yes" },
      { label: "mcap.common.options.no", value: "no" },
      { label: "mcap.common.options.selfHandleAfterSetup", value: "self_handle" },
      { label: "mcap.common.options.noIfFixedAnnualCosts", value: "no_if_fixed_cost" },
      { label: "mcap.common.options.adviceRequiredBeforeProceeding", value: "advice_required" },
    ],
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "sanctionedCountryOperations",
    label: "ge.compliance.sanctionedCountryOperations.label",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "sanctionedResidenceExposure",
    label: "ge.compliance.sanctionedResidenceExposure.label",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "sanctionedOwnershipOrAgency",
    label: "ge.compliance.sanctionedOwnershipOrAgency.label",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "crimeaSevastopolExposure",
    label: "ge.compliance.crimeaSevastopolExposure.label",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "oilGasMilitaryExposure",
    label: "ge.compliance.oilGasMilitaryExposure.label",
    tooltip: "ge.compliance.oilGasMilitaryExposure.tooltip",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
];

const buildCompanyFields = (): McapField[] => [
  {
    type: "info",
    label: "ge.company.requirements.label",
    content: "ge.company.requirements.content",
    colSpan: 2,
  },
  {
    type: "checkbox-group",
    name: "industrySelection",
    label: "ge.company.industrySelection.label",
    required: true,
    options: INDUSTRY_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "industrySelectionOther",
    label: "mcap.common.fields.otherIndustryDetails",
    condition: (f) => Array.isArray(f.industrySelection) && f.industrySelection.includes("other"),
    required: true,
    colSpan: 2,
  },
  {
    type: "textarea",
    name: "businessDescription",
    label: "mcap.common.fields.productServiceDescription",
    required: true,
    rows: 3,
    colSpan: 2,
  },
  {
    type: "text",
    name: "websiteAddress",
    label: "mcap.common.fields.websiteAddressOptional",
    placeholder: "mcap.common.placeholders.website",
    colSpan: 2,
  },
  {
    type: "checkbox-group",
    name: "purposeOfEstablishment",
    label: "ge.company.purposeOfEstablishment.label",
    required: true,
    options: PURPOSE_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "purposeOfEstablishmentOther",
    label: "mcap.common.fields.otherPurposeDetails",
    condition: (f) => Array.isArray(f.purposeOfEstablishment) && f.purposeOfEstablishment.includes("other"),
    required: true,
    colSpan: 2,
  },
  {
    type: "select",
    name: "totalCapitalGel",
    label: "ge.company.totalCapitalGel.label",
    tooltip: "ge.company.totalCapitalGel.tooltip",
    required: true,
    options: [
      { label: "1", value: "1" },
      { label: "100", value: "100" },
      { label: "1,000", value: "1000" },
      { label: "10,000", value: "10000" },
      { label: "mcap.common.options.other", value: "other" },
    ],
    colSpan: 2,
  },
  {
    type: "number",
    name: "totalCapitalGelOther",
    label: "ge.company.totalCapitalGelOther.label",
    condition: (f) => f.totalCapitalGel === "other",
    required: true,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "registeredAddressChoice",
    label: "ge.company.registeredAddressChoice.label",
    required: true,
    options: [
      {
        label: "ge.company.registeredAddressChoice.options.mirrAddress",
        value: "mirr_business_address",
      },
      {
        label: "ge.company.registeredAddressChoice.options.ownAddress",
        value: "own_address",
      },
    ],
    colSpan: 2,
  },
  {
    type: "textarea",
    name: "registeredAddressDetails",
    label: "ge.company.registeredAddressDetails.label",
    condition: (f) => f.registeredAddressChoice === "own_address",
    required: true,
    rows: 3,
    colSpan: 2,
  },
];

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
    label: "ge.services.packageOverview.label",
    content: "ge.services.packageOverview.content",
    colSpan: 2,
  }
];

export const GE_FULL_CONFIG: McapConfig = {
  id: "ge-full",
  countryCode: "GE",
  countryName: "Georgia",
  currency: "USD",
  title: "ge.title",
  confirmationDetails: {
    title: "ge.confirmation.title",
    message: "ge.confirmation.message",
    steps: [
      {
        title: "ge.confirmation.steps.complianceReview.title",
        description: "ge.confirmation.steps.complianceReview.description",
      },
      {
        title: "ge.confirmation.steps.companySetup.title",
        description: "ge.confirmation.steps.companySetup.description",
      },
      {
        title: "ge.confirmation.steps.postSetup.title",
        description: "ge.confirmation.steps.postSetup.description",
      },
    ],
  },
  reviewSummary: [
    {
      id: "applicant",
      kind: "field",
      label: "mcap.review.summary.applicant",
      fieldNames: ["applicantName"],
    },
    {
      id: "companyName",
      kind: "field",
      label: "mcap.review.summary.companyName",
      fieldNames: ["companyName1"],
    },
    {
      id: "email",
      kind: "field",
      label: "mcap.review.summary.email",
      fieldNames: ["applicantEmail"],
    },
    {
      id: "phone",
      kind: "field",
      label: "mcap.review.summary.phone",
      fieldNames: ["applicantPhone"],
    },
    {
      id: "relationship",
      kind: "field",
      label: "mcap.review.summary.entityType",
      fieldNames: ["applicantRelationshipType"],
      useFieldLabel: true,
    },
    {
      id: "industry",
      kind: "field",
      label: "mcap.review.summary.industry",
      fieldNames: ["industrySelection"],
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
      description: "ge.steps.applicant.description",
      fields: buildApplicantFields(),
    },
    {
      id: "compliance",
      title: "mcap.common.steps.compliance",
      description: "ge.steps.compliance.description",
      fields: buildComplianceFields(),
    },
    {
      id: "company",
      title: "mcap.common.steps.company",
      description: "ge.steps.company.description",
      fields: buildCompanyFields(),
    },
    {
      id: "parties",
      title: "mcap.common.steps.parties",
      description: "ge.steps.parties.description",
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
      title: "mcap.common.steps.services",
      description: "ge.steps.services.description",
      widget: "ServiceSelectionWidget",
      fields: buildServiceFields(),
      serviceItems: (data) => buildGeServiceItems(data),
      supportedCurrencies: ["USD", "HKD"],
      computeFees: (data) => computeGeFees(data),
    },
    {
      id: "invoice",
      title: "mcap.common.steps.invoice",
      description: "ge.steps.invoice.description",
      widget: "InvoiceWidget",
      computeFees: (data) => computeGeFees(data),
    },
    {
      id: "payment",
      title: "mcap.common.steps.payment",
      description: "ge.steps.payment.description",
      widget: "PaymentWidget",
      supportedCurrencies: ["USD", "HKD"],
      computeFees: (data) => computeGeFees(data),
    },
    {
      id: "review",
      title: "mcap.common.steps.review",
      fields: [
        {
          type: "checkbox",
          name: "geDeclarationAgreement",
          label: "ge.review.declarationAgreement.label",
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
