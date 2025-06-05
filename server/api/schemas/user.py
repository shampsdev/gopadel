from datetime import date
from typing import Optional
from uuid import UUID

from db.models.user import PlayingPosition
from pydantic import BaseModel


class Loyalty(BaseModel):
    id: int
    name: str
    discount: float


class UserBase(BaseModel):
    id: UUID
    username: str | None
    first_name: str
    second_name: str
    bio: str = ""
    avatar: Optional[str] = None
    rank: float
    city: Optional[str] = None
    birth_date: date | None
    birth_date_ru: str | None
    playing_position: Optional[PlayingPosition] = None
    padel_profiles: Optional[str] = None
    loyalty_id: int
    loyalty: Loyalty
    is_registered: bool
    telegram_id: Optional[int] = None


class UserRegister(BaseModel):
    first_name: str
    second_name: str
    bio: str = ""
    rank: float
    city: Optional[str] = None
    birth_date: Optional[date] = None
    playing_position: Optional[PlayingPosition] = None
    padel_profiles: Optional[str] = None


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    second_name: Optional[str] = None
    bio: Optional[str] = None
    rank: Optional[float] = None
    city: Optional[str] = None
    birth_date: Optional[date] = None
    playing_position: Optional[PlayingPosition] = None
    padel_profiles: Optional[str] = None
