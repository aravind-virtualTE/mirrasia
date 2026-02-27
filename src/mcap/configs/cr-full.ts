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

export const CR_FULL_CONFIG: McapConfig = {
  id: "cr-full",
  countryCode: "CR",
  countryName: "Costa Rica",
  currency: "USD",
  title: "mcap.cr.title",
  confirmationDetails: {
    title: "mcap.cr.confirmation.title",
    message: "mcap.cr.confirmation.message",
    steps: [
      {
        title: "mcap.cr.confirmation.steps.kycAmlVerification.title",
        description: "mcap.cr.confirmation.steps.kycAmlVerification.description",
      },
      {
        title: "mcap.cr.confirmation.steps.notaryPublicFiling.title",
        description: "mcap.cr.confirmation.steps.notaryPublicFiling.description",
      },
      {
        title: "mcap.cr.confirmation.steps.registrationApproval.title",
        description: "mcap.cr.confirmation.steps.registrationApproval.description",
      },
      {
        title: "mcap.cr.confirmation.steps.postRegistration.title",
        description: "mcap.cr.confirmation.steps.postRegistration.description",
      },
    ],
  },
  steps: [
    {
      id: "applicant",
      title: "mcap.common.steps.applicant",
      description: "mcap.cr.steps.applicant.description",
      fields: [
        { type: "text", name: "applicantName", label: "mcap.common.fields.applicantName", required: true, colSpan: 2 },
        { type: "email", name: "applicantEmail", label: "mcap.common.fields.applicantEmail", required: true, colSpan: 2 },
        { type: "text", name: "applicantPhone", label: "mcap.common.fields.applicantPhone", required: true, colSpan: 2 },
        {
          type: "checkbox-group",
          name: "relationshipToCrCorporation",
          label: "mcap.cr.applicant.fields.relationshipToCrCorporation.label",
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
        { type: "text", name: "address", label: "mcap.cr.applicant.fields.address.label", required: true, colSpan: 2 },
        { type: "text", name: "companyName1", label: "mcap.common.fields.companyNameFirstChoice", required: true, colSpan: 2 },
        { type: "text", name: "companyName2", label: "mcap.common.fields.companyNameSecondChoice", required: true, colSpan: 2 },
        { type: "text", name: "companyName3", label: "mcap.common.fields.companyNameThirdChoice", required: true, colSpan: 2 },
      ],
    },
    {
      id: "compliance",
      title: "mcap.common.steps.compliance",
      description: "mcap.cr.steps.compliance.description",
      fields: [
        {
          type: "radio-group",
          name: "annualRenewalConsent",
          label: "mcap.cr.compliance.annualRenewalConsent.label",
          required: true,
          colSpan: 2,
          options: YES_NO_OPTIONS,
        },
        {
          type: "radio-group",
          name: "sanctionsExposureDeclaration",
          label: "mcap.cr.compliance.sanctionsExposureDeclaration.label",
          required: true,
          colSpan: 2,
          options: YES_NO_DONT_KNOW_OPTIONS,
        },
        {
          type: "radio-group",
          name: "legalAndEthicalConcern",
          label: "mcap.cr.compliance.legalAndEthicalConcern.label",
          required: true,
          colSpan: 2,
          options: YES_NO_DONT_KNOW_OPTIONS,
        },
        {
          type: "radio-group",
          name: "q_country",
          label: "mcap.cr.compliance.qCountry.label",
          required: true,
          colSpan: 2,
          options: YES_NO_DONT_KNOW_OPTIONS,
        },
        {
          type: "radio-group",
          name: "crimeaSevastapolPresence",
          label: "mcap.cr.compliance.crimeaSevastapolPresence.label",
          required: true,
          colSpan: 2,
          options: YES_NO_DONT_KNOW_OPTIONS,
        },
        {
          type: "radio-group",
          name: "russianEnergyPresence",
          label: "mcap.cr.compliance.russianEnergyPresence.label",
          required: true,
          colSpan: 2,
          options: YES_NO_DONT_KNOW_OPTIONS,
        },
        {
          type: "radio-group",
          name: "criminalHistory",
          label: "mcap.cr.compliance.criminalHistory.label",
          required: true,
          colSpan: 2,
          options: YES_NO_DONT_KNOW_OPTIONS,
        },
      ],
    },
    {
      id: "company",
      title: "mcap.common.steps.company",
      description: "mcap.cr.steps.company.description",
      fields: [
        {
          type: "checkbox-group",
          name: "selectedIndustry",
          label: "mcap.cr.company.fields.selectedIndustry.label",
          required: true,
          colSpan: 2,
          options: [
            { label: "mcap.cr.options.industry.trade", value: "trade" },
            { label: "mcap.cr.options.industry.retailDistribution", value: "retail" },
            { label: "mcap.cr.options.industry.consulting", value: "consulting" },
            { label: "mcap.cr.options.industry.manufacturing", value: "manufacturing" },
            { label: "mcap.cr.options.industry.financeAdvisory", value: "finance" },
            { label: "mcap.cr.options.industry.ecommerce", value: "ecommerce" },
            { label: "mcap.cr.options.industry.onlineProxy", value: "proxy" },
            { label: "mcap.cr.options.industry.itSoftware", value: "it" },
            { label: "mcap.cr.options.industry.crypto", value: "crypto" },
            { label: "mcap.common.options.other", value: "other" },
          ],
        },
        {
          type: "textarea",
          name: "productDescription",
          label: "mcap.cr.company.fields.productDescription.label",
          required: true,
          colSpan: 2,
          rows: 3,
        },
        {
          type: "checkbox-group",
          name: "establishmentPurpose",
          label: "mcap.cr.company.fields.establishmentPurpose.label",
          required: true,
          colSpan: 2,
          options: [
            { label: "mcap.cr.options.establishmentPurpose.expansion", value: "expansion" },
            { label: "mcap.cr.options.establishmentPurpose.assetManagement", value: "asset" },
            { label: "mcap.cr.options.establishmentPurpose.holdingCompany", value: "holding" },
            { label: "mcap.cr.options.establishmentPurpose.investorSuggestion", value: "investor" },
            { label: "mcap.cr.options.establishmentPurpose.internationalTransactions", value: "international" },
            { label: "mcap.cr.options.establishmentPurpose.businessDiversification", value: "diversification" },
            { label: "mcap.cr.options.establishmentPurpose.taxEfficiency", value: "tax" },
            { label: "mcap.cr.options.establishmentPurpose.noCapitalGainsTax", value: "capital-gain" },
            { label: "mcap.common.options.other", value: "other" },
          ],
        },
        {
          type: "text",
          name: "listCountry",
          label: "mcap.cr.company.fields.listCountry.label",
          required: true,
          colSpan: 2,
        },
        {
          type: "checkbox-group",
          name: "sourceFunding",
          label: "mcap.cr.company.fields.sourceFunding.label",
          required: true,
          colSpan: 2,
          options: [
            { label: "mcap.cr.options.sourceFunding.earnedIncome", value: "earned" },
            { label: "mcap.cr.options.sourceFunding.savings", value: "savings" },
            { label: "mcap.cr.options.sourceFunding.investmentIncome", value: "investment" },
            { label: "mcap.cr.options.sourceFunding.loan", value: "loan" },
            { label: "mcap.cr.options.sourceFunding.companySale", value: "sale" },
            { label: "mcap.cr.options.sourceFunding.businessIncome", value: "business" },
            { label: "mcap.cr.options.sourceFunding.inheritance", value: "inheritance" },
            { label: "mcap.common.options.other", value: "other" },
          ],
        },
        {
          type: "radio-group",
          name: "businessAddress",
          label: "mcap.cr.company.fields.businessAddress.label",
          required: true,
          colSpan: 2,
          options: [
            { label: "mcap.cr.options.businessAddress.mirrAsia", value: "mirasia" },
            { label: "mcap.cr.options.businessAddress.ownAddress", value: "own" },
            { label: "mcap.common.options.other", value: "other" },
          ],
        },
        {
          type: "text",
          name: "otherBusinessAddress",
          label: "mcap.cr.company.fields.otherBusinessAddress.label",
          condition: (f) => f.businessAddress === "other",
          colSpan: 2,
        },
        {
          type: "select",
          name: "currency",
          label: "mcap.cr.company.fields.currency.label",
          required: true,
          options: [
            { label: "mcap.cr.options.currency.usd", value: "USD" },
            { label: "mcap.cr.options.currency.eur", value: "EUR" },
            { label: "mcap.cr.options.currency.crc", value: "CRC" },
          ],
        },
        {
          type: "select",
          name: "capAmount",
          label: "mcap.cr.company.fields.capAmount.label",
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
          label: "mcap.cr.company.fields.capOther.label",
          condition: (f) => f.capAmount === "other",
        },
        {
          type: "select",
          name: "shareCount",
          label: "mcap.cr.company.fields.shareCount.label",
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
          label: "mcap.cr.company.fields.shareOther.label",
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
      description: "mcap.cr.steps.services.description",
      fields: [
        { type: "checkbox", name: "directorNominee", label: "mcap.cr.services.fields.directorNominee.label" },
        { type: "checkbox", name: "shareholderNominee", label: "mcap.cr.services.fields.shareholderNominee.label" },
      ],
    },
    {
      id: "parties",
      title: "mcap.common.steps.parties",
      description: "mcap.cr.steps.parties.description",
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
          label: "mcap.cr.accounting.fields.accountingAddress.label",
          required: true,
          rows: 3,
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "xero",
          label: "mcap.cr.accounting.fields.xero.label",
          options: [
            { label: "mcap.common.options.yes", value: "Yes" },
            { label: "mcap.common.options.no", value: "No" },
            { label: "mcap.cr.accounting.options.xero.recommendationRequired", value: "Recommendation required" },
            { label: "mcap.common.options.other", value: "Other" },
          ],
          colSpan: 2,
        },
        { type: "text", name: "softNote", label: "mcap.cr.accounting.fields.softNote.label", colSpan: 2 },
      ],
    },
    {
      id: "payment",
      title: "mcap.common.steps.payment",
      widget: "PaymentWidget",
      supportedCurrencies: ["USD", "HKD"],
      computeFees: (data) => {
        const items: McapFeeItem[] = [
          { id: "base", label: "mcap.cr.services.items.base.label", amount: CR_PRICES.base, kind: "service" as const },
        ];
        if (data.directorNominee) {
          items.push({ id: "directorNominee", label: "mcap.cr.services.items.directorNominee.label", amount: CR_PRICES.nominee, kind: "optional" as const });
        }
        if (data.shareholderNominee) {
          items.push({ id: "shareholderNominee", label: "mcap.cr.services.items.shareholderNominee.label", amount: CR_PRICES.nominee, kind: "optional" as const });
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
