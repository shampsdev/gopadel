// Базовые типы и интерфейсы для всего приложения

// Типы событий
export type EventType = 'game' | 'tournament' | 'training';

// Статусы событий
export type EventStatus = 'registration' | 'full' | 'completed' | 'cancelled';

// Статусы регистрации
export type RegistrationStatus = 
  | 'PENDING'
  | 'INVITED' 
  | 'CONFIRMED'
  | 'CANCELLED_BEFORE_PAYMENT'
  | 'CANCELLED_AFTER_PAYMENT'
  | 'REFUNDED'
  | 'CANCELLED'
  | 'LEFT';

// Позиция игрока
export type PlayingPosition = 'right' | 'left' | 'both';

// Базовая модель корта
export interface Court {
  id: string;
  name: string;
  address: string;
}

// Базовая модель лояльности
export interface Loyalty {
  id: number;
  name: string;
  discount: number;
  description: string;
  requirements: string;
}

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
  loyalty?: Loyalty;
}

// Базовая модель события
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
  data?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Базовая модель регистрации
export interface Registration {
  userId: string;
  eventId: string;
  status: RegistrationStatus;
  createdAt: string;
  updatedAt: string;
  user?: User;
  event?: Event;
}

// Базовая модель платежа
export interface Payment {
  id: string;
  paymentId: string;
  date: string;
  amount: number;
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled';
  paymentLink?: string;
  confirmationToken?: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
  eventId?: string;
  registration?: Registration;
}

// Базовая модель клуба
export interface Club {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  userCount?: number;
}

// Модель пользователя из списка ожидания
export interface WaitlistUser {
  user: User;
  date: string;
}

// CRUD интерфейсы для создания/обновления

export interface CreateClub {
  id: string;
  name: string;
  description?: string;
}

export interface PatchClub {
  name?: string;
  description?: string;
}

export interface CreateCourt {
  name: string;
  address: string;
}

export interface PatchCourt {
  name?: string;
  address?: string;
}
