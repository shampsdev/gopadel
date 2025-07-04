import { api } from './api';

export interface Court {
  id: string;
  name: string;
  address: string;
}

export interface CreateCourt {
  name: string;
  address: string;
}

export interface PatchCourt {
  name?: string;
  address?: string;
}

export const courtsApi = {
  async getAll(): Promise<Court[]> {
    const response = await api.get('/admin/courts');
    return response.data;
  },

  async create(court: CreateCourt): Promise<Court> {
    const response = await api.post('/admin/courts', court);
    return response.data;
  },

  async patch(id: string, court: PatchCourt): Promise<Court> {
    const response = await api.patch(`/admin/courts/${id}`, court);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/admin/courts/${id}`);
  },
}; 