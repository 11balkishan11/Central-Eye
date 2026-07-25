import asyncio
from logger import setup_logger
from config import load_config
from auth import register_or_load_tokens
from heartbeat import heartbeat_loop
from jobs import jobs_loop

logger = setup_logger()

async def main():
    logger.info('Starting NS3 Collector Daemon...')
    config = load_config()
    
    # Authenticate / Register
    tokens = await register_or_load_tokens(config)
    if not tokens:
        logger.error('Fatal: Could not authenticate.')
        return
        
    logger.info('Authenticated successfully.')
    
    # Start tasks
    tasks = [
        asyncio.create_task(heartbeat_loop(config, tokens)),
        asyncio.create_task(jobs_loop(config, tokens))
    ]
    
    await asyncio.gather(*tasks)

if __name__ == '__main__':
    asyncio.run(main())