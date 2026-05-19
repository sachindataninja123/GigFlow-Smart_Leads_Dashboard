import api from './api';
import { Lead, LeadFilters, LeadsResponse, ApiResponse, LeadFormData, LeadStats } from '@/types';

export const leadService = {
  getLeads: async (filters: LeadFilters = {}): Promise<LeadsResponse> => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.source) params.set('source', filters.source);
    if (filters.search) params.set('search', filters.search);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    const res = await api.get<LeadsResponse>(`/leads?${params.toString()}`);
    return res.data;
  },

  getLead: async (id: string): Promise<Lead> => {
    const res = await api.get<ApiResponse<Lead>>(`/leads/${id}`);
    return res.data.data!;
  },

  createLead: async (data: LeadFormData): Promise<Lead> => {
    const res = await api.post<ApiResponse<Lead>>('/leads', data);
    return res.data.data!;
  },

  updateLead: async (id: string, data: Partial<LeadFormData>): Promise<Lead> => {
    const res = await api.put<ApiResponse<Lead>>(`/leads/${id}`, data);
    return res.data.data!;
  },

  deleteLead: async (id: string): Promise<void> => {
    await api.delete(`/leads/${id}`);
  },

  getStats: async (): Promise<LeadStats> => {
    const res = await api.get<ApiResponse<LeadStats>>('/leads/stats');
    return res.data.data!;
  },

  exportCSV: (filters: Omit<LeadFilters, 'page' | 'limit' | 'sort'> = {}): void => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.source) params.set('source', filters.source);
    if (filters.search) params.set('search', filters.search);
    const token = localStorage.getItem('gigflow_token');
    const url = `/api/leads/export/csv?${params.toString()}`;
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', '');
    // Add auth header via fetch instead
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.click();
        URL.revokeObjectURL(objectUrl);
      });
  },
};
