import type { Registration } from "../types/registration.type";
import { api } from "./axios.instance";

export const getMyRegistrations = async (
  token: string
): Promise<Registration[] | null> => {
  const response = await api.get("/registrations/my", {
    headers: {
      "X-Api-Token": token,
    },
  });
  return response.data;
};
