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
  // Получить список ожидания турнира
  getTournamentWaitlist: async (tournamentId: string): Promise<WaitlistUser[]> => {
    const response = await api.get(`/admin/waitlist/tournament/${tournamentId}`);
    return response.data;
  },
}; 