export interface Tournament {
  id?: number;
  name: string;
  start_time: string;
  price: number;
  location: string;
  rank_min: number;
  rank_max: number;
  max_users: number;
} 

export interface User {
  id: string;
  telegram_id: number;
  username?: string;
  first_name: string;
  second_name: string;
  avatar: string;
  rank: number;
  city: string;
  birth_date?: string;
  birth_date_ru?: string;
  loyalty_id: number;
  loyalty?: Loyalty;
  is_registered: boolean;
} 

export interface Loyalty {
  id?: number;
  name: string;
  discount: number;
  description?: string;
  requirements?: Record<string, unknown>;
  users_count?: number;
} 