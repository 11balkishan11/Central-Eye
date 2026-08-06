import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.auth.repository import UserRepository, TenantMembershipRepository, SessionRepository, LoginAttemptRepository
from app.models.user import UserSession, LoginAttempt

@pytest.fixture
def mock_session():
    session = AsyncMock()
    # For scalar_one_or_none(), scalars().all() etc.
    result_mock = MagicMock()
    result_mock.scalar_one_or_none.return_value = None
    result_mock.scalars.return_value.all.return_value = []
    
    session.execute.return_value = result_mock
    return session

@pytest.mark.asyncio
async def test_user_repository_get_by_email(mock_session):
    repo = UserRepository(mock_session)
    await repo.get_by_email("test@example.com")
    mock_session.execute.assert_called_once()
    
@pytest.mark.asyncio
async def test_user_repository_increment_failed_login(mock_session):
    repo = UserRepository(mock_session)
    await repo.increment_failed_login(uuid.uuid4())
    mock_session.execute.assert_called_once()

@pytest.mark.asyncio
async def test_tenant_membership_repository_get_active(mock_session):
    repo = TenantMembershipRepository(mock_session)
    await repo.get_active_memberships(uuid.uuid4())
    mock_session.execute.assert_called_once()

@pytest.mark.asyncio
async def test_session_repository_create_session(mock_session):
    repo = SessionRepository(mock_session)
    session_data = UserSession(id=uuid.uuid4(), refresh_token_hash="hash", family_id=uuid.uuid4())
    result = await repo.create_session(session_data)
    mock_session.add.assert_called_once_with(session_data)
    mock_session.flush.assert_called_once()
    assert result == session_data

@pytest.mark.asyncio
async def test_session_repository_revoke_family(mock_session):
    repo = SessionRepository(mock_session)
    await repo.revoke_family(uuid.uuid4(), "compromised", datetime.now(timezone.utc))
    mock_session.execute.assert_called_once()

@pytest.mark.asyncio
async def test_login_attempt_repository_create_attempt(mock_session):
    repo = LoginAttemptRepository(mock_session)
    attempt = LoginAttempt(id=uuid.uuid4(), email="test@example.com", was_successful=False, attempted_at=datetime.now(timezone.utc))
    result = await repo.create_attempt(attempt)
    mock_session.add.assert_called_once_with(attempt)
    mock_session.flush.assert_called_once()
    assert result == attempt
