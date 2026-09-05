from app.db.session import SessionLocal
from app.models import Grade, User, UserRole
from app.security import create_access_token, hash_password


def register_user(client, email="learner@example.com", role=UserRole.student):
    if role == UserRole.admin:
        with SessionLocal() as db:
            user = User(
                email=email,
                full_name="Admin User",
                hashed_password=hash_password("strongpass123"),
                role=UserRole.admin,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            return create_access_token(str(user.id))

    payload = {
        "email": email,
        "full_name": "Learner One",
        "password": "strongpass123",
    }

    response = client.post(
        "/api/auth/register",
        json=payload,
    )
    assert response.status_code == 201
    return response.json()["access_token"]


def seed_grade(name="Grade 12"):
    with SessionLocal() as db:
        grade = Grade(name=name)
        db.add(grade)
        db.commit()
        db.refresh(grade)
        return grade.id


def test_me_requires_valid_token(client):
    assert client.get("/api/auth/me").status_code == 401

    token = register_user(client)
    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert response.json()["email"] == "learner@example.com"


def test_admin_subject_create_requires_admin(client):
    grade_id = seed_grade()
    student_token = register_user(client)

    forbidden = client.post(
        "/api/admin/subjects",
        json={"grade_id": grade_id, "name": "Mathematics"},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert forbidden.status_code == 403

    admin_token = register_user(client, email="admin@example.com", role=UserRole.admin)
    created = client.post(
        "/api/admin/subjects",
        json={"grade_id": grade_id, "name": "Mathematics"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert created.status_code == 201
    assert created.json()["name"] == "Mathematics"

    duplicate = client.post(
        "/api/admin/subjects",
        json={"grade_id": grade_id, "name": "Mathematics"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert duplicate.status_code == 409


def test_admin_topic_and_subtopic_create(client):
    grade_id = seed_grade()
    admin_token = register_user(client, email="admin@example.com", role=UserRole.admin)
    headers = {"Authorization": f"Bearer {admin_token}"}

    subject = client.post(
        "/api/admin/subjects",
        json={"grade_id": grade_id, "name": "Science"},
        headers=headers,
    ).json()
    topic = client.post(
        "/api/admin/topics",
        json={"subject_id": subject["id"], "name": "Forces"},
        headers=headers,
    )
    assert topic.status_code == 201

    subtopic = client.post(
        "/api/admin/subtopics",
        json={"topic_id": topic.json()["id"], "name": "Balanced forces"},
        headers=headers,
    )
    assert subtopic.status_code == 201
    assert subtopic.json()["name"] == "Balanced forces"


def test_admin_material_upload_accepts_text_file(client):
    admin_token = register_user(client, email="admin@example.com", role=UserRole.admin)

    response = client.post(
        "/api/admin/materials/upload",
        headers={"Authorization": f"Bearer {admin_token}"},
        files={"file": ("sample.txt", b"authorised material", "text/plain")},
    )

    assert response.status_code == 200
    assert response.json()["filename"] == "sample.txt"
    assert response.json()["status"] == "received_pending_processing"


def test_student_profile_upsert(client):
    grade_id = seed_grade()
    token = register_user(client)

    response = client.put(
        "/api/student/profile",
        json={"grade_id": grade_id, "subject_ids": []},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert response.json()["grade"]["name"] == "Grade 12"
