
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from app.models.tenant import Tenant
    from app.models.user import User

from sqlalchemy import String, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship, Mapped, mapped_column
import uuid
from typing import Optional, List

from app.db.base_class import Base

class Permission(Base):
    __tablename__ = "permissions"

    name: Mapped[str] = mapped_column(String, index=True)
    resource: Mapped[str] = mapped_column(String)
    action: Mapped[str] = mapped_column(String)
    description: Mapped[Optional[str]] = mapped_column(String)

    # Relationships
    role_assignments: Mapped[List["RolePermission"]] = relationship("RolePermission", back_populates="permission", cascade="all, delete-orphan", lazy="select")


class Role(Base):
    __tablename__ = "roles"

    tenant_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[Optional[str]] = mapped_column(String)

    # Relationships
    tenant: Mapped[Optional["Tenant"]] = relationship("Tenant", back_populates="roles", lazy="select")
    permission_assignments: Mapped[List["RolePermission"]] = relationship("RolePermission", back_populates="role", cascade="all, delete-orphan", lazy="select")
    user_assignments: Mapped[List["UserRoleAssignment"]] = relationship("UserRoleAssignment", back_populates="role", cascade="all, delete-orphan", lazy="select")


class RolePermission(Base):
    __tablename__ = "role_permissions"

    role_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("roles.id", ondelete="CASCADE"), index=True)
    permission_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("permissions.id", ondelete="CASCADE"), index=True)

    # Relationships
    role: Mapped["Role"] = relationship("Role", back_populates="permission_assignments", lazy="select")
    permission: Mapped["Permission"] = relationship("Permission", back_populates="role_assignments", lazy="select")


class UserRoleAssignment(Base):
    __tablename__ = "user_role_assignments"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    role_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("roles.id", ondelete="CASCADE"), index=True)
    
    tenant_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), index=True, nullable=True)
    organization_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), index=True, nullable=True)
    site_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("sites.id", ondelete="CASCADE"), index=True, nullable=True)
    device_group_id: Mapped[Optional[uuid.UUID]] = mapped_column(index=True, nullable=True) # Assuming device_groups table comes later

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="role_assignments", lazy="select")
    role: Mapped["Role"] = relationship("Role", back_populates="user_assignments", lazy="select")

    __table_args__ = (
        # Ensure at most one scope is assigned. If all are NULL, it implies a global role (e.g. System Admin).
        # We use a standard SQL constraint compatible with both Postgres and SQLite.
        CheckConstraint(
            "(CASE WHEN tenant_id IS NOT NULL THEN 1 ELSE 0 END + "
            "CASE WHEN organization_id IS NOT NULL THEN 1 ELSE 0 END + "
            "CASE WHEN site_id IS NOT NULL THEN 1 ELSE 0 END + "
            "CASE WHEN device_group_id IS NOT NULL THEN 1 ELSE 0 END) <= 1",
            name="ck_user_role_assignment_single_scope"
        ),
    )
