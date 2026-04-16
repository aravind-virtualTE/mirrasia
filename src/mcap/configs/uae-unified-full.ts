/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  McapConfig,
  McapField,
  McapFieldChangeAction,
  McapRuntimeContext,
  McapStep,
} from "./types";
import { UAE_IFZA_CONFIG } from "./uae-ifza";

export const UAE_UNIFIED_CONFIG_ID = "uae-unified-full";
export const UAE_UNIFIED_FLOW_VERSION = "unified_v2";
export const UAE_UNIFIED_FLOW_VERSION_FIELD = "uaeFlowVersion";
export const UAE_JURISDICTION_TYPE_FIELD = "uaeJurisdictionType";
export const UAE_MEYDAN_JAFZA_ZONE_FIELD = "uaeMeydanJafzaZone";
const UAE_FIXED_TITLE = "uae.unified.title";
const UAE_SUPPORTED_CURRENCIES = ["USD", "HKD"];
const IFZA_COMPANY_NAME_HINT_CONTENT = "uae.unified.applicant.companyNameIfzaHint";
const RAK_PRICING_PENDING_CONTENT = "uae.unified.pricing.rakPending";

export type UaeJurisdictionType =
  | "dubai-ifza"
  | "abu-dhabi-mainland"
  | "meydan-jafza"
  | "ras-al-khaimah";

export type MeydanJafzaZone = "meydan" | "jafza";

type PricingKind = "government" | "service";

type QuantityControlMeta = {
  enabled?: boolean;
  min?: number;
  max?: number;
  unitLabel?: string;
};

type UaePricingLine = {
  id: string;
  label: string;
  amount: number;
  original: number;
  kind: PricingKind;
  mandatory?: boolean;
  info?: string;
  quantityControl?: QuantityControlMeta;
};

type UaeComputedFeeItem = {
  id: string;
  label: string;
  amount: number;
  original: number;
  kind: PricingKind;
  quantity: number;
  info?: string;
  unitLabel?: string;
};

const UAE_JURISDICTION_OPTIONS: Array<{ label: string; value: UaeJurisdictionType }> = [
  { label: "uae.unified.selector.ifza", value: "dubai-ifza" },
  { label: "uae.unified.selector.abuDhabiMainland", value: "abu-dhabi-mainland" },
  { label: "uae.unified.selector.meydanJafza", value: "meydan-jafza" },
  { label: "uae.unified.selector.rasAlKhaimah", value: "ras-al-khaimah" },
];

const MEYDAN_JAFZA_ZONE_OPTIONS: Array<{ label: string; value: MeydanJafzaZone }> = [
  { label: "uae.unified.selector.meydan", value: "meydan" },
  { label: "uae.unified.selector.jafza", value: "jafza" },
];

const ENTITY_TYPE_BY_JURISDICTION: Record<UaeJurisdictionType, string> = {
  "dubai-ifza": "UAE-IFZA-FZCO",
  "abu-dhabi-mainland": "UAE-AD-MAINLAND",
  "meydan-jafza": "UAE-MEYDAN-FZCO",
  "ras-al-khaimah": "UAE-RAK-PENDING",
};

const ENTITY_TYPE_BY_MEYDAN_JAFZA_ZONE: Record<MeydanJafzaZone, string> = {
  meydan: "UAE-MEYDAN-FZCO",
  jafza: "UAE-JAFZA-FZCO",
};

