# ADR-009: Organization Hierarchy

## Context
Defining the exact physical and logical boundaries of the application dictates how resources are grouped and authorized.

## Decision
We enforce a strict descending hierarchy:
`Tenant` -> `Organization` -> `Site` -> `Device Group` -> `Device`

- **Tenant**: The top-level billing and isolation boundary (Customer).
- **Organization**: A logical boundary (e.g., subsidiary, business unit, or geographic region). Slugs are unique per Tenant.
- **Site**: A physical or logical location under an Organization (e.g., Datacenter, Campus). Codes are unique per Organization.
- **Device Group**: Logical groupings within a site (e.g., "Core Routers").
- **Device**: The individual network entity.

## Consequences
- RBAC maps perfectly onto this tree (e.g., a user can be a `Site Admin`).
- API routes can be structured naturally (`/organizations/{id}/sites`).
- It avoids chaotic many-to-many associations that complicate authorization resolution.
