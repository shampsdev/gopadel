from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class WaitlistUser(BaseModel):
    """Упрощенная модель пользователя для waitlist"""

    id: UUID
    first_name: str
    second_name: str
    rank: float
    avatar: Optional[str] = None

    class Config:
        from_attributes = True


class WaitlistResponse(BaseModel):
    id: int
    user_id: UUID
    tournament_id: UUID
    date: datetime
    user: WaitlistUser

    class Config:
        from_attributes = True
