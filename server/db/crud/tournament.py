from datetime import datetime
from typing import List, Optional
from uuid import UUID
from zoneinfo import ZoneInfo

from db.models.registration import Registration, RegistrationStatus
from db.models.tournament import Tournament
from sqlalchemy import desc
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, joinedload


def create_tournament(
    db: Session,
    name: str,
    start_time: datetime,
    price: int,
    club_id: UUID,
    tournament_type: str,
    rank_min: float,
    rank_max: float,
    max_users: int,
    organizator_id: UUID,
    end_time: Optional[datetime] = None,
    description: Optional[str] = None,
) -> Tournament:
    tournament = Tournament(
        name=name,
        start_time=start_time,
        end_time=end_time,
        price=price,
        club_id=club_id,
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
    db: Session, user_rank: Optional[float] = None, available: Optional[bool] = None
) -> List[Tournament]:
    """Get all tournaments, optionally filtered by user rank if available=True"""
    query = db.query(Tournament).options(joinedload(Tournament.club))

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
    query = (
        db.query(Tournament)
        .order_by(Tournament.start_time.desc())
        .filter(Tournament.start_time > naive_now)
        .options(
            joinedload(Tournament.registrations).joinedload(Registration.user),
            joinedload(Tournament.club),
        )
    )

    if available and user_rank is not None:
        query = query.filter(
            Tournament.rank_min <= user_rank, Tournament.rank_max >= user_rank
        )

    return query.all()


def get_tournament_by_id(db: Session, tournament_id: UUID) -> Optional[Tournament]:
    """Get a specific tournament by ID"""
    return (
        db.query(Tournament)
        .options(joinedload(Tournament.club))
        .filter(Tournament.id == tournament_id)
        .first()
    )


def get_tournament_with_participants_by_id(
    db: Session, tournament_id: UUID
) -> Optional[Tournament]:
    """Get a specific tournament by ID with eager loading of active registrations and users"""
    return (
        db.query(Tournament)
        .filter(Tournament.id == tournament_id)
        .options(
            joinedload(
                Tournament.registrations.and_(
                    Registration.status == RegistrationStatus.ACTIVE
                )
            ).joinedload(Registration.user),
            joinedload(Tournament.club),
        )
        .first()
    )


def update_tournament(
    db: Session,
    tournament_id: UUID,
    name: Optional[str] = None,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    price: Optional[int] = None,
    club_id: Optional[UUID] = None,
    tournament_type: Optional[str] = None,
    rank_min: Optional[float] = None,
    rank_max: Optional[float] = None,
    max_users: Optional[int] = None,
    description: Optional[str] = None,
    organizator_id: Optional[UUID] = None,
) -> Optional[Tournament]:
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        return None

    if name:
        tournament.name = name
    if start_time:
        tournament.start_time = start_time
    if end_time is not None:
        tournament.end_time = end_time
    if price:
        tournament.price = price
    if club_id:
        tournament.club_id = club_id
    if tournament_type:
        tournament.tournament_type = tournament_type
    if rank_min is not None:
        tournament.rank_min = rank_min
    if rank_max is not None:
        tournament.rank_max = rank_max
    if max_users:
        tournament.max_users = max_users
    if description is not None:
        tournament.description = description
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


def get_registrations_with_tournaments_by_user(
    db: Session, user_id: UUID, only_active: bool = True
) -> List[Registration]:
    query = db.query(Registration)
    if only_active:
        query = query.filter(Registration.status == RegistrationStatus.ACTIVE)
    return (
        query.filter(Registration.user_id == user_id)
        .join(Tournament)
        .order_by(desc(Tournament.start_time))
        .all()
    )
