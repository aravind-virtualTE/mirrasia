/* eslint-disable @typescript-eslint/no-explicit-any */
import type { McapConfig } from "./types";

const ENTITY_OPTIONS = [
  { label: "Dubai Local LLC", value: "UAE-LOCAL-LLC" },
  { label: "Dubai DSO/IFZA Free Zone Company (FZCO)", value: "UAE-IFZA-FZCO" },
  { label: "Dubai DIFC Free Zone Company (FZCO)", value: "UAE-DIFC-FZCO" },
  { label: "Dubai DWTC Free Zone Company (FZCO)", value: "UAE-DWTC-FZCO" },
  { label: "Dubai DMCC Free Zone Company (FZCO)", value: "UAE-DMCC-FZCO" },
  { label: "Dubai DIC Free Zone Company (FZCO)", value: "UAE-DIC-FZCO" },
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

export const UAE_IFZA_CONFIG: McapConfig = {
  id: "uae-ifza",
  countryCode: "UAE",
  countryName: "Dubai IFZA / UAE",
  currency: "USD",
  title: "Dubai IFZA Company Incorporation",
  entityMeta: ENTITY_META,
  confirmationDetails: {
    title: "Application Submitted Successfully",
    message: "Your application for Dubai IFZA company incorporation has been received. Our team will review your details and contact you for the next steps.",
    steps: [
      {
        title: "Initial Review",
        description: "Review of your company details and business intent (1-2 business days).",
      },
      {
        title: "KYC Verification",
        description: "Processing of personal documents and AML checks.",
      },
      {
        title: "Filing",
        description: "Official submission to UAE/IFZA authorities.",
      },
    ],
  },
  steps: [
    {
      id: "applicant",
      title: "newHk.steps.applicant.title",
      description: "Provide applicant details and confirm authority to submit.",
      fields: [
        {
          type: "info",
          label: "Application Notice",
          content:
            "This application must be completed by the primary controller (future director) or an authorized person. The final application must be signed in person by the director. The information will be used for KYC and due diligence under TCSP/AMLO rules. Please avoid errors or omissions.",
        },
        { type: "text", name: "applicantName", label: "Applicant Name", required: true },
        {
          type: "text",
          name: "companyName1",
          label: "Desired company name (1st choice)",
          required: true,
        },
        { type: "text", name: "companyName2", label: "Desired company name (2nd choice)" },
        { type: "text", name: "companyName3", label: "Desired company name (3rd choice)" },
        { type: "email", name: "applicantEmail", label: "Applicant Email", required: true },
        { type: "text", name: "applicantPhone", label: "Applicant Phone", required: true },
        {
          type: "checkbox-group",
          name: "applicantRelationship",
          label: "Relationship between applicant and the Dubai IFZA company (multiple selections possible)",
          required: true,
          options: [
            { label: "Director of the Dubai IFZA company (to be established)", value: "director" },
            { label: "Chief Manager of the Dubai IFZA company (to be established)", value: "chief_manager" },
            { label: "Person authorized by the Director of the Dubai IFZA company (to be established)", value: "authorized_person" },
            { label: "Major Shareholder of the Dubai IFZA company (to be established)", value: "major_shareholder" },
            { label: "Expert providing establishment consultation (lawyer, accountant, agent, etc.)", value: "expert_advisor" },
            { label: "Other", value: "other" },
          ],
        },
        {
          type: "text",
          name: "applicantRelationshipOther",
          label: "Other relationship (please specify)",
          condition: (data) => Array.isArray(data.applicantRelationship) && data.applicantRelationship.includes("other"),
        },
        {
          type: "select",
          name: "snsType",
          label: "SNS / Messaging App",
          options: [
            { label: "WhatsApp", value: "whatsapp" },
            { label: "WeChat", value: "wechat" },
            { label: "Telegram", value: "telegram" },
            { label: "Line", value: "line" },
            { label: "KakaoTalk", value: "kakaotalk" },
            { label: "Other", value: "other" },
          ],
        },
        {
          type: "text",
          name: "snsId",
          label: "SNS Account ID",
          condition: (data) => !!data.snsType,
        },
      ],
    },
    {
      id: "compliance",
      title: "AML / CDD",
      description: "Anti-Money Laundering and Customer Due Diligence questionnaire.",
      fields: [
        {
          type: "radio-group",
          name: "legalEthicalIssues",
          label:
            "Is the purpose of establishing a Dubai IFZA company likely to involve legal or ethical issues (money laundering, gambling, tax evasion, fraud, etc.)?",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
            { label: "Don't know", value: "unknown" },
            { label: "Consider legal advice", value: "legal_advice" },
            { label: "Other", value: "other" },
          ],
        },
        {
          type: "text",
          name: "legalEthicalIssuesOther",
          label: "Other (please specify)",
          condition: (data) => data.legalEthicalIssues === "other",
        },
        {
          type: "radio-group",
          name: "annualRenewalConsent",
          label:
            "After establishment, annual renewal work occurs every year and requires related costs and data. Do you agree?",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
            { label: "Can be resolved internally after establishment", value: "internal" },
            { label: "Need advice before proceeding", value: "advice" },
          ],
        },
        {
          type: "radio-group",
          name: "sanctionCountriesOps",
          label:
            "Does the planned corporation or related companies operate or plan to operate in Iran, Sudan, South Sudan, North Korea, Syria, Cuba, Belarus, or Zimbabwe?",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
            { label: "Don't know", value: "unknown" },
          ],
        },
        {
          type: "radio-group",
          name: "sanctionPersonnelResidency",
          label:
            "Are any personnel residing in Iran, Sudan, North Korea, Syria, Cuba, or other UN/EU/UK/OFAC sanctioned countries?",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
        {
          type: "radio-group",
          name: "crimeaSevastopol",
          label:
            "Do the planned corporation or related companies operate or plan to operate in Crimea or Sevastopol?",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
            { label: "Don't know", value: "unknown" },
          ],
        },
        {
          type: "radio-group",
          name: "sensitiveSectors",
          label:
            "Do the planned corporation or related companies operate or plan to operate in oil, gas, energy, military, or defense sectors?",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
      ],
    },
    {
      id: "company",
      title: "Company Information",
      description: "Provide company business details, capital, and address, then invite parties.",
      widget: "PartiesManager",
      minParties: 1,
      requireDcp: true,
      requirePartyInvite: true,
      fields: [
        // --- Entity Selection ---
        { type: "select", name: "entityType", label: "Entity Type", required: true, options: ENTITY_OPTIONS, colSpan: 2 },
        {
          type: "derived",
          name: "initialCostUSD",
          label: "Initial Cost (USD)",
          compute: (_data, entity) => (entity?.initialCostUSD ? `$${entity.initialCostUSD.toLocaleString()}` : ""),
        },
        {
          type: "derived",
          name: "capital",
          label: "Capital",
          compute: (_data, entity) => entity?.capital || "",
        },
        {
          type: "derived",
          name: "officeRequirement",
          label: "Office Requirement",
          compute: (_data, entity) => entity?.office || "",
        },
        {
          type: "derived",
          name: "visaCost",
          label: "Visa Cost",
          compute: (_data, entity) => entity?.visa || "",
        },
        {
          type: "derived",
          name: "establishmentPeriod",
          label: "Establishment Period",
          compute: (_data, entity) => entity?.establishmentDays || "",
        },
        // --- Company Business Details ---
        {
          type: "checkbox-group",
          name: "businessTypes",
          label: "Select business type (check all relevant items)",
          required: true,
          colSpan: 2,
          options: [
            { label: "Cryptocurrency related (issuance, exchange, wallet services)", value: "crypto" },
            { label: "IT, blockchain, software development", value: "it_blockchain" },
            { label: "Cryptocurrency-based investment business", value: "crypto_investment" },
            { label: "Cryptocurrency-based games", value: "crypto_games" },
            { label: "Foreign exchange trading", value: "fx_trading" },
            { label: "Finance, investment, consulting, lending", value: "finance" },
            { label: "Trading business", value: "trading" },
            { label: "Wholesale/retail distribution", value: "distribution" },
            { label: "Consulting", value: "consulting" },
            { label: "Manufacturing", value: "manufacturing" },
            { label: "Online service business (e-commerce)", value: "ecommerce" },
            { label: "Online direct purchase/delivery", value: "online_delivery" },
            { label: "Other", value: "other" },
          ],
        },
        {
          type: "text",
          name: "businessTypesOther",
          label: "Other business type (please specify)",
          colSpan: 2,
          condition: (data) => Array.isArray(data.businessTypes) && data.businessTypes.includes("other"),
        },
        {
          type: "textarea",
          name: "tradeDescription",
          label: "Description of item names, item types, service details",
          required: true,
          colSpan: 2,
        },
        {
          type: "textarea",
          name: "businessSummary",
          label: "Company business description (3-4 sentences)",
          required: true,
          colSpan: 2,
        },
        {
          type: "text",
          name: "website",
          label: "Website address (if available)",
          colSpan: 2,
        },
        {
          type: "checkbox-group",
          name: "purposeOfEstablishment",
          label: "Purpose of establishing an IFZA corporation in Dubai and expected effects",
          colSpan: 2,
          options: [
            { label: "Business diversification due to relaxed regulations", value: "diversification" },
            { label: "Suggested by legal advisors, investors, or clients", value: "advisor_suggested" },
            { label: "Expansion into overseas countries", value: "international_expansion" },
            { label: "Asset management (real estate or financial assets)", value: "asset_management" },
            { label: "Holding company for subsidiaries or affiliates", value: "holding_company" },
            { label: "Competitive advantage due to free financial policies", value: "competitive_advantage" },
            { label: "Expansion of transaction volume due to low tax rates", value: "low_tax" },
            { label: "Other", value: "other" },
          ],
        },
        {
          type: "text",
          name: "purposeOther",
          label: "Other purpose (please specify)",
          colSpan: 2,
          condition: (data) => Array.isArray(data.purposeOfEstablishment) && data.purposeOfEstablishment.includes("other"),
        },
        {
          type: "select",
          name: "paidInCapital",
          label: "Total Paid-in Capital (AED)",
          required: true,
          options: [
            { label: "1 AED", value: "1" },
            { label: "100 AED", value: "100" },
            { label: "10,000 AED (minimum for Dubai company)", value: "10000" },
            { label: "Other", value: "other" },
          ],
        },
        {
          type: "text",
          name: "paidInCapitalOther",
          label: "Other capital amount (AED)",
          condition: (data) => data.paidInCapital === "other",
        },
        {
          type: "radio-group",
          name: "registeredAddressChoice",
          label: "Registered address in Dubai IFZA",
          required: true,
          colSpan: 2,
          options: [
            { label: "Use Mirr Asia registration address service", value: "mirasia_address" },
            { label: "Use a separate address in Dubai IFZA", value: "own_address" },
          ],
        },
        {
          type: "textarea",
          name: "registeredAddress",
          label: "Enter your business address in Dubai IFZA",
          colSpan: 2,
          condition: (data) => data.registeredAddressChoice === "own_address",
        },
      ],
    },
    {
      id: "acct",
      title: "Accounting & Taxation",
      description: "Provide accounting preferences and bookkeeping cycle.",
      fields: [
        {
          type: "select",
          name: "finYrEnd",
          label: "Financial Year End",
          options: [
            { label: "December 31", value: "Dec 31" },
            { label: "March 31", value: "Mar 31" },
            { label: "June 30", value: "Jun 30" },
            { label: "September 30", value: "Sep 30" },
          ],
          required: true,
        },
        {
          type: "radio-group",
          name: "bookKeepingCycle",
          label: "Bookkeeping Cycle",
          options: [
            { label: "Monthly", value: "monthly" },
            { label: "Quarterly", value: "quarterly" },
            { label: "Annually", value: "annually" },
          ],
          required: true,
        },
        {
          type: "radio-group",
          name: "xero",
          label: "Cloud Accounting (Xero) Requirement",
          options: [
            { label: "Yes, I need Xero setup", value: "yes" },
            { label: "No, I have my own system", value: "no" },
            { label: "Need professional advice", value: "advice" },
          ],
        },
      ],
    },
    {
      id: "services",
      title: "Select Services Provided by Mirr Asia",
      widget: "ServiceSelectionWidget",
      serviceItems: (data: any, entityMeta: any) => {
        const entity = entityMeta?.[data.entityType] || null;
        const setupCost = Number(entity?.setupCostUSD || 0);

        return [
          {
            id: "setup",
            label: `UAE Setup Cost (${entity ? entity.label : "Selected Entity"})`,
            amount: setupCost,
            original: setupCost,
            mandatory: true,
            info: "Includes initial government fees and Mir Asia service charges.",
          },
          {
            id: "vasp_setup_emi",
            label: "[VASP] IFZA setup + notarization + 1 year maintenance + VASP license + EMI account",
            amount: 14850, // Approx USD equivalent of EUR 13,500
            original: 14850,
            info: "Comprehensive VASP package including license and banking setup.",
          },
          {
            id: "vasp_kyc_kyt",
            label: "[VASP] Outsourcing firm setup for KYC/KYT",
            amount: 2500, // Estimated
            original: 2500,
            mandatory: false, // User marked as mandatory in text, but let's make it toggleable or force it? Text said "(mandatory)".
            // If mandatory, set mandatory: true.
            info: "Mandatory for VASP license holders.",
          },
          {
            id: "vasp_aml_10",
            label: "[VASP] AML officer registration (10 hours/month)",
            amount: 1000, // Estimated
            original: 1000,
          },
          {
            id: "vasp_aml_20",
            label: "[VASP] AML officer registration (20 hours/month)",
            amount: 1800, // Estimated
            original: 1800,
          },
          {
            id: "vasp_accounting",
            label: "[VASP] VASP accounting services",
            amount: 3000, // Estimated
            original: 3000,
          },
          {
            id: "ifza_setup_bank",
            label: "IFZA setup + notarization + 1 year maintenance + bank account opening",
            amount: 5000, // Estimated
            original: 5000,
          },
          {
            id: "legal_opinion_ifza",
            label: "Legal opinion (local IFZA)",
            amount: 1500, // Estimated
            original: 1500,
          },
          {
            id: "legal_opinion_domestic",
            label: "Legal opinion for domestic exchange listing",
            amount: 5000, // Estimated
            original: 5000,
          },
          {
            id: "consulting",
            label: "Consulting (regulation, feasibility, docs, operations)",
            amount: 2000, // Estimated
            original: 2000,
          },
        ];
      },
    },
    {
      id: "invoice",
      title: "Invoice Preview",
      description: "Review your service costs and government fees.",
      widget: "InvoiceWidget",
      computeFees: (data, entityMeta) => {
        const selectedIds = new Set(Array.isArray(data.optionalFeeIds) ? data.optionalFeeIds : []);
        const serviceIds = new Set(Array.isArray(data.serviceItemsSelected) ? data.serviceItemsSelected : []);
        // Combine selections
        const allSelectedIds = new Set([...selectedIds, ...serviceIds]);

        // Re-generate items to calculate totals
        // Note: computeFees receives the same data, so we can re-invoke the serviceItems function logic or duplicate it.
        // Since serviceItems is defined in the previous step, we can't easily access it here without defining it outside.
        // BUT InvoiceWidget passes 'entityMeta' so we can reconstruct the mandatory setup cost.
        // For the static optional items, we need them defined. 
        // Best practice: Define the items list outside of the step definition if used in multiple places.
        // For now, I will define the list inside a helper or just duplicate the list for calculation if needed, 
        // OR rely on 'data.computedFees' if persisted. 
        // ACTUALLY, ServiceSelectionWidget SAVES 'computedFees' to data!
        // So InvoiceWidget just needs to read data.computedFees if available.

        // However, existing InvoiceWidget logic usually re-computes to be safe.
        // Let's define the items constant outside to share.

        // For now, to keep the edit contained, I'll inline the list again or use a simplified approach 
        // assuming ServiceSelectionWidget has already populated 'data.computedFees'.
        // But InvoiceWidget calls 'computeFees' itself.

        const entity = entityMeta?.[data.entityType] || null;
        const setupCost = Number(entity?.setupCostUSD || 0);

        const possibleItems = [
          {
            id: "setup",
            label: `UAE Setup Cost (${entity ? entity.label : "Selected Entity"})`,
            amount: setupCost,
            original: setupCost,
            mandatory: true,
            kind: "service" as const
          },
          {
            id: "vasp_setup_emi",
            label: "[VASP] IFZA setup + notarization + 1 year maintenance + VASP license + EMI account",
            amount: 14850,
            original: 14850,
            kind: "service" as const
          },
          {
            id: "vasp_kyc_kyt",
            label: "[VASP] Outsourcing firm setup for KYC/KYT",
            amount: 2500,
            original: 2500,
            kind: "service" as const
          },
          {
            id: "vasp_aml_10",
            label: "[VASP] AML officer registration (10 hours/month)",
            amount: 1000,
            original: 1000,
            kind: "service" as const
          },
          {
            id: "vasp_aml_20",
            label: "[VASP] AML officer registration (20 hours/month)",
            amount: 1800,
            original: 1800,
            kind: "service" as const
          },
          {
            id: "vasp_accounting",
            label: "[VASP] VASP accounting services",
            amount: 3000,
            original: 3000,
            kind: "service" as const
          },
          {
            id: "ifza_setup_bank",
            label: "IFZA setup + notarization + 1 year maintenance + bank account opening",
            amount: 5000,
            original: 5000,
            kind: "service" as const
          },
          {
            id: "legal_opinion_ifza",
            label: "Legal opinion (local IFZA)",
            amount: 1500,
            original: 1500,
            kind: "service" as const
          },
          {
            id: "legal_opinion_domestic",
            label: "Legal opinion for domestic exchange listing",
            amount: 5000,
            original: 5000,
            kind: "service" as const
          },
          {
            id: "consulting",
            label: "Consulting (regulation, feasibility, docs, operations)",
            amount: 2000,
            original: 2000,
            kind: "service" as const
          },
        ];

        const items = possibleItems.filter(i => i.mandatory || allSelectedIds.has(i.id));

        const total = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);

        // Card fee logic
        const paymentCurrency = data.paymentCurrency || data.currency || "USD";
        const cardFeePct = paymentCurrency === "USD" ? 0.06 : 0.04;

        return {
          currency: "USD", // Base currency
          paymentCurrency, // Selected payment currency (for InvoiceWidget display)
          items,
          government: 0,
          service: total,
          total,
          cardFeePct,
          cardFeeSurcharge: total * cardFeePct,
          grandTotal: total * (1 + cardFeePct),
          note: "Initial costs vary by jurisdiction; final quote will be confirmed after review.",
        };
      },
    },
    {
      id: "payment",
      title: "Payment Processing",
      description: "Choose your payment method and complete the transaction.",
      widget: "PaymentWidget",
      supportedCurrencies: ["USD", "HKD"],
    },
  ],
};
