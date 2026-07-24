import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.event import OutboxEvent
from app.models.device import Device, DeviceLifecycleState

@pytest.mark.asyncio
async def test_device_provisioning_flow(
    client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict
):
    """
    Test the device provisioning flow, ensuring:
    - Device is created
    - Unique constraints are respected
    - Outbox event is published within the same transaction
    """
    # 0. Create Org and Site for the test
    org_resp = await client.post(
        "/api/v1/organizations",
        json={"name": "Test Org Devices", "slug": "test-org-devices"},
        headers=auth_headers
    )
    print(f"Org Response: {org_resp.status_code}, {org_resp.text}")
    assert org_resp.status_code == 201
    org_id = org_resp.json()["id"]

    site_resp = await client.post(
        f"/api/v1/organizations/{org_id}/sites",
        json={"name": "HQ", "code": "hq-nyc", "timezone": "America/New_York"},
        headers=auth_headers
    )
    print(f"Site Response: {site_resp.status_code}, {site_resp.text}")
    assert site_resp.status_code == 201
    site_id = site_resp.json()["id"]

    # 1. Provision a new device
    payload = {
        "hostname": "core-router-01",
        "management_ip": "10.0.0.1",
        "site_id": site_id,
    }
    
    response = await client.post(
        "/api/v1/devices/provision",
        json=payload,
        headers=auth_headers
    )
    print(f"Provision Response: {response.status_code}, {response.text}")
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["hostname"] == "core-router-01"
    assert data["management_ip"] == "10.0.0.1"
    assert data["lifecycle_state"] == "provisioning"
    
    device_id = data["id"]

    # 2. Verify duplicate fails due to unique constraint
    duplicate_response = await client.post(
        "/api/v1/devices/provision",
        json=payload,
        headers=auth_headers
    )
    print(f"Duplicate Response: {duplicate_response.status_code}, {duplicate_response.text}")
    assert duplicate_response.status_code in (400, 409), duplicate_response.text

    # 3. Verify OutboxEvent was created in the DB
    result = await db_session.execute(
        select(OutboxEvent).where(
            OutboxEvent.aggregate_id == uuid.UUID(device_id),
            OutboxEvent.event_type == "DeviceProvisioningStarted"
        )
    )
    outbox_events = result.scalars().all()
    assert len(outbox_events) == 1
    event = outbox_events[0]
    
    assert event.aggregate == "Device"
    assert event.payload["device_id"] == device_id
    assert event.payload["hostname"] == "core-router-01"
    assert event.payload["management_ip"] == "10.0.0.1"
    assert event.published_at is None  # Not yet published by relay
