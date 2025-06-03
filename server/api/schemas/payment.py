from uuid import UUID

from pydantic import BaseModel


class PaymentBase(BaseModel):
    id: UUID
    payment_id: str
    amount: float
    status: str
    payment_link: str
    confirmation_token: str
