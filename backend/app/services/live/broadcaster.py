from typing import Callable, List, Any

class PresentationBus:
    """
    Decouples the Projection Engine from the Live Gateway.
    Receives 'ProjectionUpdated' internal events and routes them to the Auth/Translator pipeline.
    """
    def __init__(self):
        self._subscribers: List[Callable[[Any], None]] = []
        
    def publish(self, event: Any):
        """
        Publish a projection update.
        event should be a dict or object indicating what projection changed.
        e.g., {"type": "ProjectionUpdated", "projection": "Inventory", "tenant_id": "t1", "resource_id": "sw1"}
        """
        for handler in self._subscribers:
            try:
                handler(event)
            except Exception as e:
                print(f"PresentationBus error: {e}")
                
    def subscribe(self, handler: Callable[[Any], None]):
        if handler not in self._subscribers:
            self._subscribers.append(handler)
            
    def unsubscribe(self, handler: Callable[[Any], None]):
        if handler in self._subscribers:
            self._subscribers.remove(handler)

# Global bus instance for MVP
presentation_bus = PresentationBus()
