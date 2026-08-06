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
from app.models.job import CollectorJob, CollectorEvent
from app.models.resource import (
    Observation, Fact, Resource, ResourceAlias,
    ResourceState, Relationship, RelationshipState
)
from app.models.policy import Policy, PolicyVersion, PolicyAssignment
from app.models.finding import PolicyEvaluation, Finding, FindingState, Evidence
from app.models.platform_event import PlatformEvent
from app.models.incident import Incident
from app.models.automation import AutomationPlan, AutomationExecution, ExecutionStepResult  # noqa: F401

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
    "CollectorJob",
    "CollectorEvent",
    "Observation",
    "Fact",
    "Resource",
    "ResourceAlias",
    "ResourceState",
    "Relationship",
    "RelationshipState",
    "Policy",
    "PolicyVersion",
    "PolicyAssignment",
    "PolicyEvaluation",
    "Finding",
    "FindingState",
    "Evidence",
    "PlatformEvent",
    "Incident",
]
