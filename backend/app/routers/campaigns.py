from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from dotenv import load_dotenv
from pathlib import Path
from uuid import uuid4
import os
import shutil

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

UPLOAD_DIRECTORY = Path("uploads/campaigns")
UPLOAD_DIRECTORY.mkdir(parents=True, exist_ok=True)

MAX_IMAGE_SIZE = 5 * 1024 * 1024

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


# =========================================================
# CURRENT USER
# =========================================================

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


# =========================================================
# AI CAMPAIGN EVALUATION
# =========================================================

def calculate_ai_evaluation(
    title: str,
    category: str,
    goal_amount: float,
    duration_days: int,
    description: str,
    image_url: str | None,
):
    clean_title = (title or "").strip()
    clean_description = (description or "").strip()

    title_length = len(clean_title)
    description_length = len(clean_description)

    goal = float(goal_amount or 0)
    duration = int(duration_days or 0)

    score = 35
    suggestions = []

    # -----------------------------------------------------
    # TITLE ANALYSIS
    # -----------------------------------------------------

    if title_length >= 20:
        score += 10
        title_quality = "Excellent"
        suggestions.append(
            "Campaign title is clear and descriptive."
        )

    elif title_length >= 10:
        score += 7
        title_quality = "Good"
        suggestions.append(
            "Campaign title is good, but adding more specific details may improve visibility."
        )

    elif title_length > 0:
        score += 3
        title_quality = "Needs Improvement"
        suggestions.append(
            "Use a more descriptive title with at least 10 characters."
        )

    else:
        title_quality = "Missing"
        suggestions.append(
            "Add a clear and meaningful campaign title."
        )

    # -----------------------------------------------------
    # DESCRIPTION ANALYSIS
    # -----------------------------------------------------

    if description_length >= 300:
        score += 20
        description_quality = "Excellent"
        suggestions.append(
            "Campaign description contains detailed information."
        )

    elif description_length >= 150:
        score += 15
        description_quality = "Good"
        suggestions.append(
            "Add fund-utilization details and supporting information to strengthen the description."
        )

    elif description_length >= 80:
        score += 10
        description_quality = "Average"
        suggestions.append(
            "Expand the description to at least 150 characters."
        )

    elif description_length > 0:
        score += 5
        description_quality = "Needs Improvement"
        suggestions.append(
            "The description is too short. Explain the problem, beneficiary and fund usage clearly."
        )

    else:
        description_quality = "Missing"
        suggestions.append(
            "Add a detailed campaign description."
        )

    # -----------------------------------------------------
    # DESCRIPTION CONTENT CHECKS
    # -----------------------------------------------------

    description_lower = clean_description.lower()

    cost_keywords = {
        "cost",
        "expense",
        "fees",
        "amount",
        "budget",
        "estimate",
        "treatment",
        "medical bill",
        "tuition",
        "equipment",
    }

    beneficiary_keywords = {
        "beneficiary",
        "student",
        "patient",
        "family",
        "children",
        "community",
        "people",
        "victim",
        "business",
    }

    timeline_keywords = {
        "days",
        "month",
        "week",
        "deadline",
        "urgent",
        "immediately",
        "timeline",
        "before",
    }

    has_cost_details = any(
        keyword in description_lower
        for keyword in cost_keywords
    )

    has_beneficiary_details = any(
        keyword in description_lower
        for keyword in beneficiary_keywords
    )

    has_timeline_details = any(
        keyword in description_lower
        for keyword in timeline_keywords
    )

    if has_cost_details:
        score += 3
        suggestions.append(
            "Fund requirement or expense information is included."
        )
    else:
        suggestions.append(
            "Mention how the collected funds will be used."
        )

    if has_beneficiary_details:
        score += 3
        suggestions.append(
            "Beneficiary information appears to be included."
        )
    else:
        suggestions.append(
            "Clearly mention who will benefit from the campaign."
        )

    if has_timeline_details:
        score += 2
        suggestions.append(
            "Campaign timeline information appears to be included."
        )
    else:
        suggestions.append(
            "Mention when the funds are required and why the campaign is time-sensitive."
        )

    # -----------------------------------------------------
    # DURATION ANALYSIS
    # -----------------------------------------------------

    if 30 <= duration <= 45:
        score += 15
        duration_quality = "Excellent"
        recommended_duration = duration

        suggestions.append(
            "Campaign duration is within the recommended range."
        )

    elif 15 <= duration <= 60:
        score += 12
        duration_quality = "Good"
        recommended_duration = min(max(duration, 30), 45)

        suggestions.append(
            "Campaign duration is suitable for crowdfunding."
        )

    elif 7 <= duration <= 90:
        score += 8
        duration_quality = "Average"
        recommended_duration = 45

        suggestions.append(
            "A duration between 30 and 45 days may improve urgency and engagement."
        )

    elif duration > 0:
        score += 3
        duration_quality = "Needs Improvement"
        recommended_duration = 45

        suggestions.append(
            "Set the campaign duration between 30 and 45 days."
        )

    else:
        duration_quality = "Missing"
        recommended_duration = 45

        suggestions.append(
            "Enter a valid campaign duration."
        )

    # -----------------------------------------------------
    # GOAL AMOUNT ANALYSIS
    # -----------------------------------------------------

    if 0 < goal <= 200000:
        score += 15
        goal_quality = "Excellent"
        recommended_goal = goal

        suggestions.append(
            "Campaign goal is realistic and donor-friendly."
        )

    elif goal <= 500000 and goal > 0:
        score += 11
        goal_quality = "Good"
        recommended_goal = round(goal * 0.90, -3)

        suggestions.append(
            "Campaign goal is acceptable. Explain the expense breakdown clearly."
        )

    elif goal <= 1000000 and goal > 0:
        score += 7
        goal_quality = "Moderate"
        recommended_goal = round(goal * 0.75, -3)

        suggestions.append(
            "The goal amount is high. Add documents and a detailed budget."
        )

    elif goal > 1000000:
        score += 3
        goal_quality = "High"
        recommended_goal = round(goal * 0.60, -3)

        suggestions.append(
            "Consider dividing the fundraising goal into smaller milestones."
        )

    else:
        goal_quality = "Missing"
        recommended_goal = 100000

        suggestions.append(
            "Enter a valid fundraising goal."
        )

    # -----------------------------------------------------
    # CATEGORY ANALYSIS
    # -----------------------------------------------------

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

    category_suggestions = {
        "Healthcare": [
            "Upload hospital reports or medical estimates.",
            "Mention the hospital, treatment and expected medical cost.",
            "Add patient or beneficiary details where appropriate.",
        ],
        "Education": [
            "Upload the fee receipt or admission document.",
            "Mention the institution, course and academic year.",
            "Explain how education funding will benefit the student.",
        ],
        "Business": [
            "Explain the business plan and revenue model.",
            "Mention the target market and expected business impact.",
            "Add a clear budget for equipment, inventory or operations.",
        ],
        "NGO": [
            "Mention the number of beneficiaries.",
            "Upload NGO registration or verification documents.",
            "Explain the measurable social impact of the campaign.",
        ],
        "Disaster Relief": [
            "Mention the affected location and number of people.",
            "Explain how food, shelter or medical support will be provided.",
            "Provide regular updates about fund distribution.",
        ],
    }

    suggestions.extend(
        category_suggestions.get(
            category,
            [
                "Add supporting documents.",
                "Explain the campaign impact clearly.",
                "Provide regular updates to donors.",
            ],
        )
    )

    # -----------------------------------------------------
    # IMAGE ANALYSIS
    # -----------------------------------------------------

    if image_url:
        score += 5
        image_quality = "Uploaded"

        suggestions.append(
            "Campaign image has been added successfully."
        )

    else:
        image_quality = "Missing"

        suggestions.append(
            "Upload a clear campaign image to improve donor trust."
        )

    # -----------------------------------------------------
    # FINAL RESULT
    # -----------------------------------------------------

    score = max(0, min(round(score), 100))

    success_probability = min(
        max(score + 3, 10),
        98,
    )

    if score >= 85:
        risk_level = "Low"
        rating = "★★★★★"
        quality_label = "Excellent"

        recommendation = (
            "Your campaign is well prepared and has a strong chance "
            "of gaining donor trust. Review the final information and "
            "submit it for admin approval."
        )

    elif score >= 70:
        risk_level = "Low"
        rating = "★★★★☆"
        quality_label = "Very Good"

        recommendation = (
            "Your campaign is strong, but adding supporting documents "
            "and clearer expense details may improve donor confidence."
        )

    elif score >= 55:
        risk_level = "Medium"
        rating = "★★★☆☆"
        quality_label = "Needs Improvement"

        recommendation = (
            "Your campaign is acceptable, but it should include more "
            "details, evidence and a clearer fundraising plan."
        )

    elif score >= 40:
        risk_level = "High"
        rating = "★★☆☆☆"
        quality_label = "Weak"

        recommendation = (
            "The campaign requires significant improvements before "
            "publication. Add complete details and supporting evidence."
        )

    else:
        risk_level = "High"
        rating = "★☆☆☆☆"
        quality_label = "Incomplete"

        recommendation = (
            "The campaign information is incomplete. Complete all "
            "important fields before submitting it."
        )

    return {
        "trust_score": score,
        "success_probability": success_probability,
        "risk_level": risk_level,
        "rating": rating,
        "quality_label": quality_label,
        "recommended_goal": float(recommended_goal),
        "recommended_duration": int(recommended_duration),
        "title_quality": title_quality,
        "description_quality": description_quality,
        "goal_quality": goal_quality,
        "duration_quality": duration_quality,
        "image_quality": image_quality,
        "suggestions": suggestions,
        "recommendation": recommendation,
    }


