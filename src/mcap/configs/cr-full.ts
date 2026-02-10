import type { McapConfig, McapFeeItem } from "./types";

const CR_PRICES = {
  base: 4500,
  nominee: 2500,
};

export const CR_FULL_CONFIG: McapConfig = {
  id: "cr-full",
  countryCode: "CR",
  countryName: "Costa Rica",
  currency: "USD",
  title: "Costa Rica Incorporation",
  confirmationDetails: {
    title: "Costa Rica Application Process",
    message: "We have collected your details and your Costa Rica incorporation is now being processed by the National Registry. This typically takes 2-4 business weeks. Our team will contact you if any further information is required.",
    steps: [
      {
        title: "KYC & AML Verification",
        description: "Our compliance team verifies all shareholder and director ID documents.",
      },
      {
        title: "Notary Public Filing",
        description: "Drafting of constitution and filing with the National Registry (Registro Nacional).",
      },
      {
        title: "Registration Approval",
        description: "Waiting for the registry to issue the Corporate ID (Cédula Jurídica).",
      },
      {
        title: "Post-Registration",
        description: "Obtaining tax IDs and finalizing nominee agreements (if selected).",
      },
    ],
  },
  steps: [
    {
      id: "applicant",
      title: "Applicant Details",
      description: "Provide your personal information and company name choices",
      fields: [
        { type: "text", name: "applicantName", label: "Full Name", required: true, colSpan: 2 },
        { type: "email", name: "applicantEmail", label: "Email", required: true, colSpan: 2 },
        { type: "text", name: "applicantPhone", label: "Phone Number", required: true, colSpan: 2 },
        {
          type: "select",
          name: "sns",
          label: "Preferred Messenger",
          options: [
            { label: "WhatsApp", value: "WhatsApp" },
            { label: "WeChat", value: "WeChat" },
            { label: "Line", value: "Line" },
            { label: "KakaoTalk", value: "KakaoTalk" },
            { label: "Telegram", value: "Telegram" },
          ],
        },
        {
          type: "text",
          name: "snsId",
          label: "Messenger ID",
          condition: (f) => !!f.sns,
        },
        { type: "text", name: "address", label: "Place of Residence", required: true, colSpan: 2 },
        { type: "text", name: "companyName1", label: "Company Name (1st Choice)", required: true, colSpan: 2 },
        { type: "text", name: "companyName2", label: "Company Name (2nd Choice)", required: true, colSpan: 2 },
        { type: "text", name: "companyName3", label: "Company Name (3rd Choice)", required: true, colSpan: 2 },
      ],
    },
    {
      id: "compliance",
      title: "AML & Compliance",
      description: "Questions regarding compliance and sanctions",
      fields: [
        {
          type: "radio-group",
          name: "annualRenewalConsent",
          label: "Do you consent to annual compliance renewal and AML/KYC procedures?",
          required: true,
          colSpan: 2,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
        {
          type: "radio-group",
          name: "sanctionsExposureDeclaration",
          label: "Any exposure to sanctioned persons or entities?",
          required: true,
          colSpan: 2,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
            { label: "Don't know", value: "unknown" },
          ],
        },
        {
          type: "radio-group",
          name: "legalAndEthicalConcern",
          label: "Any legal or ethical concerns (money laundering, tax evasion, fraud, etc.)?",
          required: true,
          colSpan: 2,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
            { label: "Don't know", value: "unknown" },
          ],
        },
        {
          type: "radio-group",
          name: "q_country",
          label: "Any current or planned business activity in sanctioned countries/regions?",
          required: true,
          colSpan: 2,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
            { label: "Don't know", value: "unknown" },
          ],
        },
        {
          type: "radio-group",
          name: "crimeaSevastapolPresence",
          label: "Any current or planned business in Crimea/Sevastopol Regions?",
          required: true,
          colSpan: 2,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
            { label: "Don't know", value: "unknown" },
          ],
        },
        {
          type: "radio-group",
          name: "russianEnergyPresence",
          label: "Any exposure to Russia in energy/oil/gas, military, or defense?",
          required: true,
          colSpan: 2,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
            { label: "Don't know", value: "unknown" },
          ],
        },
        {
          type: "radio-group",
          name: "criminalHistory",
          label: "Any history of financial crimes?",
          required: true,
          colSpan: 2,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
            { label: "Don't know", value: "unknown" },
          ],
        },
      ],
    },
    {
      id: "company",
      title: "Company Information",
      description: "Business details, capital, and members",
      fields: [
        {
          type: "checkbox-group",
          name: "selectedIndustry",
          label: "Industry Type",
          required: true,
          colSpan: 2,
          options: [
            { label: "Trade", value: "trade" },
            { label: "Retail/Wholesale Distribution", value: "retail" },
            { label: "Consulting", value: "consulting" },
            { label: "Manufacturing", value: "manufacturing" },
            { label: "Finance/Investment/Advisory", value: "finance" },
            { label: "Online Services (E-commerce)", value: "ecommerce" },
            { label: "Online Direct Purchase/Shipping Proxy", value: "proxy" },
            { label: "IT and Software Development", value: "it" },
            { label: "Cryptocurrency-related", value: "crypto" },
            { label: "Other", value: "other" },
          ],
        },
        {
          type: "textarea",
          name: "productDescription",
          label: "Description of Goods/Services",
          required: true,
          colSpan: 2,
          rows: 3,
        },
        {
          type: "checkbox-group",
          name: "establishmentPurpose",
          label: "Purpose of Establishment",
          required: true,
          colSpan: 2,
          options: [
            { label: "Business expansion into the Americas and Europe", value: "expansion" },
            { label: "Asset management", value: "asset" },
            { label: "Holding company", value: "holding" },
            { label: "Investor suggestion", value: "investor" },
            { label: "International transactions", value: "international" },
            { label: "Business diversification", value: "diversification" },
            { label: "Tax efficiency", value: "tax" },
            { label: "No capital gain tax", value: "capital-gain" },
            { label: "Other", value: "other" },
          ],
        },
        {
          type: "text",
          name: "listCountry",
          label: "Countries for Business Transactions",
          required: true,
          colSpan: 2,
        },
        {
          type: "checkbox-group",
          name: "sourceFunding",
          label: "Source of Funds",
          required: true,
          colSpan: 2,
          options: [
            { label: "Earned income", value: "earned" },
            { label: "Savings", value: "savings" },
            { label: "Investment income", value: "investment" },
            { label: "Loan", value: "loan" },
            { label: "Company sale", value: "sale" },
            { label: "Business income", value: "business" },
            { label: "Inheritance", value: "inheritance" },
            { label: "Other", value: "other" },
          ],
        },
        {
          type: "radio-group",
          name: "businessAddress",
          label: "Registered Business Address",
          required: true,
          colSpan: 2,
          options: [
            { label: "Use MirAsia registration address", value: "mirasia" },
            { label: "Use own address in Costa Rica", value: "own" },
            { label: "Other", value: "other" },
          ],
        },
        {
          type: "text",
          name: "otherBusinessAddress",
          label: "Other Business Address (please specify)",
          condition: (f) => f.businessAddress === "other",
          colSpan: 2,
        },
        {
          type: "select",
          name: "currency",
          label: "Currency",
          required: true,
          options: [
            { label: "USD - US Dollar", value: "USD" },
            { label: "EUR - Euro", value: "EUR" },
            { label: "CRC - Costa Rican Colon", value: "CRC" },
          ],
        },
        {
          type: "select",
          name: "capAmount",
          label: "Capital Amount",
          required: true,
          options: [
            { label: "10,000", value: "10000" },
            { label: "50,000", value: "50000" },
            { label: "100,000", value: "100000" },
            { label: "Other", value: "other" },
          ],
        },
        {
          type: "number",
          name: "capOther",
          label: "Capital Amount (Other)",
          condition: (f) => f.capAmount === "other",
        },
        {
          type: "select",
          name: "shareCount",
          label: "Number of Shares",
          required: true,
          options: [
            { label: "1", value: "1" },
            { label: "10", value: "10" },
            { label: "100", value: "100" },
            { label: "1,000", value: "1000" },
            { label: "10,000", value: "10000" },
            { label: "100,000", value: "100000" },
            { label: "Other", value: "other" },
          ],
        },
        {
          type: "number",
          name: "shareOther",
          label: "Number of Shares (Other)",
          condition: (f) => f.shareCount === "other",
        },
        {
          type: "derived",
          name: "parValue",
          label: "Par Value per Share",
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
      title: "Service Options",
      fields: [
        { type: "checkbox", name: "directorNominee", label: "Nominee Director" },
        { type: "checkbox", name: "shareholderNominee", label: "Nominee Shareholder" },
      ],
    },
    {
      id: "parties",
      title: "Shareholders / Directors / DCP",
      description: "Invite shareholders, directors, and designated contact persons for KYC.",
      widget: "PartiesManager",
      minParties: 1,
      requireDcp: true,
      requirePartyInvite: true,
    },
    {
      id: "accounting",
      title: "Accounting & Taxation",
      fields: [
        {
          type: "textarea",
          name: "accountingAddress",
          label: "Accounting Data Storage Address",
          required: true,
          rows: 3,
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "xero",
          label: "Do you use Xero or other accounting software?",
          options: [
            { label: "Yes", value: "Yes" },
            { label: "No", value: "No" },
            { label: "Recommendation required", value: "Recommendation required" },
            { label: "Other", value: "Other" },
          ],
          colSpan: 2,
        },
        { type: "text", name: "softNote", label: "Additional Notes", colSpan: 2 },
      ],
    },
    {
      id: "payment",
      title: "Payment",
      widget: "PaymentWidget",
      supportedCurrencies: ["USD", "HKD"],
      computeFees: (data) => {
        const items: McapFeeItem[] = [
          { id: "base", label: "Company Formation Fee", amount: CR_PRICES.base, kind: "service" as const },
        ];
        if (data.directorNominee) {
          items.push({ id: "directorNominee", label: "Nominee Director", amount: CR_PRICES.nominee, kind: "optional" as const });
        }
        if (data.shareholderNominee) {
          items.push({ id: "shareholderNominee", label: "Nominee Shareholder", amount: CR_PRICES.nominee, kind: "optional" as const });
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
