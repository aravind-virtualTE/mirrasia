/* eslint-disable @typescript-eslint/no-explicit-any */
import type { McapConfig, McapFeeItem } from "./types";

const YES_NO_UNKNOWN_OPTIONS = [
  { label: "mcap.common.options.yes", value: "yes" },
  { label: "mcap.common.options.no", value: "no" },
  { label: "mcap.common.options.doNotKnow", value: "unknown" },
];

const APPLICANT_RELATIONSHIP_OPTIONS = [
  { label: "bvi.applicant.relationshipOptions.director", value: "director" },
  { label: "bvi.applicant.relationshipOptions.delegate", value: "delegate" },
  { label: "bvi.applicant.relationshipOptions.majorityShareholder", value: "majority_shareholder" },
  { label: "mcap.common.relationship.professionalAdvisor", value: "professional_advisor" },
  { label: "mcap.common.options.other", value: "other" },
];

const INDUSTRY_OPTIONS = [
  { label: "bvi.company.industryOptions.cryptoRelated", value: "crypto_related" },
  { label: "bvi.company.industryOptions.itBlockchainSoftware", value: "it_blockchain_software" },
  { label: "bvi.company.industryOptions.cryptoInvestment", value: "crypto_investment" },
  { label: "bvi.company.industryOptions.cryptoGames", value: "crypto_games" },
  { label: "bvi.company.industryOptions.forex", value: "forex" },
  { label: "bvi.company.industryOptions.investmentAndAdvisory", value: "investment_and_advisory" },
  { label: "bvi.company.industryOptions.trade", value: "trade" },
  { label: "bvi.company.industryOptions.wholesaleRetail", value: "wholesale_retail" },
  { label: "bvi.company.industryOptions.consulting", value: "consulting" },
  { label: "bvi.company.industryOptions.manufacturing", value: "manufacturing" },
  { label: "bvi.company.industryOptions.ecommerce", value: "ecommerce" },
  { label: "bvi.company.industryOptions.onlinePurchaseDeliveryAgency", value: "online_purchase_delivery_agency" },
  { label: "mcap.common.options.other", value: "other" },
];

const PURPOSE_OPTIONS = [
  { label: "bvi.company.purposeOptions.businessDiversification", value: "business_diversification" },
  { label: "bvi.company.purposeOptions.advisorSuggestion", value: "advisor_suggestion" },
  { label: "bvi.company.purposeOptions.internationalExpansion", value: "international_expansion" },
  { label: "bvi.company.purposeOptions.assetManagement", value: "asset_management" },
  { label: "bvi.company.purposeOptions.holdingCompany", value: "holding_company" },
  { label: "bvi.company.purposeOptions.financialFlexibility", value: "financial_flexibility" },
  { label: "bvi.company.purposeOptions.lowTaxBenefit", value: "low_tax_benefit" },
  { label: "bvi.company.purposeOptions.noCapitalGainsTax", value: "no_capital_gains_tax" },
  { label: "mcap.common.options.other", value: "other" },
];

const REQUESTED_SERVICE_OPTIONS = [
  { label: "bvi.services.requestedItems.options.incorporation", value: "bvi_incorporation_and_maintenance" },
  { label: "bvi.services.requestedItems.options.emiList", value: "emi_list" },
  { label: "bvi.services.requestedItems.options.emiAccountOpening", value: "emi_account_opening_advisory" },
  { label: "bvi.services.requestedItems.options.bankAccountOpening", value: "bank_account_opening_advisory" },
  { label: "bvi.services.requestedItems.options.seychellesLegalOpinion", value: "seychelles_legal_opinion" },
  { label: "bvi.services.requestedItems.options.domesticExchangeLegalOpinion", value: "domestic_exchange_legal_opinion" },
  { label: "bvi.services.requestedItems.options.consultingServices", value: "consulting_services" },
];

const FINANCIAL_YEAR_END_OPTIONS = [
  { label: "bvi.accounting.financialYearEndOptions.december31", value: "December 31" },
  { label: "bvi.accounting.financialYearEndOptions.march31", value: "March 31" },
  { label: "bvi.accounting.financialYearEndOptions.june30", value: "June 30" },
  { label: "bvi.accounting.financialYearEndOptions.september30", value: "September 30" },
];

