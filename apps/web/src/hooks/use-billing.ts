import { useQuery, useMutation } from '@tanstack/react-query';
import { billingApi, Plan } from '../lib/api/billing';
import { useToast } from '../components/shared/toast';

export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: () => billingApi.getPlans(),
  });
}

export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: () => billingApi.getSubscription(),
  });
}

export function useUsage() {
  return useQuery({
    queryKey: ['usage'],
    queryFn: () => billingApi.getUsage(),
  });
}

export function useInvoices() {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: () => billingApi.getInvoices(),
  });
}

export function useCreateCheckout() {
  const toast = useToast();

  return useMutation({
    mutationFn: ({ planId, successUrl, cancelUrl }: { planId: string; successUrl: string; cancelUrl: string }) =>
      billingApi.createCheckout(planId, successUrl, cancelUrl),
    onSuccess: (data) => {
      if (data.data?.url) {
        window.location.href = data.data.url;
      }
    },
    onError: (error: any) => {
      toast.showError(error.response?.data?.message || 'Failed to create checkout session');
    },
  });
}

export function useCreatePortalSession() {
  const toast = useToast();

  return useMutation({
    mutationFn: (returnUrl: string) => billingApi.createPortalSession(returnUrl),
    onSuccess: (data) => {
      if (data.data?.url) {
        window.location.href = data.data.url;
      }
    },
    onError: (error: any) => {
      toast.showError(error.response?.data?.message || 'Failed to create portal session');
    },
  });
}

