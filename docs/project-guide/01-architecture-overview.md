# Project Guide: Architecture Overview (Batch 8)

Welcome to the NS3 Central Project Guide. Unlike generic tutorials, this guide is explicitly bound to the actual implementation of the repository.

## 1. The Core Philosophy
NS3 Central is built to manage massive amounts of network infrastructure across multiple, completely isolated tenants. 

Because a single tenant (like an MSP) could manage hundreds of organizations, and each organization could have dozens of physical sites, the architecture is designed around one strict law: **Data Isolation via Tenant ID**.

## 2. Backend Architecture: FastAPI & Dependency Injection
We use **FastAPI**, but we don't just use it for routing. We use its powerful Dependency Injection system to enforce security.

### How a Request Works
When the frontend makes a request to `GET /api/v1/devices`:
1. **The Router**: `api/v1/endpoints/devices.py` receives the request.
2. **The Dependencies**: Before the function even executes, FastAPI resolves the dependencies:
   - `get_current_user`: Verifies the JWT token.
   - `extract_tenant_id`: Extracts the tenant context.
   - `RequirePermission("devices:read")`: Checks the `user_role_assignments` table to ensure the user has the right to read devices in this specific tenant.
3. **The Service**: `DeviceService.list_devices()` is called. It handles the business logic.
4. **The CRUD Layer**: `crud/device.py` is called to generate the SQLAlchemy query.
5. **The DB**: PostgreSQL returns the rows.
6. **The Response**: Pydantic serializes the rows into JSON.

## 3. Frontend Architecture: Feature Slices & React Query
The frontend avoids the "monolithic `src/components` folder" anti-pattern. Instead, it uses **Feature Slices**.

If you look in `frontend/src/features/`, you'll see domains like `auth`, `devices`, and `dashboard`. Each feature contains its own:
- `components/`
- `hooks/`
- `pages/`

### State Management
We do not use Redux. 
Instead, we use **React Query (TanStack Query)** for 90% of our state. React Query manages fetching, caching, and updating asynchronous data from our FastAPI backend. 

*Example*: Look at `useDevices.ts`. It simply wraps an Axios call to `/api/v1/devices` and caches the result. When a user provisions a new device, we just call `queryClient.invalidateQueries({ queryKey: ["devices"] })`, and the table automatically refetches.

## 4. The Data Engine (Current State)
Currently, the beautiful charts you see on the Dashboard are powered by `useDemoDataEngine.ts`. This is a frontend mock that generates random metrics every 2 seconds. 

The ultimate architectural goal (detailed in `ROADMAP.md`) is to build a background **Collector** engine (e.g., in Rust or Python/Celery) that performs real SNMP scans against the devices in our database, writes those metrics to **TimescaleDB**, and streams them to the frontend via WebSockets.