const UAE_ENTITY_META = {
  "UAE-IFZA-FZCO": {
    initialCostUSD: 8950,
    setupCostUSD: 3800,
    capital: "AED 10,000 (no upfront contribution obligation for incorporation)",
    office: "Registered office possible; physical office required for higher visa quotas",
    establishmentDays: "7-10 business days",
    visa: "Visa and ID processing available as optional add-ons",
    accounting: "Optional yearly bookkeeping and audit add-ons available",
    localSponsor: "Not required",
  },
  "UAE-AD-MAINLAND": {
    initialCostUSD: 23677.5,
    setupCostUSD: 12000,
    capital: "Activity-dependent (final quote after activity confirmation)",
    office: "Required (physical office lease)",
    establishmentDays: "3-4 weeks",
    visa: "Visa services available as optional add-ons",
    accounting: "Optional yearly bookkeeping and audit add-ons available",
    localSponsor: "Not required (mainland non-sponsor route)",
  },
  "UAE-MEYDAN-FZCO": {
    initialCostUSD: 3300,
    setupCostUSD: 3300,
    capital: "As per free zone package",
    office: "As per selected package",
    establishmentDays: "Estimated after package confirmation",
    visa: "Visa services available as optional add-ons",
    accounting: "Optional yearly bookkeeping and audit add-ons available",
    localSponsor: "Not required",
  },
  "UAE-JAFZA-FZCO": {
    initialCostUSD: 9310,
    setupCostUSD: 3300,
    capital: "As per free zone package",
    office: "As per selected package",
    establishmentDays: "Estimated after package confirmation",
    visa: "Visa services available as optional add-ons",
    accounting: "Optional yearly bookkeeping and audit add-ons available",
    localSponsor: "Not required",
  },
  "UAE-RAK-PENDING": {
    initialCostUSD: 0,
    setupCostUSD: 0,
    capital: "Pending admin pricing confirmation",
    office: "Pending admin pricing confirmation",
    establishmentDays: "Pending admin pricing confirmation",
    visa: "Pending admin pricing confirmation",
    accounting: "Pending admin pricing confirmation",
    localSponsor: "Pending admin pricing confirmation",
  },
};

const IFZA_MANDATORY_LINES: UaePricingLine[] = [
  {
    id: "ifza_license_with_visa",
    label: "uae.unified.services.ifza.licenseWithVisa",
    amount: 4605,
    original: 4605,
    kind: "government",
    mandatory: true,
    info: "uae.unified.services.ifza.licenseWithVisaInfo",
  },
  {
    id: "ifza_establishment_card",
    label: "uae.unified.services.ifza.establishmentCard",
    amount: 545,
    original: 545,
    kind: "government",
    mandatory: true,
    info: "uae.unified.services.ifza.establishmentCardInfo",
  },
  {
    id: "ifza_setup_license_handling",
    label: "uae.unified.services.ifza.setupHandling",
    amount: 3000,
    original: 3000,
    kind: "service",
    mandatory: true,
  },
  {
    id: "ifza_tax_vat_registration",
    label: "uae.unified.services.ifza.taxVatRegistration",
    amount: 800,
    original: 800,
    kind: "service",
    mandatory: true,
  },
];

const ABU_DHABI_MANDATORY_LINES: UaePricingLine[] = [
  {
    id: "ad_business_application",
    label: "uae.unified.services.ad.businessApplication",
    amount: 300,
    original: 300,
    kind: "government",
    mandatory: true,
  },
  {
    id: "ad_name_reservation",
    label: "uae.unified.services.ad.nameReservation",
    amount: 200,
    original: 200,
    kind: "government",
    mandatory: true,
  },
  {
    id: "ad_company_registration",
    label: "uae.unified.services.ad.companyRegistration",
    amount: 1500,
    original: 1500,
    kind: "government",
    mandatory: true,
  },
  {
    id: "ad_commercial_license",
    label: "uae.unified.services.ad.commercialLicense",
    amount: 4000,
    original: 4000,
    kind: "government",
    mandatory: true,
  },
  {
    id: "ad_business_activity_license",
    label: "uae.unified.services.ad.businessActivityLicense",
    amount: 4000,
    original: 4000,
    kind: "government",
    mandatory: true,
  },
  {
    id: "ad_info_protection",
    label: "uae.unified.services.ad.infoProtection",
    amount: 300,
    original: 300,
    kind: "government",
    mandatory: true,
  },
  {
    id: "ad_mailbox",
    label: "uae.unified.services.ad.mailbox",
    amount: 250,
    original: 250,
    kind: "government",
    mandatory: true,
  },
  {
    id: "ad_setup_consulting",
    label: "uae.unified.services.ad.consulting",
    amount: 9500,
    original: 9500,
    kind: "service",
    mandatory: true,
  },
  {
    id: "ad_bank_opening_support",
    label: "uae.unified.services.ad.bankIntro",
    amount: 2500,
    original: 2500,
    kind: "service",
    mandatory: true,
  },
  {
    id: "ad_vat_government",
    label: "uae.unified.services.ad.vatGovernment",
    amount: 527.5,
    original: 527.5,
    kind: "government",
    mandatory: true,
  },
  {
    id: "ad_vat_service",
    label: "uae.unified.services.ad.vatService",
    amount: 600,
    original: 600,
    kind: "service",
    mandatory: true,
  },
];

