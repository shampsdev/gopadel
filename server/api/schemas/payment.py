from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class PaymentBase(BaseModel):
    id: UUID
    payment_id: str
    amount: int
    status: str
    payment_link: str
    confirmation_token: str
    date: datetime

    class Config:
        from_attributes = True
