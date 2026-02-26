import { useEffect, useMemo, useState } from "react";
import { PricingItem, Pricing } from "./pricing";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface PricingItemRowProps {
  item: PricingItem;
  onSave: (updatedItem: PricingItem) => void;
  onDelete?: () => void;
}

const RESERVED_PRICING_KEYS = new Set(["currency", "timeline", "notes"]);
const PRIMARY_PRICING_KEYS = ["amount", "total_first_year", "service_fee", "government_fees", "annual_renewal"];
const PRICING_KEY_REGEX = /^[a-zA-Z0-9_]+$/;

const FIELD_LABELS: Record<string, string> = {
  government_fees: "Gov. Fees",
  service_fee: "Service",
  registered_agent: "Reg. Agent",
  registered_office: "Reg. Office",
  license_fee: "License",
  franchise_tax: "Franchise Tax",
  compliance_fee: "Compliance",
  total_first_year: "1st Year",
  annual_renewal: "Renewal",
  amount: "Amount",
};

const toReadableLabel = (fieldKey: string) =>
  FIELD_LABELS[fieldKey] || fieldKey.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const sanitizePricingKey = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .toLowerCase();

const toNumberFlexible = (value: unknown): number | null => {
  const direct = Number(value);
  if (Number.isFinite(direct)) return direct;
  const cleaned = String(value ?? "").replace(/[^0-9.-]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
};

const parsePricingFieldValue = (value: string): number | string | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const numericPattern = /^[-+]?[$]?\d[\d,]*(\.\d+)?$/;
  if (numericPattern.test(trimmed)) {
    const parsed = toNumberFlexible(trimmed);
    if (parsed !== null) return parsed;
  }

  return trimmed;
};

