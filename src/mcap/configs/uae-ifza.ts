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
  steps: [
    {
      id: "intro",
      title: "Applicant Information",
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
        { type: "text", name: "applicantPhone", label: "Applicant Phone", required: true },
        { type: "email", name: "applicantEmail", label: "Applicant Email", required: true },
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
      id: "entity",
      title: "Entity Selection",
      description: "Choose the Dubai/UAE company type and review setup details.",
      fields: [
        { type: "select", name: "entityType", label: "Entity Type", required: true, options: ENTITY_OPTIONS },
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
      ],
    },
    {
      id: "services",
      title: "Select Services Provided by Mir Asia",
      fields: [
        {
          type: "checkbox-group",
          name: "services",
          label: "Required service items",
          required: true,
          options: [
            {
              label: "[VASP] IFZA setup + notarization + 1 year maintenance + VASP license + EMI account (EUR 13,500)",
              value: "vasp_setup_emi",
            },
            { label: "[VASP] Outsourcing firm setup for KYC/KYT (mandatory)", value: "vasp_kyc_kyt" },
            { label: "[VASP] AML officer registration (10 hours/month)", value: "vasp_aml_10" },
            { label: "[VASP] AML officer registration (20 hours/month)", value: "vasp_aml_20" },
            { label: "[VASP] VASP accounting services", value: "vasp_accounting" },
            {
              label: "IFZA setup + notarization + 1 year maintenance + bank account opening",
              value: "ifza_setup_bank",
            },
            { label: "Legal opinion (local IFZA)", value: "legal_opinion_ifza" },
            { label: "Legal opinion for domestic exchange listing", value: "legal_opinion_domestic" },
            { label: "Legal opinion for other countries", value: "legal_opinion_other" },
            { label: "Consulting (regulation, feasibility, docs, operations)", value: "consulting" },
            { label: "Other", value: "other" },
          ],
        },
        {
          type: "text",
          name: "servicesOther",
          label: "Other service (please specify)",
          condition: (data) => Array.isArray(data.services) && data.services.includes("other"),
        },
      ],
    },
    {
      id: "intent",
      title: "Customer Business Intent Confirmation",
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
      ],
    },
    {
      id: "sanctions",
      title: "Questions on Sanction Targets",
      description:
        "Confirm whether there are transactions with sanctioned countries regulated by FATF/UN/OFAC and other authorities.",
      fields: [
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
      id: "business",
      title: "Business Information",
      fields: [
        {
          type: "checkbox-group",
          name: "businessTypes",
          label: "Select business type (check all relevant items)",
          required: true,
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
          condition: (data) => Array.isArray(data.businessTypes) && data.businessTypes.includes("other"),
        },
        {
          type: "textarea",
          name: "tradeDescription",
          label: "Description of item names, item types, service details",
          required: true,
        },
        {
          type: "textarea",
          name: "businessSummary",
          label: "Company business description (3-4 sentences)",
          required: true,
        },
        {
          type: "text",
          name: "website",
          label: "Website address (if available)",
        },
        {
          type: "checkbox-group",
          name: "purposeOfEstablishment",
          label: "Purpose of establishing an IFZA corporation in Dubai and expected effects",
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
          condition: (data) => Array.isArray(data.purposeOfEstablishment) && data.purposeOfEstablishment.includes("other"),
        },
      ],
    },
    {
      id: "company",
      title: "Company Details",
      fields: [
        {
          type: "text",
          name: "companyName1",
          label: "Desired company name (1st choice)",
          required: true,
        },
        { type: "text", name: "companyName2", label: "Desired company name (2nd choice)" },
        { type: "text", name: "companyName3", label: "Desired company name (3rd choice)" },
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
          type: "select",
          name: "directorComposition",
          label: "Director composition",
          required: true,
          options: [
            { label: "1 individual", value: "1_individual" },
            { label: "2 or more individuals", value: "2_plus_individuals" },
            { label: "Legal entity + individual (representative participates)", value: "entity_plus_individual" },
            { label: "Other", value: "other" },
          ],
        },
        {
          type: "text",
          name: "directorCompositionOther",
          label: "Other composition (please specify)",
          condition: (data) => data.directorComposition === "other",
        },
        {
          type: "radio-group",
          name: "registeredAddressChoice",
          label: "Registered address in Dubai IFZA",
          required: true,
          options: [
            { label: "Use Mirr Asia registration address service", value: "mirasia_address" },
            { label: "Use a separate address in Dubai IFZA", value: "own_address" },
          ],
        },
        {
          type: "textarea",
          name: "registeredAddress",
          label: "Enter your business address in Dubai IFZA",
          condition: (data) => data.registeredAddressChoice === "own_address",
        },
      ],
    },
    {
      id: "composition",
      title: "Shareholders, Directors, and DCP",
      description:
        "Add shareholders/directors and assign at least one Designated Contact Person (DCP).",
      fields: [
        {
          type: "select",
          name: "totalShareholders",
          label: "Total number of shareholders",
          required: true,
          options: [
            { label: "1", value: "1" },
            { label: "2", value: "2" },
            { label: "3", value: "3" },
            { label: "4", value: "4" },
            { label: "5", value: "5" },
          ],
        },
        {
          type: "select",
          name: "totalDirectors",
          label: "Total number of directors",
          required: true,
          options: [
            { label: "1", value: "1" },
            { label: "2", value: "2" },
            { label: "3", value: "3" },
            { label: "4", value: "4" },
            { label: "5", value: "5" },
          ],
        },
        {
          type: "info",
          label: "Use the Parties step to list names, share percentages, and roles.",
          content:
            "Please list each shareholder/director with share percentages and roles. The Designated Contact Person (DCP) must be one of the parties.",
        },
      ],
    },
    {
      id: "parties",
      title: "Parties (Shareholders / Directors / DCP)",
      description: "Invite parties and assign their roles.",
      widget: "PartiesManager",
      minParties: 1,
      requireDcp: true,
    },
    {
      id: "declaration",
      title: "Consent and Declaration",
      fields: [
        {
          type: "checkbox",
          name: "consentDeclaration",
          label:
            "I agree to provide documents and information, confirm lawful purpose, and declare all answers are true and accurate.",
          required: true,
        },
      ],
    },
    {
      id: "fees",
      title: "Setup Cost and Banking",
      fields: [
        {
          type: "info",
          label: "Setup Cost Summary",
          content:
            "Local LLC setup cost: USD 2,500. Free Zone company setup cost: USD 2,000. Final invoices may vary based on selected services and jurisdiction requirements.",
        },
        {
          type: "derived",
          name: "setupCostUSD",
          label: "Estimated Setup Cost (USD)",
          compute: (_data, entity) => (entity?.setupCostUSD ? `$${entity.setupCostUSD.toLocaleString()}` : ""),
        },
        {
          type: "radio-group",
          name: "bankAccountOpening",
          label: "Do you require bank account opening support?",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
            { label: "Not sure", value: "not_sure" },
          ],
        },
        {
          type: "textarea",
          name: "bankAccountNotes",
          label: "Bank account opening conditions / notes",
          placeholder: "Preferred bank/EMI, expected transaction volume, currencies, jurisdictions, etc.",
          condition: (data) => data.bankAccountOpening === "yes" || data.bankAccountOpening === "not_sure",
        },
      ],
    },
    {
      id: "payment",
      title: "Invoice & Payment",
      description: "Review charges and complete payment.",
      widget: "PaymentWidget",
      supportedCurrencies: ["USD", "HKD"],
      computeFees: (data, entityMeta) => {
        const entity = entityMeta?.[data.entityType] || null;
        const setupCost = Number(entity?.setupCostUSD || 0);
        const items = [
          {
            id: "setup",
            label: "UAE setup cost (Mir Asia service)",
            amount: setupCost,
            kind: "service" as const,
          },
        ];
        const total = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        return {
          currency: "USD",
          items,
          government: 0,
          service: total,
          total,
          note: "Initial costs vary by jurisdiction; final quote will be confirmed after review.",
        };
      },
    },
  ],
};
