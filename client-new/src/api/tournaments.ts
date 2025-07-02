import type { FilterTournament } from "../types/filter.type";
import type { Tournament } from "../types/tournament.type";
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
