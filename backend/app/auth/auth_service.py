import uuid
from typing import Optional
from datetime import timedelta
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.repository import UserRepository
from app.auth.password_service import PasswordService
from app.auth.session_service import SessionService
from app.auth.token_service import TokenService
from app.auth.observability import AuditService, SecurityLogger, AuthMetrics
from app.auth.hasher import RefreshTokenHasher
from app.core.clock import Clock
from app.core.config import settings

from app.auth.dto import AuthResult

class AuthenticationError(Exception):
    """Raised when authentication fails (invalid credentials)."""
    pass

class AccountLockedError(Exception):
    """Raised when the account is temporarily locked."""
    pass

class AuthService:
    """
    Business logic orchestrator for authentication.
    Handles login, lockout rules, and interacts with SessionService and PasswordService.
    """
    def __init__(
        self,
        user_repo: UserRepository,
        password_service: PasswordService,
        session_service: SessionService,
        token_service: TokenService,
        audit_service: AuditService,
        security_logger: SecurityLogger,
        auth_metrics: AuthMetrics,
        db_session: AsyncSession
    ):
        self.user_repo = user_repo
        self.password_service = password_service
        self.session_service = session_service
        self.token_service = token_service
        self.audit_service = audit_service
        self.security_logger = security_logger
        self.auth_metrics = auth_metrics
        self.db_session = db_session

    async def login(
        self,
        email: str,
        password: str,
        device_info: Optional[dict] = None,
        ip_address: Optional[str] = None
    ) -> AuthResult:
        """
        Authenticates a user and creates a session.
        Returns AuthResult.
        """
        user = await self.user_repo.get_by_email(email)
        if not user:
            self.security_logger.log_login_attempt(email, success=False, ip_address=ip_address)
            self.auth_metrics.record_login_failure()
            raise AuthenticationError("Invalid email or password")

        now = Clock.now()
        
        # Check if account is locked
        if user.locked_until and user.locked_until > now:
            self.security_logger.log_login_attempt(email, success=False, ip_address=ip_address)
            self.auth_metrics.record_login_failure()
            raise AccountLockedError(f"Account locked until {user.locked_until}")

        # Verify password
        is_valid = self.password_service.verify_password(password, user.password_hash)
        if not is_valid:
            failed_count = user.failed_login_count + 1
            await self.user_repo.increment_failed_login(user.id)
            
            if failed_count >= settings.LOGIN_MAX_ATTEMPTS:
                lock_until = now + timedelta(minutes=settings.LOGIN_LOCKOUT_MINUTES)
                await self.user_repo.lock_user(user.id, lock_until)
                self.security_logger.log_account_lockout(user.id)
                await self.audit_service.emit_account_locked(user.id)
                
            await self.db_session.commit()
            self.security_logger.log_login_attempt(email, success=False, ip_address=ip_address)
            self.auth_metrics.record_login_failure()
            await self.audit_service.emit_login_failed(user.id, "Invalid password")
            raise AuthenticationError("Invalid email or password")

        # Password is valid, reset failed logins if any
        if user.failed_login_count > 0 or user.locked_until is not None:
            await self.user_repo.reset_failed_login(user.id)
        
        await self.user_repo.update_last_login(user.id, now)

        # Generate refresh token
        family_id = uuid.uuid4()
        session_id_temp = uuid.uuid4()  # Pre-generate session ID to use in token claims
        raw_refresh, current_jti, expires_at = self.token_service.create_refresh_token(
            subject=str(user.id),
            session_id=str(session_id_temp),
            family_id=str(family_id)
        )
        refresh_hash = RefreshTokenHasher.hash(raw_refresh)

        # Create session
        session = await self.session_service.create_session(
            user_id=user.id,
            refresh_token_hash=refresh_hash,
            current_jti=current_jti,
            expires_at=expires_at,
            family_id=family_id,
            device_info=device_info,
            session_id=session_id_temp
        )
        


        # Generate access token
        access_token = self.token_service.create_access_token(
            subject=str(user.id),
            session_id=str(session.id),
            refresh_jti=current_jti
        )

        await self.db_session.commit()
        
        self.security_logger.log_login_attempt(email, success=True, ip_address=ip_address)
        self.auth_metrics.record_login_success()
        
        return AuthResult(
            user=user,
            session=session,
            access_token=access_token,
            refresh_token=raw_refresh
        )

    async def refresh(self, raw_refresh_token: str) -> AuthResult:
        """
        Rotates the refresh token and generates a new access token.
        """
        # SessionService handles validation, locking, reuse detection, and DB update
        new_refresh, session = await self.session_service.rotate_refresh_token(raw_refresh_token)
        
        # Generate new access token
        new_access = self.token_service.create_access_token(
            subject=str(session.user_id),
            session_id=str(session.id),
            refresh_jti=session.current_jti
        )
        
        # We need the user to populate AuthResult. 
        # But rotate_refresh_token doesn't return User.
        # We can fetch the user, but maybe the user is not explicitly needed for the response?
        # Let's fetch it from user_repo so we can return a full AuthResult.
        user = await self.user_repo.get_by_id(session.user_id)
        if not user:
            raise AuthenticationError("User not found for session")
        
        self.auth_metrics.record_token_refresh()
        
        return AuthResult(
            user=user,
            session=session,
            access_token=new_access,
            refresh_token=new_refresh
        )

    async def logout(self, session_id: uuid.UUID) -> None:
        """
        Logs out a user by revoking their session.
        """
        await self.session_service.revoke_session(session_id)
        self.auth_metrics.record_session_revoked()