const MEYDAN_MANDATORY_LINES: UaePricingLine[] = [
  {
    id: "meydan_company_incorporation",
    label: "uae.unified.services.meydanJafza.meydan.companyIncorporationFee",
    amount: 2357,
    original: 2357,
    kind: "service",
    mandatory: true,
  },
  {
    id: "meydan_management_fee",
    label: "uae.unified.services.meydanJafza.meydan.managementFee",
    amount: 943,
    original: 943,
    kind: "service",
    mandatory: true,
  },
];

const JAFZA_MANDATORY_LINES: UaePricingLine[] = [
  {
    id: "jafza_registration_fee",
    label: "uae.unified.services.meydanJafza.jafza.registrationFee",
    amount: 6010,
    original: 6010,
    kind: "government",
    mandatory: true,
  },
  {
    id: "jafza_company_incorporation",
    label: "uae.unified.services.meydanJafza.jafza.companyIncorporationFee",
    amount: 2357,
    original: 2357,
    kind: "service",
    mandatory: true,
  },
  {
    id: "jafza_management_fee",
    label: "uae.unified.services.meydanJafza.jafza.managementFee",
    amount: 943,
    original: 943,
    kind: "service",
    mandatory: true,
  },
];

const UAE_OPTIONAL_ADD_ON_LINES: UaePricingLine[] = [
  {
    id: "uae_addon_medical_emirates_id",
    label: "uae.unified.services.addons.medicalEmiratesId",
    amount: 850,
    original: 850,
    kind: "service",
    mandatory: false,
    quantityControl: {
      enabled: true,
      min: 1,
      max: 50,
      unitLabel: "uae.unified.services.addons.units.person",
    },
  },
  {
    id: "uae_addon_fast_track_biometrics",
    label: "uae.unified.services.addons.fastTrackBiometrics",
    amount: 1600,
    original: 1600,
    kind: "service",
    mandatory: false,
    quantityControl: {
      enabled: true,
      min: 1,
      max: 50,
      unitLabel: "uae.unified.services.addons.units.request",
    },
  },
  {
    id: "uae_addon_visa_processing",
    label: "uae.unified.services.addons.visaProcessing",
    amount: 1600,
    original: 1600,
    kind: "service",
    mandatory: false,
    quantityControl: {
      enabled: true,
      min: 1,
      max: 50,
      unitLabel: "uae.unified.services.addons.units.person",
    },
  },
  {
    id: "uae_addon_visa_status_change",
    label: "uae.unified.services.addons.visaStatusChange",
    amount: 650,
    original: 650,
    kind: "service",
    mandatory: false,
    quantityControl: {
      enabled: true,
      min: 1,
      max: 50,
      unitLabel: "uae.unified.services.addons.units.request",
    },
  },
  {
    id: "uae_addon_investor_title_registration",
    label: "uae.unified.services.addons.investorTitleRegistration",
    amount: 450,
    original: 450,
    kind: "service",
    mandatory: false,
    quantityControl: {
      enabled: true,
      min: 1,
      max: 50,
      unitLabel: "uae.unified.services.addons.units.request",
    },
  },
  {
    id: "uae_addon_bank_setup_support",
    label: "uae.unified.services.addons.bankAccountSetupSupport",
    amount: 2500,
    original: 2500,
    kind: "service",
    mandatory: false,
    quantityControl: {
      enabled: true,
      min: 1,
      max: 20,
      unitLabel: "uae.unified.services.addons.units.request",
    },
  },
  {
    id: "uae_addon_extra_business_activity",
    label: "uae.unified.services.addons.extraBusinessActivity",
    amount: 550,
    original: 550,
    kind: "service",
    mandatory: false,
    quantityControl: {
      enabled: true,
      min: 1,
      max: 30,
      unitLabel: "uae.unified.services.addons.units.activity",
    },
  },
  {
    id: "uae_addon_bookkeeping",
    label: "uae.unified.services.addons.bookKeeping",
    amount: 6000,
    original: 6000,
    kind: "service",
    mandatory: false,
    quantityControl: {
      enabled: true,
      min: 1,
      max: 5,
      unitLabel: "uae.unified.services.addons.units.year",
    },
  },
  {
    id: "uae_addon_audit",
    label: "uae.unified.services.addons.audit",
    amount: 2000,
    original: 2000,
    kind: "service",
    mandatory: false,
    quantityControl: {
      enabled: true,
      min: 1,
      max: 5,
      unitLabel: "uae.unified.services.addons.units.year",
    },
  },
];