# =========================================================
# FORMAT CAMPAIGN RESPONSE
# =========================================================

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
        campaign.title,
        campaign.category,
        campaign.goal_amount,
        campaign.duration_days,
        campaign.description,
        campaign.image_url,
    )

    return {
        "id": campaign.id,
        "user_id": campaign.user_id,
        "title": campaign.title,
        "category": campaign.category,
        "goal_amount": float(campaign.goal_amount),
        "duration_days": campaign.duration_days,
        "description": campaign.description,
        "image_url": campaign.image_url,
        "raised_amount": float(campaign.raised_amount or 0),
        "trust_score": int(campaign.trust_score or 0),
        "status": campaign.status or "Pending",
        "creator_name": (
            creator.full_name
            if creator
            else "Unknown Creator"
        ),
        "risk_level": ai_result["risk_level"],
        "success_probability": ai_result["success_probability"],
        "rating": ai_result["rating"],
        "quality_label": ai_result["quality_label"],
        "recommended_goal": ai_result["recommended_goal"],
        "recommended_duration": ai_result["recommended_duration"],
        "title_quality": ai_result["title_quality"],
        "description_quality": ai_result["description_quality"],
        "goal_quality": ai_result["goal_quality"],
        "duration_quality": ai_result["duration_quality"],
        "image_quality": ai_result["image_quality"],
        "suggestions": ai_result["suggestions"],
        "recommendation": ai_result["recommendation"],
    }


