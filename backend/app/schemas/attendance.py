from datetime import date
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class MealType(str, Enum):
    Breakfast = "Breakfast"
    Lunch = "Lunch"
    Dinner = "Dinner"


class AttendanceStatus(str, Enum):
    Eating = "Eating"
    NotEating = "Not Eating"


class AttendanceCreate(BaseModel):
    member_id: int
    meal_date: date
    meal_type: MealType
    status: AttendanceStatus
    reason: Optional[str] = Field(default=None, max_length=500)