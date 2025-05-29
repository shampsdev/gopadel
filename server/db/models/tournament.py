from datetime import datetime
from typing import TYPE_CHECKING, Optional
from uuid import UUID

from db import Base
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from db.models.registration import Registration
    from db.models.user import User
    from db.models.waitlist import Waitlist


class Tournament(Base):
    __tablename__ = "tournaments"

    id: Mapped[UUID] = mapped_column(
        primary_key=True, server_default=text("gen_random_uuid()")
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    start_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    rank_min: Mapped[float] = mapped_column(Float, nullable=False)
    rank_max: Mapped[float] = mapped_column(Float, nullable=False)
    max_users: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    organizator_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)

    organizator: Mapped["User"] = relationship("User", back_populates="tournaments")

    registrations: Mapped[list["Registration"]] = relationship(
        "Registration", back_populates="tournament"
    )
    waitlist_entries: Mapped[list["Waitlist"]] = relationship(
        "Waitlist", back_populates="tournament"
    )

    @property
    def registrations_count(self) -> int:
        return len(self.registrations)
