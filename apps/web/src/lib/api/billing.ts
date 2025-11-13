import apiClient from './client';

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    orders: number;
    messages: number;
  };
}

export interface Subscription {
  id: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface Usage {
  orders: number;
  messages: number;
  periodStart: string;
  periodEnd: string;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'void';
  createdAt: string;
  pdfUrl?: string;
}

export const billingApi = {
  getPlans: async (): Promise<{ success: boolean; data: Plan[] }> => {
    const response = await apiClient.get('/plans');
    return response.data;
  },

  getSubscription: async (): Promise<{ success: boolean; data: Subscription }> => {
    const response = await apiClient.get('/billing/subscription');
    return response.data;
  },

  getUsage: async (): Promise<{ success: boolean; data: Usage }> => {
    const response = await apiClient.get('/billing/usage');
    return response.data;
  },

  getInvoices: async (): Promise<{ success: boolean; data: Invoice[] }> => {
    const response = await apiClient.get('/billing/invoices');
    return response.data;
  },

  createCheckout: async (planId: string, successUrl: string, cancelUrl: string): Promise<{ success: boolean; data: { url: string } }> => {
    const response = await apiClient.post('/billing/stripe/checkout', {
      planId,
      successUrl,
      cancelUrl,
    });
    return response.data;
  },

  createPortalSession: async (returnUrl: string): Promise<{ success: boolean; data: { url: string } }> => {
    const response = await apiClient.post('/billing/stripe/portal', {
      returnUrl,
    });
    return response.data;
  },
};

