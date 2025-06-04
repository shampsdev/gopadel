from datetime import datetime
from typing import List, Optional
from uuid import UUID
from zoneinfo import ZoneInfo

from db.models.registration import Registration, RegistrationStatus
from db.models.user import User
from repositories.base import BaseRepository
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session, joinedload


class RegistrationRepository(BaseRepository[Registration]):
    """Repository for Registration model"""

    def __init__(self):
        super().__init__(Registration)

    def get_tournament_registrations(
        self, db: Session, tournament_id: UUID
    ) -> List[Registration]:
        """Get all registrations for a tournament"""
        return (
            db.query(Registration)
            .filter(Registration.tournament_id == tournament_id)
            .all()
        )

    def get_user_registrations(self, db: Session, user_id: UUID) -> List[Registration]:
        """Get all registrations for a user"""
        return db.query(Registration).filter(Registration.user_id == user_id).all()

    def get_user_tournament_registration(
        self, db: Session, user_id: UUID, tournament_id: UUID
    ) -> Optional[Registration]:
        """Get specific registration for user and tournament"""
        return (
            db.query(Registration)
            .filter(
                and_(
                    Registration.user_id == user_id,
                    Registration.tournament_id == tournament_id,
                )
            )
            .first()
        )

    def check_registration_exists(
        self, db: Session, user_id: UUID, tournament_id: UUID
    ) -> bool:
        """Check if user is already registered for tournament"""
        return (
            db.query(Registration)
            .filter(
                Registration.user_id == user_id,
                Registration.tournament_id == tournament_id,
            )
            .first()
            is not None
        )

    def create_registration(
        self,
        db: Session,
        user_id: UUID,
        tournament_id: UUID,
        status: RegistrationStatus = RegistrationStatus.PENDING,
    ) -> Registration:
        """Create new registration"""
        registration = Registration(
            user_id=user_id,
            tournament_id=tournament_id,
            status=status,
            date=datetime.now(ZoneInfo("Europe/Moscow")),
        )
        db.add(registration)
        db.commit()
        db.refresh(registration)
        return registration

    def update_registration_status(
        self, db: Session, registration_id: int, status: RegistrationStatus
    ) -> Optional[Registration]:
        """Update registration status"""
        registration = (
            db.query(Registration).filter(Registration.id == registration_id).first()
        )
        if registration:
            registration.status = status
            db.commit()
            db.refresh(registration)
        return registration

    def delete_registration(self, db: Session, registration_id: int) -> bool:
        """Delete registration"""
        registration = (
            db.query(Registration).filter(Registration.id == registration_id).first()
        )
        if registration:
            db.delete(registration)
            db.commit()
            return True
        return False

    def get_registrations_with_relations(
        self,
        db: Session,
        tournament_id: Optional[UUID] = None,
        status: Optional[RegistrationStatus] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Registration]:
        """Get registrations with user and tournament data loaded"""
        query = db.query(Registration).options(
            joinedload(Registration.user),
            joinedload(Registration.tournament),
            joinedload(Registration.payments),
        )

        if tournament_id:
            query = query.filter(Registration.tournament_id == tournament_id)

        if status:
            query = query.filter(Registration.status == status)

        return query.offset(skip).limit(limit).all()

    def count_tournament_registrations(
        self,
        db: Session,
        tournament_id: UUID,
        status: Optional[RegistrationStatus] = None,
    ) -> int:
        """Count registrations for a tournament"""
        query = db.query(Registration).filter(
            Registration.tournament_id == tournament_id
        )

        if status:
            query = query.filter(Registration.status == status)

        return query.count()

    def get_user_registrations_with_relations(
        self, db: Session, user_id: UUID
    ) -> List[Registration]:
        """Get all registrations for a user with tournament and payment data loaded"""
        from db.models.club import Club
        from db.models.tournament import Tournament
        from db.models.user import User

        return (
            db.query(Registration)
            .options(
                joinedload(Registration.tournament).joinedload(Tournament.club),
                joinedload(Registration.tournament).joinedload(Tournament.organizator),
                joinedload(Registration.payments),
            )
            .filter(Registration.user_id == user_id)
            .order_by(Registration.date.desc())
            .all()
        )
