/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormFieldComponent } from './FormField';
import { FormData, FormStep as FormStepType } from './costaFormConfig';
import { ApplicantDetailsStep } from './ApplicantDetailsStep';
import { AmlComplianceStep } from './AmlComplianceStep';
import { CompanyInfoStep } from './CompanyInfoStep';
import { AccountingTaxationStep } from './AccountingTaxationStep';
import { InvoiceStep } from './InvoiceStep';
import { PaymentStep } from './PaymentStep';
import { IncorporationStep } from './IncorporationStep';
import CommonServiceAgrementTxt from '../CommonServiceAgrementTxt';

interface FormStepProps {
  step: FormStepType;
  formData: FormData;
  onFieldChange: (fieldId: string, value: string | number | boolean | string[]) => void;
  setFormData?: (fn: (prev: Record<string, any>) => Record<string, any>) => void;
}

export const FormStepComponent = ({ step, formData, onFieldChange, setFormData }: FormStepProps) => {
  const commonProps = { step, formData, onFieldChange, setFormData };
  console.log("commonProps",commonProps)
  // Handle custom step components
  if (step.customComponent === 'applicantDetails') return <ApplicantDetailsStep {...commonProps} />;
  if (step.customComponent === 'amlCompliance') return <AmlComplianceStep {...commonProps} />;
  if (step.customComponent === 'companyInfo') return <CompanyInfoStep {...commonProps} />;
  if (step.customComponent === 'accountingTaxation') return <AccountingTaxationStep {...commonProps} />;
  if (step.customComponent === 'serviceAgreement') return <CommonServiceAgrementTxt />;
  if (step.customComponent === 'invoice') return <InvoiceStep {...commonProps} />;
  if (step.customComponent === 'payment') return <PaymentStep />;
  if (step.customComponent === 'incorporation') return <IncorporationStep />;

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-semibold text-foreground">{step.title}</h2>
        {step.description && (
          <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {step.fields.map((field) => (
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
            onChange={(value) => onFieldChange(field.id, value)}
            formData={formData}
            setFormData={setFormData}
          />
        ))}
      </div>
    </div>
  );
};
