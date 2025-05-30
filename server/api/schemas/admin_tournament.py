from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class TournamentCreate(BaseModel):
    name: str
    start_time: datetime
    end_time: Optional[datetime] = None
    price: int
    club_id: UUID
    tournament_type: str
    rank_min: float
    rank_max: float
    max_users: int
    description: Optional[str] = None
    organizator_id: Optional[UUID] = None


class TournamentUpdate(BaseModel):
    name: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    price: Optional[int] = None
    club_id: Optional[UUID] = None
    tournament_type: Optional[str] = None
    rank_min: Optional[float] = None
    rank_max: Optional[float] = None
    max_users: Optional[int] = None
    description: Optional[str] = None
    organizator_id: Optional[UUID] = None


class AdminTournamentResponse(BaseModel):
    id: UUID
    name: str
    start_time: datetime
    end_time: Optional[datetime] = None
    price: int
    club_id: UUID
    tournament_type: str
    rank_min: float
    rank_max: float
    max_users: int
    description: Optional[str] = None
    registrations_count: int
    organizator_id: UUID

    class Config:
        from_attributes = True
