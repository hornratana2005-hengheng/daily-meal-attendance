from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.database import Base, SessionLocal, engine
from app import models
from app.models import Member
from app.routers import auth, members, attendance


# Create database tables
Base.metadata.create_all(bind=engine)

# Preserve the starter members when initializing an empty database.
with SessionLocal() as db:
    if not db.scalar(select(Member.id).limit(1)):
        db.add_all(
            [
                Member(id=1, name="Ratana"),
                Member(id=2, name="Vuthy"),
                Member(id=3, name="Sreynich"),
                Member(id=4, name="Chhunleang"),
                Member(id=5, name="Member 5"),
            ]
        )
        db.commit()


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
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Welcome to MealTrack API",
        "database": "MySQL",
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