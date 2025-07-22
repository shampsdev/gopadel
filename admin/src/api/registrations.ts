import { api } from './api';
import type { 
  User, 
  Event, 
  RegistrationStatus, 
  Registration, 
  Payment, 
  EventType 
} from '../shared/types';

// Реэкспорт для удобства использования в компонентах
export type { User, Event, RegistrationStatus, Registration, Payment, EventType };

// Расширенная модель регистрации с платежами (из swagger.json)
export interface RegistrationWithPayments extends Registration {
  payments?: Payment[];
}

// Модель опции события для выпадающих списков
export interface EventOption {
  id: string;
  name: string;
  type: EventType;
  startTime: string;
  endTime?: string;
}

// Модель опции турнира для выпадающих списков
export interface TournamentOption {
  id: string;
  name: string;
  startTime: string;
  endTime?: string;
}

// Модель опции пользователя для выпадающих списков
export interface UserOption {
  id: string;
  telegramId: number;
  telegramUsername?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  rank: number;
}

// Модель запроса поиска пользователей
export interface UserSearchRequest {
  telegramUsername?: string;
  firstName?: string;
  telegramId?: number;
}

// Модель фильтра админских регистраций (из swagger.json)
export interface AdminFilterRegistration {
  eventId?: string;
  eventName?: string;
  status?: RegistrationStatus;
  userFirstName?: string;
  userId?: string;
  userTelegramId?: number;
  userTelegramUsername?: string;
}

// Модель для обновления статуса регистрации (из swagger.json)
export interface RegistrationStatusUpdate {
  status: RegistrationStatus;
}

// Статусы для игр
export const gameStatusOptions = [
  { value: 'INVITED' as RegistrationStatus, label: 'Приглашён', color: 'text-blue-300', bgColor: 'bg-blue-900/30' },
  { value: 'CONFIRMED' as RegistrationStatus, label: 'Подтверждено', color: 'text-green-300', bgColor: 'bg-green-900/30' },
  { value: 'CANCELLED' as RegistrationStatus, label: 'Отменена', color: 'text-red-300', bgColor: 'bg-red-900/30' },
  { value: 'LEFT' as RegistrationStatus, label: 'Покинул', color: 'text-gray-300', bgColor: 'bg-gray-900/30' },
];

// Статусы для турниров
export const tournamentStatusOptions = [
  { value: 'PENDING' as RegistrationStatus, label: 'Ожидание', color: 'text-yellow-300', bgColor: 'bg-yellow-900/30' },
  { value: 'CANCELLED_BEFORE_PAYMENT' as RegistrationStatus, label: 'Отменена до оплаты', color: 'text-red-300', bgColor: 'bg-red-900/30' },
  { value: 'CONFIRMED' as RegistrationStatus, label: 'Подтверждено', color: 'text-green-300', bgColor: 'bg-green-900/30' },
  { value: 'REFUNDED' as RegistrationStatus, label: 'Возврат', color: 'text-purple-300', bgColor: 'bg-purple-900/30' },
];

// Все статусы для отображения в фильтрах
export const allStatusOptions = [
  { value: 'PENDING' as RegistrationStatus, label: 'Ожидание', color: 'text-yellow-300', bgColor: 'bg-yellow-900/30' },
  { value: 'INVITED' as RegistrationStatus, label: 'Приглашён', color: 'text-blue-300', bgColor: 'bg-blue-900/30' },
  { value: 'CONFIRMED' as RegistrationStatus, label: 'Подтверждено', color: 'text-green-300', bgColor: 'bg-green-900/30' },
  { value: 'CANCELLED_BEFORE_PAYMENT' as RegistrationStatus, label: 'Отменена до оплаты', color: 'text-red-300', bgColor: 'bg-red-900/30' },
  { value: 'REFUNDED' as RegistrationStatus, label: 'Возврат', color: 'text-purple-300', bgColor: 'bg-purple-900/30' },
  { value: 'CANCELLED' as RegistrationStatus, label: 'Отменена', color: 'text-red-300', bgColor: 'bg-red-900/30' },
  { value: 'LEFT' as RegistrationStatus, label: 'Покинул', color: 'text-gray-300', bgColor: 'bg-gray-900/30' },
];

export const paymentStatusOptions = [
  { value: 'pending', label: 'Ожидает', color: 'text-yellow-400', icon: 'Clock' },
  { value: 'succeeded', label: 'Успешно', color: 'text-green-400', icon: 'CheckCircle' },
  { value: 'canceled', label: 'Отменено', color: 'text-red-400', icon: 'XCircle' },
  { value: 'refunded', label: 'Возврат', color: 'text-purple-400', icon: 'RotateCcw' },
];

// API согласно swagger.json
export const registrationsApi = {
  // Получение регистраций с фильтрацией (из swagger.json)
  filter: async (filter: AdminFilterRegistration): Promise<RegistrationWithPayments[]> => {
    const response = await api.post<RegistrationWithPayments[]>('/admin/registrations/filter', filter);
    return response.data;
  },

  // Обновление статуса регистрации (из swagger.json)
  updateStatus: async (userId: string, eventId: string, statusUpdate: RegistrationStatusUpdate): Promise<RegistrationWithPayments> => {
    const response = await api.patch<RegistrationWithPayments>(`/admin/registrations/${userId}/${eventId}/status`, statusUpdate);
    return response.data;
  },

  getEventOptions: async (): Promise<EventOption[]> => {
    const response = await api.post<Event[]>('/admin/events/filter', {});
    return response.data.map((event) => ({
      id: event.id,
      name: event.name,
      type: event.type,
      startTime: event.startTime,
      endTime: event.endTime,
    }));
  },

  getTournamentOptions: async (): Promise<TournamentOption[]> => {
    // Получаем все события (игры и турниры)
    const response = await api.post<Event[]>('/admin/events/filter', {});
    return response.data.map((event) => ({
      id: event.id,
      name: event.name,
      startTime: event.startTime,
      endTime: event.endTime,
    }));
  },

  // Поиск пользователей через admin/users API
  getUserOptions: async (telegramUsername: string): Promise<UserOption[]> => {
    const response = await api.post<UserOption[]>('/admin/users/filter', { 
      telegramUsername: telegramUsername 
    });
    return response.data;
  },

  searchUsers: async (request: UserSearchRequest): Promise<UserOption[]> => {
    const response = await api.post('/admin/users/filter', request);
    return response.data;
  },
}; 