const BOOKKEEPING_CYCLE_OPTIONS = [
  { label: "mcap.common.bookkeeping.monthly", value: "monthly" },
  { label: "mcap.common.bookkeeping.quarterly", value: "quarterly" },
  { label: "mcap.common.bookkeeping.halfYearly", value: "half_yearly" },
  { label: "mcap.common.bookkeeping.annually", value: "annually" },
];

const BVI_PRICING = {
  incorporationFirstYearMaintenance: 3250,
  fscRegistrationProfessionalService: 6500,
  fscFees: 2050,
  authorizedLegalRepresentative: 8500,
  offeringMemorandum: 6500,
  mlroBase: 9000,
  mlroPerInvestor: 500,
} as const;

const toNonNegativeInt = (value: any) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.floor(parsed);
};

const getSelectedServiceIds = (data: Record<string, any>) => {
  const ids = new Set<string>();
  const optionalFeeIds = Array.isArray(data?.optionalFeeIds) ? data.optionalFeeIds : [];
  const serviceItemsSelected = Array.isArray(data?.serviceItemsSelected) ? data.serviceItemsSelected : [];
  optionalFeeIds.forEach((id: any) => ids.add(String(id)));
  serviceItemsSelected.forEach((id: any) => ids.add(String(id)));
  return ids;
};

const getMlroInvestorCount = (data: Record<string, any>) => toNonNegativeInt(data?.bviMlroInvestorCount);

const buildBviServiceItems = (data: Record<string, any>) => {
  const selectedServiceIds = getSelectedServiceIds(data);
  const mlroBaseSelected = selectedServiceIds.has("bvi_mlro_base");
  const mlroInvestorCount = mlroBaseSelected ? getMlroInvestorCount(data) : 0;

  const items: Array<{
    id: string;
    label: string;
    amount: number;
    original: number;
    mandatory: boolean;
    kind?: "government" | "service";
    info?: string;
    managedByPartyData?: boolean;
    managedStatusLabel?: string;
    unitLabel?: string;
    quantity?: number;
  }> = [
      {
        id: "bvi_incorporation_first_year_maintenance",
        label: "bvi.services.base.incorporation.label",
        amount: BVI_PRICING.incorporationFirstYearMaintenance,
        original: BVI_PRICING.incorporationFirstYearMaintenance,
        mandatory: true,
        kind: "service",
        info: "bvi.services.base.incorporation.info",
      },
      {
        id: "bvi_fsc_registration_professional_service",
        label: "bvi.services.optional.fscRegistrationProfessionalService.label",
        amount: BVI_PRICING.fscRegistrationProfessionalService,
        original: BVI_PRICING.fscRegistrationProfessionalService,
        mandatory: false,
        kind: "service",
        info: "bvi.services.optional.fscRegistrationProfessionalService.info",
      },
      {
        id: "bvi_fsc_fees",
        label: "bvi.services.optional.fscFees.label",
        amount: BVI_PRICING.fscFees,
        original: BVI_PRICING.fscFees,
        mandatory: false,
        kind: "government",
        info: "bvi.services.optional.fscFees.info",
      },
      {
        id: "bvi_authorized_legal_representative",
        label: "bvi.services.optional.authorizedLegalRepresentative.label",
        amount: BVI_PRICING.authorizedLegalRepresentative,
        original: BVI_PRICING.authorizedLegalRepresentative,
        mandatory: false,
        kind: "service",
        info: "bvi.services.optional.authorizedLegalRepresentative.info",
      },
      {
        id: "bvi_offering_memorandum",
        label: "bvi.services.optional.offeringMemorandum.label",
        amount: BVI_PRICING.offeringMemorandum,
        original: BVI_PRICING.offeringMemorandum,
        mandatory: false,
        kind: "service",
        info: "bvi.services.optional.offeringMemorandum.info",
      },
      {
        id: "bvi_mlro_base",
        label: "bvi.services.optional.mlroBase.label",
        amount: BVI_PRICING.mlroBase,
        original: BVI_PRICING.mlroBase,
        mandatory: false,
        kind: "service",
        info: "bvi.services.optional.mlroBase.info",
      },
    ];

  if (mlroBaseSelected) {
    items.push({
      id: "bvi_mlro_per_investor",
      label: "bvi.services.optional.mlroPerInvestor.label",
      amount: BVI_PRICING.mlroPerInvestor,
      original: BVI_PRICING.mlroPerInvestor,
      mandatory: false,
      kind: "service",
      info: "bvi.services.optional.mlroPerInvestor.info",
      managedByPartyData: true,
      managedStatusLabel: "bvi.services.managed.mlroInvestorCount",
      unitLabel: "bvi.services.units.investor",
      quantity: mlroInvestorCount,
    });
  }

  return items;
};

