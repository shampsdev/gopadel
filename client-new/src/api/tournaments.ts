import type { FilterTournament } from "../types/filter.type";
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
