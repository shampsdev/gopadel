from typing import List
from uuid import UUID

from api.deps import SessionDep
from api.schemas.admin_user import AdminUserCreate, AdminUserResponse
from api.utils.admin_middleware import admin_required, superuser_required
from api.utils.jwt import get_password_hash
from db.models.admin import AdminUser
from fastapi import APIRouter, Body, HTTPException, Request, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from repositories import admin_user_repository, user_repository

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


@router.get("/admins")
@admin_required
async def get_all_admins(
    request: Request,
    db: SessionDep,
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """Get all admin users."""
    admins = admin_user_repository.get_all_admins(db)
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
    """Create a new admin user."""
    # Check if username already exists
    existing_admin = admin_user_repository.get_by_username(db, admin_data.username)
    if existing_admin:
        raise HTTPException(
            status_code=400, detail="Admin with this username already exists"
        )

    # Create new admin using repository
    admin = admin_user_repository.create_admin(
        db=db,
        username=admin_data.username,
        password=admin_data.password,
        first_name=admin_data.first_name,
        last_name=admin_data.last_name,
        is_active=admin_data.is_active if admin_data.is_active is not None else True,
        is_superuser=(
            admin_data.is_superuser if admin_data.is_superuser is not None else False
        ),
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
    success = admin_user_repository.delete_admin(db, admin_id)
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
    admin = admin_user_repository.get(db, admin_id)
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    # Verify that the user exists
    user = user_repository.get(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update the admin user with the new user_id
    updated_admin = admin_user_repository.update_admin(db, admin, {"user_id": user_id})
    return updated_admin
