from typing import List
from uuid import UUID

from api.deps import SessionDep
from api.schemas.admin_user import AdminUserCreate, AdminUserResponse
from api.utils.admin_middleware import admin_required, superuser_required
from api.utils.jwt import get_password_hash
from db.crud.admin_user import (
    create_admin_user,
    delete_admin_user,
    get_admin_by_id,
    update_admin_user,
)
from db.crud.user import get_user_by_id
from db.models.admin import AdminUser
from fastapi import APIRouter, Body, HTTPException, Request, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

router = APIRouter()
security = HTTPBearer()


@router.get(
    "/",
    response_model=List[AdminUserResponse],
    description="Get all admin users. Requires admin privileges.",
    responses={401: {"description": "Not authenticated or invalid token"}},
)
@admin_required
async def get_admins(
    request: Request,
    db: SessionDep,
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """Get all admin users"""
    admins = db.query(AdminUser).all()
    return admins


@router.post(
    "/create",
    response_model=AdminUserResponse,
    description="Create new admin user. Requires superuser privileges.",
    responses={
        401: {"description": "Not authenticated or invalid token"},
        403: {"description": "Not authorized, requires superuser privileges"},
    },
)
@superuser_required
async def create_admin(
    admin_data: AdminUserCreate,
    db: SessionDep,
    request: Request,
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    existing_admin = (
        db.query(AdminUser).filter(AdminUser.username == admin_data.username).first()
    )
    if existing_admin:
        raise HTTPException(status_code=400, detail="Username already taken")

    # Verify that the user exists if user_id is provided
    if admin_data.user_id:
        user = get_user_by_id(db, admin_data.user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

    hashed_password = get_password_hash(admin_data.password)

    admin = create_admin_user(
        db=db,
        username=admin_data.username,
        password_hash=hashed_password,
        first_name=admin_data.first_name,
        last_name=admin_data.last_name,
        is_superuser=(
            admin_data.is_superuser if admin_data.is_superuser is not None else False
        ),
        is_active=admin_data.is_active if admin_data.is_active is not None else True,
        user_id=admin_data.user_id,
    )

    return admin


@router.delete(
    "/{admin_id}",
    status_code=204,
    description="Delete admin user. Requires superuser privileges.",
    responses={
        401: {"description": "Not authenticated or invalid token"},
        403: {"description": "Not authorized, requires superuser privileges"},
        404: {"description": "Admin not found"},
    },
)
@superuser_required
async def delete_admin(
    admin_id: UUID,
    db: SessionDep,
    request: Request,
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    success = delete_admin_user(db, admin_id)
    if not success:
        raise HTTPException(status_code=404, detail="Admin not found")


@router.patch(
    "/{admin_id}/user",
    response_model=AdminUserResponse,
    description="Update the user associated with an admin. Requires superuser privileges.",
    responses={
        401: {"description": "Not authenticated or invalid token"},
        403: {"description": "Not authorized, requires superuser privileges"},
        404: {"description": "Admin not found or User not found"},
    },
)
@superuser_required
async def update_admin_user_association(
    admin_id: UUID,
    user_id: UUID = Body(..., embed=True),
    db: SessionDep = None,
    request: Request = None,
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    admin = get_admin_by_id(db, admin_id)
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    # Verify that the user exists
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update the admin user with the new user_id
    updated_admin = update_admin_user(db, admin_id, user_id=user_id)
    return updated_admin
