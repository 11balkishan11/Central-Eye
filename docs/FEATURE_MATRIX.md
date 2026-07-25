# Feature Implementation Matrix

This matrix tracks the implementation status of core platform features.

| Feature | Sub-Feature | Status | Notes |
|---------|-------------|--------|-------|
| **Collector Foundation** | Registration & Auth | ✅ Complete | Uses Argon2 hashed keys & JWTs. |
| | Heartbeats & Sync | ✅ Complete | Dynamic capacity & capabilities syncing. |
| | Offline Detection | ✅ Complete | Derived dynamically via `last_heartbeat`. |
| | Job Leasing Framework | ✅ Complete | Central owns jobs; uses Lease Tokens. |
| | Idempotency | ✅ Complete | `Idempotency-Key` headers implemented. |
| | Audit Events | ✅ Complete | `collector_events` tracking state transitions. |
| **Job Execution Engine** | ICMP Ping Worker | ⏳ Pending | Phase 3 |
| | SNMP Polling Worker | ⏳ Pending | Phase 4 |
| | Discovery Worker | ⏳ Pending | Phase 6 |
| **Data Pipeline** | Metrics Ingestion | ❌ Not Started | Phase 5 |
| | TimescaleDB Storage | ❌ Not Started | Phase 5 |
| **Operations** | Alert Engine | ❌ Not Started | Phase 7 |
| | Real-time Dashboard | ⏳ Pending | UI skeleton exists, awaiting real data. |
| | Topology Mapping | ❌ Not Started | Post-discovery phase. |
