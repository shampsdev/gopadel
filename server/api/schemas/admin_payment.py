from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel


class UserInfo(BaseModel):
    id: str
    first_name: str
    second_name: str
    city: Optional[str] = None


class TournamentInfo(BaseModel):
    id: str
    name: str


class RegistrationInfo(BaseModel):
    id: str
    user_id: str
    tournament_id: str
    status: str
    date: datetime
    user: Optional[UserInfo] = None
    tournament: Optional[TournamentInfo] = None


class PaymentBase(BaseModel):
    id: UUID
    amount: float
    status: str
    payment_link: Optional[str] = None
    date: datetime


class PaymentWithRegistration(PaymentBase):
    registration: Optional[RegistrationInfo] = None

    class Config:
        from_attributes = True


class PaymentResponse(BaseModel):
    payments: List[PaymentWithRegistration]
    total: int
