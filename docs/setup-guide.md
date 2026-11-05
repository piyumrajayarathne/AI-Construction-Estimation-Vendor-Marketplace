# AURABUILD setup guide

## Requirements

- Docker and Docker Compose, **or**
- Python 3.11+, Node.js 20+, and (optionally) PostgreSQL 15

## Docker Compose (recommended)

From the `AURABUILD/` root:

```bash
cp .env.example .env   # optional
docker compose up --build
```

| Service | URL |
| --- | --- |
| Frontend | http://127.0.0.1:43123 |
| Backend | http://127.0.0.1:8000 |
| Health | http://127.0.0.1:8000/api/health |
| OpenAPI | http://127.0.0.1:8000/docs |
| Postgres | localhost:5432 (`aurabuild` / `aurabuild` / `aurabuild`) |

The frontend image serves the production build through nginx and proxies `/api` to `backend:8000`.

## Environment

Copy `.env.example`. There is no committed `.env` and no production secret.

| Variable | Purpose |
| --- | --- |
| `JWT_SECRET` | Signing key for access tokens |
| `DATABASE_URL` | SQLAlchemy URL (`postgresql+psycopg2://...` or `sqlite:///...`) |
| `UPLOAD_DIR` | Directory for PDF bytes. Keys, not absolute paths, are stored. |
| `CORS_ORIGINS` | Comma-separated Vite origins |
| `LLM_ENABLED` | Leave `false` unless a real model is wired |
| `OPENAI_API_KEY` | Unused unless `LLM_ENABLED=true` |

## Local backend (SQLite)

```bash
cd Backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export JWT_SECRET=change-me-in-local-only
export DATABASE_URL=sqlite:///./aurabuild.db
export UPLOAD_DIR=./uploads
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

SQLite creates tables on startup. Postgres deployments use Alembic (`alembic upgrade head` in `entrypoint.sh`).

## Local frontend

```bash
cd Frontend
npm install
npm run dev
```

Dev server: http://127.0.0.1:43123 with `/api` → `http://127.0.0.1:8000`.

```bash
npm run build
npm run preview
```

## Tests

```bash
cd Backend
pytest -q
```

```bash
cd Frontend
npm run build
```

## First walkthrough

1. Open the app and register as a customer.
2. Create a project (for example Benchmark Residences — Block A).
3. Upload a PDF drawing. Status moves pending → processing → processed (or failed).
4. Open the document to read per-page chunks.
5. Open Masonry Estimation Results — expect unavailable / pending, not a generated BOQ.
6. Open the AI assistant — expect “not connected” unless an LLM is configured.

Vendor registration works. Marketplace, vendor catalogue, and admin are labeled coming later.
