/* eslint-disable @typescript-eslint/no-explicit-any */
import type { McapConfig } from "./types";

const PA_PRICES = {
  base: 3000,
  nd: { 0: 0, 1: 1200, 2: 1700, 3: 2200 },
  ns: 1300,
  emi: 400,
  bank: 2000,
  cbi: 3880,
  recordStorage: 350,
};

const computePaFees = (data: Record<string, any>) => {
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
    { id: "base", label: "panama.quoteSetup.base.label", amount: PA_PRICES.base, kind: "service" as const },
    { id: "ndSetup", label: "panama.quoteSetup.ndSetup.label", amount: PA_PRICES.nd[ndSetup], kind: "service" as const },
    ...(nsSetup ? [{ id: "nsSetup", label: "panama.quoteSetup.nsSetup.label", amount: PA_PRICES.ns, kind: "optional" as const }] : []),
    ...(optEmi ? [{ id: "optEmi", label: "panama.quoteSetup.optional.emi", amount: PA_PRICES.emi, kind: "optional" as const }] : []),
    ...(optBank ? [{ id: "optBank", label: "panama.quoteSetup.optional.bank", amount: PA_PRICES.bank, kind: "optional" as const }] : []),
    ...(optCbi ? [{ id: "optCbi", label: "panama.quoteSetup.optional.cbi", amount: PA_PRICES.cbi, kind: "optional" as const }] : []),
    ...(recordStorage ? [{ id: "recordStorage", label: "Record Storage (Mirr)", amount: PA_PRICES.recordStorage, kind: "optional" as const }] : []),
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

export const PA_FULL_CONFIG: McapConfig = {
  id: "pa-full",
  countryCode: "PA",
  countryName: "Panama",
  currency: "USD",
  title: "panama.title",
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
          label: "aml.amlEstablishment",
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
          label: "aml.plannedBusinessActivity",
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
          type: "radio-group",
          name: "panamaEntity",
          label: "panama.panamaEntity",
          required: true,
          colSpan: 2,
          options: [
            { label: "AmlCdd.options.yes", value: "Yes" },
            { label: "AmlCdd.options.no", value: "No" },
            { label: "InformationIncorporation.paymentOption_other", value: "Other" },
          ],
        },
        {
          type: "text",
          name: "otherPanamaEntity",
          label: "InformationIncorporation.paymentOption_other",
          condition: (f) => f.panamaEntity === "Other",
          colSpan: 2,
        },
        {
          type: "textarea",
          name: "pEntityInfo",
          label: "panama.descPanamaEntity",
          condition: (f) => f.panamaEntity === "Yes",
          colSpan: 2,
          rows: 3,
        },
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
          type: "checkbox-group",
          name: "establishmentPurpose",
          label: "panama.purposeSetting",
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
          type: "text",
          name: "listCountry",
          label: "panama.businessTransactions",
          required: true,
          colSpan: 2,
        },
        {
          type: "checkbox-group",
          name: "sourceFunding",
          label: "panama.sourceOfFund",
          required: true,
          colSpan: 2,
          options: [
            { label: "panama.sourceList.1", value: "labourIncome" },
            { label: "panama.sourceList.2", value: "depositsSaving" },
            { label: "panama.sourceList.3", value: "incomeFromStocks" },
            { label: "panama.sourceList.4", value: "loans" },
            { label: "panama.sourceList.5", value: "saleOfCompany" },
            { label: "panama.sourceList.6", value: "businessDivident" },
            { label: "panama.sourceList.7", value: "inheritance" },
            { label: "InformationIncorporation.paymentOption_other", value: "other" },
          ],
        },
        {
          type: "text",
          name: "otherSourceFund",
          label: "InformationIncorporation.paymentOption_other",
          condition: (f) => Array.isArray(f.sourceFunding) && f.sourceFunding.includes("other"),
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "businessAddress",
          label: "panama.regAddress",
          required: true,
          colSpan: 2,
          options: [
            { label: "panama.useRegMirProide", value: "mirrasiaAddress" },
            { label: "panama.haveSepAddress", value: "ownAddress" },
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
            { label: "newHk.company.fields.currency.options.USD", value: "USD" },
            { label: "newHk.company.fields.currency.options.CNY", value: "CNY" },
            { label: "newHk.company.fields.currency.options.HKD", value: "HKD" },
            { label: "InformationIncorporation.paymentOption_other", value: "Other" },
          ],
        },
        {
          type: "select",
          name: "capAmount",
          label: "newHk.company.fields.capAmount.label",
          required: true,
          options: [
            { label: "newHk.company.fields.capAmount.options.10000", value: "10000" },
            { label: "50,000", value: "50000" },
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
            const currency = f.currency || "USD";
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
      title: "panama.quoteSetup.title",
      widget: "PanamaServiceSetupWidget",
      fields: [
        {
          type: "select",
          name: "pa_ndSetup",
          label: "panama.quoteSetup.ndSetup.label",
          options: [
            { label: "panama.quoteSetup.ndSetup.options.0", value: "0" },
            { label: "panama.quoteSetup.ndSetup.options.1", value: "1" },
            { label: "panama.quoteSetup.ndSetup.options.2", value: "2" },
            { label: "panama.quoteSetup.ndSetup.options.3", value: "3" },
          ],
        },
        {
          type: "textarea",
          name: "pa_nd3ReasonSetup",
          label: "panama.quoteSetup.nd3Reason.label",
          condition: (f) => String(f.pa_ndSetup || "0") === "3",
          colSpan: 2,
          rows: 3,
        },
        { type: "checkbox", name: "pa_nsSetup", label: "panama.quoteSetup.nsSetup.label" },
        { type: "checkbox", name: "pa_optEmi", label: "panama.quoteSetup.optional.emi" },
        { type: "checkbox", name: "pa_optBank", label: "panama.quoteSetup.optional.bank" },
        { type: "checkbox", name: "pa_optCbi", label: "panama.quoteSetup.optional.cbi" },
      ],
    },
    {
      id: "parties",
      title: "newHk.company.sections.c",
      description: "newHk.company.fields.inviteText",
      widget: "PartiesManager",
      minParties: 3,
      requireDcp: true,
      requirePartyInvite: true,
      partyFields: [
        {
          key: "officeRole",
          label: "panama.role",
          type: "select",
          options: [
            { label: "panama.rOptions.4", value: "president" },
            { label: "panama.rOptions.5", value: "treasurer" },
            { label: "panama.rOptions.3", value: "secretary" },
          ],
          storage: "details",
        },
      ],
      partyCoverageRules: [
        {
          key: "officeRole",
          storage: "details",
          label: "panama.role",
          requiredValues: ["president", "treasurer", "secretary"],
          valueLabels: {
            president: "panama.rOptions.4",
            treasurer: "panama.rOptions.5",
            secretary: "panama.rOptions.3",
          },
        },
      ],
    },
    {
      id: "acct",
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
      id: "bylaws",
      title: "ppif.section7",
      fields: [
        {
          type: "radio-group",
          name: "bylawsMode",
          label: "ppif.bylaws.modes.label",
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
      id: "accounting",
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
      id: "invoice",
      title: "usa.steps.step6",
      description: "usa.steps.invoice.description",
      widget: "InvoiceWidget",
      computeFees: (data) => computePaFees(data),
    },
    {
      id: "payment",
      title: "usa.steps.step7",
      description: "usa.steps.payment.description",
      widget: "PaymentWidget",
      supportedCurrencies: ["USD", "HKD"],
      computeFees: (data) => computePaFees(data),
    },
  ],
};
