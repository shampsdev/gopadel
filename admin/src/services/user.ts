import { api } from "../api/api";
import type { User } from "../shared/types";

export const userService = {
  async getAll(skip = 0, limit = 10): Promise<{users: User[], total: number}> {
    const response = await api.get(`/admin/users/?skip=${skip}&limit=${limit}`);
    // Assuming the API returns an object with users array and total count
    // If it doesn't, we might need to adjust this implementation
    return {
      users: response.data,
      total: parseInt(response.headers['x-total-count'] || response.data.length.toString())
    };
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