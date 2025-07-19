import type { User } from "./user.type";

export interface WaitlistItem {
  date: string;
  eventId: string;
  id: number;
  user: User;
  userId: string;
}

export interface WaitlistUserItem {
  date: string;
  user: User;
}

export type WaitlistUser = WaitlistUserItem[];

export type Waitlist = WaitlistItem[];
