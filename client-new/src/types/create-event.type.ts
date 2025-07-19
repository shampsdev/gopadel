import type { EventType } from "./event-type.type";

export interface CreateEvent {
  clubId: string;
  courtId: string;
  description: string;
  endTime: string;
  maxUsers: number;
  name: string;
  organizerId: string;
  price: number;
  rankMax: number;
  rankMin: number;
  startTime: string;
  type: EventType;
  data?: {
    [key: string]: any;
  };
}

export interface CreateTournament extends CreateEvent {
  data?: {
    tournament: {
      type: string;
    };
  };
}

export interface CreateGame extends CreateEvent {
  data?: {
    game: {
      type: string;
    };
  };
}
