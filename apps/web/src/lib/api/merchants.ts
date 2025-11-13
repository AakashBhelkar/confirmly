import apiClient from './client';

export interface Merchant {
  id: string;
  name: string;
  slug: string;
  domains: string[];
  plan: any;
  settings: any;
  channels: any;
}

export const merchantApi = {
  getMerchant: async (): Promise<{ success: boolean; data: Merchant }> => {
    const response = await apiClient.get('/merchants');
    return response.data;
  },

  updateMerchant: async (data: Partial<Merchant>): Promise<{ success: boolean; data: Merchant }> => {
    const response = await apiClient.put('/merchants', data);
    return response.data;
  },

  updateChannels: async (channels: any): Promise<{ success: boolean; data: Merchant }> => {
    const response = await apiClient.put('/merchants/channels', { channels });
    return response.data;
  },
};

