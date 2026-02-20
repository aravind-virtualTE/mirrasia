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
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
  { label: "Do not know", value: "unknown" },
];

const APPLICANT_RELATION_OPTIONS = [
  { label: "Director of the Lithuanian company to be established", value: "director" },
  {
    label: "Chief executive of the Lithuanian legal entity to be established",
    value: "ceo",
  },
  {
    label: "Authorized person delegated by a director",
    value: "authorized_proxy",
  },
  { label: "Major shareholder", value: "major_shareholder" },
  {
    label: "Professional advisor (lawyer, accountant, tax advisor, etc.)",
    value: "professional_advisor",
  },
  { label: "Other", value: "other" },
];

const INDUSTRY_OPTIONS = [
  { label: "Cryptocurrency related", value: "crypto_related" },
  { label: "IT / blockchain / software development", value: "it_blockchain_software" },
  { label: "Cryptocurrency investment", value: "crypto_investment" },
  { label: "Cryptocurrency games", value: "crypto_games" },
  { label: "Foreign exchange trading", value: "forex_trading" },
  { label: "Finance / investment / consulting", value: "finance_investment_consulting" },
  { label: "Trade", value: "trade" },
  { label: "Wholesale / retail", value: "wholesale_retail" },
  { label: "Consulting", value: "consulting" },
  { label: "Manufacturing", value: "manufacturing" },
  { label: "Online services (e-commerce)", value: "ecommerce" },
  { label: "Online direct purchase / delivery / agency", value: "online_direct_purchase" },
  { label: "Other", value: "other" },
];

const PURPOSE_OPTIONS = [
  { label: "Business diversification", value: "business_diversification" },
  { label: "Advisor / investor / partner recommendation", value: "advisor_partner_suggestion" },
  { label: "International expansion", value: "international_expansion" },
  { label: "Asset management", value: "asset_management" },
  { label: "Holding company strategy", value: "holding_company" },
  { label: "Competitive advantage through financial policy", value: "financial_policy_advantage" },
  { label: "Transaction growth due to tax efficiency", value: "tax_efficiency" },
  { label: "Other", value: "other" },
];

