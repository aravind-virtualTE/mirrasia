/**
 * Exchange Rate Service
 * Fetches live exchange rates from Frankfurter API (free, no API key required)
 * Uses ECB (European Central Bank) data, updated daily around 16:00 CET
 */

// In-memory cache to avoid excessive API calls during the same session
interface CacheEntry {
    rate: number;
    timestamp: number;
}

const rateCache: Record<string, CacheEntry> = {};
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache

/**
 * Get exchange rate between two currencies
 * @param from - Source currency code (e.g., "USD")
 * @param to - Target currency code (e.g., "HKD")
 * @returns Exchange rate (e.g., 7.8 for USD->HKD)
 */
export const getExchangeRate = async (from: string, to: string): Promise<number> => {
    const cacheKey = `${from.toUpperCase()}_${to.toUpperCase()}`;
    const now = Date.now();

    // Check cache
    const cached = rateCache[cacheKey];
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
        console.log(`[ExchangeRate] Using cached rate for ${cacheKey}: ${cached.rate}`);
        return cached.rate;
    }

    try {
        // Frankfurter API - free, no API key required
        const url = `https://api.frankfurter.app/latest?from=${from.toUpperCase()}&to=${to.toUpperCase()}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Exchange rate API error: ${response.status}`);
        }

        const data = await response.json();
        const rate = data.rates[to.toUpperCase()];

        if (typeof rate !== "number") {
            throw new Error(`Invalid rate received for ${from}->${to}`);
        }

        // Update cache
        rateCache[cacheKey] = { rate, timestamp: now };
        console.log(`[ExchangeRate] Fetched rate for ${cacheKey}: ${rate}`);

        return rate;
    } catch (error) {
        console.error("[ExchangeRate] Error fetching rate:", error);

        // Fallback to cached value if available (even if expired)
        if (cached) {
            console.warn(`[ExchangeRate] Using expired cache for ${cacheKey}`);
            return cached.rate;
        }

        // Ultimate fallback - throw error or use hardcoded rate
        throw error;
    }
};

/**
 * Convert amount from one currency to another
 * @param amount - Amount in source currency
 * @param from - Source currency code
 * @param to - Target currency code
 * @returns Converted amount
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
