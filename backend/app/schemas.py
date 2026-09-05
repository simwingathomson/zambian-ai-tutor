from pydantic import BaseModel, EmailStr, Field

from app.models import UserRole


class HealthResponse(BaseModel):
    status: str
    service: str


class RegisterRequest(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=255)
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: UserRole

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class GradeResponse(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class SubjectCreate(BaseModel):
    grade_id: int
    name: str = Field(min_length=2, max_length=120)


class SubjectResponse(BaseModel):
    id: int
    grade_id: int
    name: str

    model_config = {"from_attributes": True}


class TopicCreate(BaseModel):
    subject_id: int
    name: str = Field(min_length=2, max_length=160)


class TopicResponse(BaseModel):
    id: int
    subject_id: int
    name: str

    model_config = {"from_attributes": True}


class SubtopicCreate(BaseModel):
    topic_id: int
    name: str = Field(min_length=2, max_length=160)


class SubtopicResponse(BaseModel):
    id: int
    topic_id: int
    name: str

    model_config = {"from_attributes": True}


class StudentProfileUpsert(BaseModel):
    grade_id: int
    subject_ids: list[int] = Field(default_factory=list)


class StudentProfileResponse(BaseModel):
    id: int
    user_id: int
    grade: GradeResponse
    selected_subjects: list[SubjectResponse]

    model_config = {"from_attributes": True}


class MaterialUploadResponse(BaseModel):
    filename: str
    content_type: str | None
    size_bytes: int
    status: str
