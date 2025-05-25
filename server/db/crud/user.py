from typing import Optional
from uuid import UUID

from api.schemas.user import UserRegister, UserUpdate
from db.models.user import User
from sqlalchemy.orm import Session


def get_or_create_user(db: Session, tg_id: int, username: str | None = None):
    user = db.query(User).filter(User.telegram_id == tg_id).first()
    if user:
        return user
    user = User(
        telegram_id=tg_id,
        username=username,
        is_registered=False,
        first_name="",
        second_name="",
        avatar='',
        rank=0,
        city="",
        birth_date=None,
        loyalty_id=1,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def register_user(db: Session, user: User, register_data: UserRegister, avatar: Optional[str] = None) -> User:
    """Update user data during registration"""
    user.first_name = register_data.first_name
    user.second_name = register_data.second_name
    user.birth_date = register_data.birth_date
    user.city = register_data.city
    user.rank = register_data.rank
    user.is_registered = True
    
    if avatar:
        user.avatar = avatar

    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user: User, update_data: UserUpdate, avatar: Optional[str] = None) -> User:
    """Update user data"""
    if update_data.first_name:
        user.first_name = update_data.first_name
    if update_data.second_name:
        user.second_name = update_data.second_name
    if update_data.birth_date:
        user.birth_date = update_data.birth_date
    if update_data.city:
        user.city = update_data.city
    if update_data.rank is not None:
        user.rank = update_data.rank
    
    if avatar:
        user.avatar = avatar

    db.commit()
    db.refresh(user)
    return user


def get_all_users(db: Session, skip: int = 0, limit: int = 100):
    """Get all users with pagination"""
    return db.query(User).offset(skip).limit(limit).all()


def get_user_by_id(db: Session, user_id: UUID) -> Optional[User]:
    """Get a user by ID"""
    return db.query(User).filter(User.id == user_id).first()


def update_user_by_admin(db: Session, user: User, update_data) -> User:
    """Update user data by admin"""
    if update_data.first_name is not None:
        user.first_name = update_data.first_name
    if update_data.second_name is not None:
        user.second_name = update_data.second_name
    if update_data.birth_date is not None:
        user.birth_date = update_data.birth_date
    if update_data.city is not None:
        user.city = update_data.city
    if update_data.rank is not None:
        user.rank = update_data.rank
    if update_data.is_registered is not None:
        user.is_registered = update_data.is_registered
    if update_data.loyalty_id is not None:
        user.loyalty_id = update_data.loyalty_id

    db.commit()
    db.refresh(user)
    return user
