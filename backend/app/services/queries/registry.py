from typing import Dict, Any, Type
from pydantic import BaseModel

class QueryMetadata(BaseModel):
    name: str
    ttl: int = 0
    cost: str = "low"
    paginated: bool = False
    permissions: list[str] = []

class QueryRegistry:
    _handlers: Dict[str, Any] = {}
    _metadata: Dict[str, QueryMetadata] = {}

    @classmethod
    def register(cls, name: str, ttl: int = 0, cost: str = "low", paginated: bool = False, permissions: list[str] = None):
        if permissions is None:
            permissions = []
            
        def decorator(handler_cls: Type):
            cls._handlers[name] = handler_cls()
            cls._metadata[name] = QueryMetadata(
                name=name,
                ttl=ttl,
                cost=cost,
                paginated=paginated,
                permissions=permissions
            )
            return handler_cls
        return decorator

    @classmethod
    def get_handler(cls, name: str) -> Any:
        return cls._handlers.get(name)

    @classmethod
    def get_metadata(cls, name: str) -> QueryMetadata:
        return cls._metadata.get(name)

# Expose decorator directly
query = QueryRegistry.register
