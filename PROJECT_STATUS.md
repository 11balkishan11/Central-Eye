# NS3 Central - Project Status

## 1. Project Overview
NS3 Central is designed as a secure, highly scalable, and modular network monitoring platform. The architecture emphasizes multi-tenancy, high-performance polling, and resilience. 
It caters to Managed Service Providers (MSPs) and Enterprise IT teams.

## 2. Feature Status Matrix

| Feature | Purpose | Frontend | Backend | Database | API | Completed % | Production Ready? | Next Improvements |
|---|---|---|---|---|---|---|---|---|
| **Authentication** | User login, JWT, RBAC | Complete | Complete | Complete | Complete | 90% | Yes (MVP) | MFA integration, SSO login support |
| **Organizations** | Multi-tenant hierarchy | Complete | Complete | Complete | Complete | 80% | Yes (MVP) | Billing integrations, advanced tenant isolation |
| **Sites** | Network locations mapping | Complete | Complete | Complete | Complete | 80% | Yes (MVP) | Map view, geolocation integration |
| **Devices** | System of record for hardware | Complete | Complete | Complete | Complete | 80% | Yes (MVP) | Custom properties, bulk CSV import |
| **Provision Wizard** | Onboarding new devices | Mocked | Missing | Missing | Missing | 10% | No | Connect wizard to backend APIs |
| **Dashboard** | Operational overview | Partial | Partial | Partial | Partial | 30% | No | Connect widgets to TimescaleDB metrics |
| **Discovery** | Automated network scanning | Placeholder | Missing | Missing | Missing | 5% | No | Build discovery engine and Nmap wrapper |
| **Alerts** | Incident tracking & thresholds | Mocked | Missing | Missing | Missing | 10% | No | Build rules engine, connect to Celery |
| **Topology** | Dynamic network mapping | Placeholder | Missing | Missing | Missing | 5% | No | Build link layer discovery protocol (LLDP) parsers |
| **Collectors** | Distributed agents | Missing | Partial | Missing | Partial | 5% | No | Implement Go/Python agents and Websocket relays |
| **Polling (SNMP/Metrics)** | Telemetry gathering | Missing | Missing | Missing | Missing | 0% | No | Integrate PySNMP or Telegraf, TSDB schemas |

## 3. Technical Debt & Quality Assessment
- **Architecture Quality**: High. The split between FastAPI/PostgreSQL/TimescaleDB and a decoupled React frontend is modern and scalable.
- **Code Quality**: Good base. Frontend uses strict TypeScript, shadcn components, and Zustand. Backend uses Pydantic schemas, Alembic for migrations.
- **Scalability Concerns**: The collector architecture requires robust WebSocket/Long-polling management on the FastAPI side. TimescaleDB is a great choice for metrics scalability.
- **Security Concerns**: Authentication relies on JWT. Need to ensure collectors use secure, outbound-only connections with mutual TLS or strict token validation.
- **Missing Infrastructure**: The `docker-compose.yml` only includes PostgreSQL and Redis. TimescaleDB, Celery workers, and Frontend containerization are missing.

## 4. Current Sprint Priorities
**Sprint 1: Collector Foundation & Discovery Engine**
- **Priority**: High. The platform needs to connect to actual networks.
- **Tasks**: 
  - Build the collector agent (Python or Go) that can establish a secure connection to the Core API.
  - Implement basic ICMP ping sweeps and SNMP `sysDescr` polling from the collector.
  - Connect the Frontend Discovery page to the backend API.

**Sprint 2: Observability & Polling**
- **Priority**: High.
- **Tasks**:
  - Implement scheduled polling jobs (Celery).
  - Provision TimescaleDB schemas for metrics storage.
  - Update Dashboard and Device details to show live metrics instead of mocks.

**Sprint 3: Alerts Engine**
- **Priority**: Medium.
- **Tasks**:
  - Implement background threshold evaluation.
  - Connect Frontend Alerts page to backend APIs.
  - Setup email/webhook notifications.
