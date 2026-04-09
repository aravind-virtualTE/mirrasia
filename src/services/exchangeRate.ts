/**
 * Exchange Rate Service
 * Uses Frankfurter (ECB-backed) as the FX provider.
 *
 * Important: this service is currency-pair based only. Pricing base currency
 * selection lives in the MCAP pricing layer:
 * - default base pricing currency: USD
 * - Estonia (EE): EUR
 * - Hungary (HU): EUR
 */

interface CacheEntry {
    rate: number;
    timestamp: number;
    source: "frankfurter-v2" | "frankfurter-v1";
}

const rateCache: Record<string, CacheEntry> = {};
const pendingRateRequests = new Map<string, Promise<number>>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export const DEFAULT_PRICING_BASE_CURRENCY = "USD";
const COUNTRY_PRICING_BASE_CURRENCIES: Record<string, string> = {
    EE: "EUR",
    HU: "EUR",
};

const normalizeCurrency = (value: string) => String(value || "").trim().toUpperCase();
const isPositiveFiniteNumber = (value: unknown): value is number =>
    typeof value === "number" && Number.isFinite(value) && value > 0;

const fetchExchangeRateFromFrankfurterV2 = async (from: string, to: string): Promise<number> => {
    const upperFrom = normalizeCurrency(from);
    const upperTo = normalizeCurrency(to);
    const url = `https://api.frankfurter.dev/v2/rates?base=${upperFrom}&quotes=${upperTo}`;
    const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
    });

    if (!response.ok) {
        throw new Error(`Frankfurter v2 API error: ${response.status}`);
    }

    const payload = await response.json();
    const rate = Array.isArray(payload) ? Number(payload[0]?.rate) : NaN;
    if (!isPositiveFiniteNumber(rate)) {
        throw new Error(`Invalid Frankfurter v2 rate for ${upperFrom}->${upperTo}`);
    }

    return rate;
};

// Safety fallback for legacy format while migrating all traffic to v2.
const fetchExchangeRateFromFrankfurterV1 = async (from: string, to: string): Promise<number> => {
    const upperFrom = normalizeCurrency(from);
    const upperTo = normalizeCurrency(to);
    const url = `https://api.frankfurter.dev/latest?from=${upperFrom}&to=${upperTo}`;
    const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
    });

    if (!response.ok) {
        throw new Error(`Frankfurter v1 API error: ${response.status}`);
    }

    const payload = await response.json();
    const rate = Number(payload?.rates?.[upperTo]);
    if (!isPositiveFiniteNumber(rate)) {
        throw new Error(`Invalid Frankfurter v1 rate for ${upperFrom}->${upperTo}`);
    }

    return rate;
};

const setCache = (cacheKey: string, rate: number, source: CacheEntry["source"]) => {
    rateCache[cacheKey] = {
        rate,
        timestamp: Date.now(),
        source,
    };
};

const getFreshCachedRate = (cacheKey: string): number | null => {
    const cached = rateCache[cacheKey];
    if (!cached) return null;
    if (Date.now() - cached.timestamp > CACHE_TTL_MS) return null;
    return cached.rate;
};

export const getPricingBaseCurrency = (countryCode?: string | null): string => {
    const upperCountryCode = String(countryCode || "").trim().toUpperCase();
    return COUNTRY_PRICING_BASE_CURRENCIES[upperCountryCode] || DEFAULT_PRICING_BASE_CURRENCY;
};

/**
 * Get exchange rate between two currencies
 * @param from - Source currency code (e.g., "USD")
 * @param to - Target currency code (e.g., "HKD")
 * @returns Exchange rate (e.g., 7.8 for USD->HKD)
 */
export const getExchangeRate = async (from: string, to: string): Promise<number> => {
    const upperFrom = normalizeCurrency(from);
    const upperTo = normalizeCurrency(to);
    if (upperFrom === upperTo) return 1;
    if (!upperFrom || !upperTo) {
        throw new Error("Invalid currency code");
    }

    const cacheKey = `${upperFrom}_${upperTo}`;
    const freshCachedRate = getFreshCachedRate(cacheKey);
    if (freshCachedRate !== null) {
        return freshCachedRate;
    }

    const pendingRequest = pendingRateRequests.get(cacheKey);
    if (pendingRequest) {
        return pendingRequest;
    }

    const requestPromise = (async () => {
        const staleCachedRate = rateCache[cacheKey]?.rate;
        try {
            try {
                const v2Rate = await fetchExchangeRateFromFrankfurterV2(upperFrom, upperTo);
                setCache(cacheKey, v2Rate, "frankfurter-v2");
                return v2Rate;
            } catch (v2Error) {
                console.warn(`[ExchangeRate] Frankfurter v2 failed for ${cacheKey}, trying legacy endpoint`, v2Error);
                const v1Rate = await fetchExchangeRateFromFrankfurterV1(upperFrom, upperTo);
                setCache(cacheKey, v1Rate, "frankfurter-v1");
                return v1Rate;
            }
        } catch (error) {
            console.error(`[ExchangeRate] Failed to fetch FX rate for ${cacheKey}`, error);
            if (isPositiveFiniteNumber(staleCachedRate)) {
                console.warn(`[ExchangeRate] Using stale cached FX rate for ${cacheKey}`);
                return staleCachedRate;
            }
            throw error;
        } finally {
            pendingRateRequests.delete(cacheKey);
        }
    })();

    pendingRateRequests.set(cacheKey, requestPromise);
    return requestPromise;
};

/**
 * Convert amount from one currency to another
 * @param amount - Amount in source currency
 * @param from - Source currency code
 * @param to - Target currency code
 * @returns Converted amount and applied rate
 */
export const convertCurrency = async (
    amount: number,
    from: string,
    to: string
): Promise<{ convertedAmount: number; rate: number }> => {
    const rate = await getExchangeRate(from, to);
    const convertedAmount = Number((amount * rate).toFixed(2));
    return { convertedAmount, rate };
};

/**
 * Get USD to HKD exchange rate (common use case)
 */
export const getUsdToHkdRate = async (): Promise<number> => {
    return getExchangeRate("USD", "HKD");
};

/**
 * Convert USD to HKD
 */
export const convertUsdToHkd = async (
    usdAmount: number
): Promise<{ hkdAmount: number; rate: number }> => {
    const { convertedAmount, rate } = await convertCurrency(usdAmount, "USD", "HKD");
    return { hkdAmount: convertedAmount, rate };
};

