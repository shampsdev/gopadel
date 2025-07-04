export interface CreateTournament {
  courtId: string;
  description: string;
  endTime: string;
  maxUsers: number;
  name: string;
  organizatorId: string;
  price: number;
  rankMax: number;
  rankMin: number;
  startTime: string;
  tournamentType: string;
}
