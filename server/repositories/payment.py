from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID, uuid4
from zoneinfo import ZoneInfo

from db.models.payment import Payment, PaymentStatus
from db.models.tournament import Tournament
from repositories.base import BaseRepository
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session, joinedload


class PaymentRepository(BaseRepository[Payment]):
    """Repository for Payment model"""

    def __init__(self):
        super().__init__(Payment)

    def get_by_payment_id(self, db: Session, payment_id: str) -> Optional[Payment]:
        """Get payment by YooKassa payment ID"""
        return db.query(Payment).filter(Payment.payment_id == payment_id).first()

    def create_payment(
        self,
        db: Session,
        payment_id: str,
        amount: int,
        payment_link: str,
        status: str,
        confirmation_token: str = "",
        registration_id: Optional[UUID] = None,
    ) -> Payment:
        """Create a new payment record"""
        payment = Payment(
            id=uuid4(),
            payment_id=payment_id,
            date=datetime.now(ZoneInfo("Europe/Moscow")),
            amount=amount,
            payment_link=payment_link,
            status=status,
            confirmation_token=confirmation_token,
            registration_id=registration_id,
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)
        return payment

    def update_payment_status(
        self, db: Session, payment: Payment, status: str, **kwargs
    ) -> Payment:
        """Update payment status and additional fields"""
        payment.status = status

        # Update additional fields
        for field, value in kwargs.items():
            if hasattr(payment, field):
                setattr(payment, field, value)

        db.commit()
        db.refresh(payment)
        return payment

    def get_filtered_payments(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 20,
        status: Optional[PaymentStatus] = None,
        tournament_id: Optional[UUID] = None,
        user_id: Optional[UUID] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
    ) -> List[Payment]:
        """Get payments with filters"""
        query = db.query(Payment).options(
            joinedload(Payment.registration).joinedload(
                Payment.registration.property.mapper.class_.user
            ),
            joinedload(Payment.registration).joinedload(
                Payment.registration.property.mapper.class_.tournament
            ),
        )

        # Apply filters
        if status:
            query = query.filter(Payment.status == status.value)

        if tournament_id:
            query = query.join(Payment.registration).filter(
                Payment.registration.property.mapper.class_.tournament_id
                == tournament_id
            )

        if user_id:
            query = query.join(Payment.registration).filter(
                Payment.registration.property.mapper.class_.user_id == user_id
            )

        if date_from:
            query = query.filter(Payment.date >= date_from)

        if date_to:
            query = query.filter(Payment.date <= date_to)

        # Add pagination
        return query.offset(skip).limit(limit).all()

    def count_filtered_payments(
        self,
        db: Session,
        status: Optional[PaymentStatus] = None,
        tournament_id: Optional[UUID] = None,
        user_id: Optional[UUID] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
    ) -> int:
        """Count payments with filters"""
        query = db.query(Payment)

        # Apply same filters as get_filtered_payments
        if status:
            query = query.filter(Payment.status == status.value)

        if tournament_id:
            query = query.join(Payment.registration).filter(
                Payment.registration.property.mapper.class_.tournament_id
                == tournament_id
            )

        if user_id:
            query = query.join(Payment.registration).filter(
                Payment.registration.property.mapper.class_.user_id == user_id
            )

        if date_from:
            query = query.filter(Payment.date >= date_from)

        if date_to:
            query = query.filter(Payment.date <= date_to)

        return query.count()

    def get_registration_payments(
        self, db: Session, registration_id: UUID
    ) -> List[Payment]:
        """Get all payments for a registration"""
        return (
            db.query(Payment)
            .filter(Payment.registration_id == registration_id)
            .order_by(Payment.date.desc())
            .all()
        )

    def get_latest_active_payment(
        self, db: Session, registration_id: UUID
    ) -> Optional[Payment]:
        """Get the latest active payment for a registration (pending, waiting_for_capture, or succeeded)"""
        active_statuses = ["pending", "waiting_for_capture", "succeeded"]
        return (
            db.query(Payment)
            .filter(
                Payment.registration_id == registration_id, 
                Payment.status.in_(active_statuses)
            )
            .order_by(Payment.date.desc())
            .first()
        )
