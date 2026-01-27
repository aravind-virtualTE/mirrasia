/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormData, FormStep as FormStepType } from './costaFormConfig';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, AlertTriangle } from 'lucide-react';
import { FormFieldComponent } from './FormField';

interface AmlComplianceStepProps {
  step: FormStepType;
  formData: FormData;
  onFieldChange: (fieldId: string, value: string | string[]) => void;
  setFormData?: (fn: (prev: Record<string, any>) => Record<string, any>) => void;
}

export const AmlComplianceStep = ({ step, formData, onFieldChange, setFormData }: AmlComplianceStepProps) => {
    console.log("step.fields",step.fields)
  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="border-b border-border pb-2">
        <h2 className="text-xl font-semibold text-foreground">{step.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {step.description}
        </p>
      </div>

      {/* Warning Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-amber-800 font-medium">Important Compliance Notice</p>
          <p className="text-xs text-amber-700 mt-1">
            Answering "Yes" to any sanctions-related questions may require additional documentation or could affect your application.
            Please answer truthfully and completely.
          </p>
        </div>
      </div>

      {/* Compliance Questions */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Compliance Questions</h3>
          </div>

          <div className="space-y-3">
            {step.fields.map((field, index) => (
              <div key={field.id} className="pb-3 border-b border-border last:border-b-0 last:pb-0">
                <div className="flex items-start gap-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                    Q{index + 1}
                  </span>
                  <div className="flex-1">
                    <FormFieldComponent
                      field={field}
                      value={(() => {
                        const val = formData[field.id];
                        if (Array.isArray(val)) return val;
                        if (typeof val === 'string') return val;
                        // Handle array types if needed
                        if (field.type === 'checkbox-group') return [];
                        return '';
                      })()}
                      onChange={(val) => onFieldChange(field.id, val)}
                      formData={formData}
                      setFormData={setFormData}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
