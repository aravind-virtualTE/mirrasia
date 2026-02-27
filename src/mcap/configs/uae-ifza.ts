/* eslint-disable @typescript-eslint/no-explicit-any */
import { finYearOptions } from "@/pages/Company/NewHKForm/hkIncorpo";
import type { McapConfig } from "./types";

const ENTITY_OPTIONS = [
  { label: "mcap.uae.options.entityType.localLlc", value: "UAE-LOCAL-LLC" },
  { label: "mcap.uae.options.entityType.ifzaFzco", value: "UAE-IFZA-FZCO" },
  { label: "mcap.uae.options.entityType.difcFzco", value: "UAE-DIFC-FZCO" },
  { label: "mcap.uae.options.entityType.dwtcFzco", value: "UAE-DWTC-FZCO" },
  { label: "mcap.uae.options.entityType.dmccFzco", value: "UAE-DMCC-FZCO" },
  { label: "mcap.uae.options.entityType.dicFzco", value: "UAE-DIC-FZCO" },
];

const ENTITY_META = {
  "UAE-LOCAL-LLC": {
    initialCostUSD: 23700,
    setupCostUSD: 2500,
    capital: "USD 1 (recommended, no contribution obligation)",
    office: "Required (approx. USD 2,800/year)",
    establishmentDays: "30 days or more",
    visa: "USD 10,450 (renewal USD 7,600 every 2 years)",
    accounting: "Yes (separate cost)",
    localSponsor: "Required",
  },
  "UAE-IFZA-FZCO": {
    initialCostUSD: 22650,
    setupCostUSD: 2000,
    capital: "AED 10,000 (approx. USD 2,800, no contribution obligation)",
    office: "Registered office possible; required for 4+ visas",
    establishmentDays: "30 days or more",
    visa: "USD 8,600 (renewal USD 7,950 every 2 years)",
    accounting: "Yes (audit obligation: no)",
    localSponsor: "None",
  },
  "UAE-DIFC-FZCO": {
    initialCostUSD: 49500,
    setupCostUSD: 2000,
    capital: "None",
    office: "Required (shared office possible, USD 7,000/year)",
    establishmentDays: "30 days or more",
    visa: "USD 24,100 (annual renewal USD 6,280)",
    accounting: "Yes (audit may be required based on revenue/employee thresholds)",
    localSponsor: "None",
  },
  "UAE-DWTC-FZCO": {
    initialCostUSD: 23800,
    setupCostUSD: 2000,
    capital: "None (AED 300,000 triggers contribution obligation)",
    office: "Required (shared office possible, USD 4,050/year)",
    establishmentDays: "30 days or more",
    visa: "USD 9,100 (renewal USD 7,050 every 3 years)",
    accounting: "Yes (separate cost)",
    localSponsor: "None",
  },
  "UAE-DMCC-FZCO": {
    initialCostUSD: 28000,
    setupCostUSD: 2000,
    capital: "AED 50,000 (pay within 6 months)",
    office: "Required (shared office possible, USD 7,000/year)",
    establishmentDays: "30 days or more",
    visa: "USD 11,300 (renewal USD 6,900 every 3 years)",
    accounting: "Yes (separate cost)",
    localSponsor: "None",
  },
  "UAE-DIC-FZCO": {
    initialCostUSD: 32000,
    setupCostUSD: 2000,
    capital: "AED 50,000 (pay within 1 year)",
    office: "Required (shared office possible, USD 7,000/year)",
    establishmentDays: "30 days or more",
    visa: "USD 15,100 (renewal USD 7,050 every 3 years)",
    accounting: "Yes (separate cost)",
    localSponsor: "None",
  },
};

const YES_NO_OPTIONS = [
  { label: "mcap.common.options.yes", value: "yes" },
  { label: "mcap.common.options.no", value: "no" },
];

const YES_NO_DONT_KNOW_OPTIONS = [
  { label: "mcap.common.options.yes", value: "yes" },
  { label: "mcap.common.options.no", value: "no" },
  { label: "mcap.common.options.doNotKnow", value: "unknown" },
];

type UaeServiceItem = {
  id: string;
  label: string;
  amount: number;
  original: number;
  mandatory?: boolean;
  info?: string;
};

