/* eslint-disable @typescript-eslint/no-explicit-any */
import type { McapConfig, McapFeeItem } from "./types";

const SG_BASE_MANDATORY = [
  { id: "companyIncorporation", label: "Singapore.serviceSelection.table.rows.companyIncorporation", price: 350 },
  { id: "companySecretary", label: "Singapore.serviceSelection.table.rows.companySecretary", price: 480 },
  { id: "registeredAddress", label: "Singapore.serviceSelection.table.rows.registeredAddress", price: 300 },
];

const SG_OPTIONALS = [
  { id: "bankAccountAdvisory", label: "Singapore.serviceSelection.table.rows.bankAdvisory", price: 1200 },
  { id: "emiEAccount", label: "Singapore.serviceSelection.table.rows.emiAccount", price: 0 },
];

export const SG_FULL_CONFIG: McapConfig = {
  id: "sg-full",
  currency: "SGD",
  countryCode: "SG",
  countryName: "Singapore",
  title: "Singapore.sgCompIncorporation",
  entityMeta: {
    cardFeePctByCountry: { SGD: 0.04, USD: 0.06 },
  },
  confirmationDetails: {
    title: "Singapore.congratsTitle",
    message: "We have collected your details and your Singapore incorporation is now being processed by ACRA. This typically takes 1-3 business days. Our team will contact you if any further information is required.",
    steps: [
      {
        title: "Compliance Review",
        description: "Our compliance officer will review your KYC/CDD and shareholding information. ETA: 1 business day.",
      },
      {
        title: "ACRA Filing",
        description: "We will file the incorporation with the Accounting and Corporate Regulatory Authority (ACRA).",
      },
      {
        title: "BizFile & Certificates",
        description: "Expected: Business Profile (BizFile) and Certificate of Incorporation within 1-2 days.",
      },
      {
        title: "Post-Incorp Support",
        description: "Opening of bank accounts and corporate secretarial setup.",
      },
    ],
  },
  steps: [
    {
      id: "applicant",
      title: "ppif.section1",
      fields: [
        { type: "text", name: "applicantName", label: "newHk.steps.applicant.fields.applicantName.label", required: true, colSpan: 2 },
        { type: "email", name: "applicantEmail", label: "newHk.steps.applicant.fields.email.label", required: true, colSpan: 2 },
        { type: "text", name: "applicantPhone", label: "newHk.steps.applicant.fields.phone.label", colSpan: 2 },
        { type: "text", name: "companyName1", label: "Company Name (1st Choice)", required: true, colSpan: 2 },
        { type: "text", name: "companyName2", label: "Company Name (2nd Choice)", colSpan: 2 },
        { type: "text", name: "companyName3", label: "Company Name (3rd Choice)", colSpan: 2 },
        {
          type: "checkbox-group",
          name: "establishedRelationshipType",
          label: "newHk.steps.applicant.fields.roles.label",
          required: true,
          colSpan: 2,
          options: [
            { label: "newHk.steps.applicant.fields.roles.options.Director", value: "Director" },
            { label: "newHk.steps.applicant.fields.roles.options.Shareholder", value: "Shareholder" },
            { label: "newHk.steps.applicant.fields.roles.options.Authorized", value: "Authorized" },
            { label: "newHk.steps.applicant.fields.roles.options.Professional", value: "Professional" },
            { label: "newHk.steps.applicant.fields.roles.options.Other", value: "Other" },
          ],
        },
         {
          type: "text",
          name: "otherRelationshipType",
          label: "Other relationship (please specify)",
          condition: (f) => f.establishedRelationshipType?.includes("Other"),
        },
        {
          type: "select",
          name: "sns",
          label: "newHk.steps.applicant.fields.sns.label",
          options: [
            { label: "newHk.steps.applicant.fields.sns.options.WhatsApp", value: "WhatsApp" },
            { label: "newHk.steps.applicant.fields.sns.options.WeChat", value: "WeChat" },
            { label: "newHk.steps.applicant.fields.sns.options.Line", value: "Line" },
            { label: "newHk.steps.applicant.fields.sns.options.KakaoTalk", value: "KakaoTalk" },
            { label: "newHk.steps.applicant.fields.sns.options.Telegram", value: "Telegram" },
          ],
        },
        {
          type: "text",
          name: "snsId",
          label: "newHk.steps.applicant.fields.snsId.label",
          condition: (f) => !!f.sns,
        },
      ],
    },
    {
      id: "compliance",
      title: "usa.steps.step2",
      description: "newHk.steps.compliance.description",
      fields: [
        {
          type: "radio-group",
          name: "sgAccountingDeclarationIssues",
          label: "Singapore.clientAccountTax",
          required: true,
          colSpan: 2,
          options: [
            { label: "newHk.steps.compliance.options.yes", value: "yes" },
            { label: "newHk.steps.compliance.options.no", value: "no" },
            { label: "newHk.steps.compliance.options.unsure", value: "unsure" },
          ],
        },
        {
          type: "radio-group",
          name: "annualRenewalConsent",
          label: "Singapore.clientAnnualRenew",
          required: true,
          colSpan: 2,
          options: [
            { label: "newHk.steps.compliance.options.yes", value: "yes" },
            { label: "newHk.steps.compliance.options.no", value: "no" },
            { label: "usa.AppInfo.handleOwnIncorpo", value: "self_handle" },
            { label: "usa.AppInfo.didntIntedEveryYear", value: "no_if_fixed_cost" },
            { label: "usa.AppInfo.consultationRequired", value: "consultation_required" },
          ],
        },
        {
          type: "radio-group",
          name: "legalAndEthicalConcern",
          label: "newHk.steps.compliance.questions.legalAndEthicalConcern",
          required: true,
          colSpan: 2,
          options: [
            { label: "newHk.steps.compliance.options.yes", value: "yes" },
            { label: "newHk.steps.compliance.options.no", value: "no" },
            { label: "newHk.steps.compliance.options.unsure", value: "unsure" },
          ],
        },
        {
          type: "radio-group",
          name: "q_country",
          label: "Singapore.singFollowingCompaniesActivity",
          required: true,
          colSpan: 2,
          options: [
            { label: "newHk.steps.compliance.options.yes", value: "yes" },
            { label: "newHk.steps.compliance.options.no", value: "no" },
            { label: "newHk.steps.compliance.options.unsure", value: "unsure" },
          ],
        },
        {
          type: "radio-group",
          name: "sanctionsExposureDeclaration",
          label: "newHk.steps.compliance.questions.sanctionsExposureDeclaration",
          required: true,
          colSpan: 2,
          options: [
            { label: "newHk.steps.compliance.options.yes", value: "yes" },
            { label: "newHk.steps.compliance.options.no", value: "no" },
            { label: "newHk.steps.compliance.options.unsure", value: "unsure" },
          ],
        },
        {
          type: "radio-group",
          name: "crimeaSevastapolPresence",
          label: "newHk.steps.compliance.questions.crimeaSevastapolPresence",
          required: true,
          colSpan: 2,
          options: [
            { label: "newHk.steps.compliance.options.yes", value: "yes" },
            { label: "newHk.steps.compliance.options.no", value: "no" },
            { label: "newHk.steps.compliance.options.unsure", value: "unsure" },
          ],
        },
        {
          type: "radio-group",
          name: "russianEnergyPresence",
          label: "newHk.steps.compliance.questions.russianEnergyPresence",
          required: true,
          colSpan: 2,
          options: [
            { label: "newHk.steps.compliance.options.yes", value: "yes" },
            { label: "newHk.steps.compliance.options.no", value: "no" },
            { label: "newHk.steps.compliance.options.unsure", value: "unsure" },
          ],
        },
      ],
    },
    {
      id: "company",
      title: "newHk.steps.company.title",
      fields: [
        {
          type: "checkbox-group",
          name: "selectedIndustry",
          label: "usa.bInfo.selectIndustryItems",
          required: true,
          colSpan: 2,
          options: [
            { label: "Singapore.industries.i1", value: "trade" },
            { label: "Singapore.industries.i2", value: "wholesale" },
            { label: "Singapore.industries.i3", value: "consulting" },
            { label: "Singapore.industries.i4", value: "manufacturing" },
            { label: "Singapore.industries.i5", value: "investment" },
            { label: "Singapore.industries.i6", value: "ecommerce" },
            { label: "Singapore.industries.i7", value: "online-purchase" },
            { label: "Singapore.industries.i8", value: "it-software" },
            { label: "Singapore.industries.i9", value: "crypto" },
            { label: "InformationIncorporation.paymentOption_other", value: "other" },
          ],
        },
        {
          type: "text",
          name: "otherIndustryText",
          label: "InformationIncorporation.paymentOption_other",
          condition: (f) => Array.isArray(f.selectedIndustry) && f.selectedIndustry.includes("other"),
          colSpan: 2,
        },
        {
          type: "textarea",
          name: "productDescription",
          label: "Singapore.bInfoDescProdName",
          required: true,
          colSpan: 2,
          rows: 3,
        },
        {
          type: "text",
          name: "sgBusinessList",
          label: "Singapore.bInfoSingSecondIndustries",
          required: true,
          colSpan: 2,
        },
        {
          type: "text",
          name: "webAddress",
          label: "usa.bInfo.enterWeb",
          placeholder: "https://",
          colSpan: 2,
        },
        {
          type: "checkbox-group",
          name: "establishmentPurpose",
          label: "Singapore.purposeEstablisSingapore",
          required: true,
          colSpan: 2,
          options: [
            { label: "Singapore.purpose.p1", value: "entry-expansion" },
            { label: "Singapore.purpose.p2", value: "asset-management" },
            { label: "Singapore.purpose.p3", value: "holding-company" },
            { label: "Singapore.purpose.p4", value: "proposal" },
            { label: "Singapore.purpose.p5", value: "geographical-benefits" },
            { label: "Singapore.purpose.p6", value: "business-diversification" },
            { label: "Singapore.purpose.p7", value: "competitive-advantage" },
            { label: "Singapore.purpose.p9", value: "capital-gain" },
            { label: "InformationIncorporation.paymentOption_other", value: "other" },
          ],
        },
        {
          type: "text",
          name: "otherEstablishmentPurpose",
          label: "InformationIncorporation.paymentOption_other",
          condition: (f) => Array.isArray(f.establishmentPurpose) && f.establishmentPurpose.includes("other"),
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "businessAddress",
          label: "Singapore.bInfoAddressReg",
          required: true,
          colSpan: 2,
          options: [
            { label: "Singapore.mirraddress", value: "mirrasiaAddress" },
            { label: "Singapore.ownAddress", value: "ownAddress" },
            { label: "InformationIncorporation.paymentOption_other", value: "other" },
          ],
        },
        {
          type: "text",
          name: "otherBusinessAddress",
          label: "InformationIncorporation.paymentOption_other",
          condition: (f) => f.businessAddress === "other",
          colSpan: 2,
        },
        {
          type: "select",
          name: "currency",
          label: "newHk.company.fields.currency.label",
          required: true,
          options: [
            { label: "newHk.company.fields.currency.options.HKD", value: "HKD" },
            { label: "newHk.company.fields.currency.options.USD", value: "USD" },
            { label: "newHk.company.fields.currency.options.CNY", value: "CNY" },
          ],
        },
        {
          type: "select",
          name: "capAmount",
          label: "newHk.company.fields.capAmount.label",
          required: true,
          options: [
            { label: "newHk.company.fields.capAmount.options.1", value: "1" },
            { label: "newHk.company.fields.capAmount.options.10", value: "10" },
            { label: "newHk.company.fields.capAmount.options.100", value: "100" },
            { label: "newHk.company.fields.capAmount.options.1000", value: "1000" },
            { label: "newHk.company.fields.capAmount.options.10000", value: "10000" },
            { label: "newHk.company.fields.capAmount.options.100000", value: "100000" },
            { label: "newHk.company.fields.capAmount.options.other", value: "other" },
          ],
        },
        {
          type: "number",
          name: "capOther",
          label: "newHk.company.fields.capOther.label",
          condition: (f) => f.capAmount === "other",
        },
        {
          type: "select",
          name: "shareCount",
          label: "newHk.company.fields.shareCount.label",
          required: true,
          options: [
            { label: "newHk.company.fields.capAmount.options.1", value: "1" },
            { label: "newHk.company.fields.capAmount.options.10", value: "10" },
            { label: "newHk.company.fields.capAmount.options.100", value: "100" },
            { label: "newHk.company.fields.capAmount.options.1000", value: "1000" },
            { label: "newHk.company.fields.capAmount.options.10000", value: "10000" },
            { label: "newHk.company.fields.capAmount.options.100000", value: "100000" },
            { label: "newHk.company.fields.shareCount.options.other", value: "other" },
          ],
        },
        {
          type: "number",
          name: "shareOther",
          label: "newHk.company.fields.shareOther.label",
          condition: (f) => f.shareCount === "other",
        },
        {
          type: "derived",
          name: "parValue",
          label: "newHk.company.fields.parValue.label",
          compute: (f) => {
            const currency = f.currency || "HKD";
            const total = f.capAmount === "other" ? Number(f.capOther || 0) : Number(f.capAmount || 0);
            const shares = f.shareCount === "other" ? Number(f.shareOther || 1) : Number(f.shareCount || 1);
            if (!total || !shares) return `${currency} 0.00`;
            return `${currency} ${(total / shares).toFixed(2)}`;
          },
        },
      ],
    },
    {
      id: "services",
      title: "Singapore.serviceSelection.cardTitle",
      description: "Singapore.serviceSelection.preQuestions.title",
      widget: "ServiceSelectionWidget",
      fields: [
        {
          type: "radio-group",
          name: "sg_hasLocalDirector",
          label: "Singapore.serviceSelection.preQuestions.q1.label",
          required: true,
          colSpan: 2,
          options: [
            { label: "newHk.steps.compliance.options.yes", value: "yes" },
            { label: "newHk.steps.compliance.options.no", value: "no" },
          ],
        },
        {
          type: "radio-group",
          name: "sg_ndSecurity",
          label: "Singapore.serviceSelection.preQuestions.q2.label",
          colSpan: 2,
          condition: (f) => f.sg_hasLocalDirector === "no",
          options: [
            { label: "Singapore.serviceSelection.preQuestions.q2.deposit", value: "deposit" },
            { label: "Singapore.serviceSelection.preQuestions.q2.prepay", value: "prepay" },
          ],
        },
      ],
      serviceItems: (data: any) => {
        const hasLocalDir = data.sg_hasLocalDirector === "yes";
        const ndSecurity = data.sg_ndSecurity || "deposit";

        const items: any[] = [
          // Base mandatory services
          {
            id: "companyIncorporation",
            label: "Singapore.serviceSelection.table.rows.companyIncorporation",
            amount: 350,
            original: 350,
            mandatory: true,
            info: "Singapore company incorporation filing with ACRA.",
          },
          {
            id: "companySecretary",
            label: "Singapore.serviceSelection.table.rows.companySecretary",
            amount: 480,
            original: 480,
            mandatory: true,
            info: "First year company secretary service.",
          },
          {
            id: "registeredAddress",
            label: "Singapore.serviceSelection.table.rows.registeredAddress",
            amount: 300,
            original: 300,
            mandatory: true,
            info: "First year registered office address in Singapore.",
          },
        ];

        // Conditional: Nominee Director & Security (only when no local director)
        if (!hasLocalDir) {
          items.push({
            id: "nomineeDirector",
            label: "Singapore.serviceSelection.table.rows.nomineeDirector",
            amount: 2000,
            original: 2000,
            mandatory: true,
            info: "Nominee Director service for companies without a local resident director.",
          });
          items.push({
            id: "nomineeSecurity",
            label: ndSecurity === "prepay"
              ? "Singapore.serviceSelection.table.rows.acctTaxPrepayTitle"
              : "Singapore.serviceSelection.table.rows.ndDepositTitle",
            amount: 2000,
            original: 2000,
            mandatory: true,
            info: ndSecurity === "prepay"
              ? "Prepay for accounting/tax services (required for nominee director)."
              : "Refundable security deposit for nominee director (returned after resignation).",
          });
        }

        // Optional services
        items.push({
          id: "bankAccountAdvisory",
          label: "Singapore.serviceSelection.table.rows.bankAdvisory",
          amount: 1200,
          original: 1200,
          mandatory: false,
          info: "Bank account opening advisory and introduction service.",
        });
        items.push({
          id: "emiEAccount",
          label: "Singapore.serviceSelection.table.rows.emiAccount",
          amount: 0,
          original: 0,
          mandatory: false,
          info: "Free EMI e-Account opening (basic tier).",
        });

        return items;
      },
    },
    {
      id: "parties",
      title: "newHk.company.sections.c",
      description: "newHk.company.fields.inviteText",
      widget: "PartiesManager",
      minParties: 1,
      requireDcp: true,
      requirePartyInvite: true,
      partyFields: [
        {
          key: "shareType",
          label: "newHk.parties.fields.type.label",
          type: "radio-group",
          options: [
            { label: "CompanyInformation.typeOfShare.ordinaryShares", value: "ordinary" },
            { label: "CompanyInformation.typeOfShare.preferenceShares", value: "preferred" },
          ],
          roles: ["shareholder"],
          storage: "root",
        },
        {
          key: "isSignificant",
          label: "shldr_viewboard.signiControl",
          type: "select",
          options: [
            { label: "newHk.parties.fields.isDirector.options.no", value: "false" },
            { label: "newHk.parties.fields.isDirector.options.yes", value: "true" },
          ],
          roles: ["shareholder"],
          storage: "details",
        },
      ],
    },
    {
      id: "accounting",
      title: "newHk.steps.acct.title",
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
      id: "invoice",
      title: "usa.steps.step6",
      widget: "InvoiceWidget",
      computeFees: (data: any) => {
        const hasLocalDir = data.sg_hasLocalDirector === "yes";
        const ndSecurity = data.sg_ndSecurity || "deposit";
        const selectedOptionals = Array.isArray(data.serviceItemsSelected) ? data.serviceItemsSelected : [];

        const items: McapFeeItem[] = [];

        // Base mandatory services
        SG_BASE_MANDATORY.forEach((row) => {
          items.push({
            id: row.id,
            label: row.label,
            amount: row.price,
            kind: "service" as const,
          });
        });

        // Conditional: Nominee Director & Security
        if (!hasLocalDir) {
          items.push({
            id: "nomineeDirector",
            label: "Singapore.serviceSelection.table.rows.nomineeDirector",
            amount: 2000,
            kind: "service" as const,
          });
          items.push({
            id: "nomineeSecurity",
            label: ndSecurity === "prepay"
              ? "Singapore.serviceSelection.table.rows.acctTaxPrepayTitle"
              : "Singapore.serviceSelection.table.rows.ndDepositTitle",
            amount: 2000,
            kind: "service" as const,
          });
        }

        // Optional services (only if selected)
        SG_OPTIONALS.filter((opt) => selectedOptionals.includes(opt.id)).forEach((opt) => {
          items.push({ id: opt.id, label: opt.label, amount: opt.price, kind: "optional" as const });
        });

        const total = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const paymentCurrency = data.paymentCurrency || "USD";
        const cardFeePct = paymentCurrency === "USD" ? 0.06 : 0.04;

        return {
          currency: paymentCurrency,
          items,
          total,
          service: total,
          government: 0,
          cardFeePct,
          cardFeeSurcharge: total * cardFeePct,
          grandTotal: total + (total * cardFeePct),
        };
      },
    },
    {
      id: "payment",
      title: "usa.steps.step7",
      widget: "PaymentWidget",
      supportedCurrencies: ["USD", "HKD"],
      computeFees: (data: any) => {
        const hasLocalDir = data.sg_hasLocalDirector === "yes";
        const ndSecurity = data.sg_ndSecurity || "deposit";
        const selectedOptionals = Array.isArray(data.serviceItemsSelected) ? data.serviceItemsSelected : [];

        const items: McapFeeItem[] = [];

        // Base mandatory services
        SG_BASE_MANDATORY.forEach((row) => {
          items.push({
            id: row.id,
            label: row.label,
            amount: row.price,
            kind: "service" as const,
          });
        });

        // Conditional: Nominee Director & Security
        if (!hasLocalDir) {
          items.push({
            id: "nomineeDirector",
            label: "Singapore.serviceSelection.table.rows.nomineeDirector",
            amount: 2000,
            kind: "service" as const,
          });
          items.push({
            id: "nomineeSecurity",
            label: ndSecurity === "prepay"
              ? "Singapore.serviceSelection.table.rows.acctTaxPrepayTitle"
              : "Singapore.serviceSelection.table.rows.ndDepositTitle",
            amount: 2000,
            kind: "service" as const,
          });
        }

        // Optional services (only if selected)
        SG_OPTIONALS.filter((opt) => selectedOptionals.includes(opt.id)).forEach((opt) => {
          items.push({ id: opt.id, label: opt.label, amount: opt.price, kind: "optional" as const });
        });

        const total = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const paymentCurrency = data.paymentCurrency || "USD";
        const cardFeePct = paymentCurrency === "USD" ? 0.06 : 0.04;

        return {
          currency: paymentCurrency,
          items,
          total,
          service: total,
          government: 0,
          cardFeePct,
          cardFeeSurcharge: total * cardFeePct,
          grandTotal: total + (total * cardFeePct),
        };
      },
    },
  ],
};
