from datetime import date
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import String, Float, Date, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db import Base

if TYPE_CHECKING:
    from db.models.loyalty import Loyalty
    from db.models.registration import Registration
    from db.models.waitlist import Waitlist


class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    telegram_id: Mapped[int] = mapped_column(unique=True, nullable=False)
    username: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    first_name: Mapped[str] = mapped_column(String(255), nullable=False)
    second_name: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar: Mapped[str] = mapped_column(String(255), nullable=False)
    rank: Mapped[float] = mapped_column(Float, nullable=False)
    city: Mapped[str] = mapped_column(String(255), nullable=False)
    birth_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    loyalty_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("loyalties.id"), nullable=True)

    loyalty: Mapped["Loyalty"] = relationship("Loyalty", back_populates="users")
    registrations: Mapped[list["Registration"]] = relationship("Registration", back_populates="user")
    waitlist_entries: Mapped[list["Waitlist"]] = relationship("Waitlist", back_populates="user") 