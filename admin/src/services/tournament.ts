import { api } from "../api/api";
import type { Tournament, Participant, WaitlistEntry } from "../shared/types";
import { RegistrationStatus } from "../shared/types";

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
    const response = await api.patch(`/admin/tournaments/${tournament.id}`, tournament);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/admin/tournaments/${id}`);
  },

  async getParticipants(tournamentId: number): Promise<Participant[]> {
    const response = await api.get(`/admin/tournaments/${tournamentId}/participants`);
    return response.data;
  },

  async getWaitlist(tournamentId: number): Promise<WaitlistEntry[]> {
    const response = await api.get(`/admin/tournaments/${tournamentId}/waitlist`);
    return response.data;
  },

  async updateRegistrationStatus(registrationId: string, status: RegistrationStatus): Promise<void> {
    await api.patch(`/admin/registrations/${registrationId}/status`, { status });
  }
}; 