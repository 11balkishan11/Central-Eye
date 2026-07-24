from fastapi import Depends, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import uuid

from app.db.session import get_db
from app.auth.token_service import TokenService
from app.auth.repository import UserRepository, SessionRepository, TenantMembershipRepository, TenantRepository
from app.auth.authorization import AuthorizationService
from app.core.clock import Clock
from app.models.user import User, UserSession, SessionStatus, UserStatus
from app.models.tenant import Tenant, TenantMembership, TenantStatus, TenantMembershipStatus
from app.auth.auth_service import AuthenticationError
from app.core.config import settings

# Standard OAuth2 scheme for Swagger UI
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_token_service() -> TokenService:
    return TokenService()

def get_authorization_service() -> AuthorizationService:
    return AuthorizationService()

def get_access_token_payload(
    token: str = Depends(oauth2_scheme),
    token_service: TokenService = Depends(get_token_service)
) -> dict:
    """
    Extracts and validates the JWT payload.
    Rejects invalid signature, issuer, audience, and expiration automatically via jwt.decode.
    Raises HTTPException (handled globally) if token is invalid or not an access token.
    """
    try:
        payload = token_service.decode_token(token, audience=settings.JWT_ACCESS_AUDIENCE)
        if payload.get("type") != "access":
            raise AuthenticationError("Invalid token type")
    except Exception:
        raise AuthenticationError("Invalid or expired access token")
        
    return payload

async def get_current_session(
    payload: dict = Depends(get_access_token_payload),
    db: AsyncSession = Depends(get_db)
) -> UserSession:
    """
    Validates the session against the database.
    Checks: session status, session expiry, soft deletion, current_jti mismatch.
    """
    session_id_str = payload.get("sid")
    if not session_id_str:
        raise AuthenticationError("Invalid token payload: missing session ID")
        
    try:
        session_id = uuid.UUID(session_id_str)
    except ValueError:
        raise AuthenticationError("Invalid session ID format")

    session_repo = SessionRepository(db)
    session = await session_repo.get_by_session_id(session_id)
    
    if not session:
        raise AuthenticationError("Session not found")
        
    if session.status != SessionStatus.ACTIVE:
        raise AuthenticationError(f"Session is {session.status.value}")
        
    if session.expires_at:
        exp = session.expires_at
        if exp.tzinfo is None:
            import datetime
            exp = exp.replace(tzinfo=datetime.timezone.utc)
        if exp < Clock.now():
            raise AuthenticationError("Session has expired")
        
    # Validate JTI matches the current refresh token JTI
    token_refresh_jti = payload.get("refresh_jti")
    if token_refresh_jti and session.current_jti and token_refresh_jti != session.current_jti:
        raise AuthenticationError("Access token is stale due to session rotation")
        
    return session

async def get_optional_current_session(
    request: Request,
    token_service: TokenService = Depends(get_token_service),
    db: AsyncSession = Depends(get_db)
) -> Optional[UserSession]:
    """
    Like get_current_session, but does not raise AuthenticationError.
    Used for idempotent endpoints like logout.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1]
    
    try:
        payload = token_service.decode_token(token, audience=settings.JWT_ACCESS_AUDIENCE)
        if payload.get("type") != "access":
            return None
            
        session_id_str = payload.get("sid")
        if not session_id_str:
            return None
            
        session_id = uuid.UUID(session_id_str)
        session_repo = SessionRepository(db)
        session = await session_repo.get_by_session_id(session_id)
        return session
    except Exception:
        return None

async def get_current_user(
    session: UserSession = Depends(get_current_session),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Retrieves the user associated with the session.
    Verifies the user is active and not soft-deleted.
    """
    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(session.user_id)
    
    if not user:
        raise AuthenticationError("User not found")
        
    if user.deleted_at is not None:
        raise AuthenticationError("User account deleted")
        
    if user.status != UserStatus.active:
        raise AuthenticationError(f"User account is {user.status.value}")
        
    return user

async def get_current_membership(
    session: UserSession = Depends(get_current_session),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Optional[TenantMembership]:
    """
    Retrieves the membership (if any) based on the session or user defaults.
    Verifies membership is active.
    """
    if not session.membership_id:
        return None
        
    membership_repo = TenantMembershipRepository(db)
    membership = await membership_repo.get_by_id(session.membership_id)
    
    if not membership:
        raise AuthenticationError("Membership not found")
        
    if membership.status != TenantMembershipStatus.active:
        raise AuthenticationError(f"Membership is {membership.status.value}")
        
    if membership.expires_at:
        exp = membership.expires_at
        if exp.tzinfo is None:
            import datetime
            exp = exp.replace(tzinfo=datetime.timezone.utc)
        if exp < Clock.now():
            raise AuthenticationError("Membership has expired")
        
    return membership

async def get_current_tenant(
    session: UserSession = Depends(get_current_session),
    membership: Optional[TenantMembership] = Depends(get_current_membership),
    db: AsyncSession = Depends(get_db)
) -> Optional[Tenant]:
    """
    Retrieves the tenant associated with the membership/session.
    Verifies tenant is active.
    """
    tenant_id = session.tenant_id
    if not tenant_id and membership:
        tenant_id = membership.tenant_id
        
    if not tenant_id:
        return None
        
    tenant_repo = TenantRepository(db)
    tenant = await tenant_repo.get_by_id(tenant_id)
    
    if not tenant:
        raise AuthenticationError("Tenant not found")
        
    if tenant.deleted_at is not None:
        raise AuthenticationError("Tenant deleted")
        
    if tenant.status != TenantStatus.active:
        raise AuthenticationError(f"Tenant is {tenant.status.value}")
        
    return tenant

# Role / Permission Factories (for future RBAC)
def require_role(role_name: str):
    async def role_checker(
        user: User = Depends(get_current_user),
        tenant: Optional[Tenant] = Depends(get_current_tenant),
        authz: AuthorizationService = Depends(get_authorization_service)
    ):
        if not tenant:
            raise AuthenticationError("Tenant context required for role check")
        has_role = await authz.has_role(user.id, tenant.id, role_name)
        if not has_role:
            raise AuthenticationError(f"Missing required role: {role_name}")
        return True
    return role_checker

def require_permission(permission: str):
    async def permission_checker(
        user: User = Depends(get_current_user),
        tenant: Optional[Tenant] = Depends(get_current_tenant),
        authz: AuthorizationService = Depends(get_authorization_service)
    ):
        if not tenant:
            raise AuthenticationError("Tenant context required for permission check")
        has_perm = await authz.has_permission(user.id, tenant.id, permission)
        if not has_perm:
            raise AuthenticationError(f"Missing required permission: {permission}")
        return True
    return permission_checker
