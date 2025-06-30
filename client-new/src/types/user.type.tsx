import type { Loyalty } from "./loyalty.type";
import type { PlayingPosition } from "./playing-position.type";

export interface User {
  avatar: string;
  bio: string;
  birth_data: string;
  city: string;
  firstName: string;
  id: string;
  is_registered: boolean;
  loyalty: Loyalty;
  padel_profiles: string;
  playing_position: PlayingPosition;
  rank: number;
  telegramId: number;
  telegramUsername: string;
}
