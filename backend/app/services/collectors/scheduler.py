from typing import Dict, Any
import uuid

class PollingScheduler:
    """
    Manages collector execution schedules with priority, backoff, and jitter.
    """
    def __init__(self, job_queue):
        # job_queue here is the platform's execution JobQueue (e.g., Celery/Postgres jobs), 
        # NOT the ObservationBus.
        self.job_queue = job_queue
        
    def schedule_collection(self, tenant_id: str, collector_id: str, target: Dict[str, Any], policy: Dict[str, Any]) -> uuid.UUID:
        """
        Schedules a collector to run against a target according to a specific policy.
        """
        priority = policy.get("priority", 100)
        # Apply jitter and backoff logic here before enqueuing
        
        job_id = self.job_queue.enqueue(
            job_name="run_collector",
            payload={
                "tenant_id": tenant_id,
                "collector_id": collector_id,
                "target": target
            },
            queue=f"collector_{priority}" # Route to priority-specific workers
        )
        return job_id
