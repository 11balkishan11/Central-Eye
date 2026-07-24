import uuid
from datetime import datetime, timezone
from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException, status

from app.models.device import Device, DeviceLifecycleState, DeviceAdminState, DeviceOperState
from app.models.tenant import Organization, Site, SiteStatus, OrganizationStatus, Tenant, TenantStatus
from app.models.event import OutboxEvent
from app.core.events import DomainEventBus

# --- Lifecycle transition rules ---
VALID_LIFECYCLE_TRANSITIONS: dict[DeviceLifecycleState, list[DeviceLifecycleState]] = {
    DeviceLifecycleState.provisioning: [
        DeviceLifecycleState.discovering,
        DeviceLifecycleState.decommissioned,
    ],
    DeviceLifecycleState.discovering: [
        DeviceLifecycleState.active,
        DeviceLifecycleState.provisioning,
        DeviceLifecycleState.decommissioned,
    ],
    DeviceLifecycleState.active: [
        DeviceLifecycleState.retired,
        DeviceLifecycleState.decommissioned,
    ],
    DeviceLifecycleState.retired: [
        DeviceLifecycleState.active,
        DeviceLifecycleState.decommissioned,
    ],
    DeviceLifecycleState.decommissioned: [],  # No normal transitions out
}

# --- Admin state transition rules ---
VALID_ADMIN_TRANSITIONS: dict[DeviceAdminState, list[DeviceAdminState]] = {
    DeviceAdminState.enabled: [DeviceAdminState.disabled, DeviceAdminState.maintenance],
    DeviceAdminState.disabled: [DeviceAdminState.enabled, DeviceAdminState.maintenance],
    DeviceAdminState.maintenance: [DeviceAdminState.enabled, DeviceAdminState.disabled],
}

# Site statuses that allow provisioning
PROVISIONABLE_SITE_STATUSES = {SiteStatus.active, SiteStatus.maintenance}


