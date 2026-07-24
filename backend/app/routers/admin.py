from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import func
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from dotenv import load_dotenv
from app.models.notification import Notification
import os

from app.config.database import get_db
from app.models.user import User
from app.models.campaign import Campaign
from app.models.donation import Donation

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)

security = HTTPBearer()


# =========================================================
# ADMIN AUTHENTICATION
# =========================================================

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


# =========================================================
# FORMAT CAMPAIGN
# =========================================================

def format_campaign(
    campaign: Campaign,
    db: Session,
):
    creator = (
        db.query(User)
        .filter(User.id == campaign.user_id)
        .first()
    )

    donation_stats = (
        db.query(
            func.count(Donation.id),
            func.count(func.distinct(Donation.donor_id)),
            func.sum(Donation.amount),
            func.avg(Donation.amount),
            func.max(Donation.amount),
        )
        .filter(Donation.campaign_id == campaign.id)
        .first()
    )

    donation_count = int(donation_stats[0] or 0)
    unique_donors = int(donation_stats[1] or 0)
    donation_total = float(donation_stats[2] or 0)
    average_donation = float(donation_stats[3] or 0)
    largest_donation = float(donation_stats[4] or 0)

    # Donation records are the source of truth when available.
    stored_raised = float(campaign.raised_amount or 0)
    raised_amount = max(stored_raised, donation_total)
    goal_amount = float(campaign.goal_amount or 0)
    remaining_amount = max(goal_amount - raised_amount, 0)
    funding_percentage = (
        min((raised_amount / goal_amount) * 100, 100)
        if goal_amount > 0
        else 0
    )

    latest_donation = (
        db.query(Donation)
        .filter(Donation.campaign_id == campaign.id)
        .order_by(Donation.id.desc())
        .first()
    )

    return {
        "id": campaign.id,
        "user_id": campaign.user_id,
        "creator_name": creator.full_name if creator else "Unknown Creator",
        "creator_email": creator.email if creator else None,
        "title": campaign.title,
        "category": campaign.category,
        "goal_amount": goal_amount,
        "raised_amount": raised_amount,
        "remaining_amount": remaining_amount,
        "funding_percentage": round(funding_percentage, 1),
        "donation_count": donation_count,
        "unique_donors": unique_donors,
        "average_donation": round(average_donation, 2),
        "largest_donation": largest_donation,
        "latest_donation_at": (
            latest_donation.created_at if latest_donation else None
        ),
        "duration_days": campaign.duration_days,
        "description": campaign.description,
        "image_url": campaign.image_url,
        "trust_score": float(campaign.trust_score or 0),
        "status": campaign.status,
        "created_at": getattr(campaign, "created_at", None),
    }


# =========================================================
# FORMAT DONATION
# =========================================================

def format_donation(
    donation: Donation,
    db: Session,
):
    donor = (
        db.query(User)
        .filter(User.id == donation.donor_id)
        .first()
    )

    campaign = (
        db.query(Campaign)
        .filter(Campaign.id == donation.campaign_id)
        .first()
    )

    return {
        "id": donation.id,
        "campaign_id": donation.campaign_id,
        "campaign_title": (
            campaign.title
            if campaign
            else "Unknown Campaign"
        ),
        "donor_id": donation.donor_id,
        "donor_name": (
            donor.full_name
            if donor
            else "Unknown Donor"
        ),
        "donor_email": (
            donor.email
            if donor
            else None
        ),
        "amount": float(donation.amount or 0),
        "wallet_address": donation.wallet_address,
        "transaction_hash": donation.transaction_hash,
        "created_at": donation.created_at,
    }


# =========================================================
# ADMIN DASHBOARD STATISTICS
# =========================================================

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

    total_donations = db.query(Donation).count()

    total_donation_amount = (
        db.query(func.sum(Donation.amount))
        .scalar()
        or 0
    )

    unique_donors = (
        db.query(
            func.count(
                func.distinct(Donation.donor_id)
            )
        )
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

        "total_donations": total_donations,

        "total_donation_amount": float(
            total_donation_amount
        ),

        "unique_donors": unique_donors,
    }


