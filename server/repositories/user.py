from typing import Optional
from uuid import UUID

from api.schemas.user import UserRegister, UserUpdate
from db.models.user import PlayingPosition, User
from repositories.base import BaseRepository
from sqlalchemy.orm import Session


class UserRepository(BaseRepository[User]):
    """Repository for User model"""

    def __init__(self):
        super().__init__(User)

    def get_by_telegram_id(self, db: Session, telegram_id: int) -> Optional[User]:
        """Get user by telegram ID"""
        return db.query(User).filter(User.telegram_id == telegram_id).first()

    def get_or_create_user(
        self, db: Session, tg_id: int, username: str | None = None
    ) -> User:
        """Get existing user or create new one"""
        user = self.get_by_telegram_id(db, tg_id)
        if user:
            return user

        user = User(
            telegram_id=tg_id,
            username=username,
            is_registered=False,
            first_name="",
            second_name="",
            bio="",
            avatar=None,
            rank=0,
            city="",
            birth_date=None,
            loyalty_id=1,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def register_user(
        self,
        db: Session,
        user: User,
        register_data: UserRegister,
        avatar: Optional[str] = None,
    ) -> User:
        """Update user data during registration"""
        user.first_name = register_data.first_name
        user.second_name = register_data.second_name
        user.bio = register_data.bio
        user.birth_date = register_data.birth_date
        user.city = register_data.city
        user.rank = register_data.rank
        user.playing_position = register_data.playing_position
        user.padel_profiles = register_data.padel_profiles
        user.is_registered = True

        if avatar:
            user.avatar = avatar

        db.commit()
        db.refresh(user)
        return user

    def update_user(
        self,
        db: Session,
        user: User,
        update_data: UserUpdate,
        avatar: Optional[str] = None,
    ) -> User:
        """Update user data"""
        if update_data.first_name:
            user.first_name = update_data.first_name
        if update_data.second_name:
            user.second_name = update_data.second_name
        if update_data.bio is not None:
            user.bio = update_data.bio
        if update_data.birth_date:
            user.birth_date = update_data.birth_date
        if update_data.city:
            user.city = update_data.city
        if update_data.rank is not None:
            user.rank = update_data.rank

        user.playing_position = update_data.playing_position
        user.padel_profiles = update_data.padel_profiles

        if avatar:
            user.avatar = avatar

        db.commit()
        db.refresh(user)
        return user

    def update_user_by_admin(self, db: Session, user: User, update_data) -> User:
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
        if update_data.playing_position is not None:
            # Handle playing position enum conversion
            if isinstance(update_data.playing_position, str):
                position_lower = update_data.playing_position.lower()
                if position_lower in ["right", "left", "both"]:
                    user.playing_position = getattr(PlayingPosition, position_lower)
                else:
                    user.playing_position = None
            else:
                user.playing_position = update_data.playing_position
        if update_data.padel_profiles is not None:
            user.padel_profiles = update_data.padel_profiles
        if update_data.is_registered is not None:
            user.is_registered = update_data.is_registered
        if update_data.loyalty_id is not None:
            user.loyalty_id = update_data.loyalty_id

        db.commit()
        db.refresh(user)
        return user
