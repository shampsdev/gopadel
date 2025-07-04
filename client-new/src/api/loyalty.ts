import type { Loyalty } from "../types/loyalty.type";
import { api } from "./axios.instance";

export const getLoyalties = async (
  token: string
): Promise<Loyalty[] | null> => {
  const response = await api.get("/loyalties", {
    headers: {
      "X-Api-Token": token,
    },
  });
  return response.data;
};
