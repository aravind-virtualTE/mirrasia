/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { MCAP_CONFIGS } from "../configs/registry";
import { getPricingBaseCurrency } from "@/services/exchangeRate";
import {
  getEntityAdditionalFees,
  getEntityBasicPrice,
  getEntityNote,
  pricingData,
  service_list as usaServiceList,
} from "@/pages/Company/USA/constants";

type ExampleRow = {
  count: string;
  defaultAmount: string;
  hkAmount: string;
};

type SectionMeta = {
  id: string;
  title: string;
  eyebrow: string;
  summary: string;
  keywords: string[];
  content: ReactNode;
};

type CountryPricingEntry = {
  id: string;
  countryCode: string;
  displayName: string;
  sectionId: string;
  serviceCurrency: string;
  serviceItems: ServiceSelectionPriceItem[];
  hasConditionalPricing: boolean;
  kycProfileLabel: string;
  kycIndividualRate: number;
  kycCorporateRate: number;
  referenceMode?: "default-service-items" | "us-pricing-data";
  referenceSections?: ReferenceSection[];
  referenceStats?: {
    stateCount: number;
    entityTypeCount: number;
    optionalCount: number;
  };
};

type ServiceSelectionPriceItem = {
  id: string;
  label: string;
  amount: number;
  original?: number;
  mandatory: boolean;
  currency?: string;
};

type CountrySectionMeta = {
  id: string;
  title: string;
  eyebrow: string;
  summary: string;
};

type ReferenceRow = {
  label: string;
  amount: number;
  note?: string;
};

type ReferenceSection = {
  title: string;
  description: string;
  rows: ReferenceRow[];
};

const INDIVIDUAL_EXAMPLES: ExampleRow[] = [
  { count: "1 person", defaultAmount: "100", hkAmount: "65" },
  { count: "2 persons", defaultAmount: "100", hkAmount: "65" },
  { count: "3 persons", defaultAmount: "200", hkAmount: "130" },
  { count: "4 persons", defaultAmount: "200", hkAmount: "130" },
  { count: "5 persons", defaultAmount: "300", hkAmount: "195" },
];

const CORPORATE_EXAMPLES: ExampleRow[] = [
  { count: "1 corporate", defaultAmount: "150", hkAmount: "130" },
  { count: "2 corporates", defaultAmount: "150", hkAmount: "130" },
  { count: "3 corporates", defaultAmount: "300", hkAmount: "260" },
  { count: "4 corporates", defaultAmount: "300", hkAmount: "260" },
  { count: "5 corporates", defaultAmount: "450", hkAmount: "390" },
];

const DEFAULT_INDIVIDUAL_RATE = 100;
const DEFAULT_CORPORATE_RATE = 150;
const HK_INDIVIDUAL_RATE = 65;
const HK_CORPORATE_RATE = 130;
const INDIVIDUAL_KYC_LABEL = "Individual KYC / Due Diligence fee";
const CORPORATE_KYC_LABEL = "Corporate KYC / Due Diligence fee";
const SERVICE_CURRENCY_REFERENCE = ["USD", "HKD", "EURO"];

const CONFIG_LABEL_OVERRIDES: Record<string, string> = {
  "uae-ifza": "Dubai IFZA / UAE",
  "uae-difc": "Dubai DIFC / UAE",
  "uae-dmcc": "Dubai DMCC / UAE",
  "uae-dwtc": "Dubai DWTC / UAE",
  "uae-dic": "Dubai DIC / UAE",
  "uae-ifza-fzco": "Dubai IFZA FZCO / UAE",
};