const computeBviFees = (data: Record<string, any>) => {
  const selectedServiceIds = getSelectedServiceIds(data);
  const allItems = buildBviServiceItems(data);

  const selectedItemsUsd: McapFeeItem[] = allItems
    .filter((item) => {
      if (item.mandatory) return true;
      if (item.managedByPartyData) return Number(item.quantity || 0) > 0;
      return selectedServiceIds.has(item.id);
    })
    .map((item) => ({
      id: item.id,
      label: item.label,
      amount: item.amount,
      kind: item.kind || "service",
      quantity: Math.max(1, Number(item.quantity || 1)),
      ...(item.original !== undefined ? { original: item.original } : {}),
      ...(item.info ? { info: item.info } : {}),
      ...(item.managedByPartyData ? { managedByPartyData: true, managedStatusLabel: item.managedStatusLabel, unitLabel: item.unitLabel } : {}),
    }));

  const government = selectedItemsUsd
    .filter((item) => item.kind === "government")
    .reduce((sum, item) => sum + (Number(item.amount || 0) * Number(item.quantity || 1)), 0);
  const service = selectedItemsUsd
    .filter((item) => item.kind !== "government")
    .reduce((sum, item) => sum + (Number(item.amount || 0) * Number(item.quantity || 1)), 0);
  const total = Number((government + service).toFixed(2));
  const payMethod = String(data?.payMethod || "").toLowerCase();
  const cardFeePct = 0.06;
  const cardFeeSurcharge = payMethod === "card" ? Number((total * cardFeePct).toFixed(2)) : 0;
  const grandTotal = Number((total + cardFeeSurcharge).toFixed(2));

  return {
    currency: "USD",
    items: selectedItemsUsd,
    government,
    service,
    total,
    cardFeePct,
    cardFeeSurcharge,
    grandTotal,
    note: "bvi.fees.note",
  };
};

