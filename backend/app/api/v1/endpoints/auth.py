from fastapi import APIRouter, Depends, Request, Response, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.db.session import get_db
from app.auth.auth_service import AuthService
from app.auth.password_service import PasswordService
from app.auth.session_service import SessionService
from app.auth.token_service import TokenService
from app.auth.observability import AuditService, SecurityLogger, AuthMetrics
from app.auth.repository import UserRepository, SessionRepository

from app.auth.schemas import (
    LoginRequest, 
    AuthResponse, 
    RefreshResponse,
    StandardResponse,
    MeResponse,
    UserResponse,
    SessionResponse,
    TenantResponse,
    MembershipResponse
)
from app.auth.cookies import set_refresh_cookie, clear_refresh_cookie, validate_origin, REFRESH_TOKEN_COOKIE_NAME
from app.auth.dependencies import (
    get_current_session,
    get_optional_current_session,
    get_current_user,
    get_current_membership,
    get_current_tenant
)
from app.models.user import UserSession, User
from app.models.tenant import TenantMembership, Tenant

router = APIRouter()

def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    # In a real app, you might inject these via a DI framework or construct them here.
    from app.auth.cache import SessionCache
    
    cache = SessionCache()
    audit_service = AuditService()
    token_service = TokenService()
    
    session_service = SessionService(
        session_repo=SessionRepository(db),
        cache=cache,
        audit=audit_service,
        token_service=token_service,
        db_session=db
    )
    
    return AuthService(
        user_repo=UserRepository(db),
        password_service=PasswordService(),
        session_service=session_service,
        token_service=token_service,
        audit_service=audit_service,
        security_logger=SecurityLogger(),
        auth_metrics=AuthMetrics(),
        db_session=db
    )

@router.post("/login", response_model=StandardResponse[AuthResponse], summary="Login User")
async def login(
    request: Request,
    response: Response,
    login_data: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Authenticate user, create session, and set HttpOnly refresh cookie.
    """
    client_ip = request.client.host if request.client else None
    
    result = await auth_service.login(
        email=login_data.email,
        password=login_data.password,
        device_info=login_data.device_info,
        ip_address=client_ip
    )
    
    # Set the cookie
    set_refresh_cookie(response, result.refresh_token)
    
    auth_resp = AuthResponse(
        access_token=result.access_token,
        user=UserResponse.model_validate(result.user),
        session=SessionResponse.model_validate(result.session)
    )
    
    return StandardResponse(data=auth_resp, message="Login successful")

@router.post("/refresh", response_model=StandardResponse[RefreshResponse], summary="Refresh Token")
async def refresh(
    request: Request,
    response: Response,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Rotate the refresh token using the HttpOnly cookie.
    """
    validate_origin(request)
    
    raw_refresh = request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)
    if not raw_refresh:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Refresh token missing"
        )
        
    result = await auth_service.refresh(raw_refresh)
    
    # Rotate the cookie
    set_refresh_cookie(response, result.refresh_token)
    
    refresh_resp = RefreshResponse(
        access_token=result.access_token
    )
    
    return StandardResponse(data=refresh_resp, message="Token refreshed")

@router.post("/logout", response_model=StandardResponse, summary="Logout User")
async def logout(
    request: Request,
    response: Response,
    session: Optional[UserSession] = Depends(get_optional_current_session),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Revoke the current session and clear cookies.
    """
    validate_origin(request)
    
    if session:
        try:
            await auth_service.logout(session.id)
        except Exception:
            pass
            
    clear_refresh_cookie(response)
    return StandardResponse(message="Logout successful")

@router.get("/me", response_model=StandardResponse[MeResponse], summary="Get Current User")
async def get_me(
    user: User = Depends(get_current_user),
    session: UserSession = Depends(get_current_session),
    tenant: Optional[Tenant] = Depends(get_current_tenant),
    membership: Optional[TenantMembership] = Depends(get_current_membership)
):
    """
    Get the authenticated user's profile, tenant, and membership.
    """
    me_resp = MeResponse(
        user=UserResponse.model_validate(user),
        session=SessionResponse.model_validate(session),
        tenant=TenantResponse.model_validate(tenant) if tenant else None,
        membership=MembershipResponse.model_validate(membership) if membership else None
    )
    return StandardResponse(data=me_resp, message="User retrieved")
