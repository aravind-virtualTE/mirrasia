/* eslint-disable @typescript-eslint/no-explicit-any */
import type { McapConfig, McapFeeItem } from "./types";

type UkEntityMode = "individual" | "subsidiary" | "branch";

const YES_NO_DONT_KNOW = [
  { label: "mcap.common.options.yes", value: "yes" },
  { label: "mcap.common.options.no", value: "no" },
  { label: "mcap.common.options.doNotKnow", value: "unknown" },
];

const APPLICANT_RELATIONSHIP_OPTIONS = [
  { label: "mcap.common.relationship.director", value: "Director" },
  { label: "mcap.common.relationship.shareholder", value: "Shareholder" },
  { label: "mcap.common.relationship.authorizedRepresentative", value: "Authorized" },
  { label: "mcap.common.relationship.professionalAdvisor", value: "Professional" },
  { label: "mcap.common.options.other", value: "Other" },
];

const BUSINESS_TYPE_OPTIONS = [
  { label: "mcap.uk.options.businessType.virtualAsset", value: "virtual_asset" },
  { label: "mcap.uk.options.businessType.nftRelated", value: "nft_related" },
  { label: "mcap.uk.options.businessType.vaSoftwareDevelopment", value: "va_software_dev" },
  { label: "mcap.uk.options.businessType.softwareDevelopment", value: "software_dev" },
  { label: "mcap.uk.options.businessType.vaInvestment", value: "va_investment" },
  { label: "mcap.uk.options.businessType.vaP2eGame", value: "va_p2e_game" },
  { label: "mcap.uk.options.businessType.vaSpeculativeGame", value: "va_speculative_game" },
  { label: "mcap.uk.options.businessType.vaOtherGame", value: "va_other_game" },
  { label: "mcap.uk.options.businessType.metaversePlatform", value: "metaverse_platform" },
  { label: "mcap.uk.options.businessType.forexTrading", value: "fx_trading" },
  { label: "mcap.uk.options.businessType.financeInvestment", value: "finance_investment" },
  { label: "mcap.uk.options.businessType.tradingBusiness", value: "trading" },
  { label: "mcap.uk.options.businessType.distributionBusiness", value: "distribution" },
  { label: "mcap.uk.options.businessType.consulting", value: "consulting" },
  { label: "mcap.uk.options.businessType.manufacturing", value: "manufacturing" },
  { label: "mcap.uk.options.businessType.ecommerce", value: "ecommerce" },
  { label: "mcap.uk.options.businessType.purchaseProxy", value: "purchase_proxy" },
  { label: "mcap.common.options.other", value: "other" },
];

const ESTABLISHMENT_PURPOSE_OPTIONS = [
  { label: "mcap.uk.options.establishmentPurpose.commonwealthEuropeExpansion", value: "commonwealth_europe_expansion" },
  { label: "mcap.uk.options.establishmentPurpose.regulatoryDiversification", value: "regulatory_diversification" },
  { label: "mcap.uk.options.establishmentPurpose.advisorOrClientSuggested", value: "advisor_or_client_suggested" },
  { label: "mcap.uk.options.establishmentPurpose.internationalExpansion", value: "international_expansion" },
  { label: "mcap.uk.options.establishmentPurpose.assetManagement", value: "asset_management" },
  { label: "mcap.uk.options.establishmentPurpose.holdingManagement", value: "holding_management" },
  { label: "mcap.uk.options.establishmentPurpose.policyCompetitiveness", value: "policy_competitiveness" },
  { label: "mcap.common.options.other", value: "other" },
];

