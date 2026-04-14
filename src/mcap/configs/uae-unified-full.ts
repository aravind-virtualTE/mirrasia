/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  McapConfig,
  McapFieldChangeAction,
  McapRuntimeContext,
  McapStep,
} from "./types";
import { UAE_IFZA_CONFIG } from "./uae-ifza";

export const UAE_UNIFIED_CONFIG_ID = "uae-unified-full";
export const UAE_UNIFIED_FLOW_VERSION = "unified_v1";
export const UAE_UNIFIED_FLOW_VERSION_FIELD = "uaeFlowVersion";
export const UAE_JURISDICTION_TYPE_FIELD = "uaeJurisdictionType";
const UAE_FIXED_TITLE = "uae.unified.title";

export type UaeJurisdictionType =
  | "dubai-local-llc"
  | "dubai-ifza"
  | "dubai-ifza-fzco"
  | "dubai-difc"
  | "dubai-dmcc"
  | "dubai-dwtc"
  | "dubai-dic"
  | "abu-dhabi";

const UAE_JURISDICTION_OPTIONS: Array<{ label: string; value: UaeJurisdictionType }> = [
  { label: "uae.unified.selector.localLlc", value: "dubai-local-llc" },
  { label: "uae.unified.selector.ifza", value: "dubai-ifza" },
  { label: "uae.unified.selector.ifzaFzco", value: "dubai-ifza-fzco" },
  { label: "uae.unified.selector.difc", value: "dubai-difc" },
  { label: "uae.unified.selector.dmcc", value: "dubai-dmcc" },
  { label: "uae.unified.selector.dwtc", value: "dubai-dwtc" },
  { label: "uae.unified.selector.dic", value: "dubai-dic" },
  { label: "uae.unified.selector.abuDhabi", value: "abu-dhabi" },
];

const ENTITY_TYPE_BY_JURISDICTION: Record<UaeJurisdictionType, string> = {
  "dubai-local-llc": "UAE-LOCAL-LLC",
  "dubai-ifza": "UAE-IFZA-FZCO",
  "dubai-ifza-fzco": "UAE-IFZA-FZCO",
  "dubai-difc": "UAE-DIFC-FZCO",
  "dubai-dmcc": "UAE-DMCC-FZCO",
  "dubai-dwtc": "UAE-DWTC-FZCO",
  "dubai-dic": "UAE-DIC-FZCO",
  "abu-dhabi": "UAE-AD-MAINLAND",
};

const AD_VAT_RATE = 0.05;

type UaeMandatoryLine = { id: string; label: string; amount: number };

const AD_SETUP_LINES: UaeMandatoryLine[] = [
  { id: "ad_business_application", label: "uae.unified.services.ad.businessApplication", amount: 300 },
  { id: "ad_name_reservation", label: "uae.unified.services.ad.nameReservation", amount: 200 },
  { id: "ad_company_registration", label: "uae.unified.services.ad.companyRegistration", amount: 1500 },
  { id: "ad_commercial_license", label: "uae.unified.services.ad.commercialLicense", amount: 4000 },
  { id: "ad_business_activity_license", label: "uae.unified.services.ad.businessActivityLicense", amount: 4000 },
  { id: "ad_info_protection", label: "uae.unified.services.ad.infoProtection", amount: 300 },
  { id: "ad_mailbox", label: "uae.unified.services.ad.mailbox", amount: 250 },
  { id: "ad_consulting", label: "uae.unified.services.ad.consulting", amount: 9500 },
  { id: "ad_bank_intro", label: "uae.unified.services.ad.bankIntro", amount: 2500 },
];

const AD_VISA_LINES: UaeMandatoryLine[] = [
  { id: "ad_visa_establishment_card", label: "uae.unified.services.ad.visaEstablishmentCard", amount: 1030 },
  { id: "ad_visa_e_channel", label: "uae.unified.services.ad.visaEChannel", amount: 4907 },
  { id: "ad_visa_residence", label: "uae.unified.services.ad.visaResidence", amount: 1500 },
  { id: "ad_visa_consulting_medical", label: "uae.unified.services.ad.visaConsultingMedical", amount: 2500 },
];

