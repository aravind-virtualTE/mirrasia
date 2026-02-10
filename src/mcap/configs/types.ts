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

export type PartyFieldDef = {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "radio-group" | "checkbox";
  options?: McapFieldOption[];
  roles?: string[];
  storage?: "root" | "details";
};

export type PartyCoverageRule = {
  key: string;
  storage?: "root" | "details";
  requiredValues: string[];
  label?: string;
  valueLabels?: Record<string, string>;
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
  | "info"
  | "info-list"
  | "info-block";
  name?: string;
  label?: string;
  placeholder?: string;
  tooltip?: string;
  required?: boolean;
  defaultValue?: any;
  colSpan?: 1 | 2;
  options?: McapFieldOption[];
  items?: any[];
  listItemKeys?: string[];
  listPrefix?: string;
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
  widget?: "PartiesManager" | "PaymentWidget" | "RepeatableSection" | "ServiceSelectionWidget" | "InvoiceWidget" | "PanamaServiceSetupWidget";
  minParties?: number;
  requireDcp?: boolean;
  requirePartyInvite?: boolean;
  fees?: McapFees;
  computeFees?: (data: Record<string, any>, entityMeta?: Record<string, any> | null) => McapFees;
  supportedCurrencies?: string[];
  serviceItems?: any[] | ((data: Record<string, any>, entityMeta?: Record<string, any> | null) => any[]);
  partyFields?: PartyFieldDef[];
  partyCoverageRules?: PartyCoverageRule[];
  widgetConfig?: any;
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
  invite?: {
    role: string;
    label?: string;
    nameKey?: string;
    emailKey?: string;
    phoneKey?: string;
    type?: "person" | "entity";
    typeKey?: string;
    entityValue?: string;
    statusKey?: string;
    includeDcpFromKey?: string;
    detailsKeys?: string[];
  };
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
  confirmationDetails?: {
    title: string;
    message: string;
    steps?: { title: string; description: string }[];
  };
};
