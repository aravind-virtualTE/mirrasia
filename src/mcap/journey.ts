import type { McapConfig, McapField, McapJourneyType, McapStep } from "./configs/types";
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
const COMPANY_STEP_ID = "company";

export const EXISTING_COMPANY_ONBOARDING_BRN_FIELD = "existingCompanyBrnNo";
export const EXISTING_COMPANY_ONBOARDING_INCORPORATION_DATE_FIELD = "existingCompanyIncorporationDate";

const EXISTING_COMPANY_ONBOARDING_COMPANY_FIELDS: McapField[] = [
  {
    name: EXISTING_COMPANY_ONBOARDING_BRN_FIELD,
    type: "text",
    label: "mcap.journey.onboardingFields.brnNo.label",
    placeholder: "mcap.journey.onboardingFields.brnNo.placeholder",
    required: true,
  },
  {
    name: EXISTING_COMPANY_ONBOARDING_INCORPORATION_DATE_FIELD,
    type: "date",
    label: "mcap.journey.onboardingFields.incorporationDate.label",
    placeholder: "mcap.journey.onboardingFields.incorporationDate.placeholder",
    required: true,
  },
];

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

const augmentCompanyStepForExistingCompanyOnboarding = (step: McapStep): McapStep => {
  if (String(step.id || "").trim().toLowerCase() !== COMPANY_STEP_ID) {
    return step;
  }

  const existingFieldNames = new Set(
    (step.fields || [])
      .map((field) => String(field?.name || "").trim())
      .filter(Boolean)
  );
  const additionalFields = EXISTING_COMPANY_ONBOARDING_COMPANY_FIELDS.filter(
    (field) => field.name && !existingFieldNames.has(field.name)
  );

  if (additionalFields.length === 0) {
    return step;
  }

  return {
    ...step,
    fields: [...(step.fields || []), ...additionalFields],
  };
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
    steps: (config.steps || [])
      .filter((step) => !isPricingStep(step))
      .map(augmentCompanyStepForExistingCompanyOnboarding),
  };
};
