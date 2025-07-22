import { api } from './api';
import type { WaitlistUser } from '../shared/types';

// Реэкспорт для удобства использования в компонентах
export type { WaitlistUser };

export const waitlistApi = {
  // Получить список ожидания для события
  getEventWaitlist: async (eventId: string): Promise<WaitlistUser[]> => {
    const response = await api.get<WaitlistUser[]>(`/admin/events/${eventId}/waitlist`);
    return response.data;
  },

  // Добавить пользователя в список ожидания (для обычных пользователей)
  addToWaitlist: async (eventId: string): Promise<void> => {
    await api.post(`/events/${eventId}/waitlist`);
  },

  // Удалить пользователя из списка ожидания (для обычных пользователей)
  removeFromWaitlist: async (eventId: string): Promise<void> => {
    await api.delete(`/events/${eventId}/waitlist`);
  },
}; 