const UAE_SERVICE_CATALOG: UaeServiceItem[] = [
  {
    id: "vasp_setup_emi",
    label: "mcap.uae.services.items.vaspSetupEmi.label",
    amount: 14850,
    original: 14850,
    info: "mcap.uae.services.items.vaspSetupEmi.info",
  },
  {
    id: "vasp_kyc_kyt",
    label: "mcap.uae.services.items.vaspKycKyt.label",
    amount: 2500,
    original: 2500,
    mandatory: false,
    info: "mcap.uae.services.items.vaspKycKyt.info",
  },
  {
    id: "vasp_aml_10",
    label: "mcap.uae.services.items.vaspAml10.label",
    amount: 1000,
    original: 1000,
  },
  {
    id: "vasp_aml_20",
    label: "mcap.uae.services.items.vaspAml20.label",
    amount: 1800,
    original: 1800,
  },
  {
    id: "vasp_accounting",
    label: "mcap.uae.services.items.vaspAccounting.label",
    amount: 3000,
    original: 3000,
  },
  {
    id: "ifza_setup_bank",
    label: "mcap.uae.services.items.ifzaSetupBank.label",
    amount: 5000,
    original: 5000,
  },
  {
    id: "legal_opinion_ifza",
    label: "mcap.uae.services.items.legalOpinionIfza.label",
    amount: 1500,
    original: 1500,
  },
  {
    id: "legal_opinion_domestic",
    label: "mcap.uae.services.items.legalOpinionDomestic.label",
    amount: 5000,
    original: 5000,
  },
  {
    id: "consulting",
    label: "mcap.uae.services.items.consulting.label",
    amount: 2000,
    original: 2000,
  },
];

const getSelectedServiceIds = (data: any) => {
  const selected = new Set<string>();
  const optionalFeeIds = Array.isArray(data?.optionalFeeIds) ? data.optionalFeeIds : [];
  const serviceItemsSelected = Array.isArray(data?.serviceItemsSelected) ? data.serviceItemsSelected : [];
  optionalFeeIds.forEach((id: any) => selected.add(String(id)));
  serviceItemsSelected.forEach((id: any) => selected.add(String(id)));
  return selected;
};

const buildUaeServiceItems = (data: any, entityMeta: any) => {
  const entity = entityMeta?.[data?.entityType] || null;
  const setupCost = Number(entity?.setupCostUSD || 0);
  return [
    {
      id: "setup",
      label: "mcap.uae.services.items.setup.label",
      amount: setupCost,
      original: setupCost,
      mandatory: true,
      info: "mcap.uae.services.items.setup.info",
    },
    ...UAE_SERVICE_CATALOG,
  ];
};

const computeUaeFees = (data: any, entityMeta: any) => {
  const selectedIds = getSelectedServiceIds(data);
  const allItems = buildUaeServiceItems(data, entityMeta);
  const items = allItems
    .filter((item) => item.mandatory || selectedIds.has(item.id))
    .map((item) => ({
      id: item.id,
      label: item.label,
      amount: item.amount,
      original: item.original,
      kind: "service" as const,
      ...(item.info ? { info: item.info } : {}),
    }));

  const total = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const paymentCurrency = String(data?.paymentCurrency || data?.currency || "USD").toUpperCase();
  const cardFeePct = paymentCurrency === "USD" ? 0.06 : 0.04;
  const cardFeeSurcharge = String(data?.payMethod || "").toLowerCase() === "card" ? total * cardFeePct : 0;

  return {
    currency: "USD",
    paymentCurrency,
    items,
    government: 0,
    service: total,
    total,
    cardFeePct,
    cardFeeSurcharge,
    grandTotal: total + cardFeeSurcharge,
    note: "mcap.uae.fees.note",
  };
};

