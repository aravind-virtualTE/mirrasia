/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getPricingBaseCurrency } from "@/services/exchangeRate";
import type { McapFeeItem, McapFees } from "./configs/types";
import { normalizeMcapCountryCode } from "./correspondenceService";

export const ADDITIONAL_EXECUTIVE_KYC_FIELD = "useAdditionalExecutiveKycService";
export const ADDITIONAL_EXECUTIVE_USD_TO_BASE_RATE_FIELD = "additionalExecutiveUsdToBaseRate";
export const ADDITIONAL_EXECUTIVE_USD_TO_BASE_CURRENCY_FIELD = "additionalExecutiveUsdToBaseCurrency";
export const ADDITIONAL_EXECUTIVE_INDIVIDUALS_ID = "additional_executive_individuals";
export const ADDITIONAL_EXECUTIVE_CORPORATES_ID = "additional_executive_corporates";
export const ADDITIONAL_EXECUTIVE_ITEM_IDS = new Set([
  ADDITIONAL_EXECUTIVE_INDIVIDUALS_ID,
  ADDITIONAL_EXECUTIVE_CORPORATES_ID,
]);

const DEFAULT_RATES = {
  individual: 100,
  corporate: 150,
};

const HK_RATES = {
  individual: 65,
  corporate: 130,
};

const POLICY_CURRENCY = "USD";

const round2 = (value: number) => Number(Number(value || 0).toFixed(2));

const toQuantity = (value: any) => {
  const parsed = Number(value || 0);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.floor(parsed);
};

const toTotal = (items: any[]) =>
  items.reduce((sum, item) => {
    const rawQuantity = item?.quantity === undefined ? 1 : item.quantity;
    const quantity = Math.max(0, toQuantity(rawQuantity));
    return sum + (Number(item?.amount || 0) * quantity);
  }, 0);

const isEnabledFlag = (value: any) => {
  if (typeof value === "boolean") return value;
  const normalized = String(value || "").trim().toLowerCase();
  return ["true", "yes", "1", "on"].includes(normalized);
};

export const isAdditionalExecutiveKycEnabled = (source: any) =>
  isEnabledFlag(source?.[ADDITIONAL_EXECUTIVE_KYC_FIELD]);

export const getAdditionalExecutiveRates = (countryCode?: string) => {
  const normalizedCountryCode = normalizeMcapCountryCode(countryCode);
  return normalizedCountryCode === "HK" ? HK_RATES : DEFAULT_RATES;
};

export const getAdditionalExecutiveUsdToBaseRate = (countryCode: string | undefined, source?: any) => {
  const pricingBaseCurrency = getPricingBaseCurrency(countryCode);
  if (pricingBaseCurrency === POLICY_CURRENCY) return 1;

  const targetCurrency = String(source?.[ADDITIONAL_EXECUTIVE_USD_TO_BASE_CURRENCY_FIELD] || "").toUpperCase();
  const parsedRate = Number(source?.[ADDITIONAL_EXECUTIVE_USD_TO_BASE_RATE_FIELD] || 0);
  if (
    Number.isFinite(parsedRate)
    && parsedRate > 0
    && (!targetCurrency || targetCurrency === pricingBaseCurrency)
  ) {
    return parsedRate;
  }

  return 0;
};

export const getAdditionalExecutiveCounts = (countryCode: string | undefined, parties: any[]) => {
  const list = Array.isArray(parties) ? parties : [];
  const isHK = normalizeMcapCountryCode(countryCode) === "HK";
  const billableParties = isHK ? list.slice(2) : list;
  
  const corporateCount = billableParties.filter((party) => party?.type === "entity" || party?.isCorp === true).length;
  const individualCount = Math.max(0, billableParties.length - corporateCount);
  return {
    individualCount,
    corporateCount,
    individualPacks: Math.ceil(individualCount / 2),
    corporatePacks: Math.ceil(corporateCount / 2),
  };
};

