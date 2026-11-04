from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, text

from app.database import Base, SessionLocal, engine
from app import models
from app.models import Member
from app.routers import auth, members, attendance


# Create database tables once the database is reachable.
try:
    Base.metadata.create_all(bind=engine)
except Exception as exc:  # pragma: no cover - surfaced to startup logs
    raise RuntimeError(
        "Database connection failed. Check backend/.env DATABASE_URL and make sure it points to a valid PostgreSQL Supabase connection string."
    ) from exc

with engine.begin() as connection:
    connection.execute(
        text("ALTER TABLE attendances ADD COLUMN IF NOT EXISTS reason TEXT")
    )

app = FastAPI(
    title="MealTrack API",
    description="Daily Meal Attendance Management System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://daily-meal-attendance.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message": "Welcome to MealTrack API",
        "database": "PostgreSQL",
        "status": "running",
    }


app.include_router(
    auth.router,
    prefix="/api/auth",
    tags=["Authentication"],
)


app.include_router(
    members.router,
    prefix="/api/members",
    tags=["Members"],
)


app.include_router(
    attendance.router,
    prefix="/api/attendance",
    tags=["Attendance"],
)