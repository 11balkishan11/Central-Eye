from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING

from sqlalchemy import String, Enum, ForeignKey, DateTime, Float, Integer, Boolean, UniqueConstraint, Index, text
from sqlalchemy.dialects.postgresql import INET, MACADDR, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.tenant import Site

# -----------------
# Enums
# -----------------
class DeviceLifecycleState(str, enum.Enum):
    provisioning = "provisioning"
    discovering = "discovering"
    active = "active"
    retired = "retired"
    decommissioned = "decommissioned"

class DeviceAdminState(str, enum.Enum):
    enabled = "enabled"
    disabled = "disabled"
    maintenance = "maintenance"

class DeviceOperState(str, enum.Enum):
    up = "up"
    down = "down"
    unreachable = "unreachable"
    unknown = "unknown"

class DeviceHealth(str, enum.Enum):
    unknown = "unknown"
    good = "good"
    warning = "warning"
    critical = "critical"

class InterfaceOperState(str, enum.Enum):
    up = "up"
    down = "down"
    testing = "testing"
    unknown = "unknown"
    dormant = "dormant"
    not_present = "not_present"
    lower_layer_down = "lower_layer_down"

class InterfaceAdminState(str, enum.Enum):
    up = "up"
    down = "down"
    testing = "testing"

class CollectorStatus(str, enum.Enum):
    active = "active"
    offline = "offline"

# -----------------
# Profiles & Configs
# -----------------
class CredentialProfile(Base):
    __tablename__ = "credential_profiles"
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[Optional[str]] = mapped_column(String)
    protocol: Mapped[str] = mapped_column(String)  # e.g., SNMPv2, SNMPv3, SSH
    # Vault reference or encrypted JSON (we never store plain text)
    vault_reference: Mapped[str] = mapped_column(String)
    
    __table_args__ = (
        UniqueConstraint("tenant_id", "name", name="uq_credential_profile_tenant_name"),
    )

class PollingProfile(Base):
    __tablename__ = "polling_profiles"
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String, index=True)
    interval_seconds: Mapped[int] = mapped_column(Integer, default=60)
    timeout_seconds: Mapped[int] = mapped_column(Integer, default=5)
    retry_count: Mapped[int] = mapped_column(Integer, default=3)
    max_concurrency: Mapped[int] = mapped_column(Integer, default=10)
    enabled_metrics: Mapped[dict] = mapped_column(JSONB, default=dict)
    
    __table_args__ = (
        UniqueConstraint("tenant_id", "name", name="uq_polling_profile_tenant_name"),
    )

class SNMPProfile(Base):
    __tablename__ = "snmp_profiles"
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String, index=True)
    version: Mapped[str] = mapped_column(String, default="v2c") # v1, v2c, v3
    port: Mapped[int] = mapped_column(Integer, default=161)
    timeout_ms: Mapped[int] = mapped_column(Integer, default=2000)
    retries: Mapped[int] = mapped_column(Integer, default=2)

    __table_args__ = (
        UniqueConstraint("tenant_id", "name", name="uq_snmp_profile_tenant_name"),
    )

class Collector(Base):
    __tablename__ = "collectors"
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), index=True)
    site_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("sites.id", ondelete="SET NULL"), index=True)
    name: Mapped[str] = mapped_column(String, index=True)
    status: Mapped[CollectorStatus] = mapped_column(Enum(CollectorStatus, native_enum=True), default=CollectorStatus.offline)
    last_heartbeat: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    version: Mapped[Optional[str]] = mapped_column(String)
    capacity_percent: Mapped[float] = mapped_column(Float, default=0.0)

    __table_args__ = (
        UniqueConstraint("site_id", "name", name="uq_collector_site_name"),
        Index("ix_collectors_last_heartbeat", "last_heartbeat"),
    )

