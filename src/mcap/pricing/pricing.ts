/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Pricing {
  [key: string]: number | string | undefined;
  government_fees?: number;
  service_fee?: number;
  registered_agent?: number;
  registered_office?: number;
  franchise_tax?: number;
  license_fee?: number;
  compliance_fee?: number;
  licensing_fee?: number;
  annual_fee?: number;
  total_first_year?: number;
  annual_renewal?: number;
  currency: string;
  timeline?: string;
  notes?: string;
}

export interface PricingItem {
  name: string;
  type: string;
  flag: string;
  pricing: Pricing;
  serviceId?: string;
  countryCode?: string;
  state?: string;
  entityType?: string;
  active?: boolean;
  metadata?: Record<string, any>;
}

export interface CountryRegion {
  code: string;
  name: string;
  flag: string;
  type: "country" | "region";
  items: PricingItem[];
}
