/* eslint-disable @typescript-eslint/no-explicit-any */
import { applicantRoles } from "@/pages/Company/NewHKForm/hkIncorpo";
import type { McapConfig, McapFeeItem } from "./types";

const CR_PRICES = {
  base: 4500,
  nominee: 2500,
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

const getSelectedCrServiceIds = (data: Record<string, any>) => {
  const ids = new Set<string>();
  const optionalFeeIds = Array.isArray(data?.optionalFeeIds) ? data.optionalFeeIds : [];
  const serviceItemsSelected = Array.isArray(data?.serviceItemsSelected) ? data.serviceItemsSelected : [];
  optionalFeeIds.forEach((id: any) => ids.add(String(id)));
  serviceItemsSelected.forEach((id: any) => ids.add(String(id)));
  if (data?.directorNominee) ids.add("directorNominee");
  if (data?.shareholderNominee) ids.add("shareholderNominee");
  return ids;
};

export const CR_FULL_CONFIG: McapConfig = {
  id: "cr-full",
  countryCode: "CR",
  countryName: "Costa Rica",
  currency: "USD",
  title: "cr.title",
  confirmationDetails: {
    title: "cr.confirmation.title",
    message: "cr.confirmation.message",
    steps: [
      {
        title: "cr.confirmation.steps.kycAmlVerification.title",
        description: "cr.confirmation.steps.kycAmlVerification.description",
      },
      {
        title: "cr.confirmation.steps.notaryPublicFiling.title",
        description: "cr.confirmation.steps.notaryPublicFiling.description",
      },
      {
        title: "cr.confirmation.steps.registrationApproval.title",
        description: "cr.confirmation.steps.registrationApproval.description",
      },
      {
        title: "cr.confirmation.steps.postRegistration.title",
        description: "cr.confirmation.steps.postRegistration.description",
      },
    ],
  },
  steps: [
    {
      id: "applicant",
      title: "mcap.common.steps.applicant",
      description: "cr.steps.applicant.description",
      fields: [
        { type: "text", name: "applicantName", label: "mcap.common.fields.applicantName", required: true, colSpan: 2 },
        { type: "email", name: "applicantEmail", label: "mcap.common.fields.applicantEmail", required: true, colSpan: 2 },
        { type: "text", name: "applicantPhone", label: "mcap.common.fields.applicantPhone", required: true, colSpan: 2 },
        {
          type: "checkbox-group",
          name: "relationshipToCrCorporation",
          label: "cr.applicant.fields.relationshipToCrCorporation.label",
          required: true,
          options: applicantRoles,
          colSpan: 2,
        },
        {
          type: "text",
          name: "relationshipToCrCorporationOther",
          label: "mcap.common.fields.otherRelationshipDetails",
          condition: (f) =>
            Array.isArray(f.relationshipToCrCorporation) &&
            f.relationshipToCrCorporation.includes("Other"),
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
        { type: "text", name: "address", label: "cr.applicant.fields.address.label", required: true, colSpan: 2 },
        { type: "text", name: "companyName1", label: "mcap.common.fields.companyNameFirstChoice", required: true, colSpan: 2 },
        { type: "text", name: "companyName2", label: "mcap.common.fields.companyNameSecondChoice", required: true, colSpan: 2 },
        { type: "text", name: "companyName3", label: "mcap.common.fields.companyNameThirdChoice", required: true, colSpan: 2 },
      ],
    },
    {
      id: "compliance",
      title: "mcap.common.steps.compliance",
      description: "cr.steps.compliance.description",
      fields: [
        {
          type: "radio-group",
          name: "annualRenewalConsent",
          label: "cr.compliance.annualRenewalConsent.label",
          required: true,
          colSpan: 2,
          options: YES_NO_OPTIONS,
        },
        {
          type: "radio-group",
          name: "sanctionsExposureDeclaration",
          label: "cr.compliance.sanctionsExposureDeclaration.label",
          required: true,
          colSpan: 2,
          options: YES_NO_DONT_KNOW_OPTIONS,
        },
        {
          type: "radio-group",
          name: "legalAndEthicalConcern",
          label: "cr.compliance.legalAndEthicalConcern.label",
          required: true,
          colSpan: 2,
          options: YES_NO_DONT_KNOW_OPTIONS,
        },
        {
          type: "radio-group",
          name: "q_country",
          label: "cr.compliance.qCountry.label",
          required: true,
          colSpan: 2,
          options: YES_NO_DONT_KNOW_OPTIONS,
        },
        {
          type: "radio-group",
          name: "crimeaSevastapolPresence",
          label: "cr.compliance.crimeaSevastapolPresence.label",
          required: true,
          colSpan: 2,
          options: YES_NO_DONT_KNOW_OPTIONS,
        },
        {
          type: "radio-group",
          name: "russianEnergyPresence",
          label: "cr.compliance.russianEnergyPresence.label",
          required: true,
          colSpan: 2,
          options: YES_NO_DONT_KNOW_OPTIONS,
        },
        {
          type: "radio-group",
          name: "criminalHistory",
          label: "cr.compliance.criminalHistory.label",
          required: true,
          colSpan: 2,
          options: YES_NO_DONT_KNOW_OPTIONS,
        },
      ],
    },
    {
      id: "company",
      title: "mcap.common.steps.company",
      description: "cr.steps.company.description",
      fields: [
        {
          type: "checkbox-group",
          name: "selectedIndustry",
          label: "cr.company.fields.selectedIndustry.label",
          required: true,
          colSpan: 2,
          options: [
            { label: "cr.options.industry.trade", value: "trade" },
            { label: "cr.options.industry.retailDistribution", value: "retail" },
            { label: "cr.options.industry.consulting", value: "consulting" },
            { label: "cr.options.industry.manufacturing", value: "manufacturing" },
            { label: "cr.options.industry.financeAdvisory", value: "finance" },
            { label: "cr.options.industry.ecommerce", value: "ecommerce" },
            { label: "cr.options.industry.onlineProxy", value: "proxy" },
            { label: "cr.options.industry.itSoftware", value: "it" },
            { label: "cr.options.industry.crypto", value: "crypto" },
            { label: "mcap.common.options.other", value: "other" },
          ],
        },
        {
          type: "textarea",
          name: "productDescription",
          label: "cr.company.fields.productDescription.label",
          required: true,
          colSpan: 2,
          rows: 3,
        },
        {
          type: "checkbox-group",
          name: "establishmentPurpose",
          label: "cr.company.fields.establishmentPurpose.label",
          required: true,
          colSpan: 2,
          options: [
            { label: "cr.options.establishmentPurpose.expansion", value: "expansion" },
            { label: "cr.options.establishmentPurpose.assetManagement", value: "asset" },
            { label: "cr.options.establishmentPurpose.holdingCompany", value: "holding" },
            { label: "cr.options.establishmentPurpose.investorSuggestion", value: "investor" },
            { label: "cr.options.establishmentPurpose.internationalTransactions", value: "international" },
            { label: "cr.options.establishmentPurpose.businessDiversification", value: "diversification" },
            { label: "cr.options.establishmentPurpose.taxEfficiency", value: "tax" },
            { label: "cr.options.establishmentPurpose.noCapitalGainsTax", value: "capital-gain" },
            { label: "mcap.common.options.other", value: "other" },
          ],
        },
        {
          type: "text",
          name: "listCountry",
          label: "cr.company.fields.listCountry.label",
          required: true,
          colSpan: 2,
        },
        {
          type: "checkbox-group",
          name: "sourceFunding",
          label: "cr.company.fields.sourceFunding.label",
          required: true,
          colSpan: 2,
          options: [
            { label: "cr.options.sourceFunding.earnedIncome", value: "earned" },
            { label: "cr.options.sourceFunding.savings", value: "savings" },
            { label: "cr.options.sourceFunding.investmentIncome", value: "investment" },
            { label: "cr.options.sourceFunding.loan", value: "loan" },
            { label: "cr.options.sourceFunding.companySale", value: "sale" },
            { label: "cr.options.sourceFunding.businessIncome", value: "business" },
            { label: "cr.options.sourceFunding.inheritance", value: "inheritance" },
            { label: "mcap.common.options.other", value: "other" },
          ],
        },
        {
          type: "radio-group",
          name: "businessAddress",
          label: "cr.company.fields.businessAddress.label",
          required: true,
          colSpan: 2,
          options: [
            { label: "cr.options.businessAddress.mirrAsia", value: "mirasia" },
            { label: "cr.options.businessAddress.ownAddress", value: "own" },
            { label: "mcap.common.options.other", value: "other" },
          ],
        },
        {
          type: "text",
          name: "otherBusinessAddress",
          label: "cr.company.fields.otherBusinessAddress.label",
          condition: (f) => f.businessAddress === "other",
          colSpan: 2,
        },
        {
          type: "select",
          name: "currency",
          label: "cr.company.fields.currency.label",
          required: true,
          options: [
            { label: "cr.options.currency.usd", value: "USD" },
            { label: "cr.options.currency.eur", value: "EUR" },
            { label: "cr.options.currency.crc", value: "CRC" },
          ],
        },
        {
          type: "select",
          name: "capAmount",
          label: "cr.company.fields.capAmount.label",
          required: true,
          options: [
            { label: "10,000", value: "10000" },
            { label: "50,000", value: "50000" },
            { label: "100,000", value: "100000" },
            { label: "mcap.common.options.other", value: "other" },
          ],
        },
        {
          type: "number",
          name: "capOther",
          label: "cr.company.fields.capOther.label",
          condition: (f) => f.capAmount === "other",
        },
        {
          type: "select",
          name: "shareCount",
          label: "cr.company.fields.shareCount.label",
          required: true,
          options: [
            { label: "1", value: "1" },
            { label: "10", value: "10" },
            { label: "100", value: "100" },
            { label: "1,000", value: "1000" },
            { label: "10,000", value: "10000" },
            { label: "100,000", value: "100000" },
            { label: "mcap.common.options.other", value: "other" },
          ],
        },
        {
          type: "number",
          name: "shareOther",
          label: "cr.company.fields.shareOther.label",
          condition: (f) => f.shareCount === "other",
        },
        {
          type: "derived",
          name: "parValue",
          label: "mcap.common.fields.parValuePerShare",
          compute: (form) => {
            const cap = Number(form.capAmount === "other" ? form.capOther : form.capAmount) || 0;
            const shares = Number(form.shareCount === "other" ? form.shareOther : form.shareCount) || 1;
            const val = shares > 0 ? (cap / shares).toFixed(2) : "0.00";
            return `${form.currency || "USD"} ${val}`;
          },
        },
      ],
    },
    {
      id: "services",
      title: "mcap.common.steps.services",
      description: "cr.steps.services.description",
      widget: "ServiceSelectionWidget",
      serviceItems: [
        { id: "base", label: "cr.services.items.base.label", amount: CR_PRICES.base, original: CR_PRICES.base, mandatory: true },
        { id: "directorNominee", label: "cr.services.items.directorNominee.label", amount: CR_PRICES.nominee, original: CR_PRICES.nominee, mandatory: false },
        { id: "shareholderNominee", label: "cr.services.items.shareholderNominee.label", amount: CR_PRICES.nominee, original: CR_PRICES.nominee, mandatory: false },
      ],
      supportedCurrencies: ["USD", "HKD"],
      computeFees: (data) => {
        const selectedServiceIds = getSelectedCrServiceIds(data);
        const items: McapFeeItem[] = [
          { id: "base", label: "cr.services.items.base.label", amount: CR_PRICES.base, kind: "service" as const },
        ];
        if (selectedServiceIds.has("directorNominee")) {
          items.push({ id: "directorNominee", label: "cr.services.items.directorNominee.label", amount: CR_PRICES.nominee, kind: "optional" as const });
        }
        if (selectedServiceIds.has("shareholderNominee")) {
          items.push({ id: "shareholderNominee", label: "cr.services.items.shareholderNominee.label", amount: CR_PRICES.nominee, kind: "optional" as const });
        }
        const total = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const cardFeePct = 0.06;
        const cardFeeSurcharge = data.payMethod === "card" ? total * cardFeePct : 0;
        const grandTotal = total + cardFeeSurcharge;

        return {
          currency: "USD",
          items,
          total,
          service: total,
          government: 0,
          cardFeePct,
          cardFeeSurcharge,
          grandTotal,
        };
      },
    },
    {
      id: "parties",
      title: "mcap.common.steps.parties",
      description: "cr.steps.parties.description",
      widget: "PartiesManager",
      minParties: 1,
      requireDcp: true,
      requirePartyInvite: true,
    },
    {
      id: "accounting",
      title: "mcap.common.steps.accounting",
      fields: [
        {
          type: "textarea",
          name: "accountingAddress",
          label: "cr.accounting.fields.accountingAddress.label",
          required: true,
          rows: 3,
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "xero",
          label: "cr.accounting.fields.xero.label",
          options: [
            { label: "mcap.common.options.yes", value: "Yes" },
            { label: "mcap.common.options.no", value: "No" },
            { label: "cr.accounting.options.xero.recommendationRequired", value: "Recommendation required" },
            { label: "mcap.common.options.other", value: "Other" },
          ],
          colSpan: 2,
        },
        { type: "text", name: "softNote", label: "cr.accounting.fields.softNote.label", colSpan: 2 },
      ],
    },
    {
      id: "payment",
      title: "mcap.common.steps.payment",
      widget: "PaymentWidget",
      supportedCurrencies: ["USD", "HKD"],
      computeFees: (data) => {
        const selectedServiceIds = getSelectedCrServiceIds(data);
        const items: McapFeeItem[] = [
          { id: "base", label: "cr.services.items.base.label", amount: CR_PRICES.base, kind: "service" as const },
        ];
        if (selectedServiceIds.has("directorNominee")) {
          items.push({ id: "directorNominee", label: "cr.services.items.directorNominee.label", amount: CR_PRICES.nominee, kind: "optional" as const });
        }
        if (selectedServiceIds.has("shareholderNominee")) {
          items.push({ id: "shareholderNominee", label: "cr.services.items.shareholderNominee.label", amount: CR_PRICES.nominee, kind: "optional" as const });
        }
        const total = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const cardFeePct = 0.06; // Standard CR card fee
        const cardFeeSurcharge = data.payMethod === "card" ? total * cardFeePct : 0;
        const grandTotal = total + cardFeeSurcharge;

        return {
          currency: "USD",
          items,
          total,
          service: total,
          government: 0,
          cardFeePct,
          cardFeeSurcharge,
          grandTotal,
        };
      },
    },
  ],
};
