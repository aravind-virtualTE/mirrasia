/* eslint-disable @typescript-eslint/no-explicit-any */
import type { McapConfig, McapFeeItem, McapField, McapFieldOption } from "./types";

type HuServiceItem = {
  id: string;
  label: string;
  amount: number;
  original: number;
  mandatory: boolean;
  kind?: "government" | "service" | "optional" | "other";
  info?: string;
  quantity?: number;
  managedByPartyData?: boolean;
  managedStatusLabel?: string;
  unitLabel?: string;
};

const HU_BASE_CURRENCY = "EUR";

const HU_PRICING = {
  incorporationAndFirstYear: 3500,
  bankAccountOpening: 0,
  entityShareholderKyc: 700,
  accountingSixMonthsFrom: 1000,
  representativeResidencePermit: 3000,
  familyResidencePermitPack: 2000,
  legalOpinionWhitepaperReview: 0,
  legalOpinionDomesticExchange: 0,
  businessRegulatoryConsulting: 0,
} as const;

const YES_NO_NOT_SURE: McapFieldOption[] = [
  { label: "mcap.common.options.yes", value: "yes" },
  { label: "mcap.common.options.no", value: "no" },
  { label: "hu.compliance.options.notSure", value: "unknown" },
];

const YES_NO_OTHER: McapFieldOption[] = [
  { label: "mcap.common.options.yes", value: "yes" },
  { label: "mcap.common.options.no", value: "no" },
  { label: "mcap.common.options.other", value: "other" },
];

const APPLICANT_RELATIONSHIP_OPTIONS: McapFieldOption[] = [
  { label: "hu.applicant.relationshipOptions.shareholder", value: "shareholder" },
  { label: "hu.applicant.relationshipOptions.keyController", value: "key_controller_25_plus" },
  { label: "hu.applicant.relationshipOptions.director", value: "director" },
  { label: "hu.applicant.relationshipOptions.generalManager", value: "general_manager" },
  { label: "hu.applicant.relationshipOptions.dcp", value: "dcp" },
  { label: "hu.applicant.relationshipOptions.officialPartner", value: "official_partner" },
  { label: "hu.applicant.relationshipOptions.other", value: "other" },
];

const INDUSTRY_OPTIONS: McapFieldOption[] = [
  { label: "hu.company.industryOptions.cryptoRelated", value: "crypto_related" },
  { label: "hu.company.industryOptions.itBlockchainSoftware", value: "it_blockchain_software" },
  { label: "hu.company.industryOptions.cryptoInvestment", value: "crypto_investment" },
  { label: "hu.company.industryOptions.cryptoGames", value: "crypto_games" },
  { label: "hu.company.industryOptions.forexTrading", value: "forex_trading" },
  { label: "hu.company.industryOptions.financeInvestmentConsulting", value: "finance_investment_consulting" },
  { label: "hu.company.industryOptions.trade", value: "trade" },
  { label: "hu.company.industryOptions.wholesaleRetail", value: "wholesale_retail" },
  { label: "hu.company.industryOptions.consulting", value: "consulting" },
  { label: "hu.company.industryOptions.manufacturing", value: "manufacturing" },
  { label: "hu.company.industryOptions.ecommerce", value: "ecommerce" },
  { label: "hu.company.industryOptions.onlineDirectPurchase", value: "online_direct_purchase" },
  { label: "mcap.common.options.other", value: "other" },
];

