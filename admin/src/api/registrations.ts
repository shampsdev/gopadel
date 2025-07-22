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

// Расширенная модель регистрации с платежами
export interface RegistrationWithPayments extends Registration {
  // Убираем поля от базовой Registration и добавляем специфичные для админки
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

// Модель фильтра админских регистраций
export interface AdminFilterRegistration {
  id?: string;
  userId?: string;
  eventId?: string;
  status?: RegistrationStatus;
  userTelegramId?: number;
  userTelegramUsername?: string;
  userFirstName?: string;
  eventName?: string;
}

export const statusOptions = [
  { value: 'PENDING', label: 'Ожидает', color: 'text-yellow-400', icon: 'Clock' },
  { value: 'INVITED', label: 'Приглашён', color: 'text-blue-400', icon: 'Mail' },
  { value: 'CONFIRMED', label: 'Подтверждено', color: 'text-green-400', icon: 'CheckCircle' },
  { value: 'CANCELLED_BEFORE_PAYMENT', label: 'Отменено до оплаты', color: 'text-red-400', icon: 'XCircle' },
  { value: 'CANCELLED_AFTER_PAYMENT', label: 'Отменено после оплаты', color: 'text-red-400', icon: 'XCircle' },
  { value: 'REFUNDED', label: 'Возврат', color: 'text-purple-400', icon: 'RotateCcw' },
  { value: 'CANCELLED', label: 'Отклонено', color: 'text-red-400', icon: 'XCircle' },
  { value: 'LEFT', label: 'Покинул', color: 'text-gray-400', icon: 'LogOut' },
];

export const paymentStatusOptions = [
  { value: 'pending', label: 'Ожидает', color: 'text-yellow-400', icon: 'Clock' },
  { value: 'succeeded', label: 'Успешно', color: 'text-green-400', icon: 'CheckCircle' },
  { value: 'canceled', label: 'Отменено', color: 'text-red-400', icon: 'XCircle' },
  { value: 'refunded', label: 'Возврат', color: 'text-purple-400', icon: 'RotateCcw' },
];

// Новое API согласно swagger.json
export const registrationsApi = {
  // Получение всех регистраций пользователя (используем для получения всех через фильтр пользователей)
  getMyRegistrations: async (): Promise<RegistrationWithPayments[]> => {
    const response = await api.get<RegistrationWithPayments[]>('/registrations/my');
    return response.data;
  },

  // Фильтрация через API пользователей и событий (комбинированный подход)
  filter: async (filter: AdminFilterRegistration): Promise<RegistrationWithPayments[]> => {
    try {
      // Получаем все события через admin API
      const eventsResponse = await api.post('/admin/events/filter', {});
      const events = eventsResponse.data;
      
      const allRegistrations: RegistrationWithPayments[] = [];
      
      // Извлекаем участников из всех событий
      events.forEach((event: Event & { participants?: RegistrationWithPayments[] }) => {
        if (event.participants) {
          event.participants.forEach((participant: RegistrationWithPayments) => {
            allRegistrations.push({
              ...participant,
              event: event
            });
          });
        }
      });
      
      // Применяем фильтры
      let filteredRegistrations = allRegistrations;
      
      if (filter.eventId) {
        filteredRegistrations = filteredRegistrations.filter(reg => reg.eventId === filter.eventId);
      }
      
      if (filter.userId) {
        filteredRegistrations = filteredRegistrations.filter(reg => reg.userId === filter.userId);
      }
      
      if (filter.status) {
        filteredRegistrations = filteredRegistrations.filter(reg => reg.status === filter.status);
      }
      
      if (filter.userTelegramId) {
        filteredRegistrations = filteredRegistrations.filter(reg => 
          reg.user?.telegramId === filter.userTelegramId
        );
      }
      
      if (filter.userTelegramUsername) {
        filteredRegistrations = filteredRegistrations.filter(reg => 
          reg.user?.telegramUsername?.toLowerCase().includes(filter.userTelegramUsername!.toLowerCase())
        );
      }
      
      if (filter.userFirstName) {
        filteredRegistrations = filteredRegistrations.filter(reg => 
          reg.user?.firstName.toLowerCase().includes(filter.userFirstName!.toLowerCase())
        );
      }
      
      if (filter.eventName) {
        filteredRegistrations = filteredRegistrations.filter(reg => 
          reg.event?.name.toLowerCase().includes(filter.eventName!.toLowerCase())
        );
      }
      
      return filteredRegistrations;
    } catch (error) {
      console.error('Error filtering registrations:', error);
      return [];
    }
  },

  getAll: async (): Promise<RegistrationWithPayments[]> => {
    // Получаем все события и извлекаем из них участников
    try {
      const response = await api.post('/admin/events/filter', {});
      const events = response.data;
      
      const allRegistrations: RegistrationWithPayments[] = [];
      
      events.forEach((event: Event & { participants?: RegistrationWithPayments[] }) => {
        if (event.participants) {
          allRegistrations.push(...event.participants);
        }
      });
      
      return allRegistrations;
    } catch (error) {
      console.error('Error getting all registrations:', error);
      return [];
    }
  },

  // Обновление статуса пока недоступно в новом API
  // updateStatus: async (id: string, status: RegistrationStatus): Promise<RegistrationWithPayments> => {
  //   throw new Error('Обновление статуса регистрации не поддерживается в новом API');
  // },

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