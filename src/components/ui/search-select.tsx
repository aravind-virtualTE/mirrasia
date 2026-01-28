import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Search } from "lucide-react";

export interface SearchSelectItem {
  code: string;
  label: string;
}

interface SearchSelectProps {
  items: SearchSelectItem[];
  placeholder?: string;
  selectedItem?: SearchSelectItem | null;
  onSelect: (item: SearchSelectItem) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  className?: string;
}

export function SearchSelect({
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
  const [selectedItem, setSelectedItem] = React.useState(initialSelectedItem);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setSelectedItem(initialSelectedItem);
  }, [initialSelectedItem]);

  React.useEffect(() => {
    if (disabled) setIsOpen(false);
  }, [disabled]);

  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const filteredItems = items.filter(
    (item) =>
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.label.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleSelect = (item: SearchSelectItem) => {
    if (disabled) return;
    setSelectedItem(item);
    setIsOpen(false);
    setSearchTerm("");
    onSelect(item);
  };

  return (
    <div ref={dropdownRef} className={cn("relative w-full", className)}>
      {name && (
        <input type="hidden" name={name} value={selectedItem?.code ?? ""} />
      )}

      <button
        type="button"
        onClick={() => !disabled && setIsOpen((o) => !o)}
        disabled={disabled}
        aria-disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-required={required}
        aria-invalid={required && !selectedItem ? true : undefined}
        className={cn(
          "inline-flex h-11 w-full items-center justify-between rounded-md border",
          "bg-background px-3 py-2 text-sm",
          "shadow-sm transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "border-input hover:border-primary/50"
        )}
      >
        {selectedItem ? (
          <span className="text-foreground truncate">
            {selectedItem.code} - {selectedItem.label}
          </span>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 w-full rounded-md border bg-background pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div className="max-h-60 overflow-auto py-1">
            {filteredItems.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                No items found
              </div>
            ) : (
              filteredItems.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm flex items-center gap-2",
                    "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                    selectedItem?.code === item.code && "bg-accent"
                  )}
                >
                  <Check className={cn("h-4 w-4", selectedItem?.code === item.code ? "opacity-100" : "opacity-0")} />
                  <span className="font-medium">{item.code}</span>
                  <span className="text-muted-foreground">- {item.label}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchSelect;
