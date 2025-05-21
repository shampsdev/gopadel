from datetime import datetime
from typing import List, Optional
from uuid import UUID
from zoneinfo import ZoneInfo
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, joinedload

from db.models.tournament import Tournament
from db.models.registration import Registration


def create_tournament(
    db: Session,
    name: str,
    start_time: datetime,
    price: int,
    location: str,
    rank_min: float,
    rank_max: float,
    max_users: int,
    organizator_id: UUID,
) -> Tournament:
    tournament = Tournament(
        name=name,
        start_time=start_time,
        price=price,
        location=location,
        rank_min=rank_min,
        rank_max=rank_max,
        max_users=max_users,
        organizator_id=organizator_id,
    )
    db.add(tournament)
    db.commit()
    db.refresh(tournament)
    return tournament


def get_tournaments(
    db: Session, user_rank: Optional[float] = None, available: Optional[bool] = None
) -> List[Tournament]:
    """Get all tournaments, optionally filtered by user rank if available=True"""
    query = db.query(Tournament)

    if available and user_rank is not None:
        query = query.filter(
            Tournament.rank_min <= user_rank, Tournament.rank_max >= user_rank
        )

    return query.all()


def get_tournaments_with_participants(
    db: Session, user_rank: Optional[float] = None, available: Optional[bool] = None
) -> List[Tournament]:
    """Get all tournaments with eager loading of registrations and users"""
    now = datetime.now(ZoneInfo("Europe/Moscow"))
    
    naive_now = now.replace(tzinfo=None)
    query = db.query(Tournament).order_by(Tournament.start_time.desc()).filter(
        Tournament.start_time > naive_now
    ).options(joinedload(Tournament.registrations).joinedload(Registration.user))

    if available and user_rank is not None:
        query = query.filter(
            Tournament.rank_min <= user_rank, Tournament.rank_max >= user_rank
        )

    return query.all()


def get_tournament_by_id(db: Session, tournament_id: UUID) -> Optional[Tournament]:
    """Get a specific tournament by ID"""
    return db.query(Tournament).filter(Tournament.id == tournament_id).first()


def get_tournament_with_participants_by_id(
    db: Session, tournament_id: UUID
) -> Optional[Tournament]:
    """Get a specific tournament by ID with eager loading of registrations and users"""
    return (
        db.query(Tournament)
        .options(joinedload(Tournament.registrations).joinedload(Registration.user))
        .filter(Tournament.id == tournament_id)
        .first()
    )


def update_tournament(
    db: Session,
    tournament_id: UUID,
    name: Optional[str] = None,
    start_time: Optional[datetime] = None,
    price: Optional[int] = None,
    location: Optional[str] = None,
    rank_min: Optional[float] = None,
    rank_max: Optional[float] = None,
    max_users: Optional[int] = None,
    organizator_id: Optional[UUID] = None,
) -> Optional[Tournament]:
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        return None

    if name:
        tournament.name = name
    if start_time:
        tournament.start_time = start_time
    if price:
        tournament.price = price
    if location:
        tournament.location = location
    if rank_min is not None:
        tournament.rank_min = rank_min
    if rank_max is not None:
        tournament.rank_max = rank_max
    if max_users:
        tournament.max_users = max_users
    if organizator_id:
        tournament.organizator_id = organizator_id

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
