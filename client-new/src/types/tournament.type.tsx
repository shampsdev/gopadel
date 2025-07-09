import type { Court } from "./court.type";
import type { Registration } from "./registration.type";
import type { TournamentResult } from "./tournament-result.type";
import type { User } from "./user.type";

export interface Tournament {
  date: string;
  playersCapacity: number;
  playersAmount: number;
  court: Court;
  description: string;
  endTime: string;
  id: string;
  maxUsers: number;
  name: string;
  organizator: User;
  participants: Registration[];
  price: number;
  rankMax: number;
  rankMin: number;
  startTime: string;
  tournamentType: string;
  data?: {
    result: TournamentResult;
  };
}
