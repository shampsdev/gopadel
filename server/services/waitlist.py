from aiogram import Bot
from sqlalchemy.orm import Session
from uuid import UUID
from db.models.registration import Registration, RegistrationStatus
from db.models.waitlist import Waitlist
from db.models.tournament import Tournament
from sqlalchemy.orm import joinedload


async def notify_waitlist(bot: Bot, db: Session, tournament_id: UUID):
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise ValueError("Tournament not found")

    reserved_users = len([r for r in tournament.registrations if r.status in (RegistrationStatus.ACTIVE, RegistrationStatus.PENDING)])
    if reserved_users >= tournament.max_users:
        return

    waitlist = db.query(Waitlist).options(joinedload(Waitlist.user)).filter(Waitlist.tournament_id == tournament_id).all()
    for waitlist_entry in waitlist:
        await bot.send_message(waitlist_entry.user.telegram_id, f"You are on the waitlist for {tournament.name}")