const formatCurrency = (value: number | undefined, currency: string) => {
  if (value === undefined) return "-";
  if (value === 0) return "Included";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: String(currency || "USD").toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${String(currency || "USD").toUpperCase()}`;
  }
};

const formatPricingValue = (value: number | string | undefined, currency: string) => {
  if (value === undefined || value === null || value === "") return "-";
  if (typeof value === "number") return formatCurrency(value, currency);

  const parsed = toNumberFlexible(value);
  const text = String(value).trim();
  if (parsed !== null && /^[-+]?[$]?\d/.test(text)) {
    return formatCurrency(parsed, currency);
  }

  return text;
};

type PricingFieldDraft = {
  id: string;
  key: string;
  value: string;
};

const cloneItem = (item: PricingItem): PricingItem => ({
  ...item,
  pricing: { ...item.pricing },
  metadata: item.metadata ? { ...item.metadata } : undefined,
});

const buildPricingDrafts = (pricing: Pricing): PricingFieldDraft[] =>
  Object.entries(pricing || {})
    .filter(([key]) => !RESERVED_PRICING_KEYS.has(key))
    .map(([key, value], index) => ({
      id: `${key}-${index}-${Math.random().toString(36).slice(2, 7)}`,
      key,
      value: value === undefined || value === null ? "" : String(value),
    }));

const getPrimaryPrice = (pricing: Pricing): { key: string; value: number } | null => {
  for (const key of PRIMARY_PRICING_KEYS) {
    const parsed = toNumberFlexible(pricing?.[key]);
    if (parsed !== null) return { key, value: parsed };
  }

  for (const [key, value] of Object.entries(pricing || {})) {
    if (RESERVED_PRICING_KEYS.has(key)) continue;
    const parsed = toNumberFlexible(value);
    if (parsed !== null) return { key, value: parsed };
  }

  return null;
};

export function PricingItemRow({ item, onSave, onDelete }: PricingItemRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftItem, setDraftItem] = useState<PricingItem>(() => cloneItem(item));
  const [pricingFields, setPricingFields] = useState<PricingFieldDraft[]>(() => buildPricingDrafts(item.pricing));
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");

  useEffect(() => {
    if (isEditing) return;
    setDraftItem(cloneItem(item));
    setPricingFields(buildPricingDrafts(item.pricing));
  }, [item, isEditing]);

  const currency = String(item.pricing?.currency || "USD").toUpperCase();

  const visibleFields = useMemo(
    () => Object.entries(item.pricing || {}).filter(([key]) => !RESERVED_PRICING_KEYS.has(key)),
    [item.pricing]
  );

  const primaryPrice = useMemo(() => getPrimaryPrice(item.pricing), [item.pricing]);

  const beginEdit = () => {
    setDraftItem(cloneItem(item));
    setPricingFields(buildPricingDrafts(item.pricing));
    setNewFieldName("");
    setNewFieldValue("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDraftItem(cloneItem(item));
    setPricingFields(buildPricingDrafts(item.pricing));
    setNewFieldName("");
    setNewFieldValue("");
    setIsEditing(false);
  };

  const handleItemChange = (key: keyof PricingItem, value: string | boolean) => {
    setDraftItem((prev) => ({ ...prev, [key]: value }));
  };

  const handlePricingMetaChange = (key: "currency" | "timeline" | "notes", value: string) => {
    setDraftItem((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [key]: value,
      },
    }));
  };

  const updatePricingField = (id: string, patch: Partial<PricingFieldDraft>) => {
    setPricingFields((prev) => prev.map((field) => (field.id === id ? { ...field, ...patch } : field)));
  };

  const removePricingField = (id: string) => {
    setPricingFields((prev) => prev.filter((field) => field.id !== id));
  };

  const addCustomField = () => {
    const normalizedName = sanitizePricingKey(newFieldName);
    if (!normalizedName) return;
    if (!PRICING_KEY_REGEX.test(normalizedName)) return;
    if (RESERVED_PRICING_KEYS.has(normalizedName)) return;
    if (pricingFields.some((field) => sanitizePricingKey(field.key) === normalizedName)) return;

    setPricingFields((prev) => [
      ...prev,
      {
        id: `${normalizedName}-${Date.now()}`,
        key: normalizedName,
        value: newFieldValue,
      },
    ]);

    setNewFieldName("");
    setNewFieldValue("");
  };

  const handleSave = () => {
    const nextPricing: Pricing = {
      currency: String(draftItem.pricing?.currency || "USD").trim().toUpperCase() || "USD",
    };

    const timeline = String(draftItem.pricing?.timeline || "").trim();
    if (timeline) nextPricing.timeline = timeline;

    const notes = String(draftItem.pricing?.notes || "").trim();
    if (notes) nextPricing.notes = notes;

    pricingFields.forEach((field) => {
      const normalizedKey = sanitizePricingKey(field.key);
      if (!normalizedKey) return;
      if (RESERVED_PRICING_KEYS.has(normalizedKey)) return;

      const parsedValue = parsePricingFieldValue(field.value);
      if (parsedValue === undefined) return;
      nextPricing[normalizedKey] = parsedValue;
    });

    const nextItem: PricingItem = {
      ...draftItem,
      name: String(draftItem.name || "").trim() || "Untitled Item",
      type: String(draftItem.type || "").trim() || "service_override",
      flag: String(draftItem.flag || "").trim(),
      serviceId: String(draftItem.serviceId || "").trim(),
      countryCode: String(draftItem.countryCode || "").trim().toUpperCase(),
      state: String(draftItem.state || "").trim(),
      entityType: String(draftItem.entityType || "").trim(),
      active: draftItem.active !== false,
      pricing: nextPricing,
    };

    onSave(nextItem);
    setIsEditing(false);
    setNewFieldName("");
    setNewFieldValue("");
  };

  return (
    <div
      className={cn(
        "group border-b border-border last:border-b-0 transition-colors",
        isEditing ? "bg-accent/35" : "hover:bg-item-hover"
      )}
    >
      <div className="px-4 py-3 flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-4">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg leading-none">{item.flag || "TAG"}</span>
            <h4 className="text-sm font-semibold text-foreground">{item.name || "Untitled Item"}</h4>
            <Badge variant="secondary" className="text-[10px] capitalize">
              {item.type || "service_override"}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px]",
                item.active === false
                  ? "border-destructive/40 text-destructive"
                  : "border-emerald-500/40 text-emerald-700"
              )}
            >
              {item.active === false ? "Inactive" : "Active"}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
            {item.serviceId && (
              <span className="px-2 py-0.5 rounded border bg-background">service: {item.serviceId}</span>
            )}
            {item.countryCode && (
              <span className="px-2 py-0.5 rounded border bg-background">country: {item.countryCode}</span>
            )}
            {item.state && <span className="px-2 py-0.5 rounded border bg-background">state: {item.state}</span>}
            {item.entityType && (
              <span className="px-2 py-0.5 rounded border bg-background">entity: {item.entityType}</span>
            )}
            <span className="px-2 py-0.5 rounded border bg-background">currency: {currency}</span>
            {item.pricing.timeline && (
              <span className="px-2 py-0.5 rounded border bg-background">timeline: {item.pricing.timeline}</span>
            )}
          </div>

          {!isEditing && (
            <div className="flex flex-wrap gap-2">
              {visibleFields.length > 0 ? (
                visibleFields.map(([fieldKey, value]) => (
                  <div key={fieldKey} className="rounded border bg-background px-2 py-1 min-w-[110px]">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      {toReadableLabel(fieldKey)}
                    </p>
                    <p className={cn("text-xs font-semibold", fieldKey === "amount" ? "text-primary" : "text-foreground")}>
                      {formatPricingValue(value as number | string | undefined, currency)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No pricing fields configured.</p>
              )}
            </div>
          )}

          {!isEditing && item.pricing.notes && (
            <p className="text-xs text-muted-foreground italic">{item.pricing.notes}</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 lg:flex-col lg:items-end lg:justify-start">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {primaryPrice ? toReadableLabel(primaryPrice.key) : "Pricing"}
            </p>
            <p className="text-sm font-semibold text-primary">
              {primaryPrice ? formatPricingValue(primaryPrice.value, currency) : "Custom"}
            </p>
          </div>

          <div className="flex items-center gap-1">
            {isEditing ? (
              <>
                <Button
                  size="sm"
                  variant="default"
                  className="h-8 px-2 text-xs"
                  onClick={handleSave}
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2 text-xs"
                  onClick={handleCancel}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 px-2 text-xs"
                  onClick={beginEdit}
                >
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
                {onDelete && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      const confirmed = window.confirm(`Delete pricing item "${item.name}"?`);
                      if (confirmed) onDelete();
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="px-4 pb-4 border-t border-border bg-muted/15">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 pt-3">
            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">Name</label>
              <Input
                value={String(draftItem.name || "")}
                onChange={(e) => handleItemChange("name", e.target.value)}
                className="h-8 text-xs"
                placeholder="Service name"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">Type</label>
              <Input
                value={String(draftItem.type || "")}
                onChange={(e) => handleItemChange("type", e.target.value)}
                className="h-8 text-xs"
                placeholder="service_override"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">Flag</label>
              <Input
                value={String(draftItem.flag || "")}
                onChange={(e) => handleItemChange("flag", e.target.value)}
                className="h-8 text-xs"
                placeholder="HK"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">Service ID</label>
              <Input
                value={String(draftItem.serviceId || "")}
                onChange={(e) => handleItemChange("serviceId", e.target.value)}
                className="h-8 text-xs"
                placeholder="base"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">Country Code</label>
              <Input
                value={String(draftItem.countryCode || "")}
                onChange={(e) => handleItemChange("countryCode", e.target.value.toUpperCase())}
                className="h-8 text-xs"
                placeholder="HK / US / SG"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">State (Optional)</label>
              <Input
                value={String(draftItem.state || "")}
                onChange={(e) => handleItemChange("state", e.target.value)}
                className="h-8 text-xs"
                placeholder="Delaware"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">Entity Type (Optional)</label>
              <Input
                value={String(draftItem.entityType || "")}
                onChange={(e) => handleItemChange("entityType", e.target.value)}
                className="h-8 text-xs"
                placeholder="LLC / Corporation"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">Currency</label>
              <Input
                value={String(draftItem.pricing?.currency || "")}
                onChange={(e) => handlePricingMetaChange("currency", e.target.value.toUpperCase())}
                className="h-8 text-xs"
                placeholder="USD"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">Timeline (Optional)</label>
              <Input
                value={String(draftItem.pricing?.timeline || "")}
                onChange={(e) => handlePricingMetaChange("timeline", e.target.value)}
                className="h-8 text-xs"
                placeholder="5-7 business days"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">Active</label>
              <div className="h-8 px-3 rounded-md border bg-background flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {draftItem.active === false ? "Inactive" : "Active"}
                </span>
                <Switch
                  checked={draftItem.active !== false}
                  onCheckedChange={(checked) => handleItemChange("active", checked)}
                />
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-md border bg-background/50">
            <div className="px-3 py-2 border-b flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-medium">Pricing Fields</p>
                <p className="text-[11px] text-muted-foreground">
                  Use key/value fields to model government fees, optional services, or custom pricing structures.
                </p>
              </div>
            </div>
            <div className="p-3 space-y-2">
              {pricingFields.map((field) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_auto] gap-2 items-center">
                  <Input
                    value={field.key}
                    onChange={(e) => updatePricingField(field.id, { key: e.target.value })}
                    className="h-8 text-xs"
                    placeholder="field_key"
                  />
                  <Input
                    value={field.value}
                    onChange={(e) => updatePricingField(field.id, { value: e.target.value })}
                    className="h-8 text-xs"
                    placeholder="221 or Included"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removePricingField(field.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}

              {pricingFields.length === 0 && (
                <p className="text-xs text-muted-foreground">No pricing fields added yet.</p>
              )}

              <div className="pt-2 border-t grid grid-cols-1 md:grid-cols-[1.2fr_1fr_auto] gap-2 items-center">
                <Input
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  className="h-8 text-xs"
                  placeholder="new_field_key"
                />
                <Input
                  value={newFieldValue}
                  onChange={(e) => setNewFieldValue(e.target.value)}
                  className="h-8 text-xs"
                  placeholder="0"
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="h-8 px-2 text-xs"
                  onClick={addCustomField}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-2 space-y-1">
            <label className="text-[11px] text-muted-foreground">Notes (Optional)</label>
            <Textarea
              value={String(draftItem.pricing?.notes || "")}
              onChange={(e) => handlePricingMetaChange("notes", e.target.value)}
              className="min-h-[72px] text-xs"
              placeholder="Additional pricing notes for admin context"
            />
          </div>
        </div>
      )}
    </div>
  );
}

