from client import get_client
from logger import setup_logger

logger = setup_logger()

async def register_or_load_tokens(config):
    logger.info('Attempting registration...')
    async with get_client(config) as client:
        try:
            import uuid
            headers = {'X-Correlation-ID': str(uuid.uuid4())}
            res = await client.post('/api/v1/collectors/register', json={
                'registration_key': config['registration_key'],
                'hostname': config['hostname'],
                'platform': 'linux',
                'python_version': '3.11',
                'collector_version': '1.0.0',
                'machine_id': config['machine_id'],
                'capabilities': ['PING']
            }, headers=headers)
            res.raise_for_status()
            data = res.json()
            return {
                'collector_id': data['collector_id'],
                'access_token': data['access_token'],
                'refresh_token': data['refresh_token']
            }
        except Exception as e:
            logger.error(f'Registration failed: {e}')
            return None