import uuid
import asyncio
import pytest
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock

from app.auth.auth_service import AuthService, AuthenticationError, AccountLockedError
from app.auth.session_service import SessionService
from app.auth.password_service import PasswordService
from app.auth.token_service import TokenService
from app.auth.observability import AuditService, SecurityLogger, AuthMetrics
from app.auth.exceptions import RefreshReuseDetectedError
from app.models.user import User, SessionStatus
from app.core.clock import Clock
from app.core.config import settings

# We can reuse the fakes from test_session_service.py or build simpler ones here
from tests.unit.auth.test_session_service import FakeSessionRepository, FakeAsyncSession

class FakeUserRepository:
    def __init__(self):
        self.users = {}
        self.update_calls = []

    async def get_by_email(self, email: str):
        for user in self.users.values():
            if user.email == email:
                return user
        return None

    async def get_by_id(self, user_id: uuid.UUID):
        return self.users.get(user_id)

    async def increment_failed_login(self, user_id: uuid.UUID):
        if user_id in self.users:
            self.users[user_id].failed_login_count += 1

    async def lock_user(self, user_id: uuid.UUID, lock_until: datetime):
        if user_id in self.users:
            self.users[user_id].locked_until = lock_until

    async def reset_failed_login(self, user_id: uuid.UUID):
        if user_id in self.users:
            self.users[user_id].failed_login_count = 0
            self.users[user_id].locked_until = None

    async def update_last_login(self, user_id: uuid.UUID, now: datetime):
        if user_id in self.users:
            self.users[user_id].last_login_at = now

@pytest.fixture
def auth_env():
    lock = asyncio.Lock()
    user_repo = FakeUserRepository()
    session_repo = FakeSessionRepository(lock)
    db_session = FakeAsyncSession(lock)
    
    password_service = PasswordService()
    token_service = TokenService()
    
    # We use AsyncMock for the cache inside session_service
    from app.auth.cache import SessionCache
    cache = AsyncMock(spec=SessionCache)
    
    audit_service = AsyncMock(spec=AuditService)
    security_logger = MagicMock(spec=SecurityLogger)
    auth_metrics = MagicMock(spec=AuthMetrics)
    
    session_service = SessionService(
        session_repo=session_repo,
        cache=cache,
        audit=audit_service,
        token_service=token_service,
        db_session=db_session
    )
    
    auth_service = AuthService(
        user_repo=user_repo,
        password_service=password_service,
        session_service=session_service,
        token_service=token_service,
        audit_service=audit_service,
        security_logger=security_logger,
        auth_metrics=auth_metrics,
        db_session=db_session
    )
    
    return {
        "auth_service": auth_service,
        "user_repo": user_repo,
        "session_repo": session_repo,
        "password_service": password_service,
        "audit": audit_service,
        "logger": security_logger,
        "metrics": auth_metrics
    }

@pytest.mark.asyncio
async def test_auth_service_end_to_end_success(auth_env):
    env = auth_env
    auth_service: AuthService = env["auth_service"]
    user_repo: FakeUserRepository = env["user_repo"]
    env["password_service"]
    
    user_id = uuid.uuid4()
    email = "test@example.com"
    password = "securepassword123"
    password_hash = PasswordService.get_password_hash(password)
    
    user = User(
        id=user_id,
        email=email,
        password_hash=password_hash,
        failed_login_count=0,
        locked_until=None
    )
    user_repo.users[user_id] = user
    
    # 1. Login Success
    result = await auth_service.login(email, password)
    
    assert result.user.id == user.id
    assert result.access_token is not None
    assert result.refresh_token is not None
    assert result.session.status == SessionStatus.ACTIVE
    
    env["logger"].log_login_attempt.assert_called_with(email, success=True, ip_address=None)
    env["metrics"].record_login_success.assert_called_once()
    
    # 2. Refresh Works
    refresh_result = await auth_service.refresh(result.refresh_token)
    assert refresh_result.access_token != result.access_token
    assert refresh_result.refresh_token != result.refresh_token
    env["metrics"].record_token_refresh.assert_called_once()
    
    # 3. Logout
    await auth_service.logout(result.session.id)
    assert result.session.status == SessionStatus.REVOKED
    env["metrics"].record_session_revoked.assert_called_once()
    
    # 4. Refresh Fails on revoked session
    with pytest.raises(Exception): # Will raise SessionRevokedError
        await auth_service.refresh(refresh_result.refresh_token)

@pytest.mark.asyncio
async def test_auth_service_login_failure_and_lockout(auth_env):
    env = auth_env
    auth_service: AuthService = env["auth_service"]
    user_repo: FakeUserRepository = env["user_repo"]
    env["password_service"]
    
    user_id = uuid.uuid4()
    email = "test@example.com"
    password = "securepassword123"
    
    user = User(
        id=user_id,
        email=email,
        password_hash=PasswordService.get_password_hash(password),
        failed_login_count=0,
        locked_until=None
    )
    user_repo.users[user_id] = user
    
    # Fail multiple times to hit lockout
    for i in range(settings.LOGIN_MAX_ATTEMPTS):
        with pytest.raises(AuthenticationError):
            await auth_service.login(email, "wrongpassword")
            
    # Now user should be locked
    assert user.failed_login_count == settings.LOGIN_MAX_ATTEMPTS
    assert user.locked_until is not None
    assert user.locked_until > Clock.now()
    
    env["logger"].log_account_lockout.assert_called_once_with(user.id)
    env["audit"].emit_account_locked.assert_called_once_with(user.id)
    
    # Next attempt should raise AccountLockedError even if password is correct
    with pytest.raises(AccountLockedError):
        await auth_service.login(email, password)
        
    # Manually reset lock to test unlock on success
    user.locked_until = Clock.now() - timedelta(minutes=1)
    
    # Login should succeed and reset failed_login_count
    result = await auth_service.login(email, password)
    assert result.user.failed_login_count == 0
    assert result.user.locked_until is None

@pytest.mark.asyncio
async def test_auth_service_token_reuse(auth_env):
    env = auth_env
    auth_service: AuthService = env["auth_service"]
    user_repo: FakeUserRepository = env["user_repo"]
    
    user = User(
        id=uuid.uuid4(),
        email="test@example.com",
        password_hash=PasswordService.get_password_hash("securepassword123"),
        failed_login_count=0,
        locked_until=None
    )
    user_repo.users[user.id] = user
    
    # Login
    result = await auth_service.login(user.email, "securepassword123")
    
    # Normal rotation
    refresh_result = await auth_service.refresh(result.refresh_token)
    
    # Attacker uses raw_refresh_1 again
    with pytest.raises(RefreshReuseDetectedError):
        await auth_service.refresh(result.refresh_token)
        
    # The family should be compromised
    assert result.session.status == SessionStatus.COMPROMISED
    env["audit"].emit_refresh_reuse.assert_called_with(result.session.id, user.id)
