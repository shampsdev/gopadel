from datetime import datetime
from typing import List, Optional
from uuid import UUID

from api.schemas.payment import PaymentBase
from api.schemas.user import UserBase
from db.models.registration import RegistrationStatus
from pydantic import BaseModel, computed_field


class RegistrationBase(BaseModel):
    id: UUID
    user_id: UUID
    user: UserBase
    status: RegistrationStatus
    date: datetime


class RegistrationResponse(RegistrationBase):
    payments: List[PaymentBase] = []

    @computed_field
    @property
    def payment(self) -> Optional[PaymentBase]:
        """Backward compatibility: return the latest active payment"""
        if not self.payments:
            return None

        # Find the latest non-canceled payment
        active_payments = [p for p in self.payments if p.status != "canceled"]
        if active_payments:
            return max(active_payments, key=lambda x: x.id)

        # If no active payments, return the latest one
        return max(self.payments, key=lambda x: x.id) if self.payments else None


# Admin schemas with simplified models
class AdminUserInfo(BaseModel):
    id: UUID
    first_name: str
    second_name: str
    city: str
    username: Optional[str] = None

    class Config:
        from_attributes = True


class AdminTournamentInfo(BaseModel):
    id: UUID
    name: str

    class Config:
        from_attributes = True


class AdminRegistrationResponse(BaseModel):
    id: UUID
    user_id: UUID
    tournament_id: UUID
    status: RegistrationStatus
    date: datetime
    user: Optional[AdminUserInfo] = None
    tournament: Optional[AdminTournamentInfo] = None
    payments: List[PaymentBase] = []

    class Config:
        from_attributes = True
