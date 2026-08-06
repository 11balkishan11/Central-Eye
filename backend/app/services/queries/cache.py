from abc import ABC, abstractmethod
from typing import Any, Optional
import time

class QueryCache(ABC):
    @abstractmethod
    def get(self, key: str) -> Optional[Any]:
        pass
        
    @abstractmethod
    def set(self, key: str, value: Any, ttl: int):
        pass
        
    @abstractmethod
    def invalidate(self, key: str):
        pass

class MemoryQueryCache(QueryCache):
    """
    In-memory cache MVP implementation.
    """
    def __init__(self):
        self._cache = {}
        
    def get(self, key: str) -> Optional[Any]:
        entry = self._cache.get(key)
        if entry:
            value, expires_at = entry
            if time.time() < expires_at:
                return value
            else:
                del self._cache[key]
        return None
        
    def set(self, key: str, value: Any, ttl: int):
        if ttl > 0:
            expires_at = time.time() + ttl
            self._cache[key] = (value, expires_at)
            
    def invalidate(self, key: str):
        if key in self._cache:
            del self._cache[key]
