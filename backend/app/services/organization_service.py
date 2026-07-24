import uuid
from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException, status
from datetime import datetime

from app.models.tenant import Organization, OrganizationStatus
from app.schemas.organization import OrganizationCreate, OrganizationUpdate
from app.core.events import event_bus, DomainEvent

class OrganizationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        
    def _validate_slug(self, slug: str):
        reserved = {'admin', 'api', 'system', 'root', 'login', 'auth', 'settings', 'docs', 'swagger', 'redoc', 'graphql', 'metrics', 'health', 'robots.txt', 'favicon.ico'}
        if slug.lower() in reserved:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Slug '{slug}' is reserved."
            )

    async def get_by_id(self, org_id: uuid.UUID, tenant_id: uuid.UUID) -> Organization:
        stmt = select(Organization).where(
            Organization.id == org_id,
            Organization.tenant_id == tenant_id,
            Organization.deleted_at.is_(None)
        )
        result = await self.db.execute(stmt)
        org = result.scalar_one_or_none()
        if not org:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
        return org

    async def list_organizations(
        self, tenant_id: uuid.UUID, skip: int = 0, limit: int = 50, search: Optional[str] = None
    ) -> Tuple[List[Organization], int]:
        stmt = select(Organization).where(
            Organization.tenant_id == tenant_id,
            Organization.deleted_at.is_(None)
        )
        
        if search:
            stmt = stmt.where(
                (Organization.name.ilike(f"%{search}%")) |
                (Organization.slug.ilike(f"%{search}%"))
            )
            
        # Get count
        count_stmt = select(func.count()).select_from(stmt.subquery())
        count_result = await self.db.execute(count_stmt)
        total = count_result.scalar_one()
        
        # Get items
        stmt = stmt.offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        items = result.scalars().all()
        
        return list(items), total

    async def create_organization(self, tenant_id: uuid.UUID, org_in: OrganizationCreate, user_id: uuid.UUID) -> Organization:
        slug = org_in.slug.lower()
        self._validate_slug(slug)
        
        # Check uniqueness active only or global? Uniqueness constraint handles it, but let's pre-check active for better errors
        stmt = select(Organization).where(
            Organization.tenant_id == tenant_id,
            (Organization.name == org_in.name) | (Organization.slug == slug)
        )
        result = await self.db.execute(stmt)
        existing = result.scalar_one_or_none()
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Organization name or slug already exists in this tenant")

        org = Organization(
            tenant_id=tenant_id,
            name=org_in.name,
            slug=slug,
            description=org_in.description,
            created_by=user_id,
            updated_by=user_id,
            status=OrganizationStatus.active
        )
        self.db.add(org)
        await self.db.flush() # flush to get ID
        
        event_bus.publish(DomainEvent(
            event_type="OrganizationCreated",
            aggregate="Organization",
            aggregate_id=org.id,
            tenant_id=tenant_id,
            actor=user_id,
            payload={"name": org.name}
        ))
        
        return org

    async def update_organization(self, org_id: uuid.UUID, tenant_id: uuid.UUID, org_in: OrganizationUpdate, user_id: uuid.UUID) -> Organization:
        org = await self.get_by_id(org_id, tenant_id)
        
        if org_in.slug:
            slug = org_in.slug.lower()
            self._validate_slug(slug)
            
            stmt = select(Organization).where(
                Organization.tenant_id == tenant_id,
                Organization.slug == slug,
                Organization.id != org_id
            )
            if (await self.db.execute(stmt)).scalar_one_or_none():
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already in use")
            org.slug = slug

        if org_in.name:
            stmt = select(Organization).where(
                Organization.tenant_id == tenant_id,
                Organization.name == org_in.name,
                Organization.id != org_id
            )
            if (await self.db.execute(stmt)).scalar_one_or_none():
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Name already in use")
            org.name = org_in.name
            
        if org_in.description is not None:
            org.description = org_in.description
            
        if org_in.status:
            org.status = org_in.status
            
        org.updated_by = user_id
        await self.db.flush()
        return org

    async def soft_delete(self, org_id: uuid.UUID, tenant_id: uuid.UUID, user_id: uuid.UUID, reason: str = "Manual") -> None:
        org = await self.get_by_id(org_id, tenant_id)
        org.deleted_at = datetime.utcnow()
        org.deleted_by = user_id
        org.delete_reason = reason
        await self.db.flush()
        
        event_bus.publish(DomainEvent(
            event_type="OrganizationArchived",
            aggregate="Organization",
            aggregate_id=org.id,
            tenant_id=tenant_id,
            actor=user_id,
            payload={"reason": reason}
        ))

    async def restore(self, org_id: uuid.UUID, tenant_id: uuid.UUID, user_id: uuid.UUID) -> Organization:
        # Get even if deleted
        stmt = select(Organization).where(
            Organization.id == org_id,
            Organization.tenant_id == tenant_id
        )
        result = await self.db.execute(stmt)
        org = result.scalar_one_or_none()
        
        if not org or org.deleted_at is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deleted organization not found")
            
        # Check conflicts before restoring
        conflict_stmt = select(Organization).where(
            Organization.tenant_id == tenant_id,
            Organization.deleted_at.is_(None),
            (Organization.name == org.name) | (Organization.slug == org.slug)
        )
        if (await self.db.execute(conflict_stmt)).scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, 
                detail="Cannot restore: An active organization with this name or slug already exists."
            )
            
        org.deleted_at = None
        org.deleted_by = None
        org.delete_reason = None
        org.restored_at = datetime.utcnow()
        org.restored_by = user_id
        
        await self.db.flush()
        
        event_bus.publish(DomainEvent(
            event_type="OrganizationRestored",
            aggregate="Organization",
            aggregate_id=org.id,
            tenant_id=tenant_id,
            actor=user_id,
            payload={}
        ))
        return org
