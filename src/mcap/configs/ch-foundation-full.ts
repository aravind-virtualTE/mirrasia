/* eslint-disable @typescript-eslint/no-explicit-any */
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
      label: "Swiss Foundation Establishment",
      amount: CH_FOUNDATION_PRICING.foundation_setup,
      original: CH_FOUNDATION_PRICING.foundation_setup,
      mandatory: true,
      kind: "service",
      info: "All establishment-related costs included.",
    },
  ];

  if (boardServiceMode === "mirr_provided") {
    items.push({
      id: "chf_local_board_member_1y",
      label: "Local Board Member Service (1 year)",
      amount: CH_FOUNDATION_PRICING.local_board_member_1y,
      original: CH_FOUNDATION_PRICING.local_board_member_1y,
      mandatory: true,
      kind: "service",
      info: "Swiss foundation must appoint at least one board member residing in Switzerland.",
    });
  }

  if (registeredOfficeMode === "pobox") {
    items.push({
      id: "chf_registered_office_pobox_1y",
      label: "Registered Office - PO Box (1 year)",
      amount: CH_FOUNDATION_PRICING.registered_office_pobox_1y,
      original: CH_FOUNDATION_PRICING.registered_office_pobox_1y,
      mandatory: true,
      kind: "service",
      info: "Annual Swiss PO Box address service.",
    });
  } else if (registeredOfficeMode === "flexidesk") {
    items.push({
      id: "chf_registered_office_flexidesk_1y",
      label: "Registered Office - Flexi Desk (1 year)",
      amount: CH_FOUNDATION_PRICING.registered_office_flexidesk_1y,
      original: CH_FOUNDATION_PRICING.registered_office_flexidesk_1y,
      mandatory: true,
      kind: "service",
      info: "Includes lease agreement, meeting room access, and Swiss phone number.",
    });
  }

  if (bankOpeningMode === "mirr_opening") {
    items.push({
      id: "chf_bank_opening_capital_operating",
      label: "Swiss Bank Account Opening (Capital + Operating)",
      amount: CH_FOUNDATION_PRICING.bank_opening_capital_operating,
      original: CH_FOUNDATION_PRICING.bank_opening_capital_operating,
      mandatory: true,
      kind: "service",
      info: "Non-face-to-face account opening support.",
    });
  }

  items.push(
    {
      id: "chf_accounting_tax_annual",
      label: "Accounting and Tax Services (Annual, up to 300 transactions)",
      amount: CH_FOUNDATION_PRICING.accounting_tax_annual,
      original: CH_FOUNDATION_PRICING.accounting_tax_annual,
      mandatory: false,
      kind: "optional",
      info: "Includes bookkeeping, AHV/SUVA/VAT registration, VAT returns, annual statements, and tax returns.",
    },
    {
      id: "chf_annual_foundation_report_estimated",
      label: "Annual Foundation Report Preparation and Submission (Estimated)",
      amount: CH_FOUNDATION_PRICING.annual_foundation_report_estimated,
      original: CH_FOUNDATION_PRICING.annual_foundation_report_estimated,
      mandatory: false,
      kind: "optional",
      estimated: true,
      info: "Estimated amount and can be adjusted after compliance review.",
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
    note: "Capital requirements are collected for compliance and are excluded from invoice totals.",
  };
};

