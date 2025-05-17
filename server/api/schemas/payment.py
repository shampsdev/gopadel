from pydantic import BaseModel
from uuid import UUID


class PaymentBase(BaseModel):
    id: UUID
    amount: float
    status: str
    payment_link: str
