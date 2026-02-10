/* eslint-disable @typescript-eslint/no-explicit-any */
import type { McapConfig, McapFeeItem } from "./types";

type UkEntityMode = "individual" | "subsidiary" | "branch";

const YES_NO_DONT_KNOW = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
  { label: "Do not know", value: "unknown" },
];

const APPLICANT_RELATIONSHIP_OPTIONS = [
  { label: "newHk.steps.applicant.fields.roles.options.Director", value: "Director" },
  { label: "newHk.steps.applicant.fields.roles.options.Shareholder", value: "Shareholder" },
  { label: "newHk.steps.applicant.fields.roles.options.Authorized", value: "Authorized" },
  { label: "newHk.steps.applicant.fields.roles.options.Professional", value: "Professional" },
  { label: "newHk.steps.applicant.fields.roles.options.Other", value: "Other" },
]

const BUSINESS_TYPE_OPTIONS = [
  { label: "Virtual assets related (token issuance/sale/ICO/exchange/wallet)", value: "virtual_asset" },
  { label: "NFT related", value: "nft_related" },
  { label: "Software development related to virtual assets", value: "va_software_dev" },
  { label: "Software development unrelated to virtual assets", value: "software_dev" },
  { label: "Virtual asset based investment business", value: "va_investment" },
  { label: "Virtual asset based P2E game", value: "va_p2e_game" },
  { label: "Virtual asset based speculative game", value: "va_speculative_game" },
  { label: "Virtual asset based game unrelated to P2E/speculation", value: "va_other_game" },
  { label: "Metaverse platform development", value: "metaverse_platform" },
  { label: "Foreign exchange trading", value: "fx_trading" },
  { label: "Finance/investment/consulting/lending", value: "finance_investment" },
  { label: "Trading business", value: "trading" },
  { label: "Wholesale/retail distribution business", value: "distribution" },
  { label: "Consulting", value: "consulting" },
  { label: "Manufacturing", value: "manufacturing" },
  { label: "Online service business (e-commerce)", value: "ecommerce" },
  { label: "Online direct purchase/shipping proxy/purchase agency", value: "purchase_proxy" },
  { label: "Other", value: "other" },
];

const ESTABLISHMENT_PURPOSE_OPTIONS = [
  { label: "Expansion into Commonwealth or European regions", value: "commonwealth_europe_expansion" },
  { label: "Business diversification due to relaxed regulations", value: "regulatory_diversification" },
  { label: "Suggested by legal advisors/investors/clients", value: "advisor_or_client_suggested" },
  { label: "Expansion into multiple overseas countries", value: "international_expansion" },
  { label: "Asset management through real estate or financial investment", value: "asset_management" },
  { label: "Holding company management of subsidiaries/affiliates", value: "holding_management" },
  { label: "Competitive advantage due to financial policies", value: "policy_competitiveness" },
  { label: "Other", value: "other" },
];

const QUOTE_ONLY_SERVICE_OPTIONS = [
  { label: "EMI account opening application advisory", value: "emi_account_opening_advisory" },
  { label: "UK local legal opinion (quote after whitepaper review)", value: "uk_legal_opinion" },
  { label: "Legal opinion for domestic exchange listing", value: "domestic_exchange_legal_opinion" },
  { label: "Legal opinion for other countries", value: "cross_border_legal_opinion" },
  { label: "Regulatory and operational consulting services", value: "regulatory_consulting" },
  { label: "VAT quarterly/annual reporting quote", value: "vat_reporting_quote" },
  { label: "Annual accounting bookkeeping quote", value: "bookkeeping_quote" },
  { label: "Financial statements and corporate tax return quote", value: "fs_and_tax_quote" },
  { label: "Other", value: "other" },
];

