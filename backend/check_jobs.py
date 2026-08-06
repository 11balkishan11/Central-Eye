import asyncio
from sqlalchemy import select
from app.db.session import async_session_maker
from app.models.device import Device

async def main():
    async with async_session_maker() as session:
        res = await session.execute(select(Device).limit(5))
        devices = res.scalars().all()
        for d in devices:
            print(f"Device: {d.management_ip}, Status: {d.oper_state.name if d.oper_state else 'Unknown'}, Last Seen: {d.last_seen}")

asyncio.run(main())