const AD_VISA_BUNDLE_TOGGLE_ID = "ad_visa_bundle";

const AD_ENTITY_META = {
  "UAE-AD-MAINLAND": {
    initialCostUSD: 23677.5,
    setupCostUSD: 0,
    capital: "None (non-regulated activity)",
    office: "Required (physical office lease)",
    establishmentDays: "3–4 weeks",
    visa: "Optional bundle USD 10,433.85 per visa quota (incl. 5% VAT)",
    accounting: "Yes (separate cost; year-2 operating ≈ USD 11,077.50)",
    localSponsor: "Not required (mainland, non-sponsor route)",
  },
};

const roundMoney = (value: number) => Math.round(value * 100) / 100;

const sumLines = (lines: UaeMandatoryLine[]) =>
  lines.reduce((sum, line) => sum + Number(line.amount || 0), 0);

const getSelectedIds = (data: any): Set<string> => {
  const selected = new Set<string>();
  const optionalFeeIds = Array.isArray(data?.optionalFeeIds) ? data.optionalFeeIds : [];
  const serviceItemsSelected = Array.isArray(data?.serviceItemsSelected) ? data.serviceItemsSelected : [];
  optionalFeeIds.forEach((id: any) => selected.add(String(id)));
  serviceItemsSelected.forEach((id: any) => selected.add(String(id)));
  return selected;
};

const buildAbuDhabiServiceItems = () => [
  ...AD_SETUP_LINES.map((line) => ({
    id: line.id,
    label: line.label,
    amount: line.amount,
    original: line.amount,
    mandatory: true,
  })),
  {
    id: AD_VISA_BUNDLE_TOGGLE_ID,
    label: "uae.unified.services.ad.visaBundle.label",
    amount: roundMoney(sumLines(AD_VISA_LINES) * (1 + AD_VAT_RATE)),
    original: roundMoney(sumLines(AD_VISA_LINES) * (1 + AD_VAT_RATE)),
    mandatory: false,
    info: "uae.unified.services.ad.visaBundle.info",
  },
];

const computeAbuDhabiFees = (data: any) => {
  const setupSubtotal = sumLines(AD_SETUP_LINES);
  const setupVat = roundMoney(setupSubtotal * AD_VAT_RATE);

  const items = AD_SETUP_LINES.map((line) => ({
    id: line.id,
    label: line.label,
    amount: line.amount,
    original: line.amount,
    kind: "service" as const,
  }));

  items.push({
    id: "ad_vat_5pct",
    label: "uae.unified.services.ad.vat",
    amount: setupVat,
    original: setupVat,
    kind: "service" as const,
  });

  const selected = getSelectedIds(data);
  const visaSelected = selected.has(AD_VISA_BUNDLE_TOGGLE_ID);
  if (visaSelected) {
    AD_VISA_LINES.forEach((line) => {
      items.push({
        id: line.id,
        label: line.label,
        amount: line.amount,
        original: line.amount,
        kind: "service" as const,
      });
    });
    const visaVat = roundMoney(sumLines(AD_VISA_LINES) * AD_VAT_RATE);
    items.push({
      id: "ad_visa_vat_5pct",
      label: "uae.unified.services.ad.visaVat",
      amount: visaVat,
      original: visaVat,
      kind: "service" as const,
    });
  }

  const total = roundMoney(items.reduce((sum, item) => sum + Number(item.amount || 0), 0));
  const paymentCurrency = String(data?.paymentCurrency || data?.currency || "USD").toUpperCase();
  const cardFeePct = paymentCurrency === "USD" ? 0.06 : 0.04;
  const cardFeeSurcharge = String(data?.payMethod || "").toLowerCase() === "card" ? roundMoney(total * cardFeePct) : 0;

  return {
    currency: "USD",
    paymentCurrency,
    items,
    government: 0,
    service: total,
    total,
    cardFeePct,
    cardFeeSurcharge,
    grandTotal: roundMoney(total + cardFeeSurcharge),
    note: "uae.unified.services.ad.note",
  };
};

