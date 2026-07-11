from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.config.database import get_db
from app.models.campaign import Campaign

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_campaigns = db.query(Campaign).count()

    total_raised = db.query(func.sum(Campaign.raised_amount)).scalar() or 0

    average_trust = db.query(func.avg(Campaign.trust_score)).scalar() or 0

    recent_campaigns_db = (
        db.query(Campaign)
        .order_by(Campaign.id.desc())
        .limit(3)
        .all()
    )

    recent_campaigns = []

    for campaign in recent_campaigns_db:
        recent_campaigns.append({
            "title": campaign.title,
            "category": campaign.category,
            "trust": f"{campaign.trust_score}% Trust",
            "status": "success" if campaign.trust_score >= 80 else "warning"
        })

    return {
        "total_campaigns": total_campaigns,
        "funds_raised": f"₹{int(total_raised):,}",
        "average_trust": f"{int(average_trust)}%",
        "total_donors": 0,
        "recent_campaigns": recent_campaigns,
        "notifications": [
            "✅ Dashboard updated from MySQL",
            "🤖 AI trust score calculated",
            "⛓ Blockchain module ready",
            "📢 Campaign data loaded successfully"
        ]
    }