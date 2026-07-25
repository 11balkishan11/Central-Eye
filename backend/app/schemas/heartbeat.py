from pydantic import BaseModel
from typing import List

class HeartbeatRequest(BaseModel):
    cpu_percent: float
    memory_mb_used: int
    uptime_seconds: int
    active_threads: int
    current_jobs: int
    ip_addresses: List[str]

class HeartbeatResponse(BaseModel):
    heartbeat_interval_seconds: int
    poll_interval_seconds: int
    log_level: str
    jobs_enabled: bool
    minimum_collector_version: str
