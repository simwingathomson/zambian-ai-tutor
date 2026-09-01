# Zambian AI Tutor

Zambian AI Tutor is a production-ready educational SaaS foundation for Grade 7, Grade 9, and Grade 12 examination learners in Zambia.

Tagline: "Your AI-powered Zambian examination tutor."

This first phase provides the application foundation only: frontend shell, backend API, authentication groundwork, database models, migrations, seed data, tests, and deployment notes. AI tutoring, payments, document processing, RAG, and examination prediction features are intentionally deferred.

## Architecture

- `frontend`: Next.js, TypeScript, Tailwind CSS, mobile-first PWA-ready interface.
- `backend`: FastAPI, SQLAlchemy, Alembic, JWT authentication, PostgreSQL-ready configuration.
- `docs`: Architecture notes for future AI, document, assessment, and analytics services.

## Local Development Setup

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:3000`.

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Update `.env` with a local PostgreSQL URL and a secure `JWT_SECRET_KEY`.

## Environment Variables

Backend variables are documented in `backend/.env.example`:

- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_SECRET_KEY`: JWT signing secret.
- `JWT_ALGORITHM`: JWT signing algorithm. Use `HS256` unless the backend is intentionally changed.
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token lifetime.
- `BACKEND_CORS_ORIGINS`: Comma-separated frontend origins.
- `ENVIRONMENT`: `development`, `test`, or `production`.

Frontend variables are documented in `frontend/.env.example`:

- `NEXT_PUBLIC_API_BASE_URL`: Public backend API base URL, such as `http://127.0.0.1:8000` locally or the Render backend URL in production.

Do not commit real secrets.

## Database Setup

Create a PostgreSQL database locally or use Neon PostgreSQL in production. Then run migrations:

```bash
cd backend
alembic upgrade head
```

## Seed Data

```bash
cd backend
python -m app.seed
```

This seeds Grade 7, Grade 9, and Grade 12 only. Subjects, topics, and subtopics are database records designed to be added later.

## First Admin User

Create an admin account from the backend directory:

```bash
python -m app.create_admin --email admin@example.com --full-name "Admin User"
```

You will be prompted for a password. For non-interactive local setup, pass `--password`, but avoid doing that in shared shell history.

## Running Backend

Development:

```bash
cd backend
uvicorn app.main:app --reload
```

Production-compatible:

```bash
cd backend
gunicorn app.main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
```

Health check:

```bash
curl http://localhost:8000/api/health
```

## Phase 3 API Surface

- `GET /api/auth/me`: returns the current JWT-authenticated user.
- `GET /api/grades`: lists seeded grades.
- `GET /api/subjects?grade_id=...`: lists subjects, optionally by grade.
- `GET /api/topics?subject_id=...`: lists topics, optionally by subject.
- `GET /api/subtopics?topic_id=...`: lists subtopics, optionally by topic.
- `PUT /api/student/profile`: saves a student's selected grade and subjects.
- `POST /api/admin/subjects`: admin-only subject creation.
- `POST /api/admin/topics`: admin-only topic creation.
- `POST /api/admin/subtopics`: admin-only subtopic creation.

Frontend API requests use `NEXT_PUBLIC_API_BASE_URL`, defaulting to `http://localhost:8000`.

## Testing

```bash
cd backend
pytest
```

Frontend build:

```bash
cd frontend
npm run build
```

## Deployment

### GitHub

Create a GitHub repository and push this project after reviewing local changes:

```bash
git add .
git commit -m "Prepare first production deployment"
git remote add origin https://github.com/<your-account>/<repo-name>.git
git push -u origin main
```

Do not commit `.env`, database URLs, JWT secrets, API keys, passwords, or local credentials.

### Neon

Use the existing Neon PostgreSQL database. Do not create a new database for this deployment unless you intentionally want a separate environment. Confirm that the Neon connection string is stored only as a deployment environment variable.

Run migrations against Neon from the backend directory when needed:

```bash
alembic upgrade head
python -m app.seed
```

### Render

The root `render.yaml` defines the backend service.

Render build command:

```bash
pip install -r requirements.txt
```

Render pre-deploy migration command:

```bash
alembic upgrade head
```

Render start command:

```bash
gunicorn app.main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
```

Required Render environment variables:

- `DATABASE_URL`: Existing Neon PostgreSQL connection string.
- `JWT_SECRET_KEY`: Long random production secret.
- `JWT_ALGORITHM`: `HS256`.
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token lifetime, for example `60`.
- `BACKEND_CORS_ORIGINS`: Comma-separated frontend origins, including the Vercel URL after frontend deployment.
- `ENVIRONMENT`: `production`.

### Vercel

Deploy the `frontend` directory as the Vercel project root.

Vercel build command:

```bash
npm run build
```

Required Vercel environment variable:

- `NEXT_PUBLIC_API_BASE_URL`: Render backend URL, for example `https://<render-backend-domain>`.

Only expose values through `NEXT_PUBLIC_` when they are safe to be visible in the browser. Do not put backend secrets in Vercel public variables.

### Notes

- Use Neon PostgreSQL or another managed PostgreSQL provider.
- Run `alembic upgrade head` during deployment.
- Set `JWT_SECRET_KEY` and `DATABASE_URL` in the deployment environment.
- Restrict CORS origins to trusted frontend URLs.
- Serve the frontend through a Next.js-compatible host.
- Run the backend with Gunicorn and Uvicorn workers.
