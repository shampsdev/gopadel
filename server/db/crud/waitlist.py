from typing import List
from uuid import UUID

from db.models.waitlist import Waitlist
from sqlalchemy.orm import Session, joinedload


def get_waitlist_entries_by_tournament(
    db: Session, tournament_id: UUID
) -> List[Waitlist]:
    """Get all waitlist entries for a specific tournament with user information included"""
    return (
        db.query(Waitlist)
        .options(joinedload(Waitlist.user))
        .filter(Waitlist.tournament_id == tournament_id)
        .all()
    )