const UK_ENTITY_PRICING: Record<UkEntityMode, { incorporation: number; kyc: number; registeredOffice: number }> = {
  individual: {
    incorporation: 1000,
    kyc: 100,
    registeredOffice: 600,
  },
  subsidiary: {
    incorporation: 1000,
    kyc: 250,
    registeredOffice: 600,
  },
  // Reserved for future dedicated branch pricing update.
  // For now this follows the individual package as requested.
  branch: {
    incorporation: 1000,
    kyc: 100,
    registeredOffice: 600,
  },
};

const UK_OPTIONAL_FIXED_SERVICES = [
  {
    id: "uk_emi_list_provision",
    label: "EMI list provision for service users",
    amount: 0,
    mandatory: false,
    info: "Provided free for clients using our incorporation service.",
  },
  {
    id: "uk_bank_account_advisory",
    label: "Bank account opening advisory",
    amount: 2400,
    mandatory: false,
    info: "Application support and advisory service.",
  },
  {
    id: "uk_vat_registration",
    label: "VAT registration",
    amount: 650,
    mandatory: false,
    info: "VAT registration support. UK VAT registration is generally required once annual taxable turnover reaches GBP 90,000.",
  },
];

const toNonNegativeInt = (value: any) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.floor(num);
};

const getSelectedEntityMode = (data: any): UkEntityMode => {
  const selected = String(data?.selectedEntity || "individual").toLowerCase();
  if (selected === "subsidiary") return "subsidiary";
  if (selected === "branch") return "branch";
  return "individual";
};

const getSelectedServiceIds = (data: any) => {
  const ids = new Set<string>();
  const optionalFeeIds = Array.isArray(data?.optionalFeeIds) ? data.optionalFeeIds : [];
  const serviceItemsSelected = Array.isArray(data?.serviceItemsSelected) ? data.serviceItemsSelected : [];
  optionalFeeIds.forEach((id: any) => ids.add(String(id)));
  serviceItemsSelected.forEach((id: any) => ids.add(String(id)));
  return ids;
};

const buildUkServiceItems = (data: any) => {
  const mode = getSelectedEntityMode(data);
  const pricing = UK_ENTITY_PRICING[mode];

  const additionalExecutivePairs = toNonNegativeInt(data?.ukAdditionalExecutivePairs);
  const additionalCorporateLayers = mode === "subsidiary" ? toNonNegativeInt(data?.ukAdditionalCorporateLayers) : 0;
  const additionalDcpContacts = toNonNegativeInt(data?.additionalContactPersons);

  const items: Array<{
    id: string;
    label: string;
    amount: number;
    original: number;
    mandatory: boolean;
    info?: string;
  }> = [
      {
        id: "uk_base_incorporation",
        label: "UK company incorporation",
        amount: pricing.incorporation,
        original: pricing.incorporation,
        mandatory: true,
        info: "Base incorporation service fee.",
      },
      {
        id: "uk_base_kyc",
        label: "KYC and due diligence",
        amount: pricing.kyc,
        original: pricing.kyc,
        mandatory: true,
        info: "Base KYC fee based on selected UK setup path.",
      },
      {
        id: "uk_base_registered_office",
        label: "Registered office address service (1 year)",
        amount: pricing.registeredOffice,
        original: pricing.registeredOffice,
        mandatory: true,
        info: "Included in the base first-year package.",
      },
    ];

  if (additionalExecutivePairs > 0) {
    const amount = additionalExecutivePairs * 100;
    items.push({
      id: "uk_additional_executive_pairs",
      label: "Additional executive packs (2 individuals per pack)",
      amount,
      original: amount,
      mandatory: true,
      info: "USD 100 per additional 2 individual executives.",
    });
  }

  if (additionalCorporateLayers > 0) {
    const amount = additionalCorporateLayers * 150;
    items.push({
      id: "uk_additional_corporate_layers",
      label: "Additional corporate shareholder layers",
      amount,
      original: amount,
      mandatory: true,
      info: "USD 150 per additional corporate shareholder layer.",
    });
  }

  if (additionalDcpContacts > 0) {
    const amount = additionalDcpContacts * 250;
    items.push({
      id: "uk_additional_contact_persons",
      label: "Additional designated contact persons",
      amount,
      original: amount,
      mandatory: true,
      info: "First designated contact person is free. Each additional contact is USD 250 per year.",
    });
  }

  UK_OPTIONAL_FIXED_SERVICES.forEach((service) => {
    items.push({
      id: service.id,
      label: service.label,
      amount: service.amount,
      original: service.amount,
      mandatory: service.mandatory,
      info: service.info,
    });
  });

  return items;
};

