/* eslint-disable @typescript-eslint/no-explicit-any */
import type { McapConfig, McapFeeItem, McapField } from "./types";

type LtTrack = "standard_incorporation" | "vasp_standard" | "vasp_full" | "emi_license";

type LtServiceItem = {
  id: string;
  label: string;
  amount: number;
  original: number;
  mandatory: boolean;
  kind?: "government" | "service" | "optional" | "other";
  info?: string;
};

const LT_PRICING = {
  standard_incorporation: 1100,
  standard_notary_fee: 250,
  standard_registration_fee: 100,
  standard_corporate_address_1y: 350,
  standard_bank_opening: 400,

  vasp_full_package: 25000,

  emi_license_level_1_9: 60000,
  emi_license_government_fee: 1463,

  aml_officer_basic_annual: 12000,
  aml_officer_experienced_annual: 24000,

  accounting_annual_50: 4800,
  accounting_annual_100: 6120,
  accounting_annual_200: 9240,
  accounting_annual_500: 13560,

  statutory_interest_if_capital_unpaid: 4900,
} as const;

const YES_NO_UNKNOWN = [
  { label: "mcap.common.options.yes", value: "yes" },
  { label: "mcap.common.options.no", value: "no" },
  { label: "mcap.common.options.doNotKnow", value: "unknown" },
];

const APPLICANT_RELATION_OPTIONS = [
  { label: "mcap.lt.auto.k001", value: "director" },
  {
    label: "mcap.lt.auto.k002",
    value: "ceo",
  },
  {
    label: "mcap.lt.auto.k003",
    value: "authorized_proxy",
  },
  { label: "mcap.lt.auto.k004", value: "major_shareholder" },
  {
    label: "mcap.lt.auto.k005",
    value: "professional_advisor",
  },
  { label: "mcap.common.options.other", value: "other" },
];

const INDUSTRY_OPTIONS = [
  { label: "mcap.lt.auto.k006", value: "crypto_related" },
  { label: "mcap.lt.auto.k007", value: "it_blockchain_software" },
  { label: "mcap.lt.auto.k008", value: "crypto_investment" },
  { label: "mcap.lt.auto.k009", value: "crypto_games" },
  { label: "mcap.lt.auto.k010", value: "forex_trading" },
  { label: "mcap.lt.auto.k011", value: "finance_investment_consulting" },
  { label: "mcap.lt.auto.k012", value: "trade" },
  { label: "mcap.lt.auto.k013", value: "wholesale_retail" },
  { label: "mcap.lt.auto.k014", value: "consulting" },
  { label: "mcap.lt.auto.k015", value: "manufacturing" },
  { label: "mcap.lt.auto.k016", value: "ecommerce" },
  { label: "mcap.lt.auto.k017", value: "online_direct_purchase" },
  { label: "mcap.common.options.other", value: "other" },
];

const PURPOSE_OPTIONS = [
  { label: "mcap.lt.auto.k018", value: "business_diversification" },
  { label: "mcap.lt.auto.k019", value: "advisor_partner_suggestion" },
  { label: "mcap.lt.auto.k020", value: "international_expansion" },
  { label: "mcap.lt.auto.k021", value: "asset_management" },
  { label: "mcap.lt.auto.k022", value: "holding_company" },
  { label: "mcap.lt.auto.k023", value: "financial_policy_advantage" },
  { label: "mcap.lt.auto.k024", value: "tax_efficiency" },
  { label: "mcap.common.options.other", value: "other" },
];

const QUOTE_ONLY_REQUEST_OPTIONS = [
  { label: "mcap.lt.auto.k025", value: "legal_opinion_lithuania" },
  { label: "mcap.lt.auto.k026", value: "legal_opinion_domestic_listing" },
  { label: "mcap.lt.auto.k027", value: "legal_opinion_other_country" },
  { label: "mcap.lt.auto.k028", value: "business_consulting" },
  { label: "mcap.lt.auto.k029", value: "emi_level_10_ops" },
  { label: "mcap.lt.auto.k030", value: "other" },
];

const LT_QUOTE_ONLY_LABELS: Record<string, string> = {
  legal_opinion_lithuania: "Legal Opinion in Lithuania (quote after review)",
  legal_opinion_domestic_listing:
    "Legal Opinion for domestic exchange listing (quote after review)",
  legal_opinion_other_country: "Legal Opinion for another country (quote after review)",
  business_consulting: "Business and regulatory consulting (separate quote)",
  emi_level_10_ops:
    "EMI Level 10 practical operations support (separate quote after scope confirmation)",
};

