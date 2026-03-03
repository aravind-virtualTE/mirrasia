/* eslint-disable @typescript-eslint/no-explicit-any */
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

const computePpifFees = (data: Record<string, any>) => {
  const ndSetup = Number(data.pa_ndSetup || 0) as 0 | 1 | 2 | 3;
  const nsSetup = Boolean(data.pa_nsSetup);
  const optEmi = Boolean(data.pa_optEmi);
  const optBank = Boolean(data.pa_optBank);
  const optCbi = Boolean(data.pa_optCbi);
  const recordStorage = Boolean(data.recordStorageUseMirr ?? data.pa_recordStorage);
  const paymentCurrency = String(data.paymentCurrency || data.stripeCurrency || "USD").toUpperCase();
  const fxRate = paymentCurrency === "HKD"
    ? Number(data.pa_exchangeRate || data.exchangeRateUsed || 7.8)
    : 1;
  const rate = Number.isFinite(fxRate) && fxRate > 0 ? fxRate : 1;
  const convert = (amountUsd: number) => Number((amountUsd * rate).toFixed(2));

  const itemsUsd = [
    { id: "base", label: "ppif.invoice.setup.entity.label", amount: PIF_PRICES.base, kind: "service" as const },
    { id: "ndSetup", label: "ppif.invoice.setup.ndSetup.label", amount: PIF_PRICES.nd[ndSetup], kind: "service" as const },
    ...(nsSetup ? [{ id: "nsSetup", label: "ppif.invoice.setup.nsSetup.label", amount: PIF_PRICES.ns, kind: "optional" as const }] : []),
    ...(optEmi ? [{ id: "optEmi", label: "ppif.invoice.setup.optional.emi", amount: PIF_PRICES.emi, kind: "optional" as const }] : []),
    ...(optBank ? [{ id: "optBank", label: "ppif.invoice.setup.optional.bank", amount: PIF_PRICES.bank, kind: "optional" as const }] : []),
    ...(optCbi ? [{ id: "optCbi", label: "ppif.invoice.setup.optional.cbi", amount: PIF_PRICES.cbi, kind: "optional" as const }] : []),
    ...(recordStorage ? [{ id: "recordStorage", label: "ppif.accounting.fields.useMirr.label", amount: PIF_PRICES.recordStorage, kind: "optional" as const }] : []),
  ];
  const items = itemsUsd.map((item) => ({ ...item, amount: convert(item.amount) }));

  const totalUsd = itemsUsd.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const total = Number(items.reduce((sum, item) => sum + Number(item.amount || 0), 0).toFixed(2));
  const cardFeePct = paymentCurrency === "USD" ? 0.06 : 0.04;
  const cardFeeSurcharge = data.payMethod === "card" ? Number((total * cardFeePct).toFixed(2)) : 0;
  const grandTotal = Number((total + cardFeeSurcharge).toFixed(2));

  return {
    currency: paymentCurrency,
    items,
    total,
    service: total,
    government: 0,
    cardFeePct,
    cardFeeSurcharge,
    grandTotal,
    exchangeRateUsed: paymentCurrency === "HKD" ? rate : undefined,
    originalAmountUsd: totalUsd,
  };
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
      fields: [
        { type: "info", label: "ppif.profile.namingGuidelines.title", content: "ppif.profile.namingGuidelines.body", colSpan: 2 },
        { type: "text", name: "foundationNameEn", label: "ppif.profile.nameChoices.first.label", required: true, colSpan: 2 },
        { type: "text", name: "altName1", label: "ppif.profile.nameChoices.second.label", required: true, colSpan: 2 },
        { type: "text", name: "altName2", label: "ppif.profile.nameChoices.third.label", required: true, colSpan: 2 },
        { type: "text", name: "foundationNameEs", label: "ppif.profile.nameChoices.spanish.label", colSpan: 2 },
        { type: "info", label: "ppif.profile.endowmentInfo.title", content: "ppif.profile.endowmentInfo.body", colSpan: 2 },
        { type: "text", name: "initialEndowment", label: "ppif.profile.endowmentFields.amount.label", colSpan: 2 },
        {
          type: "select",
          name: "sourceOfFunds",
          label: "ppif.profile.sourceOfFunds.label",
          required: true,
          options: [
            { label: "ppif.profile.sourceOfFunds.options.Employment Income", value: "Employment Income" },
            { label: "ppif.profile.sourceOfFunds.options.Savings/Deposits", value: "Savings/Deposits" },
            { label: "ppif.profile.sourceOfFunds.options.Investment Income (stocks/bonds/funds)", value: "Investment Income (stocks/bonds/funds)" },
            { label: "ppif.profile.sourceOfFunds.options.Loan", value: "Loan" },
            { label: "ppif.profile.sourceOfFunds.options.Proceeds from Sale of Company/Shares", value: "Proceeds from Sale of Company/Shares" },
            { label: "ppif.profile.sourceOfFunds.options.Business Income/Dividends", value: "Business Income/Dividends" },
            { label: "ppif.profile.sourceOfFunds.options.Inheritance/Gift", value: "Inheritance/Gift" },
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
        { type: "text", name: "endowmentPayer", label: "ppif.profile.endowmentFields.payer.label", required: true, colSpan: 2 },
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
          type: "textarea",
          name: "ownRegisteredAddress",
          label: "ppif.profile.registeredAddress.own.label",
          condition: (f) => f.registeredAddressMode === "own",
          colSpan: 2,
          rows: 3,
        },
        { type: "textarea", name: "purposeSummary", label: "ppif.profile.purpose.label", required: true, colSpan: 2, rows: 4 },
        {
          type: "checkbox-group",
          name: "industries",
          label: "ppif.profile.businessActivities.industries.label",
          colSpan: 2,
          options: [
            { label: "ppif.profile.businessActivities.industries.options.trading", value: "trading" },
            { label: "ppif.profile.businessActivities.industries.options.wholesale", value: "wholesale" },
            { label: "ppif.profile.businessActivities.industries.options.consulting", value: "consulting" },
            { label: "ppif.profile.businessActivities.industries.options.manufacturing", value: "manufacturing" },
            { label: "ppif.profile.businessActivities.industries.options.finance", value: "finance" },
            { label: "ppif.profile.businessActivities.industries.options.online", value: "online" },
            { label: "ppif.profile.businessActivities.industries.options.it", value: "it" },
            { label: "ppif.profile.businessActivities.industries.options.crypto", value: "crypto" },
            { label: "ppif.profile.businessActivities.industries.options.other", value: "other" },
          ],
        },
        { type: "text", name: "geoCountries", label: "ppif.profile.businessActivities.countries.label", colSpan: 2 },
        { type: "textarea", name: "bizDesc", label: "ppif.profile.businessActivities.description.label", colSpan: 2, rows: 3 },
      ],
    },
    {
      id: "founders",
      title: "ppif.section3",
      widget: "RepeatableSection",
      widgetConfig: {
        preFields: [
          { type: "info", label: "ppif.founders.info.title", content: "ppif.founders.info.body", colSpan: 2 },
        ],
        sections: [
          {
            kind: "list",
            fieldName: "founders",
            title: "ppif.section3",
            minItems: 1,
            addLabel: "ppif.founders.buttons.addFounder",
            itemLabel: "ppif.founders.title",
            itemFields: [
              {
                type: "radio-group",
                name: "type",
                label: "ppif.founders.type.label",
                required: true,
                options: [
                  { label: "ppif.founders.type.options.individual", value: "individual" },
                  { label: "ppif.founders.type.options.corporate", value: "corporate" },
                ],
              },
              { type: "text", name: "name", label: "ppif.founders.name.label", required: true },
              { type: "text", name: "id", label: "ppif.founders.id.label", required: true },
              { type: "email", name: "email", label: "ppif.founders.email.label" },
              { type: "text", name: "tel", label: "ppif.founders.phone.label" },
            ],
            invite: {
              role: "founder",
              label: "ppif.founders.buttons.invite",
              nameKey: "name",
              emailKey: "email",
              phoneKey: "tel",
              typeKey: "type",
              entityValue: "corporate",
              statusKey: "status",
              detailsKeys: ["type", "id", "status"],
            },
          },
        ],
      },
    },
    {
      id: "council",
      title: "ppif.section4",
      widget: "RepeatableSection",
      widgetConfig: {
        preFields: [
          {
            type: "radio-group",
            name: "councilMode",
            label: "ppif.council.composition.title",
            required: true,
            options: [
              { label: "ppif.council.composition.modes.ind3", value: "ind3" },
              { label: "ppif.council.composition.modes.corp1", value: "corp1" },
            ],
            colSpan: 2,
          },
          { type: "info", label: "ppif.council.individuals.title", content: "ppif.council.individuals.note", colSpan: 2, condition: (f: { councilMode: string; }) => f.councilMode !== "corp1" },
          { type: "info", label: "ppif.council.corporate.title", content: "ppif.council.corporate.note", colSpan: 2, condition: (f: { councilMode: string; }) => f.councilMode === "corp1" },
          {
            type: "checkbox",
            name: "useNomineeDirector",
            label: "ppif.council.individuals.nominee.checkboxLabel",
            colSpan: 2,
            condition: (f: { councilMode: string; }) => f.councilMode === "ind3",
          },
          {
            type: "select",
            name: "nomineePersons",
            label: "ppif.council.individuals.nominee.countLabel",
            condition: (f: { councilMode: string; useNomineeDirector: any; }) => f.councilMode === "ind3" && f.useNomineeDirector,
            options: [
              { label: "ppif.council.individuals.nominee.options.1", value: "1" },
              { label: "ppif.council.individuals.nominee.options.2", value: "2" },
              { label: "ppif.council.individuals.nominee.options.3", value: "3" },
            ],
          },
        ],
        modeField: "councilMode",
        modes: [
          {
            value: "ind3",
            label: "ppif.council.composition.modes.ind3",
            sections: [
              {
                kind: "list",
                fieldName: "councilIndividuals",
                title: "ppif.council.individuals.title",
                minItems: 3,
                addLabel: "ppif.council.buttons.add",
                itemLabel: "ppif.council.individuals.memberCardTitle",
                allowRemove: false,
                itemFields: [
                  { type: "text", name: "name", label: "ppif.council.individuals.fields.name.label", required: true },
                  { type: "text", name: "id", label: "ppif.council.individuals.fields.id.label", required: true },
                  { type: "email", name: "email", label: "ppif.council.individuals.fields.email.label" },
                  { type: "text", name: "tel", label: "ppif.council.individuals.fields.phone.label" },
                  {
                    type: "select",
                    name: "isDcp",
                    label: "newHk.company.fields.isDcp.label",
                    options: [
                      { label: "newHk.parties.fields.isDirector.options.yes", value: "true" },
                      { label: "newHk.parties.fields.isDirector.options.no", value: "false" },
                    ],
                  },
                ],
                invite: {
                  role: "council",
                  label: "ppif.council.buttons.invite",
                  nameKey: "name",
                  emailKey: "email",
                  phoneKey: "tel",
                  statusKey: "status",
                  includeDcpFromKey: "isDcp",
                  detailsKeys: ["id", "isDcp", "status"],
                },
              },
            ],
          },
          {
            value: "corp1",
            label: "ppif.council.composition.modes.corp1",
            sections: [
              {
                kind: "object",
                fieldName: "councilCorporate",
                title: "ppif.council.corporate.title",
                itemFields: [
                  { type: "text", name: "corpMain", label: "ppif.council.corporate.fields.corpMain.label", required: true },
                  { type: "text", name: "addrRep", label: "ppif.council.corporate.fields.addrRep.label", required: true },
                  { type: "text", name: "signatory", label: "ppif.council.corporate.fields.signatory.label" },
                  { type: "email", name: "email", label: "ppif.council.corporate.fields.email.label" },
                ],
                invite: {
                  role: "council",
                  label: "ppif.council.buttons.invite",
                  nameKey: "corpMain",
                  emailKey: "email",
                  type: "entity",
                  statusKey: "status",
                  detailsKeys: ["addrRep", "signatory", "status"],
                },
              },
            ],
          },
        ],
      },
    },
    {
      id: "protectors",
      title: "ppif.section5",
      widget: "RepeatableSection",
      widgetConfig: {
        preFields: [
          {
            type: "radio-group",
            name: "protectorsEnabled",
            label: "ppif.protectors.info.body",
            tooltip: "ppif.protectors.info.examples",
            required: true,
            options: [
              { label: "ppif.protectors.controls.appoint", value: "yes" },
              { label: "ppif.protectors.controls.doNotAppoint", value: "no" },
            ],
            colSpan: 2,
          },
        ],
        sections: [
          {
            kind: "list",
            fieldName: "protectors",
            title: "ppif.protectors.itemTitle",
            minItems: 1,
            addLabel: "ppif.protectors.controls.add",
            itemLabel: "ppif.shared.repeater.title",
            condition: (f: { protectorsEnabled: string; }) => f.protectorsEnabled === "yes",
            itemFields: [
              { type: "text", name: "name", label: "ppif.shared.repeater.fields.name.label", required: true },
              { type: "text", name: "contact", label: "ppif.shared.repeater.fields.contact.label" },
            ],
            invite: {
              role: "protector",
              label: "ppif.protectors.buttons.invite",
              nameKey: "name",
              emailKey: "contact",
              statusKey: "status",
              detailsKeys: ["status"],
            },
          },
        ],
      },
    },
    {
      id: "beneficiaries",
      title: "ppif.section6",
      widget: "RepeatableSection",
      widgetConfig: {
        preFields: [
          {
            type: "info-block",
            listPrefix: "ppif.beneficiaries.info",
            listItemKeys: ["design", "low"],
            colSpan: 2,
          },
          {
            type: "radio",
            name: "beneficiariesMode",
            required: true,
            options: [
              { label: "ppif.beneficiaries.modes.fixed", value: "fixed" },
              { label: "ppif.beneficiaries.modes.class", value: "class" },
              { label: "ppif.beneficiaries.modes.mixed", value: "mixed" },
            ],
            colSpan: 2,
          },
          {
            type: "textarea",
            name: "letterOfWishes",
            label: "ppif.beneficiaries.letterOfWishes.label",
            colSpan: 2,
            rows: 4,
          },
        ],
        sections: [
          {
            kind: "list",
            fieldName: "beneficiaries",
            title: "ppif.beneficiaries.itemTitle",
            minItems: 1,
            addLabel: "ppif.beneficiaries.controls.add",
            itemLabel: "ppif.shared.repeater.title",
            // condition: (f) => f.beneficiariesMode !== "class",
            itemFields: [
              { type: "text", name: "name", label: "ppif.shared.repeater.fields.name.label", required: true },
              { type: "text", name: "contact", label: "ppif.shared.repeater.fields.contact.label" },
            ],
            invite: {
              role: "beneficiary",
              label: "ppif.beneficiaries.buttons.invite",
              nameKey: "name",
              emailKey: "contact",
              statusKey: "status",
              detailsKeys: ["status"],
            },
          },
        ],
      },
    },
    {
      id: "bylaws",
      title: "ppif.section7",
      fields: [
        {
          type: "radio-group",
          name: "bylawsMode",
          required: true,
          colSpan: 2,
          options: [
            { label: "ppif.bylaws.modes.standard", value: "standard" },
            { label: "ppif.bylaws.modes.custom", value: "custom" },
          ],
        },
        {
          type: "textarea",
          name: "bylawsPowers",
          label: "ppif.bylaws.fields.powers.label",
          condition: (f) => f.bylawsMode === "custom",
          colSpan: 2,
          rows: 4,
        },
        {
          type: "textarea",
          name: "bylawsAdmin",
          label: "ppif.bylaws.fields.admin.label",
          condition: (f) => f.bylawsMode === "custom",
          colSpan: 2,
          rows: 4,
        },
      ],
    },
    {
      id: "es",
      title: "ppif.section8",
      fields: [
        { type: "info", label: "ppif.section8", content: "ppif.es.description", colSpan: 2 },
      ],
    },
    {
      id: "banking",
      title: "ppif.section9",
      fields: [
        {
          type: "radio-group",
          name: "bankingNeed",
          label: "ppif.banking.need.label",
          required: true,
          colSpan: 2,
          options: [
            { label: "ppif.banking.need.options.need", value: "need" },
            { label: "ppif.banking.need.options.none", value: "none" },
            { label: "ppif.banking.need.options.later", value: "later" },
          ],
        },
        {
          type: "select",
          name: "bankingBizType",
          label: "ppif.banking.bizType.label",
          options: [
            { label: "ppif.banking.bizType.options.consulting", value: "consulting" },
            { label: "ppif.banking.bizType.options.ecommerce", value: "ecommerce" },
            { label: "ppif.banking.bizType.options.investment", value: "investment" },
            { label: "ppif.banking.bizType.options.crypto", value: "crypto" },
            { label: "ppif.banking.bizType.options.manufacturing", value: "manufacturing" },
          ],
        },
      ],
    },
    {
      id: "pep",
      title: "ppif.section10",
      fields: [
        {
          type: "radio-group",
          name: "pepAny",
          label: "ppif.pep.label",
          required: true,
          colSpan: 2,
          options: [
            { label: "ppif.pep.options.yes", value: "yes" },
            { label: "ppif.pep.options.no", value: "no" },
          ],
        },
      ],
    },
    {
      id: "compliance",
      title: "ppif.section11",
      fields: [
        { type: "info", label: "ppif.section11", content: "ppif.aml.info", colSpan: 2 },
        {
          type: "radio-group",
          name: "legalAndEthicalConcern",
          label: "ppif.aml.q1.label",
          required: true,
          colSpan: 2,
          options: [
            { label: "ppif.pep.options.yes", value: "yes" },
            { label: "ppif.pep.options.no", value: "no" },
          ],
        },
        {
          type: "radio-group",
          name: "q_country",
          label: "ppif.aml.q2.label",
          required: true,
          colSpan: 2,
          options: [
            { label: "ppif.pep.options.yes", value: "yes" },
            { label: "ppif.pep.options.no", value: "no" },
          ],
        },
        {
          type: "radio-group",
          name: "sanctionsExposureDeclaration",
          label: "ppif.aml.q3.label",
          required: true,
          colSpan: 2,
          options: [
            { label: "ppif.pep.options.yes", value: "yes" },
            { label: "ppif.pep.options.no", value: "no" },
          ],
        },
        {
          type: "radio-group",
          name: "crimeaSevastapolPresence",
          label: "ppif.aml.q4.label",
          required: true,
          colSpan: 2,
          options: [
            { label: "ppif.pep.options.yes", value: "yes" },
            { label: "ppif.pep.options.no", value: "no" },
          ],
        },
        {
          type: "radio-group",
          name: "russianEnergyPresence",
          label: "ppif.aml.q5.label",
          required: true,
          colSpan: 2,
          options: [
            { label: "ppif.pep.options.yes", value: "yes" },
            { label: "ppif.pep.options.no", value: "no" },
          ],
        },
      ],
    },
    {
      id: "deliverables",
      title: "ppif.section12",
      fields: [
        {
          type: "info-list",
          label: "ppif.deliverables.left.title",
          listPrefix: "ppif.deliverables.left.items",
          listItemKeys: [
            "publicDeed",
            "publicDeedTranslation",
            "registryCert",
            "registryCertTranslation",
            "foundationCert",
            "foundationCertTranslation",
            "councilRegister",
            "councilAcceptance",
            "bylaws",
            "boardMeeting",
            "incumbencyCert",
            "nomineeAgreement",
            "companyChop",
          ],
          colSpan: 2,
        },
        { type: "info", label: "ppif.deliverables.right.title", content: "ppif.deliverables.right.note", colSpan: 2 },
        { type: "text", name: "shippingRecipientCompany", label: "ppif.deliverables.right.fields.recipientCompany.label", required: true, colSpan: 2 },
        { type: "text", name: "shippingContactPerson", label: "ppif.deliverables.right.fields.contactPerson.label", required: true, colSpan: 2 },
        { type: "text", name: "shippingPhone", label: "ppif.deliverables.right.fields.phone.label", required: true, colSpan: 2 },
        { type: "text", name: "shippingPostalCode", label: "ppif.deliverables.right.fields.postalCode.label", required: true, colSpan: 2 },
        { type: "textarea", name: "shippingAddress", label: "ppif.deliverables.right.fields.address.label", required: true, colSpan: 2, rows: 4 },
      ],
    },
    {
      id: "accounting-records",
      title: "ppif.section13",
      fields: [
        { type: "info", label: "ppif.section13", content: "ppif.accounting.info", colSpan: 2 },
        {
          type: "checkbox",
          name: "recordStorageUseMirr",
          label: "ppif.accounting.fields.useMirr.label",
          colSpan: 2,
        },
        {
          type: "textarea",
          name: "recordStorageAddress",
          label: "ppif.accounting.fields.address.label",
          required: true,
          condition: (f) => !f.recordStorageUseMirr,
          colSpan: 2,
          rows: 4,
        },
        {
          type: "text",
          name: "recordStorageResponsiblePerson",
          label: "ppif.accounting.fields.responsible.label",
          required: true,
          condition: (f) => !f.recordStorageUseMirr,
          colSpan: 2,
        },
      ],
    },
    {
      id: "services",
      title: "ppif.invoice.title",
      widget: "PanamaServiceSetupWidget",
      widgetConfig: { basePrice: PIF_PRICES.base, tPrefix: "ppif.invoice" },
      fields: [
        {
          type: "select",
          name: "pa_ndSetup",
          label: "ppif.invoice.setup.ndSetup.label",
          options: [
            { label: "ppif.invoice.setup.ndSetup.options.0", value: "0" },
            { label: "ppif.invoice.setup.ndSetup.options.1", value: "1" },
            { label: "ppif.invoice.setup.ndSetup.options.2", value: "2" },
            { label: "ppif.invoice.setup.ndSetup.options.3", value: "3" },
          ],
        },
        {
          type: "textarea",
          name: "pa_nd3ReasonSetup",
          label: "ppif.invoice.setup.ndSetup.reason.label",
          condition: (f) => String(f.pa_ndSetup || "0") === "3",
          colSpan: 2,
          rows: 3,
        },
        { type: "checkbox", name: "pa_nsSetup", label: "ppif.invoice.setup.nsSetup.label" },
        { type: "checkbox", name: "pa_optEmi", label: "ppif.invoice.setup.optional.emi" },
        { type: "checkbox", name: "pa_optBank", label: "ppif.invoice.setup.optional.bank" },
        { type: "checkbox", name: "pa_optCbi", label: "ppif.invoice.setup.optional.cbi" },
      ],
    },
    {
      id: "declarations",
      title: "ppif.section16",
      fields: [
        { type: "checkbox", name: "taxOk", label: "ppif.declarations.checks.taxOk", required: true },
        { type: "checkbox", name: "truthOk", label: "ppif.declarations.checks.truthOk", required: true },
        { type: "checkbox", name: "privacyOk", label: "ppif.declarations.checks.privacyOk", required: true },
        { type: "text", name: "signName", label: "ppif.declarations.fields.signName.label", required: true, colSpan: 2 },
        { type: "text", name: "signDate", label: "ppif.declarations.fields.signDate.label", required: true, colSpan: 2 },
        { type: "text", name: "signTitle", label: "ppif.declarations.fields.signTitle.label", colSpan: 2 },
      ],
    },
    {
      id: "invoice",
      title: "ppif.section14",
      widget: "InvoiceWidget",
      computeFees: (data) => computePpifFees(data),
    },
    {
      id: "payment",
      title: "ppif.section15",
      widget: "PaymentWidget",
      supportedCurrencies: ["USD", "HKD"],
      computeFees: (data) => computePpifFees(data),
    },
  ],
};
