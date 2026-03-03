/* eslint-disable @typescript-eslint/no-explicit-any */
import type { McapStepGuard } from "./types";

type ConsultationRule = {
  field: string;
  allow: string[];
};

type ConsultationGuardOptions = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  saveDraftBeforeBlock?: boolean;
};

const DEFAULT_TITLE = "Consultation required before proceeding";
const DEFAULT_DESCRIPTION =
  "We will review your answers and our consultant will contact you shortly.";

const normalizeValue = (value: unknown) => String(value ?? "").trim().toLowerCase();

const buildConsultationGuard = (
  rules: ConsultationRule[],
  options: ConsultationGuardOptions = {}
): McapStepGuard => {
  const normalizedRules = rules.map((rule) => ({
    field: rule.field,
    allow: rule.allow.map(normalizeValue),
  }));

  return ({ data }) => {
    const shouldBlock = normalizedRules.some((rule) => {
      const currentValue = normalizeValue(data?.[rule.field]);
      return !rule.allow.includes(currentValue);
    });

    if (!shouldBlock) return null;

    return {
      block: true,
      title: options.title || DEFAULT_TITLE,
      description: options.description || DEFAULT_DESCRIPTION,
      variant: options.variant,
      saveDraftBeforeBlock: options.saveDraftBeforeBlock ?? true,
    };
  };
};

const sharedSanctionsRiskRules: ConsultationRule[] = [
  { field: "legalAndEthicalConcern", allow: ["no"] },
  { field: "q_country", allow: ["no"] },
  { field: "sanctionsExposureDeclaration", allow: ["no"] },
  { field: "crimeaSevastapolPresence", allow: ["no"] },
  { field: "russianEnergyPresence", allow: ["no"] },
];

const countryRulesByCode: Record<string, ConsultationRule[]> = {
  HK: sharedSanctionsRiskRules,
  SG: [
    { field: "sgAccountingDeclarationIssues", allow: ["no"] },
    { field: "annualRenewalConsent", allow: ["yes", "self_handle"] },
    ...sharedSanctionsRiskRules,
  ],
  US: [
    { field: "annualRenewalConsent", allow: ["yes", "self_handle"] },
    ...sharedSanctionsRiskRules,
  ],
  PA: [
    { field: "annualRenewalConsent", allow: ["yes", "self_handle"] },
    ...sharedSanctionsRiskRules,
  ],
  PPIF: sharedSanctionsRiskRules,
  CR: [
    { field: "annualRenewalConsent", allow: ["yes"] },
    { field: "sanctionsExposureDeclaration", allow: ["no"] },
    { field: "legalAndEthicalConcern", allow: ["no"] },
    { field: "q_country", allow: ["no"] },
    { field: "crimeaSevastapolPresence", allow: ["no"] },
    { field: "russianEnergyPresence", allow: ["no"] },
    { field: "criminalHistory", allow: ["no"] },
  ],
  AU: [
    { field: "annualRenewalConsent", allow: ["yes", "self_handle"] },
    { field: "legalAndEthicalConcern", allow: ["no"] },
    { field: "sanctionsExposureDeclaration", allow: ["no"] },
    { field: "corporateTaxAcknowledgement", allow: ["yes"] },
  ],
  UK: [
    { field: "legalAndEthicalConcern", allow: ["no"] },
    { field: "annualRenewalConsent", allow: ["yes", "self_handle_after_setup"] },
    { field: "sanctionedCountryOperations", allow: ["no"] },
    { field: "sanctionedResidenceExposure", allow: ["no"] },
    { field: "sanctionedOwnershipOrControl", allow: ["no"] },
    { field: "crimeaSevastopolExposure", allow: ["no"] },
    { field: "oilGasMilitaryExposure", allow: ["no"] },
  ],
  UAE: [
    { field: "legalEthicalIssues", allow: ["no"] },
    { field: "annualRenewalConsent", allow: ["yes", "internal"] },
    { field: "sanctionCountriesOps", allow: ["no"] },
    { field: "sanctionPersonnelResidency", allow: ["no"] },
    { field: "crimeaSevastopol", allow: ["no"] },
    { field: "sensitiveSectors", allow: ["no"] },
  ],
  CH_FOUNDATION: [
    { field: "legalAndEthicalConcern", allow: ["no"] },
    { field: "annualRenewalConsent", allow: ["yes", "internal_resolution"] },
    { field: "sanctionedCountriesBusiness", allow: ["no"] },
    { field: "sanctionedPersonsInvolved", allow: ["no"] },
    { field: "restrictedSectors", allow: ["no"] },
  ],
  CH: [
    { field: "ethicalLegalConfirmation", allow: ["no"] },
    { field: "annualRenewalAgreement", allow: ["yes", "internal_resolution"] },
    { field: "sanctionedCountriesBusiness", allow: ["no"] },
    { field: "sanctionedPersonsInvolved", allow: ["no"] },
    { field: "restrictedSectors", allow: ["no"] },
  ],
  CH_LLC: [
    { field: "ethicalLegalConfirmation", allow: ["no"] },
    { field: "annualRenewalAgreement", allow: ["yes", "internal_resolution"] },
    { field: "sanctionedCountriesBusiness", allow: ["no"] },
    { field: "sanctionedPersonsInvolved", allow: ["no"] },
    { field: "restrictedSectors", allow: ["no"] },
  ],
  IE: [
    { field: "legalEthicalIssues", allow: ["no"] },
    { field: "annualRenewalConsent", allow: ["yes", "internal_after_establishment"] },
    { field: "sanctionedCountryBusiness", allow: ["no"] },
    { field: "sanctionedResidenceExposure", allow: ["no"] },
    { field: "sanctionedOwnershipOrAgency", allow: ["no"] },
    { field: "crimeaSevastopolExposure", allow: ["no"] },
    { field: "restrictedSectorExposure", allow: ["no"] },
  ],
  LT: [
    { field: "legalEthicsIssues", allow: ["no"] },
    { field: "annualRenewalAgreement", allow: ["yes", "internal"] },
    { field: "sanctionedCountriesBusiness", allow: ["no"] },
    { field: "sanctionedPersonsResidence", allow: ["no"] },
    { field: "crimeaSevastopolBusiness", allow: ["no"] },
    { field: "restrictedSectors", allow: ["no"] },
  ],
  EE: [
    { field: "legalOrEthicalIssuesConcern", allow: ["no"] },
    { field: "annualRenewalAgreement", allow: ["yes", "self_handle"] },
    { field: "businessInSanctionedCountries", allow: ["no"] },
    { field: "personsResidingInSanctionedCountries", allow: ["no"] },
    { field: "ownershipBySanctionedPersons", allow: ["no"] },
    { field: "crimeaOrSevastopolActivity", allow: ["no"] },
    { field: "oilGasMilitaryEnergySectorActivity", allow: ["no"] },
  ],
};

export const getComplianceGuardForCountryCode = (countryCode: string): McapStepGuard | undefined => {
  const rules = countryRulesByCode[countryCode];
  return rules ? buildConsultationGuard(rules) : undefined;
};
