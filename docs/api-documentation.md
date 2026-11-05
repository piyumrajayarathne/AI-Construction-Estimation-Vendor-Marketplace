# AURABUILD API

Base URL: `http://127.0.0.1:8000`. The Vite app proxies `/api` to this origin. All project and document routes require `Authorization: Bearer <access_token>` except register, login, and health.

## Health

`GET /api/health` → `{ "status": "ok", "service": "aurabuild" }`

## Auth

### `POST /api/auth/register`

Body:

```json
{
  "email": "amal@example.com",
  "password": "at-least-8-chars",
  "full_name": "Amal Perera",
  "role": "customer"
}
```

`role` must be `customer` or `vendor`. `admin` is rejected. `201` returns the user. Duplicate email: `409`.

### `POST /api/auth/login`

```json
{ "email": "amal@example.com", "password": "at-least-8-chars" }
```

`200`:

```json
{ "access_token": "<jwt>", "token_type": "bearer" }
```

### `GET /api/auth/me`

Returns `{ id, email, full_name, role }`.

## Projects

### `POST /api/projects`

```json
{
  "name": "Benchmark Residences — Block A",
  "description": "Residential masonry",
  "location": "Colombo, Sri Lanka",
  "budget_cap": 1000000
}
```

### `GET /api/projects`

Owned projects only.

### `GET /api/projects/{id}`

`404` if missing or not owned.

### `PATCH /api/projects/{id}`

Any of `name`, `description`, `location`, `budget_cap`, `status`. `status=estimated` is rejected while the engine is a stub.

### `GET /api/projects/{id}/activity`

Newest first: `{ id, project_id, event_type, message, created_at, actor_email, metadata }`.

## Documents

### `POST /api/projects/{id}/documents`

Multipart form: field **`file`** (PDF), optional `document_kind` (`drawing` | `specification` | `existing_boq` | `other`). `202` with:

```json
{
  "id": "...",
  "project_id": "...",
  "file_name": "GA-01.pdf",
  "file_type": "application/pdf",
  "status": "pending",
  "uploaded_at": "...",
  "document_kind": "drawing",
  "verification_status": "unverified",
  "page_count": null,
  "error": null,
  "error_message": null,
  "parse_metadata": null
}
```

Storage keys are not returned. Non-PDF: `400`. Over 25 MB: `413`.

Status lifecycle: `pending` → `processing` → `processed` | `failed`.

### `GET /api/projects/{id}/documents`

### `GET /api/projects/{id}/documents/{doc_id}`

### `GET /api/projects/{id}/documents/{doc_id}/chunks`

```json
[
  {
    "id": "...",
    "chunk_index": 1,
    "content": "extracted page text",
    "metadata": { "page_number": 1, "char_count": 120 },
    "has_embedding": false
  }
]
```

Embeddings are not generated in this slice.

## Estimation

### `GET /api/projects/{id}/estimation`

### `POST /api/projects/{id}/estimation`

Both return a stub result. Example:

```json
{
  "status": "unavailable",
  "engine": "stub",
  "reason": "Masonry estimation engine is not connected. AURABUILD will not fabricate quantities, rates, CIDA, or BSR numbers.",
  "lines": [],
  "missing_data": ["takeoff_engine", "verified_rate_library", "human_reviewer"],
  "verification_status": "unverified",
  "requested_at": null
}
```

`POST` records a request (`status: pending`) but still returns **no lines**.

## AI

### `GET /api/ai/status`

```json
{
  "connected": false,
  "provider": null,
  "message": "No language model is configured. The assistant is not connected and will not invent masonry quantities, rates, or BOQ lines."
}
```

`connected` is true only when `LLM_ENABLED=true` and `OPENAI_API_KEY` is set. Chat is not implemented without a model.