export const BVI_FULL_CONFIG: McapConfig = {
  id: "bvi-full",
  countryCode: "BVI",
  countryName: "British Virgin Islands",
  currency: "USD",
  title: "bvi.title",
  confirmationDetails: {
    title: "bvi.confirmation.title",
    message: "bvi.confirmation.message",
    steps: [
      {
        title: "bvi.confirmation.steps.complianceReview.title",
        description: "bvi.confirmation.steps.complianceReview.description",
      },
      {
        title: "bvi.confirmation.steps.scopeConfirmation.title",
        description: "bvi.confirmation.steps.scopeConfirmation.description",
      },
      {
        title: "bvi.confirmation.steps.execution.title",
        description: "bvi.confirmation.steps.execution.description",
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
      label: "bvi.reviewSummary.relationship",
      fieldNames: ["applicantRelationshipType"],
      useFieldLabel: true,
    },
    {
      id: "industry",
      kind: "field",
      label: "mcap.review.summary.industry",
      fieldNames: ["industry"],
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
      description: "bvi.steps.applicant.description",
      fields: [
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
          name: "companyName1",
          label: "mcap.common.fields.companyNameFirstChoice",
          required: true,
          colSpan: 2,
        },
        {
          type: "text",
          name: "companyName2",
          label: "mcap.common.fields.companyNameSecondChoice",
          colSpan: 2,
        },
        {
          type: "text",
          name: "companyName3",
          label: "mcap.common.fields.companyNameThirdChoice",
          colSpan: 2,
        },
        {
          type: "text",
          name: "applicantPhone",
          label: "mcap.common.fields.applicantPhone",
          required: true,
        },        
        {
          type: "checkbox-group",
          name: "applicantRelationshipType",
          label: "bvi.applicant.fields.relationship.label",
          required: true,
          options: APPLICANT_RELATIONSHIP_OPTIONS,
          colSpan: 2,
        },
        {
          type: "text",
          name: "applicantRelationshipOther",
          label: "mcap.common.fields.otherRelationshipDetails",
          condition: (f) => Array.isArray(f.applicantRelationshipType) && f.applicantRelationshipType.includes("other"),
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
        }        
      ],
    },
    {
      id: "compliance",
      title: "mcap.common.steps.compliance",
      description: "bvi.steps.compliance.description",
      fields: [
        {
          type: "radio-group",
          name: "legalAndEthicalConcern",
          label: "bvi.compliance.legalAndEthicalConcern.label",
          required: true,
          options: [
            { label: "mcap.common.options.yes", value: "yes" },
            { label: "mcap.common.options.no", value: "no" },
            { label: "mcap.common.options.doNotKnow", value: "unknown" },
            { label: "bvi.compliance.options.considerLegalAdvice", value: "consider_legal_advice" },
            { label: "mcap.common.options.other", value: "other" },
          ],
          colSpan: 2,
        },
        {
          type: "text",
          name: "legalAndEthicalConcernOther",
          label: "mcap.common.fields.otherDetails",
          condition: (f) => f.legalAndEthicalConcern === "other",
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "annualRenewalConsent",
          label: "bvi.compliance.annualRenewalConsent.label",
          required: true,
          options: [
            { label: "mcap.common.options.yes", value: "yes" },
            { label: "mcap.common.options.no", value: "no" },
            { label: "bvi.compliance.options.selfHandleAfterIncorporation", value: "self_handle_after_incorporation" },
            { label: "mcap.common.options.noIfFixedAnnualCosts", value: "no_if_fixed_annual_cost" },
            { label: "mcap.common.options.adviceRequiredBeforeProceeding", value: "need_advice" },
          ],
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "sanctionedCountryOperations",
          label: "bvi.compliance.sanctionedCountryOperations.label",
          required: true,
          options: YES_NO_UNKNOWN_OPTIONS,
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "sanctionedRelatedPartyExposure",
          label: "bvi.compliance.sanctionedRelatedPartyExposure.label",
          required: true,
          options: YES_NO_UNKNOWN_OPTIONS,
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "crimeaSevastopolExposure",
          label: "bvi.compliance.crimeaSevastopolExposure.label",
          required: true,
          options: YES_NO_UNKNOWN_OPTIONS,
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "oilGasMilitaryExposure",
          label: "bvi.compliance.oilGasMilitaryExposure.label",
          required: true,
          options: YES_NO_UNKNOWN_OPTIONS,
          colSpan: 2,
        },
      ],
    },
    {
      id: "company",
      title: "mcap.common.steps.company",
      description: "bvi.steps.company.description",
      fields: [
        {
          type: "select",
          name: "industry",
          label: "mcap.common.fields.selectedIndustry",
          required: true,
          options: INDUSTRY_OPTIONS,
          colSpan: 2,
        },
        {
          type: "text",
          name: "industryOther",
          label: "mcap.common.fields.otherIndustryDetails",
          condition: (f) => f.industry === "other",
          colSpan: 2,
        },
        {
          type: "textarea",
          name: "productServiceDescription",
          label: "mcap.common.fields.productServiceDescription",
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
          label: "bvi.company.fields.purposeOfEstablishment.label",
          required: true,
          options: PURPOSE_OPTIONS,
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
          type: "radio-group",
          name: "registeredOfficeChoice",
          label: "bvi.company.fields.registeredOfficeChoice.label",
          required: true,
          options: [
            { label: "bvi.company.fields.registeredOfficeChoice.options.useMirrAsiaAddress", value: "use_mirr_asia_address" },
            { label: "bvi.company.fields.registeredOfficeChoice.options.useOwnAddress", value: "use_own_address" },
            { label: "mcap.common.options.other", value: "other" },
          ],
          colSpan: 2,
        },
        {
          type: "textarea",
          name: "registeredOfficeDetails",
          label: "bvi.company.fields.registeredOfficeDetails.label",
          required: true,
          rows: 3,
          condition: (f) => f.registeredOfficeChoice === "use_own_address" || f.registeredOfficeChoice === "other",
          colSpan: 2,
        },
      ],
    },
    {
      id: "parties",
      title: "mcap.common.steps.parties",
      description: "bvi.steps.parties.description",
      widget: "PartiesManager",
      minParties: 1,
      requireDcp: true,
      requirePartyInvite: true,
      defaultPartyRoles: [],
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
      ],
      partyCoverageRules: [
        {
          key: "roles",
          storage: "root",
          requiredValues: ["director", "shareholder"],
          label: "bvi.parties.coverage.requiredRoles",
          valueLabels: {
            director: "mcap.common.coverage.directorAtLeastOne",
            shareholder: "mcap.common.coverage.shareholderAtLeastOne",
          },
        },
      ],
    },
    {
      id: "accounting",
      title: "mcap.common.steps.accounting",
      description: "bvi.steps.accounting.description",
      fields: [
        {
          type: "select",
          name: "financialYearEnd",
          label: "mcap.common.fields.financialYearEnd",
          options: FINANCIAL_YEAR_END_OPTIONS,
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "bookKeepingCycle",
          label: "mcap.common.fields.bookKeepingCycle",
          options: BOOKKEEPING_CYCLE_OPTIONS,
          colSpan: 2,
        },
        {
          type: "textarea",
          name: "accountingRecordAddress",
          label: "bvi.accounting.fields.accountingRecordAddress.label",
          required: true,
          rows: 3,
          colSpan: 2,
        },
        {
          type: "textarea",
          name: "accountingNotes",
          label: "mcap.common.fields.accountingAndTaxNotes",
          rows: 3,
          colSpan: 2,
        },
      ],
    },
    {
      id: "services",
      title: "mcap.common.steps.services",
      description: "bvi.steps.services.description",
      widget: "ServiceSelectionWidget",
      fields: [
        {
          type: "info",
          label: "bvi.services.notice.label",
          content: "bvi.services.notice.content",
          colSpan: 2,
        },
        {
          type: "checkbox-group",
          name: "bviRequestedServiceItems",
          label: "bvi.services.requestedItems.label",
          options: REQUESTED_SERVICE_OPTIONS,
          colSpan: 2,
        },
        {
          type: "number",
          name: "bviMlroInvestorCount",
          label: "bvi.services.fields.mlroInvestorCount.label",
          tooltip: "bvi.services.fields.mlroInvestorCount.tooltip",
          condition: (f) => Array.isArray(f.serviceItemsSelected) && f.serviceItemsSelected.includes("bvi_mlro_base"),
        },
      ],
      serviceItems: (data) => buildBviServiceItems(data),
      supportedCurrencies: ["USD", "HKD"],
      computeFees: (data) => computeBviFees(data),
    },
    {
      id: "invoice",
      title: "mcap.common.steps.invoice",
      description: "bvi.steps.invoice.description",
      widget: "InvoiceWidget",
      computeFees: (data) => computeBviFees(data),
    },
    {
      id: "payment",
      title: "mcap.common.steps.payment",
      description: "bvi.steps.payment.description",
      widget: "PaymentWidget",
      supportedCurrencies: ["USD", "HKD"],
      computeFees: (data) => computeBviFees(data),
    },
    {
      id: "review",
      title: "mcap.common.steps.review",
      fields: [
        {
          type: "info",
          label: "mcap.common.fields.agreementAndDeclaration",
          content: "bvi.review.declaration.content",
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "applicationAgreement",
          label: "bvi.review.applicationAgreement.label",
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
          label: "bvi.review.compliancePreconditionAcknowledgment.label",
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
