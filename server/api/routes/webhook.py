import json

from api.deps import SessionDep
from bot.init_bot import bot
from db.models.registration import RegistrationStatus
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from repositories import payment_repository, registration_repository, tournament_repository
from services.payments import configure_yookassa
from services.tournament_tasks import tournament_task_service
from yookassa import Payment as YooKassaPayment
from yookassa.domain.notification import WebhookNotification

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

    payment_id = event.object.id
    yoo_payment = YooKassaPayment.find_one(payment_id)

    if not yoo_payment:
        raise HTTPException(status_code=400, detail="Payment not found")

    payment_status = str(yoo_payment.status)
    if payment_status != event.object.status:
        raise HTTPException(status_code=400, detail="Status mismatch")

    # Get payment from database
    payment = payment_repository.get_by_payment_id(db, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found in database")

    # Update payment status if changed
    if payment.status != payment_status:
        payment = payment_repository.update_payment_status(db, payment, payment_status)
        if not payment:
            raise HTTPException(
                status_code=500, detail="Failed to update payment status"
            )

    # If payment status is successful and payment has registration, update registration status
    if payment_status == "succeeded" and payment.registration:
        # Update registration status if it was pending
        if payment.registration.status == RegistrationStatus.PENDING:
            registration = registration_repository.update_registration_status(
                db, payment.registration.id, RegistrationStatus.ACTIVE
            )
            if not registration:
                raise HTTPException(
                    status_code=500, detail="Failed to update registration status"
                )
            
            # Получаем данные турнира для отправки задачи
            tournament = tournament_repository.get(db, registration.tournament_id)
            if tournament:
                # Отправляем задачу об успешной оплате
                await tournament_task_service.send_payment_success_task(
                    user_id=registration.user_id,
                    tournament_id=registration.tournament_id,
                    registration_id=registration.id,
                    tournament_name=tournament.name,
                    user_telegram_id=registration.user.telegram_id,
                    payment_amount=float(payment.amount)
                )
                
                # Отменяем все отложенные задачи напоминания об оплате
                await tournament_task_service.cancel_pending_tasks(
                    user_id=registration.user_id,
                    tournament_id=registration.tournament_id,
                    registration_id=registration.id,
                    user_telegram_id=registration.user.telegram_id,
                )
                
    elif payment_status == "canceled" and payment.registration:
        # При отмененном платеже регистрация остается в статусе PENDING,
        # чтобы пользователь мог создать новый платеж.
        # Регистрация переходит в CANCELED только при отмене пользователем
        pass

    return {"status": "success"}
