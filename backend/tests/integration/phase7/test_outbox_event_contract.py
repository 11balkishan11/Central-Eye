import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.event import OutboxEvent

@pytest.mark.asyncio
async def test_device_provisioning_emits_outbox_event(
    client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict,
    org_and_site: tuple[str, str]
):
    org_id, site_id = org_and_site
    
    payload = {
        "hostname": "outbox-test-01",
        "management_ip": "10.0.0.106",
        "site_id": site_id,
    }
    
    resp = await client.post("/api/v1/devices/provision", json=payload, headers=auth_headers)
    assert resp.status_code == 201
    device_id = resp.json()["id"]

    # Verify event was emitted
    stmt = select(OutboxEvent).where(
        OutboxEvent.aggregate_id == uuid.UUID(device_id),
        OutboxEvent.event_type == "DeviceProvisioningStarted"
    )
    event = (await db_session.execute(stmt)).scalar_one_or_none()
    
    assert event is not None
    assert event.aggregate == "Device"
    assert event.payload["hostname"] == "outbox-test-01"
    assert event.payload["management_ip"] == "10.0.0.106"
    assert event.payload["site_id"] == site_id
