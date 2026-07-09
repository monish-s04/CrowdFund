from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.database import engine, Base
from app.models.user import User
from app.routers import auth

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BlockFund AI API",
    version="1.0.0",
    description="Backend API for BlockFund AI"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)


@app.get("/")
def root():
    return {
        "message": "Welcome to BlockFund AI Backend 🚀"
    }