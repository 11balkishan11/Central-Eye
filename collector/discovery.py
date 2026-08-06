import asyncio
import uuid
import random
from datetime import datetime
from client import get_client
from logger import setup_logger

logger = setup_logger()

# Hardcoded initial mock network to discover
MOCK_DEVICES = [
    {
        "source_type": "snmp",
        "resource_hint": "10.0.0.1",
        "payload": {
            "hostname": "HQ-CoreSW-01",
            "vendor": "Cisco",
            "os_version": "17.3.4",
            "mac": "00:1A:2B:3C:4D:5E",
            "ip": "10.0.0.1",
            "cpu": 25,
            "memory": 60,
            "neighbors": ["10.0.0.2", "10.0.0.3"]
        }
    },
    {
        "source_type": "snmp",
        "resource_hint": "10.0.0.2",
        "payload": {
            "hostname": "HQ-AccessSW-01",
            "vendor": "Cisco",
            "os_version": "17.2.1",
            "mac": "00:1A:2B:3C:4D:5F",
            "ip": "10.0.0.2",
            "cpu": 15,
            "memory": 45,
            "neighbors": ["10.0.0.1"]
        }
    },
    {
        "source_type": "snmp",
        "resource_hint": "10.0.0.3",
        "payload": {
            "hostname": "HQ-Firewall-01",
            "vendor": "Palo Alto",
            "os_version": "10.1.2",
            "mac": "00:1A:2B:3C:4D:60",
            "ip": "10.0.0.3",
            "cpu": 40,
            "memory": 80,
            "neighbors": ["10.0.0.1"]
        }
    }
]

async def send_observation(config, tokens, device):
    collector_id = tokens['collector_id']
    access_token = tokens['access_token']
    tenant_id = tokens.get('tenant_id', '00000000-0000-0000-0000-000000000000') # MVP hack
    
    # Simulate slight fluctuation in CPU
    if "cpu" in device["payload"]:
        device["payload"]["cpu"] = max(0, min(100, device["payload"]["cpu"] + random.randint(-5, 5)))

    obs_data = {
        "collector_id": collector_id,
        "source_type": device["source_type"],
        "resource_hint": device["resource_hint"],
        "payload": device["payload"],
        "tenant_id": tenant_id
    }
    
    try:
        async with get_client(config) as client:
            headers = {
                'Authorization': f'Bearer {access_token}',
                'X-Correlation-ID': str(uuid.uuid4())
            }
            res = await client.post('/api/v1/observations/', json=obs_data, headers=headers)
            res.raise_for_status()
            logger.info(f"Sent observation for {device['resource_hint']}")
    except Exception as e:
        logger.error(f"Failed to send observation for {device['resource_hint']}: {e}")

async def discovery_loop(config, tokens):
    logger.info("Starting Discovery Loop...")
    # Add a mock tenant_id to tokens since collector auth doesn't currently retrieve it easily for the MVP
    # In a real scenario, the backend auth would associate the collector with a tenant automatically.
    # We will hardcode a valid tenant ID later or rely on the backend to set it.
    # Wait, the observation schema requires tenant_id. We'll grab the first tenant from backend if possible.
    
    # For MVP, hardcode a valid tenant ID that exists in the database
    tokens['tenant_id'] = "7a27e915-bb78-4d54-8259-4b9ce5993373"
    logger.info(f"Using tenant_id {tokens['tenant_id']} for observations.")

    while True:
        if 'tenant_id' in tokens:
            for device in MOCK_DEVICES:
                asyncio.create_task(send_observation(config, tokens, device))
        else:
            logger.warning("Skipping discovery due to missing tenant_id")
            
        await asyncio.sleep(15) # Send observations every 15 seconds
