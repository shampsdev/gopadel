from datetime import datetime, timedelta, timezone

import jwt
from config import settings
from db.models.admin import AdminUser
from fastapi import Depends, HTTPException
from passlib.context import CryptContext
from sqlalchemy.orm import Session

SECRET_KEY = settings.JWT_SECRET_KEY
ALGORITHM = "HS256"
JWT_ACCESS_TOKEN_EXPIRE_HOURS = settings.JWT_ACCESS_TOKEN_EXPIRE_HOURS

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        timedelta(hours=JWT_ACCESS_TOKEN_EXPIRE_HOURS)
    )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def get_current_admin(db: Session, token: str = Depends()) -> AdminUser:
    credentials_exception = HTTPException(
        status_code=401, detail="Could not validate credentials"
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        admin = db.query(AdminUser).filter(AdminUser.username == username).first()
        if admin is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    return admin
