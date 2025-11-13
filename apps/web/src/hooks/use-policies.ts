import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { policiesApi, PolicyRule } from '../lib/api/policies';
import { useToast } from '../components/shared/toast';

export function usePolicy() {
  return useQuery({
    queryKey: ['policy'],
    queryFn: () => policiesApi.getPolicy(),
  });
}

export function useSavePolicy() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (rules: PolicyRule[]) => policiesApi.savePolicy(rules),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policy'] });
      toast.showSuccess('Policy saved successfully');
    },
    onError: (error: any) => {
      toast.showError(error.response?.data?.message || 'Failed to save policy');
    },
  });
}

export function useTestPolicy() {
  const toast = useToast();

  return useMutation({
    mutationFn: (orderData: any) => policiesApi.testPolicy(orderData),
    onError: (error: any) => {
      toast.showError(error.response?.data?.message || 'Failed to test policy');
    },
  });
}

