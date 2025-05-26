from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from yookassa import Payment as YooKassaPayment

from api.deps import SessionDep
from db.crud.payment import get_payment_by_payment_id, update_payment_status
from db.crud.registration import update_registration_status
from db.models.payment import PaymentStatus
from db.models.registration import RegistrationStatus

router = APIRouter()


class EventObject(BaseModel):
    id: str
    status: str


class WebhookEvent(BaseModel):
    type: str
    event: str
    object: EventObject


@router.post("", tags=["webhook"])
async def webhook(request: Request, event: WebhookEvent, db: SessionDep):
    body_str = await request.body()
    print(f"Webhook request body: {body_str}")

    payment_id = event.object.id
    yoo_payment = YooKassaPayment.find_one(payment_id)

    if not yoo_payment:
        raise HTTPException(status_code=400, detail="Payment not found")

    payment_status = str(yoo_payment.status)
    if payment_status != event.object.status:
        raise HTTPException(status_code=400, detail="Status mismatch")

    # Get payment from database
    payment = get_payment_by_payment_id(db, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found in database")

    # Update payment status if changed
    if payment.status != payment_status:
        payment = update_payment_status(db, payment_id, payment_status)
        if not payment:
            raise HTTPException(
                status_code=500, detail="Failed to update payment status"
            )

    # If payment status is successful and payment has registration, update registration status
    if payment_status == PaymentStatus.SUCCEEDED and payment.registration:
        # Update registration status if it was pending
        if payment.registration.status == RegistrationStatus.PENDING:
            registration = update_registration_status(
                db, payment.registration.id, RegistrationStatus.ACTIVE
            )
            if not registration:
                raise HTTPException(
                    status_code=500, detail="Failed to update registration status"
                )
    elif payment_status == PaymentStatus.CANCELED and payment.registration:
        registration = update_registration_status(
            db, payment.registration.id, RegistrationStatus.CANCELED
        )
        if not registration:
            raise HTTPException(
                status_code=500, detail="Failed to update registration status"
            )

    return {"status": "success"}
