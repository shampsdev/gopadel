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
}