const computeUkFees = (data: any) => {
  const selectedServiceIds = getSelectedServiceIds(data);
  const allItems = buildUkServiceItems(data);

  const selectedItemsUsd: McapFeeItem[] = allItems
    .filter((item) => item.mandatory || selectedServiceIds.has(item.id))
    .map((item) => ({
      id: item.id,
      label: item.label,
      amount: item.amount,
      kind: "service" as const,
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
    note: "Quote-only service requests are tracked separately and excluded from invoice totals until priced.",
  };
};

export const UK_FULL_CONFIG: McapConfig = {
  id: "uk-full",
  countryCode: "UK",
  countryName: "United Kingdom",
  currency: "USD",
  title: "UK Company Incorporation",
  confirmationDetails: {
    title: "UK Incorporation Submitted",
    message: "We have collected your UK incorporation details. Our team will validate KYC/CDD, review your service selection, and proceed with filing.",
    steps: [
      {
        title: "Compliance Review",
        description: "KYC/CDD verification and sanctions screening review.",
      },
      {
        title: "Document Confirmation",
        description: "Review of incorporation details, members, and required supporting documents.",
      },
      {
        title: "Incorporation Filing",
        description: "Submission to the UK Companies House process after checks are complete.",
      },
      {
        title: "Post-filing Support",
        description: "Registered office and optional post-incorporation support are coordinated based on your selections.",
      },
    ],
  },
  steps: [
    {
      id: "applicant",
      title: "ppif.section1",
      fields: [
        {
          type: "info",
          label: "UK Incorporation Guidance",
          content: "Application Form for Establishing a British Private Limited Company (England and Wales). If you need support: www.mirrasia.com, +82-2-543-6187 (Korea), +852-2187-2428 (Hong Kong), cs@mirrasia.com.",
          colSpan: 2,
        },

        {
          type: "text",
          name: "applicantName",
          label: "Applicant Name",
          placeholder: "Name of person completing this form",
          required: true,
          colSpan: 2,
        },
        { type: "email", name: "applicantEmail", label: "newHk.steps.applicant.fields.email.label", required: true, colSpan: 2 },

        {
          type: "checkbox-group",
          name: "applicantRelationshipType",
          label: "Relationship between applicant and UK corporation to be established",
          required: true,
          options: APPLICANT_RELATIONSHIP_OPTIONS,
          colSpan: 2,
        },
        {
          type: "text",
          name: "applicantRelationshipOther",
          label: "Other relationship (please specify)",
          condition: (f) => Array.isArray(f.applicantRelationshipType) && f.applicantRelationshipType.includes("other"),
          colSpan: 2,
        },
        {
          type: "text",
          name: "companyName1",
          label: "Desired UK company name (1st choice)",
          required: true,
          colSpan: 2,
        },
        {
          type: "text",
          name: "companyName2",
          label: "Desired UK company name (2nd choice)",
          required: true,
          colSpan: 2,
        },
        {
          type: "text",
          name: "companyName3",
          label: "Desired UK company name (3rd choice)",
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
      ],
    },
    {
      id: "compliance",
      title: "AML / CDD",
      description: "Please answer compliance questions accurately to avoid future misunderstandings and regulatory issues.",
      fields: [
        {
          type: "radio-group",
          name: "legalAndEthicalConcern",
          label: "Does the purpose of establishing a UK corporation have legal or ethical issues such as money laundering, gambling, tax evasion, asset concealment, illegal business, or fraud?",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
            { label: "Do not know", value: "unknown" },
            { label: "Consider legal advice", value: "consider_legal_advice" },
            { label: "Other", value: "other" },
          ],
          colSpan: 2,
        },
        {
          type: "text",
          name: "legalAndEthicalConcernOther",
          label: "Other details",
          condition: (f) => f.legalAndEthicalConcern === "other",
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "annualRenewalConsent",
          label: "After incorporation, annual renewal/accounting/tax duties with recurring costs and data obligations will apply. Do you agree?",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
            { label: "Can be resolved in-house after establishment", value: "self_handle_after_setup" },
            { label: "No intention to establish if fixed annual costs occur", value: "no_if_fixed_cost" },
            { label: "Need advice before proceeding", value: "need_advice" },
          ],
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "sanctionedCountryOperations",
          label: "Will the planned UK corporation/holding/group/related company operate or plan to operate in Iran, Sudan, South Sudan, North Korea, Syria, Cuba, Belarus, Zimbabwe, Russia, or regions of Ukraine outside government control?",
          required: true,
          options: YES_NO_DONT_KNOW,
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "sanctionedResidenceExposure",
          label: "Are any officials residing in sanctioned countries/regions or countries sanctioned by UN, EU, UKHMT, HKMA, or OFAC?",
          required: true,
          options: YES_NO_DONT_KNOW,
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "sanctionedOwnershipOrControl",
          label: "Will the planned UK entity be owned/controlled by, or act for, sanctioned individuals, groups, organizations, or governments?",
          required: true,
          options: YES_NO_DONT_KNOW,
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "crimeaSevastopolExposure",
          label: "Are officials or related companies currently operating, or planning to operate, in Crimea or Sevastopol?",
          required: true,
          options: YES_NO_DONT_KNOW,
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "oilGasMilitaryExposure",
          label: "Are the planned UK entity or related companies currently operating, or planning to operate, in oil/gas/energy/military/defense sectors?",
          required: true,
          options: YES_NO_DONT_KNOW,
          colSpan: 2,
        }
      ],
    },
    {
      id: "company",
      title: "Company Information",
      fields: [
        {
          type: "radio-group",
          name: "selectedEntity",
          label: "Select UK setup path",
          required: true,
          defaultValue: "individual",
          options: [
            { label: "UK corporation (individual shareholder)", value: "individual" },
            { label: "UK subsidiary of foreign corporation", value: "subsidiary" },
            { label: "UK branch office of foreign corporation (temporary pricing follows individual package)", value: "branch" },
          ],
          colSpan: 2,
        },
        {
          type: "checkbox-group",
          name: "businessTypes",
          label: "Select business type (check all relevant items)",
          required: true,
          options: BUSINESS_TYPE_OPTIONS,
          colSpan: 2,
        },
        {
          type: "text",
          name: "businessTypesOther",
          label: "Other business type",
          condition: (f) => Array.isArray(f.businessTypes) && f.businessTypes.includes("other"),
          colSpan: 2,
        },
        {
          type: "textarea",
          name: "tradedItemDescription",
          label: "Description of traded item/service content/service type",
          required: true,
          rows: 3,
          colSpan: 2,
        },
        {
          type: "textarea",
          name: "businessSummary",
          label: "Describe the business content in 3-4 sentences",
          required: true,
          rows: 4,
          colSpan: 2,
        },
        {
          type: "text",
          name: "website",
          label: "Website address (if any)",
          placeholder: "https://",
          colSpan: 2,
        },
        {
          type: "checkbox-group",
          name: "establishmentPurpose",
          label: "Purpose and expected effects of establishing a UK corporation",
          required: true,
          options: ESTABLISHMENT_PURPOSE_OPTIONS,
          colSpan: 2,
        },
        {
          type: "text",
          name: "establishmentPurposeOther",
          label: "Other purpose",
          condition: (f) => Array.isArray(f.establishmentPurpose) && f.establishmentPurpose.includes("other"),
          colSpan: 2,
        },
        {
          type: "textarea",
          name: "operatingCountries",
          label: "Country/countries where business will be conducted after establishment",
          placeholder: "List all countries where development, operations, staff residence, office, CS, inventory, decision-making, marketing, sales, etc. occur.",
          required: true,
          rows: 3,
          colSpan: 2,
        },
        {
          type: "select",
          name: "capitalCurrency",
          label: "Currency of capital",
          required: true,
          options: [
            { label: "Pound", value: "GBP" },
            { label: "USD", value: "USD" },
            { label: "Other", value: "other" },
          ],
        },
        {
          type: "text",
          name: "capitalCurrencyOther",
          label: "Capital currency (other)",
          condition: (f) => f.capitalCurrency === "other",
        },
        {
          type: "select",
          name: "totalCapitalToBePaid",
          label: "Total capital to be paid",
          required: true,
          options: [
            { label: "1", value: "1" },
            { label: "100", value: "100" },
            { label: "1,000", value: "1000" },
            { label: "10,000", value: "10000" },
            { label: "Other", value: "other" },
          ],
        },
        {
          type: "text",
          name: "totalCapitalToBePaidOther",
          label: "Total capital to be paid (other)",
          condition: (f) => f.totalCapitalToBePaid === "other",
        },
        {
          type: "select",
          name: "totalShares",
          label: "Total number of shares",
          required: true,
          options: [
            { label: "1", value: "1" },
            { label: "100", value: "100" },
            { label: "1,000", value: "1000" },
            { label: "10,000", value: "10000" },
            { label: "Other", value: "other" },
          ],
        },
        {
          type: "text",
          name: "totalSharesOther",
          label: "Total number of shares (other)",
          condition: (f) => f.totalShares === "other",
        },
        {
          type: "text",
          name: "issuedShareTypeOther",
          label: "Issued share type (other)",
          condition: (f) => f.issuedShareType === "other",
          colSpan: 2,
        },
        {
          type: "textarea",
          name: "articlesSpecialClauses",
          label: "Special clauses to be recorded in articles of association (if any)",
          rows: 3,
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "registeredOfficeChoice",
          label: "UK company registered office address",
          required: true,
          options: [
            { label: "Use Mirr Asia registered address service", value: "use_mirrasia_address" },
            { label: "Use separate UK business address (do not use Mirr Asia service)", value: "use_own_address" },
          ],
          colSpan: 2,
        },
        {
          type: "text",
          name: "registeredOfficeOwnAddress",
          label: "UK business address details",
          required: true,
          condition: (f) => f.registeredOfficeChoice === "use_own_address",
          colSpan: 2,
        },
      ],
    },
    {
      id: "parties",
      title: "newHk.company.sections.c",
      description: "newHk.company.fields.inviteText",
      widget: "PartiesManager",
      minParties: 1,
      requireDcp: true,
      requirePartyInvite: true,
      partyFields: [
        {
          key: "shareType",
          label: "newHk.parties.fields.type.label",
          type: "radio-group",
          options: [
            { label: "CompanyInformation.typeOfShare.ordinaryShares", value: "ordinary" },
            { label: "CompanyInformation.typeOfShare.preferenceShares", value: "preferred" },
          ],
          roles: ["shareholder"],
          storage: "root",
        },
      ],
    },
    {
      id: "accounting",
      title: "newHk.steps.acct.title",
      fields: [
        {
          type: "select",
          name: "finYrEnd",
          label: "newHk.steps.acct.fields.finYrEnd.label",
          options: [
            { label: "newHk.steps.acct.fields.finYrEnd.options.December 31", value: "December 31" },
            { label: "newHk.steps.acct.fields.finYrEnd.options.March 31", value: "March 31" },
            { label: "newHk.steps.acct.fields.finYrEnd.options.June 30", value: "June 30" },
            { label: "newHk.steps.acct.fields.finYrEnd.options.September 30", value: "September 30" },
          ],
        },
        {
          type: "radio-group",
          name: "bookKeepingCycle",
          label: "newHk.steps.acct.fields.bookKeepingCycle.label",
          options: [
            { label: "newHk.steps.acct.fields.bookKeepingCycle.options.Monthly", value: "Monthly" },
            { label: "newHk.steps.acct.fields.bookKeepingCycle.options.Quarterly", value: "Quarterly" },
            { label: "newHk.steps.acct.fields.bookKeepingCycle.options.Half-annually", value: "Half-annually" },
            { label: "newHk.steps.acct.fields.bookKeepingCycle.options.Annually", value: "Annually" },
          ],
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "xero",
          label: "newHk.steps.acct.fields.xero.label",
          options: [
            { label: "newHk.steps.acct.fields.xero.options.Yes", value: "Yes" },
            { label: "newHk.steps.acct.fields.xero.options.No", value: "No" },
            { label: "newHk.steps.acct.fields.xero.options.Recommendation required", value: "Recommendation required" },
            { label: "newHk.steps.acct.fields.xero.options.Other", value: "Other" },
          ],
          colSpan: 2,
        },
        {
          type: "text",
          name: "softNote",
          label: "newHk.steps.acct.fields.softNote.label",
          colSpan: 2,
        },
      ],
    },
    {
      id: "services",
      title: "Service Selection",
      description: "Select priced services to include in invoice. Quote-only requests are tracked separately and excluded from totals.",
      widget: "ServiceSelectionWidget",
      fields: [
        {
          type: "select",
          name: "ukAdditionalExecutivePairs",
          label: "Additional executive packs (2 individuals per pack, USD 100 per pack)",
          defaultValue: "0",
          options: ["0", "1", "2", "3", "4", "5"].map((value) => ({ label: value, value })),
        },
        {
          type: "select",
          name: "ukAdditionalCorporateLayers",
          label: "Additional corporate shareholder layers (USD 150 per layer)",
          defaultValue: "0",
          condition: (f) => f.selectedEntity === "subsidiary",
          options: ["0", "1", "2", "3", "4", "5"].map((value) => ({ label: value, value })),
        },
        {
          type: "checkbox-group",
          name: "ukQuoteOnlyServices",
          label: "Quote-only service requests (tracked only, not added to invoice)",
          options: QUOTE_ONLY_SERVICE_OPTIONS,
          colSpan: 2,
        },
        {
          type: "textarea",
          name: "ukQuoteOnlyServicesOther",
          label: "Other quote-only request details",
          condition: (f) => Array.isArray(f.ukQuoteOnlyServices) && f.ukQuoteOnlyServices.includes("other"),
          rows: 3,
          colSpan: 2,
        },
      ],
      serviceItems: (data) => buildUkServiceItems(data),
    },
    {
      id: "invoice",
      title: "Invoice Preview",
      description: "Review service fees before payment.",
      widget: "InvoiceWidget",
      computeFees: (data) => computeUkFees(data),
    },
    {
      id: "payment",
      title: "Payment",
      description: "Proceed with card payment or upload bank transfer proof.",
      widget: "PaymentWidget",
      supportedCurrencies: ["USD", "HKD"],
      computeFees: (data) => computeUkFees(data),
    },
    {
      id: "review",
      title: "Review & Declaration",
      fields: [
        {
          type: "info",
          label: "Agreement and Declaration",
          content: "You declare that all provided information and documents are true, complete, and accurate. Service may be suspended if unlawful purpose or legal violations are identified.",
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "applicationAgreement",
          label: "Do you agree to the above declaration?",
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
          label: "I understand that services may be suspended if legal or compliance violations are identified.",
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
