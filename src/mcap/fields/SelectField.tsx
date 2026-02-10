/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { McapField } from "../configs/types";

export const UnifiedSelectField = ({
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

    if (field.type === "radio" || field.type === "radio-group") {
        const isGroup = field.type === "radio-group";
        return (
            <div className="space-y-3">
                <Label>{label} {field.required && <span className="text-red-500">*</span>}</Label>
                <RadioGroup value={value} onValueChange={onChange} className={isGroup ? "flex flex-col gap-2.5" : ""}>
                    <div className={isGroup ? "space-y-2.5" : "flex items-center space-x-4"}>
                        {field.options?.map((opt: any) => (
                            <div key={opt.value} className="flex items-start space-x-2">
                                <RadioGroupItem value={opt.value} id={`${field.name}-${opt.value}`} className={isGroup ? "mt-0.5" : ""} />
                                <Label htmlFor={`${field.name}-${opt.value}`} className={isGroup ? "font-normal leading-tight cursor-pointer" : ""}>
                                    {t(opt.label, opt.label) as string}
                                </Label>
                            </div>
                        ))}
                    </div>
                </RadioGroup>
                {tooltip && <p className="text-xs text-muted-foreground">{tooltip}</p>}
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <Label htmlFor={field.name}>
                {label} {field.required && <span className="text-red-500">*</span>}
            </Label>

            <Select value={value} onValueChange={onChange}>
                <SelectTrigger>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {field.options?.map((opt: any) => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {t(opt.label, opt.label) as string}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {tooltip && <p className="text-xs text-muted-foreground">{tooltip}</p>}
        </div>
    );
};

