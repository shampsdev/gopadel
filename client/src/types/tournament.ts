import { Registration } from "./registration"
import { UserBase } from "./user"

export type Club = {
  id: string
  name: string
  address: string
}

export type Tournament = {
  id: string // UUID
  name: string
  start_time: string // ISO date string
  end_time?: string | null // ISO date string, optional
  price: number
  club: Club
  tournament_type: string
  rank_min: number
  rank_max: number
  max_users: number
  current_users: number // Number of current registrations
  description?: string | null // Optional text description
  organizer: string // Name of the organizer
  registrations?: Registration[]
  organizator: UserBase
  is_finished: boolean
}

export type Participant = {
  id: string
  first_name: string
  second_name: string
  avatar: string | null
}
