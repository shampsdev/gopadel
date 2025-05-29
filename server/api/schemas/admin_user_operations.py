from datetime import date
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class UserUpdateByAdmin(BaseModel):
    first_name: Optional[str] = None
    second_name: Optional[str] = None
    birth_date: Optional[date] = None
    city: Optional[str] = None
    rank: Optional[float] = None
    playing_position: Optional[str] = None
    padel_profiles: Optional[str] = None
    is_registered: Optional[bool] = None
    loyalty_id: Optional[int] = None
    avatar: Optional[str] = None


class UserResponse(BaseModel):
    id: UUID
    telegram_id: int
    username: Optional[str] = None
    first_name: str
    second_name: str
    avatar: str
    rank: float
    city: str
    birth_date: Optional[date] = None
    birth_date_ru: Optional[str] = None
    playing_position: Optional[str] = None
    padel_profiles: Optional[str] = None
    loyalty_id: int
    is_registered: bool

    class Config:
        from_attributes = True
