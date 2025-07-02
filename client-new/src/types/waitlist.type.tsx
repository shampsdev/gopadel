import type { Tournament } from "./tournament.type";
import type { User } from "./user.type";

export interface Waitlist {
  date: string;
  id: number;
  tournament: Tournament;
  tournamentId: string;
  user: User;
  userId: string;
}
