from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from dotenv import load_dotenv
from pydantic import BaseModel, EmailStr
import os

from app.config.database import get_db
from app.models.user import User
from app.models.campaign import Campaign

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)


# ============================================================
# UPDATE PROFILE SCHEMA
# ============================================================

class ProfileUpdate(BaseModel):
    full_name: str
    email: EmailStr


# ============================================================
# GET CURRENT LOGGED-IN USER ID
# ============================================================

def get_current_user_id(
    authorization: str = Header(None)
) -> int:

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token missing"
        )

    token = authorization.split(" ", 1)[1]

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("user_id")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

        return int(user_id)

    except (JWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )


# ============================================================
# GET MY PROFILE
# ============================================================

@router.get("/me")
def get_my_profile(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    total_campaigns = (
        db.query(Campaign)
        .filter(Campaign.user_id == user_id)
        .count()
    )

    total_funds = (
        db.query(func.sum(Campaign.raised_amount))
        .filter(Campaign.user_id == user_id)
        .scalar()
        or 0
    )

    average_trust = (
        db.query(func.avg(Campaign.trust_score))
        .filter(Campaign.user_id == user_id)
        .scalar()
        or 0
    )

    recent_campaigns = (
        db.query(Campaign)
        .filter(Campaign.user_id == user_id)
        .order_by(Campaign.id.desc())
        .limit(3)
        .all()
    )

    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,

        "total_campaigns": total_campaigns,

        "total_funds_raised": float(total_funds),

        "average_trust_score": round(
            float(average_trust),
            1
        ),

        "total_donations": 0,

        "wallet_status": "Not Connected",

        "wallet_address": None,

        "recent_activity": [
            f"Created campaign: {campaign.title}"
            for campaign in recent_campaigns
        ]
    }


# ============================================================
# UPDATE MY PROFILE
# ============================================================

@router.put("/me")
def update_my_profile(
    profile_data: ProfileUpdate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Clean input
    new_name = profile_data.full_name.strip()
    new_email = profile_data.email.strip().lower()

    if len(new_name) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Full name must contain at least 2 characters"
        )

    # Check whether another account already uses this email
    existing_user = (
        db.query(User)
        .filter(
            User.email == new_email,
            User.id != user_id
        )
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is already registered"
        )

    # Update database
    user.full_name = new_name
    user.email = new_email

    try:
        db.commit()
        db.refresh(user)

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to update profile"
        )

    return {
        "message": "Profile updated successfully",
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role
    }