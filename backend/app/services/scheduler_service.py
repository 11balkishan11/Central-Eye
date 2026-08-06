import asyncio
import logging
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from app.db.session import async_session_maker
from app.models.device import Device
from app.models.job import CollectorJob, JobType, JobStatus

logger = logging.getLogger(__name__)

class SchedulerService:
    def __init__(self):
        self._running = False
        self._task = None
        self._poll_interval = 15 # seconds
        self._ping_interval_seconds = 60 # MVP default

    async def start(self):
        if not self._running:
            self._running = True
            self._task = asyncio.create_task(self._loop())
            print("SchedulerService started.")
            logger.info("SchedulerService started.")
            logger.info("SchedulerService started.")
            logger.info("SchedulerService started.")

    async def stop(self):
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
            logger.info("SchedulerService stopped.")

    async def _loop(self):
        while self._running:
            print("Scheduler loop running...")
            try:
                await self._schedule_jobs()
            except Exception as e:
                logger.error(f"Error in scheduler loop: {e}", exc_info=True)
            await asyncio.sleep(self._poll_interval)

    async def _schedule_jobs(self):
        async with async_session_maker() as db:
            now = datetime.now(timezone.utc)
            
            # Fetch all active devices that support ICMP
            stmt = select(Device).where(
                Device.deleted_at.is_(None),
                Device.supports_icmp.is_(True)
            )
            result = await db.execute(stmt)
            devices = result.scalars().all()
            print(f"Scheduler: Found {len(devices)} active devices supporting ICMP")
            print(f"Scheduler: Found {len(devices)} active devices supporting ICMP")
            
            for device in devices:
                # Check for an active ICMP job
                # NOTE: JSONB operator in SQLAlchemy: payload->>'device_id' == str(device.id)
                active_job_stmt = select(CollectorJob).where(
                    CollectorJob.tenant_id == device.tenant_id,
                    CollectorJob.type == JobType.ICMP_PING,
                    CollectorJob.payload.op("->>")("device_id") == str(device.id),
                    CollectorJob.status.in_([JobStatus.PENDING, JobStatus.LEASED, JobStatus.RUNNING])
                )
                active_job = (await db.execute(active_job_stmt)).scalar_one_or_none()
                
                if not active_job:
                    # Check last scheduled job
                    last_job_stmt = select(CollectorJob).where(
                        CollectorJob.tenant_id == device.tenant_id,
                        CollectorJob.type == JobType.ICMP_PING,
                        CollectorJob.payload.op("->>")("device_id") == str(device.id)
                    ).order_by(CollectorJob.created_at.desc()).limit(1)
                    
                    last_job = (await db.execute(last_job_stmt)).scalar_one_or_none()
                    
                    if not last_job or (now - last_job.created_at) > timedelta(seconds=self._ping_interval_seconds):
                        # Create new job
                        new_job = CollectorJob(
                            tenant_id=device.tenant_id,
                            site_id=device.site_id,
                            type=JobType.ICMP_PING,
                            status=JobStatus.PENDING,
                            payload={
                                "device_id": str(device.id),
                                "target_ip": str(device.management_ip)
                            }
                        )
                        db.add(new_job)
                        print(f"Scheduled ICMP_PING for device {device.id} ({device.management_ip})")
                        logger.info(f"Scheduled ICMP_PING for device {device.id} ({device.management_ip})")
                        logger.info(f"Scheduled ICMP_PING for device {device.id} ({device.management_ip})")
                        logger.info(f"Scheduled ICMP_PING for device {device.id} ({device.management_ip})")
            
            await db.commit()

scheduler = SchedulerService()
