from api.deps import SessionDep
from api.schemas.admin_auth import AdminLogin, AdminMe, PasswordChange, Token
from api.utils.admin_middleware import admin_required
from api.utils.jwt import create_access_token, get_password_hash, verify_password
from db.crud.admin_user import get_admin_by_username, update_admin_user
from fastapi import APIRouter, Depends, HTTPException, Request, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

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


@router.post("/change-password", status_code=200)
@admin_required
async def change_password(
    password_data: PasswordChange,
    request: Request,
    db: SessionDep,
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    admin = request.state.admin

    # Verify old password
    if not verify_password(password_data.old_password, admin.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect current password")

    # Hash the new password
    new_password_hash = get_password_hash(password_data.new_password)

    # Update the admin's password
    update_admin_user(db=db, admin_id=admin.id, password_hash=new_password_hash)

    return {"message": "Password updated successfully"}
