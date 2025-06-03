from typing import List

from api.deps import SessionDep, UserDep
from api.schemas.loyalty import LoyaltyResponse
from api.schemas.user import UserBase
from fastapi import APIRouter
from repositories import loyalty_repository, user_repository

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
    all_users = user_repository.get_all(db, skip=skip, limit=limit)
    users = [user for user in all_users if user.is_registered]
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
    return loyalty_repository.get_all_loyalty_levels(db)
