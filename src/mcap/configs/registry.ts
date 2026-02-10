import React from "react";
import type { McapConfig, McapStep } from "./types";
import CommonServiceAgrementTxt from "@/pages/Company/CommonServiceAgrementTxt";
import { HK_FULL_CONFIG } from "./hk-full";
import { UAE_IFZA_CONFIG } from "./uae-ifza";
import { UAE_FREEZONE_CONFIGS } from "./uae-freezones";
import { US_FULL_CONFIG } from "./us-full";
import { SG_FULL_CONFIG } from "./sg-full";
import { PA_FULL_CONFIG } from "./pa-full";
import { PPIF_FULL_CONFIG } from "./ppif-full";
import { CR_FULL_CONFIG } from "./cr-full";

const STANDARD_FLOW_COUNTRIES = new Set(["HK", "US", "SG", "PA", "PPIF", "CR"]);

const buildAgreementStep = (): McapStep => ({
  id: "service-agreement",
  title: "newHk.steps.termsStep.title",
  fields: [
    {
      type: "info",
      content: React.createElement(CommonServiceAgrementTxt),
      colSpan: 2,
    }    
  ],
});

const buildReviewStep = (): McapStep => ({
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
});

const mergePartiesIntoCompany = (steps: McapStep[]) => {
  const partiesIdx = steps.findIndex((s) => s.id === "parties");
  if (partiesIdx === -1) return steps;

  const targetIdx = steps.findIndex((s) => s.id === "company") !== -1
    ? steps.findIndex((s) => s.id === "company")
    : steps.findIndex((s) => s.id === "profile");

  if (targetIdx === -1) return steps;

  const partiesStep = steps[partiesIdx];
  const companyStep = { ...steps[targetIdx] };

  companyStep.widget = "PartiesManager";
  companyStep.minParties = partiesStep.minParties ?? companyStep.minParties;
  companyStep.requireDcp = partiesStep.requireDcp ?? companyStep.requireDcp;
  companyStep.requirePartyInvite = partiesStep.requirePartyInvite ?? companyStep.requirePartyInvite;
  companyStep.partyFields = partiesStep.partyFields ?? companyStep.partyFields;
  companyStep.partyCoverageRules = partiesStep.partyCoverageRules ?? companyStep.partyCoverageRules;
  if (!companyStep.description && partiesStep.description) {
    companyStep.description = partiesStep.description;
  }

  const next = [...steps];
  next[targetIdx] = companyStep;
  next.splice(partiesIdx, 1);
  return next;
};

const injectServiceAgreement = (steps: McapStep[]) => {
  if (steps.some((s) => s.id === "service-agreement")) return steps;
  const insertIdx = steps.findIndex((s) =>
    s.id === "invoice" ||
    s.id === "payment" ||
    s.id === "review" ||
    s.id === "declaration" ||
    s.id === "terms" ||
    s.widget === "PaymentWidget"
  );
  const targetIdx = insertIdx === -1 ? steps.length : insertIdx;
  const next = [...steps];
  next.splice(targetIdx, 0, buildAgreementStep());
  return next;
};

const ensureReviewStep = (steps: McapStep[]) => {
  if (steps.some((s) => s.id === "review")) return steps;
  const declIdx = steps.findIndex((s) => s.id === "declarations" || s.id === "declaration");
  if (declIdx !== -1) {
    const next = [...steps];
    next[declIdx] = { ...next[declIdx], id: "review" };
    return next;
  }
  return [...steps, buildReviewStep()];
};

const reorderSteps = (steps: McapStep[]) => {
  const weights = (step: McapStep) => {
    if (step.id === "applicant") return 10;
    if (step.id === "compliance") return 20;
    if (step.id === "pep") return 25;
    if (step.id === "company" || step.id === "profile") return 30;
    if ([
      "founders",
      "council",
      "protectors",
      "beneficiaries",
      "bylaws",
      "es",
      "banking",
      "deliverables",
    ].includes(step.id)) return 35;
    if (step.id === "accounting" || step.id === "acct" || step.id === "accounting-records") return 40;
    if (step.id === "service-agreement") return 50;
    if (step.id === "services" || step.id === "fees" || step.id === "invoice") return 60;
    if (step.id === "payment" || step.widget === "PaymentWidget") return 70;
    if (step.id === "review") return 80;
    return 55;
  };

  return steps
    .map((step, idx) => ({ step, idx, weight: weights(step) }))
    .sort((a, b) => a.weight - b.weight || a.idx - b.idx)
    .map((item) => item.step);
};

const normalizeConfig = (config: McapConfig): McapConfig => {
  let steps = config.steps.map((s) => ({ ...s }));

  if (STANDARD_FLOW_COUNTRIES.has(config.countryCode)) {
    steps = mergePartiesIntoCompany(steps);
    steps = injectServiceAgreement(steps);
    steps = ensureReviewStep(steps);
    steps = reorderSteps(steps);
  } else {
    steps = injectServiceAgreement(steps);
  }

  return { ...config, steps };
};

export const MCAP_CONFIGS: McapConfig[] = [
  HK_FULL_CONFIG,
  US_FULL_CONFIG,
  SG_FULL_CONFIG,
  PA_FULL_CONFIG,
  PPIF_FULL_CONFIG,
  CR_FULL_CONFIG,
  UAE_IFZA_CONFIG,
  ...UAE_FREEZONE_CONFIGS,
].map(normalizeConfig);

export const MCAP_CONFIG_MAP = MCAP_CONFIGS.reduce<Record<string, McapConfig>>((acc, cfg) => {
  acc[cfg.id] = cfg;
  acc[cfg.countryCode] = cfg;
  return acc;
}, {});
