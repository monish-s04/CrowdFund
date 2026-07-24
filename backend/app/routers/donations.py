import os

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.campaign import Campaign
from app.models.donation import Donation
from app.models.notification import Notification
from app.models.user import User
from app.schemas.donation_schema import DonationCreate


load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

router = APIRouter(
    prefix="/donations",
    tags=["Donations"],
)

security = HTTPBearer()


# =========================================================
# GET CURRENT USER
# =========================================================

def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
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
        "amount": float(donation.amount or 0),
        "wallet_address": donation.wallet_address,
        "transaction_hash": donation.transaction_hash,
        "created_at": donation.created_at,
    }


# =========================================================
# CREATE DONATION
# =========================================================

@router.post("/")
def create_donation(
    donation_data: DonationCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    campaign = (
        db.query(Campaign)
        .filter(
            Campaign.id == donation_data.campaign_id
        )
        .first()
    )

    if campaign is None:
        raise HTTPException(
            status_code=404,
            detail="Campaign not found",
        )

    if campaign.status != "Approved":
        raise HTTPException(
            status_code=400,
            detail="Donations are allowed only for approved campaigns",
        )

    if donation_data.amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Donation amount must be greater than zero",
        )

    existing_transaction = (
        db.query(Donation)
        .filter(
            Donation.transaction_hash
            == donation_data.transaction_hash
        )
        .first()
    )

    if existing_transaction:
        raise HTTPException(
            status_code=400,
            detail="Transaction already recorded",
        )

    donor = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    new_donation = Donation(
        campaign_id=donation_data.campaign_id,
        donor_id=user_id,
        amount=donation_data.amount,
        wallet_address=donation_data.wallet_address,
        transaction_hash=donation_data.transaction_hash,
    )

    db.add(new_donation)

    campaign.raised_amount = (
        float(campaign.raised_amount or 0)
        + float(donation_data.amount)
    )

    # Notification for campaign owner
    owner_notification = Notification(
        user_id=campaign.user_id,
        title="New Donation Received",
        message=(
            f"{donor.full_name if donor else 'A donor'} donated "
            f"₹{float(donation_data.amount):,.2f} to "
            f"your campaign '{campaign.title}'."
        ),
        notification_type="donation",
        related_campaign_id=campaign.id,
    )

    db.add(owner_notification)

    # Donation confirmation for donor
    if user_id != campaign.user_id:
        donor_notification = Notification(
            user_id=user_id,
            title="Donation Successful",
            message=(
                f"Your donation of "
                f"₹{float(donation_data.amount):,.2f} to "
                f"'{campaign.title}' was recorded successfully."
            ),
            notification_type="success",
            related_campaign_id=campaign.id,
        )

        db.add(donor_notification)

    db.commit()
    db.refresh(new_donation)
    db.refresh(campaign)

    return {
        "message": "Donation recorded successfully",
        "donation": format_donation(
            new_donation,
            db,
        ),
        "updated_raised_amount": campaign.raised_amount,
    }


# =========================================================
# GET ALL DONATIONS
# =========================================================

@router.get("/")
def get_all_donations(
    db: Session = Depends(get_db),
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
# GET CAMPAIGN DONATIONS
# =========================================================

@router.get("/campaign/{campaign_id}")
def get_campaign_donations(
    campaign_id: int,
    db: Session = Depends(get_db),
):
    donations = (
        db.query(Donation)
        .filter(
            Donation.campaign_id == campaign_id
        )
        .order_by(Donation.id.desc())
        .all()
    )

    return [
        format_donation(donation, db)
        for donation in donations
    ]


# =========================================================
# GET MY DONATIONS
# =========================================================

@router.get("/my")
def get_my_donations(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    donations = (
        db.query(Donation)
        .filter(
            Donation.donor_id == user_id
        )
        .order_by(Donation.id.desc())
        .all()
    )

    return [
        format_donation(donation, db)
        for donation in donations
    ]