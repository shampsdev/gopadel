from typing import List
from uuid import UUID

from api.deps import SessionDep, UserDep
from api.schemas.loyalty import LoyaltyResponse
from api.schemas.user import UserBase
from fastapi import APIRouter, HTTPException
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
    "/all",
    response_model=List[UserBase],
    description="Get all users without pagination. Requires authentication.",
    responses={401: {"description": "Not authenticated"}},
)
async def get_all_users(
    current_user: UserDep,
    db: SessionDep,
):
    """Get all registered users without pagination"""
    # Get all users without pagination
    all_users = user_repository.get_all(db, skip=0, limit=10000)
    # Only return registered users
    users = [user for user in all_users if user.is_registered]
    return users


@router.get(
    "/{user_id}",
    response_model=UserBase,
    description="Get a specific user by ID. Requires authentication.",
    responses={
        401: {"description": "Not authenticated"},
        404: {"description": "User not found"},
    },
)
async def get_user_by_id(
    user_id: UUID,
    current_user: UserDep,
    db: SessionDep,
):
    """Get a specific user by ID"""
    user = user_repository.get(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Only return registered users
    if not user.is_registered:
        raise HTTPException(status_code=404, detail="User not found")

    return user


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