const AD_SUPPORTED_CURRENCIES = ["USD", "HKD"];

const overrideStepsForAbuDhabi = (steps: McapStep[]): McapStep[] =>
  steps.map((step) => {
    const id = String(step.id || "").trim().toLowerCase();
    if (id === "services") {
      return {
        ...step,
        serviceItems: () => buildAbuDhabiServiceItems() as any,
      };
    }
    if (id === "invoice") {
      return {
        ...step,
        computeFees: (data: any) => computeAbuDhabiFees(data || {}),
      };
    }
    if (id === "payment") {
      return {
        ...step,
        supportedCurrencies: AD_SUPPORTED_CURRENCIES,
        computeFees: (data: any) => computeAbuDhabiFees(data || {}),
      };
    }
    return step;
  });

const normalizeJurisdictionType = (value: unknown): UaeJurisdictionType | null => {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized in ENTITY_TYPE_BY_JURISDICTION
    ? (normalized as UaeJurisdictionType)
    : null;
};

const resolveJurisdictionType = (data: Record<string, any>): UaeJurisdictionType =>
  normalizeJurisdictionType(data?.[UAE_JURISDICTION_TYPE_FIELD]) || "dubai-ifza";

const isPaymentCompleted = (paymentStatus: unknown) =>
  String(paymentStatus || "").trim().toLowerCase() === "paid";

const buildSelectorFields = () => [
  {
    type: "info" as const,
    content: "uae.unified.selector.help",
    colSpan: 2 as const,
  },
  {
    type: "select" as const,
    name: UAE_JURISDICTION_TYPE_FIELD,
    label: "uae.unified.selector.label",
    required: true,
    options: UAE_JURISDICTION_OPTIONS,
    colSpan: 2 as const,
  },
  {
    type: "info" as const,
    content: "uae.unified.jurisdictionChange.lockedAfterPayment",
    condition: (data: Record<string, any>) => isPaymentCompleted(data?.paymentStatus),
    colSpan: 2 as const,
  },
  {
    type: "info" as const,
    content: "uae.unified.jurisdictionChange.resetNote",
    condition: (data: Record<string, any>) =>
      !!normalizeJurisdictionType(data?.[UAE_JURISDICTION_TYPE_FIELD])
      && !isPaymentCompleted(data?.paymentStatus),
    colSpan: 2 as const,
  },
];

const stripLegacyEntityTypeField = (step: McapStep): McapStep => {
  if (!step.fields?.length) return step;
  const filtered = step.fields.filter((field) => field.name !== "entityType");
  if (filtered.length === step.fields.length) return step;
  return { ...step, fields: filtered };
};

const injectSelectorIntoApplicantStep = (targetConfig: McapConfig): McapConfig => {
  const selectorFields = buildSelectorFields();
  const steps = (targetConfig.steps || []).map((step) => {
    const id = String(step.id || "").trim().toLowerCase();
    if (id === "company") {
      return stripLegacyEntityTypeField(step);
    }
    if (id !== "applicant") return step;
    const existingNames = new Set(
      (step.fields || [])
        .map((field) => String(field?.name || "").trim())
        .filter(Boolean)
    );
    if (existingNames.has(UAE_JURISDICTION_TYPE_FIELD)) return step;
    return {
      ...step,
      fields: [...selectorFields, ...(step.fields || [])],
    };
  });
  return { ...targetConfig, steps };
};

const seedEntityTypeForJurisdiction = (
  data: Record<string, any>,
  jurisdiction: UaeJurisdictionType
): Record<string, any> => ({
  ...data,
  entityType: ENTITY_TYPE_BY_JURISDICTION[jurisdiction],
});

type CreateUaeUnifiedConfigOptions = {
  baseConfig?: McapConfig;
};

