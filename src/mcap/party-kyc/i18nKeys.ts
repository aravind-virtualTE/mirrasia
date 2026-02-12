const PARTY_KYC_AUTO_KEY_PREFIX = "mcap.partyKyc.auto";

const KEY_PATTERN = /^[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)+$/;

const hashText = (value: string) => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
};

const slugify = (value: string) => {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 64);
  return slug || "text";
};

export const isLikelyI18nKey = (value?: string) => {
  if (!value) return false;
  return KEY_PATTERN.test(value.trim());
};

export const toPartyKycAutoKey = (value: string) => {
  const trimmed = value.trim();
  const slug = slugify(trimmed);
  const hash = hashText(trimmed);
  return `${PARTY_KYC_AUTO_KEY_PREFIX}.${slug}_${hash}`;
};

export const resolvePartyKycI18nKey = (value?: string) => {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  return isLikelyI18nKey(trimmed) ? trimmed : toPartyKycAutoKey(trimmed);
};

