from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError, OperationalError
from sqlalchemy.orm import Session

from app.auth import get_current_user, require_admin
from app.core.config import get_settings
from app.db.session import get_db
from app.models import Grade, StudentProfile, Subject, Subtopic, Topic, User
from app.schemas import (
    GradeResponse,
    HealthResponse,
    LoginRequest,
    MaterialUploadResponse,
    RegisterRequest,
    StudentProfileResponse,
    StudentProfileUpsert,
    SubjectCreate,
    SubjectResponse,
    SubtopicCreate,
    SubtopicResponse,
    TokenResponse,
    TopicCreate,
    TopicResponse,
    UserResponse,
)
from app.security import create_access_token, hash_password, verify_password

settings = get_settings()

app = FastAPI(title="Zambian AI Tutor API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root() -> dict[str, str]:
    return {
        "service": "zambian-ai-tutor-api",
        "health": "/api/health",
        "docs": "/docs",
    }


@app.get("/api/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    return HealthResponse(status="ok", service="zambian-ai-tutor-api")


@app.post("/api/auth/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> TokenResponse:
    try:
        existing_user = db.query(User).filter(User.email == payload.email.lower()).first()
    except OperationalError:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database connection unavailable") from None
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already registered")

    user = User(
        email=payload.email.lower(),
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return TokenResponse(access_token=create_access_token(str(user.id)), user=user)


@app.post("/api/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    try:
        user = db.query(User).filter(User.email == payload.email.lower()).first()
    except OperationalError:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database connection unavailable") from None
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    return TokenResponse(access_token=create_access_token(str(user.id)), user=user)


@app.get("/api/auth/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@app.get("/api/grades", response_model=list[GradeResponse])
def list_grades(db: Session = Depends(get_db)) -> list[Grade]:
    return db.query(Grade).order_by(Grade.name).all()


@app.get("/api/subjects", response_model=list[SubjectResponse])
def list_subjects(grade_id: int | None = None, db: Session = Depends(get_db)) -> list[Subject]:
    query = db.query(Subject)
    if grade_id is not None:
        query = query.filter(Subject.grade_id == grade_id)
    return query.order_by(Subject.name).all()


@app.post("/api/admin/subjects", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
def create_subject(
    payload: SubjectCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> Subject:
    grade = db.get(Grade, payload.grade_id)
    if grade is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Grade not found")

    subject = Subject(grade_id=payload.grade_id, name=payload.name.strip())
    db.add(subject)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Subject already exists for this grade") from None
    db.refresh(subject)
    return subject


@app.get("/api/topics", response_model=list[TopicResponse])
def list_topics(subject_id: int | None = None, db: Session = Depends(get_db)) -> list[Topic]:
    query = db.query(Topic)
    if subject_id is not None:
        query = query.filter(Topic.subject_id == subject_id)
    return query.order_by(Topic.name).all()


@app.post("/api/admin/topics", response_model=TopicResponse, status_code=status.HTTP_201_CREATED)
def create_topic(
    payload: TopicCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> Topic:
    subject = db.get(Subject, payload.subject_id)
    if subject is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")

    topic = Topic(subject_id=payload.subject_id, name=payload.name.strip())
    db.add(topic)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Topic already exists for this subject") from None
    db.refresh(topic)
    return topic


@app.get("/api/subtopics", response_model=list[SubtopicResponse])
def list_subtopics(topic_id: int | None = None, db: Session = Depends(get_db)) -> list[Subtopic]:
    query = db.query(Subtopic)
    if topic_id is not None:
        query = query.filter(Subtopic.topic_id == topic_id)
    return query.order_by(Subtopic.name).all()


@app.post("/api/admin/subtopics", response_model=SubtopicResponse, status_code=status.HTTP_201_CREATED)
def create_subtopic(
    payload: SubtopicCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> Subtopic:
    topic = db.get(Topic, payload.topic_id)
    if topic is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")

    subtopic = Subtopic(topic_id=payload.topic_id, name=payload.name.strip())
    db.add(subtopic)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Subtopic already exists for this topic") from None
    db.refresh(subtopic)
    return subtopic


@app.post("/api/admin/materials/upload", response_model=MaterialUploadResponse)
async def upload_material(
    file: UploadFile = File(...),
    _: User = Depends(require_admin),
) -> MaterialUploadResponse:
    content = await file.read()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty")

    allowed_types = {
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
    }
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF, DOCX, and TXT files are accepted")

    return MaterialUploadResponse(
        filename=file.filename or "uploaded-material",
        content_type=file.content_type,
        size_bytes=len(content),
        status="received_pending_processing",
    )


@app.get("/api/student/profile", response_model=StudentProfileResponse)
def read_student_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> StudentProfile:
    profile = current_user.student_profile
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found")
    return profile


@app.put("/api/student/profile", response_model=StudentProfileResponse)
def upsert_student_profile(
    payload: StudentProfileUpsert,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> StudentProfile:
    grade = db.get(Grade, payload.grade_id)
    if grade is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Grade not found")

    subjects = db.query(Subject).filter(Subject.id.in_(payload.subject_ids)).all() if payload.subject_ids else []
    if len(subjects) != len(set(payload.subject_ids)):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="One or more subjects were not found")
    if any(subject.grade_id != payload.grade_id for subject in subjects):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Subjects must belong to the selected grade")

    profile = current_user.student_profile
    if profile is None:
        profile = StudentProfile(user_id=current_user.id, grade_id=payload.grade_id)
        db.add(profile)
    else:
        profile.grade_id = payload.grade_id
    profile.selected_subjects = subjects

    db.commit()
    db.refresh(profile)
    return profile
