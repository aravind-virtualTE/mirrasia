/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/services/fetch';
import { PaymentIntent } from '@stripe/stripe-js';
// import { useSetAtom } from 'jotai';
// import { updateCompanyIncorporationAtom } from '../atom';

export const cartFingerprint = (input: unknown) => {
  // Detect changes in complex data (like objects/arrays) by turning them into a comparable string or number. 
  const s = JSON.stringify(input);
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return String(h >>> 0);
};

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

  async createSession(amount: number, currency: string = 'USD', id: string, country: string) {
    const response = await api.post('/payment/create-session', {
      amount,
      currency,
      id,
      country
    });
    // console.log('response--->', response)
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

  async uploadReceipt(sessionId: string, docId: string, file: File, country: string) {
    const formData = new FormData();
    formData.append('id', docId)
    formData.append('receipt', file);
    formData.append('country', country);
    const response = await api.post(`/payment/payment-sessions/${sessionId}/receipt`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data
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
  async updateFinalPaymentStatus(sessionId: string, paymentId: string, id: string, paymentIntent: PaymentIntent, country:string) {
    const response = await api.put(`/payment/update-final-payment-status`, {
      paymentId,
      sessionId,
      id,
      paymentIntent,country
    });
    return response.data;
  },
};



export type PaymentLine = {
  label: string;
  qty: number;
  unit: number;
  amount: number;
};

export type CreatePaymentIntentBody = {
  amount: number;               // in smallest currency unit (e.g., cents)
  currency?: string;            // default "usd"
  metadata?: Record<string, any>;
  description?: string;
};

export type CreatePaymentIntentResponse = {
  clientSecret: string;
  id: string;
  currency: string;
  amount: number;
  status: string;
};
export const createInvoicePaymentIntent = async ( body: CreatePaymentIntentBody): Promise<CreatePaymentIntentResponse> => {
  try {
    const response = await api.post<CreatePaymentIntentResponse>(
      "/payment/invoice-intent",
      body,
    );
    return response.data;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
};

export type PaymentSuccessPayload = {
  paymentIntentId: string;
  amount: number;                // smallest unit (cents)
  currency: string;              // "usd"
  companyId: string | number;
  companyName: string;
  description: string;           // your summary
  userEmail: string;
  userName: string;
  userId: string;
  lines: Array<{ label: string; qty: number; unit: number; amount: number }>;
  orderId:string | null;
};

export const notifyPaymentSuccess = async (payload: PaymentSuccessPayload) => {
  try {
    const res = await api.post("/payment/confirm-invoicePayment", payload);
    return res.data; // e.g. { ok: true, receiptUrl, paymentIntentStatus }
  } catch (err) {
    console.error("notifyPaymentSuccess error:", err);
    throw err;
  }
};

export const updateInvoicePaymentIntent = (intentId: string, body: any) =>
  api.patch(`/payment/invoice-intent/${intentId}`, body).then(r => r.data);

// optional tidy-up
export const cancelPaymentIntent = (intentId: string) =>
  api.post(`/payment/cancel-invoice-intent/${intentId}/cancel`).then(r => r.data);


export const getInvoiceOrder = (id: string) =>
  api.get(`/payment/invoice-orders/${id}`).then(r => r.data);

export const orderResume = (companyId: string, fp: string) =>
  api.get(`/payment/invoice-order/resume`, {
    params: { companyId, fp }
  }).then(r => r.data);

export const createDraftOrder = (data: any) =>
  api.post("/payment/invoice-order", data).then(r => r.data);

export const uploadBankProof = async (docId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const r = await api.post(`/payment/invoice-order/${docId}/bank-proof`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return r.data;
}

export const updatePayMethod = (id: string, method: string) =>
  api.patch(`/payment/invoice-order/${id}/pay-method`, { method }).then(r => r.data);