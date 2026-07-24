from __future__ import annotations

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from app.models.tenant import Tenant, TenantMembership
    from app.models.rbac import UserRoleAssignment

from sqlalchemy import String, Boolean, ForeignKey, Enum, DateTime, Index, text
from sqlalchemy.dialects.postgresql import INET
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from datetime import datetime
import enum
import uuid
from typing import Optional, List

from app.db.base_class import Base

class UserStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    suspended = "suspended"

class SessionStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    REVOKED = "REVOKED"
    EXPIRED = "EXPIRED"
    COMPROMISED = "COMPROMISED"

class LoginFailureReason(str, enum.Enum):
    INVALID_PASSWORD = "INVALID_PASSWORD"
    LOCKED = "LOCKED"
    UNKNOWN_USER = "UNKNOWN_USER"
    MFA_FAILED = "MFA_FAILED"
    TOKEN_REUSE = "TOKEN_REUSE"
    PASSWORD_EXPIRED = "PASSWORD_EXPIRED"

class User(Base):
    __tablename__ = "users"

    tenant_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"), index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String)
    first_name: Mapped[Optional[str]] = mapped_column(String)
    last_name: Mapped[Optional[str]] = mapped_column(String)
    status: Mapped[UserStatus] = mapped_column(Enum(UserStatus, name="user_status_enum", native_enum=True), default=UserStatus.active)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Auth fields for future
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    email_verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    verification_token: Mapped[Optional[str]] = mapped_column(String, index=True)
    password_reset_token: Mapped[Optional[str]] = mapped_column(String, index=True)
    reset_token_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    last_password_change_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    mfa_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    mfa_secret: Mapped[Optional[str]] = mapped_column(String)
    
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    failed_login_count: Mapped[int] = mapped_column(server_default="0", default=0)
    locked_until: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    # Relationships
    tenant: Mapped[Optional["Tenant"]] = relationship("Tenant", back_populates="users", lazy="select")
    role_assignments: Mapped[List["UserRoleAssignment"]] = relationship("UserRoleAssignment", back_populates="user", cascade="all, delete-orphan", lazy="select")
    sessions: Mapped[List["UserSession"]] = relationship("UserSession", foreign_keys="[UserSession.user_id]", back_populates="user", lazy="select")
    memberships: Mapped[List["TenantMembership"]] = relationship("TenantMembership", back_populates="user", lazy="select", primaryjoin="User.id == TenantMembership.user_id")
    login_attempts: Mapped[List["LoginAttempt"]] = relationship("LoginAttempt", back_populates="user", lazy="select")


class UserSession(Base):
    __tablename__ = "user_sessions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True)
    tenant_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("tenants.id", ondelete="SET NULL"), index=True)
    membership_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("tenant_memberships.id", ondelete="SET NULL"), index=True)
    
    refresh_token_hash: Mapped[str] = mapped_column(String, unique=True, index=True)
    family_id: Mapped[uuid.UUID] = mapped_column(index=True)
    current_jti: Mapped[Optional[str]] = mapped_column(String, index=True)
    
    status: Mapped[SessionStatus] = mapped_column(Enum(SessionStatus, native_enum=True), default=SessionStatus.ACTIVE)
    
    device_id: Mapped[Optional[str]] = mapped_column(String)
    device_name: Mapped[Optional[str]] = mapped_column(String)
    platform: Mapped[Optional[str]] = mapped_column(String)
    browser: Mapped[Optional[str]] = mapped_column(String)
    os: Mapped[Optional[str]] = mapped_column(String)
    user_agent: Mapped[Optional[str]] = mapped_column(String)
    ip_address: Mapped[Optional[str]] = mapped_column(INET)
    
    last_activity_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), default=func.now())
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    revoke_reason: Mapped[Optional[str]] = mapped_column(String)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), onupdate=func.now())
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    deleted_by: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))

    # Relationships
    user: Mapped[Optional["User"]] = relationship("User", foreign_keys=[user_id], back_populates="sessions", lazy="select")
    tenant: Mapped[Optional["Tenant"]] = relationship("Tenant", back_populates="sessions", lazy="select")
    membership: Mapped[Optional["TenantMembership"]] = relationship("TenantMembership", back_populates="sessions", lazy="select")
    deleter: Mapped[Optional["User"]] = relationship("User", foreign_keys=[deleted_by])

    __table_args__ = (
        Index("ix_user_sessions_status", "status"),
        Index("ix_user_sessions_expires_at", "expires_at"),
        Index("ix_user_sessions_user_status", "user_id", "status"),
        Index("ix_user_sessions_tenant_status", "tenant_id", "status"),
        Index("ix_user_sessions_family_status", "family_id", "status"),
    )


class LoginAttempt(Base):
    __tablename__ = "login_attempts"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String, index=True)
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    tenant_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("tenants.id", ondelete="SET NULL"))
    ip_address: Mapped[Optional[str]] = mapped_column(INET, index=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String)
    
    was_successful: Mapped[bool] = mapped_column(Boolean)
    failure_reason: Mapped[Optional[LoginFailureReason]] = mapped_column(Enum(LoginFailureReason, native_enum=True))
    
    attempted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())

    # Relationships
    user: Mapped[Optional["User"]] = relationship("User", back_populates="login_attempts")

    __table_args__ = (
        Index("ix_login_attempts_attempted_at", "attempted_at"),
        Index("ix_login_attempts_email_attempted_at", "email", text("attempted_at DESC")),
        Index("ix_login_attempts_ip_attempted_at", "ip_address", text("attempted_at DESC")),
        Index("ix_login_attempts_user_attempted_at", "user_id", text("attempted_at DESC")),
    )
