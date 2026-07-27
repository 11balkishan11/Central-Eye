import uuid
from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException, status
from datetime import datetime, timezone

from app.models.tenant import Site, SiteStatus, Organization
from app.schemas.site import SiteCreate, SiteUpdate
from app.core.events import event_bus, DomainEvent

class SiteService:
    def __init__(self, db: AsyncSession):
        self.db = db
        
    async def get_by_id(self, site_id: uuid.UUID, org_id: uuid.UUID) -> Site:
        stmt = select(Site).where(
            Site.id == site_id,
            Site.organization_id == org_id,
            Site.deleted_at.is_(None)
        )
        result = await self.db.execute(stmt)
        site = result.scalar_one_or_none()
        if not site:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")
        return site

    async def list_sites(
        self, org_id: uuid.UUID, skip: int = 0, limit: int = 50, search: Optional[str] = None
    ) -> Tuple[List[Site], int]:
        stmt = select(Site).where(
            Site.organization_id == org_id,
            Site.deleted_at.is_(None)
        )
        
        if search:
            stmt = stmt.where(
                (Site.name.ilike(f"%{search}%")) |
                (Site.code.ilike(f"%{search}%"))
            )
            
        count_stmt = select(func.count()).select_from(stmt.subquery())
        count_result = await self.db.execute(count_stmt)
        total = count_result.scalar_one()
        
        stmt = stmt.offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        items = result.scalars().all()
        
        return list(items), total

    async def _verify_organization_active(self, org_id: uuid.UUID) -> None:
        stmt = select(Organization).where(
            Organization.id == org_id,
            Organization.deleted_at.is_(None)
        )
        if not (await self.db.execute(stmt)).scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Parent organization is not active or does not exist")

    async def create_site(self, org_id: uuid.UUID, site_in: SiteCreate, user_id: uuid.UUID) -> Site:
        await self._verify_organization_active(org_id)
        code = site_in.code.lower()
        
        stmt = select(Site).where(
            Site.organization_id == org_id,
            (Site.name == site_in.name) | (Site.code == code)
        )
        existing = (await self.db.execute(stmt)).scalar_one_or_none()
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Site name or code already exists in this organization")

        site = Site(
            organization_id=org_id,
            name=site_in.name,
            code=code,
            timezone=site_in.timezone,
            description=site_in.description,
            created_by=user_id,
            updated_by=user_id,
            status=SiteStatus.active
        )
        self.db.add(site)
        await self.db.flush()
        
        event_bus.publish(DomainEvent(
            event_type="SiteCreated",
            aggregate="Site",
            aggregate_id=site.id,
            actor=user_id,
            payload={"organization_id": str(org_id), "name": site.name}
        ))
        return site

    async def update_site(self, site_id: uuid.UUID, org_id: uuid.UUID, site_in: SiteUpdate, user_id: uuid.UUID) -> Site:
        site = await self.get_by_id(site_id, org_id)
        
        if site_in.code:
            code = site_in.code.lower()
            stmt = select(Site).where(
                Site.organization_id == org_id,
                Site.code == code,
                Site.id != site_id
            )
            if (await self.db.execute(stmt)).scalar_one_or_none():
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Code already in use")
            site.code = code

        if site_in.name:
            stmt = select(Site).where(
                Site.organization_id == org_id,
                Site.name == site_in.name,
                Site.id != site_id
            )
            if (await self.db.execute(stmt)).scalar_one_or_none():
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Name already in use")
            site.name = site_in.name
            
        if site_in.timezone is not None:
            site.timezone = site_in.timezone
        if site_in.description is not None:
            site.description = site_in.description
        if site_in.status:
            site.status = site_in.status
            
        site.updated_by = user_id
        await self.db.flush()
        return site

    async def soft_delete(self, site_id: uuid.UUID, org_id: uuid.UUID, user_id: uuid.UUID, reason: str = "Manual") -> None:
        site = await self.get_by_id(site_id, org_id)
        site.deleted_at = datetime.now(timezone.utc)
        site.deleted_by = user_id
        site.delete_reason = reason
        await self.db.flush()
        
        event_bus.publish(DomainEvent(
            event_type="SiteArchived",
            aggregate="Site",
            aggregate_id=site.id,
            actor=user_id,
            payload={"organization_id": str(org_id), "reason": reason}
        ))

    async def restore(self, site_id: uuid.UUID, org_id: uuid.UUID, user_id: uuid.UUID) -> Site:
        await self._verify_organization_active(org_id)
        
        stmt = select(Site).where(
            Site.id == site_id,
            Site.organization_id == org_id
        )
        site = (await self.db.execute(stmt)).scalar_one_or_none()
        if not site or site.deleted_at is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deleted site not found")
            
        conflict_stmt = select(Site).where(
            Site.organization_id == org_id,
            Site.deleted_at.is_(None),
            (Site.name == site.name) | (Site.code == site.code)
        )
        if (await self.db.execute(conflict_stmt)).scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, 
                detail="Cannot restore: An active site with this name or code already exists."
            )
            
        site.deleted_at = None
        site.deleted_by = None
        site.delete_reason = None
        site.restored_at = datetime.now(timezone.utc)
        site.restored_by = user_id
        
        await self.db.flush()
        
        event_bus.publish(DomainEvent(
            event_type="SiteRestored",
            aggregate="Site",
            aggregate_id=site.id,
            actor=user_id,
            payload={"organization_id": str(org_id)}
        ))
        return site
