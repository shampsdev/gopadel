from uuid import UUID

from aiogram import Bot
from db.models.registration import RegistrationStatus
from db.models.tournament import Tournament
from db.models.waitlist import Waitlist
from repositories import waitlist_repository
from sqlalchemy import and_
from sqlalchemy.orm import Session, joinedload


async def notify_waitlist(bot: Bot, db: Session, tournament_id: UUID):
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise ValueError("Tournament not found")

    reserved_users = len(
        [
            r
            for r in tournament.registrations
            if r.status in (RegistrationStatus.ACTIVE, RegistrationStatus.PENDING)
        ]
    )
    if reserved_users >= tournament.max_users:
        return

    waitlist = (
        db.query(Waitlist)
        .options(joinedload(Waitlist.user))
        .filter(Waitlist.tournament_id == tournament_id)
        .all()
    )
    for waitlist_entry in waitlist:
        await bot.send_message(
            waitlist_entry.user.telegram_id,
            f"You are on the waitlist for {tournament.name}",
        )


def add_to_waitlist(db: Session, user_id: UUID, tournament_id: int) -> Waitlist:
    tournament = waitlist_repository.get_tournament_by_id(db, tournament_id)
    if not tournament:
        raise ValueError("Tournament not found")

    # Check if already in waitlist using repository
    if waitlist_repository.check_waitlist_exists(db, user_id, tournament_id):
        raise ValueError("User already in waitlist for this tournament")

    # Add to waitlist using repository
    return waitlist_repository.add_to_waitlist(db, user_id, tournament_id)


def remove_from_waitlist(db: Session, user_id: UUID, tournament_id: int) -> bool:
    """Remove user from waitlist using repository"""
    return waitlist_repository.remove_from_waitlist(db, user_id, tournament_id)
