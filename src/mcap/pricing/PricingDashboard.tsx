import { useState } from "react";
import { CountryRegion, PricingItem } from "./pricing";
import { initialPricingData } from "./pricingData";
import { CountryRegionCard } from "./CountryRegionCard";
import { Input } from "@/components/ui/input";
import { Search, Globe, DollarSign } from "lucide-react";
import { toast } from "sonner";

export default function PricingDashboard() {
  const [pricingData, setPricingData] = useState<CountryRegion[]>(initialPricingData);
  const [searchQuery, setSearchQuery] = useState("");

  const handleUpdateItem = (regionCode: string, itemIndex: number, updatedItem: PricingItem) => {
    setPricingData((prev) =>
      prev.map((region) =>
        region.code === regionCode
          ? {
            ...region,
            items: region.items.map((item, idx) =>
              idx === itemIndex ? updatedItem : item
            ),
          }
          : region
      )
    );
    toast.success(`Updated pricing for ${updatedItem.name}`);
  };

  const filteredData = pricingData.filter((region) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      region.name.toLowerCase().includes(searchLower) ||
      region.items.some(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.type.toLowerCase().includes(searchLower)
      )
    );
  });

  const totalCountries = pricingData.length;
  const totalServices = pricingData.reduce((acc, r) => acc + r.items.length, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-3 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground leading-tight">
                  Incorporation Pricing
                </h1>
                <p className="text-xs text-muted-foreground">
                  Manage pricing across jurisdictions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:ml-auto">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" />
                  <span>{totalCountries} regions</span>
                </div>
                <div className="h-3 w-px bg-border" />
                <span>{totalServices} services</span>
              </div>

              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search countries or services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-3 py-3">
        <div className="grid gap-2">
          {filteredData.map((region) => (
            <CountryRegionCard
              key={region.code}
              region={region}
              onUpdateItem={handleUpdateItem}
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
