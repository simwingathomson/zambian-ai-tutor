# Architecture

Zambian AI Tutor is planned as a modular educational SaaS platform. Phase one establishes the core web application and API foundation while leaving room for AI, document processing, and analytics features.

```text
Frontend
  ↓
FastAPI API
  ↓
PostgreSQL / Neon
  ↓
Document processing
  ↓
RAG / vector retrieval
  ↓
AI services
```

## Frontend

The frontend is a Next.js application using TypeScript and Tailwind CSS. It provides the landing page, authentication screens, student dashboard, and admin shell. The design is mobile-first, responsive, accessible, and professional enough for learners, parents, schools, and administrators.

Future frontend areas should include uploaded materials, AI conversations, practice sessions, mock papers, progress dashboards, study plans, and admin content management.

## FastAPI API

The backend exposes a versioned API surface under `/api`. Phase one includes health checks and authentication endpoints. Future modules should be added around clear domains:

- users and roles
- student profiles
- grade, subject, topic, and subtopic management
- uploaded educational materials
- examination papers and marking schemes
- question banks
- assessments and student answers
- progress tracking
- AI conversations
- AI-generated questions
- paper analysis
- study plans

## PostgreSQL / Neon

PostgreSQL stores relational application data. Neon PostgreSQL is the intended production database. Alembic migrations are the production migration strategy; application startup must not rely on `create_all()`.

Subjects, topics, and subtopics are database records rather than hard-coded curriculum logic. This allows curriculum expansion without code changes.

## Document Processing

Future document processing should handle authorised uploaded educational materials, PDFs, past examination papers, and marking schemes. Processing should extract text, metadata, sections, questions, answers, difficulty indicators, and curriculum tags where possible.

## RAG / Vector Retrieval

Future retrieval-augmented generation should use embeddings and vector search to ground tutoring responses in authorised materials. The relational database should keep canonical metadata and permissions, while vector storage should support semantic retrieval.

## AI Services

AI services should sit behind backend orchestration rather than being called directly from the frontend. AI outputs must be labelled clearly, especially trend analysis and predictions, which should never be presented as guaranteed examination questions.

Planned AI capabilities include step-by-step explanations, generated practice questions, mock examination papers, performance analysis, weak-topic detection, personalised study plans, and examination-readiness analytics.
