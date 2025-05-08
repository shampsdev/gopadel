import hashlib
import hmac
import json
from urllib.parse import unquote

from fastapi import Header, HTTPException

from config import settings

from db.models import User
from api.deps import SessionDep
from db.crud.user import get_or_create_user


async def get_user(
    db: SessionDep, authorization: str = Header("Authorization")
) -> User:
    data = unquote(authorization.split(" ")[1]).split("&")

    data_check_string = "\n".join(
        sorted(filter(lambda kv: not kv.startswith("hash"), data))
    )
    secret_key = hmac.new(
        b"WebAppData", settings.TG_API_TOKEN.encode(), hashlib.sha256
    ).digest()
    res = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    init_data = dict(x.split("=") for x in data)

    if res != init_data["hash"]:
        raise HTTPException(status_code=401, detail="Invalid authorization")
    data = json.loads(init_data["user"])
    return get_or_create_user(
        db, data["id"], data.get("username")
    )
