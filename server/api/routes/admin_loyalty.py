from typing import List

from api.deps import SessionDep
from api.schemas.admin_loyalty import AdminLoyaltyResponse, LoyaltyCreate, LoyaltyUpdate
from api.utils.admin_middleware import admin_required
from db.crud.loyalty import (
    create_loyalty,
    delete_loyalty,
    get_loyalties,
    get_loyalty_by_id,
    update_loyalty,
)
from fastapi import APIRouter, HTTPException, Request, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

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
    loyalties = get_loyalties(db)
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
    loyalty = get_loyalty_by_id(db, loyalty_id)
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
    loyalty = create_loyalty(
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
    loyalty = update_loyalty(
        db=db,
        loyalty_id=loyalty_id,
        name=loyalty_data.name,
        discount=loyalty_data.discount,
        description=loyalty_data.description,
        requirements=loyalty_data.requirements,
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
    success = delete_loyalty(db, loyalty_id)
    if not success:
        raise HTTPException(status_code=404, detail="Loyalty level not found")