# =========================================================
# IMAGE UPLOAD
# =========================================================

@router.post("/upload-image")
async def upload_campaign_image(
    image: UploadFile = File(...),
    user_id: int = Depends(get_current_user_id),
):
    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG and WEBP images are allowed.",
        )

    image.file.seek(0, os.SEEK_END)
    image_size = image.file.tell()
    image.file.seek(0)

    if image_size > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Image size must be 5 MB or less.",
        )

    extension = ALLOWED_IMAGE_TYPES[image.content_type]

    filename = (
        f"user_{user_id}_{uuid4().hex}{extension}"
    )

    destination = UPLOAD_DIRECTORY / filename

    try:
        with destination.open("wb") as output_file:
            shutil.copyfileobj(
                image.file,
                output_file,
            )
    finally:
        await image.close()

    return {
        "message": "Image uploaded successfully",
        "image_url": (
            "http://127.0.0.1:8000/"
            f"uploads/campaigns/{filename}"
        ),
    }


# =========================================================
# CREATE CAMPAIGN
# =========================================================

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
        campaign_data.title,
        campaign_data.category,
        campaign_data.goal_amount,
        campaign_data.duration_days,
        campaign_data.description,
        campaign_data.image_url,
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

    return format_campaign(
        new_campaign,
        db,
    )


# =========================================================
# GET APPROVED CAMPAIGNS
# =========================================================

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


# =========================================================
# GET CURRENT USER CAMPAIGNS
# =========================================================

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


# =========================================================
# GET ONE CAMPAIGN
# =========================================================

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

    return format_campaign(
        campaign,
        db,
    )


# =========================================================
# UPDATE CAMPAIGN
# =========================================================

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
            detail=(
                "Campaign not found or you are not the owner"
            ),
        )

    if campaign.status == "Approved":
        raise HTTPException(
            status_code=400,
            detail="Approved campaigns cannot be edited",
        )

    ai_result = calculate_ai_evaluation(
        campaign_data.title,
        campaign_data.category,
        campaign_data.goal_amount,
        campaign_data.duration_days,
        campaign_data.description,
        campaign_data.image_url,
    )

    campaign.title = campaign_data.title.strip()
    campaign.category = campaign_data.category
    campaign.goal_amount = campaign_data.goal_amount
    campaign.duration_days = campaign_data.duration_days
    campaign.description = campaign_data.description.strip()
    campaign.image_url = campaign_data.image_url
    campaign.trust_score = ai_result["trust_score"]
    campaign.status = "Pending"

    db.commit()
    db.refresh(campaign)

    return format_campaign(
        campaign,
        db,
    )


# =========================================================
# DELETE CAMPAIGN
# =========================================================

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
            detail=(
                "Campaign not found or you are not the owner"
            ),
        )

    if campaign.status == "Approved":
        raise HTTPException(
            status_code=400,
            detail=(
                "Approved campaigns cannot be deleted by the creator"
            ),
        )

    db.delete(campaign)
    db.commit()

    return {
        "message": "Campaign deleted successfully",
    }