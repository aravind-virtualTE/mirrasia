import type { CountryRegion, PricingItem } from "./pricing";
import { initialPricingData } from "./pricingData";
import type { ServicePricingOverride } from "./pricingApi";

const normalize = (value: any) => String(value ?? "").trim().toLowerCase();

const normalizeCountryCode = (value: any) => String(value ?? "").trim().toUpperCase();

const normalizeEntityType = (value: any) => {
    const base = normalize(value);
    if (!base) return "";
    if (base.includes("llc")) return "llc";
    if (base.includes("corporation")) return "corporation";
    if (base.includes("company")) return "company";
    return base;
};

const toNumberFlexible = (value: any) => {
    const direct = Number(value);
    if (Number.isFinite(direct)) return direct;
    const cleaned = String(value ?? "").replace(/[^0-9.-]/g, "");
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : NaN;
};

const extractOverrideAmount = (pricing: Record<string, any> | undefined) => {
    if (!pricing || typeof pricing !== "object") return NaN;
    const candidates = [
        pricing.amount,
        pricing.service_fee,
        pricing.government_fees,
        pricing.total_first_year,
        pricing.annual_renewal,
    ];
    for (const candidate of candidates) {
        const parsed = toNumberFlexible(candidate);
        if (Number.isFinite(parsed)) return parsed;
    }

    for (const [key, value] of Object.entries(pricing)) {
        if (["currency", "timeline", "notes"].includes(key)) continue;
        const parsed = toNumberFlexible(value);
        if (Number.isFinite(parsed)) return parsed;
    }

    return NaN;
};

const toServiceOverride = (item: PricingItem, regionCode: string): ServicePricingOverride | null => {
    const serviceId = String(item.serviceId || "").trim();
    if (!serviceId) return null;
    if (item.active === false) return null;

    const amount = extractOverrideAmount(item.pricing as Record<string, any>);
    if (!Number.isFinite(amount)) return null;

    return {
        countryCode: normalizeCountryCode(item.countryCode || regionCode),
        serviceId,
        state: String(item.state || "").trim(),
        entityType: String(item.entityType || "").trim(),
        amount,
        currency: String(item.pricing?.currency || "USD").trim().toUpperCase(),
        pricing: item.pricing as Record<string, any>,
        itemName: item.name,
    };
};

export const serviceOverridesFromRegions = (regions: CountryRegion[]): ServicePricingOverride[] => {
    if (!Array.isArray(regions)) return [];
    const overrides: ServicePricingOverride[] = [];
    regions.forEach((region) => {
        const regionCode = normalizeCountryCode(region?.code);
        const items = Array.isArray(region?.items) ? region.items : [];
        items.forEach((item) => {
            const override = toServiceOverride(item, regionCode);
            if (override) overrides.push(override);
        });
    });
    return overrides;
};

const DEFAULT_OVERRIDES = serviceOverridesFromRegions(initialPricingData);

export const getDefaultServicePricingOverridesByCountry = (countryCode?: string): ServicePricingOverride[] => {
    const normalizedCountry = normalizeCountryCode(countryCode);
    if (!normalizedCountry) return [...DEFAULT_OVERRIDES];
    return DEFAULT_OVERRIDES.filter((entry) => normalizeCountryCode(entry.countryCode) === normalizedCountry);
};

const mergeBySpecificity = (entries: ServicePricingOverride[]) => {
    if (entries.length <= 1) return entries;
    return [...entries].sort((a, b) => {
        const score = (entry: ServicePricingOverride) => {
            let weight = 0;
            if (normalize(entry.state)) weight += 2;
            if (normalizeEntityType(entry.entityType)) weight += 2;
            return weight;
        };
        return score(b) - score(a);
    });
};

export const mergeServicePricingOverridesByCountry = (
    countryCode: string,
    remote: ServicePricingOverride[] = []
): ServicePricingOverride[] => {
    const fallback = getDefaultServicePricingOverridesByCountry(countryCode);
    if (!Array.isArray(remote) || remote.length === 0) return fallback;

    const filteredRemote = remote.filter(
        (entry) => normalizeCountryCode(entry.countryCode) === normalizeCountryCode(countryCode)
    );
    if (filteredRemote.length === 0) return fallback;

    const mergedMap = new Map<string, ServicePricingOverride>();
    const put = (entry: ServicePricingOverride) => {
        const key = [
            normalizeCountryCode(entry.countryCode),
            normalize(entry.serviceId),
            normalize(entry.state),
            normalizeEntityType(entry.entityType),
        ].join("|");
        mergedMap.set(key, entry);
    };

    fallback.forEach(put);
    filteredRemote.forEach(put);
    return Array.from(mergedMap.values());
};

type ResolveOverrideInput = {
    overrides: ServicePricingOverride[];
    countryCode: string;
    serviceId: string;
    state?: string;
    entityType?: string;
};

export const resolveServicePricingOverride = ({
    overrides,
    countryCode,
    serviceId,
    state,
    entityType,
}: ResolveOverrideInput): ServicePricingOverride | null => {
    if (!Array.isArray(overrides) || overrides.length === 0) return null;

    const normalizedCountry = normalizeCountryCode(countryCode);
    const normalizedService = normalize(serviceId);
    const normalizedState = normalize(state);
    const normalizedEntity = normalizeEntityType(entityType);

    const candidates = overrides.filter((entry) => {
        if (normalizeCountryCode(entry.countryCode) !== normalizedCountry) return false;
        if (normalize(entry.serviceId) !== normalizedService) return false;

        const entryState = normalize(entry.state);
        if (entryState && entryState !== normalizedState) return false;

        const entryEntity = normalizeEntityType(entry.entityType);
        if (entryEntity && entryEntity !== normalizedEntity) return false;

        return true;
    });

    if (candidates.length === 0) return null;
    return mergeBySpecificity(candidates)[0] || null;
};

