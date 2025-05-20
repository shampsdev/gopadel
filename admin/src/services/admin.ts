import { api } from "../api/api";

export interface AdminUser {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  is_superuser: boolean;
  is_active: boolean;
}

export interface CreateAdminRequest {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  is_superuser?: boolean;
  is_active?: boolean;
}

export interface PasswordChangeRequest {
  old_password: string;
  new_password: string;
}

export const adminService = {
  getAll: async (): Promise<AdminUser[]> => {
    const response = await api.get('/admin');
    return response.data;
  },

  create: async (adminData: CreateAdminRequest): Promise<AdminUser> => {
    const response = await api.post('/admin/create', adminData);
    return response.data;
  },

  delete: async (adminId: string): Promise<void> => {
    await api.delete(`/admin/${adminId}`);
  },

  changePassword: async (passwordData: PasswordChangeRequest): Promise<void> => {
    await api.post('/admin/auth/change-password', passwordData);
  },

  getCurrentAdmin: async (): Promise<{ username: string; is_superuser: boolean }> => {
    const response = await api.get('/admin/auth/me');
    return response.data;
  }
}; 