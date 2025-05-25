from typing import Optional
from uuid import UUID

from db.models.admin import AdminUser
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session


def get_admin_by_id(db: Session, admin_id: UUID) -> Optional[AdminUser]:
    return db.query(AdminUser).filter(AdminUser.id == admin_id).first()


def get_admin_by_username(db: Session, username: str) -> Optional[AdminUser]:
    return db.query(AdminUser).filter(AdminUser.username == username).first()


def create_admin_user(
    db: Session,
    username: str,
    password_hash: str,
    first_name: str,
    last_name: str,
    is_superuser: bool = False,
    is_active: bool = True,
    user_id: Optional[UUID] = None,
) -> AdminUser:
    admin = AdminUser(
        username=username,
        password_hash=password_hash,
        first_name=first_name,
        last_name=last_name,
        is_superuser=is_superuser,
        is_active=is_active,
        user_id=user_id,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin


def update_admin_user(
    db: Session,
    admin_id: UUID,
    username: Optional[str] = None,
    password_hash: Optional[str] = None,
    first_name: Optional[str] = None,
    last_name: Optional[str] = None,
    is_superuser: Optional[bool] = None,
    is_active: Optional[bool] = None,
    user_id: Optional[UUID] = None,
) -> Optional[AdminUser]:
    admin = db.query(AdminUser).filter(AdminUser.id == admin_id).first()
    if not admin:
        return None

    if username:
        admin.username = username
    if password_hash:
        admin.password_hash = password_hash
    if first_name:
        admin.first_name = first_name
    if last_name:
        admin.last_name = last_name
    if is_superuser is not None:
        admin.is_superuser = is_superuser
    if is_active is not None:
        admin.is_active = is_active
    if user_id is not None:
        admin.user_id = user_id

    db.commit()
    db.refresh(admin)
    return admin


def delete_admin_user(db: Session, admin_id: UUID) -> bool:
    admin = db.query(AdminUser).filter(AdminUser.id == admin_id).first()
    if not admin:
        return False

    try:
        db.delete(admin)
        db.commit()
        return True
    except SQLAlchemyError:
        db.rollback()
        return False
