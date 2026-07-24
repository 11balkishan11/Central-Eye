# SNMP Engine Architecture

## 1. Overview
The SNMP Engine is a specialized submodule executed on the `Collector` for interacting with network devices using SNMPv2c and SNMPv3.

## 2. Core Responsibilities
- **MIB Translation**: Abstracting OIDs (e.g., `.1.3.6.1.2.1.2.2.1.10`) into human-readable metrics (e.g., `ifInOctets`).
- **Bulk Operations**: Utilizing SNMP `GETBULK` to efficiently retrieve large tables (like interface statistics or routing tables) in a single request, minimizing CPU load on older switches.
- **Trap Reception (Future)**: Listening for asynchronous SNMP Traps on UDP 162.

## 3. Data Normalization
Different vendors (Cisco, Juniper, Arista) often use proprietary MIBs for basic data like CPU and Memory. 
The SNMP Engine implements a **Vendor Abstraction Layer**. 
- It detects the vendor via `sysObjectID`.
- It loads a vendor-specific profile.
- It normalizes the output so the core engine only ever sees a generic `cpu_usage_percent` or `memory_used_bytes` metric, regardless of the underlying hardware.
