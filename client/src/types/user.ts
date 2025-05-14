import { Loyalty } from "@/types/loyalty"
import { Registration } from "@/types/registration"
import { Waitlist } from "@/types/waitlist"

export type User = {
  id: string // UUID in TypeScript is represented as string
  telegram_id: number
  username: string
  first_name: string
  second_name: string
  avatar: string
  rank: number
  city: string
  birth_date_ru: string | null
  loyalty_id: number
  is_registered: boolean

  // Relations
  loyalty: Loyalty
  registrations?: Registration[]
  waitlist_entries?: Waitlist[]
}
