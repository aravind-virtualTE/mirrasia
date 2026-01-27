/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import { FormField as FormFieldType } from './costaFormConfig';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchSelect, SearchSelectItem } from '@/components/ui/search-select';
import DropdownSelect from '@/components/ui/dropdown-select';
import { EmailOTPField, MobileOTPField } from '@/components/shared/OtpFields';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

// import { FieldLabel } from './FieldLabel';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  field: FormFieldType;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  formData?: Record<string, any>;
  setFormData?: (fn: (prev: Record<string, any>) => Record<string, any>) => void;
}

interface FieldLabelProps {
  label: string;
  tooltip?: string;
  htmlFor?: string;
  className?: string;
  required?: boolean;
}

export const FieldLabel = ({ label, tooltip, htmlFor, className, required }: FieldLabelProps) => {
  // console.log("label", label)
  return (
    <div className="flex items-center gap-1.5">
      <Label htmlFor={htmlFor} className={cn("text-sm font-medium text-foreground", className)}>
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {tooltip && (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-xs">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export const FormFieldComponent = ({ field, value, onChange, formData = {}, setFormData }: FormFieldProps) => {
  // Apply defaultValue once if missing
  useEffect(() => {
    if (field.defaultValue !== undefined && formData[field.id] === undefined && setFormData) {
      setFormData((prev) => ({ ...prev, [field.id]: field.defaultValue }));
    }
  }, [field.defaultValue, field.id, formData, setFormData]);

  // Condition check - hide field if condition returns false
  if (field.condition && !field.condition(formData)) {
    return null;
  }

  const span = field.colSpan === 2 ? "md:col-span-2" : "";
  const wrapCls = cn("space-y-2", span);
  const inputCls = "h-11 bg-background border-input focus:border-primary focus:ring-primary/20";
  const hintCls = "text-xs text-muted-foreground";

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <Input
            id={field.id}
            type={field.type}
            placeholder={field.placeholder}
            value={value as string || ''}
            onChange={(e) => onChange(e.target.value)}
            className={inputCls}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={field.id}
            placeholder={field.placeholder}
            value={value as string || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={field.rows ?? 4}
            className="bg-background border-input focus:border-primary focus:ring-primary/20 resize-none"
          />
        );

      case 'select':
        return (
          <Select value={value as string || ''} onValueChange={onChange}>
            <SelectTrigger id={field.id} className="h-11 bg-background border-input">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="space-y-3">
            {field.options?.map((option) => {
              const values = Array.isArray(value) ? value : [];
              const isChecked = values.includes(option.value);

              return (
                <label
                  key={option.value}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                    isChecked
                      ? "border-primary bg-sidebar-accent"
                      : "border-input hover:border-primary/50 hover:bg-secondary/50"
                  )}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onChange([...values, option.value]);
                      } else {
                        onChange(values.filter((v) => v !== option.value));
                      }
                    }}
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              );
            })}
          </div>
        );

      case 'checkbox-group': {
        const selected: string[] = Array.isArray(value) ? value : [];
        const opts = field.options ?? [];
        const isOtherOption = (optValue: string) => optValue.toLowerCase() === 'other';
        const otherPrefix = 'other:';
        const hasOther = selected.some((v) => v === 'Other' || v === 'other' || v.startsWith(otherPrefix));
        const currentOtherVal = (() => {
          const v = selected.find((x) => x.startsWith(otherPrefix));
          return v ? v.slice(otherPrefix.length) : '';
        })();

        const toggleValue = (optValue: string, on: boolean) => {
          const next = new Set(selected);
          if (isOtherOption(optValue)) {
            if (on) {
              Array.from(next).forEach((v) => {
                if (v === 'Other' || v === 'other') next.delete(v);
              });
              if (!Array.from(next).some((v) => v.startsWith(otherPrefix))) next.add(otherPrefix);
            } else {
              Array.from(next).forEach((v) => {
                if (v === 'Other' || v === 'other' || v.startsWith(otherPrefix)) next.delete(v);
              });
            }
          } else {
            if (on) next.add(optValue);
            else next.delete(optValue);
          }
          onChange(Array.from(next));
        };

        const updateOtherText = (text: string) => {
          const base = selected.filter((v) => !(v === 'Other' || v === 'other' || v.startsWith(otherPrefix)));
          base.push(`${otherPrefix}${text}`);
          onChange(base);
        };

        return (
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-2">
              {opts.map((opt) => {
                const isOther = isOtherOption(opt.value);
                const isChecked = isOther ? hasOther : selected.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      isChecked
                        ? "border-primary bg-sidebar-accent"
                        : "border-input hover:border-primary/50 hover:bg-secondary/50"
                    )}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) => toggleValue(opt.value, checked === true)}
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                );
              })}
            </div>

            {hasOther && (
              <div className="flex items-center gap-2 pt-2">
                <Label htmlFor={`${field.id}-other`} className="text-sm text-muted-foreground whitespace-nowrap">
                  Please specify:
                </Label>
                <Input
                  id={`${field.id}-other`}
                  placeholder="Enter value"
                  value={currentOtherVal}
                  onChange={(e) => updateOtherText(e.target.value)}
                  className={inputCls}
                />
              </div>
            )}
          </div>
        );
      }

      case 'radio':
        return (
          <RadioGroup
            value={value as string || ''}
            onValueChange={onChange}
            className="space-y-1"
          >
            {field.options?.map((option) => (
              <label
                key={option.value}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                  value === option.value
                    ? "border-primary bg-sidebar-accent"
                    : "border-input hover:border-primary/50 hover:bg-secondary/50"
                )}
              >
                <RadioGroupItem value={option.value} />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </RadioGroup>
        );

      case 'radio-group': {
        const opts = field.options ?? [];
        const isOtherOption = (optValue: string) => optValue.toLowerCase() === 'other';
        const currentValue = value as string || '';
        const hasOther = isOtherOption(currentValue) || currentValue.startsWith('other:');
        const otherText = currentValue.startsWith('other:') ? currentValue.slice(6) : '';

        return (
          <div className="space-y-3">
            <RadioGroup
              value={hasOther ? 'other' : currentValue}
              onValueChange={(val) => {
                if (isOtherOption(val)) {
                  onChange('other:');
                } else {
                  onChange(val);
                }
              }}
              className="space-y-2"
            >
              {opts.map((opt) => (
                <label
                  key={opt.value}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                    (hasOther && isOtherOption(opt.value)) || currentValue === opt.value
                      ? "border-primary bg-sidebar-accent"
                      : "border-input hover:border-primary/50 hover:bg-secondary/50"
                  )}
                >
                  <RadioGroupItem value={opt.value} className="mt-0.5" />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </RadioGroup>

            {hasOther && (
              <div className="flex items-center gap-2 pt-2">
                <Label htmlFor={`${field.id}-other`} className="text-sm text-muted-foreground whitespace-nowrap">
                  Please specify:
                </Label>
                <Input
                  id={`${field.id}-other`}
                  placeholder="Enter value"
                  value={otherText}
                  onChange={(e) => onChange(`other:${e.target.value}`)}
                  className={inputCls}
                />
              </div>
            )}
          </div>
        );
      }

      case 'derived': {
        const computed = field.compute ? field.compute(formData) : '';
        return (
          <Input
            id={field.id}
            readOnly
            value={computed}
            className={cn(inputCls, "bg-muted cursor-not-allowed")}
          />
        );
      }

      case 'search-select': {
        const items = field.items || [];
        const selectedItem = items.find((item) => item.code === value) || null;

        return (
          <SearchSelect
            items={items}
            placeholder="Select an option"
            selectedItem={selectedItem}
            onSelect={(item: SearchSelectItem) => onChange(item.code)}
          />
        );
      }

      case 'dropdown-select': {
        const options = field.options?.map((opt) => opt.value) || [];
        return (
          <DropdownSelect
            options={options}
            placeholder={field.placeholder || 'Enter custom value'}
            selectedValue={value as string || ''}
            onSelect={(val) => onChange(String(val))}
          />
        );
      }

      case 'email-otp':
        return (
          <EmailOTPField
            id={field.id}
            label=""
            value={value as string || ''}
            onChange={onChange}
            isVerified={formData.emailOtpVerified as boolean}
            onVerify={(verified) => setFormData?.(prev => ({ ...prev, emailOtpVerified: verified }))}
            required={field.required}
            tooltip={field.tooltip}
            nameForEmail={formData.fullName as string}
            disabled={field.readOnly}
          />
        );

      case 'mobile-otp':
        return (
          <MobileOTPField
            id={field.id}
            label=""
            value={value as string || ''}
            onChange={onChange}
            isVerified={formData.mobileOtpVerified as boolean}
            onVerify={(verified) => setFormData?.(prev => ({ ...prev, mobileOtpVerified: verified }))}
            required={field.required}
            tooltip={field.tooltip}
            disabled={field.readOnly}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={wrapCls}>
      <FieldLabel
        label={field.label}
        tooltip={field.tooltip}
        htmlFor={field.id}
        required={field.required}
      />
      {renderField()}
      {field.hint && <p className={hintCls}>{field.hint}</p>}
      {field.helpText && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
    </div>
  );
};
