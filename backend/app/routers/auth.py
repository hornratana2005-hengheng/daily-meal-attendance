import logging
import os
import smtplib
import ssl
from datetime import datetime, timedelta
from email.message import EmailMessage

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import LoginSession, Member, PasswordResetToken, User
from app.schemas.auth import (
    AuthResponse,
    AuthUser,
    LoginRequest,
    PasswordResetConfirm,
    PasswordResetRequest,
    ProfileUpdateRequest,
    SignUpRequest,
)
from app.security import (
    create_access_token,
    hash_access_token,
    hash_password,
    hash_reset_token,
    verify_password,
)


router = APIRouter()
bearer_scheme = HTTPBearer(auto_error=False)
SESSION_DURATION = timedelta(days=7)
PASSWORD_RESET_DURATION = timedelta(minutes=30)
logger = logging.getLogger(__name__)


def _send_password_reset_email(email: str, token: str) -> None:
    smtp_host, smtp_port, smtp_username, smtp_password, sender, frontend_url = (
        _password_reset_email_settings()
    )

    reset_url = f"{frontend_url}/reset-password?token={token}"
    message = EmailMessage()
    message["Subject"] = "Reset your MealTrack password"
    message["From"] = sender
    message["To"] = email
    message.set_content(
        "We received a request to reset your MealTrack password.\n\n"
        f"Use this link within 30 minutes:\n{reset_url}\n\n"
        "If you did not request this, you can ignore this email."
    )

    try:
        if smtp_port == 465:
            with smtplib.SMTP_SSL(
                smtp_host,
                smtp_port,
                timeout=10,
                context=ssl.create_default_context(),
            ) as server:
                if smtp_username:
                    server.login(smtp_username, smtp_password or "")
                server.send_message(message)
        else:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
                server.starttls(context=ssl.create_default_context())
                if smtp_username:
                    server.login(smtp_username, smtp_password or "")
                server.send_message(message)
    except (OSError, smtplib.SMTPException):
        logger.exception("Could not send password reset email")
        raise


def _password_reset_email_settings():
    smtp_host = os.getenv("SMTP_HOST")
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    sender = os.getenv("SMTP_FROM") or smtp_username
    frontend_url = os.getenv(
        "FRONTEND_URL",
        "https://daily-meal-attendance.vercel.app",
    ).rstrip("/")

    try:
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        if not 1 <= smtp_port <= 65535:
            raise ValueError
    except ValueError:
        smtp_port = None

    if not smtp_host or not sender or smtp_port is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Password reset email is not configured. Contact the administrator.",
        )

    return smtp_host, smtp_port, smtp_username, smtp_password, sender, frontend_url


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


@router.post("/password-reset/request")
def request_password_reset(
    data: PasswordResetRequest,
    db: Session = Depends(get_db),
):
    _password_reset_email_settings()
    email = str(data.email).strip().lower()
    user = db.scalar(select(User).where(User.email == email))
    if user is None:
        return {
            "message": "If an account exists for that email, a reset link will be sent."
        }

    token = create_access_token()
    token_hash = hash_reset_token(token)
    db.execute(
        delete(PasswordResetToken).where(PasswordResetToken.user_id == user.id)
    )
    db.add(
        PasswordResetToken(
            token_hash=token_hash,
            user_id=user.id,
            expires_at=datetime.utcnow() + PASSWORD_RESET_DURATION,
        )
    )
    db.commit()

    try:
        _send_password_reset_email(email, token)
    except (OSError, smtplib.SMTPException):
        db.execute(
            delete(PasswordResetToken).where(
                PasswordResetToken.token_hash == token_hash
            )
        )
        db.commit()
        return {
            "message": "If an account exists for that email, a reset link will be sent."
        }

    return {
        "message": "If an account exists for that email, a reset link will be sent."
    }


@router.post("/password-reset/confirm")
def confirm_password_reset(
    data: PasswordResetConfirm,
    db: Session = Depends(get_db),
):
    reset_token = db.scalar(
        select(PasswordResetToken)
        .where(PasswordResetToken.token_hash == hash_reset_token(data.token))
        .with_for_update()
    )
    now = datetime.utcnow()
    if reset_token is None or reset_token.expires_at <= now:
        if reset_token is not None:
            db.delete(reset_token)
            db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This password reset link is invalid or has expired. Request a new one.",
        )

    user = db.get(User, reset_token.user_id)
    if user is None:
        db.delete(reset_token)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This password reset link is invalid or has expired. Request a new one.",
        )

    user.password_hash = hash_password(data.password)
    db.execute(
        delete(PasswordResetToken).where(
            PasswordResetToken.user_id == user.id
        )
    )
    db.execute(delete(LoginSession).where(LoginSession.user_id == user.id))
    db.commit()
    return {"message": "Password changed successfully. Please log in."}


@router.get("/me", response_model=AuthUser)
def get_me(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _auth_user(user, db)


@router.put("/me", response_model=AuthUser)
def update_my_profile(
    data: ProfileUpdateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    name = data.name.strip()
    email = str(data.email).strip().lower()
    if not name:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Name cannot be empty",
        )

    existing_user = db.scalar(
        select(User).where(User.email == email, User.id != user.id)
    )
    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    member = db.get(Member, user.member_id)
    if member is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account member profile was not found",
        )

    member.name = name
    user.email = email
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        ) from error

    db.refresh(user)
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
