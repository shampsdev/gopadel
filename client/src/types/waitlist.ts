import { User } from "./user"

export type Waitlist = {
  id: number
  user_id: string // UUID
  tournament_id: string // UUID
  date: string // ISO date string
  user: User
}
