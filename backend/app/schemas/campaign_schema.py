from pydantic import BaseModel
from typing import Optional


class CampaignCreate(BaseModel):
    title: str
    category: str
    goal_amount: float
    duration_days: int
    description: str
    image_url: Optional[str] = None


class CampaignResponse(BaseModel):
    id: int
    user_id: int
    title: str
    category: str
    goal_amount: float
    duration_days: int
    description: str
    image_url: Optional[str] = None
    raised_amount: float
    trust_score: int
    status: str
    creator_name: Optional[str] = None

    risk_level: Optional[str] = None
    success_probability: Optional[int] = None
    recommendation: Optional[str] = None

    class Config:
        from_attributes = True