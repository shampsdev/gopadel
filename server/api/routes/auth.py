import re
from datetime import datetime
from typing import Optional

from aiohttp import ClientSession
from api.deps import SessionDep, UserDep
from api.schemas.user import UserBase, UserRegister, UserUpdate
from db.crud import user
from db.models.user import PlayingPosition
from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile
from services.storage import Storage

router = APIRouter()


@router.get("/me", response_model=UserBase)
async def get_me(user: UserDep):
    return user


@router.post("/register")
async def register(
    db: SessionDep,
    current_user: UserDep,
    avatar: Optional[UploadFile] = File(None),
    telegram_photo_url: Optional[str] = Form(None),
    user_data: str = Form(...),  # JSON string with user data
):
    import json

    if current_user.is_registered:
        raise HTTPException(status_code=400, detail="User already registered")

    try:
        # Parse JSON data
        data = json.loads(user_data)

        # Process playing_position enum
        position_enum = None
        playing_position = data.get("playing_position")
        if playing_position and playing_position.strip():
            position_lower = playing_position.lower()
            if position_lower in ["right", "left", "both"]:
                position_enum = getattr(PlayingPosition, position_lower)
            else:
                raise HTTPException(status_code=400, detail="Invalid playing position")

        # Convert form data to UserRegister model
        register_data = UserRegister(
            first_name=data.get("first_name"),
            second_name=data.get("second_name"),
            bio=data.get("bio", ""),
            rank=float(data.get("rank")) if data.get("rank") is not None else None,
            city=data.get("city"),
            birth_date=(
                datetime.strptime(data["birth_date"], "%Y-%m-%d").date()
                if data.get("birth_date")
                else None
            ),
            playing_position=position_enum,
            padel_profiles=(
                data.get("padel_profiles")
                if data.get("padel_profiles") and data.get("padel_profiles").strip()
                else None
            ),
        )

        # Handle profile picture upload if provided
        avatar_url = None

        # If avatar file is uploaded, process it
        if avatar:
            storage = Storage()
            avatar_content = await avatar.read()
            avatar_url = storage.save_image_by_bytes(
                avatar_content, f"profile/{current_user.id}"
            )
        # If Telegram photo URL is provided, store it
        elif telegram_photo_url:
            storage = Storage()
            avatar_url = storage.save_image_by_url(
                telegram_photo_url, f"profile/{current_user.id}"
            )

        updated_user = user.register_user(db, current_user, register_data, avatar_url)
        return updated_user

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON data")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/me")
async def update_me(
    db: SessionDep,
    current_user: UserDep,
    avatar: Optional[UploadFile] = File(None),
    telegram_photo_url: Optional[str] = Form(None),
    user_data: str = Form(...),  # JSON string with user data
):
    import json

    try:
        # Parse JSON data
        data = json.loads(user_data)

        # Process playing_position enum
        position_enum = None
        playing_position = data.get("playing_position")
        if playing_position and playing_position.strip():
            position_lower = playing_position.lower()
            if position_lower in ["right", "left", "both"]:
                position_enum = getattr(PlayingPosition, position_lower)
            else:
                raise HTTPException(status_code=400, detail="Invalid playing position")

        # Convert form data to UserUpdate model
        update_data = UserUpdate(
            first_name=data.get("first_name"),
            second_name=data.get("second_name"),
            bio=data.get("bio"),
            rank=float(data.get("rank")) if data.get("rank") is not None else None,
            city=data.get("city"),
            birth_date=(
                datetime.strptime(data["birth_date"], "%Y-%m-%d").date()
                if data.get("birth_date")
                else None
            ),
            playing_position=position_enum,
            padel_profiles=(
                data.get("padel_profiles")
                if data.get("padel_profiles") and data.get("padel_profiles").strip()
                else None
            ),
        )

        # Handle profile picture upload if provided
        avatar_url = None

        # If avatar file is uploaded, process it
        if avatar:
            storage = Storage()
            avatar_content = await avatar.read()
            avatar_url = storage.save_image_by_bytes(
                avatar_content, f"profile/{current_user.id}"
            )
        # If Telegram photo URL is provided, store it
        elif telegram_photo_url:
            storage = Storage()
            avatar_url = storage.save_image_by_url(
                telegram_photo_url, f"profile/{current_user.id}"
            )

        updated_user = user.update_user(db, current_user, update_data, avatar_url)
        return updated_user

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail="Invalid JSON data")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/bio")
async def get_bio(username: str = Query()):
    async with ClientSession() as session:
        async with session.get(f"https://t.me/{username}") as response:
            text = await response.text()
            print(text)
            bio = re.search(r'<div class="tgme_page_description.*">(.*?)</div>', text)
            return {"bio": (str(bio.group(1)) if bio else "")}
