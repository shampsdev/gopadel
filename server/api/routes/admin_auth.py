from api.deps import SessionDep
from api.schemas.admin_auth import AdminLogin, AdminMe, PasswordChange, Token
from api.utils.admin_middleware import admin_required
from api.utils.jwt import create_access_token, get_password_hash, verify_password
from fastapi import APIRouter, Depends, HTTPException, Request, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from repositories import admin_user_repository

router = APIRouter()
security = HTTPBearer()


@router.post("/login", response_model=Token)
async def login_for_access_token(admin_data: AdminLogin, db: SessionDep):
    admin = admin_user_repository.authenticate(
        db, admin_data.username, admin_data.password
    )
    if not admin:
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
    if not admin_user_repository.verify_password(
        password_data.old_password, admin.password_hash
    ):
        raise HTTPException(status_code=400, detail="Incorrect current password")

    # Update the admin's password
    admin_user_repository.update_admin(
        db=db, admin=admin, update_data={"password": password_data.new_password}
    )

    return {"message": "Password updated successfully"}
