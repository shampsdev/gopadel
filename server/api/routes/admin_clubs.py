from typing import List
from uuid import UUID

from api.deps import SessionDep
from api.schemas.club import Club, ClubCreate, ClubUpdate
from api.utils.admin_middleware import admin_required
from db.crud import club as club_crud
from fastapi import APIRouter, HTTPException, Request, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

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
    clubs = club_crud.get_clubs(db, skip=skip, limit=limit)
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
    return club_crud.create_club(db, name=club.name, address=club.address)


@router.get("/{club_id}", response_model=Club)
@admin_required
async def get_club(
    club_id: UUID,
    request: Request,
    db: SessionDep,
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """Получить клуб по ID"""
    club = club_crud.get_club_by_id(db, club_id)
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
    club = club_crud.update_club(
        db, club_id, name=club_update.name, address=club_update.address
    )
    if club is None:
        raise HTTPException(status_code=404, detail="Club not found")
    return club


@router.delete("/{club_id}")
@admin_required
async def delete_club(
    club_id: UUID,
    request: Request,
    db: SessionDep,
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """Удалить клуб"""
    success = club_crud.delete_club(db, club_id)
    if not success:
        raise HTTPException(status_code=404, detail="Club not found")
    return {"message": "Club deleted successfully"}