# =========================================================
# GET ALL USERS
# =========================================================

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

        donation_count = (
            db.query(Donation)
            .filter(Donation.donor_id == user.id)
            .count()
        )

        result.append({
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "campaign_count": campaign_count,
            "donation_count": donation_count,
        })

    return result


# =========================================================
# GET ALL CAMPAIGNS
# =========================================================

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


# =========================================================
# GET PENDING CAMPAIGNS
# =========================================================

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


# =========================================================
# GET ALL DONATIONS
# =========================================================

@router.get("/donations")
def get_all_donations(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    donations = (
        db.query(Donation)
        .order_by(Donation.id.desc())
        .all()
    )

    return [
        format_donation(donation, db)
        for donation in donations
    ]


# =========================================================
# GET RECENT DONATIONS
# =========================================================

@router.get("/donations/recent")
def get_recent_donations(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    donations = (
        db.query(Donation)
        .order_by(Donation.id.desc())
        .limit(10)
        .all()
    )

    return [
        format_donation(donation, db)
        for donation in donations
    ]


# =========================================================
# GET DONATIONS FOR ONE CAMPAIGN
# =========================================================

@router.get("/campaigns/{campaign_id}/donations")
def get_campaign_donation_history(
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

    donations = (
        db.query(Donation)
        .filter(Donation.campaign_id == campaign_id)
        .order_by(Donation.id.desc())
        .all()
    )

    return {
        "campaign": format_campaign(campaign, db),
        "donations": [
            format_donation(donation, db)
            for donation in donations
        ],
    }


# =========================================================
# APPROVE CAMPAIGN
# =========================================================

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

    notification = Notification(
    user_id=campaign.user_id,
    title="Campaign Approved",
    message=(
        f"Your campaign '{campaign.title}' has been approved. "
        "It is now visible to donors and can receive donations."
    ),
    notification_type="approved",
    related_campaign_id=campaign.id,
    )

    db.add(notification)

    db.commit()
    db.refresh(campaign)

    return {
        "message": "Campaign approved successfully",
        "campaign": format_campaign(campaign, db),
    }


# =========================================================
# REJECT CAMPAIGN
# =========================================================

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

    notification = Notification(
    user_id=campaign.user_id,
    title="Campaign Rejected",
    message=(
        f"Your campaign '{campaign.title}' was rejected. "
        "Please review the campaign details and update the information."
    ),
    notification_type="rejected",
    related_campaign_id=campaign.id,
    )

    db.add(notification)

    db.commit()
    db.refresh(campaign)

    return {
        "message": "Campaign rejected successfully",
        "campaign": format_campaign(campaign, db),
    }


# =========================================================
# SET CAMPAIGN BACK TO PENDING
# =========================================================

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


# =========================================================
# DELETE CAMPAIGN AS ADMIN
# =========================================================

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

    related_donations = (
        db.query(Donation)
        .filter(Donation.campaign_id == campaign_id)
        .all()
    )

    for donation in related_donations:
        db.delete(donation)

    db.delete(campaign)
    db.commit()

    return {
        "message": "Campaign and related donations deleted successfully",
    }


# =========================================================
# CHANGE USER ROLE
# =========================================================

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


# =========================================================
# DELETE USER
# =========================================================

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
        campaign_donations = (
            db.query(Donation)
            .filter(
                Donation.campaign_id == campaign.id
            )
            .all()
        )

        for donation in campaign_donations:
            db.delete(donation)

        db.delete(campaign)

    user_donations = (
        db.query(Donation)
        .filter(Donation.donor_id == user.id)
        .all()
    )

    for donation in user_donations:
        db.delete(donation)

    db.delete(user)
    db.commit()

    return {
        "message": "User and related data deleted successfully",
    }