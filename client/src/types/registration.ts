import { Payment } from "./Payment"
import { User } from "./user"

export interface Registration {
  id: string // UUID
  user_id: string // UUID
  tournament_id: string // UUID
  date: string // ISO date string
  status: string
  payment_id: string // UUID
  payment: Payment
  user: User
}
