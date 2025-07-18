import { api } from './api';

// Типы событий
export type EventType = 'game' | 'tournament' | 'training';

// Статусы событий
export type EventStatus = 'registration' | 'full' | 'completed' | 'cancelled';

// Позиции игры
export type PlayingPosition = 'right' | 'left' | 'both';

// Базовая модель пользователя
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  telegramUsername?: string;
  telegramId: number;
  rank: number;
  city?: string;
  bio?: string;
  avatar?: string;
  birthDate?: string;
  playingPosition?: PlayingPosition;
  padelProfiles?: string;
  isRegistered: boolean;
  loyalty?: {
    id: number;
    name: string;
    discount: number;
    description: string;
    requirements: string;
  };
}

// Модель корта
export interface Court {
  id: string;
  name: string;
  address: string;
}

// Статусы регистрации
export type RegistrationStatus = 'PENDING' | 'INVITED' | 'CONFIRMED' | 'CANCELLED_BEFORE_PAYMENT' | 'CANCELLED_AFTER_PAYMENT' | 'REFUNDED' | 'CANCELLED' | 'LEFT';

// Модель регистрации для событий
export interface EventRegistration {
  userId: string;
  eventId: string;
  status: RegistrationStatus;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

// Модель события
export interface Event {
  id: string;
  name: string;
  description?: string;
  startTime: string;
  endTime?: string;
  rankMin: number;
  rankMax: number;
  price: number;
  maxUsers: number;
  status: EventStatus;
  type: EventType;
  clubId?: string;
  court: Court;
  organizer: User;
  participants?: EventRegistration[];
  data?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Модель для создания события
export interface CreateEvent {
  name: string;
  description?: string;
  startTime: string;
  endTime?: string;
  rankMin: number;
  rankMax: number;
  price: number;
  maxUsers: number;
  type: EventType;
  courtId: string;
  clubId?: string;
  organizerId?: string;
  data?: Record<string, unknown>;
}

// Модель для обновления события (админ)
export interface AdminPatchEvent {
  name?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  rankMin?: number;
  rankMax?: number;
  price?: number;
  maxUsers?: number;
  status?: EventStatus;
  type?: EventType;
  courtId?: string;
  organizerId?: string;
  clubId?: string;
  data?: Record<string, unknown>;
}

// Фильтр для событий (админ)
export interface AdminFilterEvent {
  id?: string;
  name?: string;
  status?: EventStatus;
  type?: EventType;
  organizerId?: string;
  organizerFirstName?: string;
  organizerTelegramId?: number;
  clubId?: string;
  clubName?: string;
}

// Модель пользователя из списка ожидания
export interface WaitlistUser {
  user: User;
  date: string;
}

export const eventsApi = {
  // Получение списка событий с фильтрацией
  filter: async (filter: AdminFilterEvent): Promise<Event[]> => {
    const response = await api.post<Event[]>('/admin/events/filter', filter);
    return response.data;
  },

  // Получение всех событий
  getAll: async (): Promise<Event[]> => {
    const response = await api.post<Event[]>('/admin/events/filter', {});
    return response.data;
  },

  // Создание события
  create: async (data: CreateEvent): Promise<Event> => {
    const response = await api.post<Event>('/admin/events', data);
    return response.data;
  },

  // Обновление события
  patch: async (id: string, data: AdminPatchEvent): Promise<Event> => {
    const response = await api.patch<Event>(`/admin/events/${id}`, data);
    return response.data;
  },

  // Удаление события
  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/events/${id}`);
  },
}; 