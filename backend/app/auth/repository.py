import uuid
from datetime import datetime
from typing import Optional, Sequence

from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserSession, LoginAttempt, SessionStatus
from app.models.tenant import TenantMembership, TenantMembershipStatus, Tenant

class TenantRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, tenant_id: uuid.UUID) -> Optional[Tenant]:
        result = await self.session.execute(select(Tenant).where(Tenant.id == tenant_id))
        return result.scalar_one_or_none()

class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_email(self, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        stmt = select(User).where(User.id == user_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def increment_failed_login(self, user_id: uuid.UUID) -> None:
        stmt = (
            update(User)
            .where(User.id == user_id)
            .values(failed_login_count=User.failed_login_count + 1)
        )
        await self.session.execute(stmt)

    async def reset_failed_login(self, user_id: uuid.UUID) -> None:
        stmt = (
            update(User)
            .where(User.id == user_id)
            .values(failed_login_count=0, locked_until=None)
        )
        await self.session.execute(stmt)

    async def lock_user(self, user_id: uuid.UUID, until: datetime) -> None:
        stmt = (
            update(User)
            .where(User.id == user_id)
            .values(locked_until=until)
        )
        await self.session.execute(stmt)

    async def update_last_login(self, user_id: uuid.UUID, now: datetime) -> None:
        stmt = (
            update(User)
            .where(User.id == user_id)
            .values(last_login_at=now)
        )
        await self.session.execute(stmt)

class TenantMembershipRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, membership_id: uuid.UUID) -> Optional[TenantMembership]:
        result = await self.session.execute(select(TenantMembership).where(TenantMembership.id == membership_id))
        return result.scalar_one_or_none()

    async def get_active_memberships(self, user_id: uuid.UUID) -> Sequence[TenantMembership]:
        stmt = (
            select(TenantMembership)
            .where(
                TenantMembership.user_id == user_id,
                TenantMembership.status == TenantMembershipStatus.active
            )
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_membership(self, user_id: uuid.UUID, tenant_id: uuid.UUID) -> Optional[TenantMembership]:
        stmt = (
            select(TenantMembership)
            .where(
                TenantMembership.user_id == user_id,
                TenantMembership.tenant_id == tenant_id
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

class SessionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_session(self, session: UserSession) -> UserSession:
        self.session.add(session)
        await self.session.flush()
        return session

    async def get_by_session_id(self, session_id: uuid.UUID) -> Optional[UserSession]:
        stmt = select(UserSession).where(UserSession.id == session_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_session_id_for_update(self, session_id: uuid.UUID) -> Optional[UserSession]:
        stmt = select(UserSession).where(UserSession.id == session_id).with_for_update(nowait=True)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_refresh_hash(self, refresh_hash: str) -> Optional[UserSession]:
        stmt = select(UserSession).where(UserSession.refresh_token_hash == refresh_hash)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_refresh_hash_for_update(self, refresh_hash: str) -> Optional[UserSession]:
        stmt = select(UserSession).where(UserSession.refresh_token_hash == refresh_hash).with_for_update()
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def update_session(self, session_id: uuid.UUID, data: dict) -> None:
        stmt = (
            update(UserSession)
            .where(UserSession.id == session_id)
            .values(**data)
        )
        await self.session.execute(stmt)

    async def revoke_session(self, session_id: uuid.UUID, reason: str, now: datetime) -> None:
        stmt = (
            update(UserSession)
            .where(UserSession.id == session_id)
            .values(
                status=SessionStatus.REVOKED,
                revoked_at=now,
                revoke_reason=reason,
                deleted_at=now
            )
        )
        await self.session.execute(stmt)

    async def revoke_family(self, family_id: uuid.UUID, reason: str, now: datetime) -> None:
        stmt = (
            update(UserSession)
            .where(UserSession.family_id == family_id, UserSession.status == SessionStatus.ACTIVE)
            .values(
                status=SessionStatus.COMPROMISED,
                revoked_at=now,
                revoke_reason=reason,
                deleted_at=now
            )
        )
        await self.session.execute(stmt)

    async def delete_expired_sessions(self, now: datetime) -> int:
        stmt = (
            delete(UserSession)
            .where(UserSession.expires_at < now)
        )
        result = await self.session.execute(stmt)
        return result.rowcount  # type: ignore[attr-defined]

class LoginAttemptRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_attempt(self, attempt: LoginAttempt) -> LoginAttempt:
        self.session.add(attempt)
        await self.session.flush()
        return attempt

    async def recent_failed_attempts(self, user_id: uuid.UUID, since: datetime) -> int:
        stmt = (
            select(LoginAttempt)
            .where(
                LoginAttempt.user_id == user_id,
                LoginAttempt.was_successful.is_(False),
                LoginAttempt.attempted_at >= since
            )
        )
        result = await self.session.execute(stmt)
        return len(result.scalars().all())
