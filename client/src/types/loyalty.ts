export interface Loyalty {
  id: number
  name: string
  discount: number
}

export interface LoyaltyResponse {
  id: number
  name: string
  discount: number
  description: string | null
  requirements: {
    text: string
    benefits: string[]
  } | null
}

export interface LoyaltyDetails extends Loyalty {
  description: string
  requirements: string
  benefits: string[]
}
