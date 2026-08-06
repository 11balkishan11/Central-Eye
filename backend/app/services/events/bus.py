from abc import ABC, abstractmethod
from typing import Callable, Dict, List, Any
import asyncio
class DomainEventBus(ABC):
    """
    Abstract interface for Domain Event transport.
    MVP is in-memory. Sprint 11 will introduce Kafka/Redis Streams implementations.
    """
    @abstractmethod
    def publish(self, event_or_envelope: Any):
        pass
        
    @abstractmethod
    def subscribe(self, event_type: str, handler: Callable[[Any], None]):
        pass
        
    @abstractmethod
    def unsubscribe(self, event_type: str, handler: Callable[[Any], None]):
        pass

class InMemoryDomainEventBus(DomainEventBus):
    """
    Simple in-memory pub-sub for Sprint 10 MVP.
    """
    def __init__(self):
        self._subscribers: Dict[str, List[Callable[[Any], None]]] = {}
        
    def publish(self, event_or_envelope):
        # determine event type
        event_type = getattr(event_or_envelope, "event_type", None)
        if isinstance(event_or_envelope, dict):
            event_type = event_or_envelope.get("event_type")
            
        handlers = self._subscribers.get(event_type, [])
        handlers.extend(self._subscribers.get("*", []))
        
        for handler in set(handlers): # Avoid calling same handler twice if subscribed to both
            # MVP: Synchronous dispatch for simplicity.
            try:
                handler(event_or_envelope)
            except Exception as e:
                print(f"Error handling event {event_type}: {e}")
                
    def subscribe(self, event_type: str, handler: Callable[[Any], None]):
        if event_type not in self._subscribers:
            self._subscribers[event_type] = []
        if handler not in self._subscribers[event_type]:
            self._subscribers[event_type].append(handler)
            
    def unsubscribe(self, event_type: str, handler: Callable[[Any], None]):
        if event_type in self._subscribers:
            if handler in self._subscribers[event_type]:
                self._subscribers[event_type].remove(handler)
