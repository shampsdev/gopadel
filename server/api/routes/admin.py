from uuid import UUID

from api.deps import SessionDep
from api.schemas.admin_user import AdminUserCreate, AdminUserResponse
from db.crud.admin_user import create_admin_user, delete_admin_user
from db.models.admin import AdminUser
from fastapi import APIRouter, HTTPException
from passlib.context import CryptContext

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


@router.post("/create", response_model=AdminUserResponse)
async def create_admin(admin_data: AdminUserCreate, db: SessionDep):
    existing_admin = (
        db.query(AdminUser).filter(AdminUser.username == admin_data.username).first()
    )
    if existing_admin:
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed_password = hash_password(admin_data.password)

    admin = create_admin_user(
        db=db,
        username=admin_data.username,
        password_hash=hashed_password,
        first_name=admin_data.first_name,
        last_name=admin_data.last_name,
        is_superuser=admin_data.is_superuser,
        is_active=admin_data.is_active,
    )

    return admin


@router.delete("/{admin_id}", status_code=204)
async def delete_admin(admin_id: UUID, db: SessionDep):
    success = delete_admin_user(db, admin_id)
    if not success:
        raise HTTPException(status_code=404, detail="Admin not found")
