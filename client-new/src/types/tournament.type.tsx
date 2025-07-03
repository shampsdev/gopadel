import type { Club } from "./club.type";
import type { Registration } from "./registration.type";
import type { User } from "./user.type";

export interface Tournament {
  organizer: any;
  date: string;
  location: any;
  type: string;
  playersCapacity: number;
  playersAmount: number;
  club: Club;
  description: string;
  endTime: string;
  id: string;
  maxUsers: number;
  name: string;
  organizator: User;
  participants: Registration[];
  price: number;
  rankMax: number;
  rankMin: number;
  startTime: string;
  tournamentType: string;
}