export const getAdditionalExecutivePreview = (
  countryCode: string | undefined,
  parties: any[],
  options?: {
    usdToBaseRate?: number;
  }
) => {
  const counts = getAdditionalExecutiveCounts(countryCode, parties);
  const pricingBaseCurrency = getPricingBaseCurrency(countryCode);
  const usdToBaseRate = pricingBaseCurrency === POLICY_CURRENCY
    ? 1
    : Number(options?.usdToBaseRate || 0);
  const rateMultiplier = pricingBaseCurrency === POLICY_CURRENCY
    ? 1
    : (Number.isFinite(usdToBaseRate) && usdToBaseRate > 0 ? usdToBaseRate : 1);
  const usdRates = getAdditionalExecutiveRates(countryCode);
  const rates = {
    individual: round2(usdRates.individual * rateMultiplier),
    corporate: round2(usdRates.corporate * rateMultiplier),
  };
  const individualSubtotal = counts.individualPacks * rates.individual;
  const corporateSubtotal = counts.corporatePacks * rates.corporate;

  return {
    ...counts,
    pricingBaseCurrency,
    policyCurrency: POLICY_CURRENCY,
    usdRates,
    rates,
    individualSubtotal,
    corporateSubtotal,
    total: individualSubtotal + corporateSubtotal,
  };
};

const buildManagedItem = (
  id: string,
  label: string,
  info: string,
  rate: number,
  quantity: number
) => ({
  id,
  label,
  amount: rate,
  original: rate,
  info,
  mandatory: false,
  managedByPartyData: true,
  unitLabel: "service.additionalExecutive.packUnit",
  kind: "service" as const,
  quantity,
});

export const buildAdditionalExecutiveServiceItems = (
  countryCode: string | undefined,
  parties: any[],
  enabled: boolean,
  options?: {
    usdToBaseRate?: number;
  }
) => {
  if (!enabled) return [];

  const preview = getAdditionalExecutivePreview(countryCode, parties, options);
  const items: Array<McapFeeItem & { managedByPartyData?: boolean; mandatory?: boolean; unitLabel?: string }> = [];

  if (preview.individualPacks > 0) {
    items.push(
      buildManagedItem(
        ADDITIONAL_EXECUTIVE_INDIVIDUALS_ID,
        "service.additionalExecutive.individualItemLabel",
        "service.additionalExecutive.individualItemInfo",
        preview.rates.individual,
        preview.individualPacks
      )
    );
  }

  if (preview.corporatePacks > 0) {
    items.push(
      buildManagedItem(
        ADDITIONAL_EXECUTIVE_CORPORATES_ID,
        "service.additionalExecutive.corporateItemLabel",
        "service.additionalExecutive.corporateItemInfo",
        preview.rates.corporate,
        preview.corporatePacks
      )
    );
  }

  return items;
};

const resolveBaseTotal = (
  fees: McapFees,
  baseCurrency: string,
  displayCurrency: string,
  displayRate: number
) => {
  const originalCurrency = String(
    fees?.originalCurrency || (fees?.originalAmountUsd !== undefined ? "USD" : baseCurrency)
  ).toUpperCase();

  if (originalCurrency === baseCurrency && Number.isFinite(Number(fees?.originalAmount))) {
    return Number(fees?.originalAmount);
  }

  if (baseCurrency === "USD" && Number.isFinite(Number(fees?.originalAmountUsd))) {
    return Number(fees?.originalAmountUsd);
  }

  if (displayCurrency === baseCurrency && Number.isFinite(Number(fees?.total))) {
    return Number(fees?.total);
  }

  if (
    displayCurrency !== baseCurrency
    && displayRate > 0
    && Number.isFinite(Number(fees?.total))
  ) {
    return round2(Number(fees?.total) / displayRate);
  }

  return undefined;
};

const getDisplayRate = (fees: McapFees, baseCurrency: string, displayCurrency: string) => {
  if (displayCurrency === baseCurrency) return 1;
  const explicitRate = Number(fees?.exchangeRateUsed || 0);
  if (Number.isFinite(explicitRate) && explicitRate > 0) return explicitRate;
  return 1;
};