const QUOTE_ONLY_SERVICE_OPTIONS = [
  { label: "mcap.uk.options.quoteOnlyServices.emiAccountAdvisory", value: "emi_account_opening_advisory" },
  { label: "mcap.uk.options.quoteOnlyServices.ukLegalOpinion", value: "uk_legal_opinion" },
  { label: "mcap.uk.options.quoteOnlyServices.domesticExchangeLegalOpinion", value: "domestic_exchange_legal_opinion" },
  { label: "mcap.uk.options.quoteOnlyServices.crossBorderLegalOpinion", value: "cross_border_legal_opinion" },
  { label: "mcap.uk.options.quoteOnlyServices.regulatoryConsulting", value: "regulatory_consulting" },
  { label: "mcap.uk.options.quoteOnlyServices.vatReportingQuote", value: "vat_reporting_quote" },
  { label: "mcap.uk.options.quoteOnlyServices.bookkeepingQuote", value: "bookkeeping_quote" },
  { label: "mcap.uk.options.quoteOnlyServices.financialStatementsAndTaxQuote", value: "fs_and_tax_quote" },
  { label: "mcap.common.options.other", value: "other" },
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
    label: "mcap.uk.services.optional.emiListProvision.label",
    amount: 0,
    mandatory: false,
    info: "mcap.uk.services.optional.emiListProvision.info",
  },
  {
    id: "uk_bank_account_advisory",
    label: "mcap.uk.services.optional.bankAccountAdvisory.label",
    amount: 2400,
    mandatory: false,
    info: "mcap.uk.services.optional.bankAccountAdvisory.info",
  },
  {
    id: "uk_vat_registration",
    label: "mcap.uk.services.optional.vatRegistration.label",
    amount: 650,
    mandatory: false,
    info: "mcap.uk.services.optional.vatRegistration.info",
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
        label: "mcap.uk.services.base.incorporation.label",
        amount: pricing.incorporation,
        original: pricing.incorporation,
        mandatory: true,
        info: "mcap.uk.services.base.incorporation.info",
      },
      {
        id: "uk_base_kyc",
        label: "mcap.uk.services.base.kyc.label",
        amount: pricing.kyc,
        original: pricing.kyc,
        mandatory: true,
        info: "mcap.uk.services.base.kyc.info",
      },
      {
        id: "uk_base_registered_office",
        label: "mcap.uk.services.base.registeredOffice.label",
        amount: pricing.registeredOffice,
        original: pricing.registeredOffice,
        mandatory: true,
        info: "mcap.uk.services.base.registeredOffice.info",
      },
    ];

  if (additionalExecutivePairs > 0) {
    const amount = additionalExecutivePairs * 100;
    items.push({
      id: "uk_additional_executive_pairs",
      label: "mcap.uk.services.additional.executivePacks.label",
      amount,
      original: amount,
      mandatory: true,
      info: "mcap.uk.services.additional.executivePacks.info",
    });
  }

  if (additionalCorporateLayers > 0) {
    const amount = additionalCorporateLayers * 150;
    items.push({
      id: "uk_additional_corporate_layers",
      label: "mcap.uk.services.additional.corporateLayers.label",
      amount,
      original: amount,
      mandatory: true,
      info: "mcap.uk.services.additional.corporateLayers.info",
    });
  }

  if (additionalDcpContacts > 0) {
    const amount = additionalDcpContacts * 250;
    items.push({
      id: "uk_additional_contact_persons",
      label: "mcap.uk.services.additional.contactPersons.label",
      amount,
      original: amount,
      mandatory: true,
      info: "mcap.uk.services.additional.contactPersons.info",
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
    note: "mcap.uk.fees.note",
  };
};

export const UK_FULL_CONFIG: McapConfig = {
  id: "uk-full",
  countryCode: "UK",
  countryName: "United Kingdom",
  currency: "USD",
  title: "mcap.uk.title",
  confirmationDetails: {
    title: "mcap.uk.confirmation.title",
    message: "mcap.uk.confirmation.message",
    steps: [
      {
        title: "mcap.uk.confirmation.steps.complianceReview.title",
        description: "mcap.uk.confirmation.steps.complianceReview.description",
      },
      {
        title: "mcap.uk.confirmation.steps.documentConfirmation.title",
        description: "mcap.uk.confirmation.steps.documentConfirmation.description",
      },
      {
        title: "mcap.uk.confirmation.steps.incorporationFiling.title",
        description: "mcap.uk.confirmation.steps.incorporationFiling.description",
      },
      {
        title: "mcap.uk.confirmation.steps.postFilingSupport.title",
        description: "mcap.uk.confirmation.steps.postFilingSupport.description",
      },
    ],
  },
  steps: [
    {
      id: "applicant",
      title: "mcap.common.steps.applicant",
      fields: [
        {
          type: "info",
          label: "mcap.uk.applicant.guidance.label",
          content: "mcap.uk.applicant.guidance.content",
          colSpan: 2,
        },

        {
          type: "text",
          name: "applicantName",
          label: "mcap.common.fields.applicantName",
          placeholder: "mcap.uk.applicant.fields.applicantName.placeholder",
          required: true,
          colSpan: 2,
        },
        { type: "email", name: "applicantEmail", label: "mcap.common.fields.applicantEmail", required: true, colSpan: 2 },

        {
          type: "checkbox-group",
          name: "applicantRelationshipType",
          label: "mcap.uk.applicant.fields.relationship.label",
          required: true,
          options: APPLICANT_RELATIONSHIP_OPTIONS,
          colSpan: 2,
        },
        {
          type: "text",
          name: "applicantRelationshipOther",
          label: "mcap.uk.applicant.fields.relationshipOther.label",
          condition: (f) => Array.isArray(f.applicantRelationshipType) && f.applicantRelationshipType.includes("other"),
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
      ],
    },
    {
      id: "compliance",
      title: "mcap.common.steps.compliance",
      description: "mcap.uk.steps.compliance.description",
      fields: [
        {
          type: "radio-group",
          name: "legalAndEthicalConcern",
          label: "mcap.uk.compliance.legalAndEthicalConcern.label",
          required: true,
          options: [
            { label: "mcap.common.options.yes", value: "yes" },
            { label: "mcap.common.options.no", value: "no" },
            { label: "mcap.common.options.doNotKnow", value: "unknown" },
            { label: "mcap.uk.compliance.options.considerLegalAdvice", value: "consider_legal_advice" },
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
          label: "mcap.uk.compliance.annualRenewalConsent.label",
          required: true,
          options: [
            { label: "mcap.common.options.yes", value: "yes" },
            { label: "mcap.common.options.no", value: "no" },
            { label: "mcap.common.options.selfHandleAfterSetup", value: "self_handle_after_setup" },
            { label: "mcap.common.options.noIfFixedAnnualCosts", value: "no_if_fixed_cost" },
            { label: "mcap.common.options.adviceRequiredBeforeProceeding", value: "need_advice" },
          ],
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "sanctionedCountryOperations",
          label: "mcap.uk.compliance.sanctionedCountryOperations.label",
          required: true,
          options: YES_NO_DONT_KNOW,
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "sanctionedResidenceExposure",
          label: "mcap.uk.compliance.sanctionedResidenceExposure.label",
          required: true,
          options: YES_NO_DONT_KNOW,
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "sanctionedOwnershipOrControl",
          label: "mcap.uk.compliance.sanctionedOwnershipOrControl.label",
          required: true,
          options: YES_NO_DONT_KNOW,
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "crimeaSevastopolExposure",
          label: "mcap.uk.compliance.crimeaSevastopolExposure.label",
          required: true,
          options: YES_NO_DONT_KNOW,
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "oilGasMilitaryExposure",
          label: "mcap.uk.compliance.oilGasMilitaryExposure.label",
          required: true,
          options: YES_NO_DONT_KNOW,
          colSpan: 2,
        }
      ],
    },
    {
      id: "company",
      title: "mcap.common.steps.company",
      fields: [
        {
          type: "radio-group",
          name: "selectedEntity",
          label: "mcap.uk.company.selectedEntity.label",
          required: true,
          defaultValue: "individual",
          options: [
            { label: "mcap.uk.company.selectedEntity.options.individual", value: "individual" },
            { label: "mcap.uk.company.selectedEntity.options.subsidiary", value: "subsidiary" },
            { label: "mcap.uk.company.selectedEntity.options.branch", value: "branch" },
          ],
          colSpan: 2,
        },
        {
          type: "checkbox-group",
          name: "businessTypes",
          label: "mcap.uk.company.businessTypes.label",
          required: true,
          options: BUSINESS_TYPE_OPTIONS,
          colSpan: 2,
        },
        {
          type: "text",
          name: "businessTypesOther",
          label: "mcap.uk.company.businessTypesOther.label",
          condition: (f) => Array.isArray(f.businessTypes) && f.businessTypes.includes("other"),
          colSpan: 2,
        },
        {
          type: "textarea",
          name: "tradedItemDescription",
          label: "mcap.uk.company.tradedItemDescription.label",
          required: true,
          rows: 3,
          colSpan: 2,
        },
        {
          type: "textarea",
          name: "businessSummary",
          label: "mcap.uk.company.businessSummary.label",
          required: true,
          rows: 4,
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
          label: "mcap.uk.company.establishmentPurpose.label",
          required: true,
          options: ESTABLISHMENT_PURPOSE_OPTIONS,
          colSpan: 2,
        },
        {
          type: "text",
          name: "establishmentPurposeOther",
          label: "mcap.common.fields.otherPurposeDetails",
          condition: (f) => Array.isArray(f.establishmentPurpose) && f.establishmentPurpose.includes("other"),
          colSpan: 2,
        },
        {
          type: "textarea",
          name: "operatingCountries",
          label: "mcap.uk.company.operatingCountries.label",
          placeholder: "mcap.uk.company.operatingCountries.placeholder",
          required: true,
          rows: 3,
          colSpan: 2,
        },
        {
          type: "select",
          name: "capitalCurrency",
          label: "mcap.common.fields.capitalCurrency",
          required: true,
          options: [
            { label: "mcap.common.currency.gbp", value: "GBP" },
            { label: "mcap.common.currency.usd", value: "USD" },
            { label: "mcap.common.options.other", value: "other" },
          ],
        },
        {
          type: "text",
          name: "capitalCurrencyOther",
          label: "mcap.common.fields.capitalCurrencyOther",
          condition: (f) => f.capitalCurrency === "other",
        },
        {
          type: "select",
          name: "totalCapitalToBePaid",
          label: "mcap.common.fields.totalCapitalToBePaid",
          required: true,
          options: [
            { label: "1", value: "1" },
            { label: "100", value: "100" },
            { label: "1,000", value: "1000" },
            { label: "10,000", value: "10000" },
            { label: "mcap.common.options.other", value: "other" },
          ],
        },
        {
          type: "text",
          name: "totalCapitalToBePaidOther",
          label: "mcap.common.fields.totalCapitalToBePaidOther",
          condition: (f) => f.totalCapitalToBePaid === "other",
        },
        {
          type: "select",
          name: "totalShares",
          label: "mcap.common.fields.totalNumberOfShares",
          required: true,
          options: [
            { label: "1", value: "1" },
            { label: "100", value: "100" },
            { label: "1,000", value: "1000" },
            { label: "10,000", value: "10000" },
            { label: "mcap.common.options.other", value: "other" },
          ],
        },
        {
          type: "text",
          name: "totalSharesOther",
          label: "mcap.common.fields.totalNumberOfSharesOther",
          condition: (f) => f.totalShares === "other",
        },
        {
          type: "text",
          name: "issuedShareTypeOther",
          label: "mcap.common.fields.issuedShareTypeOther",
          condition: (f) => f.issuedShareType === "other",
          colSpan: 2,
        },
        {
          type: "textarea",
          name: "articlesSpecialClauses",
          label: "mcap.uk.company.articlesSpecialClauses.label",
          rows: 3,
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "registeredOfficeChoice",
          label: "mcap.uk.company.registeredOfficeChoice.label",
          required: true,
          options: [
            { label: "mcap.uk.company.registeredOfficeChoice.options.useMirrAsiaAddress", value: "use_mirrasia_address" },
            { label: "mcap.uk.company.registeredOfficeChoice.options.useOwnAddress", value: "use_own_address" },
          ],
          colSpan: 2,
        },
        {
          type: "text",
          name: "registeredOfficeOwnAddress",
          label: "mcap.uk.company.registeredOfficeOwnAddress.label",
          required: true,
          condition: (f) => f.registeredOfficeChoice === "use_own_address",
          colSpan: 2,
        },
      ],
    },
    {
      id: "parties",
      title: "mcap.common.steps.parties",
      description: "mcap.uk.steps.parties.description",
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
      ],
    },
    {
      id: "accounting",
      title: "mcap.common.steps.accounting",
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
      title: "mcap.common.steps.services",
      description: "mcap.uk.steps.services.description",
      widget: "ServiceSelectionWidget",
      fields: [
        {
          type: "select",
          name: "ukAdditionalExecutivePairs",
          label: "mcap.uk.services.fields.additionalExecutivePairs.label",
          defaultValue: "0",
          options: ["0", "1", "2", "3", "4", "5"].map((value) => ({ label: value, value })),
        },
        {
          type: "select",
          name: "ukAdditionalCorporateLayers",
          label: "mcap.uk.services.fields.additionalCorporateLayers.label",
          defaultValue: "0",
          condition: (f) => f.selectedEntity === "subsidiary",
          options: ["0", "1", "2", "3", "4", "5"].map((value) => ({ label: value, value })),
        },
        {
          type: "checkbox-group",
          name: "ukQuoteOnlyServices",
          label: "mcap.uk.services.fields.quoteOnlyServices.label",
          options: QUOTE_ONLY_SERVICE_OPTIONS,
          colSpan: 2,
        },
        {
          type: "textarea",
          name: "ukQuoteOnlyServicesOther",
          label: "mcap.uk.services.fields.quoteOnlyServicesOther.label",
          condition: (f) => Array.isArray(f.ukQuoteOnlyServices) && f.ukQuoteOnlyServices.includes("other"),
          rows: 3,
          colSpan: 2,
        },
      ],
      serviceItems: (data) => buildUkServiceItems(data),
      supportedCurrencies: ["USD", "HKD"],
      computeFees: (data) => computeUkFees(data),
    },
    {
      id: "invoice",
      title: "mcap.common.steps.invoice",
      description: "mcap.uk.steps.invoice.description",
      widget: "InvoiceWidget",
      computeFees: (data) => computeUkFees(data),
    },
    {
      id: "payment",
      title: "mcap.common.steps.payment",
      description: "mcap.uk.steps.payment.description",
      widget: "PaymentWidget",
      supportedCurrencies: ["USD", "HKD"],
      computeFees: (data) => computeUkFees(data),
    },
    {
      id: "review",
      title: "mcap.common.steps.review",
      fields: [
        {
          type: "info",
          label: "mcap.common.fields.agreementAndDeclaration",
          content: "mcap.uk.review.declaration.content",
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "applicationAgreement",
          label: "mcap.common.fields.doYouAgreeToDeclaration",
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
          label: "newHk.review.declarations.truth",
          required: true,
          colSpan: 2,
        },
        {
          type: "checkbox",
          name: "compliancePreconditionAcknowledgment",
          label: "newHk.review.declarations.compliance",
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
