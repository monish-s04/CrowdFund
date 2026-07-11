from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey
from app.config.database import Base


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String(150), nullable=False)

    category = Column(String(100), nullable=False)

    goal_amount = Column(Float, nullable=False)

    duration_days = Column(Integer, nullable=False)

    description = Column(Text, nullable=False)

    image_url = Column(String(255), nullable=True)

    raised_amount = Column(Float, default=0)

    trust_score = Column(Integer, default=85)

    status = Column(
        String(30),
        default="Pending"
    )