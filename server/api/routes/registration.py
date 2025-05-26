from fastapi import APIRouter, HTTPException

from api.deps import SessionDep, UserDep
from api.schemas.registration import RegistrationResponse
from config import settings
from db.crud import tournament as tournament_crud, registration as registration_crud
from uuid import UUID

from db.models.registration import RegistrationStatus
from services.payments import create_invoice

router = APIRouter()


@router.post("/{tournament_id}", response_model=RegistrationResponse)
async def get_tournament(db: SessionDep, tournament_id: UUID, user: UserDep):
    tournament = tournament_crud.get_tournament_with_participants_by_id(
        db, tournament_id
    )
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    registration = registration_crud.get_registration_by_user_and_tournament(
        db, user.id, tournament_id
    )
    discount = user.loyalty.discount if user.loyalty else 0
    price = round(tournament.price * (1 - discount / 100))
    is_free = price == 0

    reserved_users = len([r for r in tournament.registrations if r.status in (RegistrationStatus.ACTIVE, RegistrationStatus.PENDING)])
    if reserved_users >= tournament.max_users:
        raise HTTPException(status_code=400, detail="Tournament is full")

    if registration:
        if registration.status == RegistrationStatus.PENDING:
            return registration
        elif registration.status == RegistrationStatus.ACTIVE:
            raise HTTPException(
                status_code=400, detail="User already registered for this tournament"
            )
        else:
            registration_crud.update_registration_status(
                db, registration.id, RegistrationStatus.PENDING
            )
    payment = (
        create_invoice(
            db,
            tournament,
            discount,
            settings.FRONTEND_URL + "/tournament/" + str(tournament_id),
        )
        if not is_free
        else None
    )
    if registration:
        registration_crud.update_registration_payment(
            db, registration.id, payment.id if payment else None
        )

    else:
        registration = registration_crud.create_registration(
            db,
            tournament_id,
            user.id,
            payment.id if payment else None,
            RegistrationStatus.ACTIVE if is_free else RegistrationStatus.PENDING,
        )


    return registration


@router.delete("/{tournament_id}", response_model=RegistrationResponse)
async def delete_registration(db: SessionDep, tournament_id: UUID, user: UserDep):
    registration = registration_crud.get_registration_by_user_and_tournament(
        db, user.id, tournament_id
    )
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    if registration.status != RegistrationStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Registration is not active")
    registration_crud.update_registration_status(db, registration.id, RegistrationStatus.CANCELED_BY_USER)
    return registration