const roundMoney = (value: number) => Math.round(value * 100) / 100;

const normalizeJurisdictionType = (value: unknown): UaeJurisdictionType | null => {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "dubai-ifza"
    || normalized === "abu-dhabi-mainland"
    || normalized === "meydan-jafza"
    || normalized === "ras-al-khaimah"
    ? (normalized as UaeJurisdictionType)
    : null;
};

const normalizeMeydanJafzaZone = (value: unknown): MeydanJafzaZone | null => {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "meydan" || normalized === "jafza"
    ? (normalized as MeydanJafzaZone)
    : null;
};

const resolveJurisdictionType = (data: Record<string, any>): UaeJurisdictionType =>
  normalizeJurisdictionType(data?.[UAE_JURISDICTION_TYPE_FIELD]) || "dubai-ifza";

const resolveMeydanJafzaZone = (data: Record<string, any>): MeydanJafzaZone =>
  normalizeMeydanJafzaZone(data?.[UAE_MEYDAN_JAFZA_ZONE_FIELD]) || "meydan";

const resolveEntityTypeForData = (data: Record<string, any>) => {
  const jurisdiction = resolveJurisdictionType(data || {});
  if (jurisdiction === "meydan-jafza") {
    const zone = resolveMeydanJafzaZone(data || {});
    return ENTITY_TYPE_BY_MEYDAN_JAFZA_ZONE[zone];
  }
  return ENTITY_TYPE_BY_JURISDICTION[jurisdiction];
};

const isIfzaJurisdiction = (value: unknown) => normalizeJurisdictionType(value) === "dubai-ifza";

const isPaymentCompleted = (paymentStatus: unknown) =>
  String(paymentStatus || "").trim().toLowerCase() === "paid";

const getSelectedIds = (data: any): Set<string> => {
  const selected = new Set<string>();
  const optionalFeeIds = Array.isArray(data?.optionalFeeIds) ? data.optionalFeeIds : [];
  const serviceItemsSelected = Array.isArray(data?.serviceItemsSelected) ? data.serviceItemsSelected : [];
  optionalFeeIds.forEach((id: any) => selected.add(String(id)));
  serviceItemsSelected.forEach((id: any) => selected.add(String(id)));
  return selected;
};

const getPricingBaseLines = (
  jurisdiction: UaeJurisdictionType,
  meydanJafzaZone: MeydanJafzaZone
): UaePricingLine[] => {
  if (jurisdiction === "dubai-ifza") return IFZA_MANDATORY_LINES;
  if (jurisdiction === "abu-dhabi-mainland") return ABU_DHABI_MANDATORY_LINES;
  if (jurisdiction === "meydan-jafza") {
    return meydanJafzaZone === "jafza" ? JAFZA_MANDATORY_LINES : MEYDAN_MANDATORY_LINES;
  }
  return [];
};

const buildUaePricingLines = (
  jurisdiction: UaeJurisdictionType,
  meydanJafzaZone: MeydanJafzaZone
): UaePricingLine[] => {
  if (jurisdiction === "ras-al-khaimah") return [];
  return [...getPricingBaseLines(jurisdiction, meydanJafzaZone), ...UAE_OPTIONAL_ADD_ON_LINES];
};

const toServiceItemMeta = (line: UaePricingLine) => ({
  id: line.id,
  label: line.label,
  amount: line.amount,
  original: line.original,
  mandatory: line.mandatory !== false,
  info: line.info,
  kind: line.kind,
  ...(line.quantityControl ? { quantityControl: line.quantityControl, unitLabel: line.quantityControl.unitLabel } : {}),
});

