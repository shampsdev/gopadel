from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db import Base

if TYPE_CHECKING:
    from db.models.user import User
    from db.models.tournament import Tournament


class Waitlist(Base):
    __tablename__ = "waitlists"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=True)
    tournament_id: Mapped[UUID] = mapped_column(
        ForeignKey("tournaments.id"), nullable=True
    )
    date: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="waitlist_entries")
    tournament: Mapped["Tournament"] = relationship(
        "Tournament", back_populates="waitlist_entries"
    )
