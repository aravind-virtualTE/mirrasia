/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormData, FormStep as FormStepType } from './costaFormConfig';
import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, DollarSign, Building2 } from 'lucide-react';
import { PartiesManager } from './PartiesManager';
import { FormFieldComponent } from './FormField';

interface CompanyInfoStepProps {
  step: FormStepType;
  formData: FormData;
  onFieldChange: (fieldId: string, value: string | string[]) => void;
  setFormData?: (fn: (prev: Record<string, any>) => Record<string, any>) => void;
}

export const CompanyInfoStep = ({ step, formData, onFieldChange, setFormData }: CompanyInfoStepProps) => {
  const businessFields = [
    'selectedIndustry', 'productDescription', 'establishmentPurpose',
    'listCountry', 'sourceFunding', 'businessAddress'
  ];

  const capitalFields = [
    'currency', 'capAmount', 'shareCount', 'parValue'
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      < div className="border-b border-border pb-4" >
        <h2 className="text-xl font-semibold text-foreground">{step.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {step.description}
        </p>
      </div >

      {/* Business Information Card */}
      < Card >
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Business Information</h3>
          </div>

          <div className="space-y-6">
            {step.fields
              .filter(f => businessFields.includes(f.id))
              .map(field => (
                <FormFieldComponent
                  key={field.id}
                  field={field}
                  value={(() => {
                    const val = formData[field.id];
                    if (Array.isArray(val)) return val;
                    if (typeof val === 'string') return val;
                    if (field.type === 'checkbox-group') return [];
                    return '';
                  })()}
                  onChange={(val) => onFieldChange(field.id, val)}
                  formData={formData}
                  setFormData={setFormData}
                />
              ))
            }
          </div>
        </CardContent>
      </Card >

      {/* Capital & Shares Card */}
      < Card >
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Capital & Shares</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {step.fields
              .filter(f => capitalFields.includes(f.id))
              .map(field => (
                <FormFieldComponent
                  key={field.id}
                  field={field}
                  value={(formData[field.id] as string) || ''}
                  onChange={(val) => onFieldChange(field.id, val)}
                  formData={formData}
                  setFormData={setFormData}
                />
              ))
            }
          </div>
        </CardContent>
      </Card >

      {/* Officers & Members Card */}
      < Card >
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Officers & Members</h3>
          </div>

          <PartiesManager />
        </CardContent>
      </Card >
    </div >
  );
};
