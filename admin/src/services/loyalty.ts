import { api } from "../api/api";
import type { Loyalty } from "../shared/types";

export const loyaltyService = {
  async getAll(): Promise<Loyalty[]> {
    const response = await api.get("/admin/loyalty/");
    return response.data;
  },

  async getById(id: number): Promise<Loyalty> {
    const response = await api.get(`/admin/loyalty/${id}`);
    return response.data;
  },

  async create(loyalty: Loyalty): Promise<Loyalty> {
    const response = await api.post("/admin/loyalty/", loyalty);
    return response.data;
  },

  async update(loyalty: Loyalty): Promise<Loyalty> {
    if (!loyalty.id) {
      throw new Error("Loyalty ID is required for update");
    }
    const response = await api.patch(`/admin/loyalty/${loyalty.id}`, loyalty);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/admin/loyalty/${id}`);
  }
}; 