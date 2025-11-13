import apiClient from './client';
import { analyticsApi, AnalyticsMetrics, TimeSeriesData, ChannelPerformance, RiskDistribution } from './analytics';

export interface DashboardData {
  metrics: AnalyticsMetrics;
  timeSeries: TimeSeriesData[];
  channelPerformance: ChannelPerformance[];
  riskDistribution: RiskDistribution[];
}

export const dashboardApi = {
  getDashboardData: async (filters?: { startDate?: string; endDate?: string }): Promise<DashboardData> => {
    const [metrics, timeSeries, channels, risk] = await Promise.all([
      analyticsApi.getMetrics(filters),
      analyticsApi.getTimeSeries(filters),
      analyticsApi.getChannelPerformance(filters),
      analyticsApi.getRiskDistribution(filters),
    ]);

    return {
      metrics: metrics.data,
      timeSeries: timeSeries.data,
      channelPerformance: channels.data,
      riskDistribution: risk.data,
    };
  },
};

