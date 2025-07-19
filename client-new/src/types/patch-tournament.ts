import type { TournamentResult } from "./event-result.type";

export interface PatchTournament {
  courtId?: string;
  description?: string;
  endTime?: string;
  maxUsers?: number;
  name?: string;
  price?: number;
  rankMax?: number;
  rankMin?: number;
  startTime?: string;
  tournamentType?: string;
  data?: {
    result: TournamentResult;
  };
}
