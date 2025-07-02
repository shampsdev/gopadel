import type { Tournament } from "./tournament.type";
import type { User } from "./user.type";

export interface Registration {
  status: RegistrationStatus;
  date: string;
  id: string;
  statis: RegistrationStatus;
  tournament: Tournament;
  tournamentId: string;
  user: User;
  userId: string;
}

export type RegistrationStatus =
  | "PENDING"
  | "ACTIVE"
  | "CANCELLED"
  | "CANCELLED_BY_USER";
