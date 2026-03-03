import React from 'react';

interface FormFieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ label, hint, children }) => (
  <div>
    <label className="form-label">{label}</label>
    {children}
    {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
  </div>
);
