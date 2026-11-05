# AURABUILD Backend

FastAPI service for AURABUILD Construction Intelligence.

## Stack

Python 3.11, FastAPI, SQLAlchemy, Alembic, JWT, PyMuPDF, pytest, Docker.

## Local (SQLite)

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export JWT_SECRET=change-me-in-local-only
export DATABASE_URL=sqlite:///./aurabuild.db
export UPLOAD_DIR=./uploads
uvicorn app.main:app --reload --port 8000
```

## Tests

```bash
pytest
```

Uploads are stored under `UPLOAD_DIR` using opaque keys. API responses never include server filesystem paths. Existing BOQs are stored as input documents. The masonry estimation stub returns `pending` / `unavailable` with empty lines.
