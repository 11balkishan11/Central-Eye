from abc import ABC, abstractmethod
import uuid
from datetime import datetime

class ExecutionScheduler(ABC):
    @abstractmethod
    def execute_now(self, execution_id: uuid.UUID) -> None:
        pass
        
    @abstractmethod
    def execute_at(self, execution_id: uuid.UUID, scheduled_time: datetime) -> None:
        pass
        
    @abstractmethod
    def execute_after(self, execution_id: uuid.UUID, delay_seconds: int) -> None:
        pass
        
    @abstractmethod
    def cancel(self, execution_id: uuid.UUID) -> None:
        pass
        
    @abstractmethod
    def reschedule(self, execution_id: uuid.UUID, new_time: datetime) -> None:
        pass
