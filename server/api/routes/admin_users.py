from typing import List, Optional
from uuid import UUID

from api.deps import SessionDep
from api.schemas.admin_user_operations import (
    UserListResponse,
    UserResponse,
    UserUpdateByAdmin,
)
from api.schemas.user import UserBase
from api.utils.admin_middleware import admin_required
from fastapi import APIRouter, HTTPException, Query, Request, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from repositories import user_repository

router = APIRouter()
security = HTTPBearer()


@router.get(
    "/",
    response_model=List[UserResponse],
    description="Get all users. Requires admin privileges.",
    responses={401: {"description": "Not authenticated or invalid token"}},
)
@admin_required
async def get_users(
    request: Request,
    db: SessionDep,
    skip: int = 0,
    limit: int = 100,
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """Get all users with pagination"""
    users = user_repository.get_all(db, skip=skip, limit=limit)
    return users


@router.get(
    "/all",
    response_model=List[UserListResponse],
    description="Get all users in simplified format without pagination. Requires admin privileges.",
    responses={401: {"description": "Not authenticated or invalid token"}},
)
@admin_required
async def get_all_users_simple(
    request: Request,
    db: SessionDep,
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """Get all users in simplified format without pagination"""
    users = user_repository.get_all(db, skip=0, limit=10000)
    return users


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    description="Get a specific user by ID. Requires admin privileges.",
    responses={
        401: {"description": "Not authenticated or invalid token"},
        404: {"description": "User not found"},
    },
)
@admin_required
async def get_user(
    user_id: UUID,
    request: Request,
    db: SessionDep,
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """Get a specific user by ID"""
    user = user_repository.get(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch(
    "/{user_id}",
    response_model=UserResponse,
    description="Update user details. Requires admin privileges.",
    responses={
        401: {"description": "Not authenticated or invalid token"},
        404: {"description": "User not found"},
    },
)
@admin_required
async def update_user(
    user_id: UUID,
    update_data: UserUpdateByAdmin,
    request: Request,
    db: SessionDep,
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """Update user details by admin"""
    user = user_repository.get(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    updated_user = user_repository.update_user_by_admin(db, user, update_data)
    return updated_user
