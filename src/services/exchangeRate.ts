/**
 * Exchange Rate Service
 * Prefers official ECB-based Frankfurter rates for pricing conversions.
 * Falls back to Gemini when the official API is unavailable or returns
 * an invalid payload.
 *
 * Important: this service is currency-pair based only. Pricing base currency
 * selection lives in the MCAP pricing layer:
 * - default base pricing currency: USD
 * - Estonia / Eustonia (EE): EUR
 */

import { GoogleGenAI, Type } from "@google/genai";

// In-memory cache to avoid excessive API calls during the same session
interface CacheEntry {
    rate: number;
    timestamp: number;
    source: "frankfurter" | "gemini";
}

const rateCache: Record<string, CacheEntry> = {};
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache
export const DEFAULT_PRICING_BASE_CURRENCY = "USD";
const COUNTRY_PRICING_BASE_CURRENCIES: Record<string, string> = {
    EE: "EUR",
};

type GeminiExchangeResponse = {
    rate: number;
};

const GEMINI_MODEL = "gemini-3.1-pro-preview";

export const getPricingBaseCurrency = (countryCode?: string | null): string => {
    const upperCountryCode = String(countryCode || "").trim().toUpperCase();
    return COUNTRY_PRICING_BASE_CURRENCIES[upperCountryCode] || DEFAULT_PRICING_BASE_CURRENCY;
};

const getGoogleApiKey = () =>
    import.meta.env.VITE_GOOGLE_API_KEY
    || (typeof process !== "undefined" ? process.env.VITE_GOOGLE_API_KEY : undefined);

const fetchExchangeRateFromGemini = async (from: string, to: string): Promise<number> => {
    const apiKey = getGoogleApiKey();
    if (!apiKey) {
        throw new Error("Missing Google API key");
    }

    const genAI = new GoogleGenAI({ apiKey });
    const upperFrom = from.toUpperCase();
    const upperTo = to.toUpperCase();
    console.log(`[ExchangeRate] Fetching Gemini FX rate for ${upperFrom}->${upperTo} using model ${GEMINI_MODEL}`);
    const result = await genAI.models.generateContent({
        model: GEMINI_MODEL,
        contents: `Return the latest available foreign exchange rate from ${upperFrom} to ${upperTo}. Return JSON only.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    rate: {
                        type: Type.NUMBER,
                    },
                },
                required: ["rate"],
            },
        },
    });

    const text = String(result.text || "").trim();
    if (!text) {
        throw new Error(`Empty Gemini FX response for ${upperFrom}->${upperTo}`);
    }

    let parsed: GeminiExchangeResponse | null = null;
    try {
        parsed = JSON.parse(text) as GeminiExchangeResponse;
    } catch {
        throw new Error(`Invalid Gemini FX JSON for ${upperFrom}->${upperTo}`);
    }

    const rate = Number(parsed?.rate);
    if (!(Number.isFinite(rate) && rate > 0)) {
        throw new Error(`Invalid Gemini FX rate for ${upperFrom}->${upperTo}`);
    }

    return rate;
};

const fetchExchangeRateFromFrankfurter = async (from: string, to: string): Promise<number> => {
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

    return rate;
};

/**
 * Get exchange rate between two currencies
 * @param from - Source currency code (e.g., "USD")
 * @param to - Target currency code (e.g., "HKD")
 * @returns Exchange rate (e.g., 7.8 for USD->HKD)
 */
export const getExchangeRate = async (from: string, to: string): Promise<number> => {
    const upperFrom = from.toUpperCase();
    const upperTo = to.toUpperCase();
    if (upperFrom === upperTo) return 1;

    const cacheKey = `${upperFrom}_${upperTo}`;
    const now = Date.now();

    // Check cache
    const cached = rateCache[cacheKey];
    if (cached && now - cached.timestamp < CACHE_TTL_MS && cached.source === "frankfurter") {
        console.log(`[ExchangeRate] Using cached rate for ${cacheKey}: ${cached.rate}`);
        return cached.rate;
    }

    try {
        let rate: number;
        try {
            rate = await fetchExchangeRateFromFrankfurter(upperFrom, upperTo);
            console.log(`[ExchangeRate] Fetched Frankfurter rate for ${cacheKey}: ${rate}`);
            rateCache[cacheKey] = { rate, timestamp: now, source: "frankfurter" };
            return rate;
        } catch (officialError) {
            console.warn(`[ExchangeRate] Frankfurter FX lookup failed for ${cacheKey}, falling back to Gemini`, officialError);
            rate = await fetchExchangeRateFromGemini(upperFrom, upperTo);
            console.log(`[ExchangeRate] Fetched Gemini rate for ${cacheKey}: ${rate}`);
            rateCache[cacheKey] = { rate, timestamp: now, source: "gemini" };
            return rate;
        }
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
