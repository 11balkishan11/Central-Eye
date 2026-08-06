import time
from typing import Dict, Any

class MetricsService:
    """
    In-memory metrics service for tracking policy engine performance.
    In the future, this can act as an abstraction over Prometheus or StatsD.
    """
    _metrics = {
        "resources_evaluated": 0,
        "policies_evaluated": 0,
        "rules_evaluated": 0,
        "evaluation_time_ms": 0,
        "failures": 0,
        "errors": 0,
    }

    @classmethod
    def record_evaluation(cls, rules_count: int, duration_ms: int, status: str):
        cls._metrics["resources_evaluated"] += 1
        cls._metrics["policies_evaluated"] += 1
        cls._metrics["rules_evaluated"] += rules_count
        cls._metrics["evaluation_time_ms"] += duration_ms
        
        if status == "FAIL":
            cls._metrics["failures"] += 1
        elif status == "ERROR":
            cls._metrics["errors"] += 1

    @classmethod
    def get_metrics(cls) -> Dict[str, Any]:
        return dict(cls._metrics)

metrics_service = MetricsService()