type OverrideCurrencyInput = {
    amount: number;
    overrideCurrency?: string;
    targetCurrency?: string;
    exchangeRateUsed?: number;
};

const convertOverrideAmount = ({
    amount,
    overrideCurrency,
    targetCurrency,
    exchangeRateUsed,
}: OverrideCurrencyInput) => {
    const source = normalizeCountryCode(overrideCurrency || targetCurrency || "USD");
    const target = normalizeCountryCode(targetCurrency || source);
    if (source === target) return Number(amount.toFixed(2));

    const fx = Number(exchangeRateUsed || 0);
    if (!(Number.isFinite(fx) && fx > 0)) return Number(amount.toFixed(2));

    if (source === "USD" && target === "HKD") return Number((amount * fx).toFixed(2));
    if (source === "HKD" && target === "USD") return Number((amount / fx).toFixed(2));
    return Number(amount.toFixed(2));
};

type ApplyItemInput = {
    item: any;
    countryCode: string;
    state?: string;
    entityType?: string;
    overrides: ServicePricingOverride[];
    targetCurrency?: string;
    exchangeRateUsed?: number;
};

const applyOverrideOnItem = ({
    item,
    countryCode,
    state,
    entityType,
    overrides,
    targetCurrency,
    exchangeRateUsed,
}: ApplyItemInput) => {
    const serviceId = String(item?.id || item?.serviceId || "").trim();
    if (!serviceId) return { item, matched: false };

    const matched = resolveServicePricingOverride({
        overrides,
        countryCode,
        serviceId,
        state,
        entityType,
    });
    if (!matched) return { item, matched: false };

    const nextAmount = convertOverrideAmount({
        amount: Number(matched.amount || 0),
        overrideCurrency: matched.currency,
        targetCurrency,
        exchangeRateUsed,
    });

    const nextItem = {
        ...item,
        amount: nextAmount,
        ...(item?.original !== undefined ? { original: nextAmount } : { original: nextAmount }),
    };
    return { item: nextItem, matched: true };
};

export const applyServicePricingOverridesToItems = (
    items: any[],
    args: {
        overrides: ServicePricingOverride[];
        countryCode: string;
        state?: string;
        entityType?: string;
        targetCurrency?: string;
        exchangeRateUsed?: number;
    }
) => {
    if (!Array.isArray(items) || items.length === 0) return { items: Array.isArray(items) ? items : [], changed: false };

    let changed = false;
    const nextItems = items.map((item) => {
        const updated = applyOverrideOnItem({
            item,
            countryCode: args.countryCode,
            state: args.state,
            entityType: args.entityType,
            overrides: args.overrides,
            targetCurrency: args.targetCurrency,
            exchangeRateUsed: args.exchangeRateUsed,
        });
        if (updated.matched) changed = true;
        return updated.item;
    });

    return { items: nextItems, changed };
};

export const getServicePricingContext = (data: Record<string, any>) => ({
    state: String(data?.selectedState || data?.state || "").trim(),
    entityType: String(
        data?.selectedEntity
        || data?.entityType
        || data?.panamaEntity
        || data?.ltTrack
        || ""
    ).trim(),
});

export const applyServicePricingOverridesToFees = (
    fees: any,
    args: {
        overrides: ServicePricingOverride[];
        countryCode: string;
        data: Record<string, any>;
    }
) => {
    if (!fees || typeof fees !== "object") return fees;
    const sourceItems = Array.isArray(fees.items) ? fees.items : [];
    if (sourceItems.length === 0) return fees;

    const currency = String(fees.currency || args.data?.paymentCurrency || args.data?.currency || "USD").toUpperCase();
    const exchangeRateUsed = Number(fees.exchangeRateUsed || args.data?.computedFees?.exchangeRateUsed || 0);
    const context = getServicePricingContext(args.data);

    const patched = applyServicePricingOverridesToItems(sourceItems, {
        overrides: args.overrides,
        countryCode: args.countryCode,
        state: context.state,
        entityType: context.entityType,
        targetCurrency: currency,
        exchangeRateUsed,
    });
    if (!patched.changed) return fees;

    const government = patched.items
        .filter((item: any) => String(item?.kind || "").toLowerCase() === "government")
        .reduce((sum: number, item: any) => sum + Number(item?.amount || 0), 0);
    const total = patched.items.reduce((sum: number, item: any) => sum + Number(item?.amount || 0), 0);
    const service = Number((total - government).toFixed(2));

    const cardFeePct = Number(
        fees.cardFeePct
        ?? (currency === "USD" ? 0.06 : 0.04)
    );
    const payMethod = normalize(args.data?.payMethod || "card");
    const cardFeeSurcharge = payMethod === "card"
        ? Number((total * cardFeePct).toFixed(2))
        : 0;
    const grandTotal = Number((total + cardFeeSurcharge).toFixed(2));

    return {
        ...fees,
        items: patched.items,
        currency,
        government,
        service,
        total: Number(total.toFixed(2)),
        cardFeePct,
        cardFeeSurcharge,
        grandTotal,
        pricingOverrideApplied: true,
    };
};

