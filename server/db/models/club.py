from typing import TYPE_CHECKING, Optional
from uuid import UUID

from db import Base
from sqlalchemy import String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from db.models.tournament import Tournament


class Club(Base):
    __tablename__ = "clubs"

    id: Mapped[UUID] = mapped_column(
        primary_key=True, server_default=text("gen_random_uuid()")
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str] = mapped_column(String(500), nullable=False)

    tournaments: Mapped[list["Tournament"]] = relationship(
        "Tournament", back_populates="club"
    )
