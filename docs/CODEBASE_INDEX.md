# Codebase Index (Batch 4)

This document is a highly searchable index of the core files in the repository.

---

## Backend: Data & Logic

### `backend/app/models/device.py`
- **Purpose**: Defines SQLAlchemy models for Devices, Profiles, and Metrics.
- **Why it exists**: Source of truth for network infrastructure storage.
- **Used by**: `device_service.py`, `crud/device.py`, Alembic.
- **Database Tables Touched**: `devices`, `interfaces`, `collectors`, etc.
- **Difficulty**: ⭐⭐⭐⭐
- **Safe to modify?**: ⚠️ **High Risk**. Changing columns requires Alembic migrations.
- **Blast Radius**: Massive. Breaks the entire API if schema is invalid.
- **Refactoring Suggestions**: As metric tables grow, ensure TimescaleDB hypertables are explicitly configured in the SQLAlchemy definitions (currently missing).

### `backend/app/services/device_service.py`
- **Purpose**: Business logic for device management.
- **Why it exists**: Encapsulates rules like "does a device with this IP already exist in this site?"
- **Who calls it**: `api/v1/endpoints/devices.py`
- **Internal flow**: Validates constraints -> Calls `crud` methods -> Emits events via `event_bus`.
- **Difficulty**: ⭐⭐⭐
- **Safe to modify?**: Yes, with test coverage.
- **Technical Debt**: "Restore" and "Soft Delete" logic doesn't currently cleanup related metric series.

---

## Backend: Routing & Security

### `backend/app/api/v1/endpoints/devices.py`
- **Purpose**: Exposes the REST API for devices.
- **Why it exists**: Network interface for frontend/third-party consumption.
- **Who imports it**: `api.py` (Main router)
- **External Dependencies**: FastAPI, Pydantic (schemas).
- **Difficulty**: ⭐⭐
- **Safe to modify?**: Yes, but changes break API contracts (frontend types).

### `backend/app/auth/authorization_dependencies.py`
- **Purpose**: Injects RBAC checks (`RequirePermission`) and extracts tenancy (`extract_tenant_id`).
- **Why it exists**: Centralizes authorization to prevent security bypasses in routers.
- **Internal flow**: Reads JWT -> Queries `user_role_assignments` -> Validates scopes -> Returns User.
- **Difficulty**: ⭐⭐⭐⭐⭐
- **Safe to modify?**: ❌ **NO**. Extreme risk.
- **Blast Radius**: Modifying this incorrectly will cause global unauthorized data leaks across Tenants.

---

## Frontend: Architecture

### `frontend/src/App.tsx`
- **Purpose**: The React root component.
- **Why it exists**: Mounts React Router, Theme Provider, and React Query Client.
- **Difficulty**: ⭐⭐
- **Safe to modify?**: Yes. Add new `<Route>` definitions here.

### `frontend/src/shared/api/axios.ts`
- **Purpose**: Configured Axios HTTP client.
- **Why it exists**: Centralized interception of requests (to attach JWT) and responses (to handle 401 token refreshes).
- **External Dependencies**: Axios.
- **Difficulty**: ⭐⭐⭐⭐
- **Blast Radius**: Modifying interceptors can break all network requests.

### `frontend/src/features/dashboard/hooks/useDemoDataEngine.ts`
- **Purpose**: Simulates real-time telemetry data.
- **Why it exists**: The backend collector engine is Not Implemented.
- **Who calls it**: `DashboardPage.tsx`
- **Difficulty**: ⭐⭐
- **Technical Debt**: 🚨 HIGH. This is a pure mock. It must be completely deleted once WebSockets/Polling are implemented against a real metrics API.
