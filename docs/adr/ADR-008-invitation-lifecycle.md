# ADR-008: Invitation Lifecycle

## Context
Adding users directly to an organization without their consent or a verification step poses security risks and circumvents standard onboarding flows.

## Decision
1. **Explicit Invitations**: Users must be explicitly invited via an `OrganizationInvitation` entity.
2. **Lifecycle Enums**: Invitations track a strict lifecycle (`PENDING`, `ACCEPTED`, `DECLINED`, `EXPIRED`, `CANCELLED`, `REVOKED`).
3. **Atomic Acceptance**: Converting a `PENDING` invitation into an active `TenantMembership` and `UserRoleAssignment` happens within a single SQL transaction using `SELECT ... FOR UPDATE` to prevent race conditions (e.g., clicking accept twice).
4. **Unique Pending Invite**: We enforce a partial unique index on `(organization_id, email) WHERE status = 'PENDING'` to prevent spamming the same email.

## Consequences
- Requires users to explicitly "Accept" membership.
- Highly consistent audit trails regarding who invited whom and when.
- Prevents database consistency issues through strict atomic transactions.
