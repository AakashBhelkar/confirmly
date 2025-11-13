import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, Order, OrderFilters } from '../lib/api/orders';
import { useToast } from '../components/shared/toast';

export function useOrders(filters?: OrderFilters) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => ordersApi.getOrders(filters),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getOrder(id),
    enabled: !!id,
  });
}

export function useConfirmOrder() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => ordersApi.confirmOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.showSuccess('Order confirmed successfully');
    },
    onError: (error: any) => {
      toast.showError(error.response?.data?.message || 'Failed to confirm order');
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => ordersApi.cancelOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.showSuccess('Order canceled successfully');
    },
    onError: (error: any) => {
      toast.showError(error.response?.data?.message || 'Failed to cancel order');
    },
  });
}

