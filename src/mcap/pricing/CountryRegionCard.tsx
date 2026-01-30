import { useState } from "react";
import { CountryRegion, PricingItem } from "./pricing";
import { PricingItemRow } from "./PricingItemRow";
import { ChevronDown, ChevronRight, MapPin, Building } from "lucide-react";
import { cn } from "@/lib/utils";

interface CountryRegionCardProps {
  region: CountryRegion;
  onUpdateItem: (regionCode: string, itemIndex: number, updatedItem: PricingItem) => void;
}

export function CountryRegionCard({ region, onUpdateItem }: CountryRegionCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSaveItem = (index: number, updatedItem: PricingItem) => {
    onUpdateItem(region.code, index, updatedItem);
  };

  return (
    <div className="bg-card rounded-md border border-border overflow-hidden shadow-sm">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-region hover:bg-secondary/80 transition-colors"
      >
        <span className="text-xl leading-none">{region.flag}</span>
        <div className="flex items-center gap-2 flex-1 text-left">
          <h3 className="font-semibold text-foreground text-sm">{region.name}</h3>
          <div className="flex items-center gap-1 text-muted-foreground">
            {region.type === "region" ? (
              <MapPin className="h-3 w-3" />
            ) : (
              <Building className="h-3 w-3" />
            )}
            <span className="text-xs capitalize">{region.type}</span>
          </div>
          <span className="text-xs text-muted-foreground ml-auto mr-2">
            {region.items.length} {region.items.length === 1 ? "service" : "services"}
          </span>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Items */}
      <div
        className={cn(
          "transition-all duration-200 overflow-hidden",
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {region.items.map((item, index) => (
          <PricingItemRow
            key={`${region.code}-${index}`}
            item={item}
            onSave={(updatedItem) => handleSaveItem(index, updatedItem)}
          />
        ))}
      </div>
    </div>
  );
}
