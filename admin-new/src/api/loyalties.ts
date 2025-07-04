import { api } from './api';

export interface Loyalty {
  id: number;
  name: string;
  discount: number;
  description: string;
  requirements: string;
}

export const loyaltiesApi = {
  // Получить все уровни лояльности
  getAll: async (): Promise<Loyalty[]> => {
    const response = await api.get('/admin/loyalties');
    return response.data;
  },
}; 