from collections import defaultdict
from datetime import datetime
import calendar
import os

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.campaign import Campaign
from app.models.donation import Donation
from app.models.user import User


# =========================================================
# ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)

security = HTTPBearer()


# =========================================================
# GET CURRENT USER
# =========================================================

def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),
) -> int:

    if not SECRET_KEY:
        raise HTTPException(
            status_code=500,
            detail="SECRET_KEY is not configured",
        )

    try:
        payload = jwt.decode(
            credentials.credentials,
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
# GET LAST SIX MONTHS
# =========================================================

def last_six_months():

    current_date = datetime.now()

    year = current_date.year
    month = current_date.month

    result = []

    for _ in range(6):

        result.append({
            "year": year,
            "month": month,
            "label": (
                f"{calendar.month_abbr[month]} "
                f"{str(year)[-2:]}"
            ),
        })

        month -= 1

        if month == 0:
            month = 12
            year -= 1

    result.reverse()

    return result


# =========================================================
# DASHBOARD STATISTICS
# =========================================================

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):

    # -----------------------------------------------------
    # GET USER
    # -----------------------------------------------------

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    # -----------------------------------------------------
    # GET USER CAMPAIGNS
    # -----------------------------------------------------

    campaigns = (
        db.query(Campaign)
        .filter(Campaign.user_id == user_id)
        .order_by(Campaign.id.desc())
        .all()
    )

    campaign_ids = [
        campaign.id
        for campaign in campaigns
    ]

    # -----------------------------------------------------
    # GET CAMPAIGN DONATIONS
    # -----------------------------------------------------

    donations = []

    if campaign_ids:
        donations = (
            db.query(Donation)
            .filter(
                Donation.campaign_id.in_(
                    campaign_ids
                )
            )
            .order_by(Donation.id.desc())
            .all()
        )

    # -----------------------------------------------------
    # BASIC STATISTICS
    # -----------------------------------------------------

    total_campaigns = len(campaigns)

    total_donations = len(donations)

    donation_total = sum(
        float(donation.amount or 0)
        for donation in donations
    )

    stored_total = sum(
        float(campaign.raised_amount or 0)
        for campaign in campaigns
    )

    total_raised = max(
        donation_total,
        stored_total,
    )

    # -----------------------------------------------------
    # AVERAGE TRUST SCORE
    # -----------------------------------------------------

    if total_campaigns > 0:

        average_trust = (
            sum(
                float(
                    campaign.trust_score or 0
                )
                for campaign in campaigns
            )
            / total_campaigns
        )

    else:
        average_trust = 0

    # -----------------------------------------------------
    # DONATION STATISTICS
    # -----------------------------------------------------

    if total_donations > 0:
        average_donation = (
            donation_total / total_donations
        )
    else:
        average_donation = 0

    largest_donation = max(
        (
            float(donation.amount or 0)
            for donation in donations
        ),
        default=0,
    )

    unique_donors = len({
        donation.donor_id
        for donation in donations
        if donation.donor_id is not None
    })

    # -----------------------------------------------------
    # CAMPAIGN STATUS COUNTS
    # -----------------------------------------------------

    approved_campaigns = sum(
        campaign.status == "Approved"
        for campaign in campaigns
    )

    pending_campaigns = sum(
        campaign.status == "Pending"
        for campaign in campaigns
    )

    rejected_campaigns = sum(
        campaign.status == "Rejected"
        for campaign in campaigns
    )

    # -----------------------------------------------------
    # CAMPAIGN CATEGORY BREAKDOWN
    # -----------------------------------------------------

    category_counts = defaultdict(int)

    for campaign in campaigns:

        category_name = (
            campaign.category
            or "Other"
        )

        category_counts[
            category_name
        ] += 1

    category_breakdown = [
        {
            "label": category,
            "value": count,
        }
        for category, count in sorted(
            category_counts.items(),
            key=lambda item: item[1],
            reverse=True,
        )
    ]

    # -----------------------------------------------------
    # CAMPAIGN STATUS BREAKDOWN
    # -----------------------------------------------------

    status_breakdown = [
        {
            "label": "Approved",
            "value": approved_campaigns,
        },
        {
            "label": "Pending",
            "value": pending_campaigns,
        },
        {
            "label": "Rejected",
            "value": rejected_campaigns,
        },
    ]

    # -----------------------------------------------------
    # AI TRUST DISTRIBUTION
    # -----------------------------------------------------

    trust_groups = {
        "High Trust": 0,
        "Medium Trust": 0,
        "Low Trust": 0,
    }

    for campaign in campaigns:

        trust_score = float(
            campaign.trust_score or 0
        )

        if trust_score >= 80:
            trust_groups[
                "High Trust"
            ] += 1

        elif trust_score >= 60:
            trust_groups[
                "Medium Trust"
            ] += 1

        else:
            trust_groups[
                "Low Trust"
            ] += 1

    trust_distribution = [
        {
            "label": label,
            "value": value,
        }
        for label, value
        in trust_groups.items()
    ]

    # -----------------------------------------------------
    # MONTHLY DONATION CHART DATA
    # -----------------------------------------------------

    months = last_six_months()

    month_index = {
        (
            month_data["year"],
            month_data["month"],
        ): index
        for index, month_data
        in enumerate(months)
    }

    month_amounts = [0.0] * 6
    month_counts = [0] * 6

    for donation in donations:

        if not donation.created_at:
            continue

        key = (
            donation.created_at.year,
            donation.created_at.month,
        )

        if key in month_index:

            index = month_index[key]

            month_amounts[index] += float(
                donation.amount or 0
            )

            month_counts[index] += 1

    chart_data = [
        {
            "label": month_data["label"],
            "amount": round(
                month_amounts[index],
                2,
            ),
            "donations": month_counts[index],
        }
        for index, month_data
        in enumerate(months)
    ]

    # -----------------------------------------------------
    # RECENT CAMPAIGNS
    # -----------------------------------------------------

    recent_campaigns = []

    for campaign in campaigns[:5]:

        goal_amount = float(
            campaign.goal_amount or 0
        )

        raised_amount = float(
            campaign.raised_amount or 0
        )

        if goal_amount > 0:

            funding_percentage = min(
                (
                    raised_amount
                    / goal_amount
                ) * 100,
                100,
            )

        else:
            funding_percentage = 0

        recent_campaigns.append({
            "id": campaign.id,
            "title": campaign.title,
            "category": campaign.category,
            "goal_amount": goal_amount,
            "raised_amount": raised_amount,
            "funding_percentage": round(
                funding_percentage,
                1,
            ),
            "trust_score": int(
                campaign.trust_score or 0
            ),
            "campaign_status": (
                campaign.status
                or "Pending"
            ),
        })

    # -----------------------------------------------------
    # RECENT DONATIONS
    # -----------------------------------------------------

    recent_donations = []

    for donation in donations[:8]:

        donor = (
            db.query(User)
            .filter(
                User.id
                == donation.donor_id
            )
            .first()
        )

        campaign = next(
            (
                campaign_item
                for campaign_item
                in campaigns
                if campaign_item.id
                == donation.campaign_id
            ),
            None,
        )

        recent_donations.append({
            "id": donation.id,

            "donor_name": (
                donor.full_name
                if donor
                else "Anonymous"
            ),

            "campaign_title": (
                campaign.title
                if campaign
                else "Unknown Campaign"
            ),

            "amount": float(
                donation.amount or 0
            ),

            "wallet_address":
                donation.wallet_address,

            "transaction_hash":
                donation.transaction_hash,

            "created_at":
                donation.created_at,
        })

    # -----------------------------------------------------
    # TOP CAMPAIGN
    # -----------------------------------------------------

    top_campaign = None

    if campaigns:

        top = max(
            campaigns,
            key=lambda campaign: float(
                campaign.raised_amount or 0
            ),
        )

        top_goal = float(
            top.goal_amount or 0
        )

        top_raised = float(
            top.raised_amount or 0
        )

        if top_goal > 0:

            top_percentage = min(
                (
                    top_raised
                    / top_goal
                ) * 100,
                100,
            )

        else:
            top_percentage = 0

        top_campaign = {
            "id": top.id,
            "title": top.title,
            "goal_amount": top_goal,
            "raised_amount": top_raised,
            "funding_percentage": round(
                top_percentage,
                1,
            ),
            "trust_score": int(
                top.trust_score or 0
            ),
            "status": top.status,
        }

    # -----------------------------------------------------
    # SMART NOTIFICATIONS
    # -----------------------------------------------------

    notifications = []

    if approved_campaigns > 0:

        notifications.append(
            f"✅ {approved_campaigns} "
            "campaign(s) approved"
        )

    if pending_campaigns > 0:

        notifications.append(
            f"⏳ {pending_campaigns} "
            "campaign(s) awaiting review"
        )

    if rejected_campaigns > 0:

        notifications.append(
            f"❌ {rejected_campaigns} "
            "campaign(s) rejected"
        )

    if unique_donors > 0:

        notifications.append(
            f"❤️ {unique_donors} unique "
            "donor(s) supported your campaigns"
        )

    if total_donations > 0:

        notifications.append(
            f"⛓️ {total_donations} blockchain "
            "payment record(s)"
        )

    if not notifications:

        notifications.append(
            "📢 Create your first campaign "
            "to get started"
        )

    # -----------------------------------------------------
    # FINAL RESPONSE
    # -----------------------------------------------------

    return {
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
        },

        "total_campaigns":
            total_campaigns,

        "approved_campaigns":
            approved_campaigns,

        "pending_campaigns":
            pending_campaigns,

        "rejected_campaigns":
            rejected_campaigns,

        "funds_raised":
            round(total_raised, 2),

        "average_trust":
            round(average_trust, 1),

        "total_donors":
            unique_donors,

        "total_donations":
            total_donations,

        "average_donation":
            round(average_donation, 2),

        "largest_donation":
            round(largest_donation, 2),

        "top_campaign":
            top_campaign,

        "recent_campaigns":
            recent_campaigns,

        "recent_donations":
            recent_donations,

        "notifications":
            notifications,

        "chart_data":
            chart_data,

        "category_breakdown":
            category_breakdown,

        "status_breakdown":
            status_breakdown,

        "trust_distribution":
            trust_distribution,
    }