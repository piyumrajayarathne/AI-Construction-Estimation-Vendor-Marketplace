# AURABUILD architecture

AURABUILD is a construction intelligence workspace for Benchmark Residences – Sri Lanka. This slice covers authentication, customer projects, PDF intake, extracted text, an honest masonry estimation stub, and foundation placeholders for marketplace / vendor / admin.

## Principles

- Existing BOQs are source documents, not generated output.
- The product does not invent quantities, rates, CIDA, or BSR numbers.
- Missing data is flagged. Human verification stays `unverified` until a reviewer exists.
- The estimation engine may be a stub. `pending` and `unavailable` are valid, honest states.
- The assistant must not pretend to be connected when no language model is configured.

## Stack

| Layer | Choice |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, `fetch` |
| Backend | Python 3.11, FastAPI (modular routers), SQLAlchemy 2, Alembic, JWT, PyMuPDF |
| Database | PostgreSQL 15 (SQLite allowed for local/dev tests) |
| Object storage | Local filesystem under `UPLOAD_DIR` (MinIO-compatible key layout; paths are not exposed) |
| Jobs | FastAPI `BackgroundTasks` for PDF processing. Redis/Celery is optional and not required locally. |
| Packaging | Docker Compose: `frontend`, `backend`, `postgres` |

## Modules

```text
Browser (Vite :43123)
  └─ /api  →  FastAPI (:8000)
                ├─ auth
                ├─ projects + activity
                ├─ documents + chunks
                ├─ estimation (stub)
                └─ ai status
         PostgreSQL 15
         uploads/  (opaque keys only)
```

### Auth

Customers and vendors self-register. Admin cannot be created through the public API. JWT access tokens carry `sub` (user id) and `role`.

### Projects

A project is a job folder owned by one user. List/get/patch are ownership-checked. Status starts at `draft` and may move to `analyzing` when a document is processed. The API refuses `estimated` without a connected engine.

### Documents

Multipart field name is `file`. Optional `document_kind`: `drawing` | `specification` | `existing_boq` | `other`. Files are stored as `{project_id}/{document_id}.pdf` under `UPLOAD_DIR`. Responses never include that path. Status: `pending` → `processing` → `processed` | `failed`. PyMuPDF extracts one chunk per page.

### Estimation

`GET`/`POST /api/projects/{id}/estimation` return `pending` or `unavailable`, `lines: []`, `missing_data`, and `verification_status: unverified`. No line items are fabricated.

### AI

`GET /api/ai/status` reports `connected: false` unless `LLM_ENABLED` is true and a key is present. The UI shows a violet workspace with an honest “not connected” state.

### Placeholders

Marketplace, vendor catalogue, and admin consoles are frontend-only foundations labeled coming later. They do not call live trading APIs.

## Deployment

`docker compose up --build` starts Postgres 15, the API on `:8000`, and the nginx-hosted frontend on `:43123` with `/api` proxied to the backend. Healthchecks are defined on all three services.
