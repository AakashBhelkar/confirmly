import { useQuery } from '@tanstack/react-query';
import { dashboardApi, DashboardData } from '../lib/api/dashboard';
import dayjs from 'dayjs';

export function useDashboardData(days: number = 30) {
  const endDate = dayjs().toISOString();
  const startDate = dayjs().subtract(days, 'days').toISOString();

  return useQuery({
    queryKey: ['dashboard', startDate, endDate],
    queryFn: () => dashboardApi.getDashboardData({ startDate, endDate }),
    refetchInterval: 60000, // Refetch every minute for real-time updates
  });
}

