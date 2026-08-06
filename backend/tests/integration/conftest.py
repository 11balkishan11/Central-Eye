import pytest_asyncio
from httpx import AsyncClient, ASGITransport
import uuid
import datetime

from app.main import app
from app.models.tenant import Tenant, TenantMembership
from app.models.user import User, UserSession, SessionStatus
from app.models.rbac import Role, Permission, RolePermission
from app.auth.token_service import TokenService
from sqlalchemy import select


ALL_PERMISSIONS = [
    ("organizations:create", "organizations", "create"),
    ("organizations:read", "organizations", "read"),
    ("organizations:update", "organizations", "update"),
    ("organizations:delete", "organizations", "delete"),
    ("organizations:restore", "organizations", "restore"),
    ("sites:create", "sites", "create"),
    ("sites:read", "sites", "read"),
    ("sites:update", "sites", "update"),
    ("sites:delete", "sites", "delete"),
    ("sites:restore", "sites", "restore"),
    ("devices:create", "devices", "create"),
    ("devices:read", "devices", "read"),
    ("devices:update", "devices", "update"),
    ("devices:delete", "devices", "delete"),
    ("devices:restore", "devices", "restore"),
    ("invitations:create", "invitations", "create"),
]


async def _create_authenticated_user(
    db_session,
    email: str,
    tenant_name: str,
    tenant_slug: str,
    permission_names: list[tuple[str, str, str]] | None = None,
):
    """
    Helper: creates User, Tenant, Role, Permissions, Membership, Session, JWT.
    Returns (headers_dict, tenant, user).
    """
    if permission_names is None:
        permission_names = ALL_PERMISSIONS

    user = User(email=email, password_hash="fakehash", status="active", is_superuser=True)
    db_session.add(user)

    tenant = Tenant(name=tenant_name, slug=tenant_slug)
    db_session.add(tenant)
    await db_session.flush()

    role = Role(name=f"Admin-{tenant_slug}", description="Test admin role")
    db_session.add(role)
    await db_session.flush()

    # Create permissions (reuse existing or create new)
    for perm_name, resource, action in permission_names:
        existing = (await db_session.execute(
            select(Permission).where(Permission.name == perm_name)
        )).scalar_one_or_none()
        if not existing:
            perm = Permission(name=perm_name, resource=resource, action=action)
            db_session.add(perm)
    await db_session.flush()

    # Link permissions to role
    for perm_name, _, _ in permission_names:
        perm = (await db_session.execute(
            select(Permission).where(Permission.name == perm_name)
        )).scalar_one()
        rp = RolePermission(role_id=role.id, permission_id=perm.id)
        db_session.add(rp)
    await db_session.flush()

    membership = TenantMembership(
        tenant_id=tenant.id, user_id=user.id, role_id=role.id
    )
    db_session.add(membership)
    await db_session.flush()

    session_id = uuid.uuid4()
    user_session = UserSession(
        id=session_id,
        user_id=user.id,
        tenant_id=tenant.id,
        membership_id=membership.id,
        status=SessionStatus.ACTIVE,
        refresh_token_hash=f"fake-{uuid.uuid4()}",
        family_id=uuid.uuid4(),
        current_jti=str(uuid.uuid4()),
        ip_address="127.0.0.1",
        user_agent="pytest",
        expires_at=datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=1),
    )
    db_session.add(user_session)
    await db_session.flush()

    token = TokenService().create_access_token(
        subject=str(user.id),
        session_id=str(session_id),
        tenant_id=str(tenant.id),
    )

    headers = {
        "Authorization": f"Bearer {token}",
        "X-Tenant-ID": str(tenant.id),
    }
    return headers, tenant, user


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest_asyncio.fixture
async def auth_headers(db_session):
    """Full-permission admin for Tenant A."""
    headers, _, _ = await _create_authenticated_user(
        db_session, "admin-a@example.com", "Tenant A", "tenant-a"
    )
    return headers


@pytest_asyncio.fixture
async def tenant_a_context(db_session):
    """Returns (headers, tenant, user) for Tenant A."""
    return await _create_authenticated_user(
        db_session, "admin-a2@example.com", "Tenant A2", "tenant-a2"
    )


@pytest_asyncio.fixture
async def auth_headers_tenant_b(db_session):
    """Full-permission admin for Tenant B (for cross-tenant tests)."""
    headers, _, _ = await _create_authenticated_user(
        db_session, "admin-b@example.com", "Tenant B", "tenant-b"
    )
    return headers


@pytest_asyncio.fixture
async def auth_headers_readonly(db_session):
    """User with ONLY read permissions — no create/delete/update."""
    read_only_perms = [
        ("organizations:read", "organizations", "read"),
        ("sites:read", "sites", "read"),
        ("devices:read", "devices", "read"),
    ]
    headers, _, _ = await _create_authenticated_user(
        db_session,
        "readonly@example.com",
        "Tenant Readonly",
        "tenant-readonly",
        permission_names=read_only_perms,
    )
    return headers


async def _create_org_and_site(client, auth_headers):
    """Helper: creates an org and site via API, returns (org_id, site_id)."""
    org_resp = await client.post(
        "/api/v1/organizations",
        json={"name": f"Org-{uuid.uuid4().hex[:8]}", "slug": f"org-{uuid.uuid4().hex[:8]}"},
        headers=auth_headers,
    )
    assert org_resp.status_code == 201, org_resp.text
    org_id = org_resp.json()["id"]

    site_resp = await client.post(
        f"/api/v1/organizations/{org_id}/sites",
        json={"name": f"Site-{uuid.uuid4().hex[:8]}", "code": f"site-{uuid.uuid4().hex[:8]}"},
        headers=auth_headers,
    )
    assert site_resp.status_code == 201, site_resp.text
    site_id = site_resp.json()["id"]
    return org_id, site_id


@pytest_asyncio.fixture
async def org_and_site(client, auth_headers):
    """Creates an org+site for Tenant A and returns (org_id, site_id)."""
    return await _create_org_and_site(client, auth_headers)
