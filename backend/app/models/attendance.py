from datetime import date

from app.models.member import Member
from sqlalchemy import (
    Date,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)

from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Attendance(Base):
    __tablename__ = "attendances"

    __table_args__ = (
        UniqueConstraint(
            "member_id",
            "meal_date",
            "meal_type",
            name="uq_member_date_meal",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    member_id: Mapped[int] = mapped_column(
        ForeignKey("members.id"),
        nullable=False,
    )

    meal_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    meal_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    member: Mapped["Member"] = relationship(
        "Member",
        back_populates="attendances",
    )