const QUOTE_ONLY_REQUEST_OPTIONS = [
  { label: "Legal opinion in Lithuania", value: "legal_opinion_lithuania" },
  { label: "Legal opinion for domestic exchange listing", value: "legal_opinion_domestic_listing" },
  { label: "Legal opinion for another country", value: "legal_opinion_other_country" },
  { label: "Business and regulatory consulting", value: "business_consulting" },
  { label: "EMI Level 10 operational support (separate quote)", value: "emi_level_10_ops" },
  { label: "Other quote-only request", value: "other" },
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
        label: "Lithuania incorporation service",
        amount: LT_PRICING.standard_incorporation,
        original: LT_PRICING.standard_incorporation,
        mandatory: true,
        kind: "service",
      },
      {
        id: "lt_standard_notary_fee",
        label: "Notary fee",
        amount: LT_PRICING.standard_notary_fee,
        original: LT_PRICING.standard_notary_fee,
        mandatory: true,
        kind: "government",
      },
      {
        id: "lt_standard_registration_fee",
        label: "Registration of establishment",
        amount: LT_PRICING.standard_registration_fee,
        original: LT_PRICING.standard_registration_fee,
        mandatory: true,
        kind: "government",
      },
      {
        id: "lt_standard_corporate_address_1y",
        label: "1 year corporate address service",
        amount: LT_PRICING.standard_corporate_address_1y,
        original: LT_PRICING.standard_corporate_address_1y,
        mandatory: true,
        kind: "service",
      },
      {
        id: "lt_standard_bank_opening",
        label: "Bank account opening support",
        amount: LT_PRICING.standard_bank_opening,
        original: LT_PRICING.standard_bank_opening,
        mandatory: true,
        kind: "service",
        info: "Reference price set to EUR 400 for now and can be adjusted later.",
      }
    );
  }

  if (track === "vasp_standard") {
    items.push({
      id: "lt_vasp_standard_quote_only",
      label: "READY-MADE VASP Standard package (documents/license proof only)",
      amount: 0,
      original: 0,
      mandatory: true,
      kind: "service",
      info:
        "Standard package pricing is quote-based. Full infrastructure components are not included in this variant.",
    });
  }

  if (track === "vasp_full") {
    items.push({
      id: "lt_vasp_full",
      label: "READY-MADE VASP Full package",
      amount: LT_PRICING.vasp_full_package,
      original: LT_PRICING.vasp_full_package,
      mandatory: true,
      kind: "service",
      info:
        "Includes transfer procedure, VASP infrastructure setup, registered address/local contact, AML integration support, and related package scope.",
    });
  }

  if (track === "emi_license") {
    items.push(
      {
        id: "lt_emi_license_level_1_9",
        label: "Lithuania EMI license project (Level 1-9)",
        amount: LT_PRICING.emi_license_level_1_9,
        original: LT_PRICING.emi_license_level_1_9,
        mandatory: true,
        kind: "service",
      },
      {
        id: "lt_emi_license_government_fee",
        label: "Lithuania Central Bank government fee",
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
      label: "AML officer (annual, basic)",
      amount: LT_PRICING.aml_officer_basic_annual,
      original: LT_PRICING.aml_officer_basic_annual,
      mandatory: true,
      kind: "service",
      info: "Reference annualized amount from EUR 1,000/month (minimum contract period applies).",
    });
  } else if (amlPlan === "experienced") {
    items.push({
      id: "lt_aml_officer_experienced_annual",
      label: "AML officer (annual, experienced)",
      amount: LT_PRICING.aml_officer_experienced_annual,
      original: LT_PRICING.aml_officer_experienced_annual,
      mandatory: true,
      kind: "service",
      info: "Reference annualized amount from EUR 2,000/month (minimum contract period applies).",
    });
  }

  const accountingPlan = String(data?.ltAccountingPlan || "none");
  if (accountingPlan === "acc_50") {
    items.push({
      id: "lt_accounting_annual_50",
      label: "Accounting package (up to 50 invoices/month, annualized)",
      amount: LT_PRICING.accounting_annual_50,
      original: LT_PRICING.accounting_annual_50,
      mandatory: true,
      kind: "service",
    });
  } else if (accountingPlan === "acc_100") {
    items.push({
      id: "lt_accounting_annual_100",
      label: "Accounting package (up to 100 invoices/month, annualized)",
      amount: LT_PRICING.accounting_annual_100,
      original: LT_PRICING.accounting_annual_100,
      mandatory: true,
      kind: "service",
    });
  } else if (accountingPlan === "acc_200") {
    items.push({
      id: "lt_accounting_annual_200",
      label: "Accounting package (up to 200 invoices/month, annualized)",
      amount: LT_PRICING.accounting_annual_200,
      original: LT_PRICING.accounting_annual_200,
      mandatory: true,
      kind: "service",
    });
  } else if (accountingPlan === "acc_500") {
    items.push({
      id: "lt_accounting_annual_500",
      label: "Accounting package (up to 500 invoices/month, annualized)",
      amount: LT_PRICING.accounting_annual_500,
      original: LT_PRICING.accounting_annual_500,
      mandatory: true,
      kind: "service",
    });
  } else if (accountingPlan === "quote") {
    items.push({
      id: "lt_accounting_quote",
      label: "Accounting package (higher volume / custom quote)",
      amount: 0,
      original: 0,
      mandatory: true,
      kind: "other",
      info: "Pricing for this accounting tier is quote-based.",
    });
  }

  const emiOnboardingAmount = getAmountFromSelect(
    data?.ltEmiOnboardingFee,
    data?.ltEmiOnboardingFeeCustom
  );
  if (emiOnboardingAmount > 0) {
    items.push({
      id: "lt_emi_onboarding",
      label: "EMI virtual account onboarding fee (third-party estimate)",
      amount: emiOnboardingAmount,
      original: emiOnboardingAmount,
      mandatory: true,
      kind: "other",
      info: "Typical range is EUR 500 to EUR 2,000 depending on provider onboarding outcome.",
    });
  }

  const officeRentAmount = getAmountFromSelect(data?.ltOfficeRentPlan, data?.ltOfficeRentPlanCustom);
  if (officeRentAmount > 0) {
    items.push({
      id: "lt_office_rent_utilities",
      label: "Local office rent and utilities (annual estimate)",
      amount: officeRentAmount,
      original: officeRentAmount,
      mandatory: true,
      kind: "other",
      info: "Reference estimate based on EUR 150 to EUR 250 per month.",
    });
  }

  const kycProfiles = Math.max(0, Number(data?.ltKycKytExpectedProfiles || 0));
  if (Number.isFinite(kycProfiles) && kycProfiles > 0) {
    const kycFee = Number((kycProfiles * 2).toFixed(2));
    items.push({
      id: "lt_kyc_kyt_usage",
      label: "KYC/KYT usage fee estimate",
      amount: kycFee,
      original: kycFee,
      mandatory: true,
      kind: "other",
      info: "Computed at EUR 2 per person based on expected KYC/KYT volume.",
    });
  }

  if (isVaspTrack(track) && Boolean(data?.ltIncludeStatutoryInterest)) {
    items.push({
      id: "lt_statutory_interest_unpaid_capital",
      label: "Statutory interest (if full capital is not paid)",
      amount: LT_PRICING.statutory_interest_if_capital_unpaid,
      original: LT_PRICING.statutory_interest_if_capital_unpaid,
      mandatory: true,
      kind: "other",
      info:
        "Applies when full statutory capital is not paid. This is reflected as company revenue and may be used for expenditure.",
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
      label: "Other quote-only request",
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
      "EUR quote references are modeled in the unified USD/HKD payment rails. Capital requirements are captured for compliance and excluded from billable totals.",
  };
};

const buildApplicantFields = (): McapField[] => [
  {
    type: "info",
    label: "Applicant Notice",
    content:
      "Please complete this form as the applicant, director, or an authorized representative. Keep all details aligned with identification documents.",
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
    label: "Relationship to the Lithuanian entity",
    required: true,
    options: APPLICANT_RELATION_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "authorRelationshipOther",
    label: "Other relationship details",
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
  //   label: "Required Documents",
  //   content:
  //     "Passport copy, proof of address (English), identity verification evidence, and completed incorporation application are required.",
  //   colSpan: 2,
  // },
  // {
  //   type: "checkbox",
  //   name: "requiredDocumentsConfirmed",
  //   label: "I confirm I can provide all required documents.",
  //   required: true,
  //   colSpan: 2,
  // },
  {
    type: "radio-group",
    name: "identityVerificationMethod",
    label: "Preferred self-authentication method",
    required: true,
    options: [
      {
        label: "Photo where passport and face are visible together",
        value: "photo_with_passport",
      },
      {
        label: "In-person visit to Mirr Asia office (Hong Kong or Seocho-gu, Seoul)",
        value: "office_visit",
      },
      {
        label: "Ward-office certified passport copy submission",
        value: "ward_office_certificate",
      },
      {
        label: "Passport notarization at nearby notary office",
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
      "Does the purpose of establishment raise legal or ethical concerns (money laundering, gambling, tax evasion, concealment, fraud)?",
    required: true,
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
      { label: "Do not know", value: "unknown" },
      { label: "Need legal advice", value: "legal_advice" },
      { label: "Other", value: "other" },
    ],
    colSpan: 2,
  },
  {
    type: "text",
    name: "legalEthicsIssuesOther",
    label: "Other legal/ethical issue details",
    condition: (f) => f.legalEthicsIssues === "other",
    required: true,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "annualRenewalAgreement",
    label:
      "After establishment, annual renewals and recurring compliance costs apply. Do you agree?",
    required: true,
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
      { label: "Can be handled internally", value: "internal" },
      { label: "Will not proceed if fixed annual costs apply", value: "no_if_fixed_cost" },
      { label: "Need advisory before decision", value: "advice_required" },
    ],
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "sanctionedCountriesBusiness",
    label:
      "Do you currently conduct or plan to conduct business in sanctioned countries/regions?",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "sanctionedPersonsResidence",
    label:
      "Do any relevant persons reside in sanctioned jurisdictions (UN/EU/UK/HKMA/OFAC scope)?",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "crimeaSevastopolBusiness",
    label: "Any current/planned business activity in Crimea or Sevastopol?",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "restrictedSectors",
    label: "Any current/planned activity in oil, gas, energy, military, or defense sectors?",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
];

const buildCompanyFields = (): McapField[] => [
  {
    type: "info",
    label: "Lithuania Establishment Requirements",
    content:
      "Minimum capital is EUR 2,500 for standard incorporation, with at least one shareholder/director/manager listed. Bank account opening lead time is typically 3 to 5 weeks after onboarding.",
    colSpan: 2,
  },
  {
    type: "checkbox-group",
    name: "industrySelection",
    label: "Industry selection",
    required: true,
    options: INDUSTRY_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "industrySelectionOther",
    label: "Other industry details",
    condition: (f) => Array.isArray(f.industrySelection) && f.industrySelection.includes("other"),
    required: true,
    colSpan: 2,
  },
  {
    type: "text",
    name: "productServiceDescription",
    label: "Product/service description",
    required: true,
    colSpan: 2,
  },
  {
    type: "textarea",
    name: "businessDescription",
    label: "Business summary (3 to 4 sentences)",
    required: true,
    rows: 4,
    colSpan: 2,
  },
  {
    type: "text",
    name: "websiteAddress",
    label: "Website address",
    placeholder: "https://",
    colSpan: 2,
  },
  {
    type: "checkbox-group",
    name: "purposeOfEstablishment",
    label: "Purpose of establishment and expected effect",
    required: true,
    options: PURPOSE_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "purposeOfEstablishmentOther",
    label: "Other purpose details",
    condition: (f) =>
      Array.isArray(f.purposeOfEstablishment) && f.purposeOfEstablishment.includes("other"),
    required: true,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "totalCapitalEur",
    label: "Total capital to be paid in (EUR)",
    required: true,
    defaultValue: "2500",
    options: [
      { label: "EUR 2,500 (standard minimum)", value: "2500" },
      { label: "EUR 125,000 (READY-MADE VASP context)", value: "125000" },
      { label: "EUR 350,000 (EMI license context)", value: "350000" },
      { label: "Other amount", value: "other" },
    ],
    colSpan: 2,
  },
  {
    type: "number",
    name: "totalCapitalEurOther",
    label: "Other capital amount (EUR)",
    condition: (f) => f.totalCapitalEur === "other",
    required: true,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "registeredAddressOption",
    label: "Registered address in Lithuania",
    required: true,
    options: [
      {
        label: "Use Mirr Asia corporate address service",
        value: "mirr_address",
      },
      {
        label: "Use client-provided Lithuanian business address",
        value: "client_address",
      },
    ],
    colSpan: 2,
  },
  {
    type: "textarea",
    name: "registeredAddressDetails",
    label: "Client-provided address details",
    condition: (f) => f.registeredAddressOption === "client_address",
    required: true,
    rows: 3,
    colSpan: 2,
  },
  {
    type: "checkbox",
    name: "capitalRequirementAcknowledged",
    label:
      "I understand capital requirements must be paid to the capital account before establishment and are excluded from invoice totals.",
    required: true,
    colSpan: 2,
  },
];

const buildAccountingFields = (): McapField[] => [
  {
    type: "radio-group",
    name: "bookKeepingCycle",
    label: "Preferred bookkeeping cycle",
    options: [
      { label: "Monthly", value: "monthly" },
      { label: "Quarterly", value: "quarterly" },
      { label: "Semi-annual", value: "semi_annual" },
      { label: "Annual", value: "annual" },
    ],
    colSpan: 2,
  },
  {
    type: "select",
    name: "expectedMonthlyInvoices",
    label: "Expected monthly invoices",
    options: [
      { label: "Up to 50", value: "up_to_50" },
      { label: "51 to 100", value: "51_100" },
      { label: "101 to 200", value: "101_200" },
      { label: "201 to 500", value: "201_500" },
      { label: "More than 500", value: "500_plus" },
    ],
    colSpan: 2,
  },
  {
    type: "select",
    name: "expectedEmployees",
    label: "Expected number of employees",
    options: [
      { label: "0 to 3", value: "0_3" },
      { label: "4 to 5", value: "4_5" },
      { label: "6 to 7", value: "6_7" },
      { label: "More than 7", value: "7_plus" },
    ],
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "vatTaxSupportNeed",
    label: "Do you need VAT and tax filing support?",
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
      { label: "Need advisory first", value: "advice" },
    ],
    colSpan: 2,
  },
  {
    type: "textarea",
    name: "accountingNotes",
    label: "Accounting and reporting notes",
    rows: 3,
    colSpan: 2,
  },
];

const buildServiceFields = (): McapField[] => [
  {
    type: "info",
    label: "Service and Pricing Setup",
    content:
      "Select the Lithuania route first, then configure maintenance and third-party estimates. Third-party estimates can be displayed in invoice for planning visibility.",
    colSpan: 2,
  },
  {
    type: "select",
    name: "ltTrack",
    label: "Lithuania service route",
    required: true,
    defaultValue: "standard_incorporation",
    options: [
      {
        label: "Lithuania Incorporation Guide package (EUR 2,200 reference)",
        value: "standard_incorporation",
      },
      {
        label: "READY-MADE VASP - Standard package (quote-based)",
        value: "vasp_standard",
      },
      {
        label: "READY-MADE VASP - Full package (EUR 25,000)",
        value: "vasp_full",
      },
      {
        label: "EMI license project (Level 1-9, EUR 60,000 + government fee)",
        value: "emi_license",
      },
    ],
    colSpan: 2,
  },
  {
    type: "select",
    name: "ltAmlOfficerPlan",
    label: "AML officer plan",
    defaultValue: "none",
    options: [
      { label: "No AML officer plan selected", value: "none" },
      {
        label: "Basic AML officer annualized plan (EUR 12,000)",
        value: "basic",
      },
      {
        label: "Experienced AML officer annualized plan (EUR 24,000)",
        value: "experienced",
      },
    ],
    condition: (f) => ["vasp_standard", "vasp_full"].includes(String(f.ltTrack || "")),
    colSpan: 2,
  },
  {
    type: "select",
    name: "ltAccountingPlan",
    label: "Accounting package",
    defaultValue: "none",
    options: [
      { label: "No accounting package selected", value: "none" },
      { label: "Up to 50 invoices/month (annualized EUR 4,800)", value: "acc_50" },
      { label: "Up to 100 invoices/month (annualized EUR 6,120)", value: "acc_100" },
      { label: "Up to 200 invoices/month (annualized EUR 9,240)", value: "acc_200" },
      { label: "Up to 500 invoices/month (annualized EUR 13,560)", value: "acc_500" },
      { label: "More than 500 invoices / custom (quote)", value: "quote" },
    ],
    colSpan: 2,
  },
  {
    type: "select",
    name: "ltEmiOnboardingFee",
    label: "EMI virtual account onboarding fee estimate",
    defaultValue: "none",
    options: [
      { label: "Do not include", value: "none" },
      { label: "EUR 500", value: "500" },
      { label: "EUR 1,000", value: "1000" },
      { label: "EUR 1,500", value: "1500" },
      { label: "EUR 2,000", value: "2000" },
      { label: "Custom amount", value: "custom" },
    ],
    colSpan: 2,
  },
  {
    type: "number",
    name: "ltEmiOnboardingFeeCustom",
    label: "Custom EMI onboarding estimate (EUR)",
    condition: (f) => String(f.ltEmiOnboardingFee || "") === "custom",
    required: true,
    colSpan: 2,
  },
  {
    type: "select",
    name: "ltOfficeRentPlan",
    label: "Local office rent + utility estimate (annual)",
    defaultValue: "none",
    options: [
      { label: "Do not include", value: "none" },
      { label: "EUR 1,800", value: "1800" },
      { label: "EUR 2,400", value: "2400" },
      { label: "EUR 3,000", value: "3000" },
      { label: "Custom amount", value: "custom" },
    ],
    colSpan: 2,
  },
  {
    type: "number",
    name: "ltOfficeRentPlanCustom",
    label: "Custom office rent + utility estimate (EUR)",
    condition: (f) => String(f.ltOfficeRentPlan || "") === "custom",
    required: true,
    colSpan: 2,
  },
  {
    type: "number",
    name: "ltKycKytExpectedProfiles",
    label: "Expected number of KYC/KYT checks (EUR 2 per person)",
    defaultValue: 0,
    colSpan: 2,
  },
  {
    type: "checkbox",
    name: "ltIncludeStatutoryInterest",
    label:
      "Include statutory interest line (EUR 4,900) if full VASP capital is not paid",
    condition: (f) => ["vasp_standard", "vasp_full"].includes(String(f.ltTrack || "")),
    colSpan: 2,
  },
  {
    type: "checkbox-group",
    name: "ltQuoteOnlyServiceRequests",
    label: "Quote-only service requests",
    options: QUOTE_ONLY_REQUEST_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "ltQuoteOnlyServiceRequestsOther",
    label: "Other quote-only request details",
    condition: (f) =>
      Array.isArray(f.ltQuoteOnlyServiceRequests) &&
      f.ltQuoteOnlyServiceRequests.includes("other"),
    required: true,
    colSpan: 2,
  },
  {
    type: "info",
    label: "Capital Reminder",
    content:
      "Capital requirements (EUR 2,500 / EUR 125,000 / EUR 350,000 based on route) are compliance prerequisites and are not added to invoice totals.",
    colSpan: 2,
  },
];

export const LT_FULL_CONFIG: McapConfig = {
  id: "lt-full",
  countryCode: "LT",
  countryName: "Lithuania",
  currency: "USD",
  title: "Lithuania Incorporation and Licensing",
  confirmationDetails: {
    title: "Lithuania Application Submitted",
    message:
      "Your Lithuania request has been received. Our team will complete scope confirmation, compliance review, and filing coordination based on the selected route.",
    steps: [
      {
        title: "Preparation and KYC",
        description:
          "Document readiness, KYC/CDD checks, and package confirmation are completed first.",
      },
      {
        title: "Route Execution",
        description:
          "Standard incorporation typically takes around 2 to 3 weeks after required documents are ready.",
      },
      {
        title: "Banking / Operations",
        description:
          "Bank account onboarding timelines vary by industry; planning range is typically 3 to 5 weeks.",
      },
      {
        title: "License-specific Follow-up",
        description:
          "READY-MADE VASP and EMI routes include additional operational and regulatory follow-up phases.",
      },
    ],
  },
  steps: [
    {
      id: "applicant",
      title: "Applicant Information",
      description: "Author details and onboarding readiness.",
      fields: buildApplicantFields(),
    },
    {
      id: "compliance",
      title: "AML / CDD",
      description: "Business intent, sanctions checks, and compliance declarations.",
      fields: buildComplianceFields(),
    },
    {
      id: "company",
      title: "Company Information",
      description: "Business profile, registration details, and capital declarations.",
      fields: buildCompanyFields(),
    },
    {
      id: "parties",
      title: "Parties and Invites",
      description: "Invite parties and assign designated contact person coverage.",
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
      description: "Select route, maintenance scope, and third-party estimate lines.",
      widget: "ServiceSelectionWidget",
      fields: buildServiceFields(),
      serviceItems: (data) => buildLtServiceItems(data),
    },
    {
      id: "invoice",
      title: "Invoice Preview",
      description: "Review billable and estimate line items before payment.",
      widget: "InvoiceWidget",
      computeFees: (data) => computeLtFees(data),
    },
    {
      id: "payment",
      title: "Payment Processing",
      description: "Proceed with card or bank transfer payment workflow.",
      widget: "PaymentWidget",
      supportedCurrencies: ["USD", "HKD"],
      computeFees: (data) => computeLtFees(data),
    },
    {
      id: "review",
      title: "Review and Declaration",
      fields: [
        {
          type: "checkbox",
          name: "truthfulnessDeclaration",
          label: "I confirm all submitted information is true and accurate.",
          required: true,
          colSpan: 2,
        },
        {
          type: "checkbox",
          name: "compliancePreconditionAcknowledgment",
          label:
            "I understand services may be paused or declined if legal/compliance concerns are identified.",
          required: true,
          colSpan: 2,
        },
        {
          type: "checkbox",
          name: "capitalNonBillableAcknowledgment",
          label:
            "I understand statutory capital is a non-billable establishment prerequisite and not part of invoice totals.",
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
