# Implementation Validation (Batch 5)

This document validates the code currently residing in the NS3 Central repository, distinctly separating what is actually implemented from what is merely promised or mocked.

---

## 1. Production-Ready Modules
These modules are fully backed by functional code, database schemas, and API routes.
- **Authentication**: JWT login, refresh token issuance, and password hashing (`app/auth/`).
- **Authorization**: Scoped RBAC middleware (`RequirePermission`).
- **Tenancy Management**: API CRUD for Organizations and Sites, strictly isolated by `tenant_id`.
- **Device Management**: API CRUD for Devices (including soft-delete and lifecycle patching).
- **Database Migrations**: Alembic is properly configured and functional.

## 2. Demo-Only / Mocked Modules
These modules exist in the UI but lack the required backend implementation.
- **Dashboard Charts**: Fueled entirely by `useDemoDataEngine.ts`. No real metrics are flowing.
- **Device Actions**: SSH, Poll Now, and Edit buttons are hardcoded as `disabled` in `DevicesPage.tsx`.
- **Critical Infrastructure List**: Hardcoded array of devices in `DashboardPage.tsx`.

## 3. Dead Code & Unused Modules
Code that exists in the repository but is currently unused by the application.
- **Metrics Models**: `MetricDefinition` and `MetricSeries` exist in `models/device.py`, but there are no backend services or API routes capable of writing to them.
- **Collector Models**: `Collector`, `SNMPProfile`, `PollingProfile` exist in the database, but no logic exists to assign a device to a collector.

## 4. Outdated / Obsolete Documents
- `DEVELOPER_ONBOARDING.md`: Obsolete. Superseded by `GETTING_STARTED_ON_THIS_MACHINE.md`.

## 5. Technical TODOs (Discovered in Code)
- *No explicit `TODO:` comments were found in the critical paths*, but the absence of a `metrics_service.py` is the largest implicit TODO in the codebase.
- **Soft Delete Cleanup**: The `device.py` model uses `deleted_at`, but there is no cron job implemented to permanently purge records after 30 days.

## 6. Implementation Gaps
- **Missing Alerts**: The `AlertsPage.tsx` exists as a stub, but there is no `alert.py` model or alerting engine in the backend.
- **Missing Discovery**: The `DiscoveryPage.tsx` exists, but there is no `POST /api/v1/discovery/scan` endpoint to actually trigger an Nmap/SNMP sweep.
