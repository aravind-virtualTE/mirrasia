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
  widget?: "PartiesManager" | "PaymentWidget";
  minParties?: number;
  requireDcp?: boolean;
  requirePartyInvite?: boolean;
  fees?: McapFees;
  computeFees?: (data: Record<string, any>, entityMeta?: Record<string, any> | null) => McapFees;
  supportedCurrencies?: string[];
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
