import type { EventStatus } from "./event-status.type";

export interface PatchEvent {
  clubId?: string;
  courtId?: string;
  description?: string;
  endTime?: string;
  maxUsers?: number;
  name?: string;
  organizerId?: string;
  price?: number;
  rankMax?: number;
  rankMin?: number;
  startTime?: string;
  status?: EventStatus;
  data?: {
    [key: string]: any;
  };
}
