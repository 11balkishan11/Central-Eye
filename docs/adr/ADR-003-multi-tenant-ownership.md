# ADR 003: Multi-Tenant Ownership

**Decision**: All resources cascade from a root Tenant. Users are linked to Tenants via TenantMembership, which carries their default role.