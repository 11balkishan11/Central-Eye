import uuid
import jwt
from datetime import datetime
from typing import Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.repository import SessionRepository
from app.auth.cache import SessionCache
from app.auth.observability import AuditService
from app.auth.hasher import RefreshTokenHasher
from app.auth.exceptions import (
    InvalidRefreshTokenError,
    SessionExpiredError,
    SessionRevokedError,
    SessionCompromisedError,
    SessionNotFoundError,
    RefreshReuseDetectedError
)
from app.auth.token_service import TokenService
from app.models.user import UserSession, SessionStatus
from app.core.clock import Clock
from app.core.config import settings

class SessionService:
    """
    Service for managing user sessions and refresh tokens.
    
    Session Status State Machine:
    ACTIVE
       │
       ├──────────────► REVOKED (User logout or manual revocation)
       │
       ├──────────────► EXPIRED (Token TTL expired)
       │
       └──────────────► COMPROMISED (Token reuse detected)
       
    Once a session is COMPROMISED, it must never transition back to ACTIVE.
    """
    def __init__(
        self,
        session_repo: SessionRepository,
        cache: SessionCache,
        audit: AuditService,
        token_service: TokenService,
        db_session: AsyncSession
    ):
        self.session_repo = session_repo
        self.cache = cache
        self.audit = audit
        self.token_service = token_service
        self.db_session = db_session

    async def create_session(
        self,
        user_id: uuid.UUID,
        refresh_token_hash: str,
        current_jti: str,
        expires_at: datetime,
        family_id: Optional[uuid.UUID] = None,
        tenant_id: Optional[uuid.UUID] = None,
        membership_id: Optional[uuid.UUID] = None,
        device_info: Optional[dict] = None,
        session_id: Optional[uuid.UUID] = None
    ) -> UserSession:
        if not family_id:
            family_id = uuid.uuid4()
            
        session = UserSession(
            id=session_id or uuid.uuid4(),
            user_id=user_id,
            tenant_id=tenant_id,
            membership_id=membership_id,
            refresh_token_hash=refresh_token_hash,
            current_jti=current_jti,
            family_id=family_id,
            expires_at=expires_at,
            status=SessionStatus.ACTIVE
        )
        if device_info:
            session.device_id = device_info.get("device_id")
            session.device_name = device_info.get("device_name")
            session.platform = device_info.get("platform")
            session.browser = device_info.get("browser")
            session.os = device_info.get("os")
            session.user_agent = device_info.get("user_agent")
            session.ip_address = device_info.get("ip_address")

        created_session = await self.session_repo.create_session(session)
        await self.db_session.commit()
        await self.audit.emit_session_created(created_session.id, user_id)
        return created_session

    async def validate_refresh_token(self, token: str) -> dict:
        try:
            return self.token_service.decode_token(token, settings.JWT_REFRESH_AUDIENCE)
        except jwt.PyJWTError as e:
            raise InvalidRefreshTokenError(f"Invalid refresh token: {str(e)}")

    async def rotate_refresh_token(
        self,
        old_token: str
    ) -> Tuple[str, UserSession]:
        # 1. Decode JWT (no db lock yet)
        decoded = await self.validate_refresh_token(old_token)
        
        session_id = uuid.UUID(decoded["sid"])
        presented_jti = decoded["jti"]
        family_id_str = decoded.get("fid")
        family_id = uuid.UUID(family_id_str) if family_id_str else None
        
        now = Clock.now()

        # 2. Begin transaction and lock row
        try:
            session = await self.session_repo.get_by_session_id_for_update(session_id)
            
            if not session:
                await self.db_session.rollback()
                raise SessionNotFoundError("Session not found")
                
            if session.status == SessionStatus.COMPROMISED:
                await self.db_session.rollback()
                raise SessionCompromisedError("Session family is compromised")
                
            if session.status == SessionStatus.REVOKED:
                await self.db_session.rollback()
                raise SessionRevokedError("Session is revoked")
                
            exp = session.expires_at
            if exp and exp.tzinfo is None:
                import datetime
                exp = exp.replace(tzinfo=datetime.timezone.utc)
            if session.status == SessionStatus.EXPIRED or exp < now:
                if session.status != SessionStatus.EXPIRED:
                    await self.session_repo.update_session(session_id, {"status": SessionStatus.EXPIRED})
                    await self.db_session.commit()
                else:
                    await self.db_session.rollback()
                raise SessionExpiredError("Session expired")

            # Validate family_id matches if present in token
            if family_id and session.family_id != family_id:
                await self.db_session.rollback()
                raise InvalidRefreshTokenError("Family ID mismatch")
                
            # Hash old token and compare
            if not RefreshTokenHasher.verify(old_token, session.refresh_token_hash):
                await self.session_repo.revoke_family(
                    session.family_id,
                    reason="Refresh token hash mismatch",
                    now=now
                )
                await self.db_session.commit()
                await self.audit.emit_refresh_reuse(session.id, session.user_id) # type: ignore
                raise RefreshReuseDetectedError("Token hash mismatch. Family compromised.")

            if session.current_jti != presented_jti:
                # Token reuse detected via JTI! Family compromise.
                await self.session_repo.revoke_family(
                    session.family_id, 
                    reason="Refresh token reuse detected via JTI", 
                    now=now
                )
                await self.db_session.commit()
                await self.audit.emit_refresh_reuse(session.id, session.user_id) # type: ignore
                raise RefreshReuseDetectedError("Refresh token reuse detected. Family compromised.")
                
            # All valid. Generate new token.
            new_raw_token, new_jti, new_expires = self.token_service.create_refresh_token(
                subject=str(session.user_id),
                session_id=str(session.id),
                family_id=str(session.family_id)
            )
            new_hash = RefreshTokenHasher.hash(new_raw_token)
            
            update_data = {
                "refresh_token_hash": new_hash,
                "current_jti": new_jti,
                "expires_at": new_expires,
                "last_activity_at": now
            }
            await self.session_repo.update_session(session_id, update_data)
            await self.db_session.commit()
            
            # Update local object
            session.refresh_token_hash = new_hash
            session.current_jti = new_jti
            session.expires_at = new_expires
            session.last_activity_at = now
            
        except Exception:
            await self.db_session.rollback()
            raise

        # Post transaction
        await self.audit.emit_refresh(session.id, session.user_id) # type: ignore
        await self.cache.delete(f"session:{session_id}")
            
        return new_raw_token, session

    async def revoke_session(self, session_id: uuid.UUID, reason: str = "User requested logout") -> None:
        await self.session_repo.revoke_session(session_id, reason, Clock.now())
        await self.db_session.commit()
        await self.audit.emit_logout(session_id)
        await self.cache.delete(f"session:{session_id}")

    async def revoke_family(self, family_id: uuid.UUID, reason: str = "Manual family revocation") -> None:
        await self.session_repo.revoke_family(family_id, reason, Clock.now())
        await self.db_session.commit()
        await self.audit.emit_family_revoked(family_id)
        
    async def cleanup_expired_sessions(self) -> int:
        count = await self.session_repo.delete_expired_sessions(Clock.now())
        await self.db_session.commit()
        return count
