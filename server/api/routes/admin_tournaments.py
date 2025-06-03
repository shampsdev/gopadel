from typing import List, Optional
from uuid import UUID

from api.deps import SessionDep
from api.schemas.admin_tournament import (
    AdminTournamentResponse,
    TournamentCreate,
    TournamentUpdate,
)
from api.schemas.registration import RegistrationResponse
from api.schemas.waitlist import WaitlistResponse
from api.utils.admin_middleware import admin_required
from bot.init_bot import bot
from fastapi import APIRouter, HTTPException, Request, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from repositories import (
    registration_repository,
    tournament_repository,
    user_repository,
    waitlist_repository,
)
from services.waitlist_notifications import (
    notify_tournament_cancelled,
    notify_waitlist_users,
)

router = APIRouter()
security = HTTPBearer()


@router.get(
    "/",
    response_model=List[AdminTournamentResponse],
    description="Get all tournaments. Requires admin privileges.",
    responses={401: {"description": "Not authenticated or invalid token"}},
)
@admin_required
async def get_all_tournaments(
    request: Request,
    db: SessionDep,
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """Get all tournaments"""
    return tournament_repository.get_all(db)


@router.get(
    "/{tournament_id}",
    response_model=AdminTournamentResponse,
    description="Get a tournament by ID. Requires admin privileges.",
    responses={
        401: {"description": "Not authenticated or invalid token"},
        404: {"description": "Tournament not found"},
    },
)
@admin_required
async def get_tournament_admin(
    tournament_id: UUID,
    request: Request,
    db: SessionDep,
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """Get a tournament by ID"""
    tournament = tournament_repository.get(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return tournament


@router.post(
    "/",
    response_model=AdminTournamentResponse,
    status_code=status.HTTP_201_CREATED,
    description="Create a new tournament. Requires admin privileges.",
    responses={401: {"description": "Not authenticated or invalid token"}},
)
@admin_required
async def create_tournament_admin(
    tournament_data: TournamentCreate,
    request: Request,
    db: SessionDep,
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """Create a new tournament"""
    # Get organizator_id - use first user if not provided
    organizator_id = tournament_data.organizator_id
    if not organizator_id:
        users = user_repository.get_all(db, limit=1)
        if not users:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No users found in the database. Cannot create tournament without an organizator.",
            )
        organizator_id = users[0].id

    tournament = tournament_repository.create_tournament(
        db=db,
        name=tournament_data.name,
        start_time=tournament_data.start_time,
        end_time=tournament_data.end_time,
        club_id=tournament_data.club_id,
        price=tournament_data.price,
        tournament_type=tournament_data.tournament_type,
        rank_min=tournament_data.rank_min,
        rank_max=tournament_data.rank_max,
        max_users=tournament_data.max_users,
        description=tournament_data.description,
        organizator_id=organizator_id,
    )
    return tournament


@router.patch(
    "/{tournament_id}",
    response_model=AdminTournamentResponse,
    description="Update a tournament. Requires admin privileges.",
    responses={
        401: {"description": "Not authenticated or invalid token"},
        404: {"description": "Tournament not found"},
    },
)
@admin_required
async def update_tournament_admin(
    tournament_id: UUID,
    tournament_data: TournamentUpdate,
    request: Request,
    db: SessionDep,
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """Update a tournament"""
    tournament = tournament_repository.get(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    # Запоминаем старое значение max_users для проверки
    old_max_users = tournament.max_users

    update_data = {}
    if tournament_data.name is not None:
        update_data["name"] = tournament_data.name
    if tournament_data.start_time is not None:
        update_data["start_time"] = tournament_data.start_time
    if tournament_data.end_time is not None:
        update_data["end_time"] = tournament_data.end_time
    if tournament_data.club_id is not None:
        update_data["club_id"] = tournament_data.club_id
    if tournament_data.price is not None:
        update_data["price"] = tournament_data.price
    if tournament_data.tournament_type is not None:
        update_data["tournament_type"] = tournament_data.tournament_type
    if tournament_data.rank_min is not None:
        update_data["rank_min"] = tournament_data.rank_min
    if tournament_data.rank_max is not None:
        update_data["rank_max"] = tournament_data.rank_max
    if tournament_data.max_users is not None:
        update_data["max_users"] = tournament_data.max_users
    if tournament_data.description is not None:
        update_data["description"] = tournament_data.description
    if tournament_data.organizator_id is not None:
        update_data["organizator_id"] = tournament_data.organizator_id

    updated_tournament = tournament_repository.update_tournament(
        db, tournament, update_data
    )

    # Если увеличилось количество мест, уведомляем пользователей из waitlist
    if (
        tournament_data.max_users is not None
        and tournament_data.max_users > old_max_users
    ):
        await notify_waitlist_users(bot, db, tournament_id)

    return updated_tournament


@router.delete(
    "/{tournament_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    description="Delete a tournament. Requires admin privileges.",
    responses={
        401: {"description": "Not authenticated or invalid token"},
        404: {"description": "Tournament not found"},
    },
)
@admin_required
async def delete_tournament_admin(
    tournament_id: UUID,
    request: Request,
    db: SessionDep,
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """Delete a tournament"""
    # Уведомляем пользователей из waitlist об отмене турнира
    await notify_tournament_cancelled(bot, db, tournament_id)

    success = tournament_repository.delete_tournament(db, tournament_id)
    if not success:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return None


@router.get(
    "/{tournament_id}/participants",
    response_model=List[RegistrationResponse],
    description="Get all participants for a tournament. Requires admin privileges.",
    responses={
        401: {"description": "Not authenticated or invalid token"},
        404: {"description": "Tournament not found"},
    },
)
@admin_required
async def get_tournament_participants(
    tournament_id: UUID,
    request: Request,
    db: SessionDep,
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """Get all participants for a tournament"""
    tournament = tournament_repository.get(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    registrations = registration_repository.get_tournament_registrations(
        db, tournament_id
    )
    return registrations


@router.get(
    "/{tournament_id}/waitlist",
    response_model=List[WaitlistResponse],
    description="Get waitlist for a tournament. Requires admin privileges.",
    responses={
        401: {"description": "Not authenticated or invalid token"},
        404: {"description": "Tournament not found"},
    },
)
@admin_required
async def get_tournament_waitlist(
    tournament_id: UUID,
    request: Request,
    db: SessionDep,
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """Get waitlist for a tournament"""
    tournament = tournament_repository.get(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    waitlist = waitlist_repository.get_tournament_waitlist(db, tournament_id)
    return waitlist
