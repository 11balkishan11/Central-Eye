# ADR-007: Soft Delete Strategy

## Context
Data retention is critical in an NMS (Network Management System). Accidental physical deletions of structural resources like Organizations or Sites can result in the catastrophic loss of downstream data (devices, metrics, alerts, audit logs). Exposing hard deletion directly via standard HTTP DELETE methods is risky.

## Decision
1. **100% Soft Deletes for CRUD**: Standard `DELETE /resource/{id}` endpoints will never issue physical SQL `DELETE` commands.
2. **Database Schema**: All auditable entities will maintain `deleted_at`, `deleted_by`, and `delete_reason`.
3. **Implicit Cascading**: Soft-deleting a parent (Organization) does not recursively soft-delete its children (Sites). Instead, queries for Sites will inherently validate `organization.deleted_at IS NULL`.
4. **Purge Endpoints**: Physical deletion is abstracted to a dedicated `/purge` endpoint restricted exclusively to System Admins. This utilizes Postgres' native `ON DELETE CASCADE`.

## Consequences
- Protects historical and operational data from accidental erasure.
- Requires careful handling of unique constraints (e.g. creating a new active Site with the same name as a soft-deleted Site is permitted).
- Restoring a parent entity inherently and immediately restores visibility to all its children.
