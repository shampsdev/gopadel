from fastapi import APIRouter, HTTPException
from db.crud import user
from api.deps import SessionDep, UserDep
from api.schemas.user import UserBase, UserRegister, UserUpdate

router = APIRouter()


@router.get("/me", response_model=UserBase)
async def get_me(user: UserDep):
    return user


@router.post("/register")
async def register(register_data: UserRegister, db: SessionDep, current_user: UserDep):
    if current_user.is_registered:
        raise HTTPException(status_code=400, detail="User already registered")

    updated_user = user.register_user(db, current_user, register_data)
    return updated_user


@router.patch("/me")
async def update_me(update_data: UserUpdate, db: SessionDep, current_user: UserDep):
    updated_user = user.update_user(db, current_user, update_data)
    return updated_user
