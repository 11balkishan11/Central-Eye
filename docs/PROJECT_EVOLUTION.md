# Project Evolution (Batch 6)

This document tracks how the architecture and design of NS3 Central have evolved from inception to the present day.

## Phase 1: The Blueprint
- **Original Plan**: Build a massive, distributed Network Management System (NMS) capable of handling millions of metrics.
- **Initial Focus**: We prioritized the database schema and multi-tenancy. We knew that if `tenant_id` wasn't baked into every query from Day 1, retrofitting it later would be a security nightmare.
- **Outcome**: The core `models` directory is highly mature, featuring advanced concepts like `MetricSeries`, `PollingProfiles`, and `DeviceLifecycleState`.

## Phase 2: Security & Isolation
- **Original Plan**: Simple Admin/User roles.
- **Evolution**: As the multi-tenant requirements grew, we realized users needed access to *specific sites* within an organization, not just global access.
- **The Shift**: We implemented a highly granular RBAC system (`app/models/rbac.py`). Instead of a simple `role` string on the user, we created `user_role_assignments` that allow scoping a role explicitly to a `tenant_id`, `organization_id`, or `site_id`.
- **Why it changed**: To support enterprise customers who have hundreds of sites and want to restrict local technicians to only view their local branch routers.

## Phase 3: The Frontend Dilemma
- **Original Plan**: Build the backend Collector engine to scan SNMP devices before building the frontend.
- **Evolution**: Building a reliable SNMP engine takes months. We needed a UI to demonstrate the vision to stakeholders immediately.
- **The Shift**: We decoupled the frontend from the core polling backend. We built a beautiful React/Vite dashboard, but instead of leaving it empty, we implemented `useDemoDataEngine.ts`.
- **Why it changed**: Go-to-market speed. We faked the data visualization layer to prove the UI/UX concepts while deferring the heavy backend engineering.

## Phase 4: Current State
- **What Remains**: The entire heavy-lifting backend (Discovery, SNMP polling, TimescaleDB integration, RabbitMQ queues).
- **What was deferred**: Complex topology mapping using LLDP/CDP. We built a stub `TopologyPage.tsx`, but deferred the actual D3.js graphing until Phase 5.
