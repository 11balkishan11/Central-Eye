# System Glossary

This document defines every project-specific term used within the NS3 Central repository to establish a ubiquitous language for all engineering and product discussions.

---

## Core Domain Entities

### Tenant
- **Definition**: The highest-level logical boundary in the system representing a distinct customer or managed service provider (MSP). Data from one tenant can *never* bleed into another.
- **Codebase Appearance**: `tenant_id` exists on almost every database model.
- **Related DB Tables**: `tenants`
- **Related APIs**: Implicitly extracted via `extract_tenant_id` dependency.
- **Common Misconceptions**: Tenants are not Organizations. A Tenant can own *multiple* Organizations.

### Organization
- **Definition**: A business unit, subsidiary, or regional grouping belonging to a Tenant.
- **Codebase Appearance**: `OrganizationService`, `organizations.py`.
- **Related DB Tables**: `organizations`
- **Related APIs**: `GET /api/v1/organizations`
- **Related Frontend**: `/organizations` route.

### Site
- **Definition**: A physical or logical location (e.g., "New York Datacenter", "Branch Office 1") belonging to an Organization. Devices are provisioned *into* a site.
- **Related DB Tables**: `sites`
- **Related APIs**: `GET /api/v1/sites`, `GET /organizations/{id}/sites`

### Device
- **Definition**: A monitored network asset (router, switch, firewall, server).
- **Codebase Appearance**: The central entity of the platform. Defined in `models/device.py`.
- **Related DB Tables**: `devices`, `interfaces`, `device_groups`
- **Related APIs**: `/api/v1/devices`
- **Related Frontend**: `/devices`, `DeviceProvisionWizard.tsx`

---

## Telemetry & Architecture Concepts

### Collector
- **Definition**: A distributed, remote polling agent deployed on-premise (or in the cloud) that executes SNMP queries and ICMP pings against Devices, streaming the metrics back to the NS3 Central backend.
- **Codebase Appearance**: `Collector` model in `device.py`.
- **Related DB Tables**: `collectors`, `device_collector_assignments`
- **Status**: Database models exist, but the actual engine is **Not Implemented**.

### Discovery
- **Definition**: The automated process of scanning an IP subnet via a Collector to find new network devices, identify their vendors, and automatically provision them into a Site.
- **Related DB Tables**: None specifically (uses `devices` table).
- **Status**: **Not Implemented** (UI stub exists).

### Metric
- **Definition**: A time-series data point (e.g., CPU Utilization, Interface Throughput) gathered from a Device.
- **Related DB Tables**: `metric_definitions`, `metric_series`. (Actual time-series data intended for TimescaleDB).

### Demo Data Engine
- **Definition**: A frontend-only React hook (`useDemoDataEngine.ts`) that generates fake, randomized metric data every 2 seconds to populate the Dashboard charts.
- **Why it exists**: To demonstrate the UI capabilities while the backend Collector engine remains unbuilt.
- **Common Misconceptions**: It does *not* talk to the backend. It is pure UI simulation.

---

## Security & State Concepts

### RBAC (Role-Based Access Control)
- **Definition**: The system governing what a user can do. It is highly granular and supports hierarchical scoping (Tenant-level admin vs Site-level viewer).
- **Codebase Appearance**: `RequirePermission` dependency in FastAPI routers.
- **Related DB Tables**: `permissions`, `roles`, `role_permissions`, `user_role_assignments`.

### Lifecycle State
- **Definition**: The administrative journey of a Device (Provisioning → Discovering → Active → Retired → Decommissioned).
- **Related DB Tables**: `devices.lifecycle_state`

### Operational State (Oper State)
- **Definition**: The real-time, polled status of a Device or Interface (`up`, `down`, `unreachable`).
- **Related DB Tables**: `devices.oper_state`, `interfaces.oper_state`
