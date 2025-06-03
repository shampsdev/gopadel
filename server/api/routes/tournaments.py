from typing import List, Optional
from uuid import UUID

from api.deps import SessionDep, UserDep
from api.schemas.registration import RegistrationResponse
from api.schemas.tournament import (
    ParticipantResponse,
    RegistrationWithTournamentResponse,
    TournamentResponse,
)
from db.models.registration import RegistrationStatus
from fastapi import APIRouter, HTTPException
from repositories import registration_repository, tournament_repository

router = APIRouter()


@router.get("", response_model=List[TournamentResponse])
async def get_tournaments(
    db: SessionDep, user: UserDep, available: Optional[bool] = None
):
    if available:
        tournaments = tournament_repository.get_available_tournaments(db, user)
    else:
        tournaments = tournament_repository.get_tournaments(db)

    return tournaments


@router.get("/my", response_model=List[RegistrationWithTournamentResponse])
async def get_user_tournament_history(db: SessionDep, user: UserDep):
    registrations = registration_repository.get_user_registrations_with_relations(
        db, user.id
    )
    return registrations


@router.get("/{tournament_id}", response_model=TournamentResponse)
async def get_tournament(db: SessionDep, tournament_id: UUID, user: UserDep):
    tournament = tournament_repository.get(db, tournament_id)

    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    return tournament


@router.get(
    "/{tournament_id}/registration", response_model=Optional[RegistrationResponse]
)
async def get_tournament_registration(
    db: SessionDep, tournament_id: UUID, user: UserDep
):
    registration = registration_repository.get_user_tournament_registration(
        db, user.id, tournament_id
    )
    return registration


@router.get("/{tournament_id}/participants", response_model=List[ParticipantResponse])
async def get_tournament_participants(db: SessionDep, tournament_id: UUID):
    registrations = registration_repository.get_tournament_registrations(
        db, tournament_id
    )

    # Return all registrations (including PENDING) to show their status
    return registrations
