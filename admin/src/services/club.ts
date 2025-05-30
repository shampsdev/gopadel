import type { Club } from '../shared/types';
import { api } from "../api/api";

export const clubService = {
  async getAll(): Promise<Club[]> {
    const response = await api.get("/admin/clubs/");
    return response.data;
  },

  async getById(id: string): Promise<Club> {
    const response = await api.get(`/admin/clubs/${id}`);
    return response.data;
  },

  async create(clubData: Omit<Club, 'id'>): Promise<Club> {
    const response = await api.post("/admin/clubs/", clubData);
    return response.data;
  },

  async update(id: string, clubData: Omit<Club, 'id'>): Promise<Club> {
    const response = await api.put(`/admin/clubs/${id}`, clubData);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/admin/clubs/${id}`);
  }
}; 