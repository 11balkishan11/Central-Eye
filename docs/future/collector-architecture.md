# Collector Architecture

**Status**: Future Specification
**Component**: Distributed Polling Engine

## 1. Business Problem
Network environments are often firewalled and NAT'd. A centralized cloud server (like the FastAPI backend) cannot directly ping or SNMP poll a router inside a customer's private corporate LAN. 

## 2. Why it exists
The Collector solves this by being a lightweight agent deployed *inside* the customer's network (or on-premise at a physical Site). It acts as a proxy: it executes the polls locally and pushes the results outbound to the central FastAPI backend via HTTPS.

## 3. Architecture
- **Language**: Go or Rust (for extreme concurrency and low memory footprint) or Python (Celery) for MVP.
- **State**: Stateless. It receives its `PollingProfile` instructions from the central backend.
- **Scaling Strategy**: Horizontally scalable. If a site has 10,000 devices, you deploy 3 collectors and assign them via `DeviceCollectorAssignment`.

## 4. Request Flow (Polling Cycle)
1. **Heartbeat**: Collector sends `POST /api/v1/collectors/{id}/heartbeat` every 60s.
2. **Fetch Jobs**: Backend responds with a list of `device_id`s, IP addresses, and `snmp_profile`s to poll.
3. **Execution**: Collector spawns a goroutine/async worker for each IP.
4. **Collection**: Collector performs ICMP Ping and SNMP GET (e.g., `1.3.6.1.4.1.9.9.109.1.1.1.1.5` for Cisco CPU).
5. **Ingestion**: Collector batches results and pushes via `POST /api/v1/metrics/ingest`.
6. **Storage**: Backend writes to TimescaleDB.

## 5. Failure Scenarios
- **Collector Dies**: Backend detects missed heartbeat. Marks Collector `offline`. Dashboard raises a Critical Alert. Devices assigned to that collector are marked `unreachable` (Oper State).
- **Network Partition**: Collector buffers metrics locally on disk until the internet connection to the central backend is restored, preventing data loss.

## 6. Security Considerations
- **No Inbound Ports**: The Collector only makes *outbound* HTTPS requests to the backend.
- **Credentials**: SNMP Community Strings/v3 passwords must be securely transmitted to the Collector (encrypted via a master Vault key, never plain text).
