from pydantic import BaseModel, Field, computed_field
from datetime import datetime
from typing import List
from uuid import UUID


class UserBase(BaseModel):
    id: UUID
    first_name: str
    second_name: str
    avatar: str



class ParticipantResponse(BaseModel):
    user: UserBase


class RegistrationBase(BaseModel):
    user: UserBase



class TournamentBase(BaseModel):
    id: UUID
    name: str
    start_time: datetime
    price: int
    location: str
    rank_min: float
    rank_max: float
    max_users: int



class TournamentResponse(TournamentBase):
    registrations: List[RegistrationBase] = []
    
    @computed_field
    def current_users(self) -> int:
        return len(self.registrations)
    
