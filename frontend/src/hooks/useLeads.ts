import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadService } from '@/services/leadService';
import { LeadFilters, LeadFormData } from '@/types';
import toast from 'react-hot-toast';

export const useLeads = (filters: LeadFilters) => {
  return useQuery({
    queryKey: ['leads', filters],
    queryFn: () => leadService.getLeads(filters),
    placeholderData: (prev) => prev,
  });
};

export const useLeadStats = () => {
  return useQuery({
    queryKey: ['lead-stats'],
    queryFn: leadService.getStats,
    staleTime: 30000,
  });
};

export const useLead = (id: string) => {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadService.getLead(id),
    enabled: !!id,
  });
};

export const useCreateLead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: LeadFormData) => leadService.createLead(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['lead-stats'] });
      toast.success('Lead created successfully!');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || 'Failed to create lead');
    },
  });
};

export const useUpdateLead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LeadFormData> }) =>
      leadService.updateLead(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['lead-stats'] });
      toast.success('Lead updated successfully!');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || 'Failed to update lead');
    },
  });
};

export const useDeleteLead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leadService.deleteLead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['lead-stats'] });
      toast.success('Lead deleted.');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || 'Failed to delete lead');
    },
  });
};