# -----------------
# Device Group & Tags
# -----------------
class DeviceGroup(Base):
    __tablename__ = "device_groups"
    site_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sites.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[Optional[str]] = mapped_column(String)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), default=None)
    
    site: Mapped["Site"] = relationship("Site", back_populates="device_groups", lazy="select")
    devices: Mapped[List["Device"]] = relationship("Device", back_populates="group", lazy="select")

    __table_args__ = (
        UniqueConstraint("site_id", "name", name="uq_device_group_site_name"),
    )

class DeviceTag(Base):
    __tablename__ = "device_tags"
    device_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("devices.id", ondelete="CASCADE"), index=True)
    key: Mapped[str] = mapped_column(String, index=True)
    value: Mapped[str] = mapped_column(String, index=True)
    
    __table_args__ = (
        UniqueConstraint("device_id", "key", name="uq_device_tag_key"),
    )

# -----------------
# Core Device
# -----------------
class Device(Base):
    __tablename__ = "devices"
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), index=True)
    site_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sites.id", ondelete="CASCADE"), index=True)
    group_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("device_groups.id", ondelete="SET NULL"), index=True)
    
    # Core Identity
    device_uuid: Mapped[str] = mapped_column(String, unique=True, index=True, default=lambda: str(uuid.uuid4()))
    hostname: Mapped[str] = mapped_column(String, index=True)
    display_name: Mapped[Optional[str]] = mapped_column(String)
    management_ip: Mapped[str] = mapped_column(INET, index=True)
    dns_name: Mapped[Optional[str]] = mapped_column(String)
    mac_address: Mapped[Optional[str]] = mapped_column(MACADDR)
    serial_number: Mapped[Optional[str]] = mapped_column(String, index=True)
    asset_tag: Mapped[Optional[str]] = mapped_column(String)
    vendor: Mapped[Optional[str]] = mapped_column(String)
    model: Mapped[Optional[str]] = mapped_column(String)
    os: Mapped[Optional[str]] = mapped_column(String)
    firmware: Mapped[Optional[str]] = mapped_column(String)
    location: Mapped[Optional[str]] = mapped_column(String)
    description: Mapped[Optional[str]] = mapped_column(String)
    
    # Capabilities
    supports_snmp: Mapped[bool] = mapped_column(Boolean, default=False)
    supports_icmp: Mapped[bool] = mapped_column(Boolean, default=True)
    supports_ssh: Mapped[bool] = mapped_column(Boolean, default=False)
    supports_syslog: Mapped[bool] = mapped_column(Boolean, default=False)
    supports_traps: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # State & Health
    lifecycle_state: Mapped[DeviceLifecycleState] = mapped_column(Enum(DeviceLifecycleState, native_enum=True), default=DeviceLifecycleState.provisioning)
    admin_state: Mapped[DeviceAdminState] = mapped_column(Enum(DeviceAdminState, native_enum=True), default=DeviceAdminState.enabled)
    oper_state: Mapped[DeviceOperState] = mapped_column(Enum(DeviceOperState, native_enum=True), default=DeviceOperState.unknown)
    health: Mapped[DeviceHealth] = mapped_column(Enum(DeviceHealth, native_enum=True), default=DeviceHealth.unknown)
    last_seen: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), default=None)
    
    # Profiles
    polling_profile_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("polling_profiles.id", ondelete="SET NULL"), index=True)
    snmp_profile_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("snmp_profiles.id", ondelete="SET NULL"), index=True)

    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), default=None)

    # Relationships
    site: Mapped["Site"] = relationship("Site", back_populates="devices", lazy="select")
    group: Mapped["DeviceGroup"] = relationship("DeviceGroup", back_populates="devices", lazy="select")
    tags: Mapped[List["DeviceTag"]] = relationship("DeviceTag", cascade="all, delete-orphan")
    interfaces: Mapped[List["Interface"]] = relationship("Interface", back_populates="device", cascade="all, delete-orphan")
    
    __table_args__ = (
        # Partial unique index: IP uniqueness only among active (non-deleted) devices
        Index("uq_active_device_site_ip", "site_id", "management_ip", unique=True,
              postgresql_where=text("deleted_at IS NULL")),
        Index("ix_device_tenant_lifecycle", "tenant_id", "lifecycle_state", "deleted_at"),
        Index("ix_device_tenant_oper", "tenant_id", "oper_state", "deleted_at"),
        Index("ix_device_tenant_health", "tenant_id", "health", "deleted_at"),
    )

