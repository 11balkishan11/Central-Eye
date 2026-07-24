# Device Domain Design

## 1. Domain Overview
The `Device` domain represents physical or logical network nodes managed by NS3 Central. Devices are the core entities that are polled, monitored, and analyzed.

## 2. Entity Hierarchy
- **Site**: The physical or logical location.
- **DeviceGroup**: A logical collection of devices within a site (e.g., "Core Routers", "Access Switches").
- **Device**: The individual network entity.

## 3. Device Data Model
```mermaid
erDiagram
    SITES ||--o{ DEVICE_GROUPS : contains
    SITES ||--o{ DEVICES : contains
    DEVICE_GROUPS ||--o{ DEVICES : groups
    CREDENTIALS ||--o{ DEVICES : authenticates
    POLLING_PROFILES ||--o{ DEVICES : schedules

    DEVICE_GROUPS {
        uuid id PK
        uuid site_id FK
        varchar name
        varchar description
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    DEVICES {
        uuid id PK
        uuid site_id FK
        uuid group_id FK "nullable"
        varchar hostname
        inet ip
        varchar vendor
        varchar model
        varchar serial
        varchar snmp_version "v2c, v3"
        uuid credential_id FK "nullable"
        uuid polling_profile_id FK "nullable"
        varchar status "UP, DOWN, MAINTENANCE, UNKNOWN"
        float health "0.0 - 100.0"
        timestamp last_seen
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
```

## 4. Lifecycle States
- **UP**: Actively responding to polls.
- **DOWN**: Failed consecutive polls.
- **MAINTENANCE**: Administratively silenced (no alerts generated).
- **UNKNOWN**: Newly provisioned, not yet polled.

## 5. Security & Isolation
- IP addresses can overlap across Tenants, but are strictly isolated within the context of a Site/Tenant.
- Credentials (`credential_id`) are stored in an encrypted vault, never in plain text in the device record.
