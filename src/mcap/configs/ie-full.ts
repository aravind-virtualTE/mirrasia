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
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
  { label: "I don't know", value: "unknown" },
];

const APPLICANT_RELATIONSHIP_OPTIONS = [
  { label: "Director of the Irish corporation (to be established)", value: "director" },
  { label: "Highest manager of the Irish corporation (to be established)", value: "executive_manager" },
  { label: "Person delegated by the director of the Irish corporation (to be established)", value: "delegate" },
  { label: "Major shareholder of the Irish corporation (to be established)", value: "major_shareholder" },
  {
    label: "Expert providing establishment advice on behalf of the director (lawyer, accountant, administrative agent, tax accountant, etc.)",
    value: "professional_advisor",
  },
  { label: "Other", value: "other" },
];

const INDUSTRY_OPTIONS = [
  { label: "Cryptocurrency-related (issuance/sale/donation/ICO/exchange/wallet service)", value: "crypto_related" },
  { label: "Development of IT, blockchain, software, etc.", value: "it_blockchain_software" },
  { label: "Cryptocurrency-based investment-related business", value: "crypto_investment" },
  { label: "Cryptocurrency-based games", value: "crypto_games" },
  { label: "General online games", value: "online_games" },
  { label: "Foreign exchange trading", value: "forex_trading" },
  { label: "Finance, investment, consulting, lending, etc.", value: "finance_investment_consulting" },
  { label: "Trade industry", value: "trade" },
  { label: "Wholesale/retail distribution", value: "wholesale_retail" },
  { label: "Consulting", value: "consulting" },
  { label: "Manufacturing", value: "manufacturing" },
  { label: "Online service industry (e-commerce)", value: "ecommerce" },
  { label: "Online direct purchase/delivery service/purchase agency", value: "online_purchase_delivery_agency" },
  { label: "Other", value: "other" },
];

const PURPOSE_OPTIONS = [
  { label: "Pursuing business diversification through relaxed regulations", value: "business_diversification" },
  { label: "A legal advisor, investor, or partner suggested establishing an Irish company", value: "advisor_partner_suggestion" },
  { label: "Expanding business into various European countries", value: "europe_expansion" },
  { label: "Asset management by investing in real estate or financial assets", value: "asset_management" },
  { label: "Holding company for managing subsidiaries or affiliates", value: "holding_company" },
  { label: "Pursuing competitive advantage through free financial policies", value: "financial_policy_advantage" },
  { label: "Increased trading volume due to low tax rates in Europe", value: "tax_rate_advantage" },
  { label: "Other", value: "other" },
];