export const createUaeUnifiedFullConfig = (
  options: CreateUaeUnifiedConfigOptions = {}
): McapConfig => {
  const baseConfig = options.baseConfig || UAE_IFZA_CONFIG;
  const withSelector = injectSelectorIntoApplicantStep(baseConfig);

  const onFieldChange = ({
    fieldName,
    prevValue,
    nextValue,
    paymentStatus,
  }: {
    fieldName: string;
    prevValue: any;
    nextValue: any;
    paymentStatus: string;
  }): McapFieldChangeAction | null => {
    if (fieldName !== UAE_JURISDICTION_TYPE_FIELD) return null;
    const previousType = normalizeJurisdictionType(prevValue);
    const nextType = normalizeJurisdictionType(nextValue);
    if (!previousType || !nextType || previousType === nextType) return null;
    if (isPaymentCompleted(paymentStatus)) {
      return {
        mode: "block",
        blockMessage: "uae.unified.jurisdictionChange.lockedAfterPayment",
      };
    }
    return { mode: "reset" };
  };

  return {
    id: UAE_UNIFIED_CONFIG_ID,
    countryCode: "UAE",
    countryName: "United Arab Emirates",
    currency: baseConfig.currency || "USD",
    title: UAE_FIXED_TITLE,
    steps: withSelector.steps,
    entityMeta: { ...(baseConfig.entityMeta || {}), ...AD_ENTITY_META },
    confirmationDetails: baseConfig.confirmationDetails,
    launcherEnabled: true,
    skipNormalization: false,
    seedData: {
      [UAE_UNIFIED_FLOW_VERSION_FIELD]: UAE_UNIFIED_FLOW_VERSION,
    },
    runtimeResolutionKeys: [UAE_JURISDICTION_TYPE_FIELD],
    resolveRuntimeConfig: ({ data }: McapRuntimeContext) => {
      const jurisdiction = resolveJurisdictionType(data || {});
      const mergedEntityMeta = {
        ...(baseConfig.entityMeta || {}),
        ...AD_ENTITY_META,
      };
      const resolved = injectSelectorIntoApplicantStep({
        ...baseConfig,
        entityMeta: mergedEntityMeta,
        seedData: {
          ...(baseConfig.seedData || {}),
          entityType: ENTITY_TYPE_BY_JURISDICTION[jurisdiction],
          [UAE_UNIFIED_FLOW_VERSION_FIELD]: UAE_UNIFIED_FLOW_VERSION,
        },
      });

      // Ensure computeFees sees the seeded entityType even if the caller
      // passes raw formData without our seed.
      let steps: McapStep[] = resolved.steps.map((step) => {
        if (!step.computeFees && !step.serviceItems) return step;
        const originalComputeFees = step.computeFees;
        const originalServiceItems = step.serviceItems;
        const next: McapStep = { ...step };
        if (originalComputeFees) {
          next.computeFees = (d, entityMeta) =>
            originalComputeFees(seedEntityTypeForJurisdiction(d || {}, jurisdiction), entityMeta);
        }
        if (typeof originalServiceItems === "function") {
          next.serviceItems = ((d: any, entityMeta: any) =>
            (originalServiceItems as any)(
              seedEntityTypeForJurisdiction(d || {}, jurisdiction),
              entityMeta
            )) as any;
        }
        return next;
      });

      if (jurisdiction === "abu-dhabi") {
        steps = overrideStepsForAbuDhabi(steps);
      }

      return {
        ...resolved,
        id: UAE_UNIFIED_CONFIG_ID,
        title: UAE_FIXED_TITLE,
        countryCode: "UAE",
        countryName: "United Arab Emirates",
        entityMeta: mergedEntityMeta,
        steps,
      };
    },
    resolveCountryContext: () => ({
      countryCode: "UAE",
      countryName: "United Arab Emirates",
    }),
    onFieldChange: ({ fieldName, prevValue, nextValue, paymentStatus }) =>
      onFieldChange({ fieldName, prevValue, nextValue, paymentStatus }),
  };
};
