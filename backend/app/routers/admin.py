from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import func
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from dotenv import load_dotenv
import os

from app.config.database import get_db
from app.models.user import User
from app.models.campaign import Campaign

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)

security = HTTPBearer()


# ---------------------------------------------------------
# ADMIN AUTHENTICATION
# ---------------------------------------------------------

def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
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
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
            )

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    admin = (
        db.query(User)
        .filter(User.id == int(user_id))
        .first()
    )

    if admin is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if admin.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    return admin


# ---------------------------------------------------------
# FORMAT CAMPAIGN RESPONSE
# ---------------------------------------------------------

def format_campaign(
    campaign: Campaign,
    db: Session,
):
    creator = (
        db.query(User)
        .filter(User.id == campaign.user_id)
        .first()
    )

    return {
        "id": campaign.id,
        "user_id": campaign.user_id,
        "creator_name": (
            creator.full_name
            if creator
            else "Unknown Creator"
        ),
        "creator_email": (
            creator.email
            if creator
            else None
        ),
        "title": campaign.title,
        "category": campaign.category,
        "goal_amount": campaign.goal_amount,
        "raised_amount": campaign.raised_amount or 0,
        "duration_days": campaign.duration_days,
        "description": campaign.description,
        "image_url": campaign.image_url,
        "trust_score": campaign.trust_score,
        "status": campaign.status,
    }


# ---------------------------------------------------------
# ADMIN DASHBOARD STATISTICS
# ---------------------------------------------------------

@router.get("/stats")
def get_admin_statistics(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    total_users = (
        db.query(User)
        .filter(User.role == "user")
        .count()
    )

    total_admins = (
        db.query(User)
        .filter(User.role == "admin")
        .count()
    )

    total_campaigns = db.query(Campaign).count()

    pending_campaigns = (
        db.query(Campaign)
        .filter(Campaign.status == "Pending")
        .count()
    )

    approved_campaigns = (
        db.query(Campaign)
        .filter(Campaign.status == "Approved")
        .count()
    )

    rejected_campaigns = (
        db.query(Campaign)
        .filter(Campaign.status == "Rejected")
        .count()
    )

    total_funds_raised = (
        db.query(func.sum(Campaign.raised_amount))
        .scalar()
        or 0
    )

    average_trust_score = (
        db.query(func.avg(Campaign.trust_score))
        .scalar()
        or 0
    )

    return {
        "admin": {
            "id": admin.id,
            "full_name": admin.full_name,
            "email": admin.email,
        },
        "total_users": total_users,
        "total_admins": total_admins,
        "total_campaigns": total_campaigns,
        "pending_campaigns": pending_campaigns,
        "approved_campaigns": approved_campaigns,
        "rejected_campaigns": rejected_campaigns,
        "total_funds_raised": float(total_funds_raised),
        "average_trust_score": round(
            float(average_trust_score),
            1,
        ),
    }


# ---------------------------------------------------------
# GET ALL USERS
# ---------------------------------------------------------

@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    users = (
        db.query(User)
        .order_by(User.id.desc())
        .all()
    )

    result = []

    for user in users:
        campaign_count = (
            db.query(Campaign)
            .filter(Campaign.user_id == user.id)
            .count()
        )

        result.append({
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "campaign_count": campaign_count,
        })

    return result


# ---------------------------------------------------------
# GET ALL CAMPAIGNS
# ---------------------------------------------------------

@router.get("/campaigns")
def get_all_campaigns(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    campaigns = (
        db.query(Campaign)
        .order_by(Campaign.id.desc())
        .all()
    )

    return [
        format_campaign(campaign, db)
        for campaign in campaigns
    ]


# ---------------------------------------------------------
# GET PENDING CAMPAIGNS
# ---------------------------------------------------------

@router.get("/campaigns/pending")
def get_pending_campaigns(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    campaigns = (
        db.query(Campaign)
        .filter(Campaign.status == "Pending")
        .order_by(Campaign.id.desc())
        .all()
    )

    return [
        format_campaign(campaign, db)
        for campaign in campaigns
    ]


# ---------------------------------------------------------
# APPROVE CAMPAIGN
# ---------------------------------------------------------

@router.put("/campaigns/{campaign_id}/approve")
def approve_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    campaign = (
        db.query(Campaign)
        .filter(Campaign.id == campaign_id)
        .first()
    )

    if campaign is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found",
        )

    campaign.status = "Approved"

    db.commit()
    db.refresh(campaign)

    return {
        "message": "Campaign approved successfully",
        "campaign": format_campaign(campaign, db),
    }


# ---------------------------------------------------------
# REJECT CAMPAIGN
# ---------------------------------------------------------

@router.put("/campaigns/{campaign_id}/reject")
def reject_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    campaign = (
        db.query(Campaign)
        .filter(Campaign.id == campaign_id)
        .first()
    )

    if campaign is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found",
        )

    campaign.status = "Rejected"

    db.commit()
    db.refresh(campaign)

    return {
        "message": "Campaign rejected successfully",
        "campaign": format_campaign(campaign, db),
    }


# ---------------------------------------------------------
# SET CAMPAIGN BACK TO PENDING
# ---------------------------------------------------------

@router.put("/campaigns/{campaign_id}/pending")
def mark_campaign_pending(
    campaign_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    campaign = (
        db.query(Campaign)
        .filter(Campaign.id == campaign_id)
        .first()
    )

    if campaign is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found",
        )

    campaign.status = "Pending"

    db.commit()
    db.refresh(campaign)

    return {
        "message": "Campaign moved to pending successfully",
        "campaign": format_campaign(campaign, db),
    }


# ---------------------------------------------------------
# DELETE CAMPAIGN AS ADMIN
# ---------------------------------------------------------

@router.delete("/campaigns/{campaign_id}")
def delete_campaign_as_admin(
    campaign_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    campaign = (
        db.query(Campaign)
        .filter(Campaign.id == campaign_id)
        .first()
    )

    if campaign is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found",
        )

    db.delete(campaign)
    db.commit()

    return {
        "message": "Campaign deleted successfully",
    }


# ---------------------------------------------------------
# CHANGE USER ROLE
# ---------------------------------------------------------

@router.put("/users/{user_id}/role/{new_role}")
def change_user_role(
    user_id: int,
    new_role: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    allowed_roles = {"user", "admin"}

    if new_role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be user or admin",
        )

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.id == admin.id and new_role != "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot remove your own admin role",
        )

    user.role = new_role

    db.commit()
    db.refresh(user)

    return {
        "message": "User role updated successfully",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
        },
    }


# ---------------------------------------------------------
# DELETE USER
# ---------------------------------------------------------

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own admin account",
        )

    user_campaigns = (
        db.query(Campaign)
        .filter(Campaign.user_id == user.id)
        .all()
    )

    for campaign in user_campaigns:
        db.delete(campaign)

    db.delete(user)
    db.commit()

    return {
        "message": "User and associated campaigns deleted successfully",
    }