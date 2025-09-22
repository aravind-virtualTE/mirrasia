import * as React from "react";
import { useTranslation } from "react-i18next";
// If you have a cn utility like shadcn's, import it; else remove and just string-concat.
// import { cn } from "@/lib/utils";

export interface Item {
  code: string;
  label: string;
}

interface SearchSelectProps {
  items: Item[];
  placeholder?: string;
  selectedItem?: Item | null;
  onSelect: (item: Item) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  className?: string;           // NEW: allow external width control
}

export default function SearchSelect({
  items,
  placeholder = "Select an item...",
  selectedItem: initialSelectedItem = null,
  onSelect,
  disabled = false,
  required = false,
  name,
  className,
}: SearchSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const { t } = useTranslation();
  const [selectedItem, setSelectedItem] = React.useState<Item | null>(initialSelectedItem);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setSelectedItem(initialSelectedItem);
  }, [initialSelectedItem]);

  React.useEffect(() => {
    if (disabled) setIsOpen(false);
  }, [disabled]);

  const filteredItems = items.filter(
    (item) =>
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t(item.label).toLowerCase().includes(searchTerm.toLowerCase())
  );

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: Item) => {
    if (disabled) return;
    setSelectedItem(item);
    setIsOpen(false);
    setSearchTerm("");
    onSelect(item);
  };

  return (
    <div
      ref={dropdownRef}
      // Use w-full so it inherits the grid column width, like shadcn Select.
      // Add min-w-0 so it can shrink inside grid containers.
      className={`relative w-full min-w-0 ${className || ""}`}
      aria-disabled={disabled}
    >
      {name && (
        <input
          type="hidden"
          name={name}
          value={selectedItem?.code ?? ""}
          required={required}
        />
      )}

      {/* Trigger styled like shadcn SelectTrigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((o) => !o)}
        disabled={disabled}
        aria-disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-required={required}
        aria-invalid={required && !selectedItem ? true : undefined}
        className={[
          "inline-flex h-10 w-full items-center justify-between rounded-md border",
          "bg-background px-3 py-2 text-sm",
          "shadow-sm transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
        ].join(" ")}
      >
        {selectedItem ? (
          <span className="truncate">
            {selectedItem.code} - {t(selectedItem.label)}
          </span>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        {/* optional: a chevron icon to mimic Select */}
        {/* <ChevronDown className="ml-2 h-4 w-4 opacity-50" /> */}
      </button>

      {isOpen && !disabled && (
        <div
          className="absolute z-10 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md"
          role="listbox"
        >
          {/* Search input */}
          <div className="p-2">
            <input
              type="text"
              placeholder={t("Search...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Items */}
          <div className="max-h-60 overflow-auto">
            {filteredItems.length === 0 ? (
              <div className="px-4 py-2 text-sm text-muted-foreground">
                {t("No items found")}
              </div>
            ) : (
              filteredItems.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  <span className="font-medium">{item.code}</span>
                  <span className="ml-2 text-muted-foreground">- {t(item.label)}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
