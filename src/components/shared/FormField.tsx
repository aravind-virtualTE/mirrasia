// components/FormField.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Option {
  label: string;
  value: string;
}

interface FormFieldProps {
  label: string;
  name: string;
  type: "text" | "email" | "number" | "select" | "radio";
  value: string;
  onChange: (value: string) => void;
  options?: Option[]; // only for select or radio
  placeholder?: string;
}

export default function FormField({
  label,
  name,
  type,
  value,
  onChange,
  options = [],
  placeholder,
}: FormFieldProps) {
  return (
    <div className="flex flex-col space-y-2">
      <Label htmlFor={name}>{label}</Label>

      {type === "text" || type === "email" || type === "number" ? (
        <Input
          id={name}
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : type === "select" ? (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id={name}>
            <SelectValue placeholder={placeholder || "Select an option"} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : type === "radio" ? (
        <RadioGroup value={value} onValueChange={onChange}>
          {options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
              <Label htmlFor={`${name}-${option.value}`}>{option.label}</Label>
            </div>
          ))}
        </RadioGroup>
      ) : null}
    </div>
  );
}
