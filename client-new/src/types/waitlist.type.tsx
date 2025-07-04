import type { User } from "./user.type";

export interface WaitlistItem {
  date: string;
  user: User;
}

export type Waitlist = WaitlistItem[];