const PURPOSE_OPTIONS: McapFieldOption[] = [
  { label: "hu.company.purposeOptions.businessDiversification", value: "business_diversification" },
  { label: "hu.company.purposeOptions.advisorPartnerSuggestion", value: "advisor_partner_suggestion" },
  { label: "hu.company.purposeOptions.internationalExpansion", value: "international_expansion" },
  { label: "hu.company.purposeOptions.assetManagement", value: "asset_management" },
  { label: "hu.company.purposeOptions.holdingCompany", value: "holding_company" },
  { label: "hu.company.purposeOptions.financialPolicyAdvantage", value: "financial_policy_advantage" },
  { label: "hu.company.purposeOptions.taxEfficiency", value: "tax_efficiency" },
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

const normalizeRoles = (roles: unknown) =>
  Array.isArray(roles)
    ? roles.map((role) => String(role || "").trim().toLowerCase()).filter(Boolean)
    : [];

const getEntityShareholderCount = (data: Record<string, any>) => {
  const parties = Array.isArray(data?.parties) ? data.parties : [];
  return parties.filter((party: any) => {
    const roles = normalizeRoles(party?.roles);
    return party?.type === "entity" && roles.includes("shareholder");
  }).length;
};

const getFamilyResidencePermitPersons = (data: Record<string, any>) => {
  if (!data?.huIncludeFamilyResidencePermit) return 0;
  const parsed = Number(data?.huFamilyResidencePermitPersons || 0);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.floor(parsed);
};

const getFamilyResidencePermitPacks = (data: Record<string, any>) =>
  Math.ceil(getFamilyResidencePermitPersons(data) / 2);

export const buildHuServiceItems = (data: Record<string, any>): HuServiceItem[] => {
  const items: HuServiceItem[] = [
    {
      id: "hu_kft_incorporation_first_year",
      label: "hu.services.items.basePackage.label",
      amount: HU_PRICING.incorporationAndFirstYear,
      original: HU_PRICING.incorporationAndFirstYear,
      mandatory: true,
      kind: "service",
      info: "hu.services.items.basePackage.info",
    },
    {
      id: "hu_bank_account_opening",
      label: "hu.services.items.bankAccountOpening.label",
      amount: HU_PRICING.bankAccountOpening,
      original: HU_PRICING.bankAccountOpening,
      mandatory: false,
      kind: "other",
      info: "hu.services.items.bankAccountOpening.info",
    },
    {
      id: "hu_accounting_six_months",
      label: "hu.services.items.accounting.label",
      amount: HU_PRICING.accountingSixMonthsFrom,
      original: HU_PRICING.accountingSixMonthsFrom,
      mandatory: false,
      kind: "service",
      info: "hu.services.items.accounting.info",
    },
    {
      id: "hu_representative_residence_permit",
      label: "hu.services.items.representativeResidencePermit.label",
      amount: HU_PRICING.representativeResidencePermit,
      original: HU_PRICING.representativeResidencePermit,
      mandatory: false,
      kind: "service",
      info: "hu.services.items.representativeResidencePermit.info",
    },
    {
      id: "hu_legal_opinion_whitepaper_review",
      label: "hu.services.items.legalOpinionWhitepaperReview.label",
      amount: HU_PRICING.legalOpinionWhitepaperReview,
      original: HU_PRICING.legalOpinionWhitepaperReview,
      mandatory: false,
      kind: "other",
      info: "hu.services.items.legalOpinionWhitepaperReview.info",
    },
    {
      id: "hu_legal_opinion_domestic_exchange",
      label: "hu.services.items.legalOpinionDomesticExchange.label",
      amount: HU_PRICING.legalOpinionDomesticExchange,
      original: HU_PRICING.legalOpinionDomesticExchange,
      mandatory: false,
      kind: "other",
      info: "hu.services.items.legalOpinionDomesticExchange.info",
    },   
    {
      id: "hu_business_regulatory_consulting",
      label: "hu.services.items.businessRegulatoryConsulting.label",
      amount: HU_PRICING.businessRegulatoryConsulting,
      original: HU_PRICING.businessRegulatoryConsulting,
      mandatory: false,
      kind: "other",
      info: "hu.services.items.businessRegulatoryConsulting.info",
    },
  ];

  const entityShareholderCount = getEntityShareholderCount(data);
  if (entityShareholderCount > 0) {
    items.push({
      id: "hu_entity_shareholder_kyc",
      label: "hu.services.items.entityShareholderKyc.label",
      amount: HU_PRICING.entityShareholderKyc,
      original: HU_PRICING.entityShareholderKyc,
      mandatory: true,
      kind: "service",
      info: "hu.services.items.entityShareholderKyc.info",
      quantity: entityShareholderCount,
      managedByPartyData: true,
      managedStatusLabel: "hu.services.managed.partyDriven",
      unitLabel: "hu.services.units.entityShareholder",
    });
  }

  const familyResidencePermitPacks = getFamilyResidencePermitPacks(data);
  if (familyResidencePermitPacks > 0) {
    items.push({
      id: "hu_family_residence_permit",
      label: "hu.services.familyResidencePermit.label",
      amount: HU_PRICING.familyResidencePermitPack,
      original: HU_PRICING.familyResidencePermitPack,
      mandatory: true,
      kind: "service",
      info: "hu.services.familyResidencePermit.info",
      quantity: familyResidencePermitPacks,
      managedByPartyData: true,
      managedStatusLabel: "hu.services.managed.familyInput",
      unitLabel: "hu.services.units.twoPersonPack",
    });
  }

  return items;
};

export const computeHuFees = (data: Record<string, any>) => {
  const selectedServiceIds = getSelectedServiceIds(data);
  const allItems = buildHuServiceItems(data);

  const selectedItemsBase: Array<McapFeeItem & Record<string, any>> = allItems
    .filter((item) => item.mandatory || selectedServiceIds.has(item.id))
    .map((item) => ({
      id: item.id,
      label: item.label,
      amount: item.amount,
      kind: item.kind || "service",
      quantity: Math.max(1, Number(item.quantity || 1)),
      ...(item.original !== undefined ? { original: item.original } : {}),
      ...(item.info ? { info: item.info } : {}),
      ...(item.managedByPartyData ? { managedByPartyData: true } : {}),
      ...(item.managedStatusLabel ? { managedStatusLabel: item.managedStatusLabel } : {}),
      ...(item.unitLabel ? { unitLabel: item.unitLabel } : {}),
    }));

  const totalBase = selectedItemsBase.reduce(
    (sum, item) => sum + (Number(item.amount || 0) * Number(item.quantity || 1)),
    0
  );

  const paymentCurrency = String(data?.paymentCurrency || HU_BASE_CURRENCY).toUpperCase();
  const cachedComputedCurrency = String(data?.computedFees?.currency || "").toUpperCase();
  const exchangeRateUsedRaw = Number(data?.computedFees?.exchangeRateUsed || 0);
  const shouldConvertFromBase =
    paymentCurrency !== HU_BASE_CURRENCY
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
    .reduce((sum: number, item: any) => sum + (Number(item.amount || 0) * Number(item.quantity || 1)), 0);
  const service = Number((total - government).toFixed(2));

  const cardFeePct = paymentCurrency === "HKD" ? 0.04 : 0.06;
  const payMethod = String(data?.payMethod || "").toLowerCase();
  const cardFeeSurcharge = payMethod === "card" ? Number((total * cardFeePct).toFixed(2)) : 0;
  const grandTotal = Number((total + cardFeeSurcharge).toFixed(2));

  return {
    currency: shouldConvertFromBase ? paymentCurrency : HU_BASE_CURRENCY,
    items: selectedItems,
    government,
    service,
    total,
    cardFeePct,
    cardFeeSurcharge,
    grandTotal,
    originalCurrency: HU_BASE_CURRENCY,
    originalAmount: totalBase,
    ...(shouldConvertFromBase ? { exchangeRateUsed: exchangeRateUsedRaw } : {}),
    note: "hu.services.note",
  };
};

const buildApplicantFields = (): McapField[] => [
  {
    type: "info",
    label: "hu.applicant.notice.title",
    content: "hu.applicant.notice.content",
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "applicantChangedName",
    label: "hu.applicant.changedName",
    required: true,
    options: YES_NO_OTHER,
    colSpan: 2,
  },
  {
    type: "text",
    name: "applicantPreviousNameEnglish",
    label: "hu.applicant.previousNameEnglish",
    condition: (f) => String(f.applicantChangedName || "") === "yes",
    required: true,
    colSpan: 2,
  },
  {
    type: "text",
    name: "applicantChangedNameOtherDetails",
    label: "hu.applicant.changedNameOther",
    condition: (f) => String(f.applicantChangedName || "") === "other",
    required: true,
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
  },
  {
    type: "text",
    name: "applicantDateOfBirth",
    label: "hu.applicant.dateOfBirth",
    required: true,
  },
  {
    type: "text",
    name: "applicantPlaceOfBirth",
    label: "hu.applicant.placeOfBirth",
    required: true,
  },
  {
    type: "text",
    name: "applicantNationality",
    label: "hu.applicant.nationality",
    required: true,
  },
  {
    type: "text",
    name: "applicantPassportNumber",
    label: "hu.applicant.passportNumber",
    required: true,
  },
  {
    type: "textarea",
    name: "applicantResidentialAddress",
    label: "hu.applicant.residentialAddress",
    required: true,
    rows: 3,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "applicantMailingAddressOption",
    label: "hu.applicant.mailingAddress",
    required: true,
    options: [
      { label: "hu.applicant.mailingOptions.same", value: "same" },
      { label: "hu.applicant.mailingOptions.different", value: "different" },
    ],
    colSpan: 2,
  },
  {
    type: "textarea",
    name: "applicantMailingAddressDetails",
    label: "hu.applicant.mailingAddressDetails",
    condition: (f) => String(f.applicantMailingAddressOption || "") === "different",
    required: true,
    rows: 3,
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
    name: "applicantRelationshipToHungarianCompany",
    label: "hu.applicant.relationshipToCompany",
    required: true,
    options: APPLICANT_RELATIONSHIP_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "applicantRelationshipOther",
    label: "mcap.common.fields.otherRelationshipDetails",
    condition: (f) =>
      Array.isArray(f.applicantRelationshipToHungarianCompany)
      && f.applicantRelationshipToHungarianCompany.includes("other"),
    required: true,
    colSpan: 2,
  },
  {
    type: "select",
    name: "sns",
    label: "mcap.common.fields.preferredMessenger",
    options: [
      { label: "mcap.common.messenger.whatsApp", value: "whatsapp" },
      { label: "mcap.common.messenger.weChat", value: "wechat" },
      { label: "mcap.common.messenger.line", value: "line" },
      { label: "mcap.common.messenger.kakaoTalk", value: "kakaotalk" },
      { label: "mcap.common.messenger.telegram", value: "telegram" },
    ],
  },
  {
    type: "text",
    name: "snsId",
    label: "mcap.common.fields.messengerId",
    condition: (f) => !!f.sns,
  },
  // {
  //   type: "info-list",
  //   label: "hu.applicant.designatedContactResponsibilities",
  //   listPrefix: "hu.applicant.designatedContactItems",
  //   listItemKeys: ["communication", "inquiries", "documents", "access"],
  //   colSpan: 2,
  // },
];

const buildComplianceFields = (): McapField[] => [
  {
    type: "radio-group",
    name: "annualRenewalAgreement",
    label: "hu.compliance.annualRenewalAgreement",
    required: true,
    options: [
      { label: "mcap.common.options.yes", value: "yes" },
      { label: "mcap.common.options.no", value: "no" },
      { label: "hu.compliance.annualRenewalOptions.internalAfterIncorporation", value: "internal" },
      { label: "hu.compliance.annualRenewalOptions.noIfAnnualCostsApply", value: "no_if_fixed_cost" },
      { label: "hu.compliance.annualRenewalOptions.consultationRequired", value: "advice_required" },
    ],
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "sanctionedCountriesBusiness",
    label: "hu.compliance.sanctionedCountriesBusiness",
    required: true,
    options: YES_NO_NOT_SURE,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "sanctionedPersonsResidence",
    label: "hu.compliance.sanctionedPersonsResidence",
    required: true,
    options: YES_NO_NOT_SURE,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "sanctionedOwnershipControl",
    label: "hu.compliance.sanctionedOwnershipControl",
    required: true,
    options: YES_NO_NOT_SURE,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "crimeaSevastopolBusiness",
    label: "hu.compliance.crimeaSevastopolBusiness",
    required: true,
    options: YES_NO_NOT_SURE,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "restrictedSectors",
    label: "hu.compliance.restrictedSectors",
    required: true,
    options: YES_NO_NOT_SURE,
    colSpan: 2,
  },
];

const buildCompanyFields = (): McapField[] => [
  // {
  //   type: "info-list",
  //   label: "hu.company.notesLabel",
  //   listPrefix: "hu.company.notes",
  //   listItemKeys: ["vat", "bank", "emi", "apostille", "documents"],
  //   colSpan: 2,
  // },
  {
    type: "checkbox-group",
    name: "industrySelection",
    label: "hu.company.industrySelection",
    required: true,
    options: INDUSTRY_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "industrySelectionOther",
    label: "hu.company.industrySelectionOther",
    condition: (f) => Array.isArray(f.industrySelection) && f.industrySelection.includes("other"),
    required: true,
    colSpan: 2,
  },
  {
    type: "text",
    name: "productServiceDescription",
    label: "hu.company.productServiceDescription",
    required: true,
    colSpan: 2,
  },
  {
    type: "textarea",
    name: "businessDescription",
    label: "hu.company.businessDescription",
    required: true,
    rows: 4,
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
    label: "hu.company.purposeOfEstablishment",
    required: true,
    options: PURPOSE_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "purposeOfEstablishmentOther",
    label: "hu.company.purposeOfEstablishmentOther",
    condition: (f) =>
      Array.isArray(f.purposeOfEstablishment)
      && f.purposeOfEstablishment.includes("other"),
    required: true,
    colSpan: 2,
  },
  {
    type: "number",
    name: "registeredCapitalHuf",
    label: "hu.company.registeredCapitalHuf",
    required: true,
    defaultValue: 3000000,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "registeredAddressOption",
    label: "hu.company.registeredAddressOption",
    required: true,
    options: [
      { label: "hu.company.registeredAddressOptions.mirr", value: "mirr_address" },
      { label: "hu.company.registeredAddressOptions.client", value: "client_address" },
    ],
    colSpan: 2,
  },
  {
    type: "textarea",
    name: "registeredAddressDetails",
    label: "hu.company.registeredAddressDetails",
    condition: (f) => String(f.registeredAddressOption || "") === "client_address",
    required: true,
    rows: 3,
    colSpan: 2,
  },
  {
    type: "checkbox",
    name: "capitalRequirementAcknowledged",
    label: "hu.company.capitalRequirementAcknowledged",
    required: true,
    colSpan: 2,
  },
];

const buildAccountingFields = (): McapField[] => [
  {
    type: "select",
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
    name: "expectedMonthlyInvoices",
    label: "hu.accounting.expectedMonthlyInvoices",
    options: [
      { label: "hu.accounting.invoiceVolume.upTo50", value: "up_to_50" },
      { label: "hu.accounting.invoiceVolume.from51To100", value: "51_100" },
      { label: "hu.accounting.invoiceVolume.from101To200", value: "101_200" },
      { label: "hu.accounting.invoiceVolume.from201To500", value: "201_500" },
      { label: "hu.accounting.invoiceVolume.moreThan500", value: "500_plus" },
    ],
    colSpan: 2,
  },
  {
    type: "select",
    name: "expectedEmployees",
    label: "hu.accounting.expectedEmployees",
    options: [
      { label: "hu.accounting.employeeCount.zeroToThree", value: "0_3" },
      { label: "hu.accounting.employeeCount.fourToFive", value: "4_5" },
      { label: "hu.accounting.employeeCount.sixToSeven", value: "6_7" },
      { label: "hu.accounting.employeeCount.moreThanSeven", value: "7_plus" },
    ],
    colSpan: 2,
  },
  {
    type: "select",
    name: "vatTaxSupportNeed",
    label: "mcap.common.fields.vatTaxSupportNeed",
    options: [
      { label: "mcap.common.options.yes", value: "yes" },
      { label: "mcap.common.options.no", value: "no" },
      { label: "hu.accounting.needAdvisory", value: "advice" },
    ],
    colSpan: 2,
  },
  {
    type: "textarea",
    name: "accountingNotes",
    label: "hu.accounting.notes",
    rows: 3,
    colSpan: 2,
  },
];

const buildServiceFields = (): McapField[] => [
  {
    type: "info",
    label: "hu.services.notice.title",
    content: "hu.services.notice.content",
    colSpan: 2,
  },
  {
    type: "checkbox",
    name: "huIncludeFamilyResidencePermit",
    label: "hu.services.familyResidencePermit.selectedLabel",
    colSpan: 2,
  },
  {
    type: "number",
    name: "huFamilyResidencePermitPersons",
    label: "hu.services.familyResidencePermit.personCountLabel",
    condition: (f) => Boolean(f.huIncludeFamilyResidencePermit),
    required: true,
    defaultValue: 1,
    colSpan: 2,
  },
  {
    type: "info",
    label: "hu.services.familyResidencePermit.personCountHelpTitle",
    content: "hu.services.familyResidencePermit.personCountHelp",
    condition: (f) => Boolean(f.huIncludeFamilyResidencePermit),
    colSpan: 2,
  },
];

export const HU_FULL_CONFIG: McapConfig = {
  id: "hu-full",
  countryCode: "HU",
  countryName: "Hungary Kft",
  currency: HU_BASE_CURRENCY,
  title: "hu.title",
  confirmationDetails: {
    title: "hu.confirmation.title",
    message: "hu.confirmation.message",
    steps: [
      {
        title: "hu.confirmation.steps.documentReview.title",
        description: "hu.confirmation.steps.documentReview.description",
      },
      {
        title: "hu.confirmation.steps.incorporation.title",
        description: "hu.confirmation.steps.incorporation.description",
      },
      {
        title: "hu.confirmation.steps.postFiling.title",
        description: "hu.confirmation.steps.postFiling.description",
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
      label: "hu.reviewSummary.relationship",
      fieldNames: ["applicantRelationshipToHungarianCompany"],
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
      description: "hu.applicant.description",
      fields: buildApplicantFields(),
    },
    {
      id: "compliance",
      title: "mcap.common.steps.compliance",
      description: "hu.compliance.description",
      fields: buildComplianceFields(),
    },
    {
      id: "company",
      title: "mcap.common.steps.company",
      description: "hu.company.description",
      fields: buildCompanyFields(),
    },
    {
      id: "parties",
      title: "mcap.common.steps.parties",
      description: "hu.parties.description",
      widget: "PartiesManager",
      minParties: 1,
      requireDcp: true,
      requirePartyInvite: true,
      defaultPartyRoles: [],
      partyCoverageRules: [
        {
          key: "roles",
          storage: "root",
          requiredValues: ["director"],
          label: "mcap.common.coverage.director",
          valueLabels: {
            director: "mcap.common.coverage.directorAtLeastOne",
          },
        },
      ],
    },
    {
      id: "accounting",
      title: "mcap.common.steps.accounting",
      description: "hu.accounting.description",
      fields: buildAccountingFields(),
    },
    {
      id: "services",
      title: "mcap.common.steps.services",
      description: "hu.services.description",
      widget: "ServiceSelectionWidget",
      fields: buildServiceFields(),
      serviceItems: (data) => buildHuServiceItems(data),
      supportedCurrencies: ["EUR", "USD", "HKD"],
      computeFees: (data) => computeHuFees(data),
    },
    {
      id: "invoice",
      title: "mcap.common.steps.invoice",
      description: "hu.invoice.description",
      widget: "InvoiceWidget",
      computeFees: (data) => computeHuFees(data),
    },
    {
      id: "payment",
      title: "mcap.common.steps.payment",
      description: "hu.payment.description",
      widget: "PaymentWidget",
      supportedCurrencies: ["EUR", "USD", "HKD"],
      computeFees: (data) => computeHuFees(data),
    },
    {
      id: "review",
      title: "mcap.common.steps.review",
      fields: [
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
          type: "checkbox",
          name: "capitalNonBillableAcknowledgment",
          label: "hu.review.capitalNonBillableAcknowledgment",
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
