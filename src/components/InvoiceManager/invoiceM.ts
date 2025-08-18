/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/services/fetch';

export interface BillableItem {
  _id?: string;
  title: string;
  description: string;
  price: number;
}


export const saveInvoiceBillableData = async (data: any, id?: string) => {
  const response = await api.post(`/invoice/billable-items/${id}`, data,
    //  { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
};


export const getInvoiceBillableData = async () => {
  const response = await api.get(`/invoice/billable-items`);
  return response.data;
};

export const delInvoiceBillableData = async ( id?: string) => {
  const response = await api.delete(`/invoice/billable-items/${id}`
    //  { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
};
