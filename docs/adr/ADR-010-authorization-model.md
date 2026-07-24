# ADR-010: Authorization Model

## Context
Hardcoding roles (e.g., `if user.role == "Tenant Admin"`) becomes fragile as the application grows and custom roles are inevitably requested.

## Decision
1. **Permission-Driven Enforcement**: The authorization system strictly evaluates granular permissions (`resource:action`), not role names.
2. **Matrix Evaluation**: Example permissions include `organizations:create`, `sites:delete`, `devices:read`.
3. **Role Composition**: A "Role" is simply a collection of these granular permissions.
4. **Scope Resolution**: The `AuthorizationService` determines if the user possesses the required permission *at the appropriate scope* (System, Tenant, Organization, Site).

## Consequences
- Business logic is completely decoupled from role naming conventions.
- Custom roles can be easily constructed by assigning specific permission strings.
- Requires careful bootstrapping of the system to seed all necessary base permissions into the database.
