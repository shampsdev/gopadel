import type { Game } from "./game.type";
import type { Tournament } from "./tournament.type";
import type { RegistrationStatus } from "./registration-status";
import type { User } from "./user.type";

export interface Registration {
  createdAt: string;
  event: Tournament | Game;
  eventId: string;
  status: RegistrationStatus;
  updatedAt: string;
  user: User;
  userId: string;
}
