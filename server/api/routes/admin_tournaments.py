from typing import List
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
from db.crud.registration import get_registrations_by_tournament
from db.crud.tournament import (
    create_tournament,
    delete_tournament,
    get_tournament_by_id,
    get_tournaments,
    update_tournament,
)
from db.crud.user import get_all_users
from db.crud.waitlist import get_waitlist_entries_by_tournament
from fastapi import APIRouter, HTTPException, Request, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

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
    return get_tournaments(db)


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
    tournament = get_tournament_by_id(db, tournament_id)
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
    # If organizator_id is not provided, get the first user from the database
    organizator_id = tournament_data.organizator_id
    if not organizator_id:
        users = get_all_users(db, limit=1)
        if not users:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No users found in the database. Cannot create tournament without an organizator.",
            )
        organizator_id = users[0].id

    tournament = create_tournament(
        db=db,
        name=tournament_data.name,
        start_time=tournament_data.start_time,
        price=tournament_data.price,
        location=tournament_data.location,
        rank_min=tournament_data.rank_min,
        rank_max=tournament_data.rank_max,
        max_users=tournament_data.max_users,
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
    tournament = update_tournament(
        db=db,
        tournament_id=tournament_id,
        name=tournament_data.name,
        start_time=tournament_data.start_time,
        price=tournament_data.price,
        location=tournament_data.location,
        rank_min=tournament_data.rank_min,
        rank_max=tournament_data.rank_max,
        max_users=tournament_data.max_users,
        organizator_id=tournament_data.organizator_id,
    )
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return tournament


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
    success = delete_tournament(db, tournament_id)
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
    tournament = get_tournament_by_id(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    registrations = get_registrations_by_tournament(db, tournament_id)
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
    tournament = get_tournament_by_id(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    waitlist = get_waitlist_entries_by_tournament(db, tournament_id)
    return waitlist
