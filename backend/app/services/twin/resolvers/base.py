from abc import ABC, abstractmethod
from typing import Dict, Any, List
from app.models.observation import Observation
from app.models.digital_twin import FactVersion

class ConflictResolver(ABC):
    @abstractmethod
    def resolve(self, key: str, observations: List[Observation], current_fact: FactVersion = None) -> Dict[str, Any]:
        """
        Takes a list of potentially conflicting observations for a specific key
        and returns the resolved value and evidence dict.
        """
        pass

class StringResolver(ConflictResolver):
    def resolve(self, key: str, observations: List[Observation], current_fact: FactVersion = None) -> Dict[str, Any]:
        # Simple resolution for MVP: Highest trust score wins
        # In reality, this would look at evidence, recency, and collector capabilities.
        
        best_obs = sorted(
            observations, 
            key=lambda o: o.evidence.get("confidence", 0.0), 
            reverse=True
        )[0]
        
        return {
            "value": best_obs.payload.get(key),
            "evidence": {
                "source": best_obs.collector_id,
                "confidence": best_obs.evidence.get("confidence", 0.0),
                "timestamp": best_obs.timestamp.isoformat(),
                "reason": "Highest confidence resolver"
            }
        }
