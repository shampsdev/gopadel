from typing import List

from api.deps import SessionDep
from api.schemas.admin_loyalty import AdminLoyaltyResponse, LoyaltyCreate, LoyaltyUpdate
from api.utils.admin_middleware import admin_required
from fastapi import APIRouter, HTTPException, Request, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from repositories import loyalty_repository

router = APIRouter()
security = HTTPBearer()


@router.get(
    "/",
    response_model=List[AdminLoyaltyResponse],
    description="Get all loyalty levels. Requires admin privileges.",
    responses={401: {"description": "Not authenticated or invalid token"}},
)
@admin_required
async def get_all_loyalties(
    request: Request,
    db: SessionDep,
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """Get all loyalty levels"""
    loyalties = loyalty_repository.get_all_loyalty_levels(db)
    for loyalty in loyalties:
        setattr(loyalty, "users_count", len(loyalty.users))
    return loyalties


@router.get(
    "/{loyalty_id}",
    response_model=AdminLoyaltyResponse,
    description="Get a loyalty level by ID. Requires admin privileges.",
    responses={
        401: {"description": "Not authenticated or invalid token"},
        404: {"description": "Loyalty level not found"},
    },
)
@admin_required
async def get_loyalty_admin(
    loyalty_id: int,
    request: Request,
    db: SessionDep,
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """Get a loyalty level by ID"""
    loyalty = loyalty_repository.get(db, loyalty_id)
    if not loyalty:
        raise HTTPException(status_code=404, detail="Loyalty level not found")

    setattr(loyalty, "users_count", len(loyalty.users))
    return loyalty


@router.post(
    "/",
    response_model=AdminLoyaltyResponse,
    status_code=status.HTTP_201_CREATED,
    description="Create a new loyalty level. Requires admin privileges.",
    responses={401: {"description": "Not authenticated or invalid token"}},
)
@admin_required
async def create_loyalty_admin(
    loyalty_data: LoyaltyCreate,
    request: Request,
    db: SessionDep,
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """Create a new loyalty level"""
    loyalty = loyalty_repository.create_loyalty_level(
        db=db,
        name=loyalty_data.name,
        discount=loyalty_data.discount,
        description=loyalty_data.description,
        requirements=loyalty_data.requirements,
    )
    setattr(loyalty, "users_count", len(loyalty.users))
    return loyalty


@router.patch(
    "/{loyalty_id}",
    response_model=AdminLoyaltyResponse,
    description="Update a loyalty level. Requires admin privileges.",
    responses={
        401: {"description": "Not authenticated or invalid token"},
        404: {"description": "Loyalty level not found"},
    },
)
@admin_required
async def update_loyalty_admin(
    loyalty_id: int,
    loyalty_data: LoyaltyUpdate,
    request: Request,
    db: SessionDep,
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """Update a loyalty level"""
    update_data = {}
    if loyalty_data.name is not None:
        update_data["name"] = loyalty_data.name
    if loyalty_data.discount is not None:
        update_data["discount"] = loyalty_data.discount
    if loyalty_data.description is not None:
        update_data["description"] = loyalty_data.description
    if loyalty_data.requirements is not None:
        update_data["requirements"] = loyalty_data.requirements

    loyalty = loyalty_repository.update_loyalty_level(
        db=db,
        loyalty_id=loyalty_id,
        update_data=update_data,
    )
    if not loyalty:
        raise HTTPException(status_code=404, detail="Loyalty level not found")

    setattr(loyalty, "users_count", len(loyalty.users))
    return loyalty


@router.delete(
    "/{loyalty_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    description="Delete a loyalty level. Requires admin privileges.",
    responses={
        401: {"description": "Not authenticated or invalid token"},
        404: {"description": "Loyalty level not found"},
    },
)
@admin_required
async def delete_loyalty_admin(
    loyalty_id: int,
    request: Request,
    db: SessionDep,
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """Delete a loyalty level"""
    success = loyalty_repository.delete_loyalty_level(db, loyalty_id)
    if not success:
        raise HTTPException(status_code=404, detail="Loyalty level not found")
