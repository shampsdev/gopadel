from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from config import settings

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI), echo=settings.DEBUG)
SessionLocal = sessionmaker(bind=engine)


class Base(DeclarativeBase):
    pass
