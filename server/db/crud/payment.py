from typing import Optional
from sqlalchemy.orm import Session
from uuid import UUID

from db.models.payment import Payment


def get_payment_by_payment_id(db: Session, payment_id: str) -> Optional[Payment]:
    """Get payment by YooKassa payment_id"""
    return db.query(Payment).filter(Payment.payment_id == payment_id).first()


def update_payment_status(db: Session, payment_id: str, status: str) -> Optional[Payment]:
    """Update payment status by YooKassa payment_id"""
    payment = get_payment_by_payment_id(db, payment_id)
    if payment:
        payment.status = status
        db.commit()
        db.refresh(payment)
    return payment 