const COUNTRY_SECTION_META: CountrySectionMeta[] = [
  {
    id: "hong-kong",
    title: "Hong Kong",
    eyebrow: "Registered country section",
    summary: "Hong Kong uses the HK-specific pricing profile for additional executive fees.",
  },
  {
    id: "americas",
    title: "Americas",
    eyebrow: "Registered country section",
    summary: "These registered Americas configs use the default pricing profile.",
  },
  {
    id: "europe",
    title: "Europe",
    eyebrow: "Registered country section",
    summary: "These registered Europe configs use the default pricing profile.",
  },
  {
    id: "asia-pacific",
    title: "Asia Pacific",
    eyebrow: "Registered country section",
    summary: "These registered Asia Pacific configs use the default pricing profile.",
  },
  {
    id: "middle-east",
    title: "Middle East",
    eyebrow: "Registered country section",
    summary: "These registered Middle East configs use the default pricing profile.",
  },
];

const getCountrySectionId = (entry: { id: string; countryCode: string }) => {
  const normalizedCode = String(entry.countryCode || "").toUpperCase();
  if (normalizedCode === "HK") return "hong-kong";
  if (["US", "CR"].includes(normalizedCode)) return "americas";
  if (["PA", "PPIF"].includes(normalizedCode)) return "Panama";
  if (["UK", "CH", "CH_LLC", "CH_FOUNDATION", "EE", "LT", "IE"].includes(normalizedCode)) return "europe";
  if (["SG", "AU"].includes(normalizedCode)) return "asia-pacific";
  if (normalizedCode === "UAE" || String(entry.id || "").startsWith("uae-")) return "middle-east";
  return "europe";
};

const normalizeServiceSelectionItem = (item: any): ServiceSelectionPriceItem | null => {
  const id = String(item?.id || "").trim();
  const label = String(item?.label || id || "").trim();
  if (!label) return null;

  const amount = Number(item?.amount ?? 0);
  const originalValue = item?.original;
  const original = Number.isFinite(Number(originalValue)) ? Number(originalValue) : undefined;

  return {
    id: id || label,
    label,
    amount: Number.isFinite(amount) ? amount : 0,
    original,
    mandatory: item?.mandatory === true,
    currency: typeof item?.currency === "string" ? item.currency : undefined,
  };
};

const resolveServiceSelectionInfo = (config: (typeof MCAP_CONFIGS)[number]) => {
  const serviceStep = config.steps.find((step) => step.widget === "ServiceSelectionWidget");
  const fallbackCurrency = getPricingBaseCurrency(config.countryCode);
  if (!serviceStep) {
    return {
      currency: fallbackCurrency,
      items: [] as ServiceSelectionPriceItem[],
      hasConditionalPricing: false,
    };
  }

  let sourceItems: any[] = [];
  if (Array.isArray(serviceStep.serviceItems)) {
    sourceItems = serviceStep.serviceItems;
  } else if (typeof serviceStep.serviceItems === "function") {
    try {
      sourceItems = serviceStep.serviceItems({}, config.entityMeta || null) || [];
    } catch {
      sourceItems = [];
    }
  }

  if (sourceItems.length === 0) {
    const feeServices = (config.entityMeta as any)?.fees?.service;
    if (Array.isArray(feeServices)) {
      sourceItems = feeServices;
    }
  }

  return {
    currency: fallbackCurrency,
    items: sourceItems.map(normalizeServiceSelectionItem).filter(Boolean) as ServiceSelectionPriceItem[],
    hasConditionalPricing: Array.isArray(serviceStep.fields) && serviceStep.fields.length > 0,
  };
};

const sumItemAmounts = (items: ServiceSelectionPriceItem[]) =>
  items.reduce((sum, item) => sum + Number(item.amount || 0), 0);

const getPriceRangeLabel = (items: ServiceSelectionPriceItem[], currency: string) => {
  if (items.length === 0) return "No defaults";
  const amounts = items.map((item) => Number(item.amount || 0));
  const min = Math.min(...amounts);
  const max = Math.max(...amounts);
  const upperCurrency = String(currency || "USD").toUpperCase();
  if (min === max) return `${upperCurrency} ${min}`;
  return `${upperCurrency} ${min} - ${upperCurrency} ${max}`;
};

