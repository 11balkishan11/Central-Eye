# ADR-012: Permission Naming Convention

## Context
As the number of manageable resources grows (Organizations, Sites, Devices, Rules, Dashboards), an inconsistent approach to permission naming will make programmatic evaluation and wildcard matching impossible.

## Decision
We enforce a strict `resource.action` naming convention for all RBAC permissions.
- **Resource**: Plural noun representing the aggregate root (e.g., `organizations`, `devices`, `polling_profiles`).
- **Action**: The specific operation (`read`, `write`, `delete`, `restore`, `purge`, `execute`).
- **Wildcards**: The system will support wildcard assignment `resource.*` meaning all actions on that resource.

### Standard Matrix
- `*.read`: View details and lists.
- `*.write`: Create and Update operations.
- `*.delete`: Soft deletion operations.
- `*.restore`: Reversing soft deletions.
- `*.purge`: Hard physical deletion (System Admin only).

## Consequences
- Predictable and uniform permission string matching.
- Drastically simplifies the frontend UI when deciding to render or hide action buttons.
