/* eslint-disable @typescript-eslint/no-explicit-any */
export type PartyFieldOption = {
  value: string;
  label: string;
  description?: string;
};

export type PartyFieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "date"
  | "tel"
  | "select"
  | "radio"
  | "checkbox"
  | "checkbox-group"
  | "file";

export type PartyField = {
  name: string;
  label: string;
  type: PartyFieldType;
  required?: boolean;
  tooltip?: string;
  hint?: string;
  placeholder?: string;
  options?: PartyFieldOption[];
  colSpan?: number;
  accept?: string;
  readOnly?: boolean;
  condition?: (values: Record<string, any>) => boolean;
};

export type PartyStep = {
  id: string;
  title: string;
  description?: string;
  fields: PartyField[];
};

export type PartyFormConfig = {
  id: string;
  title: string;
  countryCode: string;
  partyType?: "person" | "entity";
  roles?: string[];
  steps: PartyStep[];
};
