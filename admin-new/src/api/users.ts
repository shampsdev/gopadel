import { api } from './api';
import type { User, FilterUser, AdminPatchUser } from '../types/user';

export const usersApi = {
  // Получение списка пользователей с фильтрацией
  filter: async (filter: FilterUser): Promise<User[]> => {
    const response = await api.post<User[]>('/admin/users/filter', filter);
    return response.data;
  },

  // Обновление пользователя (только для суперюзера)
  patch: async (id: string, data: AdminPatchUser): Promise<User> => {
    const response = await api.patch<User>(`/admin/users/${id}`, data);
    return response.data;
  },
}; 