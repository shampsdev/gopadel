from datetime import datetime
from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db import Base

if TYPE_CHECKING:
    from db.models.user import User
    from db.models.tournament import Tournament
    from db.models.payment import Payment


class Registration(Base):
    __tablename__ = "registrations"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    tournament_id: Mapped[UUID] = mapped_column(
        ForeignKey("tournaments.id"), nullable=False
    )
    date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[str] = mapped_column(String(255), nullable=False)
    payment_id: Mapped[Optional[UUID]] = mapped_column(
        ForeignKey("payments.id"), nullable=True
    )

    user: Mapped["User"] = relationship("User", back_populates="registrations")
    tournament: Mapped["Tournament"] = relationship(
        "Tournament", back_populates="registrations"
    )
    payment: Mapped["Payment"] = relationship("Payment", back_populates="registration")
