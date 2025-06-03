from uuid import UUID

from aiogram import Bot
from db.models.registration import RegistrationStatus
from db.models.tournament import Tournament
from db.models.waitlist import Waitlist
from repositories import registration_repository, waitlist_repository
from sqlalchemy import and_
from sqlalchemy.orm import Session, joinedload


async def notify_waitlist(bot: Bot, db: Session, tournament_id: UUID):
    """
    ВРЕМЕННО ОТКЛЮЧЕНО: Автоматическая регистрация людей из waitlist и уведомления через бот
    Функция оставлена для возможного будущего использования
    """
    return

    # ОТКЛЮЧЕННЫЙ КОД:
    # tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    # if not tournament:
    #     raise ValueError("Tournament not found")

    # reserved_users = len(
    #     [
    #         r
    #         for r in tournament.registrations
    #         if r.status in (RegistrationStatus.ACTIVE, RegistrationStatus.PENDING)
    #     ]
    # )

    # # If there are still no free spots, just notify waitlist
    # if reserved_users >= tournament.max_users:
    #     return

    # # Get waitlist ordered by date (first come, first served)
    # waitlist = (
    #     db.query(Waitlist)
    #     .options(joinedload(Waitlist.user))
    #     .filter(Waitlist.tournament_id == tournament_id)
    #     .order_by(Waitlist.date)
    #     .all()
    # )

    # if not waitlist:
    #     return

    # # Move first person from waitlist to registered
    # first_in_waitlist = waitlist[0]

    # # Remove from waitlist
    # waitlist_repository.remove_from_waitlist(
    #     db, first_in_waitlist.user_id, tournament_id
    # )

    # # Create registration for this user
    # registration_repository.create_registration(
    #     db,
    #     user_id=first_in_waitlist.user_id,
    #     tournament_id=tournament_id,
    #     payment_id=None,  # Will need to handle payment separately
    #     status=(
    #         RegistrationStatus.PENDING
    #         if tournament.price > 0
    #         else RegistrationStatus.ACTIVE
    #     ),
    # )

    # # Notify the user that they can now register
    # await bot.send_message(
    #     first_in_waitlist.user.telegram_id,
    #     f"Освободилось место в турнире {tournament.name}! Вы были автоматически зарегистрированы.",
    # )

    # # Notify remaining waitlist users about their updated position
    # remaining_waitlist = waitlist[1:]  # Skip the first one who was moved
    # for index, waitlist_entry in enumerate(remaining_waitlist):
    #     await bot.send_message(
    #         waitlist_entry.user.telegram_id,
    #         f"Ваша позиция в списке ожидания турнира {tournament.name}: {index + 1}",
    #     )


def add_to_waitlist(db: Session, user_id: UUID, tournament_id: UUID) -> Waitlist:
    tournament = waitlist_repository.get_tournament_by_id(db, tournament_id)
    if not tournament:
        raise ValueError("Tournament not found")

    # Check if already in waitlist using repository
    if waitlist_repository.check_waitlist_exists(db, user_id, tournament_id):
        raise ValueError("User already in waitlist for this tournament")

    # Add to waitlist using repository
    return waitlist_repository.add_to_waitlist(db, user_id, tournament_id)


def remove_from_waitlist(db: Session, user_id: UUID, tournament_id: UUID) -> bool:
    """Remove user from waitlist using repository"""
    return waitlist_repository.remove_from_waitlist(db, user_id, tournament_id)
