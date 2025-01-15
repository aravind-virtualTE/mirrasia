import api from '@/services/fetch';
import { PaymentIntent } from '@stripe/stripe-js';
// import { useSetAtom } from 'jotai';
// import { updateCompanyIncorporationAtom } from '../atom';

export interface PaymentSession {
  _id: string;
  paymentId: string;
  id: string;
  expiresAt: string;
  status: 'pending' | 'completed' | 'expired';
  amount: number;
  currency: string;
}

export const paymentApi = {

  async createSession(amount: number, currency: string = 'USD', id: string) {
    const response = await api.post('/payment/create-session', {
      amount,
      currency,
      id
    });
    console.log('response--->', response)
    return response.data;
  },

  async updateSession(sessionId: string, amount: number, currency: string = 'USD') {
    const response = await api.put(`/payment/update-session/${sessionId}`, {
      amount,
      currency,
    });
    // console.log('Updated session response:', response);
    return response.data;
  },

  async getSession(sessionId: string): Promise<PaymentSession> {
    const response = await api.get(`/payment/payment-sessions/${sessionId}`);
    return response.data;
  },

  async uploadReceipt(sessionId: string, docId: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('id', docId)
    formData.append('receipt', file);
    await api.post(`/payment/payment-sessions/${sessionId}/receipt`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async createPaymentIntent(amount: number, currency: string = 'USD', sessionId: string, docId: string) {
    const response = await api.post('/payment/create-payment-intent', {
      amount,
      currency,
      sessionId,
      docId
    });
    // console.log("responsePaymentIntent--->", response)
    return response.data;
  },
  async updateFinalPaymentStatus(sessionId: string, paymentId: string, id: string, paymentIntent: PaymentIntent) {
    const response = await api.put(`/payment/update-final-payment-status`, {
      paymentId,
      sessionId,
      id,
      paymentIntent
    });
    return response.data;
  },
};

// mirrasia-receipts