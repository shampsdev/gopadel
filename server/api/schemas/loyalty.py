from typing import List, Optional

from pydantic import BaseModel


class LoyaltyResponse(BaseModel):
    id: int
    name: str
    discount: int
    description: Optional[str] = None
    requirements: Optional[dict] = None

    class Config:
        from_attributes = True


class LoyaltyDetailsResponse(BaseModel):
    id: int
    name: str
    discount: int
    description: Optional[str] = None
    requirements: str
    benefits: List[str]

    class Config:
        from_attributes = True
