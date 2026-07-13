from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.database import engine, Base

# Import models so SQLAlchemy creates the tables
from app.models.user import User
from app.models.campaign import Campaign
from app.models.donation import Donation

# Import routers
from app.routers import auth
from app.routers import dashboard
from app.routers import campaigns
from app.routers import profile
from app.routers import admin
from app.routers import donations


# Create database tables
Base.metadata.create_all(bind=engine)


# Create FastAPI application
app = FastAPI(
    title="BlockFund AI API",
    version="1.0.0",
    description="Backend API for BlockFund AI"
)


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(campaigns.router)
app.include_router(profile.router)
app.include_router(admin.router)
app.include_router(donations.router)


# Root API
@app.get("/")
def root():
    return {
        "message": "Welcome to BlockFund AI Backend 🚀"
    }