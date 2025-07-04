import type { FilterUser } from "../types/filter.type";
import type { PatchUser } from "../types/patch-user.type";
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
  user: PatchUser
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

export const getMe = async (token: string): Promise<User | null> => {
  try {
    const response = await api.get<User>("/users/me", {
      headers: {
        "X-Api-Token": token,
      },
    });
    console.log("TOKEN:", token);
    return response.data;
  } catch (error) {
    console.error("Ошибка при получении профиля", error);
    throw error;
  }
};

export const uploadAvatar = async (
  token: string,
  file: File
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<{ url: string }>(
    "/images/upload/avatar",
    formData,
    {
      headers: {
        "X-Api-Token": token,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data.url;
};

export const getUsers = async (
  token: string,
  filter: FilterUser
): Promise<User[] | null> => {
  const response = await api.post<User[]>("/users/filter", filter, {
    headers: {
      "X-Api-Token": token,
    },
  });
  return response.data;
};

export const isAdmin = async (token: string): Promise<boolean | null> => {
  const response = await api.get<boolean>("/users/me/admin", {
    headers: {
      "X-Api-Token": token,
    },
  });
  return response.data;
};
