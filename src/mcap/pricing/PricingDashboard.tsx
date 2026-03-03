import { useEffect, useMemo, useState } from "react";
import { CountryRegion, PricingItem } from "./pricing";
import { initialPricingData } from "./pricingData";
import { CountryRegionCard } from "./CountryRegionCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Globe, DollarSign, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { fetchPricingCatalog, savePricingCatalog } from "./pricingApi";
import { MCAP_CONFIGS } from "../configs/registry";

const normalizeRegionCode = (value: unknown) => String(value ?? "").trim().toUpperCase();

const REGISTRY_REGION_CODES = Array.from(
  new Set(
    MCAP_CONFIGS
      .map((cfg) => normalizeRegionCode(cfg.countryCode))
      .filter(Boolean)
  )
);

const REGISTRY_NAME_BY_CODE = new Map<string, string>(
  MCAP_CONFIGS.map((cfg) => [normalizeRegionCode(cfg.countryCode), String(cfg.countryName || cfg.countryCode).trim()])
);

const MANAGED_REGION_CODES = new Set<string>([...REGISTRY_REGION_CODES, "MCAP"]);

const cloneItem = (item: PricingItem): PricingItem => ({
  ...item,
  pricing: { ...(item.pricing || {}) },
  metadata: item.metadata ? { ...item.metadata } : item.metadata,
});

const cloneRegion = (region: CountryRegion): CountryRegion => ({
  ...region,
  items: Array.isArray(region.items) ? region.items.map(cloneItem) : [],
});

const normalizeDashboardRegions = (regions: CountryRegion[]): CountryRegion[] => {
  const source = Array.isArray(regions) ? regions : [];
  const byCode = new Map<string, CountryRegion>();

  source.forEach((rawRegion) => {
    const code = normalizeRegionCode(rawRegion?.code);
    if (!code || !MANAGED_REGION_CODES.has(code)) return;

    const fallbackName = REGISTRY_NAME_BY_CODE.get(code) || String(rawRegion?.name || code).trim();
    const nextRegion: CountryRegion = {
      ...cloneRegion(rawRegion),
      code,
      name: String(rawRegion?.name || fallbackName || code).trim(),
      flag: String(rawRegion?.flag || code).trim(),
      type: rawRegion?.type === "region" ? "region" : "country",
      items: Array.isArray(rawRegion?.items)
        ? rawRegion.items.map((item) => ({
          ...cloneItem(item),
          countryCode: String(item.countryCode || (code === "MCAP" ? "" : code)).trim().toUpperCase(),
        }))
        : [],
    };

    byCode.set(code, nextRegion);
  });

  REGISTRY_REGION_CODES.forEach((code) => {
    if (byCode.has(code)) return;
    byCode.set(code, {
      code,
      name: REGISTRY_NAME_BY_CODE.get(code) || code,
      flag: code,
      type: "country",
      items: [],
    });
  });

  if (!byCode.has("MCAP")) {
    const mcapSeed = initialPricingData.find((region) => normalizeRegionCode(region.code) === "MCAP");
    if (mcapSeed) byCode.set("MCAP", cloneRegion({ ...mcapSeed, code: "MCAP" }));
  }

  const ordered: CountryRegion[] = [];
  REGISTRY_REGION_CODES.forEach((code) => {
    const region = byCode.get(code);
    if (region) ordered.push(region);
  });

  const mcapRegion = byCode.get("MCAP");
  if (mcapRegion) ordered.push(mcapRegion);

  return ordered;
};

const DEFAULT_DASHBOARD_REGIONS = normalizeDashboardRegions(initialPricingData);

const createDefaultItem = (region: CountryRegion): PricingItem => {
  const defaultCurrency = String(region.items[0]?.pricing?.currency || "USD").toUpperCase();

  return {
    name: "New Pricing Item",
    type: "service_override",
    flag: String(region.flag || region.code || "").trim(),
    serviceId: "",
    countryCode: region.code === "MCAP" ? "" : region.code,
    state: "",
    entityType: "",
    active: true,
    pricing: {
      amount: 0,
      currency: defaultCurrency,
      notes: "",
    },
  };
};

