/* eslint-disable @typescript-eslint/no-explicit-any */

export const CORRESPONDENCE_SERVICE_FIELD = "useCorrespondenceAddressService";
export const CORRESPONDENCE_SERVICE_ID = "corr_addr";
// This field is currently wired only for HK flows.
export const DEFAULT_CORRESPONDENCE_SERVICE_PRICE = 65;
export const CORRESPONDENCE_SERVICE_PRICE_BY_COUNTRY: Record<string, number> = {
  HK: 65,
};

const ELIGIBLE_CORRESPONDENCE_ROLES = new Set(["director", "shareholder", "member", "dcp"]);
const DEFAULT_UNIT_LABEL = "newHk.fees.units.person";
const DEFAULT_LABEL = "newHk.fees.items.corr_addr.label";
const DEFAULT_INFO =
  "Optional service selected per party in Party details or Party KYC for correspondence handling.";

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
  parties: any[]
) => {
  const list = Array.isArray(parties) ? parties : [];
  let correspondenceCount = 0;

  list.forEach((party) => {
    if (!isCorrespondenceServiceSelected(party)) return;

    const roles = getCorrespondenceServicePartyRoleSet(party);
    if (!isCorrespondenceServiceEligibleRoles(Array.from(roles))) return;

    correspondenceCount += 1;
  });

  return { correspondenceCount };
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