# -----------------
# Assignments (Many-to-Many Mappings)
# -----------------
class DeviceCredentialAssignment(Base):
    __tablename__ = "device_credential_assignments"
    device_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("devices.id", ondelete="CASCADE"), index=True)
    credential_profile_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("credential_profiles.id", ondelete="CASCADE"), index=True)
    priority: Mapped[int] = mapped_column(Integer, default=1)
    
    __table_args__ = (
        UniqueConstraint("device_id", "credential_profile_id", name="uq_device_cred"),
    )

class CollectorRole(str, enum.Enum):
    primary = "primary"
    secondary = "secondary"
    standby = "standby"

class DeviceCollectorAssignment(Base):
    __tablename__ = "device_collector_assignments"
    device_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("devices.id", ondelete="CASCADE"), index=True)
    collector_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("collectors.id", ondelete="CASCADE"), index=True)
    role: Mapped[CollectorRole] = mapped_column(Enum(CollectorRole, native_enum=True), default=CollectorRole.primary)
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("device_id", "collector_id", name="uq_device_collector"),
    )

# -----------------
# Sub-Resources
# -----------------
class Interface(Base):
    __tablename__ = "interfaces"
    device_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("devices.id", ondelete="CASCADE"), index=True)
    if_index: Mapped[int] = mapped_column(Integer) # SNMP ifIndex
    name: Mapped[str] = mapped_column(String, index=True) # e.g. GigabitEthernet0/1
    alias: Mapped[Optional[str]] = mapped_column(String) # ifAlias / description
    type_id: Mapped[int] = mapped_column(Integer) # ifType
    speed_bps: Mapped[int] = mapped_column(Integer, default=0) # ifSpeed / ifHighSpeed
    mac_address: Mapped[Optional[str]] = mapped_column(MACADDR)
    
    admin_state: Mapped[InterfaceAdminState] = mapped_column(Enum(InterfaceAdminState, native_enum=True), default=InterfaceAdminState.up)
    oper_state: Mapped[InterfaceOperState] = mapped_column(Enum(InterfaceOperState, native_enum=True), default=InterfaceOperState.unknown)

    device: Mapped["Device"] = relationship("Device", back_populates="interfaces", lazy="select")
    
    __table_args__ = (
        UniqueConstraint("device_id", "if_index", name="uq_interface_device_index"),
        UniqueConstraint("device_id", "name", name="uq_interface_device_name"),
        Index("ix_interface_device_oper", "device_id", "oper_state"),
    )

# -----------------
# Metrics Model
# -----------------
class MetricDefinition(Base):
    __tablename__ = "metric_definitions"
    metric_key: Mapped[str] = mapped_column(String, unique=True, index=True) # e.g. cpu.utilization
    name: Mapped[str] = mapped_column(String) # e.g. CPU Usage
    description: Mapped[Optional[str]] = mapped_column(String)
    unit: Mapped[str] = mapped_column(String) # e.g. percent, bytes, bps
    is_counter: Mapped[bool] = mapped_column(Boolean, default=False) # rate calculation needed

class MetricSeries(Base):
    __tablename__ = "metric_series"
    metric_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("metric_definitions.id", ondelete="CASCADE"), index=True)
    device_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("devices.id", ondelete="CASCADE"), index=True)
    interface_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("interfaces.id", ondelete="CASCADE"), index=True)
    
    # TimescaleDB will handle actual samples with series_id.
    __table_args__ = (
        Index("uq_metric_series_target", "device_id", "metric_id", "interface_id", unique=True, postgresql_nulls_not_distinct=True),
    )
