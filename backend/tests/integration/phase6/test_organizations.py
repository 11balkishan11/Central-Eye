import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

@pytest.mark.asyncio
async def test_create_organization(
    client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict
):
    response = await client.post(
        "/api/v1/organizations",
        json={"name": "Test Org", "slug": "test-org"},
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Org"
    assert data["slug"] == "test-org"
    assert data["status"] == "active"
    assert "id" in data

@pytest.mark.asyncio
async def test_create_organization_reserved_slug(
    client: AsyncClient,
    auth_headers: dict
):
    response = await client.post(
        "/api/v1/organizations",
        json={"name": "Admin Org", "slug": "admin"},
        headers=auth_headers
    )
    assert response.status_code == 400
    assert "reserved" in response.text.lower()

@pytest.mark.asyncio
async def test_soft_delete_and_restore_organization(
    client: AsyncClient,
    auth_headers: dict
):
    # 1. Create
    resp = await client.post(
        "/api/v1/organizations",
        json={"name": "Delete Me", "slug": "delete-me"},
        headers=auth_headers
    )
    assert resp.status_code == 201
    org_id = resp.json()["id"]

    # 2. Soft Delete
    resp_del = await client.delete(
        f"/api/v1/organizations/{org_id}?reason=Testing",
        headers=auth_headers
    )
    assert resp_del.status_code == 204

    # 3. Read (should fail or return 404 since it's deleted)
    resp_get = await client.get(
        f"/api/v1/organizations/{org_id}",
        headers=auth_headers
    )
    assert resp_get.status_code == 404

    # 4. Restore
    resp_restore = await client.post(
        f"/api/v1/organizations/{org_id}/restore",
        headers=auth_headers
    )
    assert resp_restore.status_code == 200

    # 5. Read again (should succeed)
    resp_get_again = await client.get(
        f"/api/v1/organizations/{org_id}",
        headers=auth_headers
    )
    assert resp_get_again.status_code == 200