const QUOTE_ONLY_OPTIONS = [
  {
    label: "Consulting services including regulatory review, feasibility review, document preparation, and operational consulting (separate quote)",
    value: "consulting_quote",
  },
  { label: "Other quote-only request", value: "other" },
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
      label: "Irish company formation + corporate address and secretary services for the first year",
      amount: IE_PRICING.incorporation_and_first_year_package,
      original: IE_PRICING.incorporation_and_first_year_package,
      mandatory: true,
      kind: "service",
      info:
        "Includes incorporation filing/government fees, incorporation documents, inaugural resolutions and minutes, first-year registered address, company secretary support, tax/VAT registration, and related package inclusions.",
    },
    {
      id: "ie_bank_account_opening",
      label: "Opening a bank account for an Irish corporation",
      amount: IE_PRICING.bank_account_opening,
      original: IE_PRICING.bank_account_opening,
      mandatory: false,
      kind: "service",
    },
    {
      id: "ie_bond_2y_eur_reference",
      label: "2-year bond to satisfy non-EEA director alternative requirement",
      amount: IE_PRICING.bond_2y_eur_reference,
      original: IE_PRICING.bond_2y_eur_reference,
      mandatory: false,
      kind: "other",
      info:
        "Reference quote is EUR 2,000 for a EUR 25,000 liability bond. Displayed in USD/HKD rails in this workflow.",
    },
    {
      id: "ie_local_director_registration_1y",
      label: "1 year of director registration to comply with local Irish regulations",
      amount: IE_PRICING.local_director_registration_1y,
      original: IE_PRICING.local_director_registration_1y,
      mandatory: false,
      kind: "service",
    },
    {
      id: "ie_additional_local_director_1y",
      label: "Additional appointment of a local Irish director for one year",
      amount: IE_PRICING.additional_local_director_1y,
      original: IE_PRICING.additional_local_director_1y,
      mandatory: false,
      kind: "service",
      info:
        "Can strengthen Irish tax residency posture, support remote account opening, and improve access to treaty benefits where applicable.",
    },
    {
      id: "ie_annual_company_renewal",
      label: "Annual company renewal package",
      amount: IE_PRICING.annual_company_renewal,
      original: IE_PRICING.annual_company_renewal,
      mandatory: false,
      kind: "service",
      info:
        "Includes annual return filing, secretary support, registered address/mail handling, and AGM documentation preparation.",
    },
  ];

  const quoteOnlyRequests = Array.isArray(data?.ieQuoteOnlyServiceRequests)
    ? data.ieQuoteOnlyServiceRequests.map((entry: any) => String(entry))
    : [];

  if (quoteOnlyRequests.includes("consulting_quote")) {
    items.push({
      id: "ie_quote_only_consulting",
      label: "Consulting services (quote-only request)",
      amount: 0,
      original: 0,
      mandatory: true,
      kind: "other",
    });
  }

  if (quoteOnlyRequests.includes("other")) {
    items.push({
      id: "ie_quote_only_other",
      label: "Other quote-only request",
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
      "Items quoted in EUR are represented in the unified USD/HKD payment rails for this workflow. Quote-only requests are tracked and excluded from billable totals.",
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
    label: "Relationship between the writer and the Irish corporation to be established",
    required: true,
    options: APPLICANT_RELATIONSHIP_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "writerRelationshipOther",
    label: "Other relationship details",
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
      "Does the purpose of establishing an Irish corporation raise legal or ethical issues (money laundering, gambling, tax evasion, asset concealment, evasion of legal proceedings, fraud)?",
    required: true,
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
      { label: "I don't know", value: "unknown" },
      { label: "Consider legal advice", value: "consider_legal_advice" },
      { label: "Other", value: "other" },
    ],
    colSpan: 2,
  },
  {
    type: "text",
    name: "legalEthicalIssuesOther",
    label: "Other legal/ethical issue details",
    condition: (f) => f.legalEthicalIssues === "other",
    required: true,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "annualRenewalConsent",
    label:
      "After establishing an Irish corporation, annual renewals and recurring documentation/cost obligations apply. Do you agree?",
    required: true,
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
      { label: "Can be resolved internally after establishment", value: "internal_after_establishment" },
      { label: "I will not proceed if fixed annual costs are incurred", value: "no_if_fixed_annual_cost" },
      { label: "Advice required before proceeding", value: "advice_required" },
    ],
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "sanctionedCountryBusiness",
    label:
      "Does the proposed Irish company, holding company, group, or related entity currently conduct or plan to conduct business in sanctioned countries or territories?",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "sanctionedResidenceExposure",
    label:
      "Are any involved persons residing in sanctioned countries/regions or jurisdictions sanctioned by UN/EU/UKHMT/HKMA/OFAC?",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "sanctionedOwnershipOrAgency",
    label:
      "Is the proposed Irish entity owned/controlled by, or acting for, sanctioned persons/entities/governments (including through ownership or control)?",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "crimeaSevastopolExposure",
    label: "Are any related entities currently conducting business in Crimea or Sevastopol, or planning to do so?",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "restrictedSectorExposure",
    label:
      "Is the group currently engaged in, or planning to engage in, oil, gas, energy, military, or defense sectors?",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
];

