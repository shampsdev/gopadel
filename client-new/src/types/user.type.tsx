import type { Loyalty } from "./loyalty.type";
import type { PlayingPosition } from "./playing-position.type";

export interface User {
  avatar: string;
  bio: string;
  birthDate: string;
  city: string;
  firstName: string;
  lastName: string;
  id: string;
  isRegistered: boolean;
  loyalty: Loyalty;
  padelProfiles: string;
  playingPosition: PlayingPosition;
  rank: number;
  telegramId: number;
  telegramUsername: string;
}
