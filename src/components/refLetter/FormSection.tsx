import React from 'react';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({ title, children }) => (
  <div>
    <h2 className="text-base font-semibold mt-5 mb-2">{title}</h2>
    {children}
  </div>
);
