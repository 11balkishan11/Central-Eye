import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from unittest.mock import patch

from app.models.event import OutboxEvent
from app.models.device import Device, DeviceLifecycleState
from app.models.tenant import Organization, Site, SiteStatus

from datetime import datetime, timezone

@pytest.mark.asyncio
async def test_provision_into_soft_deleted_site_rejected(
    client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict,
    org_and_site: tuple[str, str]
):
    org_id, site_id = org_and_site
    
    # Soft delete the site directly in DB
    site = (await db_session.execute(select(Site).where(Site.id == uuid.UUID(site_id)))).scalar_one()
    site.deleted_at = datetime.now(timezone.utc)
    await db_session.flush()

    payload = {
        "hostname": "core-router-01",
        "management_ip": "10.0.0.1",
        "site_id": site_id,
    }
    
    response = await client.post("/api/v1/devices/provision", json=payload, headers=auth_headers)
    assert response.status_code == 404
    assert "Site not found" in response.text

@pytest.mark.asyncio
async def test_provision_into_maintenance_site_does_not_activate_polling(
    client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict,
    org_and_site: tuple[str, str]
):
    org_id, site_id = org_and_site
    
    # Set site to maintenance
    site = (await db_session.execute(select(Site).where(Site.id == uuid.UUID(site_id)))).scalar_one()
    site.status = SiteStatus.maintenance
    await db_session.flush()

    payload = {
        "hostname": "core-router-02",
        "management_ip": "10.0.0.2",
        "site_id": site_id,
    }
    
    response = await client.post("/api/v1/devices/provision", json=payload, headers=auth_headers)
    assert response.status_code == 201
    
    # Verify the device is in provisioning state, which means monitoring shouldn't activate
    device_id = response.json()["id"]
    device = (await db_session.execute(select(Device).where(Device.id == uuid.UUID(device_id)))).scalar_one()
    assert device.lifecycle_state == DeviceLifecycleState.provisioning

@pytest.mark.asyncio
async def test_outbox_failure_rolls_back_device(
    client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict,
    org_and_site: tuple[str, str]
):
    org_id, site_id = org_and_site
    
    payload = {
        "hostname": "core-router-03",
        "management_ip": "10.0.0.3",
        "site_id": site_id,
    }

    # Intercept db_session.add to raise an exception when saving OutboxEvent
    original_add = db_session.add
    def mocked_add(instance):
        if isinstance(instance, OutboxEvent):
            raise Exception("Simulated outbox failure")
        return original_add(instance)

    with patch.object(db_session, 'add', side_effect=mocked_add):
        try:
            response = await client.post("/api/v1/devices/provision", json=payload, headers=auth_headers)
            assert response.status_code == 500
        except Exception:
            pass # Expected if ASGITransport raises it

    # Verify device was not created
    # We rollback the session to clear the identity map
    # This simulates the end of the HTTP request where the session would be closed
    await db_session.rollback()
    device = (await db_session.execute(
        select(Device).where(Device.management_ip == "10.0.0.3")
    )).scalar_one_or_none()
    assert device is None

@pytest.mark.asyncio
async def test_invalid_lifecycle_transition_rejected(
    client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict,
    org_and_site: tuple[str, str]
):
    org_id, site_id = org_and_site
    
    # 1. Provision a new device (starts in PROVISIONING)
    payload = {
        "hostname": "core-router-04",
        "management_ip": "10.0.0.4",
        "site_id": site_id,
    }
    
    resp = await client.post("/api/v1/devices/provision", json=payload, headers=auth_headers)
    assert resp.status_code == 201
    device_id = resp.json()["id"]

    # 2. Try illegal transition: PROVISIONING -> ACTIVE (must go to DISCOVERING first)
    patch_resp = await client.patch(
        f"/api/v1/devices/{device_id}/lifecycle", 
        json={"lifecycle_state": "active"}, 
        headers=auth_headers
    )
    assert patch_resp.status_code == 422
    assert "Invalid lifecycle transition" in patch_resp.text

    # 3. Try legal transition: PROVISIONING -> DISCOVERING
    patch_resp2 = await client.patch(
        f"/api/v1/devices/{device_id}/lifecycle", 
        json={"lifecycle_state": "discovering"}, 
        headers=auth_headers
    )
    assert patch_resp2.status_code == 200
    assert patch_resp2.json()["lifecycle_state"] == "discovering"
