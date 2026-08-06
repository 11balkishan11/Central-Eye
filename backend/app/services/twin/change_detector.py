from sqlalchemy.orm import Session
from app.models.observation import Observation
from app.models.digital_twin import FactVersion

class ChangeDetector:
    """
    Compares a normalized observation against the Digital Twin's current state.
    Quickly drops observations that contain no new information.
    """
    def __init__(self, db: Session):
        self.db = db
        
    def has_changed(self, observation: Observation) -> bool:
        # MVP: Compare against the most recent FactVersion for this resource
        # In a real implementation, we'd slice this by specific fact groups.
        if not observation.resource_id:
            return True # Discovery observation
            
        current_fact = self.db.query(FactVersion).filter(
            FactVersion.resource_id == observation.resource_id,
            FactVersion.valid_to.is_(None)
        ).order_by(FactVersion.valid_from.desc()).first()
        
        if not current_fact:
            return True
            
        # Simplistic deep compare for MVP
        for k, v in observation.payload.items():
            if k not in current_fact.payload or current_fact.payload[k] != v:
                return True
                
        return False