const getBaseCurrencyForFees = (fees: McapFees, countryCode?: string) => {
  const countryBaseCurrency = getPricingBaseCurrency(countryCode);
  const explicitOriginalCurrency = String(fees?.originalCurrency || "").toUpperCase();
  if (explicitOriginalCurrency) return explicitOriginalCurrency;
  if (fees?.originalAmountUsd !== undefined) return "USD";

  const displayCurrency = String(fees?.currency || countryBaseCurrency).toUpperCase();
  const explicitRate = Number(fees?.exchangeRateUsed || 0);
  if (Number.isFinite(explicitRate) && explicitRate > 0) {
    return countryBaseCurrency;
  }

  return displayCurrency || countryBaseCurrency;
};

export const applyAdditionalExecutiveFeesToFees = (
  fees: McapFees | undefined,
  args: {
    countryCode?: string;
    parties?: any[];
    payMethod?: string;
    enabled?: boolean;
    usdToBaseRate?: number;
  }
) => {
  if (!fees) return fees;

  const baseCurrency = getBaseCurrencyForFees(fees, args.countryCode);
  const displayCurrency = String(fees.currency || baseCurrency).toUpperCase();
  const enabled = !!args.enabled;
  const displayRate = getDisplayRate(fees, baseCurrency, displayCurrency);
  const sourceItems = Array.isArray(fees.items) ? fees.items : [];
  const existingAdditionalItems = sourceItems.filter((item) => ADDITIONAL_EXECUTIVE_ITEM_IDS.has(String(item?.id || "")));
  const nextBaseItems = sourceItems.filter((item) => !ADDITIONAL_EXECUTIVE_ITEM_IDS.has(String(item?.id || "")));
  const additionalBaseItems = buildAdditionalExecutiveServiceItems(args.countryCode, args.parties || [], enabled, {
    usdToBaseRate: args.usdToBaseRate,
  });
  const additionalDisplayItems = additionalBaseItems.map((item) => ({
    ...item,
    amount: round2(Number(item.amount || 0) * displayRate),
    original: round2(Number((item.original ?? item.amount) || 0) * displayRate),
  }));
  const nextItems = [...nextBaseItems, ...additionalDisplayItems];

  const government = round2(
    toTotal(nextItems.filter((item) => String(item?.kind || "service").toLowerCase() === "government"))
  );
  const total = round2(
    toTotal(nextItems.filter((item) => String(item?.kind || "").toLowerCase() !== "surcharge"))
  );
  const service = round2(total - government);

  const payMethod = String(args.payMethod || "card").toLowerCase();
  const cardFeePct = Number(fees?.cardFeePct || (displayCurrency === "HKD" ? 0.04 : 0.06));
  const cardFeeSurcharge = payMethod === "card" ? round2(total * cardFeePct) : 0;
  const grandTotal = round2(total + cardFeeSurcharge);

  const preview = getAdditionalExecutivePreview(args.countryCode, args.parties || [], {
    usdToBaseRate: args.usdToBaseRate,
  });
  const nextAdditionalBaseTotal = enabled ? preview.total : 0;
  const existingAdditionalDisplayTotal = round2(toTotal(existingAdditionalItems));
  const existingAdditionalBaseTotal = displayCurrency === baseCurrency
    ? existingAdditionalDisplayTotal
    : round2(existingAdditionalDisplayTotal / displayRate);
  const resolvedBaseTotal = resolveBaseTotal(fees, baseCurrency, displayCurrency, displayRate);
  const nextOriginalAmount = resolvedBaseTotal === undefined
    ? (displayCurrency === baseCurrency ? total : undefined)
    : round2(Math.max(0, resolvedBaseTotal - existingAdditionalBaseTotal) + nextAdditionalBaseTotal);

  const originalCurrency = String(
    fees?.originalCurrency || (fees?.originalAmountUsd !== undefined ? "USD" : baseCurrency)
  ).toUpperCase();
  const { originalAmountUsd: _originalAmountUsd, ...restFees } = fees;

  return {
    ...restFees,
    currency: displayCurrency,
    items: nextItems,
    government,
    service,
    total,
    cardFeePct,
    cardFeeSurcharge,
    grandTotal,
    originalCurrency,
    ...(nextOriginalAmount !== undefined ? { originalAmount: nextOriginalAmount } : {}),
    ...(baseCurrency === "USD" && nextOriginalAmount !== undefined ? { originalAmountUsd: nextOriginalAmount } : {}),
  };
};
