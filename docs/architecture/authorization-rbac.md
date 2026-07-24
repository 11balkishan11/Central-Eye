# Authorization and RBAC

Roles are assigned via TenantMembership.role_id (default) and UserRoleAssignment (scoped overrides). Permissions are resolved via AuthorizationService and cached in Redis.