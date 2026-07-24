import uuid
from typing import Optional

class AuditService:
    """
    Audit service interface for security events.
    """
    async def emit_session_created(self, session_id: uuid.UUID, user_id: uuid.UUID) -> None:
        pass

    async def emit_refresh(self, session_id: uuid.UUID, user_id: uuid.UUID) -> None:
        pass

    async def emit_logout(self, session_id: uuid.UUID) -> None:
        pass

    async def emit_family_revoked(self, family_id: uuid.UUID) -> None:
        pass

    async def emit_refresh_reuse(self, session_id: uuid.UUID, user_id: uuid.UUID) -> None:
        pass

    async def emit_login_failed(self, user_id: uuid.UUID, reason: str) -> None:
        pass
        
    async def emit_account_locked(self, user_id: uuid.UUID) -> None:
        pass

    async def emit_permission_denied(self, user_id: uuid.UUID, permission: str, scope: str, scope_id: Optional[uuid.UUID]) -> None:
        pass

    async def emit_privilege_escalation_attempt(self, user_id: uuid.UUID, target_role: str) -> None:
        pass

    async def emit_role_assigned(self, user_id: uuid.UUID, role_id: uuid.UUID, assigned_by: uuid.UUID) -> None:
        pass

    async def emit_role_removed(self, user_id: uuid.UUID, role_id: uuid.UUID, removed_by: uuid.UUID) -> None:
        pass

class SecurityLogger:
    """
    Interface for structured security logging.
    """
    def log_login_attempt(self, email: str, success: bool, ip_address: Optional[str] = None) -> None:
        pass

    def log_account_lockout(self, user_id: uuid.UUID) -> None:
        pass

    def log_suspicious_activity(self, message: str, **kwargs) -> None:
        pass

class AuthMetrics:
    """
    Interface for authentication-related metrics (e.g. Prometheus/OpenTelemetry).
    """
    def record_login_success(self) -> None:
        pass

    def record_login_failure(self) -> None:
        pass

    def record_token_refresh(self) -> None:
        pass
        
    def record_session_revoked(self) -> None:
        pass
