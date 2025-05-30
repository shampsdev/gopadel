from typing import List, Optional
from uuid import UUID

from db.models.club import Club
from sqlalchemy.orm import Session


def create_club(db: Session, name: str, address: str) -> Club:
    club = Club(name=name, address=address)
    db.add(club)
    db.commit()
    db.refresh(club)
    return club


def get_club_by_id(db: Session, club_id: UUID) -> Optional[Club]:
    return db.query(Club).filter(Club.id == club_id).first()


def get_clubs(db: Session, skip: int = 0, limit: int = 100) -> List[Club]:
    return db.query(Club).offset(skip).limit(limit).all()


def update_club(db: Session, club_id: UUID, name: str, address: str) -> Optional[Club]:
    club = get_club_by_id(db, club_id)
    if club:
        club.name = name
        club.address = address
        db.commit()
        db.refresh(club)
    return club


def delete_club(db: Session, club_id: UUID) -> bool:
    club = get_club_by_id(db, club_id)
    if club:
        db.delete(club)
        db.commit()
        return True
    return False
