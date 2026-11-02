from pydantic import BaseModel, ConfigDict, Field


class MemberCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class MemberUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class MemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str