import { api } from './api';

export interface Club {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  userCount?: number;
}

export interface CreateClub {
  id: string;
  name: string;
  description?: string;
}

export interface PatchClub {
  id?: string;
  name?: string;
  description?: string;
}

export const clubsApi = {
  // Получить все клубы
  getAll: async (): Promise<Club[]> => {
    const response = await api.get('/admin/clubs');
    return response.data;
  },

  // Создать новый клуб
  create: async (data: CreateClub): Promise<Club> => {
    const response = await api.post('/admin/clubs', data);
    return response.data;
  },

  // Обновить клуб
  patch: async (id: string, data: PatchClub): Promise<Club> => {
    const response = await api.patch(`/admin/clubs/${id}`, data);
    return response.data;
  },

  // Удалить клуб
  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/clubs/${id}`);
  },
};