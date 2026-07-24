from typing import Any, Optional

class SessionCache:
    """
    Abstracts session caching. Ready for Redis integration.
    """
    async def get(self, key: str) -> Optional[Any]:
        return None

    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        pass

    async def delete(self, key: str) -> None:
        pass

    async def invalidate(self, pattern: str) -> None:
        pass
