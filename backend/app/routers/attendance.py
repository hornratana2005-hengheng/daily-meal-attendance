from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Attendance, Member, User
from app.routers.auth import get_current_user

from app.schemas.attendance import (
    AttendanceCreate,
    MealType,
)


router = APIRouter()


def build_attendance(
    db: Session,
    date_value: date,
    meal_type: MealType,
):
    members = db.scalars(
        select(Member).order_by(Member.id)
    ).all()

    attendance_rows = db.scalars(
        select(Attendance).where(
            Attendance.meal_date == date_value,
            Attendance.meal_type == meal_type.value,
        )
    ).all()

    records = {
        row.member_id: {"status": row.status, "reason": row.reason}
        for row in attendance_rows
    }

    member_list = [
        {
            "id": member.id,
            "name": member.name,
            "status": records.get(member.id, {}).get("status", "Pending"),
            "reason": records.get(member.id, {}).get("reason"),
        }
        for member in members
    ]

    statistics = {
        "total": len(member_list),

        "eating": sum(
            member["status"] == "Eating"
            for member in member_list
        ),

        "not_eating": sum(
            member["status"] == "Not Eating"
            for member in member_list
        ),

        "pending": sum(
            member["status"] == "Pending"
            for member in member_list
        ),
    }

    return {
        "date": date_value.isoformat(),
        "meal_type": meal_type.value,
        "statistics": statistics,
        "members": member_list,
    }


@router.get("/")
def get_attendance(
    meal_date: date = Query(default_factory=date.today),
    meal_type: MealType = MealType.Lunch,
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return build_attendance(
        db,
        meal_date,
        meal_type,
    )


@router.get("/history")
def get_attendance_history(
    meal_date: date = Query(...),
    meal_type: MealType = MealType.Lunch,
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return build_attendance(
        db,
        meal_date,
        meal_type,
    )


@router.get("/records")
def get_attendance_records(
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    attendance_rows = db.scalars(
        select(Attendance).order_by(
            Attendance.meal_date,
            Attendance.meal_type,
            Attendance.member_id,
        )
    ).all()

    records = {}
    for row in attendance_rows:
        key = f"{row.meal_date.isoformat()}_{row.meal_type}"
        records.setdefault(key, {})[row.member_id] = {
            "status": row.status,
            "reason": row.reason,
        }

    return records


@router.post("/")
def save_attendance(
    data: AttendanceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.member_id != current_user.member_id:
        raise HTTPException(
            status_code=403,
            detail="You can only submit attendance for your own member profile",
        )

    member = db.get(Member, data.member_id)

    if not member:
        raise HTTPException(
            status_code=404,
            detail="Member not found",
        )

    existing = db.scalar(
        select(Attendance).where(
            Attendance.member_id == data.member_id,
            Attendance.meal_date == data.meal_date,
            Attendance.meal_type == data.meal_type.value,
        )
    )

    reason = (
        data.reason.strip() or None
        if data.status.value == "Not Eating" and data.reason
        else None
    )

    if existing:
        existing.status = data.status.value
        existing.reason = reason
        attendance = existing

    else:
        attendance = Attendance(
            member_id=data.member_id,
            meal_date=data.meal_date,
            meal_type=data.meal_type.value,
            status=data.status.value,
            reason=reason,
        )

        db.add(attendance)

    db.commit()
    db.refresh(attendance)

    return {
        "message": "Attendance saved successfully",
        "attendance": {
            "id": attendance.id,
            "member_id": attendance.member_id,
            "meal_date": attendance.meal_date.isoformat(),
            "meal_type": attendance.meal_type,
            "status": attendance.status,
            "reason": attendance.reason,
        },
    }