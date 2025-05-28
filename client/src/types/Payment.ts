export type Payment = {
  id: string
  payment_id: string
  confirmation_token: string

  amount: number
  status: string
  payment_link: string
}
