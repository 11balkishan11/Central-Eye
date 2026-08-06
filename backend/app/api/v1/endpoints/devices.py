import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.auth.dependencies import get_current_user
from app.auth.authorization_dependencies import RequirePermission, extract_tenant_id
from app.db.session import get_db
from app.models.user import User
from app.schemas.device import (
    DeviceProvisionRequest, DeviceResponse, DeviceListResponse,
    DeviceLifecycleUpdate, DeviceAdminStateUpdate,
)
from app.services.device_service import DeviceService
from app.core.events import event_bus

router = APIRouter()

def get_device_service(
    db: AsyncSession = Depends(get_db),
) -> DeviceService:
    return DeviceService(db, event_bus)

# --- Provision ---
@router.post("/provision", response_model=DeviceResponse, status_code=status.HTTP_201_CREATED)
async def provision_device(
    request: DeviceProvisionRequest,
    tenant_id: uuid.UUID = Depends(extract_tenant_id),
    current_user: User = Depends(get_current_user),
    device_service: DeviceService = Depends(get_device_service),
    _=Depends(RequirePermission("devices:create"))
):
    device = await device_service.provision_device(
        tenant_id=tenant_id,
        site_id=request.site_id,
        group_id=request.group_id,
        hostname=request.hostname,
        management_ip=request.management_ip,
        actor_id=current_user.id,
    )
    return DeviceResponse.model_validate(device)

# --- List ---
@router.get("", response_model=DeviceListResponse)
async def list_devices(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    site_id: Optional[uuid.UUID] = Query(None),
    tenant_id: uuid.UUID = Depends(extract_tenant_id),
    current_user: User = Depends(get_current_user),
    device_service: DeviceService = Depends(get_device_service),
    _=Depends(RequirePermission("devices:read"))
):
    items, total = await device_service.list_devices(
        tenant_id=tenant_id,
        skip=skip,
        limit=limit,
        site_id=site_id
    )
    response_items = [DeviceResponse.model_validate(item) for item in items]
    return DeviceListResponse(items=response_items, total=total, skip=skip, limit=limit)

# --- Get by ID ---
@router.get("/{device_id}", response_model=DeviceResponse)
async def get_device(
    device_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(extract_tenant_id),
    current_user: User = Depends(get_current_user),
    device_service: DeviceService = Depends(get_device_service),
    _=Depends(RequirePermission("devices:read"))
):
    device = await device_service.get_device(device_id, tenant_id)
    return DeviceResponse.model_validate(device)

# --- Soft Delete ---
@router.delete("/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_device(
    device_id: uuid.UUID,
    reason: str = Query("Manual", description="Reason for deletion"),
    tenant_id: uuid.UUID = Depends(extract_tenant_id),
    current_user: User = Depends(get_current_user),
    device_service: DeviceService = Depends(get_device_service),
    _=Depends(RequirePermission("devices:delete"))
):
    await device_service.soft_delete(device_id, tenant_id, current_user.id, reason)

# --- Restore ---
@router.post("/{device_id}/restore", response_model=DeviceResponse)
async def restore_device(
    device_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(extract_tenant_id),
    current_user: User = Depends(get_current_user),
    device_service: DeviceService = Depends(get_device_service),
    _=Depends(RequirePermission("devices:restore"))
):
    device = await device_service.restore(device_id, tenant_id, current_user.id)
    return DeviceResponse.model_validate(device)

# --- Lifecycle Transition ---
@router.patch("/{device_id}/lifecycle", response_model=DeviceResponse)
async def update_device_lifecycle(
    device_id: uuid.UUID,
    body: DeviceLifecycleUpdate,
    tenant_id: uuid.UUID = Depends(extract_tenant_id),
    current_user: User = Depends(get_current_user),
    device_service: DeviceService = Depends(get_device_service),
    _=Depends(RequirePermission("devices:update"))
):
    device = await device_service.update_lifecycle(
        device_id, tenant_id, body.lifecycle_state, current_user.id
    )
    return DeviceResponse.model_validate(device)

# --- Administrative State ---
@router.patch("/{device_id}/administrative-state", response_model=DeviceResponse)
async def update_device_admin_state(
    device_id: uuid.UUID,
    body: DeviceAdminStateUpdate,
    tenant_id: uuid.UUID = Depends(extract_tenant_id),
    current_user: User = Depends(get_current_user),
    device_service: DeviceService = Depends(get_device_service),
    _=Depends(RequirePermission("devices:update"))
):
    device = await device_service.update_admin_state(
        device_id, tenant_id, body.admin_state, current_user.id
    )
    return DeviceResponse.model_validate(device)
