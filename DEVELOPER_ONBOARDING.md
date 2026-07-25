# Developer Onboarding Guide: NS3 Central

Welcome to the NS3 Central engineering team! This guide will help you understand the architecture, get your local environment running, and become productive quickly.

## 1. Project Architecture

NS3 Central is a multi-tenant network monitoring platform with the following core components:
*   **Frontend**: React (Vite) Single Page Application using TypeScript, Tailwind CSS (v4), Shadcn UI, Zustand for state management, and TanStack React Query for API data fetching.
*   **Backend**: Python FastAPI server acting as the central API. Uses SQLAlchemy as the ORM, Alembic for migrations, and Pydantic for data validation.
*   **Database**: PostgreSQL (relational data like tenants, users, devices) and Redis (caching, background task queues). Future plans include TimescaleDB for metrics.
*   **Collector (WIP)**: Distributed agents installed in customer networks that push telemetry to the central backend.

## 2. Folder Structure

```text
ns3-ai/
├── backend/
│   ├── alembic/        # Database migration scripts
│   ├── app/            # FastAPI application code
│   │   ├── api/v1/     # API Endpoints (Auth, Devices, Organizations, etc.)
│   │   ├── core/       # Config, Security, Middleware
│   │   ├── models/     # SQLAlchemy Database Models
│   │   ├── schemas/    # Pydantic validation schemas
│   │   ├── crud/       # Database query operations
│   │   └── services/   # Business logic layer
│   └── tests/          # Pytest test suite
├── frontend/
│   ├── src/
│   │   ├── features/   # Domain-specific modules (Auth, Alerts, Devices, etc.)
│   │   ├── shared/     # Global components, UI library (Shadcn), hooks, services
│   │   └── App.tsx     # Main routing configuration
├── collector/          # Distributed polling agent (WIP)
├── infra/              # Docker compose and infrastructure configuration
└── docs/               # Architecture, requirements, and flow documentation
```

## 3. Local Environment Setup

### Prerequisites
*   **Docker & Docker Compose**: For running PostgreSQL and Redis.
*   **Python 3.14+**: The backend uses the latest Python features and `uv` for dependency management.
*   **Node.js (v20+) & npm**: For running the frontend.

### Step 1: Start Infrastructure
The `infra` folder contains the necessary services.
```bash
cd infra
docker-compose up -d
```
*Wait for PostgreSQL and Redis to start. PostgreSQL runs on port 5432.*

### Step 2: Setup Backend
We use `uv` for lightning-fast python environment management (or standard `pip` / `venv`).
```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# Mac/Linux
source .venv/bin/activate

# Install dependencies (using pip if uv is not installed)
pip install -e .

# Run Migrations
alembic upgrade head

# Seed Database (Optional but recommended)
python -m app.seed_demo

# Start the API Server
uvicorn app.main:app --reload
```
*The API will run at http://localhost:8000. Swagger UI is available at http://localhost:8000/docs.*

### Step 3: Setup Frontend
```bash
cd frontend
npm install

# Start the Vite development server
npm run dev
```
*The frontend will run at http://localhost:5173.*

## 4. Development Workflow & Conventions

*   **Frontend**: 
    *   Place reusable components in `src/shared/components`.
    *   Build specific pages inside `src/features/<feature-name>/pages`.
    *   Use `lucide-react` for icons.
*   **Backend**: 
    *   Follow the Router -> Service -> CRUD pattern.
    *   Do not inject database sessions directly into routers; use dependency injection to pass them to services.
    *   When changing models, generate a migration: `alembic revision --autogenerate -m "description"` and then `alembic upgrade head`.

## 5. Personal Learning Plan (Next Steps for You)

1.  **Understand the Domain**: Read `docs/app_flow.md` and `docs/product_roadmap.md` to understand what we are building.
2.  **Understand the Auth Flow**: Trace how a user logs in. Look at `frontend/src/features/auth/pages/LoginPage.tsx`, follow the API call to `backend/app/api/v1/endpoints/auth.py`, and see how the JWT token is generated and stored.
3.  **Understand Data Fetching**: Look at how `TanStack Query` is used in the frontend to fetch devices.
4.  **Explore the UI**: Click around the local dashboard. Note that some pages (like Alerts, Discovery) use mock data right now. Your first tasks will likely involve connecting these to real backend APIs.
