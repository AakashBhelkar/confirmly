import apiClient from './client';

export interface AdminMerchant {
  id: string;
  name: string;
  slug: string;
  owner: {
    id: string;
    email: string;
    name: string;
  } | null;
  plan: string;
  settings: any;
  createdAt: string;
}

export interface AdminPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  limits: {
    ordersPerMonth: number;
    messagesPerMonth: number;
  };
  features: string[];
  public: boolean;
  sort: number;
  createdAt: string;
}

export const adminApi = {
  // Merchants
  async getMerchants(): Promise<{ data: AdminMerchant[] }> {
    const response = await apiClient.get('/admin/merchants');
    return response.data;
  },

  async getMerchant(id: string): Promise<{ data: AdminMerchant }> {
    const response = await apiClient.get(`/admin/merchants/${id}`);
    return response.data;
  },

  async updateMerchant(id: string, data: Partial<AdminMerchant>): Promise<{ data: AdminMerchant }> {
    const response = await apiClient.put(`/admin/merchants/${id}`, data);
    return response.data;
  },

  async deleteMerchant(id: string): Promise<void> {
    await apiClient.delete(`/admin/merchants/${id}`);
  },

  // Plans
  async getPlans(): Promise<{ data: AdminPlan[] }> {
    const response = await apiClient.get('/admin/plans');
    return response.data;
  },

  async createPlan(data: Partial<AdminPlan>): Promise<{ data: AdminPlan }> {
    const response = await apiClient.post('/admin/plans', data);
    return response.data;
  },

  async updatePlan(id: string, data: Partial<AdminPlan>): Promise<{ data: AdminPlan }> {
    const response = await apiClient.put(`/admin/plans/${id}`, data);
    return response.data;
  },

  async deletePlan(id: string): Promise<void> {
    await apiClient.delete(`/admin/plans/${id}`);
  },

  // Provider Health
  async getProviderHealth(): Promise<{ data: any }> {
    const response = await apiClient.get('/admin/health/providers');
    return response.data;
  },
};

