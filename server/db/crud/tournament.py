from datetime import date
from typing import Optional
from uuid import UUID

from db.models.tournament import Tournament
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session


def create_tournament(
    db: Session,
    name: str,
    description: Optional[str],
    start_date: date,
    end_date: date,
    location: str,
) -> Tournament:
    tournament = Tournament(
        name=name,
        description=description,
        start_date=start_date,
        end_date=end_date,
        location=location,
    )
    db.add(tournament)
    db.commit()
    db.refresh(tournament)
    return tournament


def get_tournament_by_id(db: Session, tournament_id: UUID) -> Optional[Tournament]:
    return db.query(Tournament).filter(Tournament.id == tournament_id).first()


def update_tournament(
    db: Session,
    tournament_id: UUID,
    name: Optional[str] = None,
    description: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    location: Optional[str] = None,
) -> Optional[Tournament]:
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        return None

    if name:
        tournament.name = name
    if description:
        tournament.description = description
    if start_date:
        tournament.start_date = start_date
    if end_date:
        tournament.end_date = end_date
    if location:
        tournament.location = location

    db.commit()
    db.refresh(tournament)
    return tournament


def delete_tournament(db: Session, tournament_id: UUID) -> bool:
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        return False

    try:
        db.delete(tournament)
        db.commit()
        return True
    except SQLAlchemyError:
        db.rollback()
        return False
