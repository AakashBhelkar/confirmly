import apiClient from './client';

export interface Template {
  id: string;
  channel: 'whatsapp' | 'sms' | 'email';
  name: string;
  variant?: string;
  content: string;
  variables: string[];
  status: 'draft' | 'active';
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTemplateData {
  channel: 'whatsapp' | 'sms' | 'email';
  name: string;
  content: string;
  variables?: string[];
  variant?: string;
}

export interface UpdateTemplateData {
  name?: string;
  content?: string;
  variables?: string[];
  status?: 'draft' | 'active';
}

export const templatesApi = {
  getTemplates: async (filters?: { channel?: string; status?: string }): Promise<{ success: boolean; data: Template[] }> => {
    const response = await apiClient.get('/templates', { params: filters });
    return response.data;
  },

  getTemplate: async (id: string): Promise<{ success: boolean; data: Template }> => {
    const response = await apiClient.get(`/templates/${id}`);
    return response.data;
  },

  createTemplate: async (data: CreateTemplateData): Promise<{ success: boolean; data: Template }> => {
    const response = await apiClient.post('/templates', data);
    return response.data;
  },

  updateTemplate: async (id: string, data: UpdateTemplateData): Promise<{ success: boolean; data: Template }> => {
    const response = await apiClient.put(`/templates/${id}`, data);
    return response.data;
  },

  deleteTemplate: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/templates/${id}`);
    return response.data;
  },
};

