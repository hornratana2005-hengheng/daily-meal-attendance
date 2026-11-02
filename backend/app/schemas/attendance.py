from datetime import date
from enum import Enum

from pydantic import BaseModel


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