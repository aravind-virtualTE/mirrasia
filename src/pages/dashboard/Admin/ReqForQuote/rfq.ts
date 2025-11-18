/* eslint-disable @typescript-eslint/no-explicit-any */
import {atom } from "jotai";

import api from  "@/services/fetch"

export const reqAtom = atom([] as any[]);

export const getRedQuoteData = async (data?: any) => {
  try {
    const response = await api.get(`/quotation-requests`, data);
    return response.data;
  } catch (error) {
    console.error("Error fetching enquiry data:", error);
  }
}

export const deleteReqForEnquiry = async (id: string) =>{
    try{
         const response = await api.delete(`/quotation-requests/${id}`,);
    return response.data;
    }catch(e){
        console.log("error",e)
    }
}

export const updateReqForEnquiry = async (data?: any) =>{
 try {
    const response = await api.post(`/quotation-requests`, data);
    return response.data;
  } catch (error) {
    console.error("Error fetching enquiry data:", error);
  }
}