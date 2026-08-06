from pydantic import BaseModel, Field
from typing import Dict, List, Optional

from app.services.live.protocol import DeliveryPolicy
from app.services.queries.schema import QueryFilter

class Subscription(BaseModel):
    subscription_id: str
    topic: str
    filters: List[QueryFilter] = Field(default_factory=list)
    delivery_policy: DeliveryPolicy = DeliveryPolicy.RELIABLE
    snapshot_on_subscribe: bool = True
    resume_token: Optional[str] = None
    
class SubscriptionEngine:
    """
    Manages active subscriptions and routes events to interested sessions.
    """
    def __init__(self):
        # Maps topic -> List of (session_id, Subscription)
        self._subscriptions: Dict[str, List[tuple[str, Subscription]]] = {}
        
    def add_subscription(self, session_id: str, sub: Subscription):
        if sub.topic not in self._subscriptions:
            self._subscriptions[sub.topic] = []
        self._subscriptions[sub.topic].append((session_id, sub))
        
    def remove_subscription(self, session_id: str, subscription_id: str):
        for topic, subs in self._subscriptions.items():
            self._subscriptions[topic] = [s for s in subs if s[0] != session_id or s[1].subscription_id != subscription_id]
            
    def remove_session(self, session_id: str):
        for topic in list(self._subscriptions.keys()):
            self._subscriptions[topic] = [s for s in self._subscriptions[topic] if s[0] != session_id]
            
    def get_subscriptions(self, topic: str) -> List[tuple[str, Subscription]]:
        """Returns sessions and their subscription rules for a given topic."""
        return self._subscriptions.get(topic, [])

subscription_engine = SubscriptionEngine()
