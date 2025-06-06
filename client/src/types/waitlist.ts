// Упрощенная модель пользователя для waitlist
export type WaitlistUser = {
  id: string // UUID
  first_name: string
  second_name: string
  rank: number
  avatar: string | null
}

export type Waitlist = {
  id: number
  user_id: string // UUID
  tournament_id: string // UUID
  date: string // ISO date string
  user: WaitlistUser
}
