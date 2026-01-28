/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormData, FormStep as FormStepType } from './costaFormConfig';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, User, Building2 } from 'lucide-react';
import { FormFieldComponent } from './FormField';

interface ApplicantDetailsStepProps {
  step: FormStepType;
  formData: FormData;
  onFieldChange: (fieldId: string, value: string | string[]) => void;
  setFormData?: (fn: (prev: Record<string, any>) => Record<string, any>) => void;
}

export const ApplicantDetailsStep = ({ step, formData, onFieldChange, setFormData }: ApplicantDetailsStepProps) => {
  // Filter fields for separate sections
  const personalFields = step.fields.filter(f => !f.id.startsWith('companyName'));
  const companyFields = step.fields.filter(f => f.id.startsWith('companyName'));
  console.log("personalFields",personalFields,formData)
  return (
    <div className="space-y-6">
      {/* Section Header */}
      < div className="border-b border-border pb-4" >
        <h2 className="text-xl font-semibold text-foreground">{step.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {step.description}
        </p>
      </div >

      {/* Personal Information Card */}
      < Card >
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Personal Information</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {personalFields.map(field => (
              <FormFieldComponent
                key={field.id}
                field={field}
                value={(() => {
                  const val = formData[field.id];
                  if (Array.isArray(val)) return val;
                  if (typeof val === 'string') return val;
                  if (field.type === 'checkbox' || field.type === 'checkbox-group') return [];
                  return '';
                })()}
                onChange={(val) => onFieldChange(field.id, val)}
                formData={formData}
                setFormData={setFormData}
              />
            ))}
          </div>
        </CardContent>
      </Card >

      {/* Company Names Card */}
      < Card >
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Company Name Choices</h3>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p className="font-medium mb-1">Costa Rica Company Naming Policy</p>
                  <p className="text-xs">
                    Costa Rica now uses "cédula jurídica" (legal ID number) instead of traditional company names.
                    However, you can still register a commercial name for business purposes.
                    Provide three choices in order of preference.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4 mb-4">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Costa Rica has implemented a new company naming system.
              Companies are now identified by their "cédula jurídica" (legal registration number) rather than traditional names.
              You may still register a commercial name (nombre comercial) for branding purposes.
            </p>
          </div>

          <div className="space-y-4">
            {companyFields.map(field => (
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
      </Card >
    </div >
  );
};
