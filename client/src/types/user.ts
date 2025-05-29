import { Loyalty } from "@/types/loyalty"
import { Registration } from "@/types/registration"
import { Waitlist } from "@/types/waitlist"

export type PlayingPosition = "right" | "left" | "both"

export type UserBase = {
  id: string // UUID in TypeScript is represented as string
  first_name: string
  second_name: string
  bio: string
  avatar: string | null
  username: string | null
  rank: number
  playing_position?: PlayingPosition | null
  padel_profiles?: string | null
}

export interface User {
  id: string // UUID in TypeScript is represented as string
  telegram_id: number
  username: string | null
  first_name: string
  second_name: string
  bio: string
  rank: number
  city: string
  birth_date: string | null
  birth_date_ru: string | null
  avatar: string | null
  playing_position?: PlayingPosition | null
  padel_profiles?: string | null
  loyalty_id: number
  is_registered: boolean

  // Relations
  loyalty: Loyalty
  registrations?: Registration[]
  waitlist_entries?: Waitlist[]
}