const buildCompanyFields = (): McapField[] => [
  {
    type: "info",
    label: "Ireland Establishment Requirements",
    content:
      "Minimum capital is EUR 0.01 and at least one share. At least one natural person must be a director, and at least one director should be EEA resident (or bond alternative). At least one secretary is required. A registered address in Ireland is mandatory.",
    colSpan: 2,
  },
  {
    type: "checkbox-group",
    name: "industrySelection",
    label: "Select industry (check all relevant items)",
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
    type: "textarea",
    name: "productServiceDescription",
    label: "Description of product name/type/service content/service type",
    required: true,
    rows: 3,
    colSpan: 2,
  },
  {
    type: "textarea",
    name: "businessSummary",
    label: "Describe the business in 3-4 sentences",
    required: true,
    rows: 4,
    colSpan: 2,
  },
  {
    type: "text",
    name: "websiteAddress",
    label: "Website address (if available)",
    placeholder: "https://",
    colSpan: 2,
  },
  {
    type: "checkbox-group",
    name: "purposeOfEstablishment",
    label: "Purpose of establishing an Irish corporation and expected future effects",
    required: true,
    options: PURPOSE_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "purposeOfEstablishmentOther",
    label: "Other purpose details",
    condition: (f) => Array.isArray(f.purposeOfEstablishment) && f.purposeOfEstablishment.includes("other"),
    required: true,
    colSpan: 2,
  },

  {
    type: "select",
    name: "totalShares",
    label: "Total shares",
    required: true,
    options: [
      { label: "1 share", value: "1" },
      { label: "100 shares", value: "100" },
      { label: "1,000 shares", value: "1000" },
      { label: "10,000 shares", value: "10000" },
      { label: "100,000 shares", value: "100000" },
      { label: "Other", value: "other" },
    ],
  },
  {
    type: "text",
    name: "totalSharesOther",
    label: "Total shares (other)",
    condition: (f) => f.totalShares === "other",
    required: true,
  },
  {
    type: "select",
    name: "paidInCapitalEur",
    label: "Total capital to be paid in (EUR)",
    required: true,
    options: [
      { label: "EUR 0.01", value: "0.01" },
      { label: "EUR 1", value: "1" },
      { label: "EUR 100", value: "100" },
      { label: "EUR 1,000", value: "1000" },
      { label: "EUR 10,000", value: "10000" },
      { label: "EUR 100,000", value: "100000" },
      { label: "Other", value: "other" },
    ],
  },
  {
    type: "text",
    name: "paidInCapitalEurOther",
    label: "Total capital to be paid in (EUR, other)",
    condition: (f) => f.paidInCapitalEur === "other",
    required: true,
  },
  {
    type: "derived",
    name: "parValuePerShareEur",
    label: "Par value per share (EUR)",
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
    label: "How will you satisfy the EEA-resident director or EUR 25,000 bond requirement?",
    required: true,
    options: [
      { label: "Already have at least one EEA-resident director", value: "already_has_eea_director" },
      { label: "Use local director registration service", value: "use_local_director_service" },
      { label: "Purchase 2-year bond (EUR 25,000 liability limit)", value: "purchase_bond" },
      { label: "Need advice before deciding", value: "need_advice" },
    ],
    colSpan: 2,
  },
  // {
  //   type: "radio-group",
  //   name: "naturalPersonDirectorConfirmation",
  //   label: "Will at least one natural person be appointed as a director?",
  //   required: true,
  //   options: [
  //     { label: "Yes", value: "yes" },
  //     { label: "No", value: "no" },
  //     { label: "Need advice before confirming", value: "need_advice" },
  //   ],
  //   colSpan: 2,
  // },
  // {
  //   type: "radio-group",
  //   name: "secretaryArrangement",
  //   label: "Secretary arrangement",
  //   required: true,
  //   options: [
  //     { label: "Director also serves as secretary", value: "director_also_secretary" },
  //     { label: "Separate person registered as secretary", value: "separate_secretary" },
  //   ],
  //   colSpan: 2,
  // },
  {
    type: "checkbox",
    name: "singleDirectorSecretaryAcknowledgment",
    label: "If there is only one director, I understand a separate person must be registered as secretary.",
    required: true,
    condition: (f) => f.directorCountStructure === "one_director",
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "registeredAddressChoice",
    label: "Registered address of the company in Ireland",
    required: true,
    options: [
      { label: "Use Mir Asia's Irish corporate registered address service", value: "use_mir_asia_address" },
      { label: "Use separate Ireland business address", value: "use_own_address" },
    ],
    colSpan: 2,
  },
  {
    type: "textarea",
    name: "registeredAddressOwnDetails",
    label: "Separate Ireland address details",
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
    type: "textarea",
    name: "accountingNotes",
    label: "Accounting and tax notes",
    rows: 3,
    colSpan: 2,
  },
];

