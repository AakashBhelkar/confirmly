import apiClient from './client';

export interface AnalyticsMetrics {
  rtoReduction: number;
  confirmationRate: number;
  monthlySavings: number;
  messagesSent: number;
  totalOrders: number;
  confirmedOrders: number;
  unconfirmedOrders: number;
  canceledOrders: number;
}

export interface TimeSeriesData {
  date: string;
  confirmed: number;
  unconfirmed: number;
  canceled: number;
}

export interface ChannelPerformance {
  channel: 'whatsapp' | 'sms' | 'email';
  sent: number;
  delivered: number;
  confirmed: number;
  rate: number;
}

export interface RiskDistribution {
  riskBand: string;
  count: number;
  percentage: number;
}

export const analyticsApi = {
  getMetrics: async (filters?: { startDate?: string; endDate?: string }): Promise<{ success: boolean; data: AnalyticsMetrics }> => {
    const response = await apiClient.get('/analytics/metrics', { params: filters });
    return response.data;
  },

  getTimeSeries: async (filters?: { startDate?: string; endDate?: string; interval?: 'day' | 'week' | 'month' }): Promise<{ success: boolean; data: TimeSeriesData[] }> => {
    const response = await apiClient.get('/analytics/timeseries', { params: filters });
    return response.data;
  },

  getChannelPerformance: async (filters?: { startDate?: string; endDate?: string }): Promise<{ success: boolean; data: ChannelPerformance[] }> => {
    const response = await apiClient.get('/analytics/channels', { params: filters });
    return response.data;
  },

  getRiskDistribution: async (filters?: { startDate?: string; endDate?: string }): Promise<{ success: boolean; data: RiskDistribution[] }> => {
    const response = await apiClient.get('/analytics/risk', { params: filters });
    return response.data;
  },

  exportAnalytics: async (filters?: { startDate?: string; endDate?: string; format?: 'csv' | 'pdf' }): Promise<Blob> => {
    const response = await apiClient.get('/analytics/export', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },
};

