import * as React from "react";
import { useTranslation } from "react-i18next";

interface Item {
    id: string; // Unique identifier for the item
    name: string; // Display name for the item
}

interface SearchSelectProps {
    items: Item[]; // List of items to display in the dropdown
    placeholder?: string; // Placeholder text for the input and button
    selectedItem?: Item | null; // Pre-selected item (optional)
    onSelect: (item: Item) => void; // Callback when an item is selected
    disabled: boolean
}

export default function SearchSelectNew({
    items,
    placeholder = "Select an item...",
    selectedItem: initialSelectedItem = null,
    onSelect,
    disabled
}: SearchSelectProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");
    const { t } = useTranslation();
    const [selectedItem, setSelectedItem] = React.useState<Item | null>(initialSelectedItem);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    //   console.log("businessInfo", selectedItem);
    React.useEffect(() => {
        setSelectedItem(initialSelectedItem);
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
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle item selection
    const handleSelect = (item: Item) => {
        setSelectedItem(item);
        setIsOpen(false);
        setSearchTerm("");
        onSelect(item); // Notify parent of the selected item
    };
    // console.log("selectedItem", selectedItem)
    return (
        <div className="relative w-[415px]" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-8 px-4 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-center"
            >
                <span className="text-sm truncate">
                    {selectedItem && selectedItem.name !== ""
                        ? t(selectedItem.name)
                        : placeholder}
                </span>
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

                    {/* List of items */}
                    <div className="max-h-60 overflow-auto">
                        {filteredItems.length === 0 ? (
                            <div className="px-4 py-4 text-sm text-gray-500">No items found</div>
                        ) : (
                            filteredItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSelect(item)}
                                    disabled={disabled}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                                >
                                    {/* <span className="font-medium">{item.id}</span> */}
                                    <span className="ml-2">{t(item.name)}</span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

