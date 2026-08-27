# Freelance Marketplace

A full-stack freelance marketplace where clients post projects and freelancers submit proposals to win contracts.

## Tech Stack

- **Backend**: Django + Django REST Framework + SimpleJWT (SQLite)
- **Frontend**: React + Vite + Tailwind CSS + React Router

## Repository Layout

```
backend/   Django REST API (auth, projects, proposals, contracts)
frontend/  React SPA consuming the backend API
```

## Features

### Roles

- **Client**: sign up, create projects, view proposals, accept one proposal per project, view contracts
- **Freelancer**: sign up, browse/filter open projects, submit proposals, view submitted proposals, view contracts

### Core Business Rules

- JWT-based authentication; all APIs except signup/login require a token
- Passwords are hashed; request bodies validated with DRF serializers
- Only clients can create projects; only freelancers can submit proposals
- One proposal per freelancer per project
- A client can view proposals only for their own projects and accept only one per project
- Accepting a proposal rejects the others, sets the project to `in_progress`, and auto-creates a contract

## Backend API

| Method | Endpoint                            | Description                                   | Access      |
| ------ | ----------------------------------- | --------------------------------------------- | ----------- |
| POST   | `/api/auth/signup/`                 | Register a user                               | Public      |
| POST   | `/api/auth/login/`                  | Login, returns JWT tokens                     | Public      |
| GET    | `/api/projects/`                    | List open projects (filter by category/minBudget/maxBudget) | Authenticated |
| POST   | `/api/projects/`                    | Create a project                              | Client      |
| GET    | `/api/projects/mine/`               | List the client's own projects                | Client      |
| GET    | `/api/projects/<id>/`               | Project detail                                | Authenticated |
| GET    | `/api/projects/<id>/proposals/`     | Proposals for a project                       | Owner client |
| POST   | `/api/projects/<id>/proposals/`     | Submit a proposal                             | Freelancer  |
| GET    | `/api/proposals/mine/`              | The freelancer's submitted proposals          | Freelancer  |
| PUT    | `/api/proposals/<id>/accept/`       | Accept a proposal (creates contract)          | Owner client |
| GET    | `/api/contracts/`                   | Contracts for the logged-in user              | Authenticated |

API docs (Swagger) are available at `/api/docs/` when the backend is running.

## Running Locally

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -e .
cp .env.example .env   # set SECRET_KEY, DATABASE_URL, DEBUG, ALLOWED_HOSTS, CORS_ALLOWED_ORIGINS
python manage.py migrate
python manage.py runserver   # http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

The frontend calls the backend at `http://localhost:8000/api` by default. Set `VITE_API_URL` to point at your deployed backend (e.g. `https://your-backend.vercel.app/api`) when building for production.

## Configuration

The backend is configured via environment variables (see `backend/.env.example`):

| Variable                  | Purpose                                                                    | Default                                   |
| ------------------------- | -------------------------------------------------------------------------- | ----------------------------------------- |
| `SECRET_KEY`              | Django secret key                                                          | required                                  |
| `DATABASE_URL`            | Postgres (or any) database URL, parsed with `dj-database-url`              | local `db.sqlite3`                        |
| `DEBUG`                   | Enable Django debug mode (keep `False` in production)                      | `False`                                   |
| `ALLOWED_HOSTS`           | Comma-separated allowed hosts                                              | `localhost,127.0.0.1,.vercel.app`         |
| `CORS_ALLOWED_ORIGINS`    | Comma-separated browser origins allowed by CORS                            | localhost + `https://freelance-marketplace-super30.vercel.app` |
| `CORS_ALLOW_ALL_ORIGINS`  | Allow any origin (insecure; keep `False` in production)                    | `False`                                   |

Production hardening flags (`SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`) are also read from the environment.

> Note: The repository does not include `backend/.env` (contains the Django `SECRET_KEY` and `DATABASE_URL`), `backend/db.sqlite3`, or any virtual environments. See `.gitignore`.