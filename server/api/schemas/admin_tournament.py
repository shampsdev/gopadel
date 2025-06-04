from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, field_validator


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

    @field_validator("start_time", "end_time", mode="before")
    @classmethod
    def parse_datetime(cls, v):
        """Parse datetime as naive datetime (Moscow time)"""
        if v is None:
            return v
        if isinstance(v, datetime):
            return v.replace(tzinfo=None) if v.tzinfo else v
        if isinstance(v, str):
            dt_str = v.replace("Z", "").replace("+00:00", "")
            try:
                return datetime.fromisoformat(dt_str)
            except ValueError:
                return datetime.strptime(dt_str, "%Y-%m-%dT%H:%M:%S")
        return v


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

    @field_validator("start_time", "end_time", mode="before")
    @classmethod
    def parse_datetime(cls, v):
        """Parse datetime as naive datetime (Moscow time)"""
        if v is None:
            return v
        if isinstance(v, datetime):
            return v.replace(tzinfo=None) if v.tzinfo else v
        if isinstance(v, str):
            dt_str = v.replace("Z", "").replace("+00:00", "")
            try:
                return datetime.fromisoformat(dt_str)
            except ValueError:
                return datetime.strptime(dt_str, "%Y-%m-%dT%H:%M:%S")
        return v


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
