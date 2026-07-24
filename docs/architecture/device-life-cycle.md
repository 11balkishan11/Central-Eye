# Device Life Cycle Roadmap

The device life cycle dictates the operational flow of the NS3 platform, representing the exact journey of a network asset from inception to decommissioning. This flow acts as the comprehensive product roadmap for all subsequent phases.

## 1. The Life Cycle Flow

```mermaid
flowchart TD
    A[Device Added (PROVISIONING)] --> B[Validated]
    B --> C[Credential Assigned]
    C --> D[Discovery (DISCOVERING)]
    D --> E[Collector Assigned]
    E --> F[Polling Started (ACTIVE)]
    F --> G[Metrics Stored]
    G --> H[Alert Triggered]
    H --> I[Dashboard Updated]
    I --> J[AI Analysis]
    J --> K[Archived (RETIRED)]
    K --> L[Deleted (DECOMMISSIONED)]
    
    style A fill:#e1f5fe,stroke:#01579b
    style F fill:#e8f5e9,stroke:#1b5e20
    style J fill:#f3e5f5,stroke:#4a148c
    style L fill:#ffebee,stroke:#b71c1c
```

## 2. Stage Breakdown

1. **Device Added**: A user or API creates the initial `Device` record. The status is `PROVISIONING`. Basic metadata (hostname, management IP) is recorded.
2. **Validated**: System checks IP uniqueness, reachability (ICMP ping), and reserves the asset internally.
3. **Credential Assigned**: A `CredentialProfile` (e.g., SNMPv3 AuthPriv) is linked to the device via `DeviceCredentialAssignment`.
4. **Discovery**: A background discovery job runs. The system interrogates the device (via SNMP `sysObjectID`) to determine vendor, model, OS, firmware, and supported capabilities. Status becomes `DISCOVERING`.
5. **Collector Assigned**: Based on the device's Site and load-balancing rules, the device is mapped to a specific `Collector`.
6. **Polling Started**: The Polling Engine schedules tasks based on the `PollingProfile`. Status becomes `ACTIVE`.
7. **Metrics Stored**: The Collector executes polling tasks, pushes normalized payloads to Redis, which are flushed to TimescaleDB.
8. **Alert Triggered**: The Alert Engine evaluates streaming metrics against `AlertRule` thresholds. If breached, an `Alert` is generated.
9. **Dashboard Updated**: WebSockets stream the metric anomalies and the new Alert directly to active frontend dashboards.
10. **AI Analysis**: The AI layer detects the anomaly or alert, triggers autonomous diagnostic polling, and summarizes the probable root cause.
11. **Archived**: The device is marked `RETIRED`. Polling stops, but historical metrics remain queryable.
12. **Deleted**: The device is `DECOMMISSIONED`. It is soft-deleted, removing it from active views while preserving audit logs.
