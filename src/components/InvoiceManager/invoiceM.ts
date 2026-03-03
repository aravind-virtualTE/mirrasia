/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/services/fetch';

export type ItemType = "billableItems" | "industryType" | "countryForCorporation";
export type QuoteLanguage = "en" | "ko" | "zhTW";
export type LocalizedLanguageKey = QuoteLanguage;

export interface LocalizedText {
  title: string;
  description: string;
}

export type BillableLocalizations = Partial<Record<LocalizedLanguageKey, LocalizedText>>;

export interface BillableItem {
  _id?: string;
  title: string;
  description: string;
  localizations?: BillableLocalizations;
  type: ItemType;
  price?: number;
}

export interface QuoteLayoutLabels {
  quotation: string;
  quoteNumber: string;
  date: string;
  expires: string;
  expiresValue: string;
  recipient: string;
  qty: string;
  productOrService: string;
  unitPrice: string;
  lineTotal: string;
  amountUsd: string;
  totalPrice: string;
  preparedFor: string;
  validFor: string;
  draftQuote: string;
}

export interface QuoteLayoutContact {
  label: string;
  value: string;
  href?: string;
}

export interface QuoteLayout {
  companyName: string;
  companyDetails: string[];
  badgeText: string;
  notesTitle: string;
  notesLines: string[];
  legalTermsTitle: string;
  legalTermsLines: string[];
  supportMessage: string;
  thankYouMessage: string;
  signatureName: string;
  generatedByText: string;
  emailFooter: string;
  footerText: string;
  contacts: QuoteLayoutContact[];
  labels: QuoteLayoutLabels;
}

export const saveInvoiceBillableData = async (data: any, id?: string) => {
  const url = id ? `/invoice/billable-items/${id}` : `/invoice/billable-items`;
  const response = await api.post(url, data);
  return response.data;
};

export const getInvoiceBillableData = async (type?: ItemType) => {
  const url = type ? `/invoice/billable-items?type=${type}` : `/invoice/billable-items`;
  const response = await api.get(url);
  return response.data;
};

export const delInvoiceBillableData = async (id?: string) => {
  const response = await api.delete(`/invoice/billable-items/${id}`);
  return response.data;
};

export const getQuoteLayoutData = async (language?: QuoteLanguage) => {
  const query = language ? `?language=${encodeURIComponent(language)}` : "";
  const response = await api.get(`/invoice/quote-layout${query}`);
  return response.data;
};

export const saveQuoteLayoutData = async (payload: {
  language: QuoteLanguage;
  layout: Partial<QuoteLayout>;
  updatedBy?: string;
}) => {
  const response = await api.post('/invoice/quote-layout', payload);
  return response.data;
};
