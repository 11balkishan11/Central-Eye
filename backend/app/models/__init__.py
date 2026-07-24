from app.db.base_class import Base

from app.models.tenant import Tenant, Organization, Site, TenantMembership, OrganizationInvitation
from app.models.user import User, UserSession, LoginAttempt
from app.models.rbac import Role, Permission, RolePermission, UserRoleAssignment
from app.models.device import (
    CredentialProfile, PollingProfile, SNMPProfile, Collector, DeviceGroup,
    DeviceTag, Device, DeviceCredentialAssignment, DeviceCollectorAssignment,
    Interface, MetricDefinition, MetricSeries, CollectorRole
)
from app.models.event import OutboxEvent

# For Alembic autogenerate to discover the models
__all__ = [
    "Base",
    "Tenant",
    "TenantMembership",
    "Organization",
    "Site",
    "OrganizationInvitation",
    "User",
    "UserSession",
    "LoginAttempt",
    "Role",
    "Permission",
    "RolePermission",
    "UserRoleAssignment",
    "CredentialProfile",
    "PollingProfile",
    "SNMPProfile",
    "Collector",
    "DeviceGroup",
    "DeviceTag",
    "Device",
    "DeviceCredentialAssignment",
    "DeviceCollectorAssignment",
    "Interface",
    "MetricDefinition",
    "MetricSeries",
    "CollectorRole",
    "OutboxEvent",
]
