# NS3 Central Architecture Overview

NS3 Central is designed as a secure, highly scalable, and modular network monitoring platform. The architecture emphasizes multi-tenancy, high performance polling, and resilience.

## System Components

1. **Frontend Application (React/Vite)**
   - Provides a rich, dynamic "Single Page Application" experience.
   - Built with React, TypeScript, Tailwind CSS, and Shadcn UI.
   - Manages state via Zustand and TanStack Query.
   - Designed to mimic enterprise tools like Grafana and Datadog.

2. **Core API Server (FastAPI / Python)**
   - Serves as the central brain of the platform.
   - Manages Authentication (JWT), RBAC, and Multi-Tenancy.
   - Handles RESTful requests for all inventory, configuration, and alerting workflows.
   - Communicates securely with distributed collectors via WebSockets/Long Polling.

3. **Distributed Collectors (Python / Go)**
   - Installed inside customer networks behind firewalls.
   - Establish outbound-only connections to the Core API Server.
   - Perform local ICMP Pings, SNMP polling, and SSH configuration retrieval.
   - Push normalized telemetry back to the central platform.

4. **Data Persistence**
   - **PostgreSQL**: Stores relational data (Tenants, Users, Devices, Credentials, Alert Rules).
   - **TimescaleDB**: Optimizes time-series storage for high-velocity metrics.
   - **Redis**: Handles caching, session state, and Celery task queues.

5. **Asynchronous Worker (Celery)**
   - Manages background tasks (e.g., alert threshold evaluation, report generation).
   - Handles the Transactional Outbox pattern for robust domain events.

## Deployment Strategy
- Local development is containerized using Docker Compose.
- Production relies on managed services for databases (RDS/Cloud SQL) and caching (ElastiCache/MemoryDB).
- The application layers are stateless and designed for container orchestration (Kubernetes).
