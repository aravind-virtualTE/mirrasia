import * as React from "react";
import { useTranslation } from "react-i18next";

interface Item {
  code: string;
  label: string;
}

interface SearchSelectProps {
  items: Item[];
  placeholder?: string;
  selectedItem?: Item | null;
  onSelect: (item: Item) => void;
  disabled?: boolean;       // NEW: disables all interactions
  required?: boolean;       // NEW: requires a selection for form validation
  name?: string;            // NEW: form field name for hidden input
}

export default function SearchSelect({
  items,
  placeholder = "Select an item...",
  selectedItem: initialSelectedItem = null,
  onSelect,
  disabled = false,
  required = false,
  name,
}: SearchSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const { t } = useTranslation();
  const [selectedItem, setSelectedItem] = React.useState<Item | null>(initialSelectedItem);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // keep local state in sync with prop
  React.useEffect(() => {
    setSelectedItem(initialSelectedItem);
  }, [initialSelectedItem]);

  // close if disabled toggles on
  React.useEffect(() => {
    if (disabled) setIsOpen(false);
  }, [disabled]);

  // filter items
  const filteredItems = items.filter(
    (item) =>
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t(item.label).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // outside click
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
    <div className="relative w-[415px]" ref={dropdownRef} aria-disabled={disabled}>
      {/* Hidden input enables native form validation when required */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={selectedItem?.code ?? ""}
          required={required}
        />
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((o) => !o)}
        disabled={disabled}
        aria-disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-required={required}
        aria-invalid={required && !selectedItem ? true : undefined}
        className={`w-full px-4 py-2 text-left bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          disabled ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        {selectedItem ? (
          <span>
            {selectedItem.code} - {t(selectedItem.label)}
          </span>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
      </button>

      {/* Menu */}
      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
          {/* Search */}
          <div className="p-2">
            <input
              type="text"
              placeholder={t("Search...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Items */}
          <div className="max-h-60 overflow-auto" role="listbox">
            {filteredItems.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500">{t("No items found")}</div>
            ) : (
              filteredItems.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                >
                  <span className="font-medium">{item.code}</span>
                  <span className="ml-2 text-gray-500">- {t(item.label)}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