const buildUsReferenceSections = (): {
  sections: ReferenceSection[];
  stats: { stateCount: number; entityTypeCount: number; optionalCount: number };
} => {
  const stateNames = Object.keys(pricingData.companyFormation || {});
  const entityTypes = ["LLC", "Corporation"];

  const formationRows: ReferenceRow[] = stateNames.flatMap((stateName) =>
    entityTypes.flatMap((entityType) => {
      const base = getEntityBasicPrice(stateName, entityType);
      if (!base) return [];

      const additionalFees = getEntityAdditionalFees(stateName, entityType);
      const note = getEntityNote(stateName, entityType);
      const extraFeeText = additionalFees
        ? Object.entries(additionalFees)
            .map(([feeLabel, amount]) => `${feeLabel}: USD ${amount}`)
            .join(" | ")
        : "";

      const parts = [extraFeeText, note].filter(Boolean);

      return [{
        label: `${stateName} - ${entityType}`,
        amount: Number(base.price || 0),
        ...(parts.length > 0 ? { note: parts.join(" | ") } : {}),
      }];
    })
  );

  const optionalRows: ReferenceRow[] = usaServiceList.map((service) => ({
    label: service.key,
    amount: Number(service.price || 0),
  }));

  return {
    sections: [
      {
        title: "State and entity formation reference",
        description:
          "The US mandatory base service changes with selected state and entity type. These values are sourced from pricingData in USA/constants.ts.",
        rows: formationRows,
      },
      {
        title: "Optional add-ons",
        description:
          "These optional service rows come from service_list in USA/constants.ts and stay selectable in the service step.",
        rows: optionalRows,
      },
    ],
    stats: {
      stateCount: stateNames.length,
      entityTypeCount: entityTypes.length,
      optionalCount: optionalRows.length,
    },
  };
};

