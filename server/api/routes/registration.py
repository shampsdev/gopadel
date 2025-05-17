from fastapi import APIRouter, HTTPException

from api.deps import SessionDep, UserDep
from api.schemas.registration import RegistrationResponse
from db.crud import tournament as tournament_crud, registration as registration_crud
from uuid import UUID

from services.payments import create_invoice

router = APIRouter()


@router.post("/{tournament_id}", response_model=RegistrationResponse)
async def get_tournament(db: SessionDep, tournament_id: UUID, user: UserDep):
    tournament = tournament_crud.get_tournament_with_participants_by_id(
        db, tournament_id
    )
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    if tournament.price > 0:
        payment = create_invoice(db, tournament, tournament.name)
    else:
        payment = None

    registration = registration_crud.create_registration(
        db, tournament_id, user.id, payment.id if payment else None
    )

    return registration