const buildUaeServiceItems = (data: Record<string, any>) => {
  const jurisdiction = resolveJurisdictionType(data || {});
  if (jurisdiction === "ras-al-khaimah") return [];
  const zone = resolveMeydanJafzaZone(data || {});
  return buildUaePricingLines(jurisdiction, zone).map((line) => toServiceItemMeta(line)) as any;
};

const resolveQuantityForLine = (line: UaePricingLine, data: Record<string, any>, selectedIds: Set<string>) => {
  const quantityControl = line.quantityControl;
  if (!quantityControl?.enabled) {
    return line.mandatory !== false || selectedIds.has(line.id) ? 1 : 0;
  }

  const minQty = Math.max(1, Math.floor(Number(quantityControl.min || 1)));
  const maxQty = Math.max(minQty, Math.floor(Number(quantityControl.max || 99)));
  const rawQty = Number(data?.serviceQuantities?.[line.id]);
  const hasRawQty = Number.isFinite(rawQty) && rawQty > 0;
  const selected = selectedIds.has(line.id);
  const shouldInclude = line.mandatory !== false || selected || hasRawQty;
  if (!shouldInclude) return 0;

  const fallbackQty = Math.min(minQty, maxQty);
  const nextQty = hasRawQty ? Math.floor(rawQty) : fallbackQty;
  return Math.max(minQty, Math.min(maxQty, nextQty));
};

const buildPricedItems = (lines: UaePricingLine[], data: Record<string, any>): UaeComputedFeeItem[] => {
  const selectedIds = getSelectedIds(data);
  const items = lines
    .map((line) => {
      const quantity = resolveQuantityForLine(line, data, selectedIds);
      if (quantity <= 0) return null;
      return {
        id: line.id,
        label: line.label,
        amount: line.amount,
        original: line.original,
        kind: line.kind,
        quantity,
        ...(line.info ? { info: line.info } : {}),
        ...(line.quantityControl?.unitLabel ? { unitLabel: line.quantityControl.unitLabel } : {}),
      };
    })
    .filter((item): item is NonNullable<typeof item> => !!item);

  return items;
};

const sumByKind = (items: UaeComputedFeeItem[], kind: PricingKind) =>
  roundMoney(
    items
      .filter((item) => String(item.kind || "").toLowerCase() === kind)
      .reduce((sum, item) => sum + (Number(item.amount || 0) * Number(item.quantity || 1)), 0)
  );

const getJurisdictionPricingNote = (
  jurisdiction: UaeJurisdictionType,
  meydanJafzaZone: MeydanJafzaZone
) => {
  if (jurisdiction === "dubai-ifza") return "uae.unified.services.ifza.minimumCost";
  if (jurisdiction === "abu-dhabi-mainland") return "uae.unified.services.ad.note";
  if (jurisdiction === "meydan-jafza" && meydanJafzaZone === "jafza") {
    return "uae.unified.pricing.meydanJafza.jafzaNote";
  }
  if (jurisdiction === "meydan-jafza") return "uae.unified.pricing.meydanJafza.meydanNote";
  return "uae.unified.pricing.rakPending";
};

