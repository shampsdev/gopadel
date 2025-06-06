from typing import List, Optional
from uuid import UUID

from db.models.tournament import Tournament
from db.models.user import User
from db.models.waitlist import Waitlist
from repositories.base import BaseRepository
from sqlalchemy import and_
from sqlalchemy.orm import Session, selectinload


class WaitlistRepository(BaseRepository[Waitlist]):
    """Repository for Waitlist model"""

    def __init__(self):
        super().__init__(Waitlist)

    def get_tournament_by_id(
        self, db: Session, tournament_id: UUID
    ) -> Optional[Tournament]:
        """Get tournament by ID"""
        return db.query(Tournament).filter(Tournament.id == tournament_id).first()

    def check_waitlist_exists(
        self, db: Session, user_id: UUID, tournament_id: UUID
    ) -> bool:
        """Check if user is already in waitlist for tournament"""
        return (
            db.query(Waitlist)
            .filter(
                and_(
                    Waitlist.user_id == user_id,
                    Waitlist.tournament_id == tournament_id,
                )
            )
            .first()
            is not None
        )

    def add_to_waitlist(
        self, db: Session, user_id: UUID, tournament_id: UUID
    ) -> Waitlist:
        """Add user to tournament waitlist"""
        from datetime import datetime
        from zoneinfo import ZoneInfo

        waitlist_entry = Waitlist(
            user_id=user_id,
            tournament_id=tournament_id,
            date=datetime.now(ZoneInfo("Europe/Moscow")),
        )
        db.add(waitlist_entry)
        db.commit()
        db.refresh(waitlist_entry)
        return waitlist_entry

    def remove_from_waitlist(
        self, db: Session, user_id: UUID, tournament_id: UUID
    ) -> bool:
        """Remove user from tournament waitlist"""
        waitlist_entry = (
            db.query(Waitlist)
            .filter(
                and_(
                    Waitlist.user_id == user_id,
                    Waitlist.tournament_id == tournament_id,
                )
            )
            .first()
        )

        if waitlist_entry:
            db.delete(waitlist_entry)
            db.commit()
            return True
        return False

    def get_tournament_waitlist(
        self, db: Session, tournament_id: UUID
    ) -> List[Waitlist]:
        """Get all users in waitlist for a tournament with simplified user data"""
        return (
            db.query(Waitlist)
            .options(selectinload(Waitlist.user))
            .filter(Waitlist.tournament_id == tournament_id)
            .order_by(Waitlist.date)
            .all()
        )

    def get_user_waitlists(self, db: Session, user_id: UUID) -> List[Waitlist]:
        """Get all waitlists for a user with simplified user data"""
        return (
            db.query(Waitlist)
            .options(selectinload(Waitlist.user))
            .filter(Waitlist.user_id == user_id)
            .all()
        )

    def get_waitlist_position(
        self, db: Session, user_id: UUID, tournament_id: UUID
    ) -> Optional[int]:
        """Get user's position in tournament waitlist"""
        waitlist = (
            db.query(Waitlist)
            .filter(Waitlist.tournament_id == tournament_id)
            .order_by(Waitlist.date)
            .all()
        )

        for index, entry in enumerate(waitlist):
            if entry.user_id == user_id:
                return index + 1

        return None
