/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { McapField } from "../configs/types";

export const UnifiedTextField = ({
    field,
    value,
    onChange
}: {
    field: McapField;
    value: any;
    onChange: (val: any) => void;
}) => {
    const { t } = useTranslation();
    const isTextArea = field.type === "textarea";
    const label = field.label ? (t(field.label, field.label) as string) : "";
    const placeholder = field.placeholder ? (t(field.placeholder, field.placeholder) as string) : "";
    const tooltip = field.tooltip ? (t(field.tooltip, field.tooltip) as string) : "";

    return (
        <div className="space-y-2">
            <Label htmlFor={field.name}>
                {label} {field.required && <span className="text-red-500">*</span>}
            </Label>

            {isTextArea ? (
                <Textarea
                    id={field.name}
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="resize-none"
                    rows={field.rows}
                />
            ) : (
                <Input
                    id={field.name}
                    type={(field.type as any) || "text"}
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                />
            )}

            {tooltip && <p className="text-xs text-muted-foreground">{tooltip}</p>}
        </div>
    );
};
