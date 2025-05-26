import { Payment } from "./Payment"
import { Tournament } from "./tournament"
import { User } from "./user"

export enum RegistrationStatus {
  PENDING = "pending",
  ACTIVE = "active",
  CANCELED = "canceled",
  CANCELED_BY_USER = "canceled_by_user",
}

export interface Registration {
  id: string // UUID
  user_id: string // UUID
  tournament_id: string // UUID
  date: string // ISO date string
  status: RegistrationStatus
  payment_id: string // UUID
  payment: Payment
  user: User
}

export interface RegistrationWithTournament extends Registration {
  tournament: Tournament
}
