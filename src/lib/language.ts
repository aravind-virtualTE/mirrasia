export const LANGUAGE_STORAGE_KEY = "preferredLanguage";

export const SUPPORTED_I18N_LANGUAGES = ["en", "ko", "zhTW"] as const;

export type AppLanguage = (typeof SUPPORTED_I18N_LANGUAGES)[number];

const COUNTRY_TO_LANGUAGE: Record<string, AppLanguage> = {
  KR: "ko",
};

const normalizeRawLanguage = (rawValue?: string | null): string => {
  return String(rawValue || "").trim().toLowerCase().replace(/_/g, "-");
};

export const normalizeLanguageCode = (value?: string | null): AppLanguage | null => {
  const raw = normalizeRawLanguage(value);
  if (!raw) return null;

  if (raw === "zhtw" || raw === "zh-tw" || raw === "zh-hk" || raw === "zh-mo" || raw.startsWith("zh-tw")) {
    return "zhTW";
  }
  if (raw.startsWith("ko")) return "ko";
  if (raw.startsWith("en")) return "en";
  return null;
};

export const getStoredLanguagePreference = (): AppLanguage | null => {
  if (typeof window === "undefined") return null;

  try {
    return normalizeLanguageCode(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));
  } catch {
    return null;
  }
};

export const setStoredLanguagePreference = (language: AppLanguage): void => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Ignore storage exceptions to avoid blocking language changes.
  }
};

export const resolveLanguageFromCountryCode = (countryCode?: string | null): AppLanguage | null => {
  const normalizedCountryCode = String(countryCode || "").trim().toUpperCase();
  return COUNTRY_TO_LANGUAGE[normalizedCountryCode] || null;
};

const resolveNavigatorLanguage = (): AppLanguage | null => {
  if (typeof navigator === "undefined") return null;

  const browserCandidates: string[] = [
    ...((navigator.languages || []) as string[]),
    navigator.language,
  ].filter(Boolean);

  for (const candidate of browserCandidates) {
    const normalized = normalizeLanguageCode(candidate);
    if (normalized) return normalized;
  }

  return null;
};

export const resolveInitialLanguage = (): AppLanguage => {
  return getStoredLanguagePreference() || resolveNavigatorLanguage() || "en";
};
