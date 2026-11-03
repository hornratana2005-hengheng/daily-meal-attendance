import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker


load_dotenv(Path(__file__).resolve().parents[1] / ".env")

raw_database_url = os.getenv("DATABASE_URL")

if not raw_database_url:
    raise RuntimeError(
        "DATABASE_URL must be configured in backend/.env with a "
        "Supabase PostgreSQL connection string"
    )

database_url = make_url(raw_database_url)
if database_url.drivername in {
    "postgres",
    "postgresql",
    "postgresql+psycopg",
}:
    database_url = database_url.set(drivername="postgresql+psycopg")
else:
    raise RuntimeError("DATABASE_URL must use PostgreSQL")

engine = create_engine(database_url, pool_pre_ping=True)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
