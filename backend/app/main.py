from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config.database import Base, engine

# Import every model before create_all
from app.models.user import User
from app.models.campaign import Campaign
from app.models.donation import Donation
from app.models.notification import Notification

from app.routers import admin
from app.routers import auth
from app.routers import campaigns
from app.routers import dashboard
from app.routers import donations
from app.routers import notifications
from app.routers import profile


Base.metadata.create_all(bind=engine)

Path("uploads/campaigns").mkdir(
    parents=True,
    exist_ok=True,
)

app = FastAPI(
    title="BlockFund AI API",
    version="1.0.0",
    description="Backend API for BlockFund AI",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads",
)

app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(campaigns.router)
app.include_router(profile.router)
app.include_router(admin.router)
app.include_router(donations.router)
app.include_router(notifications.router)


@app.get("/")
def root():
    return {
        "message": "Welcome to BlockFund AI Backend 🚀",
    }