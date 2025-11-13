import apiClient from './client';

export interface Integration {
  type: 'shopify' | 'whatsapp' | 'sms' | 'email';
  status: 'connected' | 'disconnected' | 'error';
  connectedAt?: string;
  settings?: Record<string, any>;
}

export const integrationsApi = {
  getIntegrations: async (): Promise<{ success: boolean; data: Integration[] }> => {
    const response = await apiClient.get('/merchants/me/integrations');
    return response.data;
  },

  connectShopify: async (): Promise<{ success: boolean; data: { url: string } }> => {
    const response = await apiClient.get('/integrations/shopify/install');
    return response.data;
  },

  connectWhatsApp: async (data: { phoneNumberId: string; accessToken: string }): Promise<{ success: boolean; data: Integration }> => {
    const response = await apiClient.post('/integrations/whatsapp/connect', data);
    return response.data;
  },

  connectSMS: async (data: { provider: 'msg91' | 'twilio'; credentials: Record<string, string> }): Promise<{ success: boolean; data: Integration }> => {
    const response = await apiClient.post('/integrations/sms/connect', data);
    return response.data;
  },

  connectEmail: async (data: { provider: 'sendgrid' | 'ses'; credentials: Record<string, string> }): Promise<{ success: boolean; data: Integration }> => {
    const response = await apiClient.post('/integrations/email/connect', data);
    return response.data;
  },

  disconnectIntegration: async (type: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post(`/integrations/${type}/disconnect`);
    return response.data;
  },
};

