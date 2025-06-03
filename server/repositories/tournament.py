from datetime import datetime
from typing import List, Optional
from uuid import UUID

from db.models.registration import Registration
from db.models.tournament import Tournament
from db.models.user import User
from db.models.waitlist import Waitlist
from repositories.base import BaseRepository
from sqlalchemy import and_, func, or_
from sqlalchemy.orm import Session, joinedload


class TournamentRepository(BaseRepository[Tournament]):
    """Repository for Tournament model"""

    def __init__(self):
        super().__init__(Tournament)

    def get(self, db: Session, id: UUID) -> Optional[Tournament]:
        """Get tournament by ID with all related data"""
        return (
            db.query(Tournament)
            .options(
                joinedload(Tournament.club),
                joinedload(Tournament.organizator),
                joinedload(Tournament.registrations),
            )
            .filter(Tournament.id == id)
            .first()
        )

    def get_waitlist_count(self, db: Session, tournament_id: UUID) -> int:
        """Get count of users in waitlist for a tournament"""
        return (
            db.query(func.count(Waitlist.id))
            .filter(Waitlist.tournament_id == tournament_id)
            .scalar()
            or 0
        )

    def create_tournament(
        self,
        db: Session,
        name: str,
        start_time: datetime,
        club_id: UUID,
        price: int,
        tournament_type: str,
        rank_min: float,
        rank_max: float,
        max_users: int,
        organizator_id: UUID,
        end_time: Optional[datetime] = None,
        description: Optional[str] = None,
    ) -> Tournament:
        """Create a new tournament"""
        tournament = Tournament(
            name=name,
            start_time=start_time,
            end_time=end_time,
            club_id=club_id,
            price=price,
            tournament_type=tournament_type,
            rank_min=rank_min,
            rank_max=rank_max,
            max_users=max_users,
            description=description,
            organizator_id=organizator_id,
        )
        db.add(tournament)
        db.commit()
        db.refresh(tournament)
        return tournament

    def get_tournaments(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 10,
        filter_old: bool = True,
        club_id: Optional[UUID] = None,
    ) -> List[Tournament]:
        """Get tournaments with filters"""
        query = db.query(Tournament).options(joinedload(Tournament.club))

        if filter_old:
            # Filter out finished tournaments
            # A tournament is finished if its end_time (or start_time if no end_time) has passed
            now = datetime.now()
            query = query.filter(
                or_(
                    and_(Tournament.end_time.is_not(None), Tournament.end_time >= now),
                    and_(Tournament.end_time.is_(None), Tournament.start_time >= now),
                )
            )

        if club_id:
            query = query.filter(Tournament.club_id == club_id)

        return query.order_by(Tournament.start_time).offset(skip).limit(limit).all()

    def get_available_tournaments(
        self, db: Session, user: User, skip: int = 0, limit: int = 10
    ) -> List[Tournament]:
        """Get tournaments available for user registration"""
        # First get all future tournaments (not finished)
        now = datetime.now()
        all_tournaments = (
            db.query(Tournament)
            .options(joinedload(Tournament.club))
            .filter(
                or_(
                    and_(Tournament.end_time.is_not(None), Tournament.end_time >= now),
                    and_(Tournament.end_time.is_(None), Tournament.start_time >= now),
                )
            )
            .order_by(Tournament.start_time)
            .all()
        )

        # Then filter by rank restriction only
        available_tournaments = []
        for tournament in all_tournaments:
            if (
                user.rank is not None
                and tournament.rank_min <= user.rank <= tournament.rank_max
            ):
                available_tournaments.append(tournament)
            elif user.rank is None and tournament.rank_min == 0:
                # Allow users without rank to join tournaments with min rank 0
                available_tournaments.append(tournament)

        # Apply pagination
        return available_tournaments[skip : skip + limit]

    def get_user_tournaments(
        self, db: Session, user_id: UUID, skip: int = 0, limit: int = 10
    ) -> List[Tournament]:
        """Get tournaments where user is registered"""
        return (
            db.query(Tournament)
            .join(Registration)
            .filter(Registration.user_id == user_id)
            .order_by(Tournament.start_time.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_popular_tournaments(
        self, db: Session, skip: int = 0, limit: int = 10
    ) -> List[Tournament]:
        """Get tournaments sorted by registration count"""
        now = datetime.now()
        return (
            db.query(
                Tournament,
                func.count(Registration.id).label("registration_count"),
            )
            .outerjoin(Registration)
            .filter(
                or_(
                    and_(Tournament.end_time.is_not(None), Tournament.end_time >= now),
                    and_(Tournament.end_time.is_(None), Tournament.start_time >= now),
                )
            )
            .group_by(Tournament.id)
            .order_by(func.count(Registration.id).desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def update_tournament(
        self, db: Session, tournament: Tournament, update_data: dict
    ) -> Tournament:
        """Update tournament data"""
        for field, value in update_data.items():
            if hasattr(tournament, field) and value is not None:
                setattr(tournament, field, value)

        db.commit()
        db.refresh(tournament)
        return tournament

    def delete_tournament(self, db: Session, tournament_id: int) -> bool:
        """Delete tournament"""
        tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
        if not tournament:
            return False

        db.delete(tournament)
        db.commit()
        return True

    def get_registrations_count(self, db: Session, tournament_id: int) -> int:
        """Get count of registrations for a tournament"""
        return (
            db.query(func.count(Registration.id))
            .filter(Registration.tournament_id == tournament_id)
            .scalar()
        )
