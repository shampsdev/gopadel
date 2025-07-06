export interface User {
  id: string;
  telegramId: number;
  telegramUsername: string;
  firstName: string;
  lastName: string;
  avatar: string;
  bio: string;
  rank: number;
  city: string;
  birthDate: string;
  playingPosition: string;
  padelProfiles: string;
  isRegistered: boolean;
  loyalty?: Loyalty;
}

export interface Loyalty {
  id: number;
  name: string;
  discount: number;
  description: string;
  requirements: string;
}

export interface FilterUser {
  id?: string;
  telegramId?: number;
  firstName?: string;
  lastName?: string;
}

export interface AdminPatchUser {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  rank?: number;
  city?: string;
  birthDate?: string;
  playingPosition?: string;
  padelProfiles?: string;
  isRegistered?: boolean;
  loyaltyId?: number;
} 