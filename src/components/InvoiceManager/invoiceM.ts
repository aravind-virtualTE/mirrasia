/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/services/fetch';

export type ItemType = "billableItems" | "industryType" | "countryForCorporation";
export interface BillableItem {
  _id?: string;
  title: string;
  description: string;
  type: ItemType;
  price?: number;
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
  const response = await api.delete(`/invoice/billable-items/${id}`
    //  { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
};
