import type { FilterTournament } from "../types/filter.type";
import { api } from "./axios.instance";

export const getTournaments = async (
  token: string,
  filter: FilterTournament
) => {
  const response = await api.post("/tournaments/filter", filter, {
    headers: {
      "X-Api-Token": token,
    },
  });
  return response.data;
};
