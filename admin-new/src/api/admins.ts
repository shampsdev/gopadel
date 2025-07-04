import { api } from './api';
import type { AdminUser, FilterAdminUser, CreateAdminUser, PatchAdminUser } from '../types/admin';
import type { MessageResponse } from '../types/auth';

export const adminsApi = {
  filter: async (filter: FilterAdminUser): Promise<AdminUser[]> => {
    const response = await api.post('/admin/filter', filter);
    return response.data;
  },

  create: async (data: CreateAdminUser): Promise<AdminUser> => {
    const response = await api.post('/admin', data);
    return response.data;
  },

  patch: async (id: string, data: PatchAdminUser): Promise<AdminUser> => {
    const response = await api.patch(`/admin/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<MessageResponse> => {
    const response = await api.delete(`/admin/${id}`);
    return response.data;
  },
}; 