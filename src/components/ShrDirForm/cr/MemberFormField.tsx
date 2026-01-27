import { FormField as FormFieldType, MemberFormData } from './memberConfig';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MemberFormFieldProps {
  field: FormFieldType;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  formData: MemberFormData;
}

export const MemberFormField = ({ field, value, onChange, formData }: MemberFormFieldProps) => {
  // Condition check - hide field if condition returns false
  if (field.condition && !field.condition(formData)) {
    return null;
  }

  const inputCls = "h-11 bg-background border-input focus:border-primary focus:ring-primary/20";

  const renderLabel = () => (
    <div className="flex items-center gap-2 mb-2">
      <Label htmlFor={field.id} className="font-medium text-sm">
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {field.tooltip && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm text-xs">
              {field.tooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );

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
            readOnly={field.readOnly}
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
            <div className="space-y-2">
              {opts.map((opt) => {
                const isOther = isOtherOption(opt.value);
                const isChecked = isOther ? hasOther : selected.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      isChecked
                        ? "border-primary bg-sidebar-accent"
                        : "border-input hover:border-primary/50 hover:bg-secondary/50"
                    )}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) => toggleValue(opt.value, checked === true)}
                      className="mt-0.5"
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

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      {renderLabel()}
      {renderField()}
      {field.hint && (
        <p className="text-xs text-muted-foreground">{field.hint}</p>
      )}
      {field.helpText && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
    </div>
  );
};
