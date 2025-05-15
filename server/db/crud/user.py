from sqlalchemy.orm import Session

from db.models.user import User
from api.schemas.user import UserRegister, UserUpdate


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
        avatar="",
        rank=0,
        city="",
        birth_date=None,
        loyalty_id=1,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def register_user(db: Session, user: User, register_data: UserRegister) -> User:
    """Update user data during registration"""
    user.first_name = register_data.first_name
    user.second_name = register_data.second_name
    user.birth_date = register_data.birth_date
    user.city = register_data.city
    user.rank = register_data.rank
    user.is_registered = True

    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user: User, update_data: UserUpdate) -> User:
    """Update user profile data"""
    user.first_name = update_data.first_name
    user.second_name = update_data.second_name
    user.birth_date = update_data.birth_date
    user.city = update_data.city
    user.rank = update_data.rank

    db.commit()
    db.refresh(user)
    return user
