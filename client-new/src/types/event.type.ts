import type { Court } from "./court.type";
import type { EventResult } from "./event-result.type";
import type { EventStatus } from "./event-status.type";
import type { EventType } from "./event-type.type";
import type { Registration } from "./registration.type";
import type { User } from "./user.type";

export interface Event {
  clubId: string;
  court: Court;
  data?: {
    result: EventResult;
  };
  description: string;
  endTime: string;
  id: string;
  maxUsers: number;
  name: string;
  organizer: User;
  participants: Registration[];
  price: number;
  rankMax: number;
  rankMin: number;
  startTime: string;
  status: EventStatus;
  type: EventType;
  updatedAt: string;
}
