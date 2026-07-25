# PROJECT AUDIT
**Type**: Deep Engineering Audit
**Date**: July 25, 2026
**Based on**: `FILE_INVENTORY.md` & `FOLDER_INVENTORY.md`

## 1. Feature: Organizations
- **Business Purpose**: Top-level logical boundary grouping sites and users.
- **Technical Purpose**: `organization_id` acts as a secondary isolation key below `tenant_id`.
- **Frontend Files**:
  - `features/organizations/pages/OrganizationsPage.tsx`
  - `features/organizations/hooks/useOrganizations.ts`
  - `shared/api/axios.ts` (API Client)
- **Backend Files**:
  - `routers/organizations.py`
  - `services/organization_service.py`
  - `crud/organization.py`
  - `models/organization.py`
  - `schemas/organization.py`
- **Database Tables Touched**: `organizations`, `tenants`.
- **APIs**: `GET /api/v1/organizations`, `POST /api/v1/organizations`, `PATCH /api/v1/organizations/{id}`
- **Request Flow**: Browser → React Table → `useOrganizations()` (TanStack Query) → `axios.get()` → JWT Interceptor → FastAPI `GET /organizations` → `RequirePermission("organizations:read")` → `extract_tenant_id` → `OrganizationService.list_organizations()` → `crud.get_multi()` → SQLAlchemy → PostgreSQL → JSON Response → React Query Cache → UI Re-render.
- **Status**: Production Ready ✅
- **Missing Implementation**: None.
- **Known Risks**: Soft-deletes are implemented (`deleted_at`), but background cleanup jobs for hard-deleting orphaned data do not exist yet.

## 2. Feature: Devices
- **Business Purpose**: Network asset inventory and health tracking.
- **Technical Purpose**: Central table for all polling profiles, metric series, and event correlations.
- **Frontend Files**:
  - `features/devices/pages/DevicesPage.tsx`
  - `features/devices/components/wizard/DeviceProvisionWizard.tsx`
  - `features/devices/hooks/useDevices.ts`
- **Backend Files**:
  - `api/v1/endpoints/devices.py`
  - `services/device_service.py`
  - `models/device.py`
  - `schemas/device.py`
- **Database Tables Touched**: `devices`, `sites`, `device_groups`, `polling_profiles`.
- **APIs**: `POST /api/v1/devices/provision`, `GET /api/v1/devices`
- **Request Flow (Provisioning)**: Browser → Multi-step Wizard UI → Zod Validation → `useProvisionDevice()` Mutation → FastAPI `POST /provision` → `DeviceService.provision_device()` → Validates IP uniqueness via `crud` → SQLAlchemy Insert → PostgreSQL Commit → Returns UUID → UI Success Toast.
- **Status**: Backend CRUD Production Ready ✅ | UI Actions Mocked ⚠️
- **Missing Implementation**: UI buttons for "SSH", "Poll Now", and "Edit" are hardcoded as disabled.
- **Future Roadmap**: Link `DeviceService` to an async task queue (like Celery/Redis) to trigger real-time SNMP scans when "Poll Now" is clicked.

## 3. Feature: Dashboard
- **Business Purpose**: Executive overview of network health.
- **Technical Purpose**: Data visualization layer consuming aggregated time-series metrics.
- **Frontend Files**:
  - `features/dashboard/pages/DashboardPage.tsx`
  - `features/dashboard/components/DashboardCharts.tsx`
  - `features/dashboard/hooks/useDemoDataEngine.ts`
- **Backend Files**: None.
- **Database Tables Touched**: None.
- **APIs**: None.
- **Status**: MOCK / DEMO ⚠️
- **Missing Implementation**: The entire backend metrics aggregation pipeline is missing.
- **Technical Debt**: `useDemoDataEngine.ts` is generating random numbers every 2 seconds to simulate CPU/Memory changes.
- **Refactoring Roadmap**: 
  1. Build `collector` engine.
  2. Write metrics to TimescaleDB.
  3. Create `GET /api/v1/dashboard/metrics` FastAPI route.
  4. Replace `useDemoDataEngine.ts` with WebSocket or React Query polling.

## 4. Feature: Authentication & RBAC
- **Business Purpose**: Secure the platform and restrict access based on roles.
- **Technical Purpose**: JWT lifecycle management and strict dependency-injected endpoint protection.
- **Frontend Files**:
  - `features/auth/pages/LoginPage.tsx`
  - `shared/components/layout/ProtectedRoute.tsx`
  - `shared/api/axios.ts` (Interceptor)
- **Backend Files**:
  - `api/v1/endpoints/auth.py`
  - `auth/dependencies.py`
  - `auth/authorization_dependencies.py`
  - `models/rbac.py`
  - `models/user.py`
- **Database Tables Touched**: `users`, `roles`, `permissions`, `role_permissions`, `user_role_assignments`.
- **APIs**: `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`
- **Request Flow (Authorization)**: Axios attaches `Bearer <token>` → FastAPI receives request → `get_current_user` decodes JWT → Verifies signature against `SECRET_KEY` → `RequirePermission("devices:read")` queries `user_role_assignments` for the specific `tenant_id` → Validates scoped permission → Grants/Denies route execution.
- **Status**: Production Ready ✅
- **Known Risks**: Tokens are currently stored in `localStorage` in the frontend (susceptible to XSS). 
- **Future Roadmap**: Migrate JWT storage from `localStorage` to HttpOnly secure cookies for production deployment.

## 5. Feature: Collector Engine
- **Business Purpose**: Securely fetch network device metrics from isolated environments.
- **Technical Purpose**: Asynchronous out-bound polling engine.
- **Backend Files**:
  - `api/v1/endpoints/collectors.py`
  - `services/registration_service.py`
  - `services/collector_service.py`
  - `services/heartbeat_service.py`
  - `models/job.py`
- **Database Tables Touched**: `collectors`, `collector_registration_keys`, `collector_jobs`, `collector_events`.
- **Status**: Foundation (Phase 1/1.5) Production Ready ✅
- **Missing Implementation**: The ICMP and SNMP payload execution logic in the Python standalone daemon. Wait for Phase 2/3.
