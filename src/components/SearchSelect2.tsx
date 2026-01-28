import * as React from "react";
import { useTranslation } from "react-i18next";

interface Item {
  id: string; // Unique identifier for the item
  name: string; // Display name for the item
}

interface SearchSelectProps {
  items: Item[]; // List of items to display in the dropdown
  placeholder?: string; // Placeholder text for the input and button
  selectedItem?: Item | null; // Controlled pre-selected item (optional)
  onSelect: (item: Item | null) => void; // <-- now supports unselect (null)
  disabled: boolean;
}

export default function SearchSelectNew({
  items,
  placeholder = "Select an item...",
  selectedItem: initialSelectedItem = null,
  onSelect,
  disabled,
}: SearchSelectProps) {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedItem, setSelectedItem] = React.useState<Item | null>(
    initialSelectedItem
  );

  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // sync with parent when parent changes selectedItem prop
  React.useEffect(() => {
    setSelectedItem(initialSelectedItem ?? null);
  }, [initialSelectedItem]);

  // Filter items based on the search term
  const filteredItems = items.filter(
    (item) =>
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t(item.name).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close the dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Select / unselect logic
  const handleSelect = (item: Item) => {
    // If user clicks the same item again -> clear it
    if (selectedItem && selectedItem.id === item.id) {
      setSelectedItem(null);
      onSelect(null);
    } else {
      setSelectedItem(item);
      onSelect(item);
    }

    setIsOpen(false);
    setSearchTerm("");
  };

  // Explicit clear button in the dropdown
  const handleClear = () => {
    setSelectedItem(null);
    onSelect(null);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative w-[415px]" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
        className={`w-full h-8 px-4 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <span className="text-sm truncate">
          {selectedItem && selectedItem.name !== ""
            ? t(selectedItem.name)
            : placeholder}
        </span>

        {/* small clear "x" if something is selected */}
        {selectedItem && !disabled && (
          <span
            className=" hover:text-red-500 text-xs ml-2 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation(); // don't toggle dropdown
              handleClear();
            }}
          >
            ✕
          </span>
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
          {/* Search input */}
          <div className="p-2">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="max-h-60 overflow-auto">
            {/* Clear / None option */}
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              className="w-full px-4 py-2 text-left text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 flex items-center justify-between"
            >
              <span className="italic text-sm">
                {placeholder || "Clear selection"}
              </span>
              {selectedItem === null && (
                <span className="text-xs text-blue-500">✓</span>
              )}
            </button>

            <div className="border-t" />

            {/* List of items */}
            {filteredItems.length === 0 ? (
              <div className="px-4 py-4 text-sm text-gray-500">
                No items found
              </div>
            ) : (
              filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  disabled={disabled}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100 flex items-center justify-between ${
                    selectedItem?.id === item.id ? "bg-gray-50" : ""
                  }`}
                >
                  <span className="ml-2">{t(item.name)}</span>

                  {selectedItem?.id === item.id && (
                    <span className="text-xs text-blue-500">✓</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
