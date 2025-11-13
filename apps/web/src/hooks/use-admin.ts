import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, AdminMerchant, AdminPlan } from '../lib/api/admin';
import { useToast } from '../components/shared/toast';

export function useAdminMerchants() {
  return useQuery({
    queryKey: ['admin', 'merchants'],
    queryFn: () => adminApi.getMerchants(),
  });
}

export function useAdminMerchant(id: string) {
  return useQuery({
    queryKey: ['admin', 'merchants', id],
    queryFn: () => adminApi.getMerchant(id),
    enabled: !!id,
  });
}

export function useUpdateMerchant() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminMerchant> }) =>
      adminApi.updateMerchant(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'merchants'] });
      toast.showSuccess('Merchant updated successfully');
    },
    onError: (error: any) => {
      toast.showError(error.response?.data?.message || 'Failed to update merchant');
    },
  });
}

export function useDeleteMerchant() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => adminApi.deleteMerchant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'merchants'] });
      toast.showSuccess('Merchant deleted successfully');
    },
    onError: (error: any) => {
      toast.showError(error.response?.data?.message || 'Failed to delete merchant');
    },
  });
}

export function useAdminPlans() {
  return useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: () => adminApi.getPlans(),
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: Partial<AdminPlan>) => adminApi.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });
      toast.showSuccess('Plan created successfully');
    },
    onError: (error: any) => {
      toast.showError(error.response?.data?.message || 'Failed to create plan');
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminPlan> }) =>
      adminApi.updatePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });
      toast.showSuccess('Plan updated successfully');
    },
    onError: (error: any) => {
      toast.showError(error.response?.data?.message || 'Failed to update plan');
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => adminApi.deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });
      toast.showSuccess('Plan deleted successfully');
    },
    onError: (error: any) => {
      toast.showError(error.response?.data?.message || 'Failed to delete plan');
    },
  });
}

export function useProviderHealth() {
  return useQuery({
    queryKey: ['admin', 'health', 'providers'],
    queryFn: () => adminApi.getProviderHealth(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

