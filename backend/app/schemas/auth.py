from pydantic import BaseModel, EmailStr, Field


class SignUpRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str = Field(min_length=1, max_length=128)
    password: str = Field(min_length=8, max_length=128)


class ProfileUpdateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr


class AuthUser(BaseModel):
    id: int
    name: str
    email: EmailStr
    member_id: int


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AuthUser
