export interface AuthAccessSnapshot {
  ipAddress: string;
  source: "ipapi";
  countryIsoCode?: string;
  countryName?: string;
  cityName?: string;
  subdivisionName?: string;
  timeZone?: string;
  ispName?: string;
}

const STORAGE_KEY = "auth_access_snapshot";
const SNAPSHOT_TTL_MS = 5 * 60 * 1000;

interface StoredSnapshot {
  capturedAt: number;
  snapshot: AuthAccessSnapshot;
}

const trimTo = (value: unknown, maxLength = 128) => {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "";
  return trimmed.slice(0, maxLength);
};

const mapIpApiPayload = (payload: any): AuthAccessSnapshot | null => {
  const ipAddress = trimTo(payload?.ip, 64);
  if (!ipAddress) return null;

  return {
    ipAddress,
    source: "ipapi",
    countryIsoCode: trimTo(payload?.country_code ?? payload?.country, 8) || undefined,
    countryName: trimTo(payload?.country_name, 128) || undefined,
    cityName: trimTo(payload?.city || payload?.region, 128) || undefined,
    subdivisionName: trimTo(payload?.region, 128) || undefined,
    timeZone: trimTo(payload?.timezone, 64) || undefined,
    ispName: trimTo(payload?.org, 256) || undefined,
  };
};

const readCachedSnapshot = (): AuthAccessSnapshot | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredSnapshot;
    if (!parsed?.snapshot || !parsed?.capturedAt) return null;

    if (Date.now() - parsed.capturedAt > SNAPSHOT_TTL_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed.snapshot;
  } catch {
    return null;
  }
};

const writeCachedSnapshot = (snapshot: AuthAccessSnapshot) => {
  if (typeof window === "undefined") return;

  const payload: StoredSnapshot = {
    capturedAt: Date.now(),
    snapshot,
  };

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

export const getAuthAccessSnapshot = async (): Promise<AuthAccessSnapshot | null> => {
  const cached = readCachedSnapshot();
  if (cached) return cached;

  try {
    const response = await fetch("https://ipapi.co/json/", {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    const snapshot = mapIpApiPayload(payload);
    if (!snapshot) {
      return null;
    }

    writeCachedSnapshot(snapshot);
    return snapshot;
  } catch {
    return null;
  }
};
