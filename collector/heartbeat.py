import asyncio
from client import get_client
from logger import setup_logger

logger = setup_logger()

async def heartbeat_loop(config, tokens):
    collector_id = tokens['collector_id']
    access_token = tokens['access_token']
    
    while True:
        try:
            import uuid
            async with get_client(config) as client:
                headers = {
                    'Authorization': f'Bearer {access_token}',
                    'X-Correlation-ID': str(uuid.uuid4())
                }
                res = await client.post(f'/api/v1/collectors/{collector_id}/heartbeat', json={
                    'cpu_percent': 12.5,
                    'memory_mb_used': 1024,
                    'uptime_seconds': 3600,
                    'active_threads': 4,
                    'current_jobs': 0,
                    'ip_addresses': ['192.168.1.100']
                }, headers=headers)
                res.raise_for_status()
                logger.info('Heartbeat sent successfully.')
        except Exception as e:
            logger.error(f'Heartbeat failed: {e}')
            
        await asyncio.sleep(60)