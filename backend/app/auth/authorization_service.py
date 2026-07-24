import uuid
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.models.rbac import UserRoleAssignment, Permission, RolePermission
from app.models.tenant import TenantMembership
from app.auth.permission_cache import PermissionCache
from app.auth.observability import AuditService, SecurityLogger

class AuthorizationService:
    def __init__(
        self,
        db: AsyncSession,
        permission_cache: PermissionCache,
        audit_service: AuditService,
        logger: SecurityLogger
    ):
        self.db = db
        self.permission_cache = permission_cache
        self.audit_service = audit_service
        self.logger = logger

    async def get_user_permissions_for_tenant(self, user_id: uuid.UUID, tenant_id: uuid.UUID) -> List[str]:
        # Try cache
        cached = await self.permission_cache.get_permissions(user_id, tenant_id)
        if cached is not None:
            return cached

        permissions = set()

        # 1. Get default tenant role from membership
        stmt = select(TenantMembership).where(
            TenantMembership.user_id == user_id,
            TenantMembership.tenant_id == tenant_id
        )
        result = await self.db.execute(stmt)
        membership = result.scalar_one_or_none()
        
        roles_to_check = []
        if membership and membership.role_id:
            roles_to_check.append(membership.role_id)

        # 2. Get UserRoleAssignments (System or Tenant scoped)
        # For simplicity, getting all roles for the user that are global OR for this tenant
        stmt_assignments = select(UserRoleAssignment).where(
            UserRoleAssignment.user_id == user_id,
            or_(
                UserRoleAssignment.tenant_id == tenant_id,
                (UserRoleAssignment.tenant_id.is_(None) & 
                 UserRoleAssignment.organization_id.is_(None) & 
                 UserRoleAssignment.site_id.is_(None) &
                 UserRoleAssignment.device_group_id.is_(None)) # Global role
            )
        )
        assignment_results = await self.db.execute(stmt_assignments)
        for assignment in assignment_results.scalars():
            roles_to_check.append(assignment.role_id)

        if not roles_to_check:
            await self.permission_cache.set_permissions(user_id, tenant_id, [])
            return []

        # 3. Resolve permissions for all collected roles
        stmt_perms = select(Permission.name).join(RolePermission).where(
            RolePermission.role_id.in_(roles_to_check)
        )
        perm_results = await self.db.execute(stmt_perms)
        for perm_name in perm_results.scalars():
            permissions.add(perm_name)

        perm_list = list(permissions)
        await self.permission_cache.set_permissions(user_id, tenant_id, perm_list)
        return perm_list

    async def has_permission(self, user_id: uuid.UUID, tenant_id: uuid.UUID, required_permission: str) -> bool:
        permissions = await self.get_user_permissions_for_tenant(user_id, tenant_id)
        
        has_perm = required_permission in permissions
        if not has_perm:
            await self.audit_service.emit_permission_denied(
                user_id=user_id,
                permission=required_permission,
                scope="tenant",
                scope_id=tenant_id
            )
            self.logger.log_suspicious_activity(f"Permission denied: {required_permission} for user {user_id}")
            
        return has_perm
