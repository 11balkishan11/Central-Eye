import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import uuid

from app.main import app
from app.db.base_class import Base
from app.db.session import get_db
from app.models.user import User, UserStatus
from app.models.tenant import Tenant, TenantStatus
from app.auth.password_service import PasswordService



@pytest_asyncio.fixture
async def async_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="https://test") as ac:
        yield ac

@pytest_asyncio.fixture
async def test_user(db_session):
    user = User(
        id=uuid.uuid4(),
        email="test_api@example.com",
        password_hash=PasswordService.get_password_hash("securepassword123"),
        status=UserStatus.active,
        failed_login_count=0
    )
    db_session.add(user)
    await db_session.commit()
    
    return user

@pytest.mark.asyncio
async def test_login_success(async_client: AsyncClient, test_user: User):
    response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "test_api@example.com", "password": "securepassword123"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert "refresh_token" not in data["data"]
    
    # Check Request ID middleware
    assert "X-Request-ID" in response.headers
    
    # Check cookies
    cookies = response.cookies
    assert "refresh_token" in cookies
    
    refresh_cookie = [c for c in response.headers.get_list("set-cookie") if "refresh_token=" in c][0]
    assert "HttpOnly" in refresh_cookie
    assert "Path=/api/v1/auth" in refresh_cookie
    
@pytest.mark.asyncio
async def test_login_failure(async_client: AsyncClient, test_user: User):
    response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "test_api@example.com", "password": "wrongpassword"}
    )
    
    assert response.status_code == 401
    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "AUTH_INVALID_CREDENTIALS"
    assert "X-Request-ID" in response.headers

@pytest.mark.asyncio
async def test_refresh_success(async_client: AsyncClient, test_user: User):
    # 1. Login
    login_resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "test_api@example.com", "password": "securepassword123"}
    )
    assert login_resp.status_code == 200
    
    # httpx stores cookies automatically, so we can just call refresh
    # We must provide Origin to pass validate_origin
    refresh_resp = await async_client.post(
        "/api/v1/auth/refresh",
        headers={"Origin": "http://localhost:5173"}
    )
    
    assert refresh_resp.status_code == 200
    assert refresh_resp.json()["success"] is True
    assert "access_token" in refresh_resp.json()["data"]

@pytest.mark.asyncio
async def test_refresh_missing_cookie(async_client: AsyncClient):
    refresh_resp = await async_client.post(
        "/api/v1/auth/refresh",
        headers={"Origin": "http://localhost:5173"}
    )
    assert refresh_resp.status_code == 401
    
@pytest.mark.asyncio
async def test_logout_success(async_client: AsyncClient, test_user: User):
    login_resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "test_api@example.com", "password": "securepassword123"}
    )
    access_token = login_resp.json()["data"]["access_token"]
    
    logout_resp = await async_client.post(
        "/api/v1/auth/logout",
        headers={
            "Origin": "http://localhost:5173",
            "Authorization": f"Bearer {access_token}"
        }
    )
    assert logout_resp.status_code == 200
    
    # Cookie should be cleared (Max-Age=0 or Expires in past)
    set_cookie = logout_resp.headers.get("set-cookie", "")
    assert "refresh_token" in set_cookie
    assert "Max-Age=0" in set_cookie or "expires=" in set_cookie.lower()

@pytest.mark.asyncio
async def test_get_me(async_client: AsyncClient, test_user: User):
    login_resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "test_api@example.com", "password": "securepassword123"}
    )
    access_token = login_resp.json()["data"]["access_token"]
    
    me_resp = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    assert me_resp.status_code == 200
    assert me_resp.json()["data"]["user"]["email"] == "test_api@example.com"
