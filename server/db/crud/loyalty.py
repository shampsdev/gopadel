from typing import Any, Dict, List, Optional

from db.models.loyalty import Loyalty
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session


def get_loyalties(db: Session) -> List[Loyalty]:
    return db.query(Loyalty).all()


def get_loyalty_by_id(db: Session, loyalty_id: int) -> Optional[Loyalty]:
    return db.query(Loyalty).filter(Loyalty.id == loyalty_id).first()


def create_loyalty(
    db: Session,
    name: str,
    discount: int,
    description: Optional[str] = None,
    requirements: Optional[Dict[str, Any]] = None,
) -> Loyalty:
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


def update_loyalty(
    db: Session,
    loyalty_id: int,
    name: Optional[str] = None,
    discount: Optional[int] = None,
    description: Optional[str] = None,
    requirements: Optional[Dict[str, Any]] = None,
) -> Optional[Loyalty]:
    loyalty = db.query(Loyalty).filter(Loyalty.id == loyalty_id).first()
    if not loyalty:
        return None

    if name is not None:
        loyalty.name = name
    if discount is not None:
        loyalty.discount = discount
    if description is not None:
        loyalty.description = description
    if requirements is not None:
        loyalty.requirements = requirements

    db.commit()
    db.refresh(loyalty)
    return loyalty


def delete_loyalty(db: Session, loyalty_id: int) -> bool:
    loyalty = db.query(Loyalty).filter(Loyalty.id == loyalty_id).first()
    if not loyalty:
        return False

    try:
        db.delete(loyalty)
        db.commit()
        return True
    except SQLAlchemyError:
        db.rollback()
        return False
