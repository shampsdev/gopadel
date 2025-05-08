export type Tournament = {
  id: string // UUID
  name: string
  start_time: string // ISO date string
  price: number
  location: string
  rank_min: number
  rank_max: number
  max_users: number
  current_users: number // Number of current registrations
  organizer: string // Name of the organizer
}
