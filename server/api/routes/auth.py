from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from api.auth import get_user
from db.crud import user
from api.deps import SessionDep, UserDep
from api.schemas.user import UserBase, UserRegister

router = APIRouter()


@router.get("/me", response_model=UserBase)
async def get_me(user: UserDep):
    return user


@router.post("/register")
async def register(register_data: UserRegister, db: SessionDep, current_user: UserDep):
    if current_user.is_registered:
        raise HTTPException(status_code=400, detail="User already registered")

    current_user.first_name = register_data.first_name
    current_user.second_name = register_data.second_name
    current_user.birth_date = register_data.birth_date
    current_user.city = register_data.city
    current_user.rank = register_data.rank
    current_user.is_registered = True
    db.commit()
    db.refresh(current_user)

    return current_user
