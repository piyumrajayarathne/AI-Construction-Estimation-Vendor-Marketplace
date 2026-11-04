# AURABUILD Frontend

React workspace for **AURABUILD** — Construction Intelligence.

Customers register, open projects, upload drawings / specifications / existing BOQs, and review extracted PDF text. Masonry estimation is honest about an unavailable engine. Marketplace, vendor tools, and admin are labeled coming later.

## Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack React Query
- `fetch` (no Axios)

## Install and run

```bash
npm install
npm run dev
```

The Vite dev server listens on `http://127.0.0.1:43123` and proxies `/api` to `http://127.0.0.1:8000`.

```bash
npm run build
npm run preview
```

## Screens

- Login and registration (`customer` or `vendor`; no self-admin)
- Customer dashboard (counts from owned projects only)
- Project list, create, details, edit, documents, activity
- PDF upload, list, details, status, and page-chunk viewer
- Masonry Estimation Results (pending / unavailable — never a generated BOQ)
- AI assistant workspace (violet; shows not connected when no LLM)
- Marketplace, vendor, and admin foundation placeholders

## API client

JWT is stored in `localStorage` as `aurabuild_access_token` and sent as `Authorization: Bearer <token>`.

Start the FastAPI backend on port 8000 before exercising live data. The UI still renders loading, empty, and error states if the API is offline.
