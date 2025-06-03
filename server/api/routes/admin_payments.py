from typing import Optional
from uuid import UUID

from api.deps import SessionDep
from api.schemas.admin_payment import PaymentResponse, PaymentWithRegistration
from api.utils.admin_middleware import admin_required
from db.models.payment import Payment, PaymentStatus
from db.models.registration import Registration
from fastapi import APIRouter, HTTPException, Query, Request, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from repositories import payment_repository
from sqlalchemy import desc
from sqlalchemy.orm import joinedload

router = APIRouter()
security = HTTPBearer()


@router.get("/", response_model=PaymentResponse)
@admin_required
async def get_payments(
    request: Request,
    db: SessionDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    user_id: Optional[str] = None,
    tournament_id: Optional[str] = None,
    status: Optional[str] = None,
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """
    Get all payments with pagination.
    Optionally filter by user_id, tournament_id, or status.
    """
    # Convert status string to enum if provided
    payment_status = None
    if status:
        try:
            payment_status = PaymentStatus(status)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid payment status")

    # Use repository to get filtered payments
    payments = payment_repository.get_filtered_payments(
        db=db,
        skip=skip,
        limit=limit,
        status=payment_status,
        tournament_id=UUID(tournament_id) if tournament_id else None,
        user_id=UUID(user_id) if user_id else None,
    )

    # Count total matching records
    total = payment_repository.count_filtered_payments(
        db=db,
        status=payment_status,
        tournament_id=UUID(tournament_id) if tournament_id else None,
        user_id=UUID(user_id) if user_id else None,
    )

    # Convert to schema
    payment_list = []
    for payment in payments:
        payment_data = {
            "id": str(payment.id),
            "payment_id": payment.payment_id,
            "date": payment.date.isoformat(),
            "amount": payment.amount,
            "payment_link": payment.payment_link,
            "status": payment.status,
        }

        # Add registration data if available
        if payment.registration:
            registration_data = {
                "id": str(payment.registration.id),
                "user_id": str(payment.registration.user_id),
                "tournament_id": str(payment.registration.tournament_id),
                "status": payment.registration.status,
                "date": payment.registration.date.isoformat(),
            }

            # Add user data if available
            if payment.registration.user:
                user = payment.registration.user
                registration_data["user"] = {
                    "id": str(user.id),
                    "first_name": user.first_name,
                    "second_name": user.second_name,
                    "city": user.city,
                }

            # Add tournament data if available
            if payment.registration.tournament:
                tournament = payment.registration.tournament
                registration_data["tournament"] = {
                    "id": str(tournament.id),
                    "name": tournament.name,
                }

            payment_data["registration"] = registration_data

        payment_list.append(payment_data)

    return {"payments": payment_list, "total": total}


@router.get("/{payment_id}", response_model=PaymentWithRegistration)
@admin_required
async def get_payment(
    payment_id: str,
    request: Request,
    db: SessionDep,
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """
    Get a specific payment by ID.
    """
    payment = (
        db.query(Payment)
        .filter(Payment.id == payment_id)
        .options(
            joinedload(Payment.registration).joinedload(Registration.user),
            joinedload(Payment.registration).joinedload(Registration.tournament),
        )
        .first()
    )

    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    return payment
