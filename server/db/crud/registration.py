from typing import List, Optional
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime

from db.models.registration import Registration


def get_registrations_by_tournament(
    db: Session, tournament_id: UUID
) -> List[Registration]:
    """Get all registrations for a specific tournament"""
    return (
        db.query(Registration).filter(Registration.tournament_id == tournament_id).all()
    )


def get_registrations_by_user(db: Session, user_id: UUID) -> List[Registration]:
    """Get all registrations for a specific user"""
    return db.query(Registration).filter(Registration.user_id == user_id).all()


def get_registration(
    db: Session, tournament_id: UUID, user_id: UUID
) -> Optional[Registration]:
    """Get a specific registration by tournament and user"""
    return (
        db.query(Registration)
        .filter(
            Registration.tournament_id == tournament_id, Registration.user_id == user_id
        )
        .first()
    )


def create_registration(
    db: Session,
    tournament_id: UUID,
    user_id: UUID,
    payment_id: UUID,
    status: str = "pending",
) -> Registration:
    """Create a new registration"""
    registration = Registration(
        user_id=user_id,
        tournament_id=tournament_id,
        date=datetime.now(),
        status=status,
        payment_id=payment_id,
    )
    db.add(registration)
    db.commit()
    db.refresh(registration)
    return registration


def update_registration_status(
    db: Session, registration_id: UUID, status: str
) -> Optional[Registration]:
    """Update the status of a registration"""
    registration = (
        db.query(Registration).filter(Registration.id == registration_id).first()
    )
    if registration:
        registration.status = status
        db.commit()
        db.refresh(registration)
    return registration


def delete_registration(db: Session, registration_id: UUID) -> bool:
    """Delete a registration"""
    registration = (
        db.query(Registration).filter(Registration.id == registration_id).first()
    )
    if registration:
        db.delete(registration)
        db.commit()
        return True
    return False
