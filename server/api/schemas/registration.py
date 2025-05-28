from datetime import datetime
from typing import Optional
from uuid import UUID

from api.schemas.payment import PaymentBase
from api.schemas.user import UserBase
from db.models.registration import RegistrationStatus
from pydantic import BaseModel


class RegistrationBase(BaseModel):
    id: UUID
    user_id: UUID
    user: UserBase
    status: RegistrationStatus
    date: datetime


class RegistrationResponse(RegistrationBase):
    payment: Optional[PaymentBase]
