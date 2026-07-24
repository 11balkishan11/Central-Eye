import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

@pytest.mark.asyncio
async def test_cross_tenant_provision_rejected(
    client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict, # Tenant A
    auth_headers_tenant_b: dict, # Tenant B
    org_and_site: tuple[str, str] # Tenant A org and site
):
    org_id, site_id = org_and_site
    
    # Tenant B tries to provision a device into Tenant A's site
    payload = {
        "hostname": "core-router-tenant-b",
        "management_ip": "10.0.0.50",
        "site_id": site_id,
    }
    
    # Notice we use Tenant B's auth headers
    response = await client.post("/api/v1/devices/provision", json=payload, headers=auth_headers_tenant_b)
    
    # Tenant B does not own this site, so they shouldn't even know it exists
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_cross_tenant_list_devices_empty(
    client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict,
    auth_headers_tenant_b: dict,
    org_and_site: tuple[str, str]
):
    org_id, site_id = org_and_site
    
    # Tenant A provisions a device
    payload = {
        "hostname": "tenant-a-device",
        "management_ip": "10.0.0.51",
        "site_id": site_id,
    }
    await client.post("/api/v1/devices/provision", json=payload, headers=auth_headers)
    
    # Tenant B lists devices
    list_resp = await client.get("/api/v1/devices", headers=auth_headers_tenant_b)
    assert list_resp.status_code == 200
    
    # Tenant B should see 0 devices
    data = list_resp.json()
    assert len(data["items"]) == 0
