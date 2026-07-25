# Folder Inventory

This document maps the structural anatomy of the NS3 Central repository. 

## `/backend`
- **Purpose**: Houses the entire FastAPI monolithic application, database migrations, and core business logic.
- **Why it exists**: To isolate server-side processing, database interaction, and API routing from the frontend.
- **Blast Radius**: Critical. Deleting this destroys the entire application.

### `/backend/app`
- **Purpose**: The core application module.
- **Why it exists**: Standard Python packaging practice to avoid top-level clutter.
- **Status**: Production

### `/backend/app/api`
- **Purpose**: Defines the REST API endpoints and routing logic.
- **Contains**: `v1/endpoints/`, `dependencies.py`, `exceptions.py`.
- **Used by**: The FastAPI `main.py` router.
- **Status**: Production

### `/backend/app/auth`
- **Purpose**: Handles JWT token generation, password hashing, and user authentication dependencies.
- **Why it exists**: Security isolation.
- **Status**: Production

### `/backend/app/core`
- **Purpose**: Application configuration (`config.py`), security settings, and middleware.
- **Status**: Production

### `/backend/app/crud`
- **Purpose**: Create, Read, Update, Delete abstractions (Data Access Layer).
- **Why it exists**: To separate raw SQLAlchemy queries from the business logic layer.
- **Status**: Production

### `/backend/app/db`
- **Purpose**: Database session management and base classes.
- **Contains**: `session.py`, `base_class.py`.
- **Status**: Production

### `/backend/app/models`
- **Purpose**: SQLAlchemy ORM definitions mapping directly to PostgreSQL tables.
- **Why it exists**: Centralized source of truth for the database schema.
- **Status**: Production

### `/backend/app/schemas`
- **Purpose**: Pydantic models for request validation and response serialization.
- **Why it exists**: Enforces strict typing and data sanitization at the API boundary.
- **Status**: Production

### `/backend/app/services`
- **Purpose**: Business logic layer (e.g., `DeviceService`).
- **Why it exists**: To orchestrate CRUD operations, trigger events, and enforce business rules before hitting the database.
- **Status**: Production

### `/backend/alembic`
- **Purpose**: Database migration scripts.
- **Status**: Production

---

## `/frontend`
- **Purpose**: Houses the React/Vite Single Page Application.
- **Blast Radius**: Critical. Deleting this removes the user interface.

### `/frontend/src/app`
- **Purpose**: Global application setup (store initialization, providers).
- **Status**: Production

### `/frontend/src/features`
- **Purpose**: Domain-driven feature modules (Auth, Devices, Dashboard).
- **Why it exists**: Prevents a monolithic frontend by grouping related components, hooks, and API calls by business domain.
- **Status**: Production (some features are Demo/Mock)

#### `/frontend/src/features/auth`
- **Purpose**: Login screens, auth API clients, auth hooks.
- **Status**: Production

#### `/frontend/src/features/dashboard`
- **Purpose**: Visual overview of network health.
- **Status**: Demo/Mock (`useDemoDataEngine.ts`)

#### `/frontend/src/features/devices`
- **Purpose**: Device inventory, provisioning wizards, and device details.
- **Status**: Production (List) / Demo (Actions)

### `/frontend/src/routes`
- **Purpose**: Application routing definitions.
- **Status**: Production

### `/frontend/src/shared`
- **Purpose**: Generic, reusable code not tied to a specific business feature.
- **Contains**: `components/ui` (Shadcn), `api/` (Axios client), `hooks/` (Search, Pagination).
- **Why it exists**: To enforce DRY (Don't Repeat Yourself) principles.
- **Status**: Production

---

## `/docs`
- **Purpose**: Engineering documentation and onboarding materials.
- **Status**: Active Generation
