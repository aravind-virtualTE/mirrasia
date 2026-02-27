/* eslint-disable @typescript-eslint/no-explicit-any */
import { finYearOptions } from "@/pages/Company/NewHKForm/hkIncorpo";
import type { McapConfig, McapField } from "./types";

type AuServiceItem = {
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
  { label: "mcap.common.relationship.director", value: "director" },
  { label: "mcap.common.relationship.shareholder", value: "shareholder" },
  { label: "mcap.common.relationship.authorizedRepresentative", value: "authorized" },
  { label: "mcap.common.relationship.professionalAdvisor", value: "professional" },
  { label: "mcap.common.options.other", value: "other" },
];

const INDUSTRY_OPTIONS = [
  { label: "mcap.au.options.industry.technology", value: "technology" },
  { label: "mcap.au.options.industry.consulting", value: "consulting" },
  { label: "mcap.au.options.industry.trading", value: "trading" },
  { label: "mcap.au.options.industry.ecommerce", value: "ecommerce" },
  { label: "mcap.au.options.industry.investment", value: "investment" },
  { label: "mcap.au.options.industry.manufacturing", value: "manufacturing" },
  { label: "mcap.au.options.industry.fintech", value: "fintech" },
  { label: "mcap.common.options.other", value: "other" },
];

const PURPOSE_OPTIONS = [
  { label: "mcap.au.options.purpose.marketExpansion", value: "market_expansion" },
  { label: "mcap.au.options.purpose.regionalOperations", value: "regional_operations" },
  { label: "mcap.au.options.purpose.assetHolding", value: "asset_holding" },
  { label: "mcap.au.options.purpose.localCustomerSupport", value: "local_customer_support" },
  { label: "mcap.au.options.purpose.investorRequirement", value: "investor_requirement" },
  { label: "mcap.common.options.other", value: "other" },
];

const AU_PRICING = {
  baseIncorporation: 2000,
  nomineeDirectorAnnual: 5000,
  registeredAddressAnnual: 700,
  expressService: 550,
  emiAccountAssistance: 600,
} as const;

const getSelectedServiceIds = (data: Record<string, any>) => {
  const ids = new Set<string>();
  const optionalFeeIds = Array.isArray(data?.optionalFeeIds) ? data.optionalFeeIds : [];
  const serviceItemsSelected = Array.isArray(data?.serviceItemsSelected) ? data.serviceItemsSelected : [];
  optionalFeeIds.forEach((id: any) => ids.add(String(id)));
  serviceItemsSelected.forEach((id: any) => ids.add(String(id)));
  return ids;
};

const isYes = (value: any, defaultValue = false) => {
  if (value === undefined || value === null || value === "") return defaultValue;
  return String(value).toLowerCase() === "yes";
};

export const buildAuServiceItems = (data: Record<string, any>): AuServiceItem[] => {
  const hasResidentDirector = isYes(data?.auHasResidentDirector, true);
  const hasOwnRegisteredAddress = isYes(data?.auHasOwnRegisteredAddress, true);
  const emiViaPartnerChannel = isYes(data?.auEmiViaPartnerChannel, false);

  const items: AuServiceItem[] = [
    {
      id: "au_base_incorporation",
      label: "mcap.au.services.items.base.label",
      amount: AU_PRICING.baseIncorporation,
      original: AU_PRICING.baseIncorporation,
      mandatory: true,
      kind: "service",
      info: "mcap.au.services.items.base.info",
    },
    {
      id: "au_nominee_director_service",
      label: "mcap.au.services.items.nomineeDirector.label",
      amount: AU_PRICING.nomineeDirectorAnnual,
      original: AU_PRICING.nomineeDirectorAnnual,
      mandatory: !hasResidentDirector,
      kind: "service",
      info: "mcap.au.services.items.nomineeDirector.info",
    },
    {
      id: "au_registered_address_service",
      label: "mcap.au.services.items.registeredAddress.label",
      amount: AU_PRICING.registeredAddressAnnual,
      original: AU_PRICING.registeredAddressAnnual,
      mandatory: !hasOwnRegisteredAddress,
      kind: "service",
      info: "mcap.au.services.items.registeredAddress.info",
    },
    {
      id: "au_express_service",
      label: "mcap.au.services.items.express.label",
      amount: AU_PRICING.expressService,
      original: AU_PRICING.expressService,
      mandatory: false,
      kind: "optional",
      info: "mcap.au.services.items.express.info",
    },
    {
      id: "au_emi_account_assistance",
      label: "mcap.au.services.items.emiAssistance.label",
      amount: emiViaPartnerChannel ? 0 : AU_PRICING.emiAccountAssistance,
      original: emiViaPartnerChannel ? 0 : AU_PRICING.emiAccountAssistance,
      mandatory: false,
      kind: "optional",
      info: emiViaPartnerChannel
        ? "mcap.au.services.items.emiAssistance.infoIncluded"
        : "mcap.au.services.items.emiAssistance.infoConditional",
    },
  ];

  return items;
};

