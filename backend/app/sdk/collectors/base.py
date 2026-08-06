from abc import ABC, abstractmethod
from typing import Dict, Any, List, Generator, Optional
from pydantic import BaseModel
from datetime import datetime, timezone
import uuid

from app.services.collectors.envelope import ObservationEnvelope

class CollectorHealth(BaseModel):
    availability: float
    latency_ms: int
    error_rate: float
    success_rate: float
    last_poll: datetime
    queue_depth: int
    next_run: Optional[datetime] = None

class CollectorContext(BaseModel):
    tenant_id: str
    collection_job_id: str
    credentials: Dict[str, Any]
    rate_limit: int

class BaseCollector(ABC):
    """
    The interface every Collector Plugin must implement.
    Collectors run independently and stream their results.
    """
    
    @property
    @abstractmethod
    def collector_id(self) -> str:
        pass
        
    @abstractmethod
    def supported_resource_types(self) -> List[str]:
        pass
        
    @abstractmethod
    def authenticate(self, context: CollectorContext) -> bool:
        pass
        
    @abstractmethod
    def validate_target(self, target: Dict[str, Any]) -> bool:
        pass
        
    @abstractmethod
    def estimate_cost(self, target: Dict[str, Any]) -> int:
        pass
        
    @abstractmethod
    def discover(self, context: CollectorContext, target: Dict[str, Any]) -> Generator[ObservationEnvelope, None, None]:
        pass
        
    @abstractmethod
    def collect(self, context: CollectorContext, target: Dict[str, Any]) -> Generator[ObservationEnvelope, None, None]:
        pass
        
    @abstractmethod
    def stream(self, context: CollectorContext, target: Dict[str, Any]) -> Generator[ObservationEnvelope, None, None]:
        """For long-lived streaming connections like gRPC or syslog."""
        pass
        
    @abstractmethod
    def health(self) -> CollectorHealth:
        pass
