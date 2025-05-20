import { Payment } from "./Payment"
import { User } from "./user"

export enum RegistrationStatus {
  PENDING = "pending",
  ACTIVE = "active",
  CANCELED = "canceled",
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
