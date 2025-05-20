from typing import List
from uuid import UUID

from api.deps import SessionDep
from api.schemas.admin_user import AdminUserCreate, AdminUserResponse
from api.utils.admin_middleware import admin_required, superuser_required
from api.utils.jwt import get_password_hash
from db.crud.admin_user import create_admin_user, delete_admin_user
from db.models.admin import AdminUser
from fastapi import APIRouter, HTTPException, Request, Security
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