export const computeAuFees = (data: Record<string, any>) => {
  const selectedServiceIds = getSelectedServiceIds(data);
  const allItems = buildAuServiceItems(data);

  const selectedItems = allItems
    .filter((item) => item.mandatory || selectedServiceIds.has(item.id))
    .map((item) => ({
      id: item.id,
      label: item.label,
      amount: item.amount,
      kind: item.kind || (item.mandatory ? "service" : "optional"),
      original: item.original,
      ...(item.info ? { info: item.info } : {}),
    }));

  const total = selectedItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const paymentCurrency = String(data?.paymentCurrency || data?.currency || "AUD").toUpperCase();
  const cardFeePct = paymentCurrency === "USD" ? 0.06 : 0.04;
  const payMethod = String(data?.payMethod || "").toLowerCase();
  const cardFeeSurcharge = payMethod === "card" ? Number((total * cardFeePct).toFixed(2)) : 0;
  const grandTotal = Number((total + cardFeeSurcharge).toFixed(2));

  return {
    currency: paymentCurrency,
    items: selectedItems,
    government: 0,
    service: total,
    total,
    cardFeePct,
    cardFeeSurcharge,
    grandTotal,
    note:
      "mcap.au.fees.note",
  };
};

const buildApplicantFields = (): McapField[] => [
  { type: "text", name: "applicantName", label: "mcap.common.fields.applicantName", required: true, colSpan: 2 },
  { type: "email", name: "applicantEmail", label: "mcap.common.fields.applicantEmail", required: true, colSpan: 2 },
  { type: "text", name: "applicantPhone", label: "mcap.common.fields.applicantPhone", required: true, colSpan: 2 },
  { type: "text", name: "companyName1", label: "mcap.common.fields.companyNameFirstChoice", required: true, colSpan: 2 },
  { type: "text", name: "companyName2", label: "mcap.common.fields.companyNameSecondChoice", required: true, colSpan: 2 },
  { type: "text", name: "companyName3", label: "mcap.common.fields.companyNameThirdChoice", required: true, colSpan: 2 },
  {
    type: "checkbox-group",
    name: "applicantRelationshipType",
    label: "mcap.common.fields.relationshipToCompany",
    required: true,
    options: APPLICANT_RELATIONSHIP_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "applicantRelationshipOther",
    label: "mcap.common.fields.otherRelationshipDetails",
    condition: (f) => Array.isArray(f.applicantRelationshipType) && f.applicantRelationshipType.includes("other"),
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
    name: "annualRenewalConsent",
    label: "mcap.au.compliance.annualRenewalConsent.label",
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
    name: "legalAndEthicalConcern",
    label: "mcap.au.compliance.legalAndEthicalConcern.label",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "sanctionsExposureDeclaration",
    label: "mcap.au.compliance.sanctionsExposureDeclaration.label",
    required: true,
    options: YES_NO_UNKNOWN,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "corporateTaxAcknowledgement",
    label: "mcap.au.compliance.corporateTaxAcknowledgement.label",
    required: true,
    options: [
      { label: "mcap.common.options.yes", value: "yes" },
      { label: "mcap.au.compliance.options.needTaxAdvice", value: "need_advice" },
      { label: "mcap.common.options.no", value: "no" },
    ],
    colSpan: 2,
  },
];

