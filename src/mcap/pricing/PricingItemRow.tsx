import { useState } from "react";
import { PricingItem, Pricing } from "./pricing";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Pencil, X, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PricingItemRowProps {
  item: PricingItem;
  onSave: (updatedItem: PricingItem) => void;
}

// Exchange rates to USD (approximate)
const exchangeRates: Record<string, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  CHF: 1.13,
  CAD: 0.74,
  SGD: 0.75,
  HKD: 0.13,
  JPY: 0.0067,
  AUD: 0.65,
};

const convertToUSD = (value: number | undefined, currency: string): number | undefined => {
  if (value === undefined || value === 0) return undefined;
  const rate = exchangeRates[currency] || 1;
  return Math.round(value * rate);
};

const formatCurrency = (value: number | undefined, currency: string) => {
  if (value === undefined || value === 0) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency === "CHF" ? "CHF" : currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatUSD = (value: number | undefined) => {
  if (value === undefined) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const priceFields: { key: keyof Pricing; label: string }[] = [
  { key: "government_fees", label: "Gov. Fees" },
  { key: "service_fee", label: "Service" },
  { key: "registered_agent", label: "Reg. Agent" },
  { key: "registered_office", label: "Reg. Office" },
  { key: "license_fee", label: "License" },
  { key: "franchise_tax", label: "Franchise Tax" },
  { key: "compliance_fee", label: "Compliance" },
  { key: "total_first_year", label: "1st Year (USD)" },
  { key: "annual_renewal", label: "Renewal" },
];

// Special field for local currency display
const localFirstYearField = { key: "total_first_year" as keyof Pricing, label: "1st Year (Local)" };

export function PricingItemRow({ item, onSave }: PricingItemRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPricing, setEditedPricing] = useState<Pricing>({ ...item.pricing });

  const handleSave = () => {
    onSave({ ...item, pricing: editedPricing });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedPricing({ ...item.pricing });
    setIsEditing(false);
  };

  const handleFieldChange = (key: keyof Pricing, value: string) => {
    const numValue = parseInt(value) || 0;
    setEditedPricing((prev) => ({ ...prev, [key]: numValue }));
  };

  const visibleFields = priceFields.filter(
    (field) => item.pricing[field.key] !== undefined
  );

  return (
    <div
      className={cn(
        "group border-b border-border last:border-b-0 transition-colors",
        isEditing ? "bg-accent/50" : "hover:bg-item-hover"
      )}
    >
      <div className="flex items-start gap-2 px-3 py-2">
        {/* Flag & Name */}
        <div className="flex items-center gap-2 min-w-[180px] shrink-0">
          <span className="text-lg leading-none">{item.flag}</span>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground leading-tight">
              {item.name}
            </span>
            <span className="text-xs text-muted-foreground capitalize">
              {item.type}
            </span>
          </div>
        </div>

        {/* Pricing Fields */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-3 gap-y-1">
          {visibleFields.map((field) => {
            const value = item.pricing[field.key];
            return (
              <div key={field.key} className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  {field.label}
                </span>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editedPricing[field.key] ?? 0}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className="h-6 text-xs px-1.5 py-0"
                  />
                ) : (
                  <span
                    className={cn(
                      "text-sm font-medium",
                      field.key === "total_first_year"
                        ? "text-primary"
                        : "text-foreground"
                    )}
                  >
                    {field.key === "total_first_year"
                      ? formatUSD(convertToUSD(value as number, item.pricing.currency))
                      : formatCurrency(value as number, item.pricing.currency)}
                  </span>
                )}
              </div>
            );
          })}

          {/* Local Currency 1st Year Column */}
          {item.pricing.total_first_year !== undefined && (
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                {localFirstYearField.label}
              </span>
              {isEditing ? (
                <span className="text-sm font-medium text-muted-foreground">
                  {formatCurrency(editedPricing.total_first_year, item.pricing.currency)}
                </span>
              ) : (
                <span className="text-sm font-medium text-foreground">
                  {formatCurrency(item.pricing.total_first_year, item.pricing.currency)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Currency & Timeline */}
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 font-medium">
            {item.pricing.currency}
          </Badge>
          {item.pricing.timeline && (
            <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span className="whitespace-nowrap">{item.pricing.timeline}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {isEditing ? (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-success hover:text-success hover:bg-success/10"
                onClick={handleSave}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleCancel}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Notes */}
      {item.pricing.notes && (
        <div className="px-3 pb-2 pl-10">
          <span className="text-xs text-muted-foreground italic">
            {item.pricing.notes}
          </span>
        </div>
      )}
    </div>
  );
}
