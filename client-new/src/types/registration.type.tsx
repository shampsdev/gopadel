import type { Event } from "./event.type";
import type { RegistrationStatus } from "./registration-status";
import type { User } from "./user.type";

export interface Registration {
  createdAt: string;
  event: Event;
  eventId: string;
  status: RegistrationStatus;
  updatedAt: string;
  user: User;
  userId: string;
}