function CountryPricingGrid({
  entries,
}: {
  entries: CountryPricingEntry[];
}) {
  const { t } = useTranslation();

  const formatLabel = (value: string) => {
    const translated = t(value, value);
    return translated === value ? value.replace(/^mcap\./, "").replace(/^newHk\./, "") : translated;
  };

  const formatPrice = (item: ServiceSelectionPriceItem, fallbackCurrency: string) => {
    const currency = String(item.currency || fallbackCurrency || "USD").toUpperCase();
    if (item.original !== undefined && item.original !== item.amount) {
      return `${currency} ${item.amount} (orig. ${currency} ${item.original})`;
    }
    return `${currency} ${item.amount}`;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="grid gap-4 p-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Registered configs</div>
            <div className="mt-2 text-2xl font-semibold text-slate-950">{entries.length}</div>
            <div className="mt-1 text-sm text-slate-600">Country and entity variants in this section.</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Service currencies</div>
            <div className="mt-2 text-2xl font-semibold text-slate-950">
              {SERVICE_CURRENCY_REFERENCE.join(", ")}
            </div>
            <div className="mt-1 text-sm text-slate-600">Reference currencies used across service selection pricing views.</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">View</div>
            <div className="mt-2 text-lg font-semibold text-slate-950">Service selection defaults</div>
            <div className="mt-1 text-sm text-slate-600">
              KYC label split, mandatory defaults, optional add-ons, and conditional pricing notes are grouped per config below.
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-5">
        {entries.map((entry) => {
          const mandatoryItems = entry.serviceItems.filter((item) => item.mandatory);
          const optionalItems = entry.serviceItems.filter((item) => !item.mandatory);
          const mandatorySubtotal = sumItemAmounts(mandatoryItems);
          const optionalPriceRange = getPriceRangeLabel(optionalItems, entry.serviceCurrency);
          const isUsPricingReference = entry.referenceMode === "us-pricing-data";

          return (
            <Card key={entry.id} className="border-slate-200 shadow-sm">
              <CardContent className="space-y-5 p-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-slate-950">{entry.displayName}</h3>
                    <p className="mt-1 text-sm text-slate-500">Config code: {entry.countryCode}</p>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                      {isUsPricingReference ? (
                        <>
                          US service pricing is driven by selected state and entity type. This reference uses
                          <code> pricingData</code> and <code>service_list</code> from
                          <code> USA/constants.ts</code> so the docs mirror the actual source values.
                        </>
                      ) : (
                        <>
                          Service selection starts in <span className="font-medium text-slate-800">{entry.serviceCurrency}</span>.
                          This reference separates the KYC display labels from other service selection defaults so the pricing pattern is easier to review.
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {isUsPricingReference ? (
                      <Badge variant="outline" className="border-slate-300 text-slate-700">
                        pricingData reference
                      </Badge>
                    ) : null}
                    <Badge variant="outline" className="border-slate-300 text-slate-700">
                      {entry.kycProfileLabel}
                    </Badge>
                    <Badge variant="outline" className="border-slate-300 text-slate-700">
                      {mandatoryItems.length} mandatory
                    </Badge>
                    <Badge variant="outline" className="border-slate-300 text-slate-700">
                      {optionalItems.length} optional
                    </Badge>
                  </div>
                </div>

                <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-4">
                  <div className="text-xs font-medium uppercase tracking-[0.16em] text-sky-700">
                    KYC label display in service selection and invoice
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Instead of one common <code>KYC / Due Diligence fee</code> label, this config should show separate
                    individual and corporate KYC labels because the rates are different.
                  </p>
                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-xl border border-sky-200 bg-white px-4 py-3">
                      <div className="text-sm font-medium text-slate-900">{INDIVIDUAL_KYC_LABEL}</div>
                      <div className="mt-2 text-lg font-semibold text-slate-950">
                        USD {entry.kycIndividualRate}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">Per 2 individual parties.</div>
                    </div>
                    <div className="rounded-xl border border-sky-200 bg-white px-4 py-3">
                      <div className="text-sm font-medium text-slate-900">{CORPORATE_KYC_LABEL}</div>
                      <div className="mt-2 text-lg font-semibold text-slate-950">
                        USD {entry.kycCorporateRate}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">Per 2 corporate parties.</div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Base currency</div>
                    <div className="mt-2 text-xl font-semibold text-slate-950">{entry.serviceCurrency}</div>
                    <div className="mt-1 text-sm text-slate-600">Service selection default currency.</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                      {isUsPricingReference ? "State coverage" : "Mandatory subtotal"}
                    </div>
                    <div className="mt-2 text-xl font-semibold text-slate-950">
                      {isUsPricingReference
                        ? `${entry.referenceStats?.stateCount || 0} states`
                        : `${entry.serviceCurrency} ${mandatorySubtotal}`}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      {isUsPricingReference
                        ? "States currently defined in pricingData for US company formation."
                        : "Sum of current mandatory default items shown below."}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                      {isUsPricingReference ? "Entity types and add-ons" : "Optional range"}
                    </div>
                    <div className="mt-2 text-xl font-semibold text-slate-950">
                      {isUsPricingReference
                        ? `${entry.referenceStats?.entityTypeCount || 0} entity types`
                        : optionalPriceRange}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      {isUsPricingReference
                        ? `${entry.referenceStats?.optionalCount || 0} optional add-ons from service_list.`
                        : entry.hasConditionalPricing
                          ? "This config also contains service-step conditions that can change what appears."
                          : "Shown for the optional items currently configured by default."}
                    </div>
                  </div>
                </div>

                {entry.hasConditionalPricing ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
                    This config contains conditional service-step pricing. Some rows may appear only after extra answers are selected in the service step.
                  </div>
                ) : null}

                {isUsPricingReference && entry.referenceSections?.length ? (
                  <div className="space-y-4">
                    {entry.referenceSections.map((section) => (
                      <div key={`${entry.id}-${section.title}`} className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                          {section.title}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{section.description}</p>
                        <div className="mt-4 space-y-2">
                          {section.rows.map((row) => (
                            <div
                              key={`${entry.id}-${section.title}-${row.label}`}
                              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="text-sm font-medium text-slate-800">{formatLabel(row.label)}</div>
                                  {row.note ? (
                                    <div className="mt-1 text-sm leading-6 text-slate-600">{row.note}</div>
                                  ) : null}
                                </div>
                                <div className="shrink-0 text-sm font-medium text-slate-950">
                                  {entry.serviceCurrency} {row.amount}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4 xl:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                        Mandatory service selection items
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        These rows are included by default in the service selection screen for this config.
                      </p>
                      {mandatoryItems.length > 0 ? (
                        <div className="mt-4 space-y-2">
                          {mandatoryItems.map((item) => (
                            <div
                              key={`${entry.id}-${item.id}`}
                              className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                            >
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-slate-800">{formatLabel(item.label)}</div>
                                <div className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">Included by default</div>
                              </div>
                              <div className="shrink-0 text-sm font-medium text-slate-950">
                                {formatPrice(item, entry.serviceCurrency)}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-slate-500">No mandatory service selection defaults found.</p>
                      )}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                        Optional service selection items
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        These rows are available as add-ons when the user reaches the service selection step.
                      </p>
                      {optionalItems.length > 0 ? (
                        <div className="mt-4 space-y-2">
                          {optionalItems.map((item) => (
                            <div
                              key={`${entry.id}-${item.id}`}
                              className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
                            >
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-slate-800">{formatLabel(item.label)}</div>
                                <div className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">Selectable add-on</div>
                              </div>
                              <div className="shrink-0 text-sm font-medium text-slate-950">
                                {formatPrice(item, entry.serviceCurrency)}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-slate-500">No optional service selection defaults found.</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ExampleTable({
  title,
  description,
  rows,
}: {
  title: string;
  description: string;
  rows: ExampleRow[];
}) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-0">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-5 py-3 font-medium">Party count</th>
                <th className="px-5 py-3 font-medium">Default countries</th>
                <th className="px-5 py-3 font-medium">Hong Kong</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.count} className="border-t border-slate-100 text-slate-800">
                  <td className="px-5 py-3">{row.count}</td>
                  <td className="px-5 py-3">USD {row.defaultAmount}</td>
                  <td className="px-5 py-3">USD {row.hkAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default function McapAdditionalExecutivePricingDocs() {
  const [query, setQuery] = useState("");

  const countryPricingEntries = useMemo<CountryPricingEntry[]>(
        () =>
      MCAP_CONFIGS.map((config) => {
        const serviceSelectionInfo = resolveServiceSelectionInfo(config);
        const isHongKong = String(config.countryCode || "").toUpperCase() === "HK";
        const isUsConfig = String(config.countryCode || "").toUpperCase() === "US";
        const usReference = isUsConfig ? buildUsReferenceSections() : null;
        const referenceMode: CountryPricingEntry["referenceMode"] = isUsConfig
          ? "us-pricing-data"
          : "default-service-items";
        return {
          id: config.id,
          countryCode: config.countryCode,
          displayName: CONFIG_LABEL_OVERRIDES[config.id] || config.countryName,
          sectionId: getCountrySectionId({ id: config.id, countryCode: config.countryCode }),
          serviceCurrency: serviceSelectionInfo.currency,
          serviceItems: serviceSelectionInfo.items,
          hasConditionalPricing: serviceSelectionInfo.hasConditionalPricing,
          kycProfileLabel: isUsConfig
            ? "KYC split reference"
            : (isHongKong ? "HK KYC profile" : "Default KYC profile"),
          kycIndividualRate: isHongKong ? HK_INDIVIDUAL_RATE : DEFAULT_INDIVIDUAL_RATE,
          kycCorporateRate: isHongKong ? HK_CORPORATE_RATE : DEFAULT_CORPORATE_RATE,
          referenceMode,
          referenceSections: usReference?.sections,
          referenceStats: usReference?.stats,
        };
      }).sort((a, b) => a.displayName.localeCompare(b.displayName)),
    []
  );

  const countrySections = useMemo<SectionMeta[]>(
    () =>
      COUNTRY_SECTION_META.map((meta) => {
        const entries = countryPricingEntries.filter((entry) => entry.sectionId === meta.id);
        return {
          id: meta.id,
          title: meta.title,
          eyebrow: meta.eyebrow,
          summary: meta.summary,
          keywords: [
            meta.title,
            ...entries.flatMap((entry) => [
              entry.displayName,
              entry.countryCode,
              entry.kycProfileLabel,
              INDIVIDUAL_KYC_LABEL,
              CORPORATE_KYC_LABEL,
              ...entry.serviceItems.map((item) => item.label),
            ]),
          ],
          content: (
            <CountryPricingGrid entries={entries} />
          ),
        };
      }).filter((section) =>
        countryPricingEntries.some((entry) => entry.sectionId === section.id)
      ),
    [countryPricingEntries]
  );

  const sections = useMemo<SectionMeta[]>(
    () => [
      {
        id: "overview",
        title: "Overview",
        eyebrow: "Additional Executive Pricing",
        summary: "Pricing reference for Additional Executive Pricing across all registered MCAP country configs.",
        keywords: ["overview", "reference", "education", "pricing", "registry", "countries"],
        content: (
          <div className="space-y-5 text-slate-700">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-5">
                  <div className="text-sm font-medium text-slate-500">Pricing source</div>
                  <p className="mt-2 text-sm leading-6">
                    Party type is read from <code>Associated Parties</code>: <code>person</code> means individual and
                    <code> entity</code> means corporate.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-5">
                  <div className="text-sm font-medium text-slate-500">Charging model</div>
                  <p className="mt-2 text-sm leading-6">
                    Fees are charged in packs of 2. Default countries use USD {DEFAULT_INDIVIDUAL_RATE} for
                    individuals and USD {DEFAULT_CORPORATE_RATE} for corporates. Any remaining single party still
                    counts as a full pack.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-5">
                  <div className="text-sm font-medium text-slate-500">Country sections</div>
                  <p className="mt-2 text-sm leading-6">
                    Registered country sections below focus on service selection defaults, optional add-ons, and whether a config has conditional pricing inputs.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ),
      },
      {
        id: "pricing-rules",
        title: "KYC Due Dilligence Pricing Rules",
        eyebrow: "Rates",
        summary:
          "Default countries use one set of rates, while Hong Kong uses a lower country-specific rate for individuals and corporates.",
        keywords: ["rates", "hk", "default", "individual", "corporate"],
        content: (
          <div className="space-y-6 text-slate-700">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="space-y-4 p-5">
                <div>
                  <h3 className="text-base font-semibold text-slate-950">Pack formula</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    The fee is calculated by counting each party type separately and rounding each type up in packs of
                    two.
                  </p>
                </div>
                <pre className="overflow-x-auto rounded-xl bg-slate-950 px-4 py-3 text-sm text-slate-100">
                  <code>{`individualFee = ceil(personCount / 2) * individualRate
corporateFee = ceil(entityCount / 2) * corporateRate`}</code>
                </pre>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-5">
                  <div className="text-sm font-medium text-slate-500">Default countries</div>
                  <ul className="mt-3 space-y-2 text-sm leading-6">
                    <li>Individuals: USD {DEFAULT_INDIVIDUAL_RATE} for every 2 individuals.</li>
                    <li>Corporates: USD {DEFAULT_CORPORATE_RATE} for every 2 corporates.</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-5">
                  <div className="text-sm font-medium text-slate-500">Hong Kong</div>
                  <ul className="mt-3 space-y-2 text-sm leading-6">
                    <li>Individuals: USD {HK_INDIVIDUAL_RATE} for every 2 individuals.</li>
                    <li>Corporates: USD {HK_CORPORATE_RATE} for every 2 corporates.</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="grid gap-4 p-5 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Old common label</div>
                  <div className="mt-2 text-base font-semibold text-slate-950">KYC / Due Diligence fee</div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    This single shared label is no longer clear enough once individual and corporate rates differ.
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                  <div className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-700">New display labels</div>
                  <div className="mt-2 space-y-3">
                    <div>
                      <div className="text-base font-semibold text-slate-950">{INDIVIDUAL_KYC_LABEL}</div>
                      <div className="text-sm text-slate-600">Use for person-based KYC pricing.</div>
                    </div>
                    <div>
                      <div className="text-base font-semibold text-slate-950">{CORPORATE_KYC_LABEL}</div>
                      <div className="text-sm text-slate-600">Use for entity-based KYC pricing.</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ),
      },
      {
        id: "worked-examples",
        title: "Worked Examples",
        eyebrow: "Examples",
        summary: "These examples show the intended pricing outcome for common party-count scenarios.",
        keywords: ["examples", "pricing", "person", "corporate", "entity"],
        content: (
          <div className="space-y-6">
            <ExampleTable
              title="Individual pricing examples"
              description="Party type `person` should use the individual rate."
              rows={INDIVIDUAL_EXAMPLES}
            />
            <ExampleTable
              title="Corporate pricing examples"
              description="Party type `entity` should use the corporate rate."
              rows={CORPORATE_EXAMPLES}
            />
          </div>
        ),
      },
      ...countrySections,
    ],
    [countryPricingEntries.length, countrySections]
  );

  const filteredSections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return sections;
    return sections.filter((section) =>
      [section.title, section.eyebrow, section.summary, ...section.keywords]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [query, sections]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(234,179,8,0.12),_transparent_34%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_30%,_#f8fafc_100%)] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1760px] flex-col gap-4 px-4 py-4 sm:px-6 xl:flex-row xl:items-center xl:justify-between xl:px-8">
          <div className="min-w-0">
            <div className="text-[16px] font-semibold uppercase tracking-[0.24em] text-amber-700">Info Docs</div>                  
          </div>

          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search pricing reference..."
              className="h-11 border-slate-300 bg-white pl-9 shadow-sm"
            />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1760px] px-4 py-6 sm:px-6 xl:px-8">
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 lg:hidden">
          {filteredSections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="whitespace-nowrap rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm"
            >
              {section.title}
            </a>
          ))}
        </div>

        <div className="lg:grid lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-6 2xl:grid-cols-[190px_minmax(0,1fr)_190px] 2xl:gap-8">
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-5">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Sections</div>
                <nav className="mt-4 space-y-1">
                  {filteredSections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="block rounded-xl px-3 py-2 text-sm leading-6 text-slate-700 transition hover:bg-white hover:text-slate-950"
                    >
                      {section.title}
                    </a>
                  ))}
                </nav>
              </div>


            </div>
          </aside>

          <main className="min-w-0">
            <div className="space-y-12">
              {filteredSections.length === 0 ? (
                <Card className="border-slate-200 shadow-sm">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-slate-950">No matching sections</h2>
                    <p className="mt-2 text-sm text-slate-600">
                      Try a broader search like <code>HK</code>, <code>corporate</code>, <code>individual</code>, or
                      <code> pricing</code>.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredSections.map((section, index) => (
                  <section key={section.id} id={section.id} className="scroll-mt-28">
                    <div className="mb-5">
                      <div className="text-[16px] font-semibold uppercase tracking-[0.22em] text-amber-700">
                        {section.eyebrow}
                      </div>
                      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 xl:text-3xl">{section.title}</h2>
                      <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">{section.summary}</p>
                    </div>
                    {section.content}
                    {index < filteredSections.length - 1 ? <Separator className="mt-12 bg-slate-200" /> : null}
                  </section>
                ))
              )}
            </div>
          </main>

          <aside className="hidden 2xl:block">
            <div className="sticky top-24 space-y-5">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">On this page</div>
                <div className="mt-4 space-y-2">
                  {filteredSections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className={cn(
                        "block text-sm leading-6 text-slate-600 transition hover:text-slate-950",
                        query && "rounded-lg px-2 py-1 hover:bg-white"
                      )}
                    >
                      {section.title}
                    </a>
                  ))}
                </div>
              </div>

            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
