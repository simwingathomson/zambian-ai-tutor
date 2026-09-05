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
    parser.add_argument("--reset-password", action="store_true", help="Reset password and promote an existing user.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    password = args.password or getpass.getpass("Password: ")
    if len(password) < 8:
        raise SystemExit("Password must be at least 8 characters.")

    db = SessionLocal()
    try:
        existing_user = db.query(User).filter(User.email == args.email.lower()).first()
        if existing_user is not None:
            if not args.reset_password:
                raise SystemExit("A user with that email already exists. Re-run with --reset-password to update it.")
            existing_user.full_name = args.full_name
            existing_user.hashed_password = hash_password(password)
            existing_user.role = UserRole.admin
            db.commit()
            print(f"Updated admin user: {existing_user.email}")
            return

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
