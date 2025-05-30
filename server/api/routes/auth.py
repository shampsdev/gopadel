import asyncio
import logging
import re
from datetime import datetime
from typing import Optional

from aiohttp import ClientError, ClientSession, ClientTimeout
from api.deps import SessionDep, UserDep
from api.schemas.user import UserBase, UserRegister, UserUpdate
from db.crud import user
from db.models.user import PlayingPosition
from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile
from services.storage import Storage

router = APIRouter()

# Configure logger for this module
logger = logging.getLogger(__name__)


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
    """
    Get user bio from Telegram profile page with error handling and retries.
    """
    max_retries = 3
    retry_delay = 1.0
    timeout = ClientTimeout(total=10)  # 10 seconds timeout

    for attempt in range(max_retries):
        try:
            async with ClientSession(timeout=timeout) as session:
                async with session.get(f"https://t.me/{username}") as response:
                    if response.status != 200:
                        logger.warning(f"HTTP {response.status} for user {username}")
                        return {"bio": ""}

                    text = await response.text()

                    # Extract bio from HTML using regex
                    bio_match = re.search(
                        r'<div class="tgme_page_description.*?">(.*?)</div>',
                        text,
                        re.DOTALL,
                    )
                    if bio_match:
                        bio_text = bio_match.group(1)
                        # Clean up HTML tags and decode entities
                        bio_text = re.sub(r"<[^>]+>", "", bio_text)  # Remove HTML tags
                        bio_text = (
                            bio_text.replace("&lt;", "<")
                            .replace("&gt;", ">")
                            .replace("&amp;", "&")
                        )
                        bio_text = bio_text.strip()
                        logger.info(f"Successfully extracted bio for user {username}")
                        return {"bio": bio_text}
                    else:
                        logger.info(f"No bio found for user {username}")
                        return {"bio": ""}

        except asyncio.TimeoutError:
            logger.warning(
                f"Timeout error for user {username}, attempt {attempt + 1}/{max_retries}"
            )
        except ClientError as e:
            logger.warning(
                f"Client error for user {username}, attempt {attempt + 1}/{max_retries}: {e}"
            )
        except Exception as e:
            logger.error(
                f"Unexpected error for user {username}, attempt {attempt + 1}/{max_retries}: {e}"
            )

        # If not the last attempt, wait before retrying
        if attempt < max_retries - 1:
            await asyncio.sleep(retry_delay)
            retry_delay *= 2  # Exponential backoff

    # All retries failed
    logger.error(
        f"Failed to fetch bio for user {username} after {max_retries} attempts"
    )
    return {"bio": ""}
