/* eslint-disable @typescript-eslint/no-explicit-any */

export const CORRESPONDENCE_SERVICE_FIELD = "useCorrespondenceAddressService";
export const CORRESPONDENCE_SERVICE_ID = "corr_addr";
export const DEFAULT_CORRESPONDENCE_SERVICE_PRICE = 150;
export const CORRESPONDENCE_SERVICE_PRICE_BY_COUNTRY: Record<string, number> = {
  HK: 65,
};

const ELIGIBLE_CORRESPONDENCE_ROLES = new Set(["director", "shareholder", "member", "dcp"]);
const DEFAULT_UNIT_LABEL = "newHk.fees.units.person";
const DEFAULT_LABEL = "newHk.fees.items.corr_addr.label";
const DEFAULT_INFO =
  "Optional service selected per party in Party details or Party KYC for correspondence handling.";

const round2 = (value: number) => Number(value.toFixed(2));

export const normalizeMcapCountryCode = (countryCode?: string) =>
  String(countryCode || "").split("_")[0].trim().toUpperCase();

export const normalizePartyRoles = (roles: unknown) =>
  Array.isArray(roles)
    ? roles
        .map((role) => String(role || "").trim().toLowerCase())
        .filter(Boolean)
    : [];

export const isCorrespondenceServiceEligibleRoles = (roles: unknown) =>
  normalizePartyRoles(roles).some((role) => ELIGIBLE_CORRESPONDENCE_ROLES.has(role));

const isEnabledFlag = (value: any) => {
  if (typeof value === "boolean") return value;
  const normalized = String(value || "").trim().toLowerCase();
  return ["true", "yes", "1", "on"].includes(normalized);
};

export const isCorrespondenceServiceSelected = (source: any) =>
  isEnabledFlag(source?.details?.[CORRESPONDENCE_SERVICE_FIELD] ?? source?.[CORRESPONDENCE_SERVICE_FIELD]);

export const getCorrespondenceServicePrice = (countryCode?: string) => {
  const normalizedCountryCode = normalizeMcapCountryCode(countryCode);
  return CORRESPONDENCE_SERVICE_PRICE_BY_COUNTRY[normalizedCountryCode] ?? DEFAULT_CORRESPONDENCE_SERVICE_PRICE;
};

export const getCorrespondenceServicePartyRoleSet = (party: any) => {
  const rootRoles = Array.isArray(party?.roles) ? party.roles : [];
  const detailRoles = Array.isArray(party?.details?.roles) ? party.details.roles : [];
  return new Set(normalizePartyRoles([...rootRoles, ...detailRoles]));
};

export const getCorrespondenceServiceCounts = (
  parties: any[],
  args?: {
    countryCode?: string;
    useHkDcpHeadcountPricing?: boolean;
  }
) => {
  const list = Array.isArray(parties) ? parties : [];
  const normalizedCountryCode = normalizeMcapCountryCode(args?.countryCode);
  let correspondenceCount = 0;
  let dcpCount = 0;

  list.forEach((party) => {
    if (!isCorrespondenceServiceSelected(party)) return;

    const roles = getCorrespondenceServicePartyRoleSet(party);
    if (!isCorrespondenceServiceEligibleRoles(Array.from(roles))) return;

    if (normalizedCountryCode === "HK" && roles.has("dcp") && args?.useHkDcpHeadcountPricing) {
      dcpCount += 1;
      return;
    }

    correspondenceCount += 1;
  });

  return { correspondenceCount, dcpCount };
};

export const buildCorrespondenceServiceFeeItem = (countryCode?: string) => {
  const amount = getCorrespondenceServicePrice(countryCode);
  return {
    id: CORRESPONDENCE_SERVICE_ID,
    label: DEFAULT_LABEL,
    amount,
    original: amount,
    mandatory: false,
    info: DEFAULT_INFO,
    managedByPartyKyc: true,
    unitLabel: DEFAULT_UNIT_LABEL,
    currency: "USD",
    kind: "service" as const,
  };
};

export const upsertCorrespondenceServiceItem = (items: any[], countryCode?: string) => {
  const list = Array.isArray(items) ? items : [];
  const baseItem = buildCorrespondenceServiceFeeItem(countryCode);
  let found = false;

  const nextItems = list.map((item) => {
    if (String(item?.id || "") !== CORRESPONDENCE_SERVICE_ID) return item;
    found = true;
    return {
      ...item,
      ...baseItem,
      label: item?.label || baseItem.label,
      info: item?.info || baseItem.info,
      mandatory: item?.mandatory ?? baseItem.mandatory,
      kind: item?.kind || baseItem.kind,
      unitLabel: item?.unitLabel || baseItem.unitLabel,
    };
  });

  if (found) return nextItems;
  return [...nextItems, baseItem];
};

