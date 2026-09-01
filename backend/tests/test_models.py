from sqlalchemy.orm import Session

from app.db.session import engine
from app.models import Grade, StudentProfile, Subject, Subtopic, Topic, User, UserRole
from app.security import hash_password


def test_model_relationships():
    with Session(engine) as db:
        grade = Grade(name="Grade 12")
        subject = Subject(name="Mathematics", grade=grade)
        topic = Topic(name="Algebra", subject=subject)
        subtopic = Subtopic(name="Quadratic equations", topic=topic)
        user = User(
            email="student@example.com",
            full_name="Student Example",
            hashed_password=hash_password("strongpass123"),
            role=UserRole.student,
        )
        profile = StudentProfile(user=user, grade=grade, selected_subjects=[subject])

        db.add_all([grade, subject, topic, subtopic, user, profile])
        db.commit()

        saved_profile = db.query(StudentProfile).one()
        assert saved_profile.user.email == "student@example.com"
        assert saved_profile.grade.name == "Grade 12"
        assert saved_profile.selected_subjects[0].topics[0].subtopics[0].name == "Quadratic equations"
