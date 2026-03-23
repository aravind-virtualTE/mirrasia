/* eslint-disable @typescript-eslint/no-explicit-any */

export const CORRESPONDENCE_SERVICE_FIELD = "useCorrespondenceAddressService";
export const CORRESPONDENCE_SERVICE_ID = "corr_addr";
// This field is currently wired only for HK flows.
export const DEFAULT_CORRESPONDENCE_SERVICE_PRICE = 0;
export const CORRESPONDENCE_SERVICE_PRICE_BY_COUNTRY: Record<string, number> = {
  HK: 65,
};

const DEFAULT_UNIT_LABEL = "newHk.fees.units.person";
const DEFAULT_LABEL = "newHk.fees.items.corr_addr.label";
const DEFAULT_INFO =
  "Optional service selected per party in Party details or Party KYC for correspondence handling.";

export const normalizeMcapCountryCode = (countryCode?: string) =>
  String(countryCode || "").split("_")[0].trim().toUpperCase();

export const isCorrespondenceServiceEnabledForCountry = (countryCode?: string) =>
  normalizeMcapCountryCode(countryCode) === "HK";

const isEnabledFlag = (value: any) => {
  if (typeof value === "boolean") return value;
  const normalized = String(value || "").trim().toLowerCase();
  return ["true", "yes", "1", "on"].includes(normalized);
};

export const isCorrespondenceServiceSelected = (source: any) =>
  isEnabledFlag(source?.details?.[CORRESPONDENCE_SERVICE_FIELD] ?? source?.[CORRESPONDENCE_SERVICE_FIELD]);

export const getCorrespondenceServicePrice = (countryCode?: string) => {
  const normalizedCountryCode = normalizeMcapCountryCode(countryCode);
  if (!isCorrespondenceServiceEnabledForCountry(normalizedCountryCode)) {
    return DEFAULT_CORRESPONDENCE_SERVICE_PRICE;
  }
  return CORRESPONDENCE_SERVICE_PRICE_BY_COUNTRY[normalizedCountryCode] ?? DEFAULT_CORRESPONDENCE_SERVICE_PRICE;
};

export const getCorrespondenceServiceCounts = (
  parties: any[],
  countryCode?: string
) => {
  if (!isCorrespondenceServiceEnabledForCountry(countryCode)) {
    return { correspondenceCount: 0 };
  }
  const list = Array.isArray(parties) ? parties : [];
  let correspondenceCount = 0;

  list.forEach((party) => {
    if (!isCorrespondenceServiceSelected(party)) return;

    correspondenceCount += 1;
  });

  return { correspondenceCount };
};

export const buildCorrespondenceServiceFeeItem = (countryCode?: string) => {
  if (!isCorrespondenceServiceEnabledForCountry(countryCode)) {
    return {
      id: CORRESPONDENCE_SERVICE_ID,
      label: DEFAULT_LABEL,
      amount: 0,
      original: 0,
      mandatory: false,
      info: DEFAULT_INFO,
      managedByPartyKyc: true,
      unitLabel: DEFAULT_UNIT_LABEL,
      currency: "USD",
      kind: "service" as const,
    };
  }
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
