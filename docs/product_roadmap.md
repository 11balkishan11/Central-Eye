# NS3 Central Product Roadmap

This document outlines the strategic product vision for NS3 Central, defining the major milestones from MVP to a comprehensive enterprise network monitoring platform.

## v0.1 - Foundation & Inventory (Current)
The goal of v0.1 is to establish the core platform identity, multi-tenant capabilities, and the system of record for infrastructure.
- **Authentication**: JWT, refresh tokens, role-based access control.
- **Organizations & Sites**: Multi-tenant hierarchy mapping out global networks.
- **Devices & Inventory**: Complete system of record for all network hardware.
- **Provisioning**: Workflows to onboard new devices into the platform.

## v0.2 - Discovery & Telemetry
The goal of v0.2 is to connect the platform to the physical network via distributed collectors.
- **Collectors**: Secure, outbound-only agents installed inside customer networks.
- **Discovery**: Automated ping sweeps and SNMP sysDescr detection.
- **Polling Engine**: Job dispatch and result ingestion.
- **Credential Management**: Secure storage for SNMP strings and SSH keys.

## v0.3 - Observability & Alerts
The goal of v0.3 is to make the platform operational, providing real-time visibility and actionable intelligence.
- **Metrics**: Real-time polling of CPU, Memory, Interfaces, and Bandwidth.
- **Alerts Center**: Rules engine, threshold evaluations, and incident tracking.
- **Topology**: Dynamic network maps showing connectivity and health.
- **Health Summaries**: High-level dashboards for executive visibility.

## v0.4 - Automation & Intelligence
The goal of v0.4 is to move from reactive monitoring to proactive management.
- **Automation**: Config backup, automated remediation scripts.
- **AI Investigation**: Log analysis, root cause suggestions, and anomaly detection.
- **Recommendations**: Proactive hardware lifecycle and firmware upgrade suggestions.
- **Reports**: Automated scheduled reporting for SLA compliance and capacity planning.
