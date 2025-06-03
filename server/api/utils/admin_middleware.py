from functools import wraps
from typing import Callable

import jwt
from api.utils.jwt import ALGORITHM, SECRET_KEY
from config import settings
from db import SessionLocal
from fastapi import HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials
from repositories import admin_user_repository


def superuser_required(func: Callable) -> Callable:
    @wraps(func)
    async def wrapper(request: Request, *args, **kwargs):
        authorization = request.headers.get("Authorization")
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Not authenticated")

        token = authorization.split(" ")[1]

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            username = payload.get("sub")
            is_superuser = payload.get("is_superuser", False)

            if not username:
                raise HTTPException(status_code=401, detail="Invalid token")

            # Get db from kwargs
            db = kwargs.get("db")
            if not db:
                raise HTTPException(
                    status_code=500, detail="Database session not found"
                )

            admin = admin_user_repository.get_by_username(db, username)
            if not admin:
                raise HTTPException(status_code=401, detail="Admin not found")

            if not admin.is_superuser:
                raise HTTPException(
                    status_code=403, detail="Only superusers can perform this action"
                )

            request.state.admin = admin

        except jwt.PyJWTError:
            raise HTTPException(status_code=401, detail="Invalid token")

        return await func(request=request, *args, **kwargs)

    return wrapper


def admin_required(func: Callable) -> Callable:
    @wraps(func)
    async def wrapper(request: Request, *args, **kwargs):
        authorization = request.headers.get("Authorization")
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Not authenticated")

        token = authorization.split(" ")[1]

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            username = payload.get("sub")

            if not username:
                raise HTTPException(status_code=401, detail="Invalid token")

            # Get db from kwargs
            db = kwargs.get("db")
            if not db:
                raise HTTPException(
                    status_code=500, detail="Database session not found"
                )

            admin = admin_user_repository.get_by_username(db, username)
            if not admin:
                raise HTTPException(status_code=401, detail="Admin not found")

            request.state.admin = admin

        except jwt.PyJWTError:
            raise HTTPException(status_code=401, detail="Invalid token")

        return await func(request=request, *args, **kwargs)

    return wrapper
