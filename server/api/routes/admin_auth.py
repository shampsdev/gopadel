
from api.deps import SessionDep
from api.schemas.admin_auth import AdminLogin, AdminMe, Token
from api.utils.admin_middleware import admin_required
from api.utils.jwt import create_access_token, verify_password
from db.crud.admin_user import get_admin_by_username
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPBearer

router = APIRouter()
security = HTTPBearer()


@router.post("/login", response_model=Token)
async def login_for_access_token(admin_data: AdminLogin, db: SessionDep):
    admin = get_admin_by_username(db, admin_data.username)
    if not admin or not verify_password(admin_data.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    access_token = create_access_token(
        data={"sub": admin.username, "is_superuser": admin.is_superuser}
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=AdminMe, dependencies=[Depends(security)])
@admin_required
async def get_current_admin(request: Request, db: SessionDep):
    admin = request.state.admin
    return {"username": admin.username, "is_superuser": admin.is_superuser}
