from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class AdminUserCreate(BaseModel):
    username: str
    password: str
    first_name: str
    last_name: str
    is_superuser: Optional[bool] = False
    is_active: Optional[bool] = True

    class Config:
        orm_mode = True


class AdminUserResponse(BaseModel):
    id: UUID
    username: str
    first_name: str
    last_name: str
    is_superuser: bool
    is_active: bool

    class Config:
        orm_mode = True
        from_attributes = True
