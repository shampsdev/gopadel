import { api } from './api';

export interface Tournament {
  id: string;
  name: string;
  startTime: string;
  endTime?: string;
  price: number;
  rankMin: number;
  rankMax: number;
  maxUsers: number;
  description?: string;
  clubId: string;
  tournamentType: string;
  court: {
    id: string;
    name: string;
    address: string;
  };
  organizator: {
    id: string;
    telegramId: number;
    telegramUsername?: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    rank: number;
  };
  participants?: Registration[];
}

export interface CreateTournament {
  name: string;
  startTime: string;
  endTime?: string;
  price: number;
  rankMin: number;
  rankMax: number;
  maxUsers: number;
  description?: string;
  courtId: string;
  clubId: string;
  tournamentType: string;
  organizatorId: string;
}

export interface AdminPatchTournament {
  name?: string;
  startTime?: string;
  endTime?: string;
  price?: number;
  rankMin?: number;
  rankMax?: number;
  maxUsers?: number;
  description?: string;
  courtId?: string;
  clubId?: string;
  tournamentType?: string;
  organizatorId?: string;
}

export interface AdminFilterTournament {
  id?: string;
  name?: string;
  clubId?: string;
  organizatorId?: string;
  tournamentType?: string;
  organizatorTelegramId?: number;
  organizatorFirstName?: string;
  clubName?: string;
}

export interface Registration {
  id: string;
  userId: string;
  tournamentId: string;
  date: string;
  status: 'PENDING' | 'ACTIVE' | 'CANCELED' | 'CANCELED_BY_USER';
  user?: {
    id: string;
    telegramId: number;
    telegramUsername?: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    rank: number;
  };
}

export const tournamentsApi = {
  // Получение списка турниров с фильтрацией
  filter: async (filter: AdminFilterTournament): Promise<Tournament[]> => {
    const response = await api.post<Tournament[]>('/admin/tournaments/filter', filter);
    return response.data;
  },

  // Получение всех турниров
  getAll: async (): Promise<Tournament[]> => {
    const response = await api.post<Tournament[]>('/admin/tournaments/filter', {});
    return response.data;
  },

  // Создание турнира
  create: async (data: CreateTournament): Promise<Tournament> => {
    const response = await api.post<Tournament>('/admin/tournaments', data);
    return response.data;
  },

  // Обновление турнира
  patch: async (id: string, data: AdminPatchTournament): Promise<Tournament> => {
    const response = await api.patch<Tournament>(`/admin/tournaments/${id}`, data);
    return response.data;
  },

  // Удаление турнира
  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/tournaments/${id}`);
  },
}; 