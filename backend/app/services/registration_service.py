from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from datetime import datetime, timezone, timedelta
import uuid
from typing import cast
from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher

password_hash = PasswordHash((Argon2Hasher(),))

from app.models.device import CollectorRegistrationKey, Collector  # noqa: E402
from app.schemas.registration import RegistrationRequest, RegistrationResponse  # noqa: E402
from app.auth.token_service import TokenService  # noqa: E402
from app.core.config import settings  # noqa: E402
from app.models.job import CollectorEvent, CollectorEventType  # noqa: E402


class RegistrationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.token_service = TokenService()

    async def register_collector(self, request: RegistrationRequest, correlation_id: str | None = None) -> RegistrationResponse:
        # Load all keys to check hash
        # Warning: For scale, we should probably fetch valid keys first, but since keys might be hashed, we iterate.
        # Alternatively, find keys that are not expired and not revoked.
        result = await self.db.execute(
            select(CollectorRegistrationKey)
            .where(CollectorRegistrationKey.revoked_at.is_(None))
        )
        keys = result.scalars().all()
        
        valid_key = None
        for k in keys:
            if password_hash.verify(request.registration_key, cast(str, k.key_hash)):
                valid_key = k
                break
                
        if not valid_key:
            raise HTTPException(status_code=401, detail="Invalid registration key")
            
        if valid_key.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="Registration key expired")
            
        if valid_key.used_count >= valid_key.max_registrations:
            raise HTTPException(status_code=401, detail="Registration key usage limit exceeded")
            
        # Check if collector with this machine_id already exists
        result = await self.db.execute(select(Collector).where(Collector.machine_id == request.machine_id))
        collector = result.scalar_one_or_none()
        
        if not collector:
            collector = Collector(
                tenant_id=valid_key.tenant_id,
                site_id=valid_key.site_id,
                name=request.hostname,
                machine_id=request.machine_id,
                platform=request.platform,
                python_version=request.python_version,
                version=request.collector_version,
                capabilities=request.capabilities
            )
            self.db.add(collector)
        else:
            collector.name = request.hostname
            collector.platform = request.platform
            collector.python_version = request.python_version
            collector.version = request.collector_version
            collector.capabilities = request.capabilities
            collector.site_id = valid_key.site_id
            collector.tenant_id = valid_key.tenant_id
            
        valid_key.used_count += 1
        valid_key.last_used_at = datetime.now(timezone.utc)
        
        event = CollectorEvent(
            tenant_id=collector.tenant_id,
            collector_id=collector.id,
            event_type=CollectorEventType.REGISTERED,
            correlation_id=correlation_id,
            details={"hostname": request.hostname, "platform": request.platform}
        )
        self.db.add(event)
        
        await self.db.commit()
        await self.db.refresh(collector)
        
        access_token = self.token_service.create_collector_token(
            subject=str(collector.id),
            token_type="collector_access",
            audience=settings.JWT_ACCESS_AUDIENCE,
            expires_delta=timedelta(minutes=30)
        )
        refresh_token = self.token_service.create_collector_token(
            subject=str(collector.id),
            token_type="collector_refresh",
            audience=settings.JWT_REFRESH_AUDIENCE,
            expires_delta=timedelta(days=30)
        )
        
        return RegistrationResponse(
            collector_id=cast(uuid.UUID, collector.id),
            tenant_id=cast(uuid.UUID, collector.tenant_id),
            site_id=cast(uuid.UUID | None, collector.site_id),
            access_token=access_token,
            refresh_token=refresh_token
        )

    async def refresh_token(self, refresh_token: str, correlation_id: str | None = None) -> dict:
        try:
            payload = self.token_service.decode_collector_token(refresh_token, audience=settings.JWT_REFRESH_AUDIENCE)
            if payload.get("type") != "collector_refresh":
                raise HTTPException(status_code=401, detail="Invalid token type")
            
            collector_id = payload.get("sub")
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
            
        access_token = self.token_service.create_collector_token(
            subject=cast(str, collector_id),
            token_type="collector_access",
            audience=settings.JWT_ACCESS_AUDIENCE,
            expires_delta=timedelta(minutes=30)
        )
        # You can also log TOKEN_REFRESH here if you fetch the Collector or just rely on sub.
        # For MVP, we will assume token refresh doesn't need to block on DB read.
        return {"access_token": access_token}