export const applyCorrespondenceServiceFeeToFees = (
  fees: any,
  args: {
    countryCode?: string;
    parties?: any[];
    payMethod?: any;
    useHkDcpHeadcountPricing?: boolean;
  }
) => {
  if (!fees || typeof fees !== "object") return fees;

  const baseItems = Array.isArray(fees.items) ? fees.items : [];
  const normalizedCountryCode = normalizeMcapCountryCode(args.countryCode);
  const { correspondenceCount } = getCorrespondenceServiceCounts(args.parties || [], {
    countryCode: normalizedCountryCode,
    useHkDcpHeadcountPricing: args.useHkDcpHeadcountPricing,
  });
  const hasExistingItem = baseItems.some((item: any) => String(item?.id || "") === CORRESPONDENCE_SERVICE_ID);
  if (!hasExistingItem && correspondenceCount <= 0) return fees;

  const baseItem = buildCorrespondenceServiceFeeItem(normalizedCountryCode);
  const currency = String(fees.currency || "USD").toUpperCase();
  const originalCurrency = String(
    fees.originalCurrency || (fees.originalAmountUsd !== undefined ? "USD" : currency)
  ).toUpperCase();
  const exchangeRateUsed = Number(fees.exchangeRateUsed || 0);
  const usesConvertedDisplay =
    originalCurrency !== currency && Number.isFinite(exchangeRateUsed) && exchangeRateUsed > 0;
  const unitAmount = usesConvertedDisplay ? round2(baseItem.amount * exchangeRateUsed) : baseItem.amount;
  const existingItem = baseItems.find((item: any) => String(item?.id || "") === CORRESPONDENCE_SERVICE_ID);
  const existingQuantity = existingItem ? Math.max(0, Number(existingItem.quantity || 1)) : 0;

  const nextItems = baseItems.filter((item: any) => String(item?.id || "") !== CORRESPONDENCE_SERVICE_ID);
  if (correspondenceCount > 0) {
    nextItems.push({
      ...baseItem,
      amount: unitAmount,
      original: unitAmount,
      quantity: correspondenceCount,
    });
  }

  const government = nextItems
    .filter((item: any) => String(item?.kind || "").toLowerCase() === "government")
    .reduce((sum: number, item: any) => sum + (Number(item?.amount || 0) * Number(item?.quantity || 1)), 0);
  const total = nextItems.reduce(
    (sum: number, item: any) => sum + (Number(item?.amount || 0) * Number(item?.quantity || 1)),
    0
  );
  const service = round2(total - government);
  const cardFeePct = Number(fees.cardFeePct ?? (currency === "HKD" ? 0.04 : 0.06));
  const payMethod = String(args.payMethod || "").trim().toLowerCase();
  const cardFeeSurcharge = payMethod === "card" ? round2(total * cardFeePct) : 0;
  const grandTotal = round2(total + cardFeeSurcharge);
  const baseAmountTotal = round2(baseItem.amount * correspondenceCount);

  const nextFees = {
    ...fees,
    items: nextItems,
    currency,
    government: round2(government),
    service,
    total: round2(total),
    cardFeePct,
    cardFeeSurcharge,
    grandTotal,
  };

  if (fees.originalAmountUsd !== undefined) {
    const previousBaseAmountTotal = round2(baseItem.amount * existingQuantity);
    nextFees.originalAmountUsd = round2(Number(fees.originalAmountUsd || 0) - previousBaseAmountTotal + baseAmountTotal);
  } else if (fees.originalAmount !== undefined) {
    const originalUnitAmount = usesConvertedDisplay ? baseItem.amount : unitAmount;
    const originalAmountTotal = round2(originalUnitAmount * correspondenceCount);
    const previousOriginalUnitAmount = usesConvertedDisplay
      ? baseItem.amount
      : Number(existingItem?.amount || unitAmount);
    const previousOriginalAmountTotal = round2(previousOriginalUnitAmount * existingQuantity);
    nextFees.originalAmount = round2(
      Number(fees.originalAmount || 0) - previousOriginalAmountTotal + originalAmountTotal
    );
  }

  return nextFees;
};
