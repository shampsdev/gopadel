import type { User } from "../types/user.type";
import { api } from "./axios.instance";

export const createMe = async (token: string): Promise<User | null> => {
  try {
    const response = await api.post<User>(
      "/users/me",
      {},
      {
        headers: {
          "X-Api-Token": token,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Ошибка при создании профиля", error);
    throw error;
  }
};

export const patchMe = async (
  token: string,
  user: User
): Promise<User | null> => {
  try {
    const response = await api.patch("/users/me", user, {
      headers: {
        "X-Api-Token": token,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка при обновлении профиля", error);
    throw error;
  }
};
