from api.deps import SessionDep, UserDep
from api.schemas.user import UserBase, UserRegister, UserUpdate
from fastapi import APIRouter, HTTPException

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


@router.patch("/me")
async def update_me(update_data: UserUpdate, db: SessionDep, current_user: UserDep):
    current_user.first_name = update_data.first_name
    current_user.second_name = update_data.second_name
    current_user.birth_date = update_data.birth_date
    current_user.city = update_data.city
    current_user.rank = update_data.rank
    db.commit()
    db.refresh(current_user)

    return current_user
