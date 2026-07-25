import asyncio
import uuid
from client import get_client
from logger import setup_logger

logger = setup_logger()

async def execute_job(config, tokens, job):
    collector_id = tokens['collector_id']
    access_token = tokens['access_token']
    job_id = job['job_id']
    lease_token = job['lease_token']
    
    # 1. Start Job
    try:
        async with get_client(config) as client:
            headers = {
                'Authorization': f'Bearer {access_token}',
                'X-Correlation-ID': str(uuid.uuid4()),
                'Idempotency-Key': str(uuid.uuid4())
            }
            res = await client.post(f'/api/v1/collectors/{collector_id}/jobs/{job_id}/start', json={
                'lease_token': lease_token
            }, headers=headers)
            res.raise_for_status()
            logger.info(f'Job {job_id} started.')
    except Exception as e:
        logger.error(f'Failed to start job {job_id}: {e}')
        return
        
    # Simulate execution
    await asyncio.sleep(1)
    result_data = {"status": "ok", "latency_ms": 12}
    
    # 2. Complete Job
    try:
        async with get_client(config) as client:
            headers = {
                'Authorization': f'Bearer {access_token}',
                'X-Correlation-ID': str(uuid.uuid4()),
                'Idempotency-Key': str(uuid.uuid4())
            }
            res = await client.post(f'/api/v1/collectors/{collector_id}/jobs/{job_id}/complete', json={
                'lease_token': lease_token,
                'result': result_data
            }, headers=headers)
            res.raise_for_status()
            logger.info(f'Job {job_id} completed successfully.')
    except Exception as e:
        logger.error(f'Failed to complete job {job_id}: {e}')

async def jobs_loop(config, tokens):
    collector_id = tokens['collector_id']
    access_token = tokens['access_token']
    
    while True:
        try:
            async with get_client(config) as client:
                headers = {
                    'Authorization': f'Bearer {access_token}',
                    'X-Correlation-ID': str(uuid.uuid4())
                }
                res = await client.post(f'/api/v1/collectors/{collector_id}/jobs/pull', json={
                    'available_capacity': 10,
                    'capabilities': ['PING']
                }, headers=headers)
                res.raise_for_status()
                
                jobs = res.json().get('jobs', [])
                if jobs:
                    logger.info(f'Leased {len(jobs)} jobs.')
                    for job in jobs:
                        asyncio.create_task(execute_job(config, tokens, job))
                else:
                    logger.debug('Job pull successful. 0 jobs available.')
                    
        except Exception as e:
            logger.error(f'Job pull failed: {e}')
            
        await asyncio.sleep(10)