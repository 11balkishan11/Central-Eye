from fastapi import APIRouter
import asyncio
from app.core.config import settings

router = APIRouter()

async def mock_delay():
    if settings.DEBUG:
        await asyncio.sleep(settings.MOCK_API_DELAY_MS / 1000.0)

@router.get("/credential-profiles")
async def get_credential_profiles():
    await mock_delay()
    return [
        {"id": "cred-1", "name": "SSH Default"},
        {"id": "cred-2", "name": "SNMP v3 Core"},
        {"id": "cred-3", "name": "API Token (ReadOnly)"}
    ]

@router.get("/polling-profiles")
async def get_polling_profiles():
    await mock_delay()
    return [
        {"id": "poll-1", "name": "Standard (5m)"},
        {"id": "poll-2", "name": "Aggressive (1m)"},
        {"id": "poll-3", "name": "Relaxed (15m)"}
    ]

@router.get("/collectors")
async def get_collectors():
    await mock_delay()
    return [
        {"id": "coll-1", "name": "Collector-US-East"},
        {"id": "coll-2", "name": "Collector-EU-West"},
        {"id": "coll-3", "name": "Collector-AP-South"}
    ]

@router.get("/device-groups")
async def get_device_groups():
    await mock_delay()
    return [
        {"id": "grp-1", "name": "Core Routers"},
        {"id": "grp-2", "name": "Edge Switches"},
        {"id": "grp-3", "name": "Firewalls"}
    ]

@router.get("/vendors")
async def get_vendors():
    await mock_delay()
    return [
        {"id": "ven-1", "name": "Cisco"},
        {"id": "ven-2", "name": "Juniper"},
        {"id": "ven-3", "name": "Arista"},
        {"id": "ven-4", "name": "Fortinet"},
        {"id": "ven-5", "name": "Mikrotik"},
        {"id": "ven-6", "name": "Huawei"}
    ]

@router.get("/sites")
async def get_sites(organization_id: str = None):
    await mock_delay()
    # Dummy filter just for visual effect if an organization_id is passed
    sites = [
        {"id": "site-1", "name": "Headquarters", "organization_id": "org-1"},
        {"id": "site-2", "name": "Branch Office NY", "organization_id": "org-1"},
        {"id": "site-3", "name": "London Data Center", "organization_id": "org-2"}
    ]
    if organization_id:
        sites = [s for s in sites if s["organization_id"] == organization_id]
    return sites

