from typing import List, Optional
from uuid import UUID

from db.models.club import Club
from repositories.base import BaseRepository
from sqlalchemy.orm import Session


class ClubRepository(BaseRepository[Club]):
    """Repository for Club model"""

    def __init__(self):
        super().__init__(Club)

    def create_club(
        self,
        db: Session,
        name: str,
        address: str,
    ) -> Club:
        """Create new club"""
        club = Club(
            name=name,
            address=address,
        )
        db.add(club)
        db.commit()
        db.refresh(club)
        return club

    def update_club(self, db: Session, club: Club, update_data: dict) -> Club:
        """Update club data"""
        for field, value in update_data.items():
            if hasattr(club, field) and value is not None:
                setattr(club, field, value)

        db.commit()
        db.refresh(club)
        return club

    def delete_club(self, db: Session, club_id: UUID) -> bool:
        """Delete club"""
        club = self.get(db, club_id)
        if not club:
            return False

        db.delete(club)
        db.commit()
        return True

    def search_clubs(
        self, db: Session, query: str, skip: int = 0, limit: int = 10
    ) -> List[Club]:
        """Search clubs by name or address"""
        return (
            db.query(Club)
            .filter(Club.name.ilike(f"%{query}%") | Club.address.ilike(f"%{query}%"))
            .offset(skip)
            .limit(limit)
            .all()
        )
