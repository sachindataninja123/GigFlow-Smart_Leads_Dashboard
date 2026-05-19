import api from './api';
import { ApiResponse, AuthResponse } from '@/types';

export const authService = {
  register: async (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<AuthResponse> => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return res.data.data!;
  },

  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return res.data.data!;
  },

  getMe: async () => {
    const res = await api.get<ApiResponse>('/auth/me');
    return res.data.data;
  },
};
