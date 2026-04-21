/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import type { McapConfig, McapField, McapStep } from "./types";
import CommonServiceAgrementTxt from "@/pages/Company/CommonServiceAgrementTxt";
import { HK_FULL_CONFIG } from "./hk-full";
import {
  createUaeUnifiedFullConfig,
  UAE_UNIFIED_CONFIG_ID,
} from "./uae-unified-full";
import { US_FULL_CONFIG } from "./us-full";
import { SG_FULL_CONFIG } from "./sg-full";
import { PA_FULL_CONFIG } from "./pa-full";
import { PPIF_FULL_CONFIG } from "./ppif-full";
import { CR_FULL_CONFIG } from "./cr-full";
import { UK_FULL_CONFIG } from "./uk-full";
import {
  CH_AG_FULL_CONFIG,
  CH_FOUNDATION_FULL_CONFIG,
  CH_GMBH_FULL_CONFIG,
  CH_UNIFIED_CONFIG_ID,
  CH_UNIFIED_FLOW_VERSION,
  CH_UNIFIED_FLOW_VERSION_FIELD,
  createChUnifiedFullConfig,
} from "./ch-unified-full";
import { EE_FULL_CONFIG } from "./ee-full";
import { LT_FULL_CONFIG } from "./lt-full";
import { HU_FULL_CONFIG } from "./hu-full";
import { IE_FULL_CONFIG } from "./ie-full";
import { AU_FULL_CONFIG } from "./au-full";
import { BVI_FULL_CONFIG } from "./bvi-full";
import { GE_FULL_CONFIG } from "./ge-full";
import { getComplianceGuardForCountryCode } from "./complianceGuards";
import { resolveMcapConfigForJourney, resolveMcapJourneyType } from "../journey";

export const STANDARD_FLOW_COUNTRIES = new Set([
  "HK",
  "US",
  "SG",
  "PA",
  "PPIF",
  "CR",
  "UK",
  "UAE",
  "CH",
  "CH_FOUNDATION",
  "CH_LLC",
  "EE",
  "LT",
  "HU",
  "IE",
  "AU",
  "GE",
  "BVI",
]);

