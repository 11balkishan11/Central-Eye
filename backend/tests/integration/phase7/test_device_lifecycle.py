import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_valid_lifecycle_transitions(
    client: AsyncClient,
    auth_headers: dict,
    org_and_site: tuple[str, str]
):
    org_id, site_id = org_and_site
    
    # PROVISIONING
    resp = await client.post("/api/v1/devices/provision", json={
        "hostname": "lifecycle-test",
        "management_ip": "10.0.0.104",
        "site_id": site_id,
    }, headers=auth_headers)
    assert resp.status_code == 201
    device_id = resp.json()["id"]

    # -> DISCOVERING
    patch1 = await client.patch(
        f"/api/v1/devices/{device_id}/lifecycle", 
        json={"lifecycle_state": "discovering"}, 
        headers=auth_headers
    )
    assert patch1.status_code == 200

    # -> ACTIVE
    patch2 = await client.patch(
        f"/api/v1/devices/{device_id}/lifecycle", 
        json={"lifecycle_state": "active"}, 
        headers=auth_headers
    )
    assert patch2.status_code == 200

    # -> RETIRED
    patch3 = await client.patch(
        f"/api/v1/devices/{device_id}/lifecycle", 
        json={"lifecycle_state": "retired"}, 
        headers=auth_headers
    )
    assert patch3.status_code == 200

    # -> DECOMMISSIONED
    patch4 = await client.patch(
        f"/api/v1/devices/{device_id}/lifecycle", 
        json={"lifecycle_state": "decommissioned"}, 
        headers=auth_headers
    )
    assert patch4.status_code == 200

@pytest.mark.asyncio
async def test_valid_admin_state_transitions(
    client: AsyncClient,
    auth_headers: dict,
    org_and_site: tuple[str, str]
):
    org_id, site_id = org_and_site
    
    # Provisioned device starts ENABLED
    resp = await client.post("/api/v1/devices/provision", json={
        "hostname": "admin-test",
        "management_ip": "10.0.0.105",
        "site_id": site_id,
    }, headers=auth_headers)
    device_id = resp.json()["id"]

    # -> MAINTENANCE
    patch1 = await client.patch(
        f"/api/v1/devices/{device_id}/administrative-state", 
        json={"admin_state": "maintenance"}, 
        headers=auth_headers
    )
    assert patch1.status_code == 200

    # -> DISABLED
    patch2 = await client.patch(
        f"/api/v1/devices/{device_id}/administrative-state", 
        json={"admin_state": "disabled"}, 
        headers=auth_headers
    )
    assert patch2.status_code == 200

    # -> ENABLED
    patch3 = await client.patch(
        f"/api/v1/devices/{device_id}/administrative-state", 
        json={"admin_state": "enabled"}, 
        headers=auth_headers
    )
    assert patch3.status_code == 200
