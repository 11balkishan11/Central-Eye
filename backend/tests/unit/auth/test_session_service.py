import uuid
import asyncio
import pytest
from datetime import datetime, timedelta
from unittest.mock import AsyncMock

from app.auth.session_service import SessionService
from app.auth.exceptions import (
    RefreshReuseDetectedError
)
from app.auth.cache import SessionCache
from app.auth.observability import AuditService
from app.auth.hasher import RefreshTokenHasher
from app.models.user import UserSession, SessionStatus
from app.core.clock import Clock

class FakeTokenService:
    def decode_token(self, token, audience):
        if token == "invalid":
            raise Exception("Invalid token")
        parts = token.split(":")
        return {
            "sub": parts[0],
            "sid": parts[1],
            "jti": parts[2],
            "fid": parts[3] if len(parts) > 3 else None
        }

    def create_refresh_token(self, subject, session_id, family_id):
        new_jti = str(uuid.uuid4())
        raw_token = f"{subject}:{session_id}:{new_jti}:{family_id}"
        expires = Clock.now() + timedelta(days=14)
        return raw_token, new_jti, expires


class FakeAsyncSession:
    def __init__(self, lock: asyncio.Lock):
        self.lock = lock
        self.committed = False
        self.rolled_back = False

    async def commit(self):
        if self.lock.locked():
            self.lock.release()
        self.committed = True

    async def rollback(self):
        if self.lock.locked():
            self.lock.release()
        self.rolled_back = True


class FakeSessionRepository:
    def __init__(self, lock: asyncio.Lock):
        self.sessions = {}
        self.lock = lock
        self.revoked_families = set()
        self.update_calls = []

    async def create_session(self, session: UserSession):
        self.sessions[session.id] = session
        return session

    async def get_by_session_id_for_update(self, session_id: uuid.UUID):
        if self.lock.locked():
            raise Exception("OperationalError: database is locked (nowait=True)")
        await self.lock.acquire()
        return self.sessions.get(session_id)

    async def update_session(self, session_id: uuid.UUID, data: dict):
        self.update_calls.append((session_id, data))
        session = self.sessions.get(session_id)
        if session:
            for k, v in data.items():
                setattr(session, k, v)

    async def revoke_family(self, family_id: uuid.UUID, reason: str, now: datetime):
        self.revoked_families.add(family_id)
        for s in self.sessions.values():
            if s.family_id == family_id:
                s.status = SessionStatus.COMPROMISED

    async def revoke_session(self, session_id: uuid.UUID, reason: str, now: datetime):
        if session_id in self.sessions:
            self.sessions[session_id].status = SessionStatus.REVOKED


@pytest.fixture
def session_env():
    lock = asyncio.Lock()
    repo = FakeSessionRepository(lock)
    db_session = FakeAsyncSession(lock)
    cache = AsyncMock(spec=SessionCache)
    audit = AsyncMock(spec=AuditService)
    token_service = FakeTokenService()
    
    service = SessionService(
        session_repo=repo,
        cache=cache,
        audit=audit,
        token_service=token_service,
        db_session=db_session
    )
    return service, repo, db_session, cache, audit


@pytest.mark.asyncio
async def test_create_session(session_env):
    service, repo, db_session, _, audit = session_env
    user_id = uuid.uuid4()
    
    session = await service.create_session(
        user_id=user_id,
        refresh_token_hash="hash",
        current_jti="jti",
        expires_at=Clock.now() + timedelta(days=1)
    )
    
    assert session.user_id == user_id
    assert session.status == SessionStatus.ACTIVE
    assert session.family_id is not None
    assert repo.sessions[session.id] == session
    assert db_session.committed is True
    audit.emit_session_created.assert_called_once_with(session.id, user_id)


