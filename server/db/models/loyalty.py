from typing import TYPE_CHECKING

from sqlalchemy import String, SmallInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db import Base

if TYPE_CHECKING:
    from db.models.user import User


class Loyalty(Base):
    __tablename__ = "loyalties"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    discount: Mapped[int] = mapped_column(SmallInteger, nullable=False)

    users: Mapped[list["User"]] = relationship("User", back_populates="loyalty")