const buildCompanyFields = (): McapField[] => [
  {
    type: "info",
    label: "mcap.au.company.requirements.label",
    content: "mcap.au.company.requirements.content",
    colSpan: 2,
  },
  {
    type: "checkbox-group",
    name: "selectedIndustry",
    label: "mcap.au.company.selectedIndustry.label",
    required: true,
    options: INDUSTRY_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "selectedIndustryOther",
    label: "mcap.common.fields.otherIndustryDetails",
    condition: (f) => Array.isArray(f.selectedIndustry) && f.selectedIndustry.includes("other"),
    required: true,
    colSpan: 2,
  },
  {
    type: "textarea",
    name: "businessDescription",
    label: "mcap.au.company.businessDescription.label",
    required: true,
    rows: 3,
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
    name: "establishmentPurpose",
    label: "mcap.au.company.establishmentPurpose.label",
    required: true,
    options: PURPOSE_OPTIONS,
    colSpan: 2,
  },
  {
    type: "text",
    name: "establishmentPurposeOther",
    label: "mcap.common.fields.otherPurposeDetails",
    condition: (f) => Array.isArray(f.establishmentPurpose) && f.establishmentPurpose.includes("other"),
    required: true,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "auHasResidentDirector",
    label: "mcap.au.company.auHasResidentDirector.label",
    required: true,
    options: [
      { label: "mcap.common.options.yes", value: "yes" },
      { label: "mcap.common.options.no", value: "no" },
    ],
    colSpan: 2,
  },
  {
    type: "checkbox",
    name: "auNomineeDirectorAcknowledgment",
    label: "mcap.au.company.auNomineeDirectorAcknowledgment.label",
    condition: (f) => f.auHasResidentDirector === "no",
    required: true,
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "auHasOwnRegisteredAddress",
    label: "mcap.au.company.auHasOwnRegisteredAddress.label",
    required: true,
    options: [
      { label: "mcap.common.options.yes", value: "yes" },
      { label: "mcap.common.options.no", value: "no" },
    ],
    colSpan: 2,
  },
  {
    type: "textarea",
    name: "auRegisteredAddressDetails",
    label: "mcap.au.company.auRegisteredAddressDetails.label",
    condition: (f) => f.auHasOwnRegisteredAddress === "yes",
    required: true,
    rows: 2,
    colSpan: 2,
  },
  {
    type: "checkbox",
    name: "auNoPoBoxAcknowledgement",
    label: "mcap.au.company.auNoPoBoxAcknowledgement.label",
    condition: (f) => f.auHasOwnRegisteredAddress === "yes",
    required: true,
    colSpan: 2,
  },
  {
    type: "select",
    name: "capitalCurrency",
    label: "mcap.common.fields.capitalCurrency",
    required: true,
    options: [
      { label: "mcap.common.currency.aud", value: "AUD" },
      { label: "mcap.common.currency.hkd", value: "HKD" },
      { label: "mcap.common.currency.usd", value: "USD" },
      { label: "mcap.common.options.other", value: "other" },
    ],
  },
  {
    type: "text",
    name: "capitalCurrencyOther",
    label: "mcap.common.fields.capitalCurrencyOther",
    condition: (f) => f.capitalCurrency === "other",
    required: true,
  },
  {
    type: "select",
    name: "capitalAmount",
    label: "mcap.common.fields.totalCapitalToBePaid",
    required: true,
    options: [
      { label: "1", value: "1" },
      { label: "100", value: "100" },
      { label: "1,000", value: "1000" },
      { label: "10,000", value: "10000" },
      { label: "100,000", value: "100000" },
      { label: "mcap.common.options.other", value: "other" },
    ],
  },
  {
    type: "number",
    name: "capitalAmountOther",
    label: "mcap.au.company.capitalAmountOther.label",
    condition: (f) => f.capitalAmount === "other",
    required: true,
  },
  {
    type: "select",
    name: "shareCount",
    label: "mcap.common.fields.totalNumberOfShares",
    required: true,
    options: [
      { label: "1", value: "1" },
      { label: "100", value: "100" },
      { label: "1,000", value: "1000" },
      { label: "10,000", value: "10000" },
      { label: "100,000", value: "100000" },
      { label: "mcap.common.options.other", value: "other" },
    ],
  },
  {
    type: "number",
    name: "shareCountOther",
    label: "mcap.common.fields.shareCountOther",
    condition: (f) => f.shareCount === "other",
    required: true,
  },
  {
    type: "derived",
    name: "parValuePerShare",
    label: "mcap.common.fields.parValuePerShare",
    compute: (f) => {
      const currency = f.capitalCurrency === "other" ? (String(f.capitalCurrencyOther || "AUD").toUpperCase()) : (f.capitalCurrency || "AUD");
      const total = f.capitalAmount === "other" ? Number(f.capitalAmountOther || 0) : Number(f.capitalAmount || 0);
      const shares = f.shareCount === "other" ? Number(f.shareCountOther || 0) : Number(f.shareCount || 0);
      if (!total || !shares) return `${currency} 0.00`;
      return `${currency} ${(total / shares).toFixed(2)}`;
    },
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
    label: "mcap.au.services.pricingSummary.label",
    content: "mcap.au.services.pricingSummary.content",
    colSpan: 2,
  },
  {
    type: "radio-group",
    name: "auEmiViaPartnerChannel",
    label: "mcap.au.services.auEmiViaPartnerChannel.label",
    options: [
      { label: "mcap.common.options.yes", value: "yes" },
      { label: "mcap.common.options.no", value: "no" },
      { label: "mcap.common.options.notSureYet", value: "unknown" },
    ],
    colSpan: 2,
  },
];

