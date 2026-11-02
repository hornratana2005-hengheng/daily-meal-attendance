from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Member, User
from app.routers.auth import get_current_user
from app.schemas.member import (
    MemberCreate,
    MemberUpdate,
    MemberResponse,
)


router = APIRouter()


# GET all members
@router.get("/", response_model=list[MemberResponse])
def get_members(
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.scalars(select(Member).order_by(Member.id)).all()


# GET one member
@router.get("/{member_id}", response_model=MemberResponse)
def get_member(
    member_id: int,
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    member = db.get(Member, member_id)

    if not member:
        raise HTTPException(
            status_code=404,
            detail="Member not found",
        )

    return member


# CREATE member
@router.post(
    "/",
    response_model=MemberResponse,
    status_code=201,
)
def create_member(
    data: MemberCreate,
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    name = data.name.strip()

    if not name:
        raise HTTPException(
            status_code=422,
            detail="Member name cannot be empty",
        )

    member = Member(name=name)
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


# UPDATE member
@router.put("/{member_id}", response_model=MemberResponse)
def update_member(
    member_id: int,
    data: MemberUpdate,
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    name = data.name.strip()

    if not name:
        raise HTTPException(
            status_code=422,
            detail="Member name cannot be empty",
        )

    member = db.get(Member, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    member.name = name
    db.commit()
    db.refresh(member)
    return member


# DELETE member
@router.delete("/{member_id}")
def delete_member(
    member_id: int,
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    member = db.get(Member, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    db.delete(member)
    db.commit()
    return {"message": "Member deleted successfully"}