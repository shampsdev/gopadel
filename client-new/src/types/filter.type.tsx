import type { EventStatus } from "./event-status.type";
import type { EventType } from "./event-type.type";

export interface FilterEvent {
  clubId?: string;
  filterByUserClubs?: string;
  id?: string;
  name?: string;
  notCompleted?: boolean;
  notFull?: boolean;
  organizerId?: string;
  statuses?: EventStatus[];
  type?: EventType;
}

export interface FilterClub {
  id?: string;
  name?: string;
}

export interface FilterUser {
  filterByUserClubs?: string;
  firstName?: string;
  id?: string;
  lastName?: string;
  telegramId?: number;
  telegramUsername?: string;
}