const computeUaeFees = (data: Record<string, any>) => {
  const jurisdiction = resolveJurisdictionType(data || {});
  if (jurisdiction === "ras-al-khaimah") {
    return {
      currency: "USD",
      paymentCurrency: String(data?.paymentCurrency || data?.currency || "USD").toUpperCase(),
      items: [],
      government: 0,
      service: 0,
      total: 0,
      cardFeePct: 0,
      cardFeeSurcharge: 0,
      grandTotal: 0,
      note: RAK_PRICING_PENDING_CONTENT,
    };
  }

  const zone = resolveMeydanJafzaZone(data || {});
  const lines = buildUaePricingLines(jurisdiction, zone);
  const items = buildPricedItems(lines, data || {});
  const government = sumByKind(items, "government");
  const service = sumByKind(items, "service");
  const total = roundMoney(government + service);

  const paymentCurrency = String(data?.paymentCurrency || data?.currency || "USD").toUpperCase();
  const cardFeePct = paymentCurrency === "HKD" ? 0.04 : 0.06;
  const cardFeeSurcharge = String(data?.payMethod || "").toLowerCase() === "card"
    ? roundMoney(total * cardFeePct)
    : 0;

  return {
    currency: "USD",
    paymentCurrency,
    items,
    government,
    service,
    total,
    cardFeePct,
    cardFeeSurcharge,
    grandTotal: roundMoney(total + cardFeeSurcharge),
    note: getJurisdictionPricingNote(jurisdiction, zone),
  };
};

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
    type: "select" as const,
    name: UAE_MEYDAN_JAFZA_ZONE_FIELD,
    label: "uae.unified.selector.meydanJafzaZoneLabel",
    required: true,
    options: MEYDAN_JAFZA_ZONE_OPTIONS,
    condition: (data: Record<string, any>) =>
      normalizeJurisdictionType(data?.[UAE_JURISDICTION_TYPE_FIELD]) === "meydan-jafza",
    colSpan: 2 as const,
  },
  {
    type: "info" as const,
    content: "uae.unified.pricing.meydanJafza.help",
    condition: (data: Record<string, any>) =>
      normalizeJurisdictionType(data?.[UAE_JURISDICTION_TYPE_FIELD]) === "meydan-jafza",
    colSpan: 2 as const,
  },
  {
    type: "info" as const,
    content: RAK_PRICING_PENDING_CONTENT,
    condition: (data: Record<string, any>) =>
      normalizeJurisdictionType(data?.[UAE_JURISDICTION_TYPE_FIELD]) === "ras-al-khaimah",
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

const injectIfzaCompanyNameHint = (fields: McapField[] = []): McapField[] => {
  if (!fields.length) return fields;

  const hasHint = fields.some(
    (field) => field.type === "info" && field.content === IFZA_COMPANY_NAME_HINT_CONTENT
  );
  if (hasHint) return fields;

  const hintField: McapField = {
    type: "info",
    content: IFZA_COMPANY_NAME_HINT_CONTENT,
    condition: (data: Record<string, any>) =>
      isIfzaJurisdiction(data?.[UAE_JURISDICTION_TYPE_FIELD]),
    colSpan: 2,
  };

  const nextFields: McapField[] = [];
  let inserted = false;
  fields.forEach((field) => {
    nextFields.push(field);
    if (!inserted && field.name === "companyName1") {
      nextFields.push(hintField);
      inserted = true;
    }
  });

  if (!inserted) {
    nextFields.unshift(hintField);
  }

  return nextFields;
};

const injectSelectorIntoApplicantStep = (targetConfig: McapConfig): McapConfig => {
  const selectorFields = buildSelectorFields();
  const steps = (targetConfig.steps || []).map((step) => {
    const id = String(step.id || "").trim().toLowerCase();
    if (id === "company") {
      return stripLegacyEntityTypeField(step);
    }
    if (id !== "applicant") return step;
    const applicantFields = injectIfzaCompanyNameHint(step.fields || []);
    const existingNames = new Set(
      applicantFields
        .map((field) => String(field?.name || "").trim())
        .filter(Boolean)
    );
    if (existingNames.has(UAE_JURISDICTION_TYPE_FIELD)) {
      return {
        ...step,
        fields: applicantFields,
      };
    }
    return {
      ...step,
      fields: [...selectorFields, ...applicantFields],
    };
  });
  return { ...targetConfig, steps };
};

const seedEntityTypeForData = (data: Record<string, any>): Record<string, any> => ({
  ...data,
  entityType: resolveEntityTypeForData(data),
});

const overrideUaePricingSteps = (steps: McapStep[]) =>
  steps.map((step) => {
    const id = String(step.id || "").trim().toLowerCase();
    if (id === "services") {
      return {
        ...step,
        serviceItems: (data: Record<string, any>) => buildUaeServiceItems(data || {}) as any,
      };
    }
    if (id === "invoice") {
      return {
        ...step,
        computeFees: (data: any) => computeUaeFees(seedEntityTypeForData(data || {})),
      };
    }
    if (id === "payment") {
      return {
        ...step,
        supportedCurrencies: UAE_SUPPORTED_CURRENCIES,
        computeFees: (data: any) => computeUaeFees(seedEntityTypeForData(data || {})),
      };
    }
    return step;
  });

const stripPricingStepsForRak = (steps: McapStep[]) =>
  steps.filter((step) => {
    const id = String(step.id || "").trim().toLowerCase();
    if (["services", "invoice", "payment"].includes(id)) return false;
    if (step.widget === "ServiceSelectionWidget" || step.widget === "InvoiceWidget" || step.widget === "PaymentWidget") {
      return false;
    }
    return true;
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
    data,
  }: {
    fieldName: string;
    prevValue: any;
    nextValue: any;
    paymentStatus: string;
    data?: Record<string, any>;
  }): McapFieldChangeAction | null => {
    if (fieldName !== UAE_JURISDICTION_TYPE_FIELD && fieldName !== UAE_MEYDAN_JAFZA_ZONE_FIELD) {
      return null;
    }

    if (fieldName === UAE_MEYDAN_JAFZA_ZONE_FIELD) {
      const currentJurisdiction = resolveJurisdictionType(data || {});
      if (currentJurisdiction !== "meydan-jafza") return null;
      const previousZone = normalizeMeydanJafzaZone(prevValue);
      const nextZone = normalizeMeydanJafzaZone(nextValue);
      if (!previousZone || !nextZone || previousZone === nextZone) return null;
      if (isPaymentCompleted(paymentStatus)) {
        return {
          mode: "block",
          blockMessage: "uae.unified.jurisdictionChange.lockedAfterPayment",
        };
      }
      return { mode: "reset" };
    }

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
    currency: "USD",
    title: UAE_FIXED_TITLE,
    steps: withSelector.steps,
    entityMeta: { ...(baseConfig.entityMeta || {}), ...UAE_ENTITY_META },
    confirmationDetails: baseConfig.confirmationDetails,
    launcherEnabled: true,
    skipNormalization: false,
    seedData: {
      [UAE_UNIFIED_FLOW_VERSION_FIELD]: UAE_UNIFIED_FLOW_VERSION,
      [UAE_JURISDICTION_TYPE_FIELD]: "dubai-ifza",
    },
    runtimeResolutionKeys: [UAE_JURISDICTION_TYPE_FIELD, UAE_MEYDAN_JAFZA_ZONE_FIELD],
    resolveRuntimeConfig: ({ data }: McapRuntimeContext) => {
      const seededData = seedEntityTypeForData(data || {});
      const jurisdiction = resolveJurisdictionType(seededData);
      const resolved = injectSelectorIntoApplicantStep({
        ...baseConfig,
        entityMeta: { ...(baseConfig.entityMeta || {}), ...UAE_ENTITY_META },
        seedData: {
          ...(baseConfig.seedData || {}),
          entityType: resolveEntityTypeForData(seededData),
          [UAE_UNIFIED_FLOW_VERSION_FIELD]: UAE_UNIFIED_FLOW_VERSION,
          [UAE_JURISDICTION_TYPE_FIELD]: seededData?.[UAE_JURISDICTION_TYPE_FIELD] || "dubai-ifza",
          [UAE_MEYDAN_JAFZA_ZONE_FIELD]: seededData?.[UAE_MEYDAN_JAFZA_ZONE_FIELD],
        },
      });

      let steps = overrideUaePricingSteps(resolved.steps.map((step) => ({ ...step })));
      if (jurisdiction === "ras-al-khaimah") {
        steps = stripPricingStepsForRak(steps);
      }

      return {
        ...resolved,
        id: UAE_UNIFIED_CONFIG_ID,
        title: UAE_FIXED_TITLE,
        countryCode: "UAE",
        countryName: "United Arab Emirates",
        currency: "USD",
        entityMeta: { ...(baseConfig.entityMeta || {}), ...UAE_ENTITY_META },
        steps,
      };
    },
    resolveCountryContext: () => ({
      countryCode: "UAE",
      countryName: "United Arab Emirates",
    }),
    onFieldChange: ({ fieldName, prevValue, nextValue, paymentStatus, data }) =>
      onFieldChange({ fieldName, prevValue, nextValue, paymentStatus, data }),
  };
};
