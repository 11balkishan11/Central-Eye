import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_device_soft_delete_and_restore(
    client: AsyncClient,
    auth_headers: dict,
    org_and_site: tuple[str, str]
):
    org_id, site_id = org_and_site
    
    # 1. Provision
    payload = {
        "hostname": "delete-me",
        "management_ip": "10.0.0.100",
        "site_id": site_id,
    }
    resp = await client.post("/api/v1/devices/provision", json=payload, headers=auth_headers)
    assert resp.status_code == 201
    device_id = resp.json()["id"]

    # 2. Soft Delete
    del_resp = await client.delete(f"/api/v1/devices/{device_id}", headers=auth_headers)
    assert del_resp.status_code == 204

    # 3. Verify it's hidden from list
    list_resp = await client.get("/api/v1/devices", headers=auth_headers)
    data = list_resp.json()
    assert not any(d["id"] == device_id for d in data["items"])

    # 4. Restore
    res_resp = await client.post(f"/api/v1/devices/{device_id}/restore", headers=auth_headers)
    assert res_resp.status_code == 200

    # 5. Verify it's back
    list_resp2 = await client.get("/api/v1/devices", headers=auth_headers)
    data2 = list_resp2.json()
    assert any(d["id"] == device_id for d in data2["items"])

@pytest.mark.asyncio
async def test_restore_conflict_rejected(
    client: AsyncClient,
    auth_headers: dict,
    org_and_site: tuple[str, str]
):
    org_id, site_id = org_and_site
    
    # Provision 1
    resp1 = await client.post("/api/v1/devices/provision", json={
        "hostname": "device-1",
        "management_ip": "10.0.0.101",
        "site_id": site_id,
    }, headers=auth_headers)
    d1_id = resp1.json()["id"]

    # Soft Delete 1
    await client.delete(f"/api/v1/devices/{d1_id}", headers=auth_headers)

    # Provision 2 with same IP
    resp2 = await client.post("/api/v1/devices/provision", json={
        "hostname": "device-2",
        "management_ip": "10.0.0.101",
        "site_id": site_id,
    }, headers=auth_headers)
    assert resp2.status_code == 201

    # Try to restore 1 -> Should conflict
    res_resp = await client.post(f"/api/v1/devices/{d1_id}/restore", headers=auth_headers)
    assert res_resp.status_code == 409
    assert "active device with this IP already exists" in res_resp.text