const getSelectedServiceIds = (data: Record<string, any>) => {
  const ids = new Set<string>();
  const optionalFeeIds = Array.isArray(data?.optionalFeeIds) ? data.optionalFeeIds : [];
  const serviceItemsSelected = Array.isArray(data?.serviceItemsSelected)
    ? data.serviceItemsSelected
    : [];
  optionalFeeIds.forEach((id: any) => ids.add(String(id)));
  serviceItemsSelected.forEach((id: any) => ids.add(String(id)));
  return ids;
};

const getLtTrack = (data: Record<string, any>): LtTrack => {
  const raw = String(data?.ltTrack || "standard_incorporation");
  if (["standard_incorporation", "vasp_standard", "vasp_full", "emi_license"].includes(raw)) {
    return raw as LtTrack;
  }
  return "standard_incorporation";
};

const getAmountFromSelect = (value: any, custom: any): number => {
  const normalized = String(value || "none").toLowerCase();
  if (normalized === "none") return 0;
  if (normalized === "custom") {
    const parsed = Number(custom || 0);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }
  const numeric = Number(normalized);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
};

const isVaspTrack = (track: LtTrack) => track === "vasp_standard" || track === "vasp_full";

export const buildLtServiceItems = (data: Record<string, any>): LtServiceItem[] => {
  const track = getLtTrack(data);
  const items: LtServiceItem[] = [];

  if (track === "standard_incorporation") {
    items.push(
      {
        id: "lt_standard_incorporation",
        label: "mcap.lt.auto.k031",
        amount: LT_PRICING.standard_incorporation,
        original: LT_PRICING.standard_incorporation,
        mandatory: true,
        kind: "service",
      },
      {
        id: "lt_standard_notary_fee",
        label: "mcap.lt.auto.k032",
        amount: LT_PRICING.standard_notary_fee,
        original: LT_PRICING.standard_notary_fee,
        mandatory: true,
        kind: "government",
      },
      {
        id: "lt_standard_registration_fee",
        label: "mcap.lt.auto.k033",
        amount: LT_PRICING.standard_registration_fee,
        original: LT_PRICING.standard_registration_fee,
        mandatory: true,
        kind: "government",
      },
      {
        id: "lt_standard_corporate_address_1y",
        label: "mcap.lt.auto.k034",
        amount: LT_PRICING.standard_corporate_address_1y,
        original: LT_PRICING.standard_corporate_address_1y,
        mandatory: true,
        kind: "service",
      },
      {
        id: "lt_standard_bank_opening",
        label: "mcap.lt.auto.k035",
        amount: LT_PRICING.standard_bank_opening,
        original: LT_PRICING.standard_bank_opening,
        mandatory: true,
        kind: "service",
        info: "mcap.lt.auto.k036",
      }
    );
  }

  if (track === "vasp_standard") {
    items.push({
      id: "lt_vasp_standard_quote_only",
      label: "mcap.lt.auto.k037",
      amount: 0,
      original: 0,
      mandatory: true,
      kind: "service",
      info:
        "mcap.lt.auto.k038",
    });
  }

  if (track === "vasp_full") {
    items.push({
      id: "lt_vasp_full",
      label: "mcap.lt.auto.k039",
      amount: LT_PRICING.vasp_full_package,
      original: LT_PRICING.vasp_full_package,
      mandatory: true,
      kind: "service",
      info:
        "mcap.lt.auto.k040",
    });
  }

  if (track === "emi_license") {
    items.push(
      {
        id: "lt_emi_license_level_1_9",
        label: "mcap.lt.auto.k041",
        amount: LT_PRICING.emi_license_level_1_9,
        original: LT_PRICING.emi_license_level_1_9,
        mandatory: true,
        kind: "service",
      },
      {
        id: "lt_emi_license_government_fee",
        label: "mcap.lt.auto.k042",
        amount: LT_PRICING.emi_license_government_fee,
        original: LT_PRICING.emi_license_government_fee,
        mandatory: true,
        kind: "government",
      }
    );
  }

  const amlPlan = String(data?.ltAmlOfficerPlan || "none");
  if (amlPlan === "basic") {
    items.push({
      id: "lt_aml_officer_basic_annual",
      label: "mcap.lt.auto.k043",
      amount: LT_PRICING.aml_officer_basic_annual,
      original: LT_PRICING.aml_officer_basic_annual,
      mandatory: true,
      kind: "service",
      info: "mcap.lt.auto.k044",
    });
  } else if (amlPlan === "experienced") {
    items.push({
      id: "lt_aml_officer_experienced_annual",
      label: "mcap.lt.auto.k045",
      amount: LT_PRICING.aml_officer_experienced_annual,
      original: LT_PRICING.aml_officer_experienced_annual,
      mandatory: true,
      kind: "service",
      info: "mcap.lt.auto.k046",
    });
  }

  const accountingPlan = String(data?.ltAccountingPlan || "none");
  if (accountingPlan === "acc_50") {
    items.push({
      id: "lt_accounting_annual_50",
      label: "mcap.lt.auto.k047",
      amount: LT_PRICING.accounting_annual_50,
      original: LT_PRICING.accounting_annual_50,
      mandatory: true,
      kind: "service",
    });
  } else if (accountingPlan === "acc_100") {
    items.push({
      id: "lt_accounting_annual_100",
      label: "mcap.lt.auto.k048",
      amount: LT_PRICING.accounting_annual_100,
      original: LT_PRICING.accounting_annual_100,
      mandatory: true,
      kind: "service",
    });
  } else if (accountingPlan === "acc_200") {
    items.push({
      id: "lt_accounting_annual_200",
      label: "mcap.lt.auto.k049",
      amount: LT_PRICING.accounting_annual_200,
      original: LT_PRICING.accounting_annual_200,
      mandatory: true,
      kind: "service",
    });
  } else if (accountingPlan === "acc_500") {
    items.push({
      id: "lt_accounting_annual_500",
      label: "mcap.lt.auto.k050",
      amount: LT_PRICING.accounting_annual_500,
      original: LT_PRICING.accounting_annual_500,
      mandatory: true,
      kind: "service",
    });
  } else if (accountingPlan === "quote") {
    items.push({
      id: "lt_accounting_quote",
      label: "mcap.lt.auto.k051",
      amount: 0,
      original: 0,
      mandatory: true,
      kind: "other",
      info: "mcap.lt.auto.k052",
    });
  }

  const emiOnboardingAmount = getAmountFromSelect(
    data?.ltEmiOnboardingFee,
    data?.ltEmiOnboardingFeeCustom
  );
  if (emiOnboardingAmount > 0) {
    items.push({
      id: "lt_emi_onboarding",
      label: "mcap.lt.auto.k053",
      amount: emiOnboardingAmount,
      original: emiOnboardingAmount,
      mandatory: true,
      kind: "other",
      info: "mcap.lt.auto.k054",
    });
  }

  const officeRentAmount = getAmountFromSelect(data?.ltOfficeRentPlan, data?.ltOfficeRentPlanCustom);
  if (officeRentAmount > 0) {
    items.push({
      id: "lt_office_rent_utilities",
      label: "mcap.lt.auto.k055",
      amount: officeRentAmount,
      original: officeRentAmount,
      mandatory: true,
      kind: "other",
      info: "mcap.lt.auto.k056",
    });
  }

  const kycProfiles = Math.max(0, Number(data?.ltKycKytExpectedProfiles || 0));
  if (Number.isFinite(kycProfiles) && kycProfiles > 0) {
    const kycFee = Number((kycProfiles * 2).toFixed(2));
    items.push({
      id: "lt_kyc_kyt_usage",
      label: "mcap.lt.auto.k057",
      amount: kycFee,
      original: kycFee,
      mandatory: true,
      kind: "other",
      info: "mcap.lt.auto.k058",
    });
  }

  if (isVaspTrack(track) && Boolean(data?.ltIncludeStatutoryInterest)) {
    items.push({
      id: "lt_statutory_interest_unpaid_capital",
      label: "mcap.lt.auto.k059",
      amount: LT_PRICING.statutory_interest_if_capital_unpaid,
      original: LT_PRICING.statutory_interest_if_capital_unpaid,
      mandatory: true,
      kind: "other",
      info:
        "mcap.lt.auto.k060",
    });
  }

  const quoteOnlyRequests = Array.isArray(data?.ltQuoteOnlyServiceRequests)
    ? data.ltQuoteOnlyServiceRequests
    : [];

  quoteOnlyRequests
    .map((value: any) => String(value))
    .filter((value: string) => value && value !== "other")
    .forEach((value: string) => {
      const label = LT_QUOTE_ONLY_LABELS[value];
      if (!label) return;
      items.push({
        id: `lt_quote_only_${value}`,
        label,
        amount: 0,
        original: 0,
        mandatory: true,
        kind: "other",
      });
    });

  if (quoteOnlyRequests.includes("other") && String(data?.ltQuoteOnlyServiceRequestsOther || "").trim()) {
    items.push({
      id: "lt_quote_only_other",
      label: "mcap.lt.auto.k030",
      amount: 0,
      original: 0,
      mandatory: true,
      kind: "other",
      info: String(data.ltQuoteOnlyServiceRequestsOther),
    });
  }

  return items;
};

