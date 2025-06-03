from typing import List
from uuid import UUID

from api.deps import SessionDep
from api.schemas.club import Club, ClubCreate, ClubUpdate
from api.utils.admin_middleware import admin_required
from fastapi import APIRouter, HTTPException, Request, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from repositories import club_repository

router = APIRouter()
security = HTTPBearer()


@router.get("/", response_model=List[Club])
@admin_required
async def get_clubs(
    request: Request,
    db: SessionDep,
    credentials: HTTPAuthorizationCredentials = Security(security),
    skip: int = 0,
    limit: int = 100,
):
    """Получить список всех клубов"""
    clubs = club_repository.get_all(db, skip=skip, limit=limit)
    return clubs


@router.post("/", response_model=Club)
@admin_required
async def create_club(
    club: ClubCreate,
    request: Request,
    db: SessionDep,
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """Создать новый клуб"""
    return club_repository.create_club(
        db,
        name=club.name,
        address=club.address,
    )


@router.get("/{club_id}", response_model=Club)
@admin_required
async def get_club(
    club_id: UUID,
    request: Request,
    db: SessionDep,
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """Получить клуб по ID"""
    club = club_repository.get(db, club_id)
    if club is None:
        raise HTTPException(status_code=404, detail="Club not found")
    return club


@router.put("/{club_id}", response_model=Club)
@admin_required
async def update_club(
    club_id: UUID,
    club_update: ClubUpdate,
    request: Request,
    db: SessionDep,
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """Обновить клуб"""
    club = club_repository.get(db, club_id)
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")

    update_data = {}
    if club_update.name is not None:
        update_data["name"] = club_update.name
    if club_update.address is not None:
        update_data["address"] = club_update.address

    updated_club = club_repository.update_club(db, club, update_data)
    return updated_club


@router.delete("/{club_id}")
@admin_required
async def delete_club(
    club_id: UUID,
    request: Request,
    db: SessionDep,
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """Удалить клуб"""
    success = club_repository.delete_club(db, club_id)
    if not success:
        raise HTTPException(status_code=404, detail="Club not found")
    return {"message": "Club deleted successfully"}
