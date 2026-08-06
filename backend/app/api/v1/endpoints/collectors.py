from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional

from app.db.session import get_db
from app.auth.authorization_dependencies import RequirePermission, extract_tenant_id
from app.schemas.collector import CollectorRead
from app.schemas.registration import RegistrationRequest, RegistrationResponse
from app.schemas.heartbeat import HeartbeatRequest, HeartbeatResponse
from app.schemas.jobs import (
    JobPullRequest, JobPullResponse, JobStartRequest, 
    JobCompleteRequest, JobFailRequest, JobGenericResponse
)
from app.services.registration_service import RegistrationService
from app.services.heartbeat_service import HeartbeatService
from app.services.collector_service import CollectorService
from app.auth.collector_dependencies import get_current_collector
from app.models.device import Collector

router = APIRouter()

@router.post("/register", response_model=RegistrationResponse)
async def register_collector(
    request: RegistrationRequest,
    db: AsyncSession = Depends(get_db),
    x_correlation_id: Optional[str] = Header(None)
):
    service = RegistrationService(db)
    return await service.register_collector(request, x_correlation_id)

@router.post("/refresh", response_model=dict)
async def refresh_collector_token(
    refresh_token: dict,
    db: AsyncSession = Depends(get_db),
    x_correlation_id: Optional[str] = Header(None)
):
    service = RegistrationService(db)
    token_str = refresh_token.get("refresh_token")
    if not token_str:
        raise HTTPException(status_code=400, detail="Missing refresh_token")
    return await service.refresh_token(token_str, x_correlation_id)

@router.post("/{collector_id}/heartbeat", response_model=HeartbeatResponse)
async def collector_heartbeat(
    collector_id: UUID,
    request: HeartbeatRequest,
    db: AsyncSession = Depends(get_db),
    collector: Collector = Depends(get_current_collector),
    x_correlation_id: Optional[str] = Header(None)
):
    if str(collector.id) != str(collector_id):
        raise HTTPException(status_code=403, detail="Not authorized to heartbeat for this collector")
    service = HeartbeatService(db)
    return await service.process_heartbeat(collector, request, x_correlation_id)

@router.post("/{collector_id}/jobs/pull", response_model=JobPullResponse)
async def pull_jobs(
    collector_id: UUID,
    request: JobPullRequest,
    db: AsyncSession = Depends(get_db),
    collector: Collector = Depends(get_current_collector),
    x_correlation_id: Optional[str] = Header(None)
):
    if str(collector.id) != str(collector_id):
        raise HTTPException(status_code=403, detail="Not authorized to pull jobs for this collector")
    service = CollectorService(db)
    return await service.pull_jobs(collector, request, x_correlation_id)

@router.post("/{collector_id}/jobs/{job_id}/start", response_model=JobGenericResponse)
async def start_job(
    collector_id: UUID,
    job_id: UUID,
    request: JobStartRequest,
    db: AsyncSession = Depends(get_db),
    collector: Collector = Depends(get_current_collector),
    x_correlation_id: Optional[str] = Header(None),
    idempotency_key: Optional[str] = Header(None)
):
    if str(collector.id) != str(collector_id):
        raise HTTPException(status_code=403, detail="Not authorized")
    service = CollectorService(db)
    return await service.start_job(collector, job_id, request, x_correlation_id, idempotency_key)

@router.post("/{collector_id}/jobs/{job_id}/complete", response_model=JobGenericResponse)
async def complete_job(
    collector_id: UUID,
    job_id: UUID,
    request: JobCompleteRequest,
    db: AsyncSession = Depends(get_db),
    collector: Collector = Depends(get_current_collector),
    x_correlation_id: Optional[str] = Header(None),
    idempotency_key: Optional[str] = Header(None)
):
    if str(collector.id) != str(collector_id):
        raise HTTPException(status_code=403, detail="Not authorized")
    service = CollectorService(db)
    return await service.complete_job(collector, job_id, request, x_correlation_id, idempotency_key)

@router.post("/{collector_id}/jobs/{job_id}/fail", response_model=JobGenericResponse)
async def fail_job(
    collector_id: UUID,
    job_id: UUID,
    request: JobFailRequest,
    db: AsyncSession = Depends(get_db),
    collector: Collector = Depends(get_current_collector),
    x_correlation_id: Optional[str] = Header(None),
    idempotency_key: Optional[str] = Header(None)
):
    if str(collector.id) != str(collector_id):
        raise HTTPException(status_code=403, detail="Not authorized")
    service = CollectorService(db)
    return await service.fail_job(collector, job_id, request, x_correlation_id, idempotency_key)

@router.get("/", response_model=list[CollectorRead])
async def list_collectors(
    db: AsyncSession = Depends(get_db),
    tenant_id: UUID = Depends(extract_tenant_id),
    current_user = Depends(RequirePermission("collectors:read"))
):
    service = CollectorService(db)
    return await service.list_collectors(tenant_id)
