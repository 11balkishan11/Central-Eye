from typing import Dict, Type
from app.services.twin.resolvers.base import ConflictResolver, StringResolver

class ConflictResolverRegistry:
    def __init__(self):
        self._resolvers: Dict[str, ConflictResolver] = {}
        # Pre-register defaults
        self.register("default", StringResolver())
        
    def register(self, key: str, resolver: ConflictResolver):
        self._resolvers[key] = resolver
        
    def get_resolver(self, key: str) -> ConflictResolver:
        # MVP: Return specific resolver if registered, else default
        return self._resolvers.get(key, self._resolvers["default"])
