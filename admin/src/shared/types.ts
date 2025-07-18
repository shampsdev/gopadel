export interface Court {
  id: string
  name: string
  address: string
}

export interface Event {
  id: string
  name: string
  startTime: string
  endTime?: string
  price: number
  courtId: string
  type: 'game' | 'tournament' | 'training'
  rankMin: number
  rankMax: number
  maxUsers: number
  description?: string
  organizerId: string
  clubId?: string
  status: 'registration' | 'full' | 'completed' | 'cancelled'
  data?: Record<string, unknown>
}

// Обратная совместимость
export interface Tournament {
  id?: number
  name: string
  start_time: string
  end_time?: string
  price: number
  court_id: string
  tournament_type: string
  rank_min: number
  rank_max: number
  max_users: number
  description?: string
  organizator_id: string // UUID
}

export interface User {
  id: string
  telegram_id: number
  username?: string
  first_name: string
  second_name: string
  avatar: string
  rank: number
  city: string
  birth_date?: string
  birth_date_ru?: string
  playing_position?: 'right' | 'left' | 'both'
  padel_profiles?: string
  bio: string
  loyalty_id: number
  loyalty?: Loyalty
  is_registered: boolean
}

export interface Loyalty {
  id?: number
  name: string
  discount: number
  description?: string
  requirements?: Record<string, unknown>
  users_count?: number
}

export interface Payment {
  id: string
  amount: number
  status: string
  created_at: string
}

export enum RegistrationStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  CANCELED = 'canceled',
  CANCELED_BY_USER = 'canceled_by_user'
}

export interface Participant {
  id: string
  user_id: string
  event_id: string
  tournament_id?: string // Обратная совместимость
  date: string | undefined
  status: string
  user: User
  payment?: Payment
}

export interface WaitlistEntry {
  id: number
  user_id: string
  event_id: string
  tournament_id?: string // Обратная совместимость
  date: string
  user: User
}

// Упрощенная модель пользователя для списка
export interface UserListItem {
  id: string
  telegram_id: number
  username?: string
  first_name: string
  second_name: string
  avatar?: string
  city: string
  rank: number
  is_registered: boolean
}

export interface Club {
  id: string
  name: string
  description?: string
  createdAt: string
  userCount?: number
}

export interface CreateClub {
  id: string
  name: string
  description?: string
}

export interface PatchClub {
  name?: string
  description?: string
}