export const computeLtFees = (data: Record<string, any>) => {
  const selectedServiceIds = getSelectedServiceIds(data);
  const allItems = buildLtServiceItems(data);

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
      "mcap.lt.auto.k061",
  };
};

const buildApplicantFields = (): McapField[] => [
  {
    type: "info",
    label: "mcap.lt.auto.k062",
    content:
      "mcap.lt.auto.k063",
    colSpan: 2,
  },
  { type: "text", name: "applicantName", label: "newHk.steps.applicant.fields.applicantName.label", required: true },
  { type: "email", name: "applicantEmail", label: "newHk.steps.applicant.fields.email.label", required: true },
  { type: "text", name: "applicantPhone", label: "newHk.steps.applicant.fields.phone.label", required: true },
  { type: "text", name: "companyName1", label: "newHk.steps.applicant.fields.name1.label", required: true, colSpan: 2 },
  { type: "text", name: "companyName2", label: "newHk.steps.applicant.fields.name2.label", colSpan: 2 },
  { type: "text", name: "companyName3", label: "newHk.steps.applicant.fields.name3.label", colSpan: 2 },

  {
    type: "checkbox-group",
    name: "authorRelationship",
    label: "mcap.lt.auto.k064",
    required: true,
    options: APPLICANT_RELATION_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "authorRelationshipOther",
    label: "mcap.common.fields.otherRelationshipDetails",
    condition: (f) => Array.isArray(f.authorRelationship) && f.authorRelationship.includes("other"),
    required: true,
    colSpan: 2,
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
  // {
  //   type: "info",
  //   label: "mcap.lt.auto.k065",
  //   content:
  //     "Passport copy, proof of address (English), identity verification evidence, and completed incorporation application are required.",
  //   colSpan: 2,
  // },
  // {
  //   type: "checkbox",
  //   name: "requiredDocumentsConfirmed",
  //   label: "mcap.lt.auto.k066",
  //   required: true,
  //   colSpan: 2,
  // },
  {
    type: "radio-group",
    name: "identityVerificationMethod",
    label: "mcap.lt.auto.k067",
    required: true,
    options: [
      {
        label: "mcap.lt.auto.k068",
        value: "photo_with_passport",
      },
      {
        label: "mcap.lt.auto.k069",
        value: "office_visit",
      },
      {
        label: "mcap.lt.auto.k070",
        value: "ward_office_certificate",
      },
      {
        label: "mcap.lt.auto.k071",
        value: "passport_notarization",
      },
    ],
    colSpan: 2,
  },
];

const buildComplianceFields = (): McapField[] => [
  {
    type: "radio-group",
    name: "legalEthicsIssues",
    label:
      "mcap.lt.auto.k072",
    required: true,
    options: [
      { label: "mcap.common.options.yes", value: "yes" },
      { label: "mcap.common.options.no", value: "no" },
      { label: "mcap.common.options.doNotKnow", value: "unknown" },
      { label: "mcap.lt.auto.k073", value: "legal_advice" },
      { label: "mcap.common.options.other", value: "other" },
    ],
    colSpan: 2,
  },
  {
    type: "text",
    name: "legalEthicsIssuesOther",
    label: "mcap.lt.auto.k074",
    condition: (f) => f.legalEthicsIssues === "other",
    required: true,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "annualRenewalAgreement",
    label:
      "mcap.lt.auto.k075",
    required: true,
    options: [
      { label: "mcap.common.options.yes", value: "yes" },
      { label: "mcap.common.options.no", value: "no" },
      { label: "mcap.lt.auto.k076", value: "internal" },
      { label: "mcap.lt.auto.k077", value: "no_if_fixed_cost" },
      { label: "mcap.lt.auto.k078", value: "advice_required" },
    ],
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "sanctionedCountriesBusiness",
    label:
      "mcap.lt.auto.k079",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "sanctionedPersonsResidence",
    label:
      "mcap.lt.auto.k080",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "crimeaSevastopolBusiness",
    label: "mcap.lt.auto.k081",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "restrictedSectors",
    label: "mcap.lt.auto.k082",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
];

const buildCompanyFields = (): McapField[] => [
  {
    type: "info",
    label: "mcap.lt.auto.k083",
    content:
      "mcap.lt.auto.k084",
    colSpan: 2,
  },
  {
    type: "checkbox-group",
    name: "industrySelection",
    label: "mcap.lt.auto.k085",
    required: true,
    options: INDUSTRY_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "industrySelectionOther",
    label: "mcap.lt.auto.k086",
    condition: (f) => Array.isArray(f.industrySelection) && f.industrySelection.includes("other"),
    required: true,
    colSpan: 2,
  },
  {
    type: "text",
    name: "productServiceDescription",
    label: "mcap.lt.auto.k087",
    required: true,
    colSpan: 2,
  },
  {
    type: "textarea",
    name: "businessDescription",
    label: "mcap.lt.auto.k088",
    required: true,
    rows: 4,
    colSpan: 2,
  },
  {
    type: "text",
    name: "websiteAddress",
    label: "mcap.common.fields.websiteAddressOptional",
    placeholder: "mcap.lt.auto.k089",
    colSpan: 2,
  },
  {
    type: "checkbox-group",
    name: "purposeOfEstablishment",
    label: "mcap.lt.auto.k090",
    required: true,
    options: PURPOSE_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "purposeOfEstablishmentOther",
    label: "mcap.lt.auto.k091",
    condition: (f) =>
      Array.isArray(f.purposeOfEstablishment) && f.purposeOfEstablishment.includes("other"),
    required: true,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "totalCapitalEur",
    label: "mcap.lt.auto.k092",
    required: true,
    defaultValue: "2500",
    options: [
      { label: "mcap.lt.auto.k093", value: "2500" },
      { label: "mcap.lt.auto.k094", value: "125000" },
      { label: "mcap.lt.auto.k095", value: "350000" },
      { label: "mcap.lt.auto.k096", value: "other" },
    ],
    colSpan: 2,
  },
  {
    type: "number",
    name: "totalCapitalEurOther",
    label: "mcap.lt.auto.k097",
    condition: (f) => f.totalCapitalEur === "other",
    required: true,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "registeredAddressOption",
    label: "mcap.lt.auto.k098",
    required: true,
    options: [
      {
        label: "mcap.lt.auto.k099",
        value: "mirr_address",
      },
      {
        label: "mcap.lt.auto.k100",
        value: "client_address",
      },
    ],
    colSpan: 2,
  },
  {
    type: "textarea",
    name: "registeredAddressDetails",
    label: "mcap.lt.auto.k101",
    condition: (f) => f.registeredAddressOption === "client_address",
    required: true,
    rows: 3,
    colSpan: 2,
  },
  {
    type: "checkbox",
    name: "capitalRequirementAcknowledged",
    label:
      "mcap.lt.auto.k102",
    required: true,
    colSpan: 2,
  },
];

const buildAccountingFields = (): McapField[] => [
  {
    type: "radio-group",
    name: "bookKeepingCycle",
    label: "mcap.lt.auto.k103",
    options: [
      { label: "mcap.common.bookkeeping.monthly", value: "monthly" },
      { label: "mcap.common.bookkeeping.quarterly", value: "quarterly" },
      { label: "mcap.lt.auto.k104", value: "semi_annual" },
      { label: "mcap.lt.auto.k105", value: "annual" },
    ],
    colSpan: 2,
  },
  {
    type: "select",
    name: "expectedMonthlyInvoices",
    label: "mcap.lt.auto.k106",
    options: [
      { label: "mcap.lt.auto.k107", value: "up_to_50" },
      { label: "mcap.lt.auto.k108", value: "51_100" },
      { label: "mcap.lt.auto.k109", value: "101_200" },
      { label: "mcap.lt.auto.k110", value: "201_500" },
      { label: "mcap.lt.auto.k111", value: "500_plus" },
    ],
    colSpan: 2,
  },
  {
    type: "select",
    name: "expectedEmployees",
    label: "mcap.lt.auto.k112",
    options: [
      { label: "mcap.lt.auto.k113", value: "0_3" },
      { label: "mcap.lt.auto.k114", value: "4_5" },
      { label: "mcap.lt.auto.k115", value: "6_7" },
      { label: "mcap.lt.auto.k116", value: "7_plus" },
    ],
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "vatTaxSupportNeed",
    label: "mcap.lt.auto.k117",
    options: [
      { label: "mcap.common.options.yes", value: "yes" },
      { label: "mcap.common.options.no", value: "no" },
      { label: "mcap.lt.auto.k118", value: "advice" },
    ],
    colSpan: 2,
  },
  {
    type: "textarea",
    name: "accountingNotes",
    label: "mcap.lt.auto.k119",
    rows: 3,
    colSpan: 2,
  },
];

const buildServiceFields = (): McapField[] => [
  {
    type: "info",
    label: "mcap.lt.auto.k120",
    content:
      "mcap.lt.auto.k121",
    colSpan: 2,
  },
  {
    type: "select",
    name: "ltTrack",
    label: "mcap.lt.auto.k122",
    required: true,
    defaultValue: "standard_incorporation",
    options: [
      {
        label: "mcap.lt.auto.k123",
        value: "standard_incorporation",
      },
      {
        label: "mcap.lt.auto.k124",
        value: "vasp_standard",
      },
      {
        label: "mcap.lt.auto.k125",
        value: "vasp_full",
      },
      {
        label: "mcap.lt.auto.k126",
        value: "emi_license",
      },
    ],
    colSpan: 2,
  },
  {
    type: "select",
    name: "ltAmlOfficerPlan",
    label: "mcap.lt.auto.k127",
    defaultValue: "none",
    options: [
      { label: "mcap.lt.auto.k128", value: "none" },
      {
        label: "mcap.lt.auto.k129",
        value: "basic",
      },
      {
        label: "mcap.lt.auto.k130",
        value: "experienced",
      },
    ],
    condition: (f) => ["vasp_standard", "vasp_full"].includes(String(f.ltTrack || "")),
    colSpan: 2,
  },
  {
    type: "select",
    name: "ltAccountingPlan",
    label: "mcap.lt.auto.k131",
    defaultValue: "none",
    options: [
      { label: "mcap.lt.auto.k132", value: "none" },
      { label: "mcap.lt.auto.k133", value: "acc_50" },
      { label: "mcap.lt.auto.k134", value: "acc_100" },
      { label: "mcap.lt.auto.k135", value: "acc_200" },
      { label: "mcap.lt.auto.k136", value: "acc_500" },
      { label: "mcap.lt.auto.k137", value: "quote" },
    ],
    colSpan: 2,
  },
  {
    type: "select",
    name: "ltEmiOnboardingFee",
    label: "mcap.lt.auto.k138",
    defaultValue: "none",
    options: [
      { label: "mcap.lt.auto.k139", value: "none" },
      { label: "mcap.lt.auto.k140", value: "500" },
      { label: "mcap.lt.auto.k141", value: "1000" },
      { label: "mcap.lt.auto.k142", value: "1500" },
      { label: "mcap.lt.auto.k143", value: "2000" },
      { label: "mcap.lt.auto.k144", value: "custom" },
    ],
    colSpan: 2,
  },
  {
    type: "number",
    name: "ltEmiOnboardingFeeCustom",
    label: "mcap.lt.auto.k145",
    condition: (f) => String(f.ltEmiOnboardingFee || "") === "custom",
    required: true,
    colSpan: 2,
  },
  {
    type: "select",
    name: "ltOfficeRentPlan",
    label: "mcap.lt.auto.k146",
    defaultValue: "none",
    options: [
      { label: "mcap.lt.auto.k139", value: "none" },
      { label: "mcap.lt.auto.k147", value: "1800" },
      { label: "mcap.lt.auto.k148", value: "2400" },
      { label: "mcap.lt.auto.k149", value: "3000" },
      { label: "mcap.lt.auto.k144", value: "custom" },
    ],
    colSpan: 2,
  },
  {
    type: "number",
    name: "ltOfficeRentPlanCustom",
    label: "mcap.lt.auto.k150",
    condition: (f) => String(f.ltOfficeRentPlan || "") === "custom",
    required: true,
    colSpan: 2,
  },
  {
    type: "number",
    name: "ltKycKytExpectedProfiles",
    label: "mcap.lt.auto.k151",
    defaultValue: 0,
    colSpan: 2,
  },
  {
    type: "checkbox",
    name: "ltIncludeStatutoryInterest",
    label:
      "mcap.lt.auto.k152",
    condition: (f) => ["vasp_standard", "vasp_full"].includes(String(f.ltTrack || "")),
    colSpan: 2,
  },
  {
    type: "checkbox-group",
    name: "ltQuoteOnlyServiceRequests",
    label: "mcap.lt.auto.k153",
    options: QUOTE_ONLY_REQUEST_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "ltQuoteOnlyServiceRequestsOther",
    label: "mcap.lt.auto.k154",
    condition: (f) =>
      Array.isArray(f.ltQuoteOnlyServiceRequests) &&
      f.ltQuoteOnlyServiceRequests.includes("other"),
    required: true,
    colSpan: 2,
  },
  {
    type: "info",
    label: "mcap.lt.auto.k155",
    content:
      "mcap.lt.auto.k156",
    colSpan: 2,
  },
];

export const LT_FULL_CONFIG: McapConfig = {
  id: "lt-full",
  countryCode: "LT",
  countryName: "Lithuania",
  currency: "USD",
  title: "mcap.lt.auto.k157",
  confirmationDetails: {
    title: "mcap.lt.auto.k158",
    message:
      "mcap.lt.auto.k159",
    steps: [
      {
        title: "mcap.lt.auto.k160",
        description:
          "mcap.lt.auto.k161",
      },
      {
        title: "mcap.lt.auto.k162",
        description:
          "mcap.lt.auto.k163",
      },
      {
        title: "mcap.lt.auto.k164",
        description:
          "mcap.lt.auto.k165",
      },
      {
        title: "mcap.lt.auto.k166",
        description:
          "mcap.lt.auto.k167",
      },
    ],
  },
  steps: [
    {
      id: "applicant",
      title: "mcap.common.steps.applicant",
      description: "mcap.lt.auto.k168",
      fields: buildApplicantFields(),
    },
    {
      id: "compliance",
      title: "mcap.lt.auto.k169",
      description: "mcap.lt.auto.k170",
      fields: buildComplianceFields(),
    },
    {
      id: "company",
      title: "mcap.common.steps.company",
      description: "mcap.lt.auto.k171",
      fields: buildCompanyFields(),
    },
    {
      id: "parties",
      title: "mcap.common.steps.parties",
      description: "mcap.lt.auto.k172",
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
      title: "mcap.lt.auto.k173",
      description: "mcap.lt.auto.k174",
      widget: "ServiceSelectionWidget",
      fields: buildServiceFields(),
      serviceItems: (data) => buildLtServiceItems(data),
      supportedCurrencies: ["USD", "HKD"],
      computeFees: (data) => computeLtFees(data),
    },
    {
      id: "invoice",
      title: "mcap.common.steps.invoice",
      description: "mcap.lt.auto.k175",
      widget: "InvoiceWidget",
      computeFees: (data) => computeLtFees(data),
    },
    {
      id: "payment",
      title: "mcap.lt.auto.k176",
      description: "mcap.lt.auto.k177",
      widget: "PaymentWidget",
      supportedCurrencies: ["USD", "HKD"],
      computeFees: (data) => computeLtFees(data),
    },
    {
      id: "review",
      title: "mcap.lt.auto.k178",
      fields: [
        {
          type: "checkbox",
          name: "truthfulnessDeclaration",
          label: "mcap.lt.auto.k179",
          required: true,
          colSpan: 2,
        },
        {
          type: "checkbox",
          name: "compliancePreconditionAcknowledgment",
          label:
            "mcap.lt.auto.k180",
          required: true,
          colSpan: 2,
        },
        {
          type: "checkbox",
          name: "capitalNonBillableAcknowledgment",
          label:
            "mcap.lt.auto.k181",
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
