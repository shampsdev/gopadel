from typing import TYPE_CHECKING, Any, Dict, List

from db import Base
from sqlalchemy import JSON, SmallInteger, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from db.models.user import User


class Loyalty(Base):
    __tablename__ = "loyalties"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    discount: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    requirements: Mapped[Dict[str, Any] | None] = mapped_column(JSON, nullable=True)

    users: Mapped[list["User"]] = relationship("User", back_populates="loyalty")
