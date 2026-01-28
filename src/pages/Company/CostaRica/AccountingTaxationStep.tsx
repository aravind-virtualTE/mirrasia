/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormData, FormStep as FormStepType } from './costaFormConfig';
import { Card, CardContent } from '@/components/ui/card';
import { Calculator } from 'lucide-react';
import { FormFieldComponent } from './FormField';

interface AccountingTaxationStepProps {
  step: FormStepType;
  formData: FormData;
  onFieldChange: (fieldId: string, value: string | string[]) => void;
  setFormData?: (fn: (prev: Record<string, any>) => Record<string, any>) => void;
}

export const AccountingTaxationStep = ({ step, formData, onFieldChange, setFormData }: AccountingTaxationStepProps) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-semibold text-foreground">{step.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {step.description}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Accounting Information</h3>
          </div>

          <div className="space-y-4">
            {step.fields.map(field => (
              <FormFieldComponent
                key={field.id}
                field={field}
                value={(formData[field.id] as string) || ''}
                onChange={(val) => onFieldChange(field.id, val)}
                formData={formData}
                setFormData={setFormData}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
