import abc
from typing import List, Optional
import uuid

class PermissionCache(abc.ABC):
    """
    Abstract interface for caching user permissions.
    In Phase 5, this allows us to fall back to the DB only when the cache misses.
    Ready for Redis implementation in the future.
    """
    
    @abc.abstractmethod
    async def get_permissions(self, user_id: uuid.UUID, tenant_id: uuid.UUID) -> Optional[List[str]]:
        pass
        
    @abc.abstractmethod
    async def set_permissions(self, user_id: uuid.UUID, tenant_id: uuid.UUID, permissions: List[str], ttl_seconds: int = 300) -> None:
        pass
        
    @abc.abstractmethod
    async def invalidate_user(self, user_id: uuid.UUID, tenant_id: uuid.UUID) -> None:
        pass

class InMemoryPermissionCache(PermissionCache):
    def __init__(self):
        # Format: {(user_id, tenant_id): permissions_list}
        self._cache = {}
        
    async def get_permissions(self, user_id: uuid.UUID, tenant_id: uuid.UUID) -> Optional[List[str]]:
        return self._cache.get((user_id, tenant_id))
        
    async def set_permissions(self, user_id: uuid.UUID, tenant_id: uuid.UUID, permissions: List[str], ttl_seconds: int = 300) -> None:
        self._cache[(user_id, tenant_id)] = permissions
        
    async def invalidate_user(self, user_id: uuid.UUID, tenant_id: uuid.UUID) -> None:
        self._cache.pop((user_id, tenant_id), None)
