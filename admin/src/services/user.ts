import { api } from "../api/api";
import type { User, UserListItem } from "../shared/types";

export const userService = {
  async getAll(skip = 0, limit = 50): Promise<{users: User[], total: number}> {
    const response = await api.get(`/admin/users/?skip=${skip}&limit=${limit}`);

    return {
      users: response.data,
      total: parseInt(response.headers['x-total-count'] || response.data.length.toString())
    };
  },

  async getAllUsers(): Promise<UserListItem[]> {
    const response = await api.get(`/admin/users/all`);
    return response.data;
  },

  async getById(id: string): Promise<User> {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  async update(user: Partial<User>): Promise<User> {
    const response = await api.patch(`/admin/users/${user.id}`, user);
    return response.data;
  }
}; 