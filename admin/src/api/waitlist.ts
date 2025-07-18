import { api } from './api';

export interface WaitlistUser {
  user: {
    id: string;
    telegramId: string;
    telegramUsername?: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    bio?: string;
    rank?: number;
    city?: string;
    birthDate?: string;
    playingPosition?: string;
    padelProfiles?: string;
    isRegistered?: boolean;
  };
  date: string;
}

export const waitlistApi = {
  // Получить список ожидания события (админский API)
  getEventWaitlist: async (eventId: string): Promise<WaitlistUser[]> => {
    const response = await api.get(`/admin/events/${eventId}/waitlist`);
    return response.data;
  },
  
  // Получить список ожидания турнира (оставляем для совместимости)
  getTournamentWaitlist: async (tournamentId: string): Promise<WaitlistUser[]> => {
    const response = await api.get(`/admin/events/${tournamentId}/waitlist`);
    return response.data;
  },
}; 