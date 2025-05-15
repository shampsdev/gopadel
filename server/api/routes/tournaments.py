from typing import List, Optional
from fastapi import APIRouter, HTTPException

from api.deps import SessionDep, UserDep
from api.schemas.tournament import TournamentResponse, ParticipantResponse
from db.crud import tournament as tournament_crud
from uuid import UUID

router = APIRouter()


@router.get("", response_model=List[TournamentResponse])
async def get_tournaments(
    db: SessionDep, user: UserDep, available: Optional[bool] = None
):
    tournaments = tournament_crud.get_tournaments_with_participants(
        db, user.rank, available
    )
    return tournaments


@router.get("/{tournament_id}", response_model=TournamentResponse)
async def get_tournament(db: SessionDep, tournament_id: UUID):
    tournament = tournament_crud.get_tournament_with_participants_by_id(
        db, tournament_id
    )

    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    return tournament


@router.get("/{tournament_id}/participants", response_model=List[ParticipantResponse])
async def get_tournament_participants(db: SessionDep, tournament_id: UUID):
    tournament = tournament_crud.get_tournament_with_participants_by_id(
        db, tournament_id
    )

    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    return tournament.registrations
