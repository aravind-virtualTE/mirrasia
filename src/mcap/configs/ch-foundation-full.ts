/* eslint-disable @typescript-eslint/no-explicit-any */
import { finYearOptions } from "@/pages/Company/NewHKForm/hkIncorpo";
import type { McapConfig } from "./types";

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

const CH_FOUNDATION_INDUSTRY_OPTIONS = [
  { label: "mcap.ch.options.industry.cryptoRelated", value: "crypto" },
  { label: "mcap.ch.options.industry.itBlockchain", value: "it_blockchain" },
  { label: "mcap.ch.options.industry.financeInvestment", value: "finance_investment" },
  { label: "mcap.ch.options.industry.tradeWholesale", value: "trade_wholesale" },
  { label: "mcap.ch.options.industry.manufacturing", value: "manufacturing" },
  { label: "mcap.ch.options.industry.ecommerce", value: "ecommerce" },
  { label: "mcap.ch.options.industry.consulting", value: "consulting" },
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

const getBoardServiceMode = (data: Record<string, any>) =>
  String(data?.boardServiceMode || "mirr_provided");
const getRegisteredOfficeMode = (data: Record<string, any>) =>
  String(data?.registeredOfficeMode || "pobox");
const getBankOpeningMode = (data: Record<string, any>) =>
  String(data?.bankOpeningMode || "mirr_opening");

export const buildChFoundationServiceItems = (data: Record<string, any>): ChFoundationServiceItem[] => {
  const boardServiceMode = getBoardServiceMode(data);
  const registeredOfficeMode = getRegisteredOfficeMode(data);
  const bankOpeningMode = getBankOpeningMode(data);

  const items: ChFoundationServiceItem[] = [
    {
      id: "chf_foundation_setup",
      label: "mcap.ch.foundation.services.items.foundationSetup.label",
      amount: CH_FOUNDATION_PRICING.foundation_setup,
      original: CH_FOUNDATION_PRICING.foundation_setup,
      mandatory: true,
      kind: "service",
      info: "mcap.ch.foundation.services.items.foundationSetup.info",
    },
  ];

  if (boardServiceMode === "mirr_provided") {
    items.push({
      id: "chf_local_board_member_1y",
      label: "mcap.ch.foundation.services.items.localBoardMember.label",
      amount: CH_FOUNDATION_PRICING.local_board_member_1y,
      original: CH_FOUNDATION_PRICING.local_board_member_1y,
      mandatory: true,
      kind: "service",
      info: "mcap.ch.foundation.services.items.localBoardMember.info",
    });
  }

  if (registeredOfficeMode === "pobox") {
    items.push({
      id: "chf_registered_office_pobox_1y",
      label: "mcap.ch.foundation.services.items.registeredOfficePobox.label",
      amount: CH_FOUNDATION_PRICING.registered_office_pobox_1y,
      original: CH_FOUNDATION_PRICING.registered_office_pobox_1y,
      mandatory: true,
      kind: "service",
      info: "mcap.ch.foundation.services.items.registeredOfficePobox.info",
    });
  } else if (registeredOfficeMode === "flexidesk") {
    items.push({
      id: "chf_registered_office_flexidesk_1y",
      label: "mcap.ch.foundation.services.items.registeredOfficeFlexidesk.label",
      amount: CH_FOUNDATION_PRICING.registered_office_flexidesk_1y,
      original: CH_FOUNDATION_PRICING.registered_office_flexidesk_1y,
      mandatory: true,
      kind: "service",
      info: "mcap.ch.foundation.services.items.registeredOfficeFlexidesk.info",
    });
  }

  if (bankOpeningMode === "mirr_opening") {
    items.push({
      id: "chf_bank_opening_capital_operating",
      label: "mcap.ch.foundation.services.items.bankOpening.label",
      amount: CH_FOUNDATION_PRICING.bank_opening_capital_operating,
      original: CH_FOUNDATION_PRICING.bank_opening_capital_operating,
      mandatory: true,
      kind: "service",
      info: "mcap.ch.foundation.services.items.bankOpening.info",
    });
  }

  items.push(
    {
      id: "chf_accounting_tax_annual",
      label: "mcap.ch.foundation.services.items.accountingTaxAnnual.label",
      amount: CH_FOUNDATION_PRICING.accounting_tax_annual,
      original: CH_FOUNDATION_PRICING.accounting_tax_annual,
      mandatory: false,
      kind: "optional",
      info: "mcap.ch.foundation.services.items.accountingTaxAnnual.info",
    },
    {
      id: "chf_annual_foundation_report_estimated",
      label: "mcap.ch.foundation.services.items.annualFoundationReport.label",
      amount: CH_FOUNDATION_PRICING.annual_foundation_report_estimated,
      original: CH_FOUNDATION_PRICING.annual_foundation_report_estimated,
      mandatory: false,
      kind: "optional",
      estimated: true,
      info: "mcap.ch.foundation.services.items.annualFoundationReport.info",
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
  const shouldConvertToHkd = paymentCurrency === "HKD" && Number.isFinite(exchangeRateUsedRaw) && exchangeRateUsedRaw > 0;

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
    note: "mcap.ch.foundation.fees.note",
  };
};

export const CH_FOUNDATION_FULL_CONFIG: McapConfig = {
  id: "ch-foundation-full",
  countryCode: "CH_FOUNDATION",
  countryName: "Switzerland Foundation",
  currency: "USD",
  title: "mcap.ch.foundation.title",
  confirmationDetails: {
    title: "mcap.ch.foundation.confirmation.title",
    message: "mcap.ch.foundation.confirmation.message",
    steps: [
      {
        title: "mcap.ch.foundation.confirmation.steps.complianceReview.title",
        description: "mcap.ch.foundation.confirmation.steps.complianceReview.description",
      },
      {
        title: "mcap.ch.foundation.confirmation.steps.foundationFilingPreparation.title",
        description: "mcap.ch.foundation.confirmation.steps.foundationFilingPreparation.description",
      },
      {
        title: "mcap.ch.foundation.confirmation.steps.registrationTaxSetup.title",
        description: "mcap.ch.foundation.confirmation.steps.registrationTaxSetup.description",
      },
      {
        title: "mcap.ch.foundation.confirmation.steps.postFilingServices.title",
        description: "mcap.ch.foundation.confirmation.steps.postFilingServices.description",
      },
    ],
  },
  steps: [
    {
      id: "applicant",
      title: "mcap.common.steps.applicant",
      description: "mcap.ch.foundation.steps.applicant.description",
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
          label: "mcap.ch.foundation.applicant.fields.authorRelationship.label",
          required: true,
          options: [
            { label: "mcap.ch.foundation.options.relationship.director", value: "director" },
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
      description: "mcap.ch.foundation.steps.compliance.description",
      fields: [
        {
          type: "radio-group",
          name: "legalAndEthicalConcern",
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
          name: "annualRenewalConsent",
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
      ],
    },
    {
      id: "company",
      title: "mcap.common.steps.company",
      description: "mcap.ch.foundation.steps.company.description",
      fields: [
        {
          type: "text",
          name: "companyName1",
          label: "mcap.ch.foundation.company.fields.foundationNameFirstChoice.label",
          required: true,
          colSpan: 2,
        },
        {
          type: "text",
          name: "companyName2",
          label: "mcap.ch.foundation.company.fields.foundationNameSecondChoice.label",
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
          label: "mcap.ch.foundation.company.fields.capitalRequirementChoice.label",
          required: true,
          options: [
            {
              label: "mcap.ch.foundation.options.capitalRequirementChoice.acknowledged",
              value: "acknowledged",
            },
            {
              label: "mcap.ch.foundation.options.capitalRequirementChoice.otherArrangement",
              value: "other",
            },
          ],
          colSpan: 2,
        },
        {
          type: "textarea",
          name: "capitalRequirementOther",
          label: "mcap.ch.foundation.company.fields.capitalRequirementOther.label",
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
      description: "mcap.ch.common.steps.parties.description",
      widget: "PartiesManager",
      minParties: 1,
      requireDcp: true,
      requirePartyInvite: true,
    },
    {
      id: "accounting",
      title: "mcap.common.steps.accounting",
      description: "mcap.ch.foundation.steps.accounting.description",
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
      description: "mcap.ch.foundation.steps.services.description",
      widget: "ServiceSelectionWidget",
      fields: [
        {
          type: "select",
          name: "boardServiceMode",
          label: "mcap.ch.foundation.services.fields.boardServiceMode.label",
          required: true,
          defaultValue: "mirr_provided",
          options: [
            { label: "mcap.ch.foundation.services.options.boardServiceMode.mirrProvided", value: "mirr_provided" },
            { label: "mcap.ch.foundation.services.options.boardServiceMode.clientProvided", value: "client_provided" },
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
          name: "clientRegisteredOfficeAddress",
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
      ],
      serviceItems: (data) => buildChFoundationServiceItems(data),
      supportedCurrencies: ["USD", "HKD"],
      computeFees: (data) => computeChFoundationFees(data),
    },
    {
      id: "invoice",
      title: "mcap.common.steps.invoice",
      description: "mcap.ch.foundation.steps.invoice.description",
      widget: "InvoiceWidget",
      computeFees: (data) => computeChFoundationFees(data),
    },
    {
      id: "payment",
      title: "mcap.common.steps.payment",
      description: "mcap.ch.foundation.steps.payment.description",
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
          content: "mcap.ch.foundation.review.declaration.content",
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
