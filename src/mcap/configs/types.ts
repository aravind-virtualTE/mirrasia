/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from "react";

export type McapFieldOption = {
  label: string;
  value: string;
};

export type McapFeeItem = {
  id?: string;
  label: string;
  amount: number;
  kind?: "government" | "service" | "optional" | "surcharge" | "other";
};

export type McapFees = {
  currency?: string;
  government?: number;
  service?: number;
  total?: number;
  items?: McapFeeItem[];
  note?: string;
};

export type McapField = {
  type:
  | "text"
  | "email"
  | "number"
  | "textarea"
  | "select"
  | "radio"
  | "radio-group"
  | "checkbox"
  | "checkbox-group"
  | "derived"
  | "search-select"
  | "info";
  name?: string;
  label?: string;
  placeholder?: string;
  tooltip?: string;
  required?: boolean;
  defaultValue?: any;
  colSpan?: 1 | 2;
  options?: McapFieldOption[];
  items?: any[];
  rows?: number;
  condition?: (data: Record<string, any>) => boolean;
  compute?: (data: Record<string, any>, entityMeta?: Record<string, any> | null) => string;
  content?: ReactNode;
};

export type McapStep = {
  id: string;
  title: string;
  description?: string;
  fields?: McapField[];
  widget?: "PartiesManager" | "PaymentWidget" | "RepeatableSection" | "ServiceSelectionWidget" | "InvoiceWidget";
  minParties?: number;
  requireDcp?: boolean;
  requirePartyInvite?: boolean;
  fees?: McapFees;
  computeFees?: (data: Record<string, any>, entityMeta?: Record<string, any> | null) => McapFees;
  supportedCurrencies?: string[];
  serviceItems?: any[];
  widgetConfig?: RepeatableSectionWidgetConfig;
};

export type RepeatableSection = {
  kind: "list" | "object";
  fieldName?: string;
  title?: string;
  description?: string;
  minItems?: number;
  addLabel?: string;
  itemLabel?: string;
  allowRemove?: boolean;
  itemFields: McapField[];
  condition?: (data: Record<string, any>) => boolean;
};

export type RepeatableSectionMode = {
  value: string;
  label: string;
  sections: RepeatableSection[];
};

export type RepeatableSectionWidgetConfig = {
  title?: string;
  description?: string;
  preFields?: McapField[];
  sections?: RepeatableSection[];
  modeField?: string;
  modes?: RepeatableSectionMode[];
};

export type McapConfig = {
  id: string;
  countryCode: string;
  countryName: string;
  currency: string;
  title?: string;
  steps: McapStep[];
  entityMeta?: Record<string, any>;
};
