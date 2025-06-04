import enum
from datetime import datetime
from typing import TYPE_CHECKING, List
from uuid import UUID, uuid4

from db import Base
from sqlalchemy import DateTime, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from db.models.payment import Payment
    from db.models.tournament import Tournament
    from db.models.user import User


class RegistrationStatus(str, enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"
    CANCELED = "canceled"
    CANCELED_BY_USER = "canceled_by_user"


class Registration(Base):
    __tablename__ = "registrations"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    tournament_id: Mapped[UUID] = mapped_column(
        ForeignKey("tournaments.id"), nullable=False
    )
    date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[RegistrationStatus] = mapped_column(
        Enum(RegistrationStatus), nullable=False, default=RegistrationStatus.PENDING
    )

    user: Mapped["User"] = relationship("User", back_populates="registrations")
    tournament: Mapped["Tournament"] = relationship(
        "Tournament", back_populates="registrations"
    )
    payments: Mapped[List["Payment"]] = relationship(
        "Payment", back_populates="registration"
    )
