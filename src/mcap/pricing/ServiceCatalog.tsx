import { useMemo, useState } from "react";
import {
  SERVICE_CATALOG,
  CATALOG_CURRENCIES,
  REGION_GROUPS,
  type CatalogCountryEntry,
  type CatalogServiceItem,
} from "./serviceCatalogData";
import { Input } from "@/components/ui/input";
import {
  Search,
  Globe,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Check,
  Layers,
  Info,
  Star,
  Filter,
} from "lucide-react";

/* ── Helpers ───────────────────────────────────────────────────────────── */

const fmtAmount = (amount: number, currency: string) => {
  if (amount === 0) return "Included";
  const parts = amount.toFixed(2).split(".");
  const intFormatted = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const decimal = parts[1] === "00" ? "" : `.${parts[1]}`;
  return `${currency} ${intFormatted}${decimal}`;
};

const regionForCode = (code: string): string => {
  for (const [region, codes] of Object.entries(REGION_GROUPS)) {
    if (codes.includes(code)) return region;
  }
  return "Other";
};

const REGION_GRADIENTS: Record<string, string> = {
  "Asia Pacific": "from-amber-500/20 via-orange-500/10 to-red-500/10",
  "Europe": "from-blue-500/20 via-indigo-500/10 to-violet-500/10",
  "Middle East": "from-emerald-500/20 via-teal-500/10 to-cyan-500/10",
  "Americas": "from-sky-500/20 via-blue-500/10 to-indigo-500/10",
  "Caribbean": "from-purple-500/20 via-fuchsia-500/10 to-pink-500/10",
  Other: "from-gray-500/20 via-gray-400/10 to-gray-300/10",
};

const REGION_ACCENT: Record<string, string> = {
  "Asia Pacific": "border-amber-500/40",
  "Europe": "border-blue-500/40",
  "Middle East": "border-emerald-500/40",
  "Americas": "border-sky-500/40",
  "Caribbean": "border-purple-500/40",
  Other: "border-gray-500/40",
};

const KIND_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  government: { bg: "bg-blue-500/10", text: "text-blue-700 dark:text-blue-300", label: "Gov" },
  service: { bg: "bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-300", label: "Svc" },
  optional: { bg: "bg-amber-500/10", text: "text-amber-700 dark:text-amber-300", label: "Add-on" },
  other: { bg: "bg-gray-500/10", text: "text-gray-600 dark:text-gray-400", label: "Other" },
};

/* ── Service Row ───────────────────────────────────────────────────────── */

