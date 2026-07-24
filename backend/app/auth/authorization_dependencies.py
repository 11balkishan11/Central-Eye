from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.db.session import get_db
from app.auth.authorization_service import AuthorizationService
from app.auth.permission_cache import InMemoryPermissionCache
from app.auth.observability import AuditService, SecurityLogger
from app.auth.dependencies import get_current_user
from app.models.user import User

# Stubs for singleton instances
permission_cache = InMemoryPermissionCache()
audit_service = AuditService()
security_logger = SecurityLogger()

def get_authorization_service(db: AsyncSession = Depends(get_db)) -> AuthorizationService:
    return AuthorizationService(db, permission_cache, audit_service, security_logger)

def extract_tenant_id(request: Request) -> uuid.UUID:
    """
    Extracts the tenant ID from the request headers or path.
    For this implementation, we look for 'X-Tenant-ID' header.
    """
    tenant_header = request.headers.get("X-Tenant-ID")
    if not tenant_header:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="X-Tenant-ID header is required for this operation")
    try:
        return uuid.UUID(tenant_header)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid X-Tenant-ID format")

class RequirePermission:
    def __init__(self, required_permission: str):
        self.required_permission = required_permission

    async def __call__(
        self,
        request: Request,
        current_user: User = Depends(get_current_user),
        authz_service: AuthorizationService = Depends(get_authorization_service)
    ):
        if current_user.is_superuser:
            return True

        # We need tenant context to resolve permissions
        tenant_id = extract_tenant_id(request)

        has_perm = await authz_service.has_permission(
            user_id=current_user.id,
            tenant_id=tenant_id,
            required_permission=self.required_permission
        )

        if not has_perm:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied. Requires '{self.required_permission}'."
            )
        
        return True
