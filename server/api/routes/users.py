from typing import List

from api.deps import SessionDep, UserDep
from api.schemas.loyalty import LoyaltyResponse
from api.schemas.user import UserBase
from db.crud.loyalty import get_loyalties
from db.crud.user import get_all_users
from fastapi import APIRouter, Depends

router = APIRouter()


@router.get(
    "",
    response_model=List[UserBase],
    description="Get all users. Requires authentication.",
    responses={401: {"description": "Not authenticated"}},
)
async def get_users(
    current_user: UserDep,
    db: SessionDep,
    skip: int = 0,
    limit: int = 100,
):
    """Get all registered users with pagination"""
    # Only return registered users
    users = [
        user for user in get_all_users(db, skip=skip, limit=limit) if user.is_registered
    ]
    return users


@router.get(
    "/loyalty-levels",
    response_model=List[LoyaltyResponse],
    description="Get all loyalty levels. Requires authentication.",
    responses={401: {"description": "Not authenticated"}},
)
async def get_loyalty_levels(
    current_user: UserDep,
    db: SessionDep,
):
    """Get all loyalty levels available to users"""
    return get_loyalties(db)
