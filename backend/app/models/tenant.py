from __future__ import annotations

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from app.models.user import User, UserSession
    from app.models.rbac import Role
    from app.models.device import Device, DeviceGroup

from sqlalchemy import String, Enum, ForeignKey, DateTime, UniqueConstraint, Index, CheckConstraint, Integer
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime
import enum
import uuid
from typing import Optional, List

from app.db.base_class import Base

class TenantStatus(str, enum.Enum):
    active = "active"
    suspended = "suspended"
    cancelled = "cancelled"

class TenantTier(str, enum.Enum):
    free = "free"
    pro = "pro"
    enterprise = "enterprise"

class TenantMembershipStatus(str, enum.Enum):
    active = "active"
    suspended = "suspended"

class OrganizationStatus(str, enum.Enum):
    active = "active"
    pending = "pending"
    suspended = "suspended"
    archived = "archived"

class SiteStatus(str, enum.Enum):
    active = "active"
    maintenance = "maintenance"
    archived = "archived"
    decommissioned = "decommissioned"

class InvitationStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    declined = "declined"
    expired = "expired"
    cancelled = "cancelled"
    revoked = "revoked"

class Tenant(Base):
    __tablename__ = "tenants"

    name: Mapped[str] = mapped_column(String, index=True)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True)
    domain: Mapped[Optional[str]] = mapped_column(String, unique=True, index=True)
    status: Mapped[TenantStatus] = mapped_column(Enum(TenantStatus, name="tenant_status_enum", native_enum=True), default=TenantStatus.active)
    tier: Mapped[TenantTier] = mapped_column(Enum(TenantTier, name="tenant_tier_enum", native_enum=True), default=TenantTier.free)
    settings: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)
    
    deleted_at: Mapped[Optional[datetime]] = mapped_column(default=None)

    # Relationships
    organizations: Mapped[List["Organization"]] = relationship("Organization", back_populates="tenant", cascade="all, delete-orphan", lazy="select")
    users: Mapped[List["User"]] = relationship("User", back_populates="tenant", lazy="select")
    roles: Mapped[List["Role"]] = relationship("Role", back_populates="tenant", cascade="all, delete-orphan", lazy="select")
    memberships: Mapped[List["TenantMembership"]] = relationship("TenantMembership", back_populates="tenant", cascade="all, delete-orphan", lazy="select")
    sessions: Mapped[List["UserSession"]] = relationship("UserSession", back_populates="tenant", lazy="select")


class TenantMembership(Base):
    __tablename__ = "tenant_memberships"

    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    role_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("roles.id", ondelete="CASCADE"), index=True)
    
    status: Mapped[TenantMembershipStatus] = mapped_column(Enum(TenantMembershipStatus, native_enum=True), default=TenantMembershipStatus.active)
    
    invited_by: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    invited_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    joined_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    # Relationships
    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="memberships")
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id], back_populates="memberships")
    role: Mapped["Role"] = relationship("Role")
    inviter: Mapped[Optional["User"]] = relationship("User", foreign_keys=[invited_by])
    sessions: Mapped[List["UserSession"]] = relationship("UserSession", back_populates="membership", lazy="select")

    __table_args__ = (
        UniqueConstraint("tenant_id", "user_id", name="uq_tenant_membership_tenant_user"),
        Index("ix_tenant_memberships_tenant_status", "tenant_id", "status"),
        Index("ix_tenant_memberships_user_status", "user_id", "status"),
    )


class Organization(Base):
    __tablename__ = "organizations"

    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String, index=True)
    slug: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[Optional[str]] = mapped_column(String)
    
    status: Mapped[OrganizationStatus] = mapped_column(Enum(OrganizationStatus, native_enum=True), default=OrganizationStatus.active)
    
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), default=None)
    deleted_by: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    delete_reason: Mapped[Optional[str]] = mapped_column(String)
    deleted_from_ip: Mapped[Optional[str]] = mapped_column(String)
    deleted_from_request_id: Mapped[Optional[str]] = mapped_column(String)
    
    restored_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), default=None)
    restored_by: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    restore_reason: Mapped[Optional[str]] = mapped_column(String)
    
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    updated_by: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))

    # Relationships
    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="organizations", lazy="select")
    sites: Mapped[List["Site"]] = relationship("Site", back_populates="organization", cascade="all, delete-orphan", lazy="select")
    
    __table_args__ = (
        UniqueConstraint("tenant_id", "name", name="uq_org_tenant_name"),
        UniqueConstraint("tenant_id", "slug", name="uq_org_tenant_slug"),
        CheckConstraint(
            "slug ~ '^[a-z0-9-]+$' AND slug NOT IN ('admin', 'api', 'system', 'root', 'login', 'auth', 'settings', 'docs', 'swagger', 'redoc', 'graphql', 'metrics', 'health', 'robots.txt', 'favicon.ico')",
            name="ck_org_slug_format"
        ),
        Index("ix_org_tenant_status_deleted", "tenant_id", "status", "deleted_at"),
    )


class Site(Base):
    __tablename__ = "sites"

    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String, index=True)
    code: Mapped[str] = mapped_column(String, index=True)
    timezone: Mapped[str] = mapped_column(String, default="UTC")
    description: Mapped[Optional[str]] = mapped_column(String)
    
    status: Mapped[SiteStatus] = mapped_column(Enum(SiteStatus, native_enum=True), default=SiteStatus.active)
    
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), default=None)
    deleted_by: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    delete_reason: Mapped[Optional[str]] = mapped_column(String)
    deleted_from_ip: Mapped[Optional[str]] = mapped_column(String)
    deleted_from_request_id: Mapped[Optional[str]] = mapped_column(String)
    
    restored_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), default=None)
    restored_by: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    restore_reason: Mapped[Optional[str]] = mapped_column(String)
    
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    updated_by: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))

    # Relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="sites", lazy="select")
    device_groups: Mapped[List["DeviceGroup"]] = relationship("DeviceGroup", back_populates="site", cascade="all, delete-orphan", lazy="select")
    devices: Mapped[List["Device"]] = relationship("Device", back_populates="site", cascade="all, delete-orphan", lazy="select")
    
    __table_args__ = (
        UniqueConstraint("organization_id", "name", name="uq_site_org_name"),
        UniqueConstraint("organization_id", "code", name="uq_site_org_code"),
        CheckConstraint("code ~ '^[a-z0-9-]+$'", name="ck_site_code_format"),
        Index("ix_site_org_status_deleted", "organization_id", "status", "deleted_at"),
    )


class OrganizationInvitation(Base):
    __tablename__ = "organization_invitations"

    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), index=True)
    email: Mapped[str] = mapped_column(String, index=True)
    invited_by: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    
    status: Mapped[InvitationStatus] = mapped_column(Enum(InvitationStatus, native_enum=True), default=InvitationStatus.pending)
    token_hash: Mapped[str] = mapped_column(String, unique=True, index=True)
    token_version: Mapped[int] = mapped_column(Integer, default=1)
    
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    accepted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    
    cancelled_by: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))

    __table_args__ = (
        Index("uq_active_invite", "organization_id", "email", unique=True, postgresql_where="status = 'pending'"),
        Index("ix_invitation_org_status", "organization_id", "status"),
    )
