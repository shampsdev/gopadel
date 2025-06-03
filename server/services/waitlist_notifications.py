from typing import List
from uuid import UUID

from aiogram import Bot
from db.models.tournament import Tournament
from db.models.waitlist import Waitlist
from repositories import waitlist_repository
from sqlalchemy.orm import Session, joinedload


async def notify_waitlist_users(bot: Bot, db: Session, tournament_id: UUID):
    """
    Уведомляет всех пользователей из списка ожидания о том, что освободилось место
    Не создает автоматическую регистрацию - только уведомляет
    """
    try:
        # Получаем информацию о турнире
        tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
        if not tournament:
            print(f"Tournament with id {tournament_id} not found")
            return

        # Получаем всех пользователей из waitlist
        waitlist_users = (
            db.query(Waitlist)
            .options(joinedload(Waitlist.user))
            .filter(Waitlist.tournament_id == tournament_id)
            .order_by(Waitlist.date)
            .all()
        )

        if not waitlist_users:
            print(f"No users in waitlist for tournament {tournament.name}")
            return

        print(
            f"Notifying {len(waitlist_users)} users about free spot in tournament {tournament.name}"
        )

        # Уведомляем всех пользователей из waitlist
        for waitlist_entry in waitlist_users:
            try:
                message = (
                    f"🎾 Освободилось место в турнире '{tournament.name}'!\n\n"
                    f"Теперь вы можете зарегистрироваться на турнир.\n"
                    f"Откройте приложение и нажмите кнопку 'Зарегистрироваться'."
                )

                await bot.send_message(waitlist_entry.user.telegram_id, message)
                print(
                    f"Notification sent to user {waitlist_entry.user.first_name} {waitlist_entry.user.second_name}"
                )

            except Exception as e:
                print(
                    f"Failed to send notification to user {waitlist_entry.user.id}: {e}"
                )
                continue

    except Exception as e:
        print(f"Error in notify_waitlist_users: {e}")


async def notify_tournament_cancelled(bot: Bot, db: Session, tournament_id: UUID):
    """
    Уведомляет пользователей из waitlist об отмене турнира
    """
    try:
        # Получаем информацию о турнире
        tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
        if not tournament:
            return

        # Получаем всех пользователей из waitlist
        waitlist_users = (
            db.query(Waitlist)
            .options(joinedload(Waitlist.user))
            .filter(Waitlist.tournament_id == tournament_id)
            .all()
        )

        if not waitlist_users:
            return

        # Уведомляем всех пользователей из waitlist об отмене
        for waitlist_entry in waitlist_users:
            try:
                message = (
                    f"❌ Турнир '{tournament.name}' был отменен.\n\n"
                    f"Вы были удалены из списка ожидания."
                )

                await bot.send_message(waitlist_entry.user.telegram_id, message)

            except Exception as e:
                print(
                    f"Failed to send cancellation notification to user {waitlist_entry.user.id}: {e}"
                )
                continue

    except Exception as e:
        print(f"Error in notify_tournament_cancelled: {e}")
