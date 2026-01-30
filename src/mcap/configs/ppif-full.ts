import type { McapConfig } from "./types";

const PIF_PRICES = {
  base: 3800,
  nd: { 0: 0, 1: 1200, 2: 1700, 3: 2200 },
  ns: 1300,
  emi: 400,
  bank: 2000,
  cbi: 3880,
  recordStorage: 350,
};

export const PPIF_FULL_CONFIG: McapConfig = {
  id: "ppif-full",
  countryCode: "PPIF",
  countryName: "Panama Private Interest Foundation",
  currency: "USD",
  title: "ppif.heading",
  steps: [
    {
      id: "applicant",
      title: "ppif.section1",
      description: "ppif.applicant.description",
      fields: [
        { type: "email", name: "email", label: "ppif.applicant.fields.email.label", required: true, colSpan: 2 },
        { type: "text", name: "contactName", label: "ppif.applicant.fields.contactName.label", required: true, colSpan: 2 },
        { type: "text", name: "phone", label: "ppif.applicant.fields.phone.label", colSpan: 2 },
        { type: "text", name: "contactPref", label: "ppif.applicant.fields.contactPref.label", colSpan: 2 },
      ],
    },
    {
      id: "profile",
      title: "ppif.section2",
      description: "ppif.profile.description",
      fields: [
        { type: "text", name: "foundationNameEn", label: "ppif.profile.fields.foundationNameEn.label", required: true, colSpan: 2 },
        { type: "text", name: "altName1", label: "ppif.profile.fields.altName1.label", required: true, colSpan: 2 },
        { type: "text", name: "altName2", label: "ppif.profile.fields.altName2.label", required: true, colSpan: 2 },
        { type: "text", name: "foundationNameEs", label: "ppif.profile.fields.foundationNameEs.label", colSpan: 2 },
        { type: "textarea", name: "purposeSummary", label: "ppif.profile.purpose.label", required: true, colSpan: 2, rows: 3 },
        {
          type: "select",
          name: "duration",
          label: "ppif.profile.duration.label",
          options: [
            { label: "ppif.profile.duration.options.perpetual", value: "perpetual" },
            { label: "ppif.profile.duration.options.fixed", value: "fixed" },
          ],
        },
        {
          type: "select",
          name: "baseCurrency",
          label: "ppif.profile.baseCurrency.label",
          options: [
            { label: "USD", value: "USD" },
            { label: "HKD", value: "HKD" },
            { label: "EUR", value: "EUR" },
            { label: "Other", value: "Other" },
          ],
        },
        { type: "text", name: "initialEndowment", label: "ppif.profile.initialEndowment.label", colSpan: 2 },
        {
          type: "select",
          name: "sourceOfFunds",
          label: "ppif.profile.sourceOfFunds.label",
          required: true,
          options: [
            { label: "ppif.profile.sourceOfFunds.options.employment", value: "Employment Income" },
            { label: "ppif.profile.sourceOfFunds.options.savings", value: "Savings/Deposits" },
            { label: "ppif.profile.sourceOfFunds.options.investment", value: "Investment Income (stocks/bonds/funds)" },
            { label: "ppif.profile.sourceOfFunds.options.loan", value: "Loan" },
            { label: "ppif.profile.sourceOfFunds.options.sale", value: "Proceeds from Sale of Company/Shares" },
            { label: "ppif.profile.sourceOfFunds.options.business", value: "Business Income/Dividends" },
            { label: "ppif.profile.sourceOfFunds.options.inheritance", value: "Inheritance/Gift" },
            { label: "ppif.profile.sourceOfFunds.options.other", value: "other" },
          ],
        },
        {
          type: "text",
          name: "sourceOfFundsOther",
          label: "ppif.profile.sourceOfFunds.otherLabel",
          condition: (f) => f.sourceOfFunds === "other",
          colSpan: 2,
        },
        { type: "text", name: "endowmentPayer", label: "ppif.profile.endowmentPayer.label", required: true, colSpan: 2 },
        {
          type: "radio-group",
          name: "registeredAddressMode",
          label: "ppif.profile.registeredAddress.label",
          required: true,
          colSpan: 2,
          options: [
            { label: "ppif.profile.registeredAddress.options.mirr", value: "mirr" },
            { label: "ppif.profile.registeredAddress.options.own", value: "own" },
          ],
        },
        {
          type: "text",
          name: "ownRegisteredAddress",
          label: "ppif.profile.ownRegisteredAddress.label",
          condition: (f) => f.registeredAddressMode === "own",
          colSpan: 2,
        },
        {
          type: "checkbox-group",
          name: "industries",
          label: "ppif.profile.businessActivities.industries.label",
          colSpan: 2,
          options: [
            { label: "ppif.profile.businessActivities.industries.options.trade", value: "trade" },
            { label: "ppif.profile.businessActivities.industries.options.consulting", value: "consulting" },
            { label: "ppif.profile.businessActivities.industries.options.manufacturing", value: "manufacturing" },
            { label: "ppif.profile.businessActivities.industries.options.it", value: "it" },
            { label: "ppif.profile.businessActivities.industries.options.investment", value: "investment" },
            { label: "ppif.profile.businessActivities.industries.options.crypto", value: "crypto" },
            { label: "ppif.profile.businessActivities.industries.options.other", value: "other" },
          ],
        },
        { type: "text", name: "geoCountries", label: "ppif.profile.businessActivities.countries.label", colSpan: 2 },
        { type: "textarea", name: "bizDesc", label: "ppif.profile.businessActivities.description.label", colSpan: 2, rows: 3 },
      ],
    },
    {
      id: "parties",
      title: "ppif.section3",
      description: "ppif.parties.description",
      widget: "PartiesManager",
      minParties: 1,
      requireDcp: false,
      requirePartyInvite: true,
    },
    {
      id: "compliance",
      title: "ppif.section11",
      description: "newHk.steps.compliance.description",
      fields: [
        {
          type: "radio-group",
          name: "legalAndEthicalConcern",
          label: "newHk.steps.compliance.questions.legalAndEthicalConcern",
          required: true,
          colSpan: 2,
          options: [
            { label: "newHk.steps.compliance.options.yes", value: "yes" },
            { label: "newHk.steps.compliance.options.no", value: "no" },
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
          ],
        },
        {
          type: "radio-group",
          name: "pepAny",
          label: "ppif.pep.label",
          colSpan: 2,
          options: [
            { label: "ppif.pep.options.yes", value: "yes" },
            { label: "ppif.pep.options.no", value: "no" },
          ],
        },
      ],
    },
    {
      id: "services",
      title: "ppif.section14",
      fields: [
        {
          type: "select",
          name: "pif_ndSetup",
          label: "ppif.invoice.setup.ndSetup.label",
          options: [
            { label: "ppif.invoice.setup.ndSetup.options.0", value: "0" },
            { label: "ppif.invoice.setup.ndSetup.options.1", value: "1" },
            { label: "ppif.invoice.setup.ndSetup.options.2", value: "2" },
            { label: "ppif.invoice.setup.ndSetup.options.3", value: "3" },
          ],
        },
        { type: "checkbox", name: "pif_nsSetup", label: "ppif.invoice.setup.nsSetup.label" },
        { type: "checkbox", name: "pif_optEmi", label: "ppif.invoice.setup.optional.emi" },
        { type: "checkbox", name: "pif_optBank", label: "ppif.invoice.setup.optional.bank" },
        { type: "checkbox", name: "pif_optCbi", label: "ppif.invoice.setup.optional.cbi" },
        { type: "checkbox", name: "pif_recordStorage", label: "ppif.invoice.setup.storage.label" },
      ],
    },
    {
      id: "declarations",
      title: "ppif.section16",
      fields: [
        { type: "checkbox", name: "taxOk", label: "ppif.declarations.taxOk" },
        { type: "checkbox", name: "truthOk", label: "ppif.declarations.truthOk" },
        { type: "checkbox", name: "privacyOk", label: "ppif.declarations.privacyOk" },
        { type: "text", name: "signName", label: "ppif.declarations.signName", colSpan: 2 },
        { type: "text", name: "signTitle", label: "ppif.declarations.signTitle", colSpan: 2 },
        { type: "text", name: "signDate", label: "ppif.declarations.signDate", colSpan: 2 },
      ],
    },
    {
      id: "payment",
      title: "ppif.section15",
      widget: "PaymentWidget",
      supportedCurrencies: ["USD", "HKD"],
      computeFees: (data) => {
        const ndSetup = Number(data.pif_ndSetup || 0) as 0 | 1 | 2 | 3;
        const nsSetup = Boolean(data.pif_nsSetup);
        const optEmi = Boolean(data.pif_optEmi);
        const optBank = Boolean(data.pif_optBank);
        const optCbi = Boolean(data.pif_optCbi);
        const recordStorage = Boolean(data.pif_recordStorage);

        const items = [
          { id: "base", label: "ppif.invoice.setup.entity.label", amount: PIF_PRICES.base, kind: "service" as const },
          { id: "ndSetup", label: "ppif.invoice.setup.ndSetup.label", amount: PIF_PRICES.nd[ndSetup], kind: "service" as const },
          ...(nsSetup ? [{ id: "nsSetup", label: "ppif.invoice.setup.nsSetup.label", amount: PIF_PRICES.ns, kind: "optional" as const }] : []),
          ...(optEmi ? [{ id: "optEmi", label: "ppif.invoice.setup.optional.emi", amount: PIF_PRICES.emi, kind: "optional" as const }] : []),
          ...(optBank ? [{ id: "optBank", label: "ppif.invoice.setup.optional.bank", amount: PIF_PRICES.bank, kind: "optional" as const }] : []),
          ...(optCbi ? [{ id: "optCbi", label: "ppif.invoice.setup.optional.cbi", amount: PIF_PRICES.cbi, kind: "optional" as const }] : []),
          ...(recordStorage ? [{ id: "recordStorage", label: "ppif.invoice.setup.storage.label", amount: PIF_PRICES.recordStorage, kind: "optional" as const }] : []),
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
