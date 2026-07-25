# File Inventory

This document provides a deep structural inventory of the critical files that govern the NS3 Central application.

---

## 1. Backend Core

### `backend/app/main.py`
- **Purpose**: The FastAPI application entrypoint.
- **Why it exists**: To initialize the ASGI server, configure CORS, attach middleware, and register all API routers.
- **Imports**: `FastAPI`, `CORSMiddleware`, `RequestIdMiddleware`, routers.
- **Used by**: `uvicorn` (server runtime).
- **Status**: Production
- **Difficulty**: ⭐⭐
- **Importance**: CRITICAL
- **Safe to modify?**: Yes, but carefully (affects global routing).

### `backend/app/api/v1/api.py`
- **Purpose**: Aggregates all version 1 endpoints.
- **Why it exists**: To keep `main.py` clean by importing all sub-routers (auth, devices, organizations) here.
- **Imports**: Endpoint routers (`auth`, `devices`, etc.)
- **Used by**: `main.py`
- **Status**: Production

---

## 2. Backend Domain: Devices

### `backend/app/models/device.py`
- **Purpose**: Defines the SQLAlchemy ORM models for Devices, Interfaces, Groups, and Profiles.
- **Why it exists**: Absolute source of truth for the Database schema regarding network infrastructure.
- **Imports**: SQLAlchemy primitives, `Tenant`, `Site`.
- **Used by**: Alembic (migrations), `crud/device.py`, `services/device_service.py`.
- **DB Tables Touched**: `devices`, `interfaces`, `device_groups`, `polling_profiles`, `credential_profiles`.
- **Status**: Production
- **Difficulty**: ⭐⭐⭐⭐
- **Importance**: CRITICAL

### `backend/app/services/device_service.py`
- **Purpose**: Business logic layer for Device operations.
- **Why it exists**: To enforce rules (like preventing duplicate IPs in a site) before writing to the DB.
- **Imports**: `Device` (model), `DeviceCreate` (schema), CRUD operations.
- **Used by**: `api/v1/endpoints/devices.py`
- **Status**: Production
- **Difficulty**: ⭐⭐⭐

### `backend/app/api/v1/endpoints/devices.py`
- **Purpose**: Exposes Device REST API endpoints.
- **Why it exists**: To allow the frontend to Provision, List, Edit, and Delete devices.
- **Imports**: `DeviceService`, `RequirePermission`, `extract_tenant_id`.
- **APIs**: `POST /provision`, `GET /`, `GET /{id}`, `DELETE /{id}`, `PATCH /{id}/lifecycle`.
- **Status**: Production
- **Difficulty**: ⭐⭐⭐

---

## 3. Backend Domain: Auth & Tenancy

### `backend/app/models/rbac.py`
- **Purpose**: Defines Roles, Permissions, and User Assignments.
- **Why it exists**: To enforce authorization scoping down to the Site level.
- **Used by**: `auth/authorization_dependencies.py`.
- **DB Tables Touched**: `roles`, `permissions`, `role_permissions`, `user_role_assignments`.
- **Status**: Production

### `backend/app/auth/dependencies.py`
- **Purpose**: Validates JWT tokens and injects the current user.
- **Why it exists**: Middleware equivalent for FastAPI routes.
- **Imports**: `jwt`, `User` (model).
- **Used by**: Every protected endpoint.
- **Status**: Production

---

## 4. Frontend Core

### `frontend/src/App.tsx`
- **Purpose**: Global routing and provider wrapper.
- **Why it exists**: To configure React Router, React Query, and Theme Providers.
- **Imports**: `BrowserRouter`, `QueryClientProvider`, all Page components.
- **Used by**: `main.tsx`.
- **Status**: Production

### `frontend/src/shared/api/axios.ts`
- **Purpose**: Configured Axios instance with request/response interceptors.
- **Why it exists**: To automatically attach JWT Bearer tokens to every request and handle 401 token refreshes.
- **Used by**: Every API hook in the frontend.
- **Status**: Production

---

## 5. Frontend Features

### `frontend/src/features/dashboard/pages/DashboardPage.tsx`
- **Purpose**: Executive UI overview of the system.
- **Why it exists**: Homepage after login.
- **Imports**: `useDemoDataEngine`, Recharts components.
- **Uses APIs**: `GET /organizations`, `GET /sites`.
- **Status**: DEMO (Visuals rely on mock metrics generator).
- **Technical Debt**: Needs to be refactored to use real WebSockets/polling when backend collector is built.
- **Difficulty**: ⭐⭐⭐

### `frontend/src/features/dashboard/hooks/useDemoDataEngine.ts`
- **Purpose**: Simulates thousands of fake metrics for the dashboard.
- **Why it exists**: Because the backend collector engine is not built yet.
- **Used by**: `DashboardPage.tsx`.
- **Status**: MOCK / TECHNICAL DEBT.
- **Safe to modify?**: Yes, this file should be deleted once real metrics exist.

### `frontend/src/features/devices/pages/DevicesPage.tsx`
- **Purpose**: UI Table for viewing network devices.
- **Imports**: `useDevices`, `PaginationControls`, `Search`.
- **Status**: Production (List) / Demo (Actions like SSH/Poll are disabled UI).
- **Difficulty**: ⭐⭐⭐
