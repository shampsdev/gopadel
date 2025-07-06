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
  court: {
    id: string;
    name: string;
    address: string;
  };
  tournamentType: string;
  organizator: User;
}

export type RegistrationStatus = 'PENDING' | 'ACTIVE' | 'CANCELED' | 'CANCELED_BY_USER';

export interface RegistrationWithPayments {
  id: string;
  userId: string;
  tournamentId: string;
  date: string;
  status: RegistrationStatus;
  user?: {
    id: string;
    telegramId: number;
    telegramUsername?: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    rank: number;
    city?: string;
    isRegistered: boolean;
  };
  tournament?: {
    id: string;
    name: string;
    startTime: string;
    endTime?: string;
    price: number;
    rankMin: number;
    rankMax: number;
    maxUsers: number;
    description?: string;
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
  };
  payments?: Payment[];
}

export interface Payment {
  id: string;
  paymentId: string;
  date: string;
  amount: number;
  status: string;
  paymentLink: string;
  confirmationToken: string;
  registrationId: string;
}

export interface AdminFilterRegistration {
  id?: string;
  userId?: string;
  tournamentId?: string;
  status?: RegistrationStatus;
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
  telegramUsername?: string;
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
  filter: async (filter: AdminFilterRegistration): Promise<RegistrationWithPayments[]> => {
    const response = await api.post<RegistrationWithPayments[]>('/admin/registrations/filter', filter);
    return response.data;
  },

  getAll: async (): Promise<RegistrationWithPayments[]> => {
    const response = await api.post<RegistrationWithPayments[]>('/admin/registrations/filter', {});
    return response.data;
  },

  getById: async (id: string): Promise<RegistrationWithPayments> => {
    const response = await api.get<RegistrationWithPayments>(`/admin/registrations/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, status: RegistrationStatus): Promise<RegistrationWithPayments> => {
    const response = await api.patch<RegistrationWithPayments>(`/admin/registrations/${id}/status`, { status });
    return response.data;
  },

  getTournamentOptions: async (): Promise<TournamentOption[]> => {
    const response = await api.get<TournamentOption[]>('/admin/registrations/tournaments');
    return response.data;
  },

  getUserOptions: async (telegramUsername: string): Promise<UserOption[]> => {
    const response = await api.post<UserOption[]>('/admin/registrations/users', { telegramUsername });
    return response.data;
  },

  searchUsers: async (request: UserSearchRequest): Promise<UserOption[]> => {
    const response = await api.post('/admin/registrations/users', request);
    return response.data;
  },
}; 