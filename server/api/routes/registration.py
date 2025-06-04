from uuid import UUID

from api.deps import SessionDep, UserDep
from api.schemas.registration import RegistrationResponse
from api.schemas.waitlist import WaitlistResponse
from api.utils.tournament import is_tournament_finished
from bot.init_bot import bot
from config import settings
from db.models.registration import RegistrationStatus
from fastapi import APIRouter, HTTPException
from repositories import (
    payment_repository,
    registration_repository,
    tournament_repository,
    waitlist_repository,
)
from services.payments import create_invoice
from services.waitlist_notifications import notify_waitlist_users

router = APIRouter()


@router.post("/{tournament_id}", response_model=RegistrationResponse)
async def register_for_tournament(db: SessionDep, tournament_id: UUID, user: UserDep):
    tournament = tournament_repository.get(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    # Check if tournament is finished
    if is_tournament_finished(tournament):
        raise HTTPException(
            status_code=400, detail="Cannot register for a finished tournament"
        )

    # Check if user's rank is within tournament requirements
    if user.rank is not None:
        if not (user.rank >= tournament.rank_min and user.rank <= tournament.rank_max):
            raise HTTPException(
                status_code=400,
                detail=f"User rank {user.rank} is not within tournament requirements ({tournament.rank_min} - {tournament.rank_max})",
            )
    else:
        # Allow users without rank to join tournaments with min rank 0
        if tournament.rank_min > 0:
            raise HTTPException(
                status_code=400,
                detail="User must have a rank to register for this tournament",
            )

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
            # User already paid before, so return to ACTIVE status directly
            registration_repository.update_registration_status(
                db, registration.id, RegistrationStatus.ACTIVE
            )
        else:
            registration_repository.update_registration_status(
                db,
                registration.id,
                RegistrationStatus.ACTIVE if is_free else RegistrationStatus.PENDING,
            )

    # Don't create payment during registration, only set status
    if registration:
        pass  # Payments are now created separately, no need to clear anything
    else:
        registration = registration_repository.create_registration(
            db,
            user_id=user.id,
            tournament_id=tournament_id,
            status=RegistrationStatus.ACTIVE if is_free else RegistrationStatus.PENDING,
        )

    return registration


@router.delete(
    "/{tournament_id}/cancel-before-payment", response_model=RegistrationResponse
)
async def cancel_registration_before_payment(
    db: SessionDep, tournament_id: UUID, user: UserDep
):
    """Cancel registration before payment with CANCELLED status"""
    tournament = tournament_repository.get(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    # Check if tournament is finished
    if is_tournament_finished(tournament):
        raise HTTPException(
            status_code=400,
            detail="Cannot cancel registration for a finished tournament",
        )

    registration = registration_repository.get_user_tournament_registration(
        db, user.id, tournament_id
    )
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")

    # Only allow cancellation for pending registrations (before payment)
    if registration.status != RegistrationStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail="Can only cancel pending registrations before payment",
        )

    # Set status to CANCELLED for pending registrations (before payment)
    registration_repository.update_registration_status(
        db, registration.id, RegistrationStatus.CANCELED
    )

    # Уведомляем всех пользователей из waitlist о том, что освободилось место
    await notify_waitlist_users(bot, db, tournament_id)
    return registration


@router.delete("/{tournament_id}", response_model=RegistrationResponse)
async def delete_registration(db: SessionDep, tournament_id: UUID, user: UserDep):
    tournament = tournament_repository.get(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    # Check if tournament is finished
    if is_tournament_finished(tournament):
        raise HTTPException(
            status_code=400,
            detail="Cannot cancel registration for a finished tournament",
        )

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
    # Уведомляем всех пользователей из waitlist о том, что освободилось место
    await notify_waitlist_users(bot, db, tournament_id)
    return registration


@router.post("/{tournament_id}/create-payment", response_model=RegistrationResponse)
async def create_payment_for_tournament(
    db: SessionDep, tournament_id: UUID, user: UserDep
):
    """Create payment for existing pending registration"""
    tournament = tournament_repository.get(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    if is_tournament_finished(tournament):
        raise HTTPException(
            status_code=400, detail="Cannot create payment for a finished tournament"
        )

    registration = registration_repository.get_user_tournament_registration(
        db, user.id, tournament_id
    )
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")

    # Проверяем статус регистрации
    if registration.status == RegistrationStatus.ACTIVE:
        # Уже оплачена/активирована, повторно оплачивать нельзя
        raise HTTPException(
            status_code=400,
            detail="Registration is already active and cannot be paid again",
        )
    elif registration.status != RegistrationStatus.PENDING:
        # Любой другой (кроме PENDING) статус – запрещаем
        raise HTTPException(
            status_code=400, detail="Can only create payment for pending registrations"
        )

    # Если регистрация CANCELED, восстанавливаем в PENDING
    if registration.status == RegistrationStatus.CANCELED:
        registration_repository.update_registration_status(
            db, registration.id, RegistrationStatus.PENDING
        )

    # Проверяем, есть ли активный платёж для этой регистрации
    active_payment = payment_repository.get_latest_active_payment(db, registration.id)
    if active_payment:
        raise HTTPException(
            status_code=400,
            detail="Active payment already exists for this registration",
        )

    # Считаем итоговую стоимость с учётом скидки
    discount = user.loyalty.discount if user.loyalty else 0
    price = round(tournament.price * (1 - discount / 100))

    if price <= 0:
        # Турнир бесплатный (или полностью покрыт скидкой)
        registration_repository.update_registration_status(
            db, registration.id, RegistrationStatus.ACTIVE
        )
        return registration

    # Создаём новый платёж
    payment = create_invoice(
        db,
        tournament,
        discount,
        return_url=f"https://t.me/{settings.TG_BOT_USERNAME}/app?startapp=t-{tournament_id}",
        registration_id=registration.id,
    )

    # Обновляем данные регистрации со всеми платежами
    updated_registration = registration_repository.get_user_tournament_registration(
        db, user.id, tournament_id
    )

    return updated_registration
