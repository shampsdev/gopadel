import enum
import uuid
from datetime import date
from typing import TYPE_CHECKING, Optional
from uuid import UUID

from db import Base
from sqlalchemy import (
    BigInteger,
    Boolean,
    Date,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from db.models.loyalty import Loyalty
    from db.models.registration import Registration
    from db.models.tournament import Tournament
    from db.models.waitlist import Waitlist


class PlayingPosition(str, enum.Enum):
    right = "right"  # В правом
    left = "left"  # В левом
    both = "both"  # В обоих


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
    playing_position: Mapped[Optional[PlayingPosition]] = mapped_column(
        Enum(PlayingPosition), nullable=True
    )
    padel_profiles: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
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
