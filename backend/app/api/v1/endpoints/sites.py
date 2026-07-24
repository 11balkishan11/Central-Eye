import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.auth.dependencies import get_current_user
from app.auth.authorization_dependencies import RequirePermission
from app.models.user import User
from app.schemas.site import (
    SiteCreate, SiteUpdate, SiteStatusUpdate, 
    SiteResponse, SiteListResponse
)
from app.services.site_service import SiteService

router = APIRouter()

def get_site_service(db: AsyncSession = Depends(get_db)) -> SiteService:
    return SiteService(db)

@router.post("", response_model=SiteResponse, status_code=status.HTTP_201_CREATED)
async def create_site(
    org_id: uuid.UUID,
    site_in: SiteCreate,
    current_user: User = Depends(get_current_user),
    site_service: SiteService = Depends(get_site_service),
    _=Depends(RequirePermission("sites:create"))
):
    return await site_service.create_site(org_id, site_in, current_user.id)

@router.get("", response_model=SiteListResponse)
async def list_sites(
    org_id: uuid.UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    site_service: SiteService = Depends(get_site_service),
    _=Depends(RequirePermission("sites:read"))
):
    items, total = await site_service.list_sites(org_id, skip, limit, search)
    response_items = [SiteResponse.model_validate(item) for item in items]
    return SiteListResponse(items=response_items, total=total, skip=skip, limit=limit)

@router.get("/{site_id}", response_model=SiteResponse)
async def get_site(
    org_id: uuid.UUID,
    site_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    site_service: SiteService = Depends(get_site_service),
    _=Depends(RequirePermission("sites:read"))
):
    return await site_service.get_by_id(site_id, org_id)

@router.patch("/{site_id}", response_model=SiteResponse)
async def update_site(
    org_id: uuid.UUID,
    site_id: uuid.UUID,
    site_in: SiteUpdate,
    current_user: User = Depends(get_current_user),
    site_service: SiteService = Depends(get_site_service),
    _=Depends(RequirePermission("sites:update"))
):
    return await site_service.update_site(site_id, org_id, site_in, current_user.id)

@router.patch("/{site_id}/status", response_model=SiteResponse)
async def update_site_status(
    org_id: uuid.UUID,
    site_id: uuid.UUID,
    status_update: SiteStatusUpdate,
    current_user: User = Depends(get_current_user),
    site_service: SiteService = Depends(get_site_service),
    _=Depends(RequirePermission("sites:update"))
):
    site_in = SiteUpdate(status=status_update.status)
    return await site_service.update_site(site_id, org_id, site_in, current_user.id)

@router.delete("/{site_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_site(
    org_id: uuid.UUID,
    site_id: uuid.UUID,
    reason: str = Query("Manual", description="Reason for deletion"),
    current_user: User = Depends(get_current_user),
    site_service: SiteService = Depends(get_site_service),
    _=Depends(RequirePermission("sites:delete"))
):
    await site_service.soft_delete(site_id, org_id, current_user.id, reason)

@router.post("/{site_id}/restore", response_model=SiteResponse)
async def restore_site(
    org_id: uuid.UUID,
    site_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    site_service: SiteService = Depends(get_site_service),
    _=Depends(RequirePermission("sites:restore"))
):
    return await site_service.restore(site_id, org_id, current_user.id)