export default function PricingDashboard() {
  const [pricingData, setPricingData] = useState<CountryRegion[]>(DEFAULT_DASHBOARD_REGIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadCatalog = async () => {
      setIsLoading(true);
      try {
        const regions = await fetchPricingCatalog();
        if (cancelled) return;

        if (Array.isArray(regions) && regions.length > 0) {
          setPricingData(normalizeDashboardRegions(regions));
        } else {
          setPricingData(DEFAULT_DASHBOARD_REGIONS);
        }
        setHasUnsavedChanges(false);
      } catch (error) {
        if (cancelled) return;
        console.error("Failed to fetch pricing catalog", error);
        setPricingData(DEFAULT_DASHBOARD_REGIONS);
        setHasUnsavedChanges(false);
        toast.error("Failed to load saved pricing. Showing registry-aligned defaults.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadCatalog();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateDraftData = (nextData: CountryRegion[]) => {
    setPricingData(normalizeDashboardRegions(nextData));
    setHasUnsavedChanges(true);
  };

  const persistPricing = async (nextData: CountryRegion[], successMessage: string) => {
    const payload = normalizeDashboardRegions(nextData);
    try {
      setIsSaving(true);
      const savedRegions = await savePricingCatalog(payload);
      const resolvedData = Array.isArray(savedRegions) && savedRegions.length > 0
        ? normalizeDashboardRegions(savedRegions)
        : payload;
      setPricingData(resolvedData);
      setHasUnsavedChanges(false);
      toast.success(successMessage);
    } catch (error) {
      console.error("Failed to save pricing catalog", error);
      toast.error("Failed to save pricing changes.");
      setPricingData(payload);
      setHasUnsavedChanges(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAll = async () => {
    await persistPricing(pricingData, "Pricing catalog updated.");
  };

  const handleUpdateItem = (regionCode: string, itemIndex: number, updatedItem: PricingItem) => {
    const nextData = pricingData.map((region) =>
      region.code === regionCode
        ? {
            ...region,
            items: region.items.map((item, idx) => (idx === itemIndex ? updatedItem : item)),
          }
        : region
    );

    updateDraftData(nextData);
  };

  const handleDeleteItem = (regionCode: string, itemIndex: number) => {
    const region = pricingData.find((entry) => entry.code === regionCode);
    const deletedName = region?.items[itemIndex]?.name || "pricing item";

    const nextData = pricingData.map((entry) =>
      entry.code === regionCode
        ? {
            ...entry,
            items: entry.items.filter((_, idx) => idx !== itemIndex),
          }
        : entry
    );

    updateDraftData(nextData);
    toast.success(`Removed ${deletedName}`);
  };

  const handleAddItem = (regionCode: string) => {
    const targetRegion = pricingData.find((region) => region.code === regionCode);
    if (!targetRegion) return;

    const newItem = createDefaultItem(targetRegion);
    const nextData = pricingData.map((region) =>
      region.code === regionCode
        ? {
            ...region,
            items: [newItem, ...region.items],
          }
        : region
    );

    updateDraftData(nextData);
    toast.success(`Added new item to ${targetRegion.name}`);
  };

  const handleRefreshDefaults = () => {
    const confirmed = window.confirm("Load registry-aligned static pricing into the editor? Save Changes to persist it.");
    if (!confirmed) return;

    setPricingData(DEFAULT_DASHBOARD_REGIONS);
    setHasUnsavedChanges(true);
    toast.success("Loaded registry-aligned defaults into draft mode.");
  };

  const filteredData = useMemo(() => {
    const searchLower = searchQuery.trim().toLowerCase();
    if (!searchLower) return pricingData;

    return pricingData.filter((region) => {
      const regionMatches = [region.code, region.name, region.type, region.flag]
        .join(" ")
        .toLowerCase()
        .includes(searchLower);

      if (regionMatches) return true;

      return region.items.some((item) => {
        const pricingText = Object.entries(item.pricing || {})
          .map(([key, value]) => `${key} ${String(value ?? "")}`)
          .join(" ");

        const itemText = [
          item.name,
          item.type,
          item.flag,
          item.serviceId,
          item.countryCode,
          item.state,
          item.entityType,
          item.active === false ? "inactive" : "active",
          pricingText,
        ]
          .join(" ")
          .toLowerCase();

        return itemText.includes(searchLower);
      });
    });
  }, [pricingData, searchQuery]);

  const totalCountries = pricingData.length;
  const totalServices = pricingData.reduce((acc, region) => acc + region.items.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card border-b border-border shadow-sm">
        <div className="max-width mx-auto px-3 py-3">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg font-bold text-foreground leading-tight">Incorporation Pricing Admin</h1>
                  <p className="text-xs text-muted-foreground">
                    One place to manage pricing catalog aligned with UnifiedFormEngine countries.
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Countries are scoped to registry contracts to reduce pricing mismatch risk.
                  </p>
                </div>
              </div>

              <div className="flex items-center flex-wrap gap-2 lg:ml-auto">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5" />
                    <span>{totalCountries} regions</span>
                  </div>
                  <div className="h-3 w-px bg-border" />
                  <span>{totalServices} items</span>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search regions, service IDs, or pricing keys..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 text-sm"
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="h-8 px-3 text-xs"
                  onClick={handleRefreshDefaults}
                  disabled={isSaving}
                >
                  Reset Defaults
                </Button>

                <Button
                  type="button"
                  className="h-8 px-3 text-xs"
                  onClick={handleSaveAll}
                  disabled={!hasUnsavedChanges || isSaving || isLoading}
                >
                  {isSaving ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5 mr-1" />
                  )}
                  {hasUnsavedChanges ? "Save Changes" : "Saved"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-width mx-auto px-3 py-3">
        {(isLoading || isSaving) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>{isLoading ? "Loading pricing catalog..." : "Saving pricing changes..."}</span>
          </div>
        )}

        {hasUnsavedChanges && !isSaving && (
          <div className="mb-3 rounded-md border border-amber-500/40 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            You have unsaved changes. Click <strong>Save Changes</strong> to persist registry-aligned pricing catalog updates.
          </div>
        )}

        <div className="grid gap-2">
          {filteredData.map((region) => (
            <CountryRegionCard
              key={region.code}
              region={region}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
              onAddItem={handleAddItem}
            />
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
          </div>
        )}
      </main>
    </div>
  );
}

