from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models import Grade

GRADE_NAMES = ["Grade 7", "Grade 9", "Grade 12"]


def seed_grades(db: Session) -> None:
    existing = {grade.name for grade in db.query(Grade).filter(Grade.name.in_(GRADE_NAMES)).all()}
    for name in GRADE_NAMES:
        if name not in existing:
            db.add(Grade(name=name))
    db.commit()


def main() -> None:
    db = SessionLocal()
    try:
        seed_grades(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
