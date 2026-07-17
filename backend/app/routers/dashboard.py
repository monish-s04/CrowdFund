from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from sqlalchemy import func
from jose import jwt, JWTError
from dotenv import load_dotenv

from datetime import datetime
import calendar
import os

from app.config.database import get_db
from app.models.campaign import Campaign
from app.models.donation import Donation


# =========================================================
# ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

security = HTTPBearer()


# =========================================================
# GET CURRENT LOGGED-IN USER
# =========================================================

def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("user_id")

        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token payload"
            )

        return int(user_id)

    except (JWTError, ValueError):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )


# =========================================================
# GET LAST SIX MONTHS
# =========================================================

def get_last_six_months():
    today = datetime.now()

    months = []

    year = today.year
    month = today.month

    for _ in range(6):
        months.append({
            "year": year,
            "month": month,
            "label": calendar.month_abbr[month]
        })

        month -= 1

        if month == 0:
            month = 12
            year -= 1

    months.reverse()

    return months


# =========================================================
# DASHBOARD STATISTICS
# =========================================================

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):

    # -----------------------------------------------------
    # GET USER CAMPAIGNS
    # -----------------------------------------------------

    user_campaigns = (
        db.query(Campaign)
        .filter(Campaign.user_id == user_id)
        .all()
    )

    campaign_ids = [
        campaign.id
        for campaign in user_campaigns
    ]


    # -----------------------------------------------------
    # TOTAL CAMPAIGNS
    # -----------------------------------------------------

    total_campaigns = len(user_campaigns)


    # -----------------------------------------------------
    # TOTAL FUNDS RAISED
    # -----------------------------------------------------

    total_raised = sum(
        float(campaign.raised_amount or 0)
        for campaign in user_campaigns
    )


    # -----------------------------------------------------
    # AVERAGE AI TRUST SCORE
    # -----------------------------------------------------

    if total_campaigns > 0:

        total_trust = sum(
            float(campaign.trust_score or 0)
            for campaign in user_campaigns
        )

        average_trust = (
            total_trust / total_campaigns
        )

    else:
        average_trust = 0


    # -----------------------------------------------------
    # TOTAL UNIQUE DONORS
    # -----------------------------------------------------

    if campaign_ids:

        total_donors = (
            db.query(
                func.count(
                    func.distinct(
                        Donation.donor_id
                    )
                )
            )
            .filter(
                Donation.campaign_id.in_(
                    campaign_ids
                )
            )
            .scalar()
            or 0
        )

    else:
        total_donors = 0


    # -----------------------------------------------------
    # RECENT CAMPAIGNS
    # -----------------------------------------------------

    recent_campaigns_db = (
        db.query(Campaign)
        .filter(
            Campaign.user_id == user_id
        )
        .order_by(
            Campaign.id.desc()
        )
        .limit(3)
        .all()
    )

    recent_campaigns = []

    for campaign in recent_campaigns_db:

        trust_score = int(
            campaign.trust_score or 0
        )

        recent_campaigns.append({

            "id":
                campaign.id,

            "title":
                campaign.title,

            "category":
                campaign.category,

            "trust":
                f"{trust_score}% Trust",

            "status":
                (
                    "success"
                    if trust_score >= 80
                    else "warning"
                ),

            "campaign_status":
                campaign.status

        })


    # -----------------------------------------------------
    # CHART DATA
    # LAST SIX MONTHS
    # -----------------------------------------------------

    last_six_months = (
        get_last_six_months()
    )

    chart_data = []

    donations = []

    if campaign_ids:

        donations = (
            db.query(Donation)
            .filter(
                Donation.campaign_id.in_(
                    campaign_ids
                )
            )
            .all()
        )


    for month_data in last_six_months:

        month_total = 0

        for donation in donations:

            if not donation.created_at:
                continue

            if (
                donation.created_at.year
                == month_data["year"]
                and
                donation.created_at.month
                == month_data["month"]
            ):

                month_total += float(
                    donation.amount or 0
                )


        chart_data.append({

            "label":
                month_data["label"],

            "amount":
                round(month_total, 2)

        })


    # -----------------------------------------------------
    # NOTIFICATIONS
    # -----------------------------------------------------

    notifications = []


    pending_count = sum(

        1

        for campaign in user_campaigns

        if campaign.status == "Pending"

    )


    approved_count = sum(

        1

        for campaign in user_campaigns

        if campaign.status == "Approved"

    )


    rejected_count = sum(

        1

        for campaign in user_campaigns

        if campaign.status == "Rejected"

    )


    if approved_count > 0:

        notifications.append(
            f"✅ {approved_count} campaign(s) approved"
        )


    if pending_count > 0:

        notifications.append(
            f"⏳ {pending_count} campaign(s) waiting for admin approval"
        )


    if rejected_count > 0:

        notifications.append(
            f"❌ {rejected_count} campaign(s) rejected"
        )


    if total_donors > 0:

        notifications.append(
            f"❤️ Your campaigns have received donations from {total_donors} donor(s)"
        )


    if len(notifications) == 0:

        notifications.append(
            "📢 Create your first campaign to get started"
        )


    # -----------------------------------------------------
    # FINAL RESPONSE
    # -----------------------------------------------------

    return {

        "total_campaigns":
            total_campaigns,

        "funds_raised":
            round(total_raised, 2),

        "average_trust":
            round(average_trust, 2),

        "total_donors":
            total_donors,

        "recent_campaigns":
            recent_campaigns,

        "notifications":
            notifications,

        "chart_data":
            chart_data

    }