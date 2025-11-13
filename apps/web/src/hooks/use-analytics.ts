import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../lib/api/analytics';

export function useAnalyticsMetrics(filters?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['analytics', 'metrics', filters],
    queryFn: () => analyticsApi.getMetrics(filters),
  });
}

export function useTimeSeries(filters?: { startDate?: string; endDate?: string; interval?: 'day' | 'week' | 'month' }) {
  return useQuery({
    queryKey: ['analytics', 'timeseries', filters],
    queryFn: () => analyticsApi.getTimeSeries(filters),
  });
}

export function useChannelPerformance(filters?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['analytics', 'channels', filters],
    queryFn: () => analyticsApi.getChannelPerformance(filters),
  });
}

export function useRiskDistribution(filters?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['analytics', 'risk', filters],
    queryFn: () => analyticsApi.getRiskDistribution(filters),
  });
}

