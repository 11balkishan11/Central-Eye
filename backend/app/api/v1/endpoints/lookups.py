from fastapi import APIRouter, Query
from typing import List, Optional
from pydantic import BaseModel
import uuid
import asyncio
from app.core.config import settings

router = APIRouter()

async def mock_delay():
    if settings.DEBUG:
        await asyncio.sleep(settings.MOCK_API_DELAY_MS / 1000.0)

class LookupItem(BaseModel):
    id: uuid.UUID
    name: str

# Dummy UUIDs to ensure stability during frontend development
DUMMY_CREDENTIAL_PROFILE_ID_1 = uuid.UUID("11111111-1111-1111-1111-111111111111")
DUMMY_CREDENTIAL_PROFILE_ID_2 = uuid.UUID("22222222-2222-2222-2222-222222222222")

DUMMY_POLLING_PROFILE_ID_1 = uuid.UUID("33333333-3333-3333-3333-333333333333")
DUMMY_POLLING_PROFILE_ID_2 = uuid.UUID("44444444-4444-4444-4444-444444444444")

DUMMY_COLLECTOR_ID_1 = uuid.UUID("55555555-5555-5555-5555-555555555555")
DUMMY_COLLECTOR_ID_2 = uuid.UUID("66666666-6666-6666-6666-666666666666")

DUMMY_GROUP_ID_1 = uuid.UUID("77777777-7777-7777-7777-777777777777")
DUMMY_GROUP_ID_2 = uuid.UUID("88888888-8888-8888-8888-888888888888")


@router.get("/credential-profiles", response_model=List[LookupItem])
async def get_credential_profiles():
    """Lightweight lookup API for credential profiles."""
    await mock_delay()
    return [
        LookupItem(id=DUMMY_CREDENTIAL_PROFILE_ID_1, name="Standard SNMPv3 (AuthPriv)"),
        LookupItem(id=DUMMY_CREDENTIAL_PROFILE_ID_2, name="Legacy SNMPv2c (RO)"),
    ]

@router.get("/polling-profiles", response_model=List[LookupItem])
async def get_polling_profiles():
    """Lightweight lookup API for polling profiles."""
    await mock_delay()
    return [
        LookupItem(id=DUMMY_POLLING_PROFILE_ID_1, name="Standard (5min interval, full metrics)"),
        LookupItem(id=DUMMY_POLLING_PROFILE_ID_2, name="Fast (1min interval, interface only)"),
    ]

@router.get("/collectors", response_model=List[LookupItem])
async def get_collectors():
    """Lightweight lookup API for collectors."""
    await mock_delay()
    return [
        LookupItem(id=DUMMY_COLLECTOR_ID_1, name="us-east-collector-01 (Online)"),
        LookupItem(id=DUMMY_COLLECTOR_ID_2, name="eu-west-collector-02 (Online)"),
    ]

@router.get("/device-groups", response_model=List[LookupItem])
async def get_device_groups():
    """Lightweight lookup API for device groups."""
    await mock_delay()
    return [
        LookupItem(id=DUMMY_GROUP_ID_1, name="Core Routers"),
        LookupItem(id=DUMMY_GROUP_ID_2, name="Access Switches"),
    ]

@router.get("/vendors", response_model=List[LookupItem])
async def get_vendors():
    """Lightweight lookup API for vendors."""
    await mock_delay()
    return [
        LookupItem(id=uuid.UUID("b0000000-0000-0000-0000-000000000001"), name="Cisco"),
        LookupItem(id=uuid.UUID("b0000000-0000-0000-0000-000000000002"), name="Juniper"),
        LookupItem(id=uuid.UUID("b0000000-0000-0000-0000-000000000003"), name="Arista"),
        LookupItem(id=uuid.UUID("b0000000-0000-0000-0000-000000000004"), name="Fortinet"),
        LookupItem(id=uuid.UUID("b0000000-0000-0000-0000-000000000005"), name="Mikrotik"),
        LookupItem(id=uuid.UUID("b0000000-0000-0000-0000-000000000006"), name="Huawei"),
    ]

@router.get("/sites", response_model=List[LookupItem])
async def lookup_sites(organization_id: Optional[uuid.UUID] = None):
    """Lightweight lookup API for sites, optionally filtered by organization."""
    await mock_delay()
    # Dummy sites
    return [
        LookupItem(id=uuid.UUID("99999999-9999-9999-9999-999999999999"), name="HQ (New York)"),
        LookupItem(id=uuid.UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), name="Branch (London)"),
    ]
