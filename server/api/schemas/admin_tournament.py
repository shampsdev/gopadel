from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel


class TournamentCreate(BaseModel):
    name: str
    start_time: datetime
    price: int
    location: str
    rank_min: float
    rank_max: float
    max_users: int


class TournamentUpdate(BaseModel):
    name: Optional[str] = None
    start_time: Optional[datetime] = None
    price: Optional[int] = None
    location: Optional[str] = None
    rank_min: Optional[float] = None
    rank_max: Optional[float] = None
    max_users: Optional[int] = None


class AdminTournamentResponse(BaseModel):
    id: UUID
    name: str
    start_time: datetime
    price: int
    location: str
    rank_min: float
    rank_max: float
    max_users: int
    registrations_count: int

    class Config:
        from_attributes = True
