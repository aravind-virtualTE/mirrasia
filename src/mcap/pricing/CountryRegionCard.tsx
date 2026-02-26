import { useMemo, useState } from "react";
import { CountryRegion, PricingItem } from "./pricing";
import { PricingItemRow } from "./PricingItemRow";
import { ChevronDown, ChevronRight, MapPin, Building, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CountryRegionCardProps {
  region: CountryRegion;
  onUpdateItem: (regionCode: string, itemIndex: number, updatedItem: PricingItem) => void;
  onDeleteItem: (regionCode: string, itemIndex: number) => void;
  onAddItem: (regionCode: string) => void;
  onDeleteRegion?: (regionCode: string) => void;
}

export function CountryRegionCard({
  region,
  onUpdateItem,
  onDeleteItem,
  onAddItem,
  onDeleteRegion,
}: CountryRegionCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const activeCount = useMemo(
    () => region.items.filter((item) => item.active !== false).length,
    [region.items]
  );

  const handleSaveItem = (index: number, updatedItem: PricingItem) => {
    onUpdateItem(region.code, index, updatedItem);
  };

  return (
    <div className="bg-card rounded-md border border-border overflow-hidden shadow-sm">
      <div className="px-3 py-2 bg-region border-b border-border flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex items-center gap-2 flex-1 text-left"
        >
          <span className="text-xl leading-none">{region.flag || "REG"}</span>
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <h3 className="font-semibold text-foreground text-sm">{region.name}</h3>
            <Badge variant="secondary" className="text-[10px] uppercase">
              {region.code}
            </Badge>
            <div className="flex items-center gap-1 text-muted-foreground">
              {region.type === "region" ? <MapPin className="h-3 w-3" /> : <Building className="h-3 w-3" />}
              <span className="text-xs capitalize">{region.type}</span>
            </div>
          </div>

          <div className="ml-auto mr-2 flex items-center gap-1 text-xs text-muted-foreground">
            <span>{region.items.length} items</span>
            <span>|</span>
            <span>{activeCount} active</span>
          </div>

          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-8 px-2 text-xs"
            onClick={() => onAddItem(region.code)}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Item
          </Button>

          {onDeleteRegion && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => {
                const confirmed = window.confirm(`Delete region "${region.name}" and all its pricing items?`);
                if (confirmed) onDeleteRegion(region.code);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div
        className={cn(
          "transition-all duration-200 overflow-hidden",
          isExpanded ? "max-h-[4000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {region.items.length === 0 ? (
          <div className="px-4 py-5 text-sm text-muted-foreground flex items-center justify-between">
            <span>No items configured for this region yet.</span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 px-2 text-xs"
              onClick={() => onAddItem(region.code)}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add First Item
            </Button>
          </div>
        ) : (
          region.items.map((item, index) => (
            <PricingItemRow
              key={`${region.code}-${item.serviceId || item.name || "item"}-${index}`}
              item={item}
              onSave={(updatedItem) => handleSaveItem(index, updatedItem)}
              onDelete={() => onDeleteItem(region.code, index)}
            />
          ))
        )}
      </div>
    </div>
  );
}