const buildAgreementStep = (): McapStep => ({
  id: "service-agreement",
  title: "newHk.steps.termsStep.title",
  fields: [
    {
      type: "info",
      content: React.createElement(CommonServiceAgrementTxt),
      colSpan: 2,
    },
    {
      type: "checkbox",
      name: "legalTermsAcknowledgment",
      label: "serviceAgreement.checkBox",
      required: true,
      colSpan: 2,
    },
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
      type: "signature",
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
  companyStep.partyRoleOptions = partiesStep.partyRoleOptions ?? companyStep.partyRoleOptions;
  companyStep.defaultPartyRoles = partiesStep.defaultPartyRoles ?? companyStep.defaultPartyRoles;
  companyStep.partyCoverageRules = partiesStep.partyCoverageRules ?? companyStep.partyCoverageRules;
  if (!companyStep.description && partiesStep.description) {
    companyStep.description = partiesStep.description;
  }

  const next = [...steps];
  next[targetIdx] = companyStep;
  next.splice(partiesIdx, 1);
  return next;
};

const isLegalTermsField = (field: McapField) =>
  field.name === "legalTermsAcknowledgment" || field.label === "newHk.review.declarations.terms";

const stripLegalTermsOutsideAgreement = (steps: McapStep[]) =>
  steps.map((step) => {
    if (step.id === "service-agreement" || !step.fields?.length) return step;
    const filtered = step.fields.filter((field) => !isLegalTermsField(field));
    if (filtered.length === step.fields.length) return step;
    return { ...step, fields: filtered };
  });

const ensureCommonServiceAgreement = (steps: McapStep[]) => {
  const existingIdx = steps.findIndex((s) => s.id === "service-agreement");
  if (existingIdx !== -1) {
    const next = [...steps];
    next[existingIdx] = buildAgreementStep();
    return next;
  }
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
    if (step.id === "services" || step.id === "fees") return 50;
    if (step.id === "service-agreement") return 55;
    if (step.id === "invoice") return 60;
    if (step.id === "payment" || step.widget === "PaymentWidget") return 70;
    if (step.id === "review") return 80;
    return 55;
  };

  return steps
    .map((step, idx) => ({ step, idx, weight: weights(step) }))
    .sort((a, b) => a.weight - b.weight || a.idx - b.idx)
    .map((item) => item.step);
};

const attachComplianceGuard = (config: McapConfig, steps: McapStep[]) => {
  const complianceGuard = getComplianceGuardForCountryCode(config.countryCode);
  if (!complianceGuard) return steps;
  return steps.map((step) =>
    step.id === "compliance"
      ? {
        ...step,
        nextGuard: step.nextGuard || complianceGuard,
        saveDraftOnBlockedNext: step.saveDraftOnBlockedNext ?? true,
      }
      : step
  );
};

const normalizeConfig = (config: McapConfig): McapConfig => {
  if (config.skipNormalization) {
    return config;
  }

  let steps = config.steps.map((s) => ({ ...s }));
  steps = stripLegalTermsOutsideAgreement(steps);
  steps = ensureCommonServiceAgreement(steps);

  if (STANDARD_FLOW_COUNTRIES.has(config.countryCode)) {
    steps = mergePartiesIntoCompany(steps);
    steps = ensureReviewStep(steps);
    steps = reorderSteps(steps);
  }

  steps = attachComplianceGuard(config, steps);

  return { ...config, steps };
};

const HK_CONFIG = normalizeConfig(HK_FULL_CONFIG);
const US_CONFIG = normalizeConfig(US_FULL_CONFIG);
const SG_CONFIG = normalizeConfig(SG_FULL_CONFIG);
const PA_CONFIG = normalizeConfig(PA_FULL_CONFIG);
const PPIF_CONFIG = normalizeConfig(PPIF_FULL_CONFIG);
const CR_CONFIG = normalizeConfig(CR_FULL_CONFIG);
const UK_CONFIG = normalizeConfig(UK_FULL_CONFIG);
const CH_AG_CONFIG = { ...normalizeConfig(CH_AG_FULL_CONFIG), launcherEnabled: false };
const CH_GMBH_CONFIG = { ...normalizeConfig(CH_GMBH_FULL_CONFIG), launcherEnabled: false };
const CH_FOUNDATION_CONFIG = { ...normalizeConfig(CH_FOUNDATION_FULL_CONFIG), launcherEnabled: false };
const CH_UNIFIED_CONFIG = createChUnifiedFullConfig({
  agConfig: CH_AG_CONFIG,
  gmbhConfig: CH_GMBH_CONFIG,
  foundationConfig: CH_FOUNDATION_CONFIG,
});
const EE_CONFIG = normalizeConfig(EE_FULL_CONFIG);
const LT_CONFIG = normalizeConfig(LT_FULL_CONFIG);
const HU_CONFIG = normalizeConfig(HU_FULL_CONFIG);
const IE_CONFIG = normalizeConfig(IE_FULL_CONFIG);
const AU_CONFIG = normalizeConfig(AU_FULL_CONFIG);
const GE_CONFIG = normalizeConfig(GE_FULL_CONFIG);
const BVI_CONFIG = normalizeConfig(BVI_FULL_CONFIG);
const UAE_UNIFIED_CONFIG = normalizeConfig(createUaeUnifiedFullConfig());

const SWISS_LEGACY_CONFIGS_BY_COUNTRY_CODE: Record<string, McapConfig> = {
  CH: CH_AG_CONFIG,
  CH_LLC: CH_GMBH_CONFIG,
  CH_FOUNDATION: CH_FOUNDATION_CONFIG,
};

export const MCAP_RUNTIME_CONFIGS: McapConfig[] = [
  HK_CONFIG,
  US_CONFIG,
  SG_CONFIG,
  PA_CONFIG,
  PPIF_CONFIG,
  CR_CONFIG,
  UK_CONFIG,
  CH_UNIFIED_CONFIG,
  CH_AG_CONFIG,
  CH_GMBH_CONFIG,
  CH_FOUNDATION_CONFIG,
  EE_CONFIG,
  LT_CONFIG,
  HU_CONFIG,
  IE_CONFIG,
  AU_CONFIG,
  GE_CONFIG,
  BVI_CONFIG,
  UAE_UNIFIED_CONFIG,
];

export const MCAP_CONFIGS: McapConfig[] = MCAP_RUNTIME_CONFIGS.filter(
  (cfg) => cfg.launcherEnabled !== false
);

export const MCAP_CONFIG_MAP = MCAP_RUNTIME_CONFIGS.reduce<Record<string, McapConfig>>((acc, cfg) => {
  acc[cfg.id] = cfg;
  if (!acc[cfg.countryCode]) {
    acc[cfg.countryCode] = cfg;
  }
  return acc;
}, {});

type ResolveMcapConfigForCompanyInput = {
  id?: string | null;
  countryCode?: string | null;
  data?: Record<string, any> | null;
};

const hasUnifiedSwissMarker = (data: Record<string, any> | null | undefined) =>
  String(data?.[CH_UNIFIED_FLOW_VERSION_FIELD] || "") === CH_UNIFIED_FLOW_VERSION;

export const resolveMcapConfigForCompany = ({
  id,
  countryCode,
  data,
}: ResolveMcapConfigForCompanyInput): McapConfig | null => {
  const normalizedCountryCode = String(countryCode || "").trim().toUpperCase();
  const normalizedId = String(id || "").trim();

  if (normalizedCountryCode && normalizedCountryCode in SWISS_LEGACY_CONFIGS_BY_COUNTRY_CODE) {
    if (hasUnifiedSwissMarker(data)) {
      return MCAP_CONFIG_MAP[CH_UNIFIED_CONFIG_ID] || null;
    }
    return SWISS_LEGACY_CONFIGS_BY_COUNTRY_CODE[normalizedCountryCode];
  }

  if (normalizedCountryCode === "UAE") {
    return MCAP_CONFIG_MAP[UAE_UNIFIED_CONFIG_ID] || null;
  }

  if (normalizedId && MCAP_CONFIG_MAP[normalizedId]) {
    return MCAP_CONFIG_MAP[normalizedId];
  }

  if (normalizedCountryCode && MCAP_CONFIG_MAP[normalizedCountryCode]) {
    return MCAP_CONFIG_MAP[normalizedCountryCode];
  }

  return null;
};

type ResolveMcapRuntimeConfigInput = {
  data?: Record<string, any> | null;
  parties?: any[] | null;
  journeyType?: unknown;
};

export const resolveMcapRuntimeConfig = (
  config: McapConfig,
  { data, parties, journeyType }: ResolveMcapRuntimeConfigInput = {}
): McapConfig => {
  const resolvedData = data && typeof data === "object" ? data : {};
  const resolvedParties = Array.isArray(parties) ? parties : [];
  const resolvedJourneyType = resolveMcapJourneyType(journeyType);
  const journeyConfig = resolveMcapConfigForJourney(config, resolvedJourneyType);
  const runtimeBaseConfig = journeyConfig.resolveRuntimeConfig
    ? journeyConfig.resolveRuntimeConfig({
      data: resolvedData,
      parties: resolvedParties,
      journeyType: resolvedJourneyType,
    }) || journeyConfig
    : journeyConfig;

  // Re-run normalization on any runtime-resolved config so that
  // common steps (service-agreement, review, ordering, and legal-term
  // stripping) are applied to configs that mutate their `steps` at runtime.
  const runtimeBaseConfigNormalized = normalizeConfig(
    // normalizeConfig respects `skipNormalization` on the config
    (runtimeBaseConfig as McapConfig)
  );

  const runtimeConfig = resolveMcapConfigForJourney(runtimeBaseConfigNormalized, resolvedJourneyType);
  const preludeSteps = journeyConfig.getPreludeSteps
    ? journeyConfig.getPreludeSteps({
      data: resolvedData,
      parties: resolvedParties,
      journeyType: resolvedJourneyType,
      runtimeConfig,
    })
    : [];

  if (!Array.isArray(preludeSteps) || preludeSteps.length === 0) {
    return runtimeConfig;
  }

  return {
    ...runtimeConfig,
    steps: [...preludeSteps, ...runtimeConfig.steps],
  };
};
