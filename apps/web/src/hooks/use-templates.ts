import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templatesApi, Template, CreateTemplateData, UpdateTemplateData } from '../lib/api/templates';
import { useToast } from '../components/shared/toast';

export function useTemplates(filters?: { channel?: string; status?: string }) {
  return useQuery({
    queryKey: ['templates', filters],
    queryFn: () => templatesApi.getTemplates(filters),
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: ['template', id],
    queryFn: () => templatesApi.getTemplate(id),
    enabled: !!id,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: CreateTemplateData) => templatesApi.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.showSuccess('Template created successfully');
    },
    onError: (error: any) => {
      toast.showError(error.response?.data?.message || 'Failed to create template');
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateData }) =>
      templatesApi.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.showSuccess('Template updated successfully');
    },
    onError: (error: any) => {
      toast.showError(error.response?.data?.message || 'Failed to update template');
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => templatesApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.showSuccess('Template deleted successfully');
    },
    onError: (error: any) => {
      toast.showError(error.response?.data?.message || 'Failed to delete template');
    },
  });
}

