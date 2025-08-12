import { api } from './api';
import type { Club, CreateClub, PatchClub } from '../shared/types';

// Реэкспорт для удобства использования в компонентах
export type { Club, CreateClub, PatchClub };

// Модель фильтра клубов
export interface FilterClub {
  id?: string;
  name?: string;
  isPrivate?: boolean;
  url?: string;
}

export const clubsApi = {
  // Получение списка клубов с фильтрацией
  filter: async (filter: FilterClub): Promise<Club[]> => {
    const response = await api.post<Club[]>('/admin/clubs/filter', filter);
    return response.data;
  },

  // Получение всех клубов
  getAll: async (): Promise<Club[]> => {
    const response = await api.get<Club[]>('/admin/clubs');
    return response.data;
  },

  // Создание клуба
  create: async (data: CreateClub): Promise<Club> => {
    const response = await api.post<Club>('/admin/clubs', data);
    return response.data;
  },

  // Обновление клуба
  patch: async (id: string, data: PatchClub): Promise<Club> => {
    const response = await api.patch<Club>(`/admin/clubs/${id}`, data);
    return response.data;
  },

  // Удаление клуба
  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/clubs/${id}`);
  },
};