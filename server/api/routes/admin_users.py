from typing import List
from uuid import UUID

from api.deps import SessionDep
from api.schemas.admin_user_operations import UserResponse, UserUpdateByAdmin
from api.utils.admin_middleware import admin_required
from db.crud.user import get_all_users, get_user_by_id, update_user_by_admin
from fastapi import APIRouter, HTTPException, Request, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

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
    users = get_all_users(db, skip=skip, limit=limit)
    return users


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
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    updated_user = update_user_by_admin(db, user, update_data)
    return updated_user
