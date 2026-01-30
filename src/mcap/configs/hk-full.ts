/* eslint-disable @typescript-eslint/no-explicit-any */
import type { McapConfig } from "./types";
import {
  applicantRoles,
  incorporationPurposeKeys,
  currencyOptions,
  capitalAmountOptions,
  shareCountOptions,
  finYearOptions,
  bookKeepingCycleOptions,
} from "@/pages/Company/NewHKForm/hkIncorpo";
import { businessNatureList } from "@/pages/Company/HongKong/constants";
const yesNoOther = [
            { label: "newHk.steps.compliance.options.yes", value: "yes" },
            { label: "newHk.steps.compliance.options.no", value: "no" },
            { label: "newHk.steps.compliance.options.unsure", value: "unsure" }
          ]

const purposeOptions = incorporationPurposeKeys.map((key) => ({
  label: `newHk.company.fields.purpose.options.${key}`,
  value: key,
}));

const HK_FEES = {
  government: [
    { id: "cr_fee", label: "newHk.fees.items.cr_fee.label", amount: 221, mandatory: true },
    { id: "br_fee", label: "newHk.fees.items.br_fee.label", amount: 283, mandatory: true },
  ],
  service: [
    { id: "inc_service", label: "newHk.fees.items.inc_service.label", amount: 0, mandatory: true },
    { id: "sec_annual", label: "newHk.fees.items.sec_annual.label", amount: 225, mandatory: true },
    { id: "kyc", label: "newHk.fees.items.kyc.label", amount: 0, mandatory: true },
    { id: "reg_office", label: "newHk.fees.items.reg_office.label", amount: 161, mandatory: false },
    { id: "bank_arr", label: "newHk.fees.items.bank_arr.label", amount: 400, mandatory: false },
    { id: "kit", label: "newHk.fees.items.kit.label", amount: 70, mandatory: false },
    { id: "corr_addr", label: "newHk.fees.items.corr_addr.label", amount: 65, mandatory: false },
  ],
};

const computeKycExtras = (parties: any[]) => {
  const list = Array.isArray(parties) ? parties : [];
  const legalPersonCount = list.filter((p: any) => p?.type === "entity").length;
  const individualCount = list.length - legalPersonCount;
  const LEGAL_PERSON_KYC_FEE = 130;
  const INDIVIDUAL_KYC_SLOT_FEE = 65;
  let extra = 0;
  if (legalPersonCount > 0) extra += legalPersonCount * LEGAL_PERSON_KYC_FEE;
  if (individualCount > 2) {
    const peopleNeedingKyc = individualCount - 2;
    const kycSlots = Math.ceil(peopleNeedingKyc / 2);
    extra += kycSlots * INDIVIDUAL_KYC_SLOT_FEE;
  }
  return extra;
};

