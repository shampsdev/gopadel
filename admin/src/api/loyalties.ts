import { api } from './api';

export interface Loyalty {
  id: number;
  name: string;
  discount: number;
  description: string;
  requirements: string;
}

export interface CreateLoyalty {
  name: string;
  discount: number;
  description: string;
  requirements: string;
}

export interface PatchLoyalty {
  name?: string;
  discount?: number;
  description?: string;
  requirements?: string;
}

export const loyaltiesApi = {
  // Получить все уровни лояльности
  getAll: async (): Promise<Loyalty[]> => {
    const response = await api.get('/admin/loyalties');
    return response.data;
  },

  // Создать новый уровень лояльности
  create: async (data: CreateLoyalty): Promise<Loyalty> => {
    const response = await api.post('/admin/loyalties', data);
    return response.data;
  },

  // Обновить уровень лояльности
  patch: async (id: number, data: PatchLoyalty): Promise<Loyalty> => {
    const response = await api.patch(`/admin/loyalties/${id}`, data);
    return response.data;
  },

  // Удалить уровень лояльности
  delete: async (id: number): Promise<void> => {
    await api.delete(`/admin/loyalties/${id}`);
  },
}; 