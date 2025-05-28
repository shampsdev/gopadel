import re
from aiohttp import ClientSession
from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form
from typing import Optional
import json
from datetime import date, datetime
from db.crud import user
from api.deps import SessionDep, UserDep
from api.schemas.user import UserBase, UserRegister, UserUpdate
from services.storage import Storage

router = APIRouter()


@router.get("/me", response_model=UserBase)
async def get_me(user: UserDep):
    return user


@router.post("/register")
async def register(
    db: SessionDep,
    current_user: UserDep,
    first_name: str = Form(...),
    second_name: str = Form(...),
    bio: str = Form(""),
    rank: float = Form(...),
    city: str = Form(...),
    birth_date: Optional[str] = Form(None),
    avatar: Optional[UploadFile] = File(None),
    telegram_photo_url: Optional[str] = Form(None)
):
    if current_user.is_registered:
        raise HTTPException(status_code=400, detail="User already registered")

    # Convert form data to UserRegister model
    register_data = UserRegister(
        first_name=first_name,
        second_name=second_name,
        bio=bio,
        rank=rank,
        city=city,
        birth_date=datetime.strptime(birth_date, "%Y-%m-%d").date() if birth_date else None
    )

    # Handle profile picture upload if provided
    avatar_url = None
    
    # If avatar file is uploaded, process it
    if avatar:
        storage = Storage()
        avatar_content = await avatar.read()
        avatar_url = storage.save_image_by_bytes(
            avatar_content,
            f"profile/{current_user.id}"
        )
    # If Telegram photo URL is provided, store it
    elif telegram_photo_url:
        storage = Storage()
        avatar_url = storage.save_image_by_url(
            telegram_photo_url,
            f"profile/{current_user.id}"
        )

    updated_user = user.register_user(db, current_user, register_data, avatar_url)
    return updated_user


@router.patch("/me")
async def update_me(
    db: SessionDep,
    current_user: UserDep,
    first_name: Optional[str] = Form(None),
    second_name: Optional[str] = Form(None),
    bio: Optional[str] = Form(None),
    rank: Optional[float] = Form(None),
    city: Optional[str] = Form(None),
    birth_date: Optional[str] = Form(None),
    avatar: Optional[UploadFile] = File(None),
    telegram_photo_url: Optional[str] = Form(None)
):
    # Convert form data to UserUpdate model
    update_data = UserUpdate(
        first_name=first_name,
        second_name=second_name,
        bio=bio,
        rank=rank,
        city=city,
        birth_date=datetime.strptime(birth_date, "%Y-%m-%d").date() if birth_date else None
    )

    # Handle profile picture upload if provided
    avatar_url = None
    
    # If avatar file is uploaded, process it
    if avatar:
        storage = Storage()
        avatar_content = await avatar.read()
        avatar_url = storage.save_image_by_bytes(
            avatar_content,
            f"profile/{current_user.id}"
        )
    # If Telegram photo URL is provided, store it
    elif telegram_photo_url:
        storage = Storage()
        avatar_url = storage.save_image_by_url(
            telegram_photo_url,
            f"profile/{current_user.id}"
        )

    updated_user = user.update_user(db, current_user, update_data, avatar_url)
    return updated_user


@router.get("/bio")
async def get_bio(
    username: str = Query()
):
    async with ClientSession() as session:
        async with session.get(f"https://t.me/{username}") as response:
            text = await response.text()
            print(text)
            bio = re.search(r'<div class="tgme_page_description.*">(.*?)</div>', text)
            return {"bio": (str(bio.group(1)) if bio else "")}

