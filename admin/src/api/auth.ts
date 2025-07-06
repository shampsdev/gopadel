import { api } from './api';
import type { AdminLogin, AdminToken, AdminMe, AdminPasswordChange, MessageResponse } from '../types/auth';

export const authApi = {
  // Вход в систему
  login: async (credentials: AdminLogin): Promise<AdminToken> => {
    const response = await api.post<AdminToken>('/admin/auth/login', credentials);
    return response.data;
  },

  // Получение информации о текущем админе
  me: async (): Promise<AdminMe> => {
    const response = await api.get<AdminMe>('/admin/auth/me');
    return response.data;
  },

  // Смена пароля
  changePassword: async (passwordData: AdminPasswordChange): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>('/admin/auth/change-password', passwordData);
    return response.data;
  },
}; 