export const HK_FULL_CONFIG: McapConfig = {
  id: "hk-full",
  countryCode: "HK",
  countryName: "Hong Kong",
  currency: "HKD",
  title: "newHk.hkTitle",
  steps: [
    {
      id: "applicant",
      title: "newHk.steps.applicant.title",
      description: "newHk.steps.applicant.description",
      fields: [
        { type: "text", name: "applicantName", label: "newHk.steps.applicant.fields.applicantName.label", required: true },
        { type: "email", name: "email", label: "newHk.steps.applicant.fields.email.label", required: true },
        { type: "text", name: "phone", label: "newHk.steps.applicant.fields.phone.label", required: true },
        { type: "text", name: "name1", label: "newHk.steps.applicant.fields.name1.label", required: true, colSpan: 2 },
        { type: "text", name: "name2", label: "newHk.steps.applicant.fields.name2.label", colSpan: 2 },
        { type: "text", name: "name3", label: "newHk.steps.applicant.fields.name3.label", colSpan: 2 },
        { type: "text", name: "cname1", label: "newHk.steps.applicant.fields.cname1.label" },
        { type: "text", name: "cname2", label: "newHk.steps.applicant.fields.cname2.label" },
        {
          type: "checkbox-group",
          name: "roles",
          label: "newHk.steps.applicant.fields.roles.label",
          required: true,
          options: applicantRoles,
          colSpan: 2,
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
      title: "newHk.steps.compliance.title",
      description: "newHk.steps.compliance.description",
      fields: [
        {
          type: "radio-group",
          name: "legalAndEthicalConcern",
          label: "newHk.steps.compliance.questions.legalAndEthicalConcern",
          required: true,
          options: yesNoOther,
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "q_country",
          label: "newHk.steps.compliance.questions.q_country",
          required: true,
          options: yesNoOther,
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "sanctionsExposureDeclaration",
          label: "newHk.steps.compliance.questions.sanctionsExposureDeclaration",
          required: true,
          options: yesNoOther,
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "crimeaSevastapolPresence",
          label: "newHk.steps.compliance.questions.crimeaSevastapolPresence",
          required: true,
          options: yesNoOther,
          colSpan: 2,
        },
        {
          type: "radio-group",
          name: "russianEnergyPresence",
          label: "newHk.steps.compliance.questions.russianEnergyPresence",
          required: true,
          options: yesNoOther,
          colSpan: 2,
        },
      ],
    },
    {
      id: "company",
      title: "newHk.steps.company.title",
      fields: [
        {
          type: "select",
          name: "industry",
          label: "newHk.company.fields.industry.label",
          options: businessNatureList.map((b) => ({ label: b.label, value: b.code })),
          required: true,
        },
        {
          type: "checkbox-group",
          name: "purpose",
          label: "newHk.company.fields.purpose.label",
          options: purposeOptions,
          colSpan: 2,
        },
        {
          type: "textarea",
          name: "bizdesc",
          label: "newHk.company.fields.bizdesc.label",
          required: true,
          colSpan: 2,
        },
        {
          type: "select",
          name: "currency",
          label: "newHk.company.fields.currency.label",
          options: currencyOptions,
          required: true,
        },
        {
          type: "select",
          name: "capAmount",
          label: "newHk.company.fields.capAmount.label",
          options: capitalAmountOptions,
          required: true,
        },
        {
          type: "text",
          name: "capOther",
          label: "newHk.company.fields.capOther.label",
          condition: (f) => f.capAmount === "other",
        },
        {
          type: "select",
          name: "shareCount",
          label: "newHk.company.fields.shareCount.label",
          options: shareCountOptions,
          required: true,
        },
        {
          type: "text",
          name: "shareOther",
          label: "newHk.company.fields.shareOther.label",
          condition: (f) => f.shareCount === "other",
        },
      ],
    },
    {
      id: "parties",
      title: "newHk.company.sections.c",
      description: "newHk.company.fields.inviteText",
      widget: "PartiesManager",
      minParties: 1,
      requireDcp: true,
      requirePartyInvite: true,
    },
    {
      id: "fees",
      title: "newHk.steps.fees.title",
      fields: [
        {
          type: "checkbox-group",
          name: "optionalFeeIds",
          label: "newHk.fees.table.optionalTitle",
          options: HK_FEES.service.filter((item) => !item.mandatory).map((item) => ({
            label: item.label,
            value: item.id,
          })),
          colSpan: 2,
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
          options: finYearOptions,
        },
        {
          type: "radio-group",
          name: "bookKeepingCycle",
          label: "newHk.steps.acct.fields.bookKeepingCycle.label",
          options: bookKeepingCycleOptions,
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
        { type: "text", name: "softNote", label: "newHk.steps.acct.fields.softNote.label", colSpan: 2 },
      ],
    },
   
    {
      id: "payment",
      title: "newHk.steps.payment.title",
      description: "newHk.steps.payment.description",
      widget: "PaymentWidget",
      supportedCurrencies: ["HKD", "USD"],
      computeFees: (data) => {
        const selectedIds = new Set(Array.isArray(data.optionalFeeIds) ? data.optionalFeeIds : []);
        const parties = Array.isArray(data.parties) ? data.parties : [];
        const extraKyc = computeKycExtras(parties);

        const items = [
          ...HK_FEES.government.filter((f) => f.mandatory).map((f) => ({
            id: f.id,
            label: f.label,
            amount: f.amount,
            kind: "government" as const,
          })),
          ...HK_FEES.service.filter((f) => f.mandatory || selectedIds.has(f.id)).map((f) => ({
            id: f.id,
            label: f.label,
            amount: f.amount,
            kind: "service" as const,
          })),
        ];

        if (extraKyc > 0) {
          items.push({
            id: "extra_kyc",
            label: "newHk.fees.items.extra_kyc.label",
            amount: extraKyc,
            kind: "service" as const,
          });
        }

        const government = items
          .filter((i) => i.kind === "government")
          .reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const service = items
          .filter((i) => i.kind !== "government")
          .reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const total = government + service;

        return {
          currency: "USD",
          items,
          government,
          service,
          total,
        };
      },
    },
     {
      id: "review",
      title: "newHk.steps.review.title",
      fields: [
        {
          type: "checkbox",
          name: "truthfulnessDeclaration",
          label: "newHk.review.declarations.truth",
          required: true,
        },
        {
          type: "checkbox",
          name: "compliancePreconditionAcknowledgment",
          label: "newHk.review.declarations.compliance",
          required: true,
        },
        {
          type: "text",
          name: "eSign",
          label: "newHk.review.esign.label",
          required: true,
        },
      ],
    },
  ],
};
