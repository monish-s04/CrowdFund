from pydantic import BaseModel, Field
from typing import Optional, List


class CampaignCreate(BaseModel):
    title: str = Field(
        ...,
        min_length=3,
        max_length=150,
    )

    category: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )

    goal_amount: float = Field(
        ...,
        gt=0,
    )

    duration_days: int = Field(
        ...,
        gt=0,
        le=365,
    )

    description: str = Field(
        ...,
        min_length=20,
    )

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

    rating: Optional[str] = None
    quality_label: Optional[str] = None

    recommended_goal: Optional[float] = None
    recommended_duration: Optional[int] = None

    title_quality: Optional[str] = None
    description_quality: Optional[str] = None
    goal_quality: Optional[str] = None
    duration_quality: Optional[str] = None
    image_quality: Optional[str] = None

    suggestions: Optional[List[str]] = None
    recommendation: Optional[str] = None

    class Config:
        from_attributes = True