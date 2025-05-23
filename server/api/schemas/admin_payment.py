from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel


class UserInfo(BaseModel):
    id: str
    first_name: str
    second_name: str
    city: str


class TournamentInfo(BaseModel):
    id: str
    name: str


class RegistrationInfo(BaseModel):
    id: str
    user_id: str
    tournament_id: str
    status: str
    user: Optional[UserInfo] = None
    tournament: Optional[TournamentInfo] = None


class PaymentBase(BaseModel):
    id: str
    payment_id: str
    date: datetime
    amount: int
    payment_link: str
    status: str


class PaymentWithRegistration(PaymentBase):
    registration: Optional[RegistrationInfo] = None

    class Config:
        from_attributes = True


class PaymentResponse(BaseModel):
    payments: List[PaymentWithRegistration]
    total: int
