import { api } from "../api/api";
import type { Tournament } from "../shared/types";

export const tournamentService = {
  async getAll(): Promise<Tournament[]> {
    const response = await api.get("/admin/tournaments/");
    return response.data;
  },

  async getById(id: number): Promise<Tournament> {
    const response = await api.get(`/admin/tournaments/${id}`);
    return response.data;
  },

  async create(tournament: Tournament): Promise<Tournament> {
    const response = await api.post("/admin/tournaments/", tournament);
    return response.data;
  },

  async update(tournament: Tournament): Promise<Tournament> {
    const response = await api.put(`/admin/tournaments/${tournament.id}`, tournament);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/admin/tournaments/${id}`);
  }
}; 