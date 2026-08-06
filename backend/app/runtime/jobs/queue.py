from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import uuid

class JobQueue(ABC):
    """
    Abstract Interface for Background Job Processing.
    Domain services must use this instead of running long tasks in the API request thread.
    """
    @abstractmethod
    def enqueue(self, job_name: str, payload: Dict[str, Any], queue: str = "default") -> uuid.UUID:
        pass
        
    @abstractmethod
    def cancel(self, job_id: uuid.UUID) -> bool:
        pass
        
    @abstractmethod
    def status(self, job_id: uuid.UUID) -> str:
        pass


from app.runtime.policy import RuntimePolicyEngine  # noqa: E402
from app.runtime.context import RuntimeContext  # noqa: E402

class MemoryJobQueue(JobQueue):
    """
    MVP in-memory job queue for local development and testing.
    In a real MVP, this would dispatch asyncio tasks.
    """
    def __init__(self):
        self._jobs: Dict[uuid.UUID, Dict[str, Any]] = {}
        
    def enqueue(self, job_name: str, payload: Dict[str, Any], queue: str = "default", context: Optional[RuntimeContext] = None) -> uuid.UUID:
        if context and not RuntimePolicyEngine.can_enqueue_job(context, job_name):
            raise RuntimeError(f"RuntimePolicyEngine rejected enqueuing job: {job_name}")
            
        job_id = uuid.uuid4()
        self._jobs[job_id] = {
            "name": job_name,
            "payload": payload,
            "queue": queue,
            "status": "QUEUED"
        }
        # A real implementation would `asyncio.create_task(worker.run(job_id))` here
        return job_id
        
    def cancel(self, job_id: uuid.UUID) -> bool:
        if job_id in self._jobs:
            self._jobs[job_id]["status"] = "CANCELLED"
            return True
        return False
        
    def status(self, job_id: uuid.UUID) -> str:
        if job_id in self._jobs:
            return self._jobs[job_id]["status"]
        return "UNKNOWN"
