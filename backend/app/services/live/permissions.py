from typing import Dict, Any

class AuthorizationFilter:
    """
    Checks internal projection events against global tenant/RBAC rules before translation.
    """
    @staticmethod
    def is_authorized(event: Dict[str, Any], tenant_id: str) -> bool:
        """
        In MVP, we just ensure the internal event's tenant matches the session tenant.
        """
        event_tenant = event.get("tenant_id")
        # Global/system events might not have a tenant, allow them for now
        if not event_tenant:
            return True
            
        return event_tenant == tenant_id
