from typing import List, Optional

from db.models.loyalty import Loyalty
from repositories.base import BaseRepository
from sqlalchemy.orm import Session


class LoyaltyRepository(BaseRepository[Loyalty]):
    """Repository for Loyalty model"""

    def __init__(self):
        super().__init__(Loyalty)

    def get_all_loyalty_levels(self, db: Session) -> List[Loyalty]:
        """Get all loyalty levels"""
        return db.query(Loyalty).all()

    def create_loyalty_level(
        self,
        db: Session,
        name: str,
        discount: int,
        description: Optional[str] = None,
        requirements: Optional[dict] = None,
    ) -> Loyalty:
        """Create new loyalty level"""
        loyalty = Loyalty(
            name=name,
            discount=discount,
            description=description,
            requirements=requirements,
        )
        db.add(loyalty)
        db.commit()
        db.refresh(loyalty)
        return loyalty

    def update_loyalty_level(
        self, db: Session, loyalty_id: int, update_data: dict
    ) -> Optional[Loyalty]:
        """Update loyalty level"""
        loyalty = self.get(db, loyalty_id)
        if not loyalty:
            return None

        for field, value in update_data.items():
            if hasattr(loyalty, field) and value is not None:
                setattr(loyalty, field, value)

        db.commit()
        db.refresh(loyalty)
        return loyalty

    def delete_loyalty_level(self, db: Session, loyalty_id: int) -> bool:
        """Delete loyalty level"""
        loyalty = self.get(db, loyalty_id)
        if not loyalty:
            return False

        db.delete(loyalty)
        db.commit()
        return True