class DeviceService:
    def __init__(self, db: AsyncSession, event_bus: DomainEventBus):
        self.db = db
        self.event_bus = event_bus

    # --- Provisioning guards ---
    async def _validate_provisioning_context(
        self, tenant_id: uuid.UUID, site_id: uuid.UUID
    ) -> Site:
        """
        Validates the full hierarchy before allowing device creation:
        - Tenant exists, is active, not deleted
        - Organization exists, is active, not deleted
        - Site exists, is in a provisionable status, not deleted
        - Site's organization belongs to the given tenant
        """
        # 1. Validate tenant
        tenant = (await self.db.execute(
            select(Tenant).where(Tenant.id == tenant_id)
        )).scalar_one_or_none()
        if not tenant or tenant.deleted_at is not None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")
        if tenant.status != TenantStatus.active:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Tenant is {tenant.status.value}; provisioning not allowed"
            )

        # 2. Validate site
        site = (await self.db.execute(
            select(Site).where(Site.id == site_id)
        )).scalar_one_or_none()
        if not site or site.deleted_at is not None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")
        if site.status not in PROVISIONABLE_SITE_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Site is {site.status.value}; provisioning not allowed"
            )

        # 3. Validate organization (site's parent)
        org = (await self.db.execute(
            select(Organization).where(Organization.id == site.organization_id)
        )).scalar_one_or_none()
        if not org or org.deleted_at is not None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Site's organization has been deleted; provisioning not allowed"
            )
        if org.status != OrganizationStatus.active:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Organization is {org.status.value}; provisioning not allowed"
            )

        # 4. Validate tenant hierarchy: org must belong to the request's tenant
        if org.tenant_id != tenant_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")

        return site

    # --- CRUD ---
    async def provision_device(
        self,
        tenant_id: uuid.UUID,
        site_id: uuid.UUID,
        hostname: str,
        management_ip: str,
        actor_id: Optional[uuid.UUID] = None,
        request_id: Optional[str] = None,
        group_id: Optional[uuid.UUID] = None
    ) -> Device:
        """
        Provision a new device. Validates the full tenant→org→site hierarchy,
        checks IP uniqueness among active devices, creates the device and
        an OutboxEvent in the same transaction.
        """
        # Validate hierarchy
        await self._validate_provisioning_context(tenant_id, site_id)

        # Check IP uniqueness among active (non-deleted) devices in this site
        existing_stmt = select(Device).where(
            Device.site_id == site_id,
            Device.management_ip == management_ip,
            Device.deleted_at.is_(None)
        )
        existing = (await self.db.execute(existing_stmt)).scalar_one_or_none()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Device with IP {management_ip} already exists in this site."
            )

        new_device = Device(
            tenant_id=tenant_id,
            site_id=site_id,
            group_id=group_id,
            hostname=hostname,
            management_ip=management_ip,
            lifecycle_state=DeviceLifecycleState.provisioning,
            admin_state=DeviceAdminState.enabled,
            oper_state=DeviceOperState.unknown,
        )
        self.db.add(new_device)
        await self.db.flush()

        # Transactional outbox event
        outbox_event = OutboxEvent(
            event_type="DeviceProvisioningStarted",
            aggregate="Device",
            aggregate_id=new_device.id,
            tenant_id=tenant_id,
            actor=actor_id,
            payload={
                "device_id": str(new_device.id),
                "hostname": new_device.hostname,
                "management_ip": str(new_device.management_ip),
                "site_id": str(site_id),
            }
        )
        self.db.add(outbox_event)

        await self.db.commit()
        await self.db.refresh(new_device)
        return new_device

    async def get_device(self, device_id: uuid.UUID, tenant_id: uuid.UUID) -> Device:
        stmt = select(Device).where(
            Device.id == device_id,
            Device.tenant_id == tenant_id,
            Device.deleted_at.is_(None)
        )
        device = (await self.db.execute(stmt)).scalar_one_or_none()
        if not device:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
        return device

    async def list_devices(
        self,
        tenant_id: uuid.UUID,
        skip: int = 0,
        limit: int = 50,
        site_id: Optional[uuid.UUID] = None
    ) -> Tuple[List[Device], int]:
        stmt = select(Device).where(
            Device.tenant_id == tenant_id,
            Device.deleted_at.is_(None)
        )
        if site_id:
            stmt = stmt.where(Device.site_id == site_id)
        stmt = stmt.order_by(Device.hostname.asc())

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = (await self.db.execute(count_stmt)).scalar_one()

        stmt = stmt.offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return list(result.scalars().all()), total

    async def soft_delete(
        self, device_id: uuid.UUID, tenant_id: uuid.UUID,
        actor_id: uuid.UUID, reason: str = "Manual"
    ) -> None:
        device = await self.get_device(device_id, tenant_id)
        device.deleted_at = datetime.now(timezone.utc)

        outbox_event = OutboxEvent(
            event_type="DeviceSoftDeleted",
            aggregate="Device",
            aggregate_id=device.id,
            tenant_id=tenant_id,
            actor=actor_id,
            payload={
                "device_id": str(device.id),
                "hostname": device.hostname,
                "reason": reason,
            }
        )
        self.db.add(outbox_event)
        await self.db.commit()

    async def restore(
        self, device_id: uuid.UUID, tenant_id: uuid.UUID, actor_id: uuid.UUID
    ) -> Device:
        # Get even if deleted
        stmt = select(Device).where(
            Device.id == device_id,
            Device.tenant_id == tenant_id,
        )
        device = (await self.db.execute(stmt)).scalar_one_or_none()
        if not device or device.deleted_at is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Deleted device not found"
            )

        # Check IP conflict among active devices
        conflict_stmt = select(Device).where(
            Device.site_id == device.site_id,
            Device.management_ip == device.management_ip,
            Device.deleted_at.is_(None),
            Device.id != device.id,
        )
        conflict = (await self.db.execute(conflict_stmt)).scalar_one_or_none()
        if conflict:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cannot restore: an active device with this IP already exists in the site."
            )

        device.deleted_at = None

        outbox_event = OutboxEvent(
            event_type="DeviceRestored",
            aggregate="Device",
            aggregate_id=device.id,
            tenant_id=tenant_id,
            actor=actor_id,
            payload={
                "device_id": str(device.id),
                "hostname": device.hostname,
            }
        )
        self.db.add(outbox_event)
        await self.db.commit()
        await self.db.refresh(device)
        return device

    async def update_lifecycle(
        self, device_id: uuid.UUID, tenant_id: uuid.UUID,
        new_state: DeviceLifecycleState, actor_id: uuid.UUID
    ) -> Device:
        device = await self.get_device(device_id, tenant_id)
        allowed = VALID_LIFECYCLE_TRANSITIONS.get(device.lifecycle_state, [])
        if new_state not in allowed:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid lifecycle transition: {device.lifecycle_state.value} → {new_state.value}"
            )
        from sqlalchemy.orm.attributes import flag_modified

        old_state = device.lifecycle_state
        device.lifecycle_state = new_state
        flag_modified(device, "lifecycle_state")

        outbox_event = OutboxEvent(
            event_type="DeviceLifecycleChanged",
            aggregate="Device",
            aggregate_id=device.id,
            tenant_id=tenant_id,
            actor=actor_id,
            payload={
                "device_id": str(device.id),
                "from": old_state.value if hasattr(old_state, "value") else str(old_state),
                "to": new_state.value if hasattr(new_state, "value") else str(new_state),
            }
        )
        self.db.add(outbox_event)
        await self.db.commit()
        await self.db.refresh(device)
        return device

    async def update_admin_state(
        self, device_id: uuid.UUID, tenant_id: uuid.UUID,
        new_state: DeviceAdminState, actor_id: uuid.UUID
    ) -> Device:
        device = await self.get_device(device_id, tenant_id)
        allowed = VALID_ADMIN_TRANSITIONS.get(device.admin_state, [])
        if new_state not in allowed:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid admin state transition: {device.admin_state.value} → {new_state.value}"
            )
        from sqlalchemy.orm.attributes import flag_modified

        old_state = device.admin_state
        device.admin_state = new_state
        flag_modified(device, "admin_state")

        outbox_event = OutboxEvent(
            event_type="DeviceAdminStateChanged",
            aggregate="Device",
            aggregate_id=device.id,
            tenant_id=tenant_id,
            actor=actor_id,
            payload={
                "device_id": str(device.id),
                "from": old_state.value if hasattr(old_state, "value") else str(old_state),
                "to": new_state.value if hasattr(new_state, "value") else str(new_state),
            }
        )
        self.db.add(outbox_event)
        await self.db.commit()
        await self.db.refresh(device)
        return device
