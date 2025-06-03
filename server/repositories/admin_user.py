from typing import Optional
from uuid import UUID

from db.models.admin import AdminUser
from passlib.context import CryptContext
from repositories.base import BaseRepository
from sqlalchemy.orm import Session

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AdminUserRepository(BaseRepository[AdminUser]):
    """Repository for AdminUser model"""

    def __init__(self):
        super().__init__(AdminUser)

    def get_by_username(self, db: Session, username: str) -> Optional[AdminUser]:
        """Get admin user by username"""
        return db.query(AdminUser).filter(AdminUser.username == username).first()

    def create_admin(
        self,
        db: Session,
        username: str,
        password: str,
        first_name: str,
        last_name: str,
        is_active: bool = True,
        is_superuser: bool = False,
        user_id: Optional[UUID] = None,
    ) -> AdminUser:
        """Create new admin user"""
        hashed_password = pwd_context.hash(password)
        admin = AdminUser(
            username=username,
            password_hash=hashed_password,
            first_name=first_name,
            last_name=last_name,
            is_active=is_active,
            is_superuser=is_superuser,
            user_id=user_id,
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        return admin

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password"""
        return pwd_context.verify(plain_password, hashed_password)

    def authenticate(
        self, db: Session, username: str, password: str
    ) -> Optional[AdminUser]:
        """Authenticate admin user"""
        admin = self.get_by_username(db, username)
        if not admin:
            return None
        if not self.verify_password(password, admin.password_hash):
            return None
        return admin

    def update_admin(
        self, db: Session, admin: AdminUser, update_data: dict
    ) -> AdminUser:
        """Update admin user"""
        # Handle password update
        if "password" in update_data:
            update_data["password_hash"] = pwd_context.hash(update_data["password"])
            del update_data["password"]

        # Update fields
        for field, value in update_data.items():
            if hasattr(admin, field) and value is not None:
                setattr(admin, field, value)

        db.commit()
        db.refresh(admin)
        return admin

    def delete_admin(self, db: Session, admin_id: UUID) -> bool:
        """Delete admin user"""
        admin = db.query(AdminUser).filter(AdminUser.id == admin_id).first()
        if not admin:
            return False

        db.delete(admin)
        db.commit()
        return True

    def get_all_admins(self, db: Session) -> list[AdminUser]:
        """Get all admin users"""
        return db.query(AdminUser).all()
