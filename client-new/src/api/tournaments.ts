import type { FilterTournament } from "../types/filter.type";
import type { PatchTournament } from "../types/patch-tournament.type";
import type { Tournament } from "../types/tournament.type";
import type { Waitlist } from "../types/waitlist.type";
import { api } from "./axios.instance";

export const getTournaments = async (
  token: string,
  filter: FilterTournament
): Promise<Tournament[] | null> => {
  const response = await api.post("/tournaments/filter", filter, {
    headers: {
      "X-Api-Token": token,
    },
  });
  return response.data;
};

export const getTournamentWaitlist = async (
  token: string,
  id: string
): Promise<Waitlist | null> => {
  const response = await api.get(`/tournaments/${id}/waitlist`, {
    headers: {
      "X-Api-Token": token,
    },
  });
  return response.data;
};

export const addUserToWaitlist = async (
  token: string,
  tournamentId: string
): Promise<Waitlist | null> => {
  const response = await api.post(
    `/tournaments/${tournamentId}/waitlist`,
    {},
    {
      headers: {
        "X-Api-Token": token,
      },
    }
  );
  return response.data;
};

export const removeUserFromWaitlist = async (
  token: string,
  tournamentId: string
): Promise<Waitlist | null> => {
  const response = await api.delete(`/tournaments/${tournamentId}/waitlist`, {
    headers: {
      "X-Api-Token": token,
    },
  });
  return response.data;
};

export const createTournament = async (
  token: string,
  tournament: Tournament
): Promise<Tournament | null> => {
  const response = await api.post("/tournaments", tournament, {
    headers: {
      "X-Api-Token": token,
    },
  });
  return response.data;
};

export const updateTournament = async (
  token: string,
  tournamentId: string,
  patchTournament: PatchTournament
): Promise<Tournament | null> => {
  const response = await api.patch(
    `/tournaments/${tournamentId}`,
    patchTournament,
    {
      headers: {
        "X-Api-Token": token,
      },
    }
  );
  return response.data;
};

export const deleteTournament = async (
  token: string,
  tournamentId: string
): Promise<boolean> => {
  const response = await api.delete(`/tournaments/${tournamentId}`, {
    headers: {
      "X-Api-Token": token,
    },
  });
  return response.status === 204;
};
