# Repository Manifest

**Repository:** NS3 Central
**Type:** Full-Stack Web Application (SPA + REST API)
**Domain:** Network Management & IT Operations
**Maturity:** Alpha / Development (Core Foundation Complete, Data Engine Missing)

## Architecture Overview
- **Backend Model:** Monolithic API (FastAPI) serving stateless REST endpoints.
- **Data Model:** PostgreSQL relational database with strong tenant isolation (`tenant_id`).
- **Frontend Model:** Single Page Application (Vite + React) organized by Feature slices.
- **State Model:** Server state synced via React Query; Client state managed via Zustand (as needed).
- **Security Model:** JWT Auth (Access + Refresh). Role-Based Access Control (RBAC) enforced via FastAPI Dependency Injection (`RequirePermission`).

## Core Technology Stack
- **Language:** Python 3.11+, TypeScript, TSX
- **Backend:** FastAPI, Uvicorn, SQLAlchemy (asyncpg), Alembic, Pydantic, Passlib, python-jose
- **Frontend:** React 18, Vite, React Router DOM, TanStack Query, Zustand, Axios
- **UI Framework:** Tailwind CSS, Shadcn UI, Radix UI, Lucide Icons, Recharts
- **Database:** PostgreSQL 15

## Major Domains
1. **Tenancy & RBAC**: `Tenants`, `Organizations`, `Sites`, `Users`, `Roles`, `Permissions`
2. **Device Management**: `Devices`, `Interfaces`, `DeviceGroups`, `Profiles`
3. **Telemetry (Pending)**: `Metrics`, `Collectors`, `SNMP`

## Implementation Status
- **Authentication**: ✅ Production
- **Tenant Isolation**: ✅ Production
- **Organizations/Sites CRUD**: ✅ Production
- **Device CRUD**: ✅ Production
- **Device UI**: 🟡 Partial (List works, Actions disabled)
- **Dashboard UI**: 🟡 Demo (Mock data engine)
- **Discovery Engine**: ❌ Missing
- **Collector Engine**: ❌ Missing
- **Alerts / Topology**: ❌ Missing
