import type { McapConfig, McapJourneyType, McapStep } from "./configs/types";
import {
  DEFAULT_MCAP_JOURNEY_TYPE,
  EXISTING_COMPANY_ONBOARDING_JOURNEY_TYPE,
} from "./configs/types";

const PRICING_STEP_IDS = new Set(["services", "invoice", "payment"]);
const PRICING_WIDGETS = new Set([
  "ServiceSelectionWidget",
  "PanamaServiceSetupWidget",
  "InvoiceWidget",
  "PaymentWidget",
]);

export const resolveMcapJourneyType = (value: unknown): McapJourneyType => {
  return value === EXISTING_COMPANY_ONBOARDING_JOURNEY_TYPE
    ? EXISTING_COMPANY_ONBOARDING_JOURNEY_TYPE
    : DEFAULT_MCAP_JOURNEY_TYPE;
};

export const isExistingCompanyOnboardingJourney = (value: unknown) =>
  resolveMcapJourneyType(value) === EXISTING_COMPANY_ONBOARDING_JOURNEY_TYPE;

const isPricingStep = (step: McapStep) => {
  return PRICING_STEP_IDS.has(String(step.id || "").trim().toLowerCase())
    || PRICING_WIDGETS.has(String(step.widget || "").trim());
};

export const resolveMcapConfigForJourney = (
  config: McapConfig,
  journeyType: unknown
): McapConfig => {
  const resolvedJourneyType = resolveMcapJourneyType(journeyType);
  if (resolvedJourneyType === DEFAULT_MCAP_JOURNEY_TYPE) {
    return config;
  }

  return {
    ...config,
    steps: (config.steps || []).filter((step) => !isPricingStep(step)),
  };
};

