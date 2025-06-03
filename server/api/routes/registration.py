from uuid import UUID

from api.deps import SessionDep, UserDep
from api.schemas.registration import RegistrationResponse
from api.schemas.waitlist import WaitlistResponse
from bot.init_bot import bot
from db.models.registration import RegistrationStatus
from fastapi import APIRouter, HTTPException
from repositories import (
    registration_repository,
    tournament_repository,
    waitlist_repository,
)
from services.payments import create_widget_payment
from services.waitlist import notify_waitlist

router = APIRouter()


@router.post("/{tournament_id}", response_model=RegistrationResponse)
async def register_for_tournament(db: SessionDep, tournament_id: UUID, user: UserDep):
    tournament = tournament_repository.get(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    registration = registration_repository.get_user_tournament_registration(
        db, user.id, tournament_id
    )

    # Check if user is already in waitlist
    in_waitlist = waitlist_repository.check_waitlist_exists(db, user.id, tournament_id)

    discount = user.loyalty.discount if user.loyalty else 0
    price = round(tournament.price * (1 - discount / 100))
    is_free = price == 0

    # Get tournament registrations to check if full
    tournament_registrations = registration_repository.get_tournament_registrations(
        db, tournament_id
    )
    reserved_users = len(
        [
            r
            for r in tournament_registrations
            if r.status in (RegistrationStatus.ACTIVE, RegistrationStatus.PENDING)
        ]
    )

    # If tournament is full, add to waitlist instead of registering
    if reserved_users >= tournament.max_users:
        if registration and registration.status == RegistrationStatus.ACTIVE:
            raise HTTPException(
                status_code=400, detail="User already registered for this tournament"
            )

        # If user is already in waitlist, don't add again
        if in_waitlist:
            raise HTTPException(
                status_code=400,
                detail="User is already in waitlist for this tournament",
            )

        # Add to waitlist
        waitlist_repository.add_to_waitlist(db, user.id, tournament_id)
        raise HTTPException(
            status_code=400, detail="Tournament is full, added to waitlist"
        )

    # If user is in waitlist but there are free spots, remove from waitlist and register
    if in_waitlist:
        waitlist_repository.remove_from_waitlist(db, user.id, tournament_id)

    if registration:
        if registration.status == RegistrationStatus.PENDING:
            return registration
        elif registration.status == RegistrationStatus.ACTIVE:
            raise HTTPException(
                status_code=400, detail="User already registered for this tournament"
            )
        elif registration.status in (RegistrationStatus.CANCELED_BY_USER,):
            registration_repository.update_registration_status(
                db, registration.id, RegistrationStatus.ACTIVE
            )
        else:
            registration_repository.update_registration_status(
                db, registration.id, RegistrationStatus.PENDING
            )
    payment = (
        create_widget_payment(
            db,
            tournament,
            discount,
        )
        if not is_free
        else None
    )
    if registration:
        registration_repository.update_registration_payment(
            db, registration.id, payment.id if payment else None
        )

    else:
        registration = registration_repository.create_registration(
            db,
            user_id=user.id,
            tournament_id=tournament_id,
            payment_id=payment.id if payment else None,
            status=RegistrationStatus.ACTIVE if is_free else RegistrationStatus.PENDING,
        )

    return registration


@router.delete("/{tournament_id}", response_model=RegistrationResponse)
async def delete_registration(db: SessionDep, tournament_id: UUID, user: UserDep):
    registration = registration_repository.get_user_tournament_registration(
        db, user.id, tournament_id
    )
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    if registration.status != RegistrationStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Registration is not active")
    registration_repository.update_registration_status(
        db, registration.id, RegistrationStatus.CANCELED_BY_USER
    )
    # ВРЕМЕННО ОТКЛЮЧЕНО: автоматическая регистрация людей из waitlist
    await notify_waitlist(bot, db, tournament_id)
    return registration
