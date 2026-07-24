import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.auth.dependencies import get_current_user
from app.auth.authorization_dependencies import RequirePermission, extract_tenant_id
from app.models.user import User
from app.schemas.organization import (
    OrganizationCreate, OrganizationUpdate, OrganizationStatusUpdate, 
    OrganizationResponse, OrganizationListResponse
)
from app.services.organization_service import OrganizationService

router = APIRouter()

def get_org_service(db: AsyncSession = Depends(get_db)) -> OrganizationService:
    return OrganizationService(db)

@router.post("", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(
    org_in: OrganizationCreate,
    tenant_id: uuid.UUID = Depends(extract_tenant_id),
    current_user: User = Depends(get_current_user),
    org_service: OrganizationService = Depends(get_org_service),
    _=Depends(RequirePermission("organizations:create"))
):
    return await org_service.create_organization(tenant_id, org_in, current_user.id)

@router.get("", response_model=OrganizationListResponse)
async def list_organizations(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = None,
    tenant_id: uuid.UUID = Depends(extract_tenant_id),
    current_user: User = Depends(get_current_user),
    org_service: OrganizationService = Depends(get_org_service),
    _=Depends(RequirePermission("organizations:read"))
):
    items, total = await org_service.list_organizations(tenant_id, skip, limit, search)
    response_items = [OrganizationResponse.model_validate(item) for item in items]
    return OrganizationListResponse(items=response_items, total=total, skip=skip, limit=limit)

@router.get("/{org_id}", response_model=OrganizationResponse)
async def get_organization(
    org_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(extract_tenant_id),
    current_user: User = Depends(get_current_user),
    org_service: OrganizationService = Depends(get_org_service),
    _=Depends(RequirePermission("organizations:read"))
):
    return await org_service.get_by_id(org_id, tenant_id)

@router.patch("/{org_id}", response_model=OrganizationResponse)
async def update_organization(
    org_id: uuid.UUID,
    org_in: OrganizationUpdate,
    tenant_id: uuid.UUID = Depends(extract_tenant_id),
    current_user: User = Depends(get_current_user),
    org_service: OrganizationService = Depends(get_org_service),
    _=Depends(RequirePermission("organizations:update"))
):
    return await org_service.update_organization(org_id, tenant_id, org_in, current_user.id)

@router.patch("/{org_id}/status", response_model=OrganizationResponse)
async def update_organization_status(
    org_id: uuid.UUID,
    status_update: OrganizationStatusUpdate,
    tenant_id: uuid.UUID = Depends(extract_tenant_id),
    current_user: User = Depends(get_current_user),
    org_service: OrganizationService = Depends(get_org_service),
    _=Depends(RequirePermission("organizations:update"))
):
    org_in = OrganizationUpdate(status=status_update.status)
    return await org_service.update_organization(org_id, tenant_id, org_in, current_user.id)

@router.delete("/{org_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_organization(
    org_id: uuid.UUID,
    reason: str = Query("Manual", description="Reason for deletion"),
    tenant_id: uuid.UUID = Depends(extract_tenant_id),
    current_user: User = Depends(get_current_user),
    org_service: OrganizationService = Depends(get_org_service),
    _=Depends(RequirePermission("organizations:delete"))
):
    await org_service.soft_delete(org_id, tenant_id, current_user.id, reason)

@router.post("/{org_id}/restore", response_model=OrganizationResponse)
async def restore_organization(
    org_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(extract_tenant_id),
    current_user: User = Depends(get_current_user),
    org_service: OrganizationService = Depends(get_org_service),
    _=Depends(RequirePermission("organizations:restore"))
):
    return await org_service.restore(org_id, tenant_id, current_user.id)