function ServiceRow({ svc }: { svc: CatalogServiceItem }) {
  const badge = KIND_BADGE[svc.kind] || KIND_BADGE.other;
  const hasDiscount =
    svc.originalAmount !== undefined && svc.originalAmount > svc.amount;

  return (
    <div className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-accent/40 transition-colors text-xs group">
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        {svc.mandatory ? (
          <Check className="h-3 w-3 text-emerald-500 shrink-0" />
        ) : (
          <div className="h-3 w-3 rounded-full border border-muted-foreground/30 shrink-0" />
        )}
        <span className="truncate text-foreground/90">{svc.label}</span>
        {svc.info && (
          <span className="hidden group-hover:inline-flex" title={svc.info}>
            <Info className="h-3 w-3 text-muted-foreground/60" />
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${badge.bg} ${badge.text}`}
        >
          {badge.label}
        </span>
        <div className="text-right min-w-[80px]">
          {hasDiscount && (
            <span className="line-through text-muted-foreground/50 mr-1 text-[10px]">
              {fmtAmount(svc.originalAmount!, svc.currency)}
            </span>
          )}
          <span
            className={`font-semibold ${
              svc.amount === 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-foreground"
            }`}
          >
            {fmtAmount(svc.amount, svc.currency)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Country Card ──────────────────────────────────────────────────────── */

function CountryCard({ entry }: { entry: CatalogCountryEntry }) {
  const [expanded, setExpanded] = useState(false);
  const region = regionForCode(entry.countryCode);
  const gradient = REGION_GRADIENTS[region] || REGION_GRADIENTS.Other;
  const accent = REGION_ACCENT[region] || REGION_ACCENT.Other;
  const mandatoryCount = entry.services.filter((s) => s.mandatory).length;
  const optionalCount = entry.services.length - mandatoryCount;

  const previewServices = expanded
    ? entry.services
    : entry.services.slice(0, 4);

  return (
    <div
      className={`
        relative rounded-xl border ${accent}
        bg-card/80 backdrop-blur-sm
        shadow-sm hover:shadow-md
        transition-all duration-300
        overflow-hidden
      `}
    >
      {/* Gradient accent top bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${gradient}`} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-2xl shrink-0" role="img" aria-label={entry.countryName}>
              {entry.flag}
            </span>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-foreground truncate">
                {entry.countryName}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                  {entry.baseCurrency}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {mandatoryCount} mandatory · {optionalCount} optional
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mandatory total pill */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-px bg-border" />
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <Star className="h-3 w-3 text-primary" />
            <span className="text-xs font-bold text-primary">
              {entry.totalMandatory > 0
                ? fmtAmount(entry.totalMandatory, entry.baseCurrency)
                : "Dynamic pricing"}
            </span>
            <span className="text-[10px] text-primary/70">mandatory base</span>
          </div>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Entity types */}
        {entry.entityTypes && entry.entityTypes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {entry.entityTypes.map((et) => (
              <span
                key={et}
                className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-700 dark:text-violet-300 font-medium"
              >
                {et}
              </span>
            ))}
          </div>
        )}

        {/* Service list */}
        <div className="space-y-0.5">
          {previewServices.map((svc) => (
            <ServiceRow key={svc.id} svc={svc} />
          ))}
        </div>

        {/* Expand/collapse */}
        {entry.services.length > 4 && (
          <button
            type="button"
            onClick={() => setExpanded((p) => !p)}
            className="mt-2 w-full flex items-center justify-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3" /> Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" /> Show all{" "}
                {entry.services.length} services
              </>
            )}
          </button>
        )}

        {/* Notes */}
        {entry.notes && (
          <p className="mt-2 text-[10px] text-muted-foreground/70 italic leading-relaxed border-t border-dashed border-border pt-2">
            {entry.notes}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────────────────── */

type FilterMode = "all" | "mandatory" | "optional";

export default function ServiceCatalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currencyFilter, setCurrencyFilter] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return SERVICE_CATALOG.filter((entry) => {
      // Currency filter
      if (currencyFilter && entry.baseCurrency !== currencyFilter) return false;

      // Filter mode
      if (filterMode === "mandatory") {
        if (!entry.services.some((s) => s.mandatory)) return false;
      }
      if (filterMode === "optional") {
        if (!entry.services.some((s) => !s.mandatory)) return false;
      }

      // Text search
      if (!q) return true;
      const searchable = [
        entry.countryCode,
        entry.countryName,
        entry.baseCurrency,
        ...(entry.entityTypes || []),
        ...entry.services.map((s) => s.label),
        entry.notes || "",
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(q);
    });
  }, [searchQuery, currencyFilter, filterMode]);

  // Stats
  const totalCountries = SERVICE_CATALOG.length;
  const totalServices = SERVICE_CATALOG.reduce(
    (sum, e) => sum + e.services.length,
    0
  );
  const avgMandatory = Math.round(
    SERVICE_CATALOG.filter((e) => e.totalMandatory > 0).reduce(
      (sum, e, _, arr) => sum + e.totalMandatory / arr.length,
      0
    )
  );

  // Group by region
  const grouped = useMemo(() => {
    const groups: { region: string; entries: CatalogCountryEntry[] }[] = [];
    const regionOrder = Object.keys(REGION_GROUPS);
    const used = new Set<string>();

    for (const region of regionOrder) {
      const codes = REGION_GROUPS[region];
      const regionEntries = filtered.filter((e) => codes.includes(e.countryCode));
      if (regionEntries.length > 0) {
        groups.push({ region, entries: regionEntries });
        regionEntries.forEach((e) => used.add(e.countryCode));
      }
    }

    // Catch any ungrouped
    const ungrouped = filtered.filter((e) => !used.has(e.countryCode));
    if (ungrouped.length > 0) {
      groups.push({ region: "Other", entries: ungrouped });
    }

    return groups;
  }, [filtered]);

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 py-3">
          <div className="flex flex-col gap-3">
            {/* Title row */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg font-bold text-foreground leading-tight">
                    Service Catalog & Pricing
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Read-only overview of all incorporation services across jurisdictions
                  </p>
                </div>
              </div>

              {/* Stats pills */}
              <div className="flex items-center gap-2 lg:ml-auto flex-wrap">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-xs text-muted-foreground">
                  <Globe className="h-3 w-3" />
                  <span className="font-semibold text-foreground">{totalCountries}</span> jurisdictions
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-xs text-muted-foreground">
                  <DollarSign className="h-3 w-3" />
                  <span className="font-semibold text-foreground">{totalServices}</span> services
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-xs text-muted-foreground">
                  <Star className="h-3 w-3" />
                  avg <span className="font-semibold text-foreground">${avgMandatory.toLocaleString()}</span> mandatory
                </div>
              </div>
            </div>

            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search countries, services, currencies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>

              {/* Currency filter */}
              <div className="flex items-center gap-1">
                <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <button
                  type="button"
                  onClick={() => setCurrencyFilter(null)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    !currencyFilter
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All
                </button>
                {CATALOG_CURRENCIES.map((cur) => (
                  <button
                    key={cur}
                    type="button"
                    onClick={() =>
                      setCurrencyFilter((prev) => (prev === cur ? null : cur))
                    }
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                      currencyFilter === cur
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cur}
                  </button>
                ))}
              </div>

              {/* Mandatory/optional toggle */}
              <div className="flex items-center gap-1 border-l border-border pl-2">
                {(["all", "mandatory", "optional"] as FilterMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFilterMode(mode)}
                    className={`px-2 py-1 rounded text-[11px] font-medium capitalize transition-colors ${
                      filterMode === mode
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Body ────────────────────────────────────────────────────── */}
      <main className="max-w-[1400px] mx-auto px-4 py-4 space-y-6">
        {/* Region groups */}
        {grouped.map(({ region, entries }) => (
          <section key={region}>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-bold text-foreground">{region}</h2>
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] text-muted-foreground">
                {entries.length} jurisdiction{entries.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {entries.map((entry) => (
                <CountryCard
                  key={entry.countryCode}
                  entry={entry}
                />
              ))}
            </div>
          </section>
        ))}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Globe className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">
              No jurisdictions match your filters
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCurrencyFilter(null);
                setFilterMode("all");
              }}
              className="mt-2 text-xs text-primary hover:underline"
            >
              Reset all filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
