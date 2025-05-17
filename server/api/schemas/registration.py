from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from api.schemas.payment import PaymentBase
from api.schemas.user import UserBase


class RegistrationResponse(BaseModel):
    id: UUID
    payment: Optional[PaymentBase]
    user_id: UUID
    user: UserBase
