from typing import Any, Dict, Generic, List, Optional, Type, TypeVar
from uuid import UUID

from db.models.admin import Base
from sqlalchemy import select
from sqlalchemy.orm import Session

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Base repository class with common CRUD operations"""

    def __init__(self, model: Type[ModelType]):
        """
        Initialize the repository
        Args:
            model: SQLAlchemy model class
        """
        self.model = model

    def get(self, db: Session, id: Any) -> Optional[ModelType]:
        """Get a single record by ID"""
        return db.query(self.model).filter(self.model.id == id).first()

    def get_all(self, db: Session, skip: int = 0, limit: int = 100) -> List[ModelType]:
        """Get all records with pagination"""
        return db.query(self.model).offset(skip).limit(limit).all()

    def create(self, db: Session, **kwargs) -> ModelType:
        """Create a new record"""
        db_obj = self.model(**kwargs)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self, db: Session, db_obj: ModelType, update_data: Dict[str, Any]
    ) -> ModelType:
        """Update a record"""
        for field, value in update_data.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, id: Any) -> bool:
        """Delete a record"""
        db_obj = self.get(db, id=id)
        if db_obj:
            db.delete(db_obj)
            db.commit()
            return True
        return False

    def commit(self, db: Session) -> None:
        """Commit changes"""
        db.commit()

    def refresh(self, db: Session, db_obj: ModelType) -> None:
        """Refresh object from database"""
        db.refresh(db_obj)

    def add(self, db: Session, db_obj: ModelType) -> None:
        """Add object to session"""
        db.add(db_obj)
