import argparse
import getpass

from sqlalchemy.exc import IntegrityError

from app.db.session import SessionLocal
from app.models import User, UserRole
from app.security import hash_password


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Create the first Zambian AI Tutor admin user.")
    parser.add_argument("--email", required=True)
    parser.add_argument("--full-name", required=True)
    parser.add_argument("--password", help="Omit to enter securely at the prompt.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    password = args.password or getpass.getpass("Password: ")
    if len(password) < 8:
        raise SystemExit("Password must be at least 8 characters.")

    db = SessionLocal()
    try:
        user = User(
            email=args.email.lower(),
            full_name=args.full_name,
            hashed_password=hash_password(password),
            role=UserRole.admin,
        )
        db.add(user)
        db.commit()
        print(f"Created admin user: {user.email}")
    except IntegrityError:
        db.rollback()
        raise SystemExit("A user with that email already exists.") from None
    finally:
        db.close()


if __name__ == "__main__":
    main()
