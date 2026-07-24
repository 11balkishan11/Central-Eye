# ADR 004: RBAC Source of Truth

**Decision**: Keep TenantMembership.role_id as the primary tenant role. Use UserRoleAssignment with strict explicit nullable foreign keys (	enant_id, organization_id, site_id) for scoped overrides. Implement Redis caching and comprehensive audit logging for authorization events.