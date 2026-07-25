# Chapter 1: Introduction to Network Monitoring and NS3 Central

## What
NS3 Central is a Multi-Tenant Network Monitoring and Management System. It acts as the "central brain" that observes, reports, and manages network infrastructure across multiple locations and customers.

## Why
Modern networks are highly complex, spanning multiple locations, hardware vendors, and configurations. When a router goes down or an interface drops packets, IT teams need to know *immediately*, and they need to know *why*. Without a centralized system, network engineers are flying blind. NS3 Central provides proactive visibility, reducing downtime and resolving issues before end-users notice.

## Problem Solved
1. **Visibility**: "Is the network up?"
2. **Performance**: "Why is the network slow?"
3. **Configuration**: "Who changed the firewall rules yesterday?"
4. **Scale**: "How do we manage 5,000 devices across 50 different customers (tenants) without logging into each one manually?"

## Real-World Analogy
Think of a network like a city's road system, and data packets like cars. 
- A **Router** is a traffic intersection.
- A **Switch** is a local neighborhood street.
- A **Firewall** is a security checkpoint.

NS3 Central is the **City Traffic Control Center**. We have cameras (Collectors) installed everywhere. If a road is congested (High Bandwidth), a traffic light breaks (Device Down), or someone bypasses the checkpoint (Security Alert), the Control Center immediately gets an alarm, sees the exact location on a map (Topology), and dispatches a team to fix it.

## Simple Explanation
We build software that talks to network hardware (like routers and switches), asks them "how are you doing?" every few minutes, and draws pretty graphs and alerts humans if the hardware says "I'm broken."

## Technical Explanation
NS3 Central is a distributed telemetry system utilizing a Hub-and-Spoke model. The **Core Platform** (Hub) is a multi-tenant cloud application exposing REST APIs. The **Collectors** (Spokes) are lightweight agents deployed inside isolated customer networks (behind NAT/Firewalls). Collectors perform local polling via standard network protocols (ICMP, SNMPv2c/v3, SSH/CLI, NetFlow) and push normalized time-series data and state changes over outbound-only WebSockets or HTTPS to the Core.

## Implementation Details

### Architecture Stack
- **Frontend**: React, Vite, Zustand, React Query
- **Backend**: Python, FastAPI, SQLAlchemy
- **Data Layer**: PostgreSQL (relational), Redis (cache/queue)
- **Telemetry**: SNMP, ICMP

### Core Flows
1. **Device Discovery**: A user defines an IP range (e.g., `10.0.1.0/24`). The Collector performs an ICMP ping sweep, then attempts SNMP authentication on responsive IPs to gather basic identity (SysObjectID, SysDescr).
2. **Polling**: Every 5 minutes, the Collector queries the device for metrics (CPU, Memory, Interface In/Out Bytes) and pushes the result to the Core.
3. **Thresholding**: The Backend processes the metrics and compares them against rules (e.g., "Alert if CPU > 90% for 3 polls").

## Files Involved
- `backend/app/api/v1/endpoints/devices.py`: Handles API requests for device inventory.
- `frontend/src/features/devices/pages/DevicesPage.tsx`: Displays the grid/table of network assets.
- `docs/architecture_overview.md`: High-level system design.

## Common Mistakes
- **Assuming all devices are reachable directly from the backend**: They are not! Most devices are hidden behind strict corporate firewalls. This is why we *must* use outbound Collectors.
- **Polling too frequently**: SNMP is an old, slow protocol. Polling a switch every 10 seconds will crash the switch's CPU. Standard polling is 5 minutes.

## Debugging
- **"The device isn't showing up!"**: Check if the device responds to ping from the *Collector's* local network. Ensure the SNMP Community String (password) matches perfectly.
- **"Metrics are delayed"**: Check Redis queues. Are the Celery workers backed up processing thousands of events?

## Interview Questions
1. *Why do we use an outbound-only Collector instead of polling devices directly from the cloud?*
2. *Explain the difference between ICMP (Ping) and SNMP in the context of network monitoring.*
3. *How does Multi-Tenancy work in our database schema?*

## Exercises
1. Log into the local development environment and create a new Organization, Site, and add a mock Device.
2. Read the `backend/app/models/device.py` file and identify which database columns store the device's IP address and Management protocol credentials.

## Summary
NS3 Central is a scalable, distributed network monitoring platform. The backend manages state, multi-tenancy, and alerting, while the frontend provides a rich NOC (Network Operations Center) experience. 

---
*Next Chapter: 02_Authentication_and_RBAC.md*
