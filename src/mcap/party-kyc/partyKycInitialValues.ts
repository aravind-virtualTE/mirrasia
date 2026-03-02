/* eslint-disable @typescript-eslint/no-explicit-any */

type PartyLike = {
  email?: string;
  phone?: string;
  name?: string;
  roles?: string[];
  details?: Record<string, any> | null;
};

type CompanyLike = {
  companyName?: string;
  countryName?: string;
};

const LEGACY_DETAIL_META_KEYS = new Set([
  "legacySource",
  "legacyCompanyId",
  "legacyPartyKey",
  "legacyIndex",
  "legacyShrDirId",
  "legacyRegistration",
  "legacyFlags",
  "legacyRaw",
  "legacyMergedSources",
  "legacyMergedKeys",
]);

const ROLE_ALIAS_MAP: Record<string, string> = {
  sharehld: "shareholder",
  keycontrol: "keyControl",
  designatedcontact: "designatedContact",
};

const FIELD_ALIAS_PAIRS: Array<[string, string]> = [
  ["mailingAdress", "mailingAddress"],
  ["passportNum", "passportNumber"],
  ["birthdate", "dateOfBirth"],
  ["mobileNumber", "phoneNum"],
  ["socialMediaId", "socialMediaID"],
];

const DATE_FIELD_PATTERN = /(date|dob|birth)/i;

const isRecord = (value: unknown): value is Record<string, any> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toTrimmedString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const normalizeDateString = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed;
  return parsed.toISOString().slice(0, 10);
};

const normalizeFieldValue = (key: string, value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeFieldValue(key, item))
      .filter((item) => item !== undefined && item !== null && item !== "");
  }

  if (isRecord(value)) {
    if (Object.prototype.hasOwnProperty.call(value, "id")) {
      return normalizeFieldValue(key, value.id);
    }
    if (Object.prototype.hasOwnProperty.call(value, "value")) {
      return normalizeFieldValue(key, value.value);
    }
    return value;
  }

  if (typeof value === "string") {
    if (DATE_FIELD_PATTERN.test(key)) {
      return normalizeDateString(value);
    }
    return value.trim();
  }

  return value;
};

const normalizeRecord = (value: Record<string, any>) => {
  const normalized: Record<string, any> = {};
  Object.entries(value || {}).forEach(([key, fieldValue]) => {
    normalized[key] = normalizeFieldValue(key, fieldValue);
  });
  return normalized;
};

const applyFieldAliases = (values: Record<string, any>) => {
  const next = { ...values };
  FIELD_ALIAS_PAIRS.forEach(([primary, alias]) => {
    const primaryValue = next[primary];
    const aliasValue = next[alias];
    if ((primaryValue === undefined || primaryValue === null || primaryValue === "") && aliasValue) {
      next[primary] = aliasValue;
    }
    if ((aliasValue === undefined || aliasValue === null || aliasValue === "") && primaryValue) {
      next[alias] = primaryValue;
    }
  });
  return next;
};

const normalizeRoleValue = (role: unknown) => {
  const raw = toTrimmedString(role);
  if (!raw) return "";
  const mapped = ROLE_ALIAS_MAP[raw.toLowerCase()];
  return mapped || raw;
};

const normalizeRoles = (roles: unknown) => {
  if (!Array.isArray(roles)) return [];
  const dedupe = new Set<string>();
  const normalized: string[] = [];
  roles.forEach((role) => {
    const mapped = normalizeRoleValue(role);
    if (!mapped) return;
    const key = mapped.toLowerCase();
    if (dedupe.has(key)) return;
    dedupe.add(key);
    normalized.push(mapped);
  });
  return normalized;
};

export const buildPartyKycInitialValues = ({
  party,
  company,
}: {
  party?: PartyLike | null;
  company?: CompanyLike | null;
}) => {
  const details = isRecord(party?.details) ? { ...party.details } : {};
  const legacyRegistration = isRecord(details.legacyRegistration) ? details.legacyRegistration : {};

  const detailsWithoutMeta = { ...details };
  LEGACY_DETAIL_META_KEYS.forEach((key) => {
    delete detailsWithoutMeta[key];
  });

  const normalizedLegacyDetails = applyFieldAliases(normalizeRecord(legacyRegistration));
  const normalizedDirectDetails = applyFieldAliases(normalizeRecord(detailsWithoutMeta));

  const companyName = toTrimmedString(company?.companyName) || toTrimmedString(company?.countryName);
  const mergedRoles = normalizeRoles([
    ...(Array.isArray(party?.roles) ? party.roles : []),
    ...(Array.isArray(normalizedLegacyDetails.roles) ? normalizedLegacyDetails.roles : []),
    ...(Array.isArray(normalizedDirectDetails.roles) ? normalizedDirectDetails.roles : []),
  ]);

  const resolvedEmail =
    toTrimmedString(party?.email) ||
    toTrimmedString(normalizedDirectDetails.email) ||
    toTrimmedString(normalizedLegacyDetails.email);
  const resolvedName =
    toTrimmedString(party?.name) ||
    toTrimmedString(normalizedDirectDetails.name) ||
    toTrimmedString(normalizedLegacyDetails.name) ||
    toTrimmedString(normalizedDirectDetails.fullName) ||
    toTrimmedString(normalizedLegacyDetails.fullName);
  const resolvedPhone =
    toTrimmedString(party?.phone) ||
    toTrimmedString(normalizedDirectDetails.phone) ||
    toTrimmedString(normalizedLegacyDetails.phone);

  return {
    ...normalizedLegacyDetails,
    ...normalizedDirectDetails,
    email: resolvedEmail,
    emailAddress:
      toTrimmedString(normalizedDirectDetails.emailAddress) ||
      toTrimmedString(normalizedLegacyDetails.emailAddress) ||
      resolvedEmail,
    companyName,
    proposedCompanyName:
      toTrimmedString(normalizedDirectDetails.proposedCompanyName) ||
      toTrimmedString(normalizedLegacyDetails.proposedCompanyName) ||
      companyName,
    roles: mergedRoles,
    fullName:
      toTrimmedString(normalizedDirectDetails.fullName) ||
      toTrimmedString(normalizedLegacyDetails.fullName) ||
      resolvedName,
    name: resolvedName,
    phone: resolvedPhone,
    mobileNumber:
      toTrimmedString(normalizedDirectDetails.mobileNumber) ||
      toTrimmedString(normalizedLegacyDetails.mobileNumber) ||
      resolvedPhone,
  };
};
