from typing import Dict, Any, Callable
from sqlalchemy.orm import Session
from sqlalchemy import text

class HealthService:
    """
    Aggregates dependency health status.
    """
    def __init__(self, db: Session):
        self.db = db
        self._checks: Dict[str, Callable] = {
            "postgres": self._check_postgres,
            # "redis": self._check_redis,
            # "ai_provider": self._check_ai,
        }
        
    def get_health(self) -> Dict[str, Any]:
        status = "HEALTHY"
        details = {}
        
        for name, check_fn in self._checks.items():
            try:
                is_healthy = check_fn()
                details[name] = "UP" if is_healthy else "DOWN"
                if not is_healthy:
                    status = "DEGRADED"
            except Exception as e:
                details[name] = f"ERROR: {str(e)}"
                status = "DEGRADED"
                
        if status == "DEGRADED":
            # If all core services are down, we might be FAILED. 
            # For now, just mark degraded if anything fails.
            pass
            
        return {
            "status": status,
            "details": details
        }
        
    def _check_postgres(self) -> bool:
        self.db.execute(text("SELECT 1"))
        return True