export const UAE_IFZA_CONFIG: McapConfig = {
  id: "uae-ifza",
  countryCode: "UAE",
  countryName: "Dubai IFZA / UAE",
  currency: "USD",
  title: "mcap.uae.title",
  entityMeta: ENTITY_META,
  confirmationDetails: {
    title: "mcap.uae.confirmation.title",
    message: "mcap.uae.confirmation.message",
    steps: [
      {
        title: "mcap.uae.confirmation.steps.initialReview.title",
        description: "mcap.uae.confirmation.steps.initialReview.description",
      },
      {
        title: "mcap.uae.confirmation.steps.kycVerification.title",
        description: "mcap.uae.confirmation.steps.kycVerification.description",
      },
      {
        title: "mcap.uae.confirmation.steps.filing.title",
        description: "mcap.uae.confirmation.steps.filing.description",
      },
    ],
  },
  steps: [
    {
      id: "applicant",
      title: "mcap.common.steps.applicant",
      description: "mcap.uae.steps.applicant.description",
      fields: [
        {
          type: "info",
          label: "mcap.uae.applicant.notice.label",
          content: "mcap.uae.applicant.notice.content",
        },
        { type: "text", name: "applicantName", label: "mcap.common.fields.applicantName", required: true },
        {
          type: "text",
          name: "companyName1",
          label: "mcap.common.fields.companyNameFirstChoice",
          required: true,
        },
        { type: "text", name: "companyName2", label: "mcap.common.fields.companyNameSecondChoice" },
        { type: "text", name: "companyName3", label: "mcap.common.fields.companyNameThirdChoice" },
        { type: "email", name: "applicantEmail", label: "mcap.common.fields.applicantEmail", required: true },
        { type: "text", name: "applicantPhone", label: "mcap.common.fields.applicantPhone", required: true },
        {
          type: "checkbox-group",
          name: "applicantRelationship",
          label: "mcap.uae.applicant.fields.applicantRelationship.label",
          required: true,
          options: [
            { label: "mcap.uae.options.applicantRelationship.director", value: "director" },
            { label: "mcap.uae.options.applicantRelationship.chiefManager", value: "chief_manager" },
            { label: "mcap.uae.options.applicantRelationship.authorizedPerson", value: "authorized_person" },
            { label: "mcap.uae.options.applicantRelationship.majorShareholder", value: "major_shareholder" },
            { label: "mcap.uae.options.applicantRelationship.expertAdvisor", value: "expert_advisor" },
            { label: "mcap.common.options.other", value: "other" },
          ],
        },
        {
          type: "text",
          name: "applicantRelationshipOther",
          label: "mcap.uae.applicant.fields.applicantRelationshipOther.label",
          condition: (data) => Array.isArray(data.applicantRelationship) && data.applicantRelationship.includes("other"),
        },
        {
          type: "select",
          name: "snsType",
          label: "mcap.common.fields.preferredMessenger",
          options: [
            { label: "mcap.common.messenger.whatsApp", value: "whatsapp" },
            { label: "mcap.common.messenger.weChat", value: "wechat" },
            { label: "mcap.common.messenger.telegram", value: "telegram" },
            { label: "mcap.common.messenger.line", value: "line" },
            { label: "mcap.common.messenger.kakaoTalk", value: "kakaotalk" },
            { label: "mcap.common.options.other", value: "other" },
          ],
        },
        {
          type: "text",
          name: "snsId",
          label: "mcap.common.fields.messengerId",
          condition: (data) => !!data.snsType,
        },
      ],
    },
    {
      id: "compliance",
      title: "mcap.common.steps.compliance",
      description: "mcap.uae.steps.compliance.description",
      fields: [
        {
          type: "radio-group",
          name: "legalEthicalIssues",
          label: "mcap.uae.compliance.legalEthicalIssues.label",
          required: true,
          options: [
            { label: "mcap.common.options.yes", value: "yes" },
            { label: "mcap.common.options.no", value: "no" },
            { label: "mcap.common.options.doNotKnow", value: "unknown" },
            { label: "mcap.uae.compliance.options.considerLegalAdvice", value: "legal_advice" },
            { label: "mcap.common.options.other", value: "other" },
          ],
        },
        {
          type: "text",
          name: "legalEthicalIssuesOther",
          label: "mcap.uae.compliance.fields.legalEthicalIssuesOther.label",
          condition: (data) => data.legalEthicalIssues === "other",
        },
        {
          type: "radio-group",
          name: "annualRenewalConsent",
          label: "mcap.uae.compliance.annualRenewalConsent.label",
          required: true,
          options: [
            { label: "mcap.common.options.yes", value: "yes" },
            { label: "mcap.common.options.no", value: "no" },
            { label: "mcap.uae.compliance.options.internalAfterEstablishment", value: "internal" },
            { label: "mcap.common.options.adviceRequiredBeforeProceeding", value: "advice" },
          ],
        },
        {
          type: "radio-group",
          name: "sanctionCountriesOps",
          label: "mcap.uae.compliance.sanctionCountriesOps.label",
          required: true,
          options: YES_NO_DONT_KNOW_OPTIONS,
        },
        {
          type: "radio-group",
          name: "sanctionPersonnelResidency",
          label: "mcap.uae.compliance.sanctionPersonnelResidency.label",
          required: true,
          options: YES_NO_OPTIONS,
        },
        {
          type: "radio-group",
          name: "crimeaSevastopol",
          label: "mcap.uae.compliance.crimeaSevastopol.label",
          required: true,
          options: YES_NO_DONT_KNOW_OPTIONS,
        },
        {
          type: "radio-group",
          name: "sensitiveSectors",
          label: "mcap.uae.compliance.sensitiveSectors.label",
          required: true,
          options: YES_NO_OPTIONS,
        },
      ],
    },
    {
      id: "company",
      title: "mcap.common.steps.company",
      description: "mcap.uae.steps.company.description",
      widget: "PartiesManager",
      minParties: 1,
      requireDcp: true,
      requirePartyInvite: true,
      fields: [
        // --- Entity Selection ---
        { type: "select", name: "entityType", label: "mcap.uae.company.fields.entityType.label", required: true, options: ENTITY_OPTIONS, colSpan: 2 },
        {
          type: "derived",
          name: "initialCostUSD",
          label: "mcap.uae.company.fields.initialCostUsd.label",
          compute: (_data, entity) => (entity?.initialCostUSD ? `$${entity.initialCostUSD.toLocaleString()}` : ""),
        },
        {
          type: "derived",
          name: "capital",
          label: "mcap.uae.company.fields.capital.label",
          compute: (_data, entity) => entity?.capital || "",
        },
        {
          type: "derived",
          name: "officeRequirement",
          label: "mcap.uae.company.fields.officeRequirement.label",
          compute: (_data, entity) => entity?.office || "",
        },
        {
          type: "derived",
          name: "visaCost",
          label: "mcap.uae.company.fields.visaCost.label",
          compute: (_data, entity) => entity?.visa || "",
        },
        {
          type: "derived",
          name: "establishmentPeriod",
          label: "mcap.uae.company.fields.establishmentPeriod.label",
          compute: (_data, entity) => entity?.establishmentDays || "",
        },
        // --- Company Business Details ---
        {
          type: "checkbox-group",
          name: "businessTypes",
          label: "mcap.uae.company.fields.businessTypes.label",
          required: true,
          colSpan: 2,
          options: [
            { label: "mcap.uae.options.businessType.crypto", value: "crypto" },
            { label: "mcap.uae.options.businessType.itBlockchain", value: "it_blockchain" },
            { label: "mcap.uae.options.businessType.cryptoInvestment", value: "crypto_investment" },
            { label: "mcap.uae.options.businessType.cryptoGames", value: "crypto_games" },
            { label: "mcap.uae.options.businessType.forexTrading", value: "fx_trading" },
            { label: "mcap.uae.options.businessType.finance", value: "finance" },
            { label: "mcap.uae.options.businessType.trading", value: "trading" },
            { label: "mcap.uae.options.businessType.distribution", value: "distribution" },
            { label: "mcap.uae.options.businessType.consulting", value: "consulting" },
            { label: "mcap.uae.options.businessType.manufacturing", value: "manufacturing" },
            { label: "mcap.uae.options.businessType.ecommerce", value: "ecommerce" },
            { label: "mcap.uae.options.businessType.onlineDelivery", value: "online_delivery" },
            { label: "mcap.common.options.other", value: "other" },
          ],
        },
        {
          type: "text",
          name: "businessTypesOther",
          label: "mcap.uae.company.fields.businessTypesOther.label",
          colSpan: 2,
          condition: (data) => Array.isArray(data.businessTypes) && data.businessTypes.includes("other"),
        },
        {
          type: "textarea",
          name: "tradeDescription",
          label: "mcap.uae.company.fields.tradeDescription.label",
          required: true,
          colSpan: 2,
        },
        {
          type: "textarea",
          name: "businessSummary",
          label: "mcap.uae.company.fields.businessSummary.label",
          required: true,
          colSpan: 2,
        },
        {
          type: "text",
          name: "website",
          label: "mcap.common.fields.websiteAddressOptional",
          placeholder: "mcap.common.placeholders.website",
          colSpan: 2,
        },
        {
          type: "checkbox-group",
          name: "purposeOfEstablishment",
          label: "mcap.uae.company.fields.purposeOfEstablishment.label",
          colSpan: 2,
          options: [
            { label: "mcap.uae.options.purpose.diversification", value: "diversification" },
            { label: "mcap.uae.options.purpose.advisorSuggested", value: "advisor_suggested" },
            { label: "mcap.uae.options.purpose.internationalExpansion", value: "international_expansion" },
            { label: "mcap.uae.options.purpose.assetManagement", value: "asset_management" },
            { label: "mcap.uae.options.purpose.holdingCompany", value: "holding_company" },
            { label: "mcap.uae.options.purpose.competitiveAdvantage", value: "competitive_advantage" },
            { label: "mcap.uae.options.purpose.lowTax", value: "low_tax" },
            { label: "mcap.common.options.other", value: "other" },
          ],
        },
        {
          type: "text",
          name: "purposeOther",
          label: "mcap.common.fields.otherPurposeDetails",
          colSpan: 2,
          condition: (data) => Array.isArray(data.purposeOfEstablishment) && data.purposeOfEstablishment.includes("other"),
        },
        {
          type: "select",
          name: "paidInCapital",
          label: "mcap.uae.company.fields.paidInCapital.label",
          required: true,
          options: [
            { label: "mcap.uae.options.paidInCapital.oneAed", value: "1" },
            { label: "mcap.uae.options.paidInCapital.hundredAed", value: "100" },
            { label: "mcap.uae.options.paidInCapital.tenThousandAed", value: "10000" },
            { label: "mcap.common.options.other", value: "other" },
          ],
        },
        {
          type: "text",
          name: "paidInCapitalOther",
          label: "mcap.uae.company.fields.paidInCapitalOther.label",
          condition: (data) => data.paidInCapital === "other",
        },
        {
          type: "radio-group",
          name: "registeredAddressChoice",
          label: "mcap.uae.company.fields.registeredAddressChoice.label",
          required: true,
          colSpan: 2,
          options: [
            { label: "mcap.uae.options.registeredAddressChoice.mirrAsia", value: "mirasia_address" },
            { label: "mcap.uae.options.registeredAddressChoice.own", value: "own_address" },
          ],
        },
        {
          type: "textarea",
          name: "registeredAddress",
          label: "mcap.uae.company.fields.registeredAddress.label",
          colSpan: 2,
          condition: (data) => data.registeredAddressChoice === "own_address",
        },
      ],
    },
    {
      id: "acct",
      title: "mcap.common.steps.accounting",
      description: "mcap.uae.steps.accounting.description",
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
          type: "radio-group",
          name: "bookKeepingCycle",
          label: "mcap.common.fields.bookKeepingCycle",
          options: [
            { label: "mcap.common.bookkeeping.monthly", value: "monthly" },
            { label: "mcap.common.bookkeeping.quarterly", value: "quarterly" },
            { label: "mcap.common.bookkeeping.annually", value: "annually" },
          ],
          required: true,
        },
        {
          type: "radio-group",
          name: "xero",
          label: "mcap.uae.accounting.fields.xero.label",
          options: [
            { label: "mcap.uae.accounting.options.xero.yesNeedSetup", value: "yes" },
            { label: "mcap.uae.accounting.options.xero.noOwnSystem", value: "no" },
            { label: "mcap.uae.accounting.options.xero.needAdvice", value: "advice" },
          ],
        },
      ],
    },
    {
      id: "services",
      title: "mcap.common.steps.services",
      description: "mcap.uae.steps.services.description",
      widget: "ServiceSelectionWidget",
      serviceItems: (data: any, entityMeta: any) => buildUaeServiceItems(data, entityMeta),
    },
    {
      id: "invoice",
      title: "mcap.common.steps.invoice",
      description: "mcap.uae.steps.invoice.description",
      widget: "InvoiceWidget",
      computeFees: (data, entityMeta) => computeUaeFees(data, entityMeta),
    },
    {
      id: "payment",
      title: "mcap.common.steps.payment",
      description: "mcap.uae.steps.payment.description",
      widget: "PaymentWidget",
      supportedCurrencies: ["USD", "HKD"],
      computeFees: (data, entityMeta) => computeUaeFees(data, entityMeta),
    },
  ],
};
