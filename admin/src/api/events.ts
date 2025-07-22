import { api } from './api';
import type { 
  Event, 
  EventType, 
  EventStatus, 
  User, 
  Court, 
  RegistrationStatus
} from '../shared/types';

// Реэкспорт для удобства использования в компонентах
export type { Event, EventType, EventStatus, User, Court, RegistrationStatus };

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

// Модель для обновления события
export interface PatchEvent {
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

// Фильтр для событий
export interface FilterEvent {
  id?: string;
  name?: string;
  status?: EventStatus;
  type?: EventType;
  notFull?: boolean;
  notCompleted?: boolean;
  organizerId?: string;
  clubId?: string;
  filterByUserClubs?: string;
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

// Модель регистрации для событий
export interface EventRegistration {
  userId: string;
  eventId: string;
  status: RegistrationStatus;
  createdAt: string;
  updatedAt: string;
  user?: User;
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

  // Обновление статуса события
  updateStatus: async (id: string, status: EventStatus): Promise<Event> => {
    const response = await api.patch<Event>(`/admin/events/${id}`, { status });
    return response.data;
  },
}; 