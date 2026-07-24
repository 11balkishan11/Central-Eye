# ADR-014: Database Index Strategy

## Context
As the number of devices and metrics scales, unoptimized database queries will severely degrade platform performance, particularly for list views, authorization checks, and cross-tenant isolation enforcement.

## Decision
We mandate a proactive indexing strategy utilizing PostgreSQL-specific index features:
1. **Multi-Tenant Scoping**: All unique constraints across standard entities MUST include `tenant_id` (or `organization_id`) to ensure logical isolation.
2. **Status & Soft Deletion**: We utilize composite indexes heavily on `(tenant_id, status, deleted_at)` because the vast majority of our `SELECT` queries filter `WHERE deleted_at IS NULL AND status = 'ACTIVE'`.
3. **Partial Indexes**: For entities like Invitations, we use partial indexes (e.g., `CREATE UNIQUE INDEX ... WHERE status = 'PENDING'`) to enforce uniqueness conditionally without penalizing historical, inactive records.
4. **Search (Future)**: Text search across `name`, `hostname`, or `description` fields will transition from standard B-Tree `ILIKE` queries to `pg_trgm` (Trigram) GIN indexes to support fast partial-string matching.

## Consequences
- Slightly increased storage overhead and write latency (negligible for our use case).
- Drastically reduced read latency for critical path API endpoints.
