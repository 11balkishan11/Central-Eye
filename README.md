# Central Eye

![Central Eye Logo](./docs/assets/logo.png)

Central Eye is an enterprise-grade Network Monitoring Platform that empowers organizations to seamlessly discover, observe, and automate their distributed infrastructure. Moving beyond basic CRUD dashboards, Central Eye provides a dynamic, single-pane-of-glass experience reminiscent of industry-leading tools like Datadog and Grafana.

## Features

- **Multi-Tenant Architecture**: Manage multiple customer organizations, sites, and teams from a centralized instance securely.
- **Distributed Collectors**: Deploy lightweight agents into customer networks (behind firewalls) for outbound-only, secure polling.
- **Automated Discovery**: Run ICMP ping sweeps and SNMP sysDescr detection to automatically inventory switches, routers, firewalls, and servers.
- **Real-Time Observability**: Interactive dashboards monitoring CPU, Memory, Interface Bandwidth, and hardware health.
- **Dynamic Topology**: Automatically generated and visually rich React Flow network maps indicating real-time status and health.
- **Alerts & Incidents**: Robust threshold evaluation and incident tracking.

## Architecture

Our platform is divided into three major architectural pillars:
1. **Frontend**: React, TypeScript, Vite, Tailwind CSS, Shadcn UI, Zustand, TanStack Query, Apache ECharts.
2. **Backend Server**: FastAPI, PostgreSQL, TimescaleDB, Redis, Celery (Transactional Outbox).
3. **Collector Agent**: Secure Go/Python lightweight agent handling localized polling and discovery jobs.

See the [Architecture Overview](./docs/architecture_overview.md) for deeper technical details.

## Environment Setup

Central Eye uses Docker Compose to provide a one-click local development experience.

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Python 3.12+ (uv or poetry)

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/example/ns3-central.git
   cd ns3-central
   ```

2. **Start the Database and Cache Layer**
   ```bash
   cd infra
   docker-compose up -d
   ```

3. **Start the Backend Server**
   ```bash
   cd backend
   uv run uvicorn app.main:app --reload
   ```

4. **Start the Frontend Application**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Visit the Application**
   Open your browser to `http://localhost:5173`.

## Product Roadmap
Review our progress and future vision in the [Product Roadmap](./docs/product_roadmap.md).
