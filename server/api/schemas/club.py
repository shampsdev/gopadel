from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class ClubBase(BaseModel):
    name: str
    address: str


class ClubCreate(ClubBase):
    pass


class ClubUpdate(ClubBase):
    pass


class Club(ClubBase):
    id: UUID

    class Config:
        from_attributes = True
