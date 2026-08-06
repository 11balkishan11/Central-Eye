from abc import ABC, abstractmethod
from typing import Dict, Any
import uuid
from datetime import datetime

class RuntimeScheduler(ABC):
    """
    Generalized platform scheduler. Replaces domain-specific schedulers.
    """
    @abstractmethod
    def schedule_once(self, job_name: str, payload: Dict[str, Any], execute_at: datetime) -> uuid.UUID:
        pass
        
    @abstractmethod
    def schedule_recurring(self, job_name: str, payload: Dict[str, Any], cron_expression: str) -> uuid.UUID:
        pass
        
    @abstractmethod
    def cancel(self, schedule_id: uuid.UUID) -> bool:
        pass
