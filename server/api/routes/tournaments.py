from datetime import datetime
from typing import List, Optional

from api.deps import SessionDep, UserDep
from db.models.registration import Registration
from db.models.tournament import Tournament
from db.models.user import User
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class ParticipantResponse(BaseModel):
    id: str
    first_name: str
    second_name: str
    avatar: str


class TournamentResponse(BaseModel):
    id: str
    name: str
    start_time: datetime
    price: int
    location: str
    rank_min: float
    rank_max: float
    max_users: int
    current_users: int = 0
    organizer: str = ""
    participants: List[ParticipantResponse] = []


@router.get("", response_model=List[TournamentResponse])
async def get_tournaments(
    db: SessionDep, user: UserDep, available: Optional[bool] = None
):
    if available is not None:
        query = db.query(Tournament)
        if available:
            query = query.filter(
                Tournament.rank_min <= user.rank, Tournament.rank_max >= user.rank
            )
        tournaments = query.all()
    else:
        tournaments = db.query(Tournament).all()

    result = []

    # Add participants to each tournament
    for tournament in tournaments:
        registrations = (
            db.query(Registration)
            .filter(Registration.tournament_id == tournament.id)
            .all()
        )
        user_ids = [reg.user_id for reg in registrations]
        participants = db.query(User).filter(User.id.in_(user_ids)).all()

        # Create response object with participants
        tournament_response = TournamentResponse(
            id=str(tournament.id),
            name=tournament.name,
            start_time=tournament.start_time,
            price=tournament.price,
            location=tournament.location,
            rank_min=tournament.rank_min,
            rank_max=tournament.rank_max,
            max_users=tournament.max_users,
            current_users=len(registrations),
            organizer="Russian Padel",  # Hardcoded for now, replace with actual data if available
            participants=[
                ParticipantResponse(
                    id=str(user.id),
                    first_name=user.first_name,
                    second_name=user.second_name,
                    avatar=user.avatar,
                )
                for user in participants
            ],
        )

        result.append(tournament_response)

    return result


@router.get("/{tournament_id}", response_model=TournamentResponse)
async def get_tournament(db: SessionDep, tournament_id: str):
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()

    if tournament:
        # Get participants for this tournament
        registrations = (
            db.query(Registration)
            .filter(Registration.tournament_id == tournament.id)
            .all()
        )
        user_ids = [reg.user_id for reg in registrations]
        participants = db.query(User).filter(User.id.in_(user_ids)).all()

        # Create response object with participants
        return TournamentResponse(
            id=str(tournament.id),
            name=tournament.name,
            start_time=tournament.start_time,
            price=tournament.price,
            location=tournament.location,
            rank_min=tournament.rank_min,
            rank_max=tournament.rank_max,
            max_users=tournament.max_users,
            current_users=len(registrations),
            organizer="Russian Padel",  # Hardcoded for now, replace with actual data if available
            participants=[
                ParticipantResponse(
                    id=str(user.id),
                    first_name=user.first_name,
                    second_name=user.second_name,
                    avatar=user.avatar,
                )
                for user in participants
            ],
        )

    return None


@router.get("/{tournament_id}/participants", response_model=List[ParticipantResponse])
async def get_tournament_participants(db: SessionDep, tournament_id: str):
    # Get actual participants from the database
    registrations = (
        db.query(Registration).filter(Registration.tournament_id == tournament_id).all()
    )
    user_ids = [reg.user_id for reg in registrations]
    participants = db.query(User).filter(User.id.in_(user_ids)).all()

    return [
        ParticipantResponse(
            id=str(user.id),
            first_name=user.first_name,
            second_name=user.second_name,
            avatar=user.avatar,
        )
        for user in participants
    ]
