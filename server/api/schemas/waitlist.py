from datetime import datetime
from uuid import UUID

from api.schemas.user import UserBase
from pydantic import BaseModel


class WaitlistResponse(BaseModel):
    id: int
    user_id: UUID
    tournament_id: UUID
    date: datetime
    user: UserBase

    class Config:
        from_attributes = True
