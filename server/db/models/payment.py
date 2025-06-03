import enum
from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

from db import Base
from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from db.models.registration import Registration


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    WAITING_FOR_CAPTURE = "waiting_for_capture"
    SUCCEEDED = "succeeded"
    CANCELED = "canceled"


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    payment_id: Mapped[str] = mapped_column(String(255), nullable=False)
    confirmation_token: Mapped[str] = mapped_column(String(255), nullable=False)
    date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    payment_link: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(255), nullable=False)

    registration: Mapped["Registration"] = relationship(
        "Registration", back_populates="payment"
    )
