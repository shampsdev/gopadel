from typing import Optional

from pydantic import BaseModel


class LoyaltyCreate(BaseModel):
    name: str
    discount: int
    description: Optional[str] = None
    requirements: Optional[dict] = None


class LoyaltyUpdate(BaseModel):
    name: Optional[str] = None
    discount: Optional[int] = None
    description: Optional[str] = None
    requirements: Optional[dict] = None


class AdminLoyaltyResponse(BaseModel):
    id: int
    name: str
    discount: int
    description: Optional[str] = None
    requirements: Optional[dict] = None
    users_count: int

    class Config:
        from_attributes = True
