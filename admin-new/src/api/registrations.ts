import { api } from './api';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  telegramUsername: string;
  telegramId: number;
  rank: number;
  city: string;
}

export interface Tournament {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  price: number;
  rankMin: number;
  rankMax: number;
  maxUsers: number;
  description: string;
  club: {
    id: string;
    name: string;
    address: string;
  };
  tournamentType: string;
  organizator: User;
}

export interface Payment {
  id: string;
  paymentId: string;
  date: string;
  amount: number;
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled';
  paymentLink: string;
  confirmationToken: string;
}

export type RegistrationStatus = 'PENDING' | 'ACTIVE' | 'CANCELED' | 'CANCELED_BY_USER';

export interface Registration {
  id: string;
  userId: string;
  tournamentId: string;
  date: string;
  status: RegistrationStatus;
  user?: User;
  tournament?: Tournament;
  payments?: Payment[];
}

export interface FilterRegistration {
  id?: string;
  userId?: string;
  tournamentId?: string;
  status?: string;
  userTelegramId?: number;
  userTelegramUsername?: string;
  userFirstName?: string;
  tournamentName?: string;
}

export interface TournamentOption {
  id: string;
  name: string;
}

export interface UserOption {
  id: string;
  firstName: string;
  lastName: string;
  telegramUsername: string;
  telegramId: number;
}

export interface FilterUser {
  id?: string;
  telegramId?: number;
  firstName?: string;
  lastName?: string;
}

export interface UserSearchRequest {
  telegramUsername: string;
}

export const registrationsApi = {
  filter: async (filter: FilterRegistration): Promise<Registration[]> => {
    const response = await api.post('/admin/registrations/filter', filter);
    return response.data;
  },

  getById: async (id: string): Promise<Registration> => {
    const response = await api.get(`/admin/registrations/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, status: string): Promise<Registration> => {
    const response = await api.patch(`/admin/registrations/${id}/status`, { status });
    return response.data;
  },

  getTournamentOptions: async (): Promise<TournamentOption[]> => {
    const response = await api.get('/admin/registrations/tournaments');
    return response.data;
  },

  searchUsers: async (request: UserSearchRequest): Promise<UserOption[]> => {
    const response = await api.post('/admin/registrations/users', request);
    return response.data;
  },
}; 