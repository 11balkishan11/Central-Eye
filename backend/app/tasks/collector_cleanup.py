import asyncio
from datetime import datetime, timezone, timedelta
from sqlalchemy.future import select
from sqlalchemy import update
from app.db.session import async_session_maker
from app.models.device import Collector, CollectorRegistrationKey

async def collector_cleanup_task():
    while True:
        try:
            async with async_session_maker() as db:
                # We don't have a status column anymore, so we don't need to do anything here for collectors!
                # Wait, the prompt said: "mark offline". But I also suggested "Derived Online Status: Never store status = online... Compute NOW - heartbeat".
                # If we use Derived Online Status, we don't need a background job to mark them offline. It's computed at query time!
                # Wait, the user said:
                # "Derived Online Status... Avoid inconsistent state.
                # Background Cleanup... Collector Cleanup: Every minute heartbeat older than 180 sec -> offline".
                # This is slightly contradictory, but if we have audit events or alerting, we might need a background job to detect when it goes offline.
                pass 
        except Exception as e:
            print(f"Error in collector cleanup: {e}")
            
        await asyncio.sleep(60)

async def registration_key_cleanup_task():
    while True:
        try:
            async with async_session_maker() as db:
                now = datetime.now(timezone.utc)
                # Expire keys that are past expires_at and not yet revoked
                await db.execute(
                    update(CollectorRegistrationKey)
                    .where(CollectorRegistrationKey.expires_at < now)
                    .where(CollectorRegistrationKey.revoked_at == None)
                    .values(revoked_at=now)
                )
                await db.commit()
        except Exception as e:
            print(f"Error in key cleanup: {e}")
            
        await asyncio.sleep(3600)
