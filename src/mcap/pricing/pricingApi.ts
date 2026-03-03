import api from "@/services/fetch";
import type { CountryRegion } from "./pricing";

export type ServicePricingOverride = {
    countryCode: string;
    serviceId: string;
    amount: number;
    currency?: string;
    state?: string;
    entityType?: string;
    pricing?: Record<string, any>;
    itemName?: string;
};

const getNested = <T>(payload: any, fallback: T): T => {
    if (payload?.data !== undefined) return payload.data as T;
    if (payload?.result !== undefined) return payload.result as T;
    return fallback;
};

export const fetchPricingCatalog = async (): Promise<CountryRegion[]> => {
    const res = await api.get("/mcap/pricing/catalog");
    const data = getNested<any>(res.data, {});
    const regions = Array.isArray(data?.regions) ? data.regions : [];
    return regions as CountryRegion[];
};

export const savePricingCatalog = async (regions: CountryRegion[], updatedBy?: string): Promise<CountryRegion[]> => {
    const res = await api.put("/mcap/pricing/catalog", { regions, updatedBy });
    const data = getNested<any>(res.data, {});
    const nextRegions = Array.isArray(data?.regions) ? data.regions : [];
    return nextRegions as CountryRegion[];
};

export const fetchServicePricingOverrides = async (countryCode?: string): Promise<ServicePricingOverride[]> => {
    const params = countryCode ? { countryCode } : undefined;
    const res = await api.get("/mcap/pricing/service-overrides", { params });
    const data = getNested<any>(res.data, {});
    const overrides = Array.isArray(data?.overrides) ? data.overrides : [];
    return overrides as ServicePricingOverride[];
};

