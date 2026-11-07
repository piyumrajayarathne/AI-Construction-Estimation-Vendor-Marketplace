# AURABUILD – Construction Intelligence

AURABUILD is an AI-assisted construction estimation and vendor marketplace platform designed to support construction professionals in managing projects, processing construction documents, and obtaining reliable estimation results.

The platform is being developed with future support for AI-assisted document analysis, cost estimation, material sourcing, and vendor interactions.

---

## Sprint 1

Sprint 1 established the core AURABUILD platform foundation.

### Frontend

- React 18 with TypeScript and Vite
- Tailwind CSS
- React Router
- Customer registration and login
- Dashboard and project management pages
- Project creation and project overview
- Document upload and document management
- Document details and processed document display

### Backend

- Python 3.11 with FastAPI
- SQLAlchemy and Alembic
- JWT-based authentication
- Customer and vendor roles
- Project management APIs
- Document management APIs
- PDF upload validation
- PDF text extraction and processing
- PostgreSQL support

### Document Processing

AURABUILD supports uploading construction documents such as:

- Drawings
- Specifications
- Existing BOQs
- Other PDF documents

Existing BOQs are treated as **input documents only**. AURABUILD does not generate a new BOQ.

### Infrastructure and DevOps

- Docker and Docker Compose
- Separate frontend and backend services
- PostgreSQL database container
- GitHub repository with feature branches and `dev` integration branch
- GitHub Actions CI workflows for backend, frontend, and Docker

### Sprint 1 Validation

The following were verified during Sprint 1:

- User registration and login
- JWT authentication
- Project creation and retrieval
- Document upload
- PDF processing
- Frontend-backend integration
- Frontend production build
- Backend tests
- Docker/CI workflow configuration

---

## Technology Stack

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router

### Backend

- Python 3.11
- FastAPI
- SQLAlchemy
- Alembic
- JWT Authentication

### Database

- PostgreSQL 15

### Document Processing

- PyMuPDF
- PDF text extraction
- PDF validation and processing

### DevOps

- Docker
- Docker Compose
- GitHub Actions

---

## Project Structure

```text
AURABUILD/
├── Frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── Backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── tests/
│   └── requirements.txt
│
├── docs/
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

## Core Product Workflow

The current platform foundation supports the following workflow:

```text
Register / Login
       ↓
Create Project
       ↓
Project Overview
       ↓
Upload Construction Documents
       ↓
Validate & Process PDF
       ↓
View Document Details
       ↓
Future Estimation / AI Processing
```

---

## Document Types

AURABUILD supports construction document categories including:

- **Drawing** – Plans, elevations, and construction details
- **Specification** – Technical construction specifications
- **Existing BOQ** – Existing Bill of Quantities provided as an input document
- **Other PDF** – Other relevant project PDF documents

### BOQ Policy

Existing BOQs are **input documents**.

AURABUILD must not present an AI-created output as a new or generated BOQ. Estimation results are presented separately from the source BOQ.

---

## Development Setup

### Prerequisites

Make sure the following are installed:

- Node.js
- Python 3.11
- PostgreSQL 15
- Docker Desktop
- Git

### Backend

```bash
cd Backend
python -m venv .venv
```

Activate the virtual environment.

Windows:

```powershell
.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn app.main:app --reload --port 8000
```

Backend API:

```text
http://localhost:8000
```

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

The Vite development server will provide the frontend URL in the terminal.

### Docker

The project also includes Docker Compose configuration for running the application services together.

```bash
docker compose up --build
```

To stop the services:

```bash
docker compose down
```

---

## Authentication

AURABUILD uses JWT-based authentication.

The platform supports role-based access for users such as:

- Customer
- Vendor
- Admin

Authentication is handled by the FastAPI backend.

---

## Testing

Backend tests are located in:

```text
Backend/tests/
```

Frontend production build can be verified using:

```bash
npm run build
```

CI workflows are configured under:

```text
.github/workflows/
```

---

## Git Workflow

The project uses feature branches with a `dev` integration branch.

```text
main
  ↓
dev
  ├── feat/auth
  ├── feat/projects
  ├── feat/documents
  ├── feat/pdf-processing
  └── feat/ci-cd
```

`main` is maintained as the stable branch, while completed feature work is integrated into `dev` before the final release.

---

## Current Sprint 1 Scope

Sprint 1 focuses on establishing the foundation required for future AURABUILD development:

- Frontend application
- Backend API
- Authentication
- Project management
- Document management
- PDF upload and processing
- Database integration
- Docker environment
- CI/CD workflows

Advanced AI capabilities, semantic document search, estimation intelligence, vendor marketplace functionality, and other future capabilities will be developed in subsequent stages.

---

## Product Principles

AURABUILD follows these principles:

- Do not fabricate construction quantities, rates, or prices.
- Existing BOQs remain source/input documents.
- Estimation outputs must be distinguishable from source documents.
- Construction calculations should be deterministic and verifiable.
- AI should assist interpretation and extraction rather than replace engineering judgment.
- Unverified information should be clearly identified.
- Final engineering decisions remain with qualified human reviewers.