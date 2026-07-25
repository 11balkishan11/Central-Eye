# Staff Engineering Review (Batch 5)

**Date**: July 25, 2026
**Reviewer**: Permanent Senior Staff Engineer

This is a critical, unvarnished evaluation of the NS3 Central repository's architecture, readiness, and technical debt.

---

## 1. Architecture Quality
**Grade**: A-
**Evaluation**: The choice to strictly enforce `tenant_id` at the database level (`app/models`) and the router level (`extract_tenant_id`) is excellent. This guarantees data isolation in a multi-tenant SaaS. The frontend's use of feature-based folders (`src/features/`) prevents the common React "spaghetti" pattern. 
**Flaw**: The database models define highly complex metric relations (`MetricSeries`, `Collector`), but the FastAPI monolithic structure may struggle to ingest thousands of metrics per second.

## 2. Scalability
**Grade**: C
**Evaluation**: For CRUD operations (Auth, Organizations, Devices), FastAPI + asyncpg is extremely scalable. However, for the *core domain* (Network Monitoring), the current architecture is unscalable. 
**Risk**: If 1,000 devices send metrics every 60 seconds, the current FastAPI REST API will bottleneck.
**Solution**: Metrics ingestion *must* bypass FastAPI REST routes. It requires a dedicated message broker (RabbitMQ/Kafka) feeding directly into a Time-Series Database (TimescaleDB), leaving FastAPI to only *read* the data for the frontend.

## 3. Security
**Grade**: B+
**Evaluation**: JWT Implementation is standard. RBAC implementation is exceptional (scoped to Tenants, Organizations, and Sites).
**Risk**: Storing JWTs in `localStorage` in the React app is vulnerable to Cross-Site Scripting (XSS).
**Solution**: Migrate to HttpOnly Secure Cookies for authentication.

## 4. Maintainability & Readability
**Grade**: A
**Evaluation**: The separation of concerns (Routers -> Services -> CRUD) is textbook. Any Mid-level Python developer can understand this flow within an hour. Frontend components are well abstracted using Shadcn UI.

## 5. Technical Debt
🚨 **CRITICAL DEBT**: The Dashboard (`DashboardPage.tsx`). It relies on `useDemoDataEngine.ts` to fake visual data. It creates a false sense of project completion.
⚠️ **MODERATE DEBT**: Device UI Actions. Buttons for "SSH", "Poll Now", and "Edit" are hardcoded as `disabled` in `DevicesPage.tsx`.
⚠️ **MODERATE DEBT**: Missing cleanup jobs. Soft-deletes leave orphaned data in PostgreSQL.

## 6. Hiring Readiness
**Status**: Ready.
**Impact**: Because the repository perfectly isolates domains (e.g. `features/devices`), you can easily hire a frontend engineer and assign them to build the "Discovery UI" without them needing to understand the "Auth" code. The backend is equally decoupled.

## 7. Refactoring Roadmap (Next 90 Days)
1. **Sprint 1 (Security)**: Move JWTs to HttpOnly cookies.
2. **Sprint 2 (Infrastructure)**: Deploy Redis (for caching/queues) and TimescaleDB extension in PostgreSQL.
3. **Sprint 3 (Backend Engine)**: Build a Celery (or Arq) worker process for executing background SNMP scans, completely separate from the FastAPI web workers.
4. **Sprint 4 (Frontend Data)**: Replace `useDemoDataEngine` with real API calls reading from TimescaleDB.
