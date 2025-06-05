from typing import Any, Dict, List, Optional
from uuid import UUID

from api.deps import SessionDep
from api.schemas.admin_user import AdminUserCreate, AdminUserResponse
from api.schemas.registration import AdminRegistrationResponse, RegistrationStatus
from api.utils.admin_middleware import admin_required, superuser_required
from db.models.admin import AdminUser
from fastapi import APIRouter, Body, HTTPException, Query, Request, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from repositories import admin_user_repository, registration_repository, user_repository

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


@router.get(
    "/registrations/",
    response_model=Dict[str, Any],
    tags=["admin", "registrations"],
    description="Get all registrations with filters. Requires admin privileges.",
    responses={401: {"description": "Not authenticated or invalid token"}},
)
@admin_required
async def get_all_registrations(
    request: Request,
    db: SessionDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    user_id: Optional[UUID] = Query(None),
    tournament_id: Optional[UUID] = Query(None),
    status: Optional[str] = Query(None),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """Get all registrations with filters for admin"""

    # Convert string status to enum if provided
    status_filter = None
    if status and status != "all":
        try:
            status_filter = RegistrationStatus(status)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid status")

    # Get registrations with relations using proper filtering
    registrations = registration_repository.get_registrations_with_relations(
        db=db,
        tournament_id=tournament_id,
        user_id=user_id,  # Pass user_id directly to repository
        status=status_filter,
        skip=skip,
        limit=limit,
    )

    # Count total registrations with same filters
    total_count = registration_repository.count_registrations_with_filters(
        db=db, tournament_id=tournament_id, user_id=user_id, status=status_filter
    )

    # Convert to admin response format
    admin_registrations = []
    for reg in registrations:
        try:
            admin_registrations.append(AdminRegistrationResponse.model_validate(reg))
        except Exception as e:
            print(f"Error converting registration {reg.id}: {e}")
            # Skip problematic registrations but continue processing
            continue

    return {"registrations": admin_registrations, "total": total_count}


@router.patch(
    "/registrations/{registration_id}/status",
    tags=["admin", "registrations"],
    description="Update registration status. Requires admin privileges.",
    responses={
        401: {"description": "Not authenticated or invalid token"},
        404: {"description": "Registration not found"},
    },
)
@admin_required
async def update_registration_status_admin(
    registration_id: UUID,
    status_data: Dict[str, str],
    request: Request,
    db: SessionDep,
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """Update registration status (admin only)"""

    new_status = status_data.get("status")
    if not new_status:
        raise HTTPException(status_code=400, detail="Status is required")

    try:
        status_enum = RegistrationStatus(new_status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status")

    # Get registration
    registration = registration_repository.get(db, registration_id)
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")

    # Update status
    updated_registration = registration_repository.update_registration_status(
        db, registration_id, status_enum
    )

    if not updated_registration:
        raise HTTPException(
            status_code=500, detail="Failed to update registration status"
        )

    return {"message": "Registration status updated successfully", "status": new_status}
