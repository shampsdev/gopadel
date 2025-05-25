from datetime import date
from pydantic import BaseModel
from uuid import UUID
from typing import Optional


class Loyalty(BaseModel):
    id: int
    name: str
    discount: float


class UserBase(BaseModel):
    id: UUID
    username: str | None
    first_name: str
    second_name: str
    avatar: Optional[str] = None
    rank: float
    city: str
    birth_date: date | None
    birth_date_ru: str | None
    loyalty_id: int
    loyalty: Loyalty
    is_registered: bool
    telegram_id: Optional[int] = None


class UserRegister(BaseModel):
    first_name: str
    second_name: str
    rank: float
    city: str
    birth_date: Optional[date] = None


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    second_name: Optional[str] = None
    rank: Optional[float] = None
    city: Optional[str] = None
    birth_date: Optional[date] = None
