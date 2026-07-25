# Product & Engineering Roadmap (Batch 12)

This roadmap outlines the exact trajectory of NS3 Central, grounded in the reality of the current implementation.

## 1. Already Built (Production Ready)
- **Multi-Tenant Foundation**: The core database schema, foreign keys, and cascading logic.
- **Authentication & RBAC**: JWT lifecycle, hierarchical roles (Tenant > Org > Site scopes), and endpoint protection dependencies.
- **Core CRUD**: APIs and UI tables for Organizations, Sites, and Devices.
- **Device Provisioning Workflow**: The multi-step wizard UI generating UUIDs and persisting assets.

## 2. Demo-Only / Mocked
- **Dashboard Overview**: `useDemoDataEngine` completely fakes the charts and stats.
- **Critical Infrastructure List**: Hardcoded array of 5 devices in `DashboardPage.tsx`.
- **Health Badges**: Health logic (Good/Warning/Critical) is randomized or mocked on the frontend.

## 3. Planned (Next 30-90 Days)
- **The Polling Engine (Collector)**: A background worker (e.g., Celery or a Go/Rust binary) that performs actual ICMP pings and SNMP queries against the IP addresses stored in the `devices` table.
- **TimescaleDB Integration**: Altering PostgreSQL to store high-frequency `metric_series` data.
- **Discovery Engine**: A backend job that sweeps a subnet (e.g., `10.0.1.0/24`) via SNMP, profiles the found devices, and automatically creates records in the `devices` table.
- **WebSocket Gateway**: Streaming live metrics to the frontend Dashboard to replace the Demo Engine.

## 4. Technical Debt to Resolve
- Migrate JWT storage from `localStorage` to `HttpOnly` cookies.
- Implement background tasks to hard-delete rows that have a `deleted_at` timestamp older than 30 days.

## 5. v1.0 Roadmap (Release Target)
- Complete the Collector Engine.
- Complete Subnet Discovery.
- Wire up the Frontend Dashboard to the real TimescaleDB metrics.
- Wire up the "Poll Now" and "SSH" buttons in the Devices UI.
- Implement real Alert generation based on threshold breaches (e.g., CPU > 90%).

## 6. Enterprise Roadmap (Future)
- **Distributed Collectors**: Support deploying lightweight Collector agents into customer networks that tunnel metrics back to the NS3 Central cloud.
- **SSO/SAML Integration**: Integrate with Azure AD and Okta for Enterprise tenant logins.
- **Advanced Topology**: Real-time LLDP/CDP network mapping rendered via D3.js.
