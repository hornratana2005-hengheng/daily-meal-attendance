from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import LoginSession, Member, User
from app.schemas.auth import AuthResponse, AuthUser, LoginRequest, SignUpRequest
from app.security import (
    create_access_token,
    hash_access_token,
    hash_password,
    verify_password,
)


router = APIRouter()
bearer_scheme = HTTPBearer(auto_error=False)
SESSION_DURATION = timedelta(days=7)


def _auth_user(user: User, db: Session) -> AuthUser:
    member = db.get(Member, user.member_id)
    if member is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account member profile was not found",
        )
    return AuthUser(
        id=user.id,
        name=member.name,
        email=user.email,
        member_id=member.id,
    )


def _start_session(user: User, db: Session) -> AuthResponse:
    token = create_access_token()
    db.add(
        LoginSession(
            token_hash=hash_access_token(token),
            user_id=user.id,
            expires_at=datetime.utcnow() + SESSION_DURATION,
        )
    )
    db.commit()
    return AuthResponse(
        access_token=token,
        user=_auth_user(user, db),
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_hash = hash_access_token(credentials.credentials)
    login_session = db.get(LoginSession, token_hash)
    now = datetime.utcnow()
    if login_session is None or login_session.expires_at <= now:
        if login_session is not None:
            db.delete(login_session)
            db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.get(User, login_session.user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


@router.post("/signup", response_model=AuthResponse, status_code=201)
def sign_up(data: SignUpRequest, db: Session = Depends(get_db)):
    email = str(data.email).strip().lower()
    if db.scalar(select(User.id).where(User.email == email)) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    name = data.name.strip()
    if not name:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Name cannot be empty",
        )

    member = Member(name=name)
    db.add(member)
    db.flush()
    user = User(
        email=email,
        password_hash=hash_password(data.password),
        member_id=member.id,
    )
    db.add(user)

    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        ) from error

    db.refresh(user)
    return _start_session(user, db)


@router.post("/login", response_model=AuthResponse)
def log_in(data: LoginRequest, db: Session = Depends(get_db)):
    email = str(data.email).strip().lower()
    user = db.scalar(select(User).where(User.email == email))
    password_is_valid = verify_password(
        data.password,
        user.password_hash if user else None,
    )
    if user is None or not password_is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email or password is incorrect",
        )

    return _start_session(user, db)


@router.get("/me", response_model=AuthUser)
def get_me(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _auth_user(user, db)


@router.post("/logout", status_code=204)
def log_out(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    if credentials is not None:
        login_session = db.get(
            LoginSession,
            hash_access_token(credentials.credentials),
        )
        if login_session is not None:
            db.delete(login_session)
            db.commit()
