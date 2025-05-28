from datetime import date
from typing import TYPE_CHECKING, Optional
from uuid import UUID
import uuid

from sqlalchemy import BigInteger, Boolean, String, Float, Date, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db import Base

if TYPE_CHECKING:
    from db.models.loyalty import Loyalty
    from db.models.tournament import Tournament
    from db.models.registration import Registration
    from db.models.waitlist import Waitlist


class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    telegram_id: Mapped[int] = mapped_column(BigInteger, unique=True, nullable=False)
    username: Mapped[Optional[str]] = mapped_column(
        String(255), unique=True, nullable=True
    )
    first_name: Mapped[str] = mapped_column(String(255), nullable=False)
    second_name: Mapped[str] = mapped_column(String(255), nullable=False)
    bio: Mapped[str] = mapped_column(Text, nullable=False, default="")
    avatar: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    rank: Mapped[float] = mapped_column(Float, nullable=False)
    city: Mapped[str] = mapped_column(String(255), nullable=False)
    birth_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    loyalty_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("loyalties.id"), nullable=False
    )
    is_registered: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    loyalty: Mapped["Loyalty"] = relationship("Loyalty", back_populates="users")
    registrations: Mapped[list["Registration"]] = relationship(
        "Registration", back_populates="user"
    )
    waitlist_entries: Mapped[list["Waitlist"]] = relationship(
        "Waitlist", back_populates="user"
    )
    tournaments: Mapped[list["Tournament"]] = relationship(
        "Tournament", back_populates="organizator"
    )

    @property
    def birth_date_ru(self) -> str | None:
        if self.birth_date:
            return self.birth_date.strftime("%d.%m.%Y")
        return None
