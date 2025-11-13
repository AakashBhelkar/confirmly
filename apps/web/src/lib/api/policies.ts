import apiClient from './client';

export interface PolicyRule {
  key: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
  value: string | number | string[];
  effect: 'confirm' | 'skip' | 'cancel';
}

export interface Policy {
  id?: string;
  merchantId: string;
  rules: PolicyRule[];
  createdAt?: string;
  updatedAt?: string;
}

export const policiesApi = {
  getPolicy: async (): Promise<{ success: boolean; data: Policy }> => {
    const response = await apiClient.get('/policies');
    return response.data;
  },

  savePolicy: async (rules: PolicyRule[]): Promise<{ success: boolean; data: Policy }> => {
    const response = await apiClient.post('/policies', { rules });
    return response.data;
  },

  testPolicy: async (orderData: any): Promise<{ success: boolean; data: { effect: string; matchedRules: PolicyRule[] } }> => {
    const response = await apiClient.post('/policies/test', { orderData });
    return response.data;
  },
};

