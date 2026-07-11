from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from dotenv import load_dotenv
import os

from app.config.database import get_db
from app.models.campaign import Campaign
from app.models.user import User
from app.schemas.campaign_schema import CampaignCreate, CampaignResponse

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

router = APIRouter(
    prefix="/campaigns",
    tags=["Campaigns"],
)

security = HTTPBearer()


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> int:
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        user_id = payload.get("user_id")

        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token payload",
            )

        return int(user_id)

    except (JWTError, ValueError):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )


def calculate_ai_evaluation(
    title: str,
    category: str,
    goal_amount: float,
    duration_days: int,
    description: str,
    image_url: str | None,
) -> dict:
    score = 40

    clean_title = title.strip()
    clean_description = description.strip()
    description_length = len(clean_description)

    if description_length >= 300:
        score += 20
    elif description_length >= 150:
        score += 15
    elif description_length >= 80:
        score += 10
    else:
        score += 5

    if 15 <= duration_days <= 60:
        score += 15
    elif 7 <= duration_days <= 90:
        score += 10
    else:
        score += 5

    if goal_amount <= 200000:
        score += 15
    elif goal_amount <= 500000:
        score += 10
    elif goal_amount <= 1000000:
        score += 7
    else:
        score += 4

    trusted_categories = {
        "Healthcare",
        "Education",
        "NGO",
        "Disaster Relief",
    }

    if category in trusted_categories:
        score += 7
    else:
        score += 4

    if image_url:
        score += 3

    if len(clean_title) >= 10:
        score += 2

    score = min(score, 100)

    if score >= 80:
        risk_level = "Low"
        recommendation = (
            "Safe to publish and likely to gain donor trust."
        )
    elif score >= 60:
        risk_level = "Medium"
        recommendation = (
            "Campaign is acceptable, but more supporting details "
            "and verification are recommended."
        )
    else:
        risk_level = "High"
        recommendation = (
            "Campaign requires clearer information and additional "
            "verification before approval."
        )

    success_probability = min(score + 3, 98)

    return {
        "trust_score": score,
        "risk_level": risk_level,
        "success_probability": success_probability,
        "recommendation": recommendation,
    }


def format_campaign(
    campaign: Campaign,
    db: Session,
) -> dict:
    creator = (
        db.query(User)
        .filter(User.id == campaign.user_id)
        .first()
    )

    ai_result = calculate_ai_evaluation(
        title=campaign.title,
        category=campaign.category,
        goal_amount=campaign.goal_amount,
        duration_days=campaign.duration_days,
        description=campaign.description,
        image_url=campaign.image_url,
    )

    return {
        "id": campaign.id,
        "user_id": campaign.user_id,
        "title": campaign.title,
        "category": campaign.category,
        "goal_amount": campaign.goal_amount,
        "duration_days": campaign.duration_days,
        "description": campaign.description,
        "image_url": campaign.image_url,
        "raised_amount": campaign.raised_amount or 0,
        "trust_score": campaign.trust_score or 0,
        "status": campaign.status or "Pending",
        "creator_name": (
            creator.full_name
            if creator
            else "Unknown Creator"
        ),
        "risk_level": ai_result["risk_level"],
        "success_probability": ai_result["success_probability"],
        "recommendation": ai_result["recommendation"],
    }


# CREATE CAMPAIGN
@router.post(
    "/",
    response_model=CampaignResponse,
)
def create_campaign(
    campaign_data: CampaignCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    ai_result = calculate_ai_evaluation(
        title=campaign_data.title,
        category=campaign_data.category,
        goal_amount=campaign_data.goal_amount,
        duration_days=campaign_data.duration_days,
        description=campaign_data.description,
        image_url=campaign_data.image_url,
    )

    new_campaign = Campaign(
        user_id=user_id,
        title=campaign_data.title.strip(),
        category=campaign_data.category,
        goal_amount=campaign_data.goal_amount,
        duration_days=campaign_data.duration_days,
        description=campaign_data.description.strip(),
        image_url=campaign_data.image_url,
        raised_amount=0,
        trust_score=ai_result["trust_score"],
        status="Pending",
    )

    db.add(new_campaign)
    db.commit()
    db.refresh(new_campaign)

    return format_campaign(new_campaign, db)


# PUBLIC CAMPAIGNS: ONLY APPROVED CAMPAIGNS
@router.get(
    "/",
    response_model=list[CampaignResponse],
)
def get_campaigns(
    db: Session = Depends(get_db),
):
    campaigns = (
        db.query(Campaign)
        .filter(Campaign.status == "Approved")
        .order_by(Campaign.id.desc())
        .all()
    )

    return [
        format_campaign(campaign, db)
        for campaign in campaigns
    ]


# CAMPAIGNS OF THE LOGGED-IN USER
@router.get(
    "/my",
    response_model=list[CampaignResponse],
)
def get_my_campaigns(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    campaigns = (
        db.query(Campaign)
        .filter(Campaign.user_id == user_id)
        .order_by(Campaign.id.desc())
        .all()
    )

    return [
        format_campaign(campaign, db)
        for campaign in campaigns
    ]


# GET CAMPAIGN DETAILS
@router.get(
    "/{campaign_id}",
    response_model=CampaignResponse,
)
def get_campaign_by_id(
    campaign_id: int,
    db: Session = Depends(get_db),
):
    campaign = (
        db.query(Campaign)
        .filter(Campaign.id == campaign_id)
        .first()
    )

    if campaign is None:
        raise HTTPException(
            status_code=404,
            detail="Campaign not found",
        )

    return format_campaign(campaign, db)


# UPDATE CAMPAIGN
@router.put(
    "/{campaign_id}",
    response_model=CampaignResponse,
)
def update_campaign(
    campaign_id: int,
    campaign_data: CampaignCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    campaign = (
        db.query(Campaign)
        .filter(
            Campaign.id == campaign_id,
            Campaign.user_id == user_id,
        )
        .first()
    )

    if campaign is None:
        raise HTTPException(
            status_code=404,
            detail="Campaign not found or you are not the owner",
        )

    if campaign.status == "Approved":
        raise HTTPException(
            status_code=400,
            detail="Approved campaigns cannot be edited",
        )

    ai_result = calculate_ai_evaluation(
        title=campaign_data.title,
        category=campaign_data.category,
        goal_amount=campaign_data.goal_amount,
        duration_days=campaign_data.duration_days,
        description=campaign_data.description,
        image_url=campaign_data.image_url,
    )

    campaign.title = campaign_data.title.strip()
    campaign.category = campaign_data.category
    campaign.goal_amount = campaign_data.goal_amount
    campaign.duration_days = campaign_data.duration_days
    campaign.description = campaign_data.description.strip()
    campaign.image_url = campaign_data.image_url
    campaign.trust_score = ai_result["trust_score"]

    # After editing, admin must review it again.
    campaign.status = "Pending"

    db.commit()
    db.refresh(campaign)

    return format_campaign(campaign, db)


# DELETE CAMPAIGN
@router.delete("/{campaign_id}")
def delete_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    campaign = (
        db.query(Campaign)
        .filter(
            Campaign.id == campaign_id,
            Campaign.user_id == user_id,
        )
        .first()
    )

    if campaign is None:
        raise HTTPException(
            status_code=404,
            detail="Campaign not found or you are not the owner",
        )

    if campaign.status == "Approved":
        raise HTTPException(
            status_code=400,
            detail="Approved campaigns cannot be deleted by the creator",
        )

    db.delete(campaign)
    db.commit()

    return {
        "message": "Campaign deleted successfully",
    }