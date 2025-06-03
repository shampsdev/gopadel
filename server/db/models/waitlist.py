from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

from db import Base
from sqlalchemy import DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from db.models.tournament import Tournament
    from db.models.user import User


class Waitlist(Base):
    __tablename__ = "waitlists"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    tournament_id: Mapped[UUID] = mapped_column(
        ForeignKey("tournaments.id"), nullable=False
    )
    date: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="waitlist_entries")
    tournament: Mapped["Tournament"] = relationship(
        "Tournament", back_populates="waitlist_entries"
    )