export const AU_FULL_CONFIG: McapConfig = {
  id: "au-full",
  countryCode: "AU",
  countryName: "Australia",
  currency: "USD",
  title: "mcap.au.title",
  confirmationDetails: {
    title: "mcap.au.confirmation.title",
    message: "mcap.au.confirmation.message",
    steps: [
      {
        title: "mcap.au.confirmation.steps.complianceReview.title",
        description: "mcap.au.confirmation.steps.complianceReview.description",
      },
      {
        title: "mcap.au.confirmation.steps.structureValidation.title",
        description: "mcap.au.confirmation.steps.structureValidation.description",
      },
      {
        title: "mcap.au.confirmation.steps.incorporationAndAbn.title",
        description: "mcap.au.confirmation.steps.incorporationAndAbn.description",
      },
      {
        title: "mcap.au.confirmation.steps.postIncorporationSupport.title",
        description: "mcap.au.confirmation.steps.postIncorporationSupport.description",
      },
    ],
  },
  steps: [
    {
      id: "applicant",
      title: "mcap.common.steps.applicant",
      fields: buildApplicantFields(),
    },
    {
      id: "compliance",
      title: "mcap.common.steps.compliance",
      description: "mcap.au.steps.compliance.description",
      fields: buildComplianceFields(),
    },
    {
      id: "company",
      title: "mcap.common.steps.company",
      fields: buildCompanyFields(),
    },
    {
      id: "parties",
      title: "mcap.common.steps.parties",
      description: "mcap.au.steps.parties.description",
      widget: "PartiesManager",
      minParties: 1,
      requireDcp: true,
      requirePartyInvite: true,
      partyFields: [
        {
          key: "shareType",
          label: "mcap.common.fields.shareType",
          type: "radio-group",
          options: [
            { label: "mcap.common.shareType.ordinary", value: "ordinary" },
            { label: "mcap.common.shareType.preference", value: "preferred" },
          ],
          roles: ["shareholder"],
          storage: "root",
        },
        {
          key: "auIsDirector",
          label: "mcap.common.fields.directorAppointment",
          type: "select",
          options: [
            { label: "mcap.common.options.yes", value: "yes" },
            { label: "mcap.common.options.no", value: "no" },
          ],
          storage: "details",
        },
        {
          key: "auIsResidentDirector",
          label: "mcap.au.parties.fields.auIsResidentDirector.label",
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
          key: "auIsDirector",
          storage: "details",
          requiredValues: ["yes"],
          label: "mcap.common.coverage.director",
          valueLabels: {
            yes: "mcap.common.coverage.directorAtLeastOne",
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
      description: "mcap.au.steps.services.description",
      widget: "ServiceSelectionWidget",
      fields: buildServiceFields(),
      serviceItems: (data) => buildAuServiceItems(data),
      supportedCurrencies: ["USD", "HKD"],
      computeFees: (data) => computeAuFees(data),
    },
    {
      id: "invoice",
      title: "mcap.common.steps.invoice",
      widget: "InvoiceWidget",
      computeFees: (data) => computeAuFees(data),
    },
    {
      id: "payment",
      title: "mcap.common.steps.payment",
      widget: "PaymentWidget",
      supportedCurrencies: ["AUD"],
      computeFees: (data) => computeAuFees(data),
    },
  ],
};
