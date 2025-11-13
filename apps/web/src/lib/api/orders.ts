import apiClient from './client';

export interface Order {
  id: string;
  platformOrderId: string;
  platform?: string;
  email?: string;
  phone?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  amount: number;
  currency: string;
  paymentMode: 'cod' | 'prepaid';
  status: 'pending' | 'confirmed' | 'unconfirmed' | 'canceled' | 'fulfilled';
  riskScore?: number;
  confirmations?: any[];
  autoActions?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderFilters {
  status?: 'pending' | 'confirmed' | 'unconfirmed' | 'canceled' | 'fulfilled';
  paymentMode?: 'cod' | 'prepaid';
  page?: number;
  limit?: number;
}

export interface OrdersResponse {
  success: boolean;
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export const ordersApi = {
  getOrders: async (filters?: OrderFilters): Promise<OrdersResponse> => {
    const response = await apiClient.get('/orders', { params: filters });
    return response.data;
  },

  getOrder: async (id: string): Promise<{ success: boolean; data: Order }> => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  confirmOrder: async (id: string): Promise<{ success: boolean; data: { id: string; status: string } }> => {
    const response = await apiClient.post(`/orders/${id}/confirm`);
    return response.data;
  },

  cancelOrder: async (id: string): Promise<{ success: boolean; data: { id: string; status: string } }> => {
    const response = await apiClient.post(`/orders/${id}/cancel`);
    return response.data;
  },

  holdOrder: async (id: string): Promise<{ success: boolean; data: { id: string; status: string } }> => {
    const response = await apiClient.post(`/orders/${id}/hold`);
    return response.data;
  },

  exportOrders: async (filters?: OrderFilters): Promise<Blob> => {
    const response = await apiClient.get('/orders/export', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },
};

