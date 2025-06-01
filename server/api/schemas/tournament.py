from datetime import datetime
from typing import List, Optional
from uuid import UUID
from zoneinfo import ZoneInfo

from api.schemas.club import Club
from api.schemas.registration import RegistrationBase, RegistrationResponse
from db.models.registration import RegistrationStatus
from pydantic import BaseModel, computed_field


class UserBase(BaseModel):
    id: UUID
    first_name: str
    second_name: str
    avatar: Optional[str] = None
    rank: float
    username: Optional[str] = None


class ParticipantResponse(BaseModel):
    user: UserBase
    status: RegistrationStatus


class TournamentBase(BaseModel):
    id: UUID
    name: str
    start_time: datetime
    end_time: Optional[datetime] = None
    price: int
    club: Club
    tournament_type: str
    rank_min: float
    rank_max: float
    max_users: int
    description: Optional[str] = None
    organizator: UserBase

    @computed_field
    def is_finished(self) -> bool:
        now = datetime.now(ZoneInfo("Europe/Moscow"))
        naive_now = now.replace(tzinfo=None)
        # If end_time is specified, use it; otherwise use start_time
        finish_time = self.end_time if self.end_time else self.start_time
        return finish_time < naive_now


class TournamentResponse(TournamentBase):
    registrations: List[RegistrationBase] = []

    @computed_field
    def current_users(self) -> int:
        return len(
            list(
                filter(
                    lambda x: x.status
                    in [RegistrationStatus.ACTIVE, RegistrationStatus.PENDING],
                    self.registrations,
                )
            )
        )


class RegistrationWithTournamentResponse(RegistrationResponse):
    tournament: TournamentBase
