import * as React from "react"
import { X } from "lucide-react"

export interface Option {
    value: string
    label: string
}

interface MultiSelectProps {
    options: Option[]
    placeholder?: string
    selectedItems?: Option[]
    onSelectionChange?: (selections: Option[]) => void
}

export default function MultiSelect({
    options,
    placeholder = "Select items...",
    selectedItems = [],
    onSelectionChange
}: MultiSelectProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [searchTerm, setSearchTerm] = React.useState("")
    const dropdownRef = React.useRef<HTMLDivElement>(null)

    const filteredOptions = options.filter(
        option =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !selectedItems.some(item => item.value === option.value)
    )

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
                if (searchTerm && !options.some(opt => opt.label.toLowerCase() === searchTerm.toLowerCase())) {
                    addCustomOption()
                }
                setSearchTerm("")
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [searchTerm, options])

    const addCustomOption = () => {
        if (searchTerm.trim()) {
            const newOption: Option = {
                value: searchTerm.toLowerCase(),
                label: searchTerm.trim()
            }
            onSelectionChange?.([...selectedItems, newOption])
            setSearchTerm("")
        }
    }

    const handleSelect = (option: Option) => {
        onSelectionChange?.([...selectedItems, option])
        setSearchTerm("")
    }

    const handleRemove = (optionToRemove: Option) => {
        onSelectionChange?.(selectedItems.filter(item => item.value !== optionToRemove.value))
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchTerm) {
            e.preventDefault()
            if (!options.some(opt => opt.label.toLowerCase() === searchTerm.toLowerCase())) {
                addCustomOption()
            }
        }
    }

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div
                className="min-h-[40px] p-2 border rounded-md bg-background cursor-text flex flex-wrap gap-2 items-center"
                onClick={() => setIsOpen(true)}
            >
                {selectedItems.map((item) => (
                    <span
                        key={item.value}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                    >
                        {item.label}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                handleRemove(item)
                            }}
                            className="text-primary/50 hover:text-primary"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    className="flex-1 outline-none min-w-[120px] bg-transparent placeholder:text-muted-foreground"
                    placeholder={selectedItems.length === 0 ? placeholder : ""}
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setIsOpen(true)
                    }}
                    onKeyDown={handleKeyDown}
                />
            </div>

            {isOpen && (searchTerm || filteredOptions.length > 0) && (
                <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleSelect(option)}
                            className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground focus:outline-none focus:bg-accent focus:text-accent-foreground"
                        >
                            {option.label}
                        </button>
                    ))}
                    {searchTerm && !filteredOptions.some(opt => opt.label.toLowerCase() === searchTerm.toLowerCase()) && (
                        <button
                            onClick={() => addCustomOption()}
                            className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground focus:outline-none focus:bg-accent focus:text-accent-foreground text-primary"
                        >
                            Add "{searchTerm}"
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}