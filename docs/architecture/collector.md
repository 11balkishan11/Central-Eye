# Collector Architecture

## 1. Overview
A `Collector` is a lightweight, stateless data-gathering agent deployed within a Tenant's environment (e.g., inside a secure VPC or on-premise datacenter). It connects outward to the NS3 Central control plane via secure WebSockets or gRPC, eliminating the need for inbound firewall rules.

## 2. Collector Flow
1. **Registration**: Collector boots with a secure pairing token, authenticates with NS3 Central, and establishes a persistent bi-directional connection.
2. **Task Ingestion**: The central Polling Engine dispatches polling tasks (e.g., "Poll Switch A for Interface Metrics") down to the Collector.
3. **Execution**: The Collector translates tasks into native protocols (SNMP, API, ICMP) and executes them locally against the devices.
4. **Result Transmission**: The Collector batches results and streams them back to the control plane for processing and storage.

## 3. High Availability
- Collectors can be deployed in Active/Active pairs for a given Site.
- If a Collector disconnects, the control plane immediately reroutes pending tasks to a healthy Collector within the same Site group.
- The control plane will raise an alert if all Collectors for a Site go offline.

## 4. Security Stance
- **No Inbound Ports**: Collectors only make outbound connections (TCP 443).
- **No Persistent Credentials**: Collectors fetch credentials dynamically from the NS3 Credential Vault just-in-time, or rely on hashed SNMP community strings stored securely in memory.
- **Mutual TLS (mTLS)**: All communication between the Collector and Central is encrypted and mutually authenticated.
