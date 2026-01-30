import type { McapConfig } from "./types";
import { service_list, getEntityBasicPrice } from "@/pages/Company/USA/constants";

export const US_FULL_CONFIG: McapConfig = {
  id: "us-full",
  countryCode: "US",
  countryName: "United States",
  currency: "USD",
  title: "usa.title",
  steps: [
    {
      id: "applicant",
      title: "usa.steps.step1",
      description: "usa.steps.applicant.description",
      fields: [
        { type: "text", name: "name", label: "newHk.steps.applicant.fields.applicantName.label", required: true, colSpan: 2 },
        { type: "email", name: "email", label: "newHk.steps.applicant.fields.email.label", required: true, colSpan: 2 },
        { type: "text", name: "phoneNum", label: "newHk.steps.applicant.fields.phone.label", colSpan: 2 },
        { type: "text", name: "companyName_1", label: "usa.AppInfo.usCompName", required: true, colSpan: 2 },
        { type: "text", name: "companyName_2", label: "newHk.steps.applicant.fields.name2.label", colSpan: 2 },
        { type: "text", name: "companyName_3", label: "newHk.steps.applicant.fields.name3.label", colSpan: 2 },
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
          name: "annualRenewalConsent",
          label: "usa.AppInfo.amlUsEstablishment",
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
          label: "newHk.steps.compliance.questions.q_country",
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
      title: "usa.steps.step3",
      description: "usa.steps.company.description",
      fields: [
        {
          type: "select",
          name: "selectedEntity",
          label: "usa.usCompanyEntity",
          required: true,
          options: [
            { label: "LLC (limited liability company)", value: "LLC" },
            { label: "Corporation", value: "Corporation" },
            { label: "Consultation required before proceeding", value: "Consultation required" },
          ],
          colSpan: 2,
        },
        {
          type: "text",
          name: "selectedState",
          label: "usa.Section2StateQuestion",
          placeholder: "common.select",
          required: true,
          colSpan: 2,
        },
        {
          type: "checkbox-group",
          name: "selectedIndustry",
          label: "usa.bInfo.selectIndustryItems",
          required: true,
          colSpan: 2,
          options: [
            { label: "usa.bInfo.iList.1", value: "cryptocurrency-related" },
            { label: "usa.bInfo.iList.2", value: "development-of-it-blockchain" },
            { label: "usa.bInfo.iList.3", value: "cryptocurrency-based-investment" },
            { label: "usa.bInfo.iList.4", value: "cryptocurrency-based-games" },
            { label: "usa.bInfo.iList.5", value: "foreign-exchange-trading" },
            { label: "usa.bInfo.iList.6", value: "finance-investment-advisory-loan" },
            { label: "usa.bInfo.iList.7", value: "trade-industry" },
            { label: "usa.bInfo.iList.8", value: "wholesaleretail-distribution-industry" },
            { label: "usa.bInfo.iList.9", value: "consulting" },
            { label: "usa.bInfo.iList.10", value: "manufacturing" },
            { label: "usa.bInfo.iList.11", value: "online-service-industry-e-commerce" },
            { label: "usa.bInfo.iList.12", value: "online-direct-purchasedeliverypurchase-agency" },
            { label: "usa.bInfo.pList.8", value: "other" },
          ],
        },
        {
          type: "text",
          name: "otherIndustryText",
          label: "usa.bInfo.pList.8",
          condition: (f) => Array.isArray(f.selectedIndustry) && f.selectedIndustry.includes("other"),
          colSpan: 2,
        },
        {
          type: "textarea",
          name: "descriptionOfProducts",
          label: "usa.bInfo.descProductName",
          required: true,
          colSpan: 2,
          rows: 3,
        },
        {
          type: "textarea",
          name: "descriptionOfBusiness",
          label: "usa.bInfo.descBusinessInfo",
          required: true,
          colSpan: 2,
          rows: 3,
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
          name: "purposeOfEstablishmentCompany",
          label: "usa.bInfo.purposeEstablish",
          required: true,
          colSpan: 2,
          options: [
            { label: "usa.bInfo.pList.1", value: "business-diversification-through-regulatory" },
            { label: "usa.bInfo.pList.2", value: "advisor-or-client-suggested" },
            { label: "usa.bInfo.pList.3", value: "expanding-business-into-various-overseas-countries" },
            { label: "usa.bInfo.pList.4", value: "asset-management-by-investing-in-real-estate-or-financial" },
            { label: "usa.bInfo.pList.5", value: "holding-company" },
            { label: "usa.bInfo.pList.6", value: "pursuing-competitive-advantage-through-liberal" },
            { label: "usa.bInfo.pList.7", value: "increased-transaction-volume-due-to-low-tax-rate" },
            { label: "usa.bInfo.pList.8", value: "other" },
          ],
        },
        {
          type: "text",
          name: "otherCompanyPurposeText",
          label: "usa.bInfo.pList.8",
          condition: (f) => Array.isArray(f.purposeOfEstablishmentCompany) && f.purposeOfEstablishmentCompany.includes("other"),
          colSpan: 2,
        },
      ],
    },
    {
      id: "services",
      title: "usa.steps.step5",
      description: "usa.steps.services.description",
      fields: [
        {
          type: "checkbox-group",
          name: "serviceItemsSelected",
          label: "usa.serviceSelection.heading",
          options: service_list.map((svc) => ({ label: svc.key, value: svc.id })),
          colSpan: 2,
        },
      ],
    },
    {
      id: "parties",
      title: "newHk.steps.company.sections.c",
      description: "newHk.company.fields.inviteText",
      widget: "PartiesManager",
      minParties: 1,
      requireDcp: true,
      requirePartyInvite: true,
    },
    {
      id: "accounting",
      title: "newHk.steps.acct.title",
      fields: [
        {
          type: "textarea",
          name: "accountingDataAddress",
          label: "usa.bInfo.enterAddress",
          placeholder: "newHk.steps.acct.fields.softNote.placeholder",
          colSpan: 2,
          rows: 3,
        },
      ],
    },
    {
      id: "payment",
      title: "usa.steps.step7",
      description: "usa.steps.payment.description",
      widget: "PaymentWidget",
      supportedCurrencies: ["USD", "HKD"],
      computeFees: (data) => {
        const base = getEntityBasicPrice(data.selectedState || "", data.selectedEntity || "");
        const basePrice = Number(base?.price || 0);
        const selected = Array.isArray(data.serviceItemsSelected) ? data.serviceItemsSelected : [];
        const optionalItems = service_list
          .filter((svc) => selected.includes(svc.id))
          .map((svc) => ({ id: svc.id, label: svc.key, amount: Number(svc.price || 0), kind: "optional" as const }));

        const items = [
          {
            id: "base",
            label: `${data.selectedState || "State"} (${data.selectedEntity || "Entity"})`,
            amount: basePrice,
            kind: "service" as const,
          },
          ...optionalItems,
        ];

        const total = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);

        return {
          currency: "USD",
          items,
          total,
          service: total,
          government: 0,
        };
      },
    },
  ],
};
