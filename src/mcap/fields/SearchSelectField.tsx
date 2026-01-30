import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import SearchSelect, { Item } from "@/components/SearchSelect";
import type { McapField } from "../configs/types";

export const UnifiedSearchSelectField = ({
    field,
    value,
    onChange
}: {
    field: McapField;
    value: any;
    onChange: (val: any) => void;
}) => {
    const { t } = useTranslation();
    const label = field.label ? (t(field.label, field.label) as string) : "";
    const placeholder = field.placeholder ? (t(field.placeholder, field.placeholder) as string) : (t("common.select", "Select an option") as string);
    const tooltip = field.tooltip ? (t(field.tooltip, field.tooltip) as string) : "";

    const handleSelect = (item: Item) => {
        onChange(item.code);
    };

    // Find the item that matches the current value to pass as selectedItem
    const selectedItem = field.items?.find((i: Item) => i.code === value) || null;

    // Localize items for display
    const localizedItems = (field.items || []).map((it: any) => ({
        ...it,
        label: t(it.label as any, it.label),
    }));

    const localizedSelectedItem = selectedItem ? {
        ...selectedItem,
        label: t(selectedItem.label as any, selectedItem.label)
    } : null;

    return (
        <div className="space-y-2">
            <Label htmlFor={field.name}>
                {label} {field.required && <span className="text-red-500">*</span>}
            </Label>

            <SearchSelect
                name={field.name}
                items={localizedItems}
                placeholder={placeholder}
                selectedItem={localizedSelectedItem}
                onSelect={handleSelect}
                required={field.required}
            />

            {tooltip && <p className="text-xs text-muted-foreground">{tooltip}</p>}
        </div>
    );
};
