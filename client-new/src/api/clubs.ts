import { api } from "./axios.instance";
import type { Club } from "../types/club.type";
import type { FilterClub } from "../types/filter.type";

export const getClubs = async (
  token: string,
  filter: FilterClub
): Promise<Club[] | null> => {
  const response = await api.post<Club[]>("/clubs/filter", filter, {
    headers: {
      "X-Api-Token": token,
    },
  });
  return response.data;
};

export const getMyClubs = async (token: string): Promise<Club[] | null> => {
  const response = await api.get<Club[]>("/clubs/my", {
    headers: {
      "X-Api-Token": token,
    },
  });
  return response.data;
};

export const joinClub = async (
  clubId: string,
  token: string
): Promise<Club | null> => {
  const response = await api.post<Club>(
    `/clubs/${clubId}/join`,
    {},
    {
      headers: {
        "X-Api-Token": token,
      },
    }
  );
  return response.data;
};
