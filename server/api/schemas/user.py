from datetime import date
from typing import Optional
from pydantic import BaseModel
from uuid import UUID


class Loyalty(BaseModel):
    id: int
    name: str
    discount: float

class UserBase(BaseModel):
    id: UUID
    username: str | None
    first_name: str
    second_name: str
    avatar: str
    rank: float
    city: str
    birth_date: date | None
    loyalty_id: int
    loyalty: Loyalty
    is_registered: bool


class UserRegister(BaseModel):
    first_name: str
    second_name: str
    birth_date: date | None
    city: str
    rank: float


class UserUpdate(BaseModel):
    first_name: str
    second_name: str
    birth_date: date | None
    city: str
    rank: float
