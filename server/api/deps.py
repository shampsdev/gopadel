import hashlib
import hmac
import json
from typing import Annotated
from urllib.parse import unquote

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from config import settings
from db import SessionLocal
from db.models import User
from db.crud.user import get_or_create_user


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


SessionDep = Annotated[Session, Depends(get_db)]


def check_hash(data_check_string: str, hash: str) -> bool:
    for token in settings.TRUSTED_API_TOKENS:
        secret_key = hmac.new(b"WebAppData", token.encode(), hashlib.sha256).digest()
        res = hmac.new(
            secret_key, data_check_string.encode(), hashlib.sha256
        ).hexdigest()
        if res == hash:
            return True
    raise HTTPException(status_code=401, detail="Invalid authorization")


async def get_user(
    db: SessionDep, authorization: str = Header("Authorization")
) -> User:
    data = unquote(authorization.split(" ")[1]).split("&")

    data_check_string = "\n".join(
        sorted(filter(lambda kv: not kv.startswith("hash"), data))
    )
    init_data = dict(x.split("=") for x in data)

    check_hash(data_check_string, init_data["hash"])

    data = json.loads(init_data["user"])
    return get_or_create_user(db, data["id"], data.get("username"))


UserDep = Annotated[User, Depends(get_user)]