export const CH_FOUNDATION_FULL_CONFIG: McapConfig = {
  id: "ch-foundation-full",
  countryCode: "CH_FOUNDATION",
  countryName: "Switzerland Foundation",
  currency: "USD",
  title: "Swiss Foundation Establishment",
  confirmationDetails: {
    title: "Swiss Foundation Application Submitted",
    message:
      "We have received your Swiss foundation establishment request. Our team will validate compliance details and proceed with the filing workflow.",
    steps: [
      {
        title: "Compliance Review",
        description: "KYC/CDD and sanctions checks are completed before filing.",
      },
      {
        title: "Foundation Filing Preparation",
        description: "Drafting and execution package is prepared for supervisory and registry submissions.",
      },
      {
        title: "Registration and Tax Setup",
        description: "Commercial registry filing and tax authority registration are completed.",
      },
      {
        title: "Post-filing Services",
        description: "Board, office, accounting, and reporting support is coordinated based on your selections.",
      },
    ],
  },
  steps: [
    {
      id: "applicant",
      title: "Applicant Information",
      description: "Must be completed by the director or an authorized delegate.",
      fields: [
        {
          type: "text",
          name: "applicantName",
          label: "Name of Author",
          required: true,
          colSpan: 2,
        },
        {
          type: "checkbox-group",
          name: "authorRelationship",
          label: "Relationship to the Swiss foundation",
          required: true,
          options: [
            { label: "Director of the Swiss foundation", value: "director" },
            { label: "Person delegated by the director", value: "delegate" },
            { label: "Direct or indirect shareholder / contributor", value: "shareholder" },
            { label: "Expert (lawyer, accountant, etc.)", value: "expert" },
            { label: "Other", value: "other" },
          ],
          colSpan: 2,
        },
        {
          type: "text",
          name: "authorRelationshipOther",
          label: "Other relationship details",
          condition: (f) => Array.isArray(f.authorRelationship) && f.authorRelationship.includes("other"),
          colSpan: 2,
        },
        {
          type: "email",
          name: "applicantEmail",
          label: "Applicant Email",
          required: true,
          colSpan: 2,
        },
        {
          type: "text",
          name: "applicantPhone",
          label: "Applicant Phone",
          required: true,
          colSpan: 2,
        },
        {
          type: "text",
          name: "authorContactInfo",
          label: "Additional Contact Information (SNS ID, etc.)",
          required: true,
          colSpan: 2,
        },
      ],
    },
    {
      id: "compliance",
      title: "AML / CDD",
      description: "Business intentions, sanctions, and compliance declarations.",
      fields: [
        {
          type: "radio-group",
          name: "legalAndEthicalConcern",
          label:
            "Does the purpose raise legal/ethical issues (money laundering, gambling, tax evasion, etc.)?",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
            { label: "I don't know", value: "unknown" },
            { label: "Consider legal advice", value: "legal_advice" },
          ],
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "annualRenewalConsent",
          label: "Do you agree to annual renewals and associated fixed costs?",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
            { label: "Can be resolved internally", value: "internal_resolution" },
            { label: "No intention if fixed costs incur", value: "no_if_fixed_cost" },
            { label: "Advice required", value: "advice_required" },
          ],
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "sanctionedCountriesBusiness",
          label: "Do you conduct business in sanctioned countries or regions?",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
            { label: "I don't know", value: "unknown" },
          ],
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "sanctionedPersonsInvolved",
          label: "Are any involved persons residing in sanctioned regions?",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
            { label: "I don't know", value: "unknown" },
          ],
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "restrictedSectors",
          label: "Are you engaged in oil, gas, military, or defense sectors?",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
            { label: "I don't know", value: "unknown" },
          ],
          colSpan: 2,
        },
      ],
    },
    {
      id: "company",
      title: "Business and Foundation Information",
      description: "Business profile, registration details, and capital requirement acknowledgements.",
      fields: [
        {
          type: "text",
          name: "companyName1",
          label: "Desired Foundation Name (1st choice)",
          required: true,
          colSpan: 2,
        },
        {
          type: "text",
          name: "companyName2",
          label: "Desired Foundation Name (2nd choice)",
          required: true,
          colSpan: 2,
        },
        {
          type: "checkbox-group",
          name: "industrySelection",
          label: "Select Industry",
          required: true,
          options: [
            { label: "Cryptocurrency-related", value: "crypto" },
            { label: "IT/Blockchain Development", value: "it_blockchain" },
            { label: "Finance/Investment", value: "finance_investment" },
            { label: "Trade/Wholesale", value: "trade_wholesale" },
            { label: "Manufacturing", value: "manufacturing" },
            { label: "E-commerce", value: "ecommerce" },
            { label: "Consulting", value: "consulting" },
            { label: "Other", value: "other" },
          ],
          colSpan: 2,
        },
        {
          type: "text",
          name: "industrySelectionOther",
          label: "Other Industry Details",
          condition: (f) => Array.isArray(f.industrySelection) && f.industrySelection.includes("other"),
          colSpan: 2,
        },
        {
          type: "textarea",
          name: "productServiceDescription",
          label: "Description of product/service to be traded",
          required: true,
          rows: 3,
          colSpan: 2,
        },
        {
          type: "textarea",
          name: "businessSummary",
          label: "Describe business in 3-4 sentences",
          required: true,
          rows: 4,
          colSpan: 2,
        },
        {
          type: "text",
          name: "websiteUrl",
          label: "Website address",
          colSpan: 2,
        },
        // {
        //   type: "radio-group",
        //   name: "directorComposition",
        //   label: "Composition of Directors",
        //   required: true,
        //   options: [
        //     { label: "2 Swiss residents + 1 non-Swiss resident", value: "2_local_1_foreign" },
        //     { label: "Other", value: "other" },
        //   ],
        //   colSpan: 2,
        // },
        // {
        //   type: "text",
        //   name: "directorCompositionOther",
        //   label: "Other Director Composition Details",
        //   condition: (f) => f.directorComposition === "other",
        //   colSpan: 2,
        // },
        {
          type: "radio-group",
          name: "capitalRequirementChoice",
          label: "Foundation paid-in capital requirement",
          required: true,
          options: [
            { label: "CHF 50,000 minimum acknowledged", value: "acknowledged" },
            { label: "Other arrangement (explain)", value: "other" },
          ],
          colSpan: 2,
        },
        {
          type: "textarea",
          name: "capitalRequirementOther",
          label: "Capital Requirement Clarification",
          required: true,
          condition: (f) => f.capitalRequirementChoice === "other",
          rows: 3,
          colSpan: 2,
        },
        {
          type: "checkbox",
          name: "capitalRequirementAcknowledged",
          label:
            "I understand that capital requirements are compliance requirements and are excluded from invoice/payment totals.",
          required: true,
          colSpan: 2,
        },
      ],
    },
    {
      id: "parties",
      title: "Parties and Board Members",
      description: "Invite all required parties and assign a designated contact person.",
      widget: "PartiesManager",
      minParties: 1,
      requireDcp: true,
      requirePartyInvite: true,
    },
    {
      id: "accounting",
      title: "Accounting and Taxation Preferences",
      fields: [
        {
          type: "select",
          name: "finYrEnd",
          label: "Financial Year End",
          options: [
            { label: "December 31", value: "December 31" },
            { label: "March 31", value: "March 31" },
            { label: "June 30", value: "June 30" },
            { label: "September 30", value: "September 30" },
          ],
        },
        {
          type: "select",
          name: "expectedAnnualTransactions",
          label: "Expected annual transaction volume",
          options: [
            { label: "Up to 300", value: "up_to_300" },
            { label: "301 - 1000", value: "301_1000" },
            { label: "More than 1000", value: "1000_plus" },
          ],
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "vatRegistrationNeed",
          label: "Do you need VAT registration support?",
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
            { label: "Need advice", value: "advice" },
          ],
          colSpan: 2,
        },
        {
          type: "textarea",
          name: "accountingOperationalNotes",
          label: "Accounting / Tax Operational Notes",
          rows: 3,
          colSpan: 2,
        },
      ],
    },
    {
      id: "services",
      title: "Service Customization",
      description:
        "Default package includes local board support, PO Box registered office, and bank account opening assistance. You can adjust based on your setup.",
      widget: "ServiceSelectionWidget",
      fields: [
        {
          type: "select",
          name: "boardServiceMode",
          label: "Local Board Member Service",
          required: true,
          defaultValue: "mirr_provided",
          options: [
            { label: "Use Mirr Asia local board member service", value: "mirr_provided" },
            { label: "Client will arrange own compliant local board", value: "client_provided" },
          ],
        },
        {
          type: "select",
          name: "registeredOfficeMode",
          label: "Registered Office Service",
          required: true,
          defaultValue: "pobox",
          options: [
            { label: "PO Box (USD 3,000/year)", value: "pobox" },
            { label: "Flexi Desk (USD 6,800/year)", value: "flexidesk" },
            { label: "Client uses own Swiss address", value: "client_address" },
          ],
        },
        {
          type: "textarea",
          name: "clientRegisteredOfficeAddress",
          label: "Client-provided Swiss Registered Office Address",
          required: true,
          condition: (f) => f.registeredOfficeMode === "client_address",
          rows: 3,
          colSpan: 2,
        },
        {
          type: "select",
          name: "bankOpeningMode",
          label: "Swiss Bank Account Opening Service",
          required: true,
          defaultValue: "mirr_opening",
          options: [
            { label: "Use Mirr Asia bank account opening agency", value: "mirr_opening" },
            { label: "Client will arrange bank account opening", value: "self_arranged" },
          ],
        },
      ],
      serviceItems: (data) => buildChFoundationServiceItems(data),
      supportedCurrencies: ["USD", "HKD"],
      computeFees: (data) => computeChFoundationFees(data),
    },
    {
      id: "invoice",
      title: "Invoice Preview",
      description: "Review the final fee breakdown before payment.",
      widget: "InvoiceWidget",
      computeFees: (data) => computeChFoundationFees(data),
    },
    {
      id: "payment",
      title: "Payment Processing",
      description: "Complete card payment or upload bank transfer proof.",
      widget: "PaymentWidget",
      supportedCurrencies: ["USD", "HKD"],
      computeFees: (data) => computeChFoundationFees(data),
    },
    {
      id: "review",
      title: "Review and Declaration",
      fields: [
        {
          type: "info",
          label: "Final Declaration",
          content:
            "I agree that all information provided is true, complete, and submitted for legitimate business purposes.",
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "finalAgreement",
          label: "Do you agree to this declaration?",
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
          label: "I confirm that all provided information is true and accurate.",
          required: true,
          colSpan: 2,
        },
        {
          type: "checkbox",
          name: "compliancePreconditionAcknowledgment",
          label: "I understand service may be suspended if compliance violations are identified.",
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
