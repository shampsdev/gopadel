from typing import List
from uuid import UUID

from api.deps import SessionDep, UserDep
from api.schemas.waitlist import WaitlistResponse
from fastapi import APIRouter, HTTPException
from repositories import tournament_repository, waitlist_repository

router = APIRouter()


@router.get("/my", response_model=List[WaitlistResponse])
async def get_my_waitlists(db: SessionDep, user: UserDep):
    """Get all waitlists for current user"""
    waitlists = waitlist_repository.get_user_waitlists(db, user.id)
    return waitlists


@router.post("/{tournament_id}", response_model=WaitlistResponse)
async def add_to_tournament_waitlist(
    db: SessionDep, tournament_id: UUID, user: UserDep
):
    """Add current user to tournament waitlist"""
    tournament = tournament_repository.get(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    # Check if already in waitlist
    if waitlist_repository.check_waitlist_exists(db, user.id, tournament_id):
        raise HTTPException(
            status_code=400, detail="User already in waitlist for this tournament"
        )

    waitlist_entry = waitlist_repository.add_to_waitlist(db, user.id, tournament_id)
    return waitlist_entry


@router.delete("/{tournament_id}")
async def remove_from_tournament_waitlist(
    db: SessionDep, tournament_id: UUID, user: UserDep
):
    """Remove current user from tournament waitlist"""
    tournament = tournament_repository.get(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    success = waitlist_repository.remove_from_waitlist(db, user.id, tournament_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found in waitlist")

    return {"message": "Removed from waitlist successfully"}
