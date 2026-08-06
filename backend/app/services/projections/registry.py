from abc import ABC, abstractmethod
from typing import Dict, List, Any

class ProjectionHandler:
    """
    Base class for all projection builders.
    """
    @property
    def projection_name(self) -> str:
        return self.__class__.__name__

class ProjectionRegistry:
    """
    Manages active projection handlers and their event subscriptions.
    """
    def __init__(self):
        self._handlers: List[ProjectionHandler] = []
        
    def register(self, handler: ProjectionHandler):
        if handler not in self._handlers:
            self._handlers.append(handler)
            
    def get_all_handlers(self) -> List[ProjectionHandler]:
        return self._handlers
        # Subclasses define methods like handle_factupdated(self, event: Any, context: ProjectionContext, db: Session)
    def get_handler_by_name(self, name: str) -> ProjectionHandler:
        for handler in self._handlers:
            if handler.projection_name == name:
                return handler
        raise ValueError(f"Projection {name} not found")