@pytest.mark.asyncio
async def test_rotate_refresh_token_success(session_env):
    service, repo, db_session, cache, audit = session_env
    user_id = uuid.uuid4()
    session_id = uuid.uuid4()
    family_id = uuid.uuid4()
    old_jti = "old-jti"
    
    old_raw_token = f"{user_id}:{session_id}:{old_jti}:{family_id}"
    old_hash = RefreshTokenHasher.hash(old_raw_token)
    
    session = UserSession(
        id=session_id,
        user_id=user_id,
        family_id=family_id,
        current_jti=old_jti,
        refresh_token_hash=old_hash,
        status=SessionStatus.ACTIVE,
        expires_at=Clock.now() + timedelta(days=1)
    )
    repo.sessions[session_id] = session
    
    new_token, updated_session = await service.rotate_refresh_token(old_raw_token)
    
    assert db_session.committed is True
    assert not db_session.lock.locked()
    assert updated_session.current_jti != old_jti
    assert updated_session.refresh_token_hash != old_hash
    assert updated_session.status == SessionStatus.ACTIVE
    
    audit.emit_refresh.assert_called_once()
    cache.delete.assert_called_once_with(f"session:{session_id}")


@pytest.mark.asyncio
async def test_rotate_refresh_token_reuse_detection(session_env):
    service, repo, db_session, _, audit = session_env
    user_id = uuid.uuid4()
    session_id = uuid.uuid4()
    family_id = uuid.uuid4()
    
    # Simulate an attacker using an old token
    attacker_jti = "old-jti"
    current_jti = "new-jti"
    
    attacker_token = f"{user_id}:{session_id}:{attacker_jti}:{family_id}"
    
    session = UserSession(
        id=session_id,
        user_id=user_id,
        family_id=family_id,
        current_jti=current_jti, # DB has advanced to new-jti
        refresh_token_hash=RefreshTokenHasher.hash(f"{user_id}:{session_id}:{current_jti}:{family_id}"),
        status=SessionStatus.ACTIVE,
        expires_at=Clock.now() + timedelta(days=1)
    )
    repo.sessions[session_id] = session
    
    with pytest.raises(RefreshReuseDetectedError):
        await service.rotate_refresh_token(attacker_token)
        
    assert session.status == SessionStatus.COMPROMISED
    assert family_id in repo.revoked_families
    audit.emit_refresh_reuse.assert_called_once_with(session_id, user_id)
    assert db_session.committed is True


@pytest.mark.asyncio
async def test_concurrent_refresh_rotation(session_env):
    service, repo, db_session, _, _ = session_env
    user_id = uuid.uuid4()
    session_id = uuid.uuid4()
    family_id = uuid.uuid4()
    old_jti = "old-jti"
    
    old_raw_token = f"{user_id}:{session_id}:{old_jti}:{family_id}"
    old_hash = RefreshTokenHasher.hash(old_raw_token)
    
    session = UserSession(
        id=session_id,
        user_id=user_id,
        family_id=family_id,
        current_jti=old_jti,
        refresh_token_hash=old_hash,
        status=SessionStatus.ACTIVE,
        expires_at=Clock.now() + timedelta(days=1)
    )
    repo.sessions[session_id] = session
    
    # Modify the fake repo's get_by_session_id_for_update to simulate a slow transaction
    # so we can reliably hit the locked state with asyncio.gather
    async def slow_get_by_session_id_for_update(sid):
        if repo.lock.locked():
            raise Exception("OperationalError: database is locked (nowait=True)")
        await repo.lock.acquire()
        await asyncio.sleep(0.05)  # Yield control so the concurrent task can attempt to get the lock
        return repo.sessions.get(sid)
    
    repo.get_by_session_id_for_update = slow_get_by_session_id_for_update
    
    # Run two refresh rotations concurrently
    results = await asyncio.gather(
        service.rotate_refresh_token(old_raw_token),
        service.rotate_refresh_token(old_raw_token),
        return_exceptions=True
    )
    
    # One should succeed, one should fail with OperationalError
    successes = [r for r in results if not isinstance(r, Exception)]
    failures = [r for r in results if isinstance(r, Exception)]
    
    assert len(successes) == 1
    assert len(failures) == 1
    assert "OperationalError: database is locked" in str(failures[0])
    
    # The family remains valid!
    assert session.status == SessionStatus.ACTIVE
    assert family_id not in repo.revoked_families
    
    # Verify invariants:
    # 1. New JTI stored and is different from old
    assert session.current_jti != old_jti
    # 2. New refresh hash is different
    assert session.refresh_token_hash != old_hash
    # 3. Only one successful new token was returned
    new_token, updated_session = successes[0]
    assert updated_session.current_jti == session.current_jti
