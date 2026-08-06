from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, or_, and_
from uuid import UUID
import uuid
from datetime import datetime, timezone, timedelta
from typing import cast, Dict, Any
from fastapi import HTTPException

from app.models.device import Collector
from app.models.job import CollectorJob, JobStatus, JobType, CollectorEvent, CollectorEventType
from app.schemas.jobs import (
    JobPullRequest, JobPullResponse, JobDefinition,
    JobStartRequest, JobCompleteRequest, JobFailRequest, JobGenericResponse
)
from app.schemas.collector import CollectorRead

class CollectorService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def pull_jobs(self, collector: Collector, request: JobPullRequest, correlation_id: str | None = None) -> JobPullResponse:
        # Update load explicitly during job pull
        collector.capacity_percent = float(100 - request.available_capacity)
        
        # We will attempt to lease up to `request.available_capacity` jobs
        now = datetime.now(timezone.utc)
        
        # Build query
        stmt = select(CollectorJob).where(
            CollectorJob.tenant_id == collector.tenant_id,
            or_(
                CollectorJob.status == JobStatus.PENDING,
                and_(CollectorJob.status == JobStatus.LEASED, CollectorJob.lease_expires_at < now)
            )
        )
        
        if collector.site_id:
            stmt = stmt.where(
                or_(
                    CollectorJob.site_id == collector.site_id,
                    CollectorJob.site_id == None
                )
            )
            
        stmt = stmt.order_by(CollectorJob.priority.desc(), CollectorJob.scheduled_at.asc()).limit(request.available_capacity)
        
        result = await self.db.execute(stmt)
        jobs_to_lease = result.scalars().all()
        
        job_definitions = []
        for job in jobs_to_lease:
            lease_token = str(uuid.uuid4())
            job.status = JobStatus.LEASED
            job.assigned_collector_id = collector.id
            job.leased_by = collector.machine_id
            job.lease_token = lease_token
            job.lease_expires_at = now + timedelta(minutes=2)
            
            job_definitions.append(JobDefinition(
                job_id=job.id,
                type=job.type.value,
                payload=cast(Dict[str, Any], job.payload),
                lease_token=lease_token,
                lease_expires_at=cast(datetime, job.lease_expires_at)
            ))
            
            event = CollectorEvent(
                tenant_id=collector.tenant_id,
                collector_id=collector.id,
                event_type=CollectorEventType.JOB_LEASED,
                correlation_id=correlation_id,
                details={"job_id": str(job.id)}
            )
            self.db.add(event)
            
        await self.db.commit()
        
        return JobPullResponse(jobs=job_definitions)

    async def start_job(self, collector: Collector, job_id: UUID, request: JobStartRequest, correlation_id: str | None = None, idempotency_key: str | None = None) -> JobGenericResponse:
        job = await self.db.get(CollectorJob, job_id)
        if not job or job.lease_token != request.lease_token:
            raise HTTPException(status_code=403, detail="Invalid lease token")
            
        if job.status == JobStatus.RUNNING:
            return JobGenericResponse(success=True, message="Already running")
            
        job.status = JobStatus.RUNNING
        job.started_at = datetime.now(timezone.utc)
        job.attempts += 1
        
        event = CollectorEvent(
            tenant_id=collector.tenant_id,
            collector_id=collector.id,
            event_type=CollectorEventType.JOB_STARTED,
            correlation_id=correlation_id,
            details={"job_id": str(job.id), "idempotency_key": idempotency_key}
        )
        self.db.add(event)
        
        await self.db.commit()
        return JobGenericResponse(success=True, message="Job started")

    async def complete_job(self, collector: Collector, job_id: UUID, request: JobCompleteRequest, correlation_id: str | None = None, idempotency_key: str | None = None) -> JobGenericResponse:
        job = await self.db.get(CollectorJob, job_id)
        if not job or job.lease_token != request.lease_token:
            raise HTTPException(status_code=403, detail="Invalid lease token")
            
        if job.status == JobStatus.COMPLETED:
            return JobGenericResponse(success=True, message="Already completed (idempotent)")
            
        job.status = JobStatus.COMPLETED
        job.finished_at = datetime.now(timezone.utc)
        job.result = request.result
        
        if job.type == JobType.ICMP_PING:
            device_id_str = cast(Dict[str, Any], job.payload).get("device_id")
            if device_id_str:
                try:
                    device_id_obj = UUID(device_id_str)
                    from app.models.device import Device, DeviceOperState
                    device = await self.db.get(Device, device_id_obj)
                    if device:
                        if request.result and request.result.get("status") == "up":
                            device.oper_state = DeviceOperState.up
                            device.last_seen = datetime.now(timezone.utc)
                        else:
                            device.oper_state = DeviceOperState.down
                except ValueError:
                    pass
        
        event = CollectorEvent(
            tenant_id=collector.tenant_id,
            collector_id=collector.id,
            event_type=CollectorEventType.JOB_COMPLETED,
            correlation_id=correlation_id,
            details={"job_id": str(job.id), "idempotency_key": idempotency_key}
        )
        self.db.add(event)
        
        await self.db.commit()
        return JobGenericResponse(success=True, message="Job completed")

    async def fail_job(self, collector: Collector, job_id: UUID, request: JobFailRequest, correlation_id: str | None = None, idempotency_key: str | None = None) -> JobGenericResponse:
        job = await self.db.get(CollectorJob, job_id)
        if not job or job.lease_token != request.lease_token:
            raise HTTPException(status_code=403, detail="Invalid lease token")
            
        if job.status == JobStatus.FAILED:
            return JobGenericResponse(success=True, message="Already failed (idempotent)")
            
        if job.attempts >= job.max_attempts:
            job.status = JobStatus.FAILED
        else:
            job.status = JobStatus.PENDING # Return to queue
            job.assigned_collector_id = None
            job.leased_by = None
            job.lease_token = None
            job.scheduled_at = datetime.now(timezone.utc) + timedelta(minutes=1) # Backoff
            
        job.error_message = request.error_message
        
        event = CollectorEvent(
            tenant_id=collector.tenant_id,
            collector_id=collector.id,
            event_type=CollectorEventType.JOB_FAILED,
            correlation_id=correlation_id,
            details={"job_id": str(job.id), "idempotency_key": idempotency_key, "error": request.error_message}
        )
        self.db.add(event)
        
        await self.db.commit()
        return JobGenericResponse(success=True, message="Job marked as failed")

    async def list_collectors(self, tenant_id: UUID) -> list[CollectorRead]:
        result = await self.db.execute(
            select(Collector).where(Collector.tenant_id == tenant_id)
        )
        return list(result.scalars().all())
