import { api } from "./axios.instance";
import type { Court } from "../types/court.type";

export const getCourts = async (token: string): Promise<Court[] | null> => {
  const response = await api.get("/courts", {
    headers: {
      "X-Api-Token": token,
    },
  });
  return response.data;
};
