import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_readonly_user_cannot_provision(
    client: AsyncClient,
    auth_headers_readonly: dict,
    org_and_site: tuple[str, str]
):
    org_id, site_id = org_and_site
    
    payload = {
        "hostname": "readonly-test",
        "management_ip": "10.0.0.102",
        "site_id": site_id,
    }
    
    # Needs auth_headers_readonly to be a user with ONLY read permissions
    # According to phase7 conftest, we created a readonly user.
    response = await client.post("/api/v1/devices/provision", json=payload, headers=auth_headers_readonly)
    assert response.status_code == 403

@pytest.mark.asyncio
async def test_readonly_user_can_list(
    client: AsyncClient,
    auth_headers: dict,
    auth_headers_readonly: dict,
    org_and_site: tuple[str, str]
):
    org_id, site_id = org_and_site
    
    # Admin provisions a device
    await client.post("/api/v1/devices/provision", json={
        "hostname": "readonly-list",
        "management_ip": "10.0.0.103",
        "site_id": site_id,
    }, headers=auth_headers)

    # Readonly lists devices
    list_resp = await client.get("/api/v1/devices", headers=auth_headers_readonly)
    assert list_resp.status_code == 200
