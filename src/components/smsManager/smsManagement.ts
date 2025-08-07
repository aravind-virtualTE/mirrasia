// import { atom } from 'jotai';

import api from '@/services/fetch'

export const getBrevoCreditsData = async () => {
  const response = await api.get(`/utility/getBrevoCreditsData`);
  return response.data;
};

export const sendSms = async (phoneNumber: string, message: string) => {
  const response = await api.post(`/utility/sendSms`, {
    phoneNumber,
    message,
  });
  return response.data;
};