const buildServiceFields = (): McapField[] => [
  {
    type: "info",
    label: "Ireland local director / bond rule",
    content:
      "Irish companies should maintain at least one EEA-resident director. If that is not met, a EUR 25,000 bond is commonly used as an alternative compliance route.",
    colSpan: 2,
  },
  {
    type: "checkbox-group",
    name: "ieQuoteOnlyServiceRequests",
    label: "Quote-only service requests (tracked, excluded from invoice totals)",
    options: QUOTE_ONLY_OPTIONS,
    colSpan: 2,
  },
  {
    type: "textarea",
    name: "ieQuoteOnlyServiceRequestsOther",
    label: "Other quote-only request details",
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
  title: "Ireland Company Incorporation",
  confirmationDetails: {
    title: "Ireland Incorporation Request Submitted",
    message:
      "We have received your Ireland incorporation request. Our team will review compliance, service scope, and filing readiness before proceeding.",
    steps: [
      {
        title: "Compliance and Scope Review",
        description:
          "KYC/CDD and sanctions screening checks are completed and service scope is confirmed.",
      },
      {
        title: "Registration Preparation",
        description:
          "Company structure, registration details, and director/secretary requirements are validated.",
      },
      {
        title: "Filing and Setup Execution",
        description:
          "Incorporation and selected post-incorporation services are executed based on final approval.",
      },
    ],
  },
  steps: [
    {
      id: "applicant",
      title: "Applicant Information",
      description: "Writer details and relationship to the Irish company being established.",
      fields: buildApplicantFields(),
    },
    {
      id: "compliance",
      title: "AML / CDD",
      description: "Business intent, sanctions checks, and annual renewal consent.",
      fields: buildComplianceFields(),
    },
    {
      id: "company",
      title: "Company Information",
      description: "Business profile, registration details, and Irish establishment requirements.",
      fields: buildCompanyFields(),
    },
    {
      id: "parties",
      title: "Parties and Invites",
      description: "Invite parties and ensure required role/residency coverage.",
      widget: "PartiesManager",
      minParties: 1,
      requireDcp: true,
      requirePartyInvite: true,
      partyFields: [
        {
          key: "ieIsDirector",
          label: "Director appointment",
          type: "select",
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
          storage: "details",
        },
        {
          key: "ieIsSecretary",
          label: "Secretary appointment",
          type: "select",
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
          storage: "details",
        },
      ],
      partyCoverageRules: [
        {
          key: "ieIsDirector",
          storage: "details",
          requiredValues: ["yes"],
          label: "Director coverage",
          valueLabels: {
            yes: "At least one director",
          },
        },
        {
          key: "ieIsSecretary",
          storage: "details",
          requiredValues: ["yes"],
          label: "Secretary coverage",
          valueLabels: {
            yes: "At least one secretary",
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
      title: "Service Selection",
      description: "Select billable service lines and optional quote-only requests.",
      widget: "ServiceSelectionWidget",
      fields: buildServiceFields(),
      serviceItems: (data) => buildIeServiceItems(data),
      supportedCurrencies: ["USD", "HKD"],
      computeFees: (data) => computeIeFees(data),
    },
    {
      id: "invoice",
      title: "Invoice Preview",
      description: "Review fees before payment.",
      widget: "InvoiceWidget",
      computeFees: (data) => computeIeFees(data),
    },
    {
      id: "payment",
      title: "Payment Processing",
      description: "Proceed with card payment or bank transfer proof upload.",
      widget: "PaymentWidget",
      supportedCurrencies: ["USD", "HKD"],
      computeFees: (data) => computeIeFees(data),
    },
    {
      id: "review",
      title: "Review and Declaration",
      fields: [
        {
          type: "info",
          label: "Consent and Declaration",
          content:
            "I agree to provide required documents and information, confirm lawful business intent, and declare all submitted information is true, complete, and accurate.",
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "applicationAgreement",
          label: "Do you agree?",
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
          label: "I understand service may be suspended if unlawful activity or intent is identified.",
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
