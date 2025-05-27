from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class LoyaltyRequirements(BaseModel):
    text: str
    benefits: List[str]


class LoyaltyCreate(BaseModel):
    name: str
    discount: int
    description: Optional[str] = None
    requirements: Optional[Dict[str, Any]] = None


class LoyaltyUpdate(BaseModel):
    name: Optional[str] = None
    discount: Optional[int] = None
    description: Optional[str] = None
    requirements: Optional[Dict[str, Any]] = None


class AdminLoyaltyResponse(BaseModel):
    id: int
    name: str
    discount: int
    description: Optional[str] = None
    requirements: Optional[Dict[str, Any]] = None
    users_count: int

    class Config:
        from_attributes = True
