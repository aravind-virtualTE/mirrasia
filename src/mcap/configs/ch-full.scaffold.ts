/* eslint-disable @typescript-eslint/no-explicit-any */
import type { McapConfig } from "./types";

// Draft scaffold only: do not register in MCAP_CONFIGS yet.
// This file is intentionally kept modular so AG requirements can be finalized from user feedback.
export const CH_AG_SCAFFOLD_PRICING = {
  incorporation_and_maintenance_1y: 8500,
  local_directors_2_1y: 18000,
  capital_and_bank_opening: 2500,
  registered_office_pobox_1y: 3000,
  registered_office_flexidesk_1y: 6800,
  // TODO: finalize quote services once pricing is confirmed.
  annual_accounting_tax_quote: null as number | null,
  emi_account_opening_quote: null as number | null,
  legal_opinion_swiss_quote: null as number | null,
  legal_opinion_exchange_quote: null as number | null,
  consulting_quote: null as number | null,
} as const;

export const CH_FULL_SCAFFOLD: McapConfig = {
  id: "ch-full-scaffold",
  countryCode: "CH",
  countryName: "Switzerland (AG Scaffold)",
  currency: "USD",
  title: "Swiss Corporation Establishment (Scaffold)",
  confirmationDetails: {
    title: "Scaffold Only",
    message:
      "This is a placeholder scaffold for CH AG and is not registered in runtime registry yet.",
    steps: [
      {
        title: "Scaffold Placeholder",
        description: "Complete country-specific workflow and pricing before enabling.",
      },
    ],
  },
  steps: [
    {
      id: "applicant",
      title: "Applicant Information",
      fields: [
        { type: "text", name: "applicantName", label: "Name of Author", required: true, colSpan: 2 },
        { type: "email", name: "applicantEmail", label: "Applicant Email", required: true, colSpan: 2 },
      ],
    },
    {
      id: "compliance",
      title: "AML / CDD",
      fields: [
        {
          type: "radio-group",
          name: "legalAndEthicalConcern",
          label: "Legal and ethical concern declaration",
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
      title: "Company Information",
      fields: [
        {
          type: "info",
          label: "AG Scaffold Note",
          content:
            "TODO: Finalize CH AG registration details, sanctions conditions, and service questions.",
          colSpan: 2,
        },
      ],
    },
    {
      id: "parties",
      title: "Parties",
      widget: "PartiesManager",
      minParties: 1,
      requireDcp: true,
      requirePartyInvite: true,
    },
    {
      id: "accounting",
      title: "Accounting and Taxation",
      fields: [
        {
          type: "textarea",
          name: "accountingNotes",
          label: "TODO: Define accounting and reporting collection fields",
          colSpan: 2,
        },
      ],
    },
    {
      id: "services",
      title: "Service Customization",
      widget: "ServiceSelectionWidget",
      serviceItems: () => [
        {
          id: "ch_ag_base",
          label: "Swiss Incorporation + 1 year maintenance",
          amount: CH_AG_SCAFFOLD_PRICING.incorporation_and_maintenance_1y,
          original: CH_AG_SCAFFOLD_PRICING.incorporation_and_maintenance_1y,
          mandatory: true,
          info: "Scaffold value from initial briefing.",
        },
        {
          id: "ch_ag_local_directors",
          label: "Registering 2 local directors (1 year)",
          amount: CH_AG_SCAFFOLD_PRICING.local_directors_2_1y,
          original: CH_AG_SCAFFOLD_PRICING.local_directors_2_1y,
          mandatory: false,
          info: "Scaffold value from initial briefing.",
        },
      ],
      fields: [
        {
          type: "info",
          label: "TODO",
          content:
            "TODO: Replace scaffold pricing toggles and quote placeholders with finalized CH AG requirements.",
          colSpan: 2,
        },
      ],
    },
    {
      id: "invoice",
      title: "Invoice Preview",
      widget: "InvoiceWidget",
      computeFees: () => ({
        currency: "USD",
        items: [
          {
            id: "ch_ag_base",
            label: "Swiss Incorporation + 1 year maintenance",
            amount: CH_AG_SCAFFOLD_PRICING.incorporation_and_maintenance_1y,
            kind: "service",
          },
        ],
        government: 0,
        service: CH_AG_SCAFFOLD_PRICING.incorporation_and_maintenance_1y,
        total: CH_AG_SCAFFOLD_PRICING.incorporation_and_maintenance_1y,
        note: "Scaffold computeFees. TODO: replace with finalized AG pricing logic.",
      }),
    },
    {
      id: "payment",
      title: "Payment Processing",
      widget: "PaymentWidget",
      supportedCurrencies: ["USD", "HKD"],
      computeFees: () => ({
        currency: "USD",
        items: [
          {
            id: "ch_ag_base",
            label: "Swiss Incorporation + 1 year maintenance",
            amount: CH_AG_SCAFFOLD_PRICING.incorporation_and_maintenance_1y,
            kind: "service",
          },
        ],
        government: 0,
        service: CH_AG_SCAFFOLD_PRICING.incorporation_and_maintenance_1y,
        total: CH_AG_SCAFFOLD_PRICING.incorporation_and_maintenance_1y,
        note: "Scaffold computeFees. TODO: replace with finalized AG pricing logic.",
      }),
    },
    {
      id: "review",
      title: "Review and Declaration",
      fields: [
        {
          type: "checkbox",
          name: "truthfulnessDeclaration",
          label: "I confirm submitted information is accurate.",
          required: true,
          colSpan: 2,
        },
        {
          type: "text",
          name: "eSign",
          label: "Electronic signature",
          required: true,
          colSpan: 2,
        },
      ],
    },
